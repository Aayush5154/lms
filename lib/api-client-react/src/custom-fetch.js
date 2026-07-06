const NO_BODY_STATUS = /* @__PURE__ */ new Set([204, 205, 304]);
const DEFAULT_JSON_ACCEPT = "application/json, application/problem+json";
let _baseUrl = null;
let _authTokenGetter = null;
function setBaseUrl(url) {
  _baseUrl = url ? url.replace(/\/+$/, "") : null;
}
function setAuthTokenGetter(getter) {
  _authTokenGetter = getter;
}
function isRequest(input) {
  return typeof Request !== "undefined" && input instanceof Request;
}
function resolveMethod(input, explicitMethod) {
  if (explicitMethod) return explicitMethod.toUpperCase();
  if (isRequest(input)) return input.method.toUpperCase();
  return "GET";
}
function isUrl(input) {
  return typeof URL !== "undefined" && input instanceof URL;
}
function applyBaseUrl(input) {
  if (!_baseUrl) return input;
  const url = resolveUrl(input);
  if (!url.startsWith("/")) return input;
  const absolute = `${_baseUrl}${url}`;
  if (typeof input === "string") return absolute;
  if (isUrl(input)) return new URL(absolute);
  return new Request(absolute, input);
}
function resolveUrl(input) {
  if (typeof input === "string") return input;
  if (isUrl(input)) return input.toString();
  return input.url;
}
function mergeHeaders(...sources) {
  const headers = new Headers();
  for (const source of sources) {
    if (!source) continue;
    new Headers(source).forEach((value, key) => {
      headers.set(key, value);
    });
  }
  return headers;
}
function getMediaType(headers) {
  const value = headers.get("content-type");
  return value ? value.split(";", 1)[0].trim().toLowerCase() : null;
}
function isJsonMediaType(mediaType) {
  return mediaType === "application/json" || Boolean(mediaType?.endsWith("+json"));
}
function isTextMediaType(mediaType) {
  return Boolean(
    mediaType && (mediaType.startsWith("text/") || mediaType === "application/xml" || mediaType === "text/xml" || mediaType.endsWith("+xml") || mediaType === "application/x-www-form-urlencoded")
  );
}
function hasNoBody(response, method) {
  if (method === "HEAD") return true;
  if (NO_BODY_STATUS.has(response.status)) return true;
  if (response.headers.get("content-length") === "0") return true;
  if (response.body === null) return true;
  return false;
}
function stripBom(text) {
  return text.charCodeAt(0) === 65279 ? text.slice(1) : text;
}
function looksLikeJson(text) {
  const trimmed = text.trimStart();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}
function getStringField(value, key) {
  if (!value || typeof value !== "object") return void 0;
  const candidate = value[key];
  if (typeof candidate !== "string") return void 0;
  const trimmed = candidate.trim();
  return trimmed === "" ? void 0 : trimmed;
}
function truncate(text, maxLength = 300) {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}\u2026` : text;
}
function buildErrorMessage(response, data) {
  const prefix = `HTTP ${response.status} ${response.statusText}`;
  if (typeof data === "string") {
    const text = data.trim();
    return text ? `${prefix}: ${truncate(text)}` : prefix;
  }
  const title = getStringField(data, "title");
  const detail = getStringField(data, "detail");
  const message = getStringField(data, "message") ?? getStringField(data, "error_description") ?? getStringField(data, "error");
  if (title && detail) return `${prefix}: ${title} \u2014 ${detail}`;
  if (detail) return `${prefix}: ${detail}`;
  if (message) return `${prefix}: ${message}`;
  if (title) return `${prefix}: ${title}`;
  return prefix;
}
class ApiError extends Error {
  name = "ApiError";
  status;
  statusText;
  data;
  headers;
  response;
  method;
  url;
  constructor(response, data, requestInfo) {
    super(buildErrorMessage(response, data));
    Object.setPrototypeOf(this, new.target.prototype);
    this.status = response.status;
    this.statusText = response.statusText;
    this.data = data;
    this.headers = response.headers;
    this.response = response;
    this.method = requestInfo.method;
    this.url = response.url || requestInfo.url;
  }
}
class ResponseParseError extends Error {
  name = "ResponseParseError";
  status;
  statusText;
  headers;
  response;
  method;
  url;
  rawBody;
  cause;
  constructor(response, rawBody, cause, requestInfo) {
    super(
      `Failed to parse response from ${requestInfo.method} ${response.url || requestInfo.url} (${response.status} ${response.statusText}) as JSON`
    );
    Object.setPrototypeOf(this, new.target.prototype);
    this.status = response.status;
    this.statusText = response.statusText;
    this.headers = response.headers;
    this.response = response;
    this.method = requestInfo.method;
    this.url = response.url || requestInfo.url;
    this.rawBody = rawBody;
    this.cause = cause;
  }
}
async function parseJsonBody(response, requestInfo) {
  const raw = await response.text();
  const normalized = stripBom(raw);
  if (normalized.trim() === "") {
    return null;
  }
  try {
    return JSON.parse(normalized);
  } catch (cause) {
    throw new ResponseParseError(response, raw, cause, requestInfo);
  }
}
async function parseErrorBody(response, method) {
  if (hasNoBody(response, method)) {
    return null;
  }
  const mediaType = getMediaType(response.headers);
  if (mediaType && !isJsonMediaType(mediaType) && !isTextMediaType(mediaType)) {
    return typeof response.blob === "function" ? response.blob() : response.text();
  }
  const raw = await response.text();
  const normalized = stripBom(raw);
  const trimmed = normalized.trim();
  if (trimmed === "") {
    return null;
  }
  if (isJsonMediaType(mediaType) || looksLikeJson(normalized)) {
    try {
      return JSON.parse(normalized);
    } catch {
      return raw;
    }
  }
  return raw;
}
function inferResponseType(response) {
  const mediaType = getMediaType(response.headers);
  if (isJsonMediaType(mediaType)) return "json";
  if (isTextMediaType(mediaType) || mediaType == null) return "text";
  return "blob";
}
async function parseSuccessBody(response, responseType, requestInfo) {
  if (hasNoBody(response, requestInfo.method)) {
    return null;
  }
  const effectiveType = responseType === "auto" ? inferResponseType(response) : responseType;
  switch (effectiveType) {
    case "json":
      return parseJsonBody(response, requestInfo);
    case "text": {
      const text = await response.text();
      return text === "" ? null : text;
    }
    case "blob":
      if (typeof response.blob !== "function") {
        throw new TypeError(
          'Blob responses are not supported in this runtime. Use responseType "json" or "text" instead.'
        );
      }
      return response.blob();
  }
}
async function customFetch(input, options = {}) {
  input = applyBaseUrl(input);
  const { responseType = "auto", headers: headersInit, ...init } = options;
  const method = resolveMethod(input, init.method);
  if (init.body != null && (method === "GET" || method === "HEAD")) {
    throw new TypeError(`customFetch: ${method} requests cannot have a body.`);
  }
  const headers = mergeHeaders(isRequest(input) ? input.headers : void 0, headersInit);
  if (typeof init.body === "string" && !headers.has("content-type") && looksLikeJson(init.body)) {
    headers.set("content-type", "application/json");
  }
  if (responseType === "json" && !headers.has("accept")) {
    headers.set("accept", DEFAULT_JSON_ACCEPT);
  }
  if (_authTokenGetter && !headers.has("authorization")) {
    const token = await _authTokenGetter();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
  }
  const requestInfo = { method, url: resolveUrl(input) };
  const response = await fetch(input, { ...init, method, headers });
  if (!response.ok) {
    const errorData = await parseErrorBody(response, method);
    throw new ApiError(response, errorData, requestInfo);
  }
  return await parseSuccessBody(response, responseType, requestInfo);
}
export {
  ApiError,
  ResponseParseError,
  customFetch,
  setAuthTokenGetter,
  setBaseUrl
};
