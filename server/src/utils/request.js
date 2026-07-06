export function parsePagination(query, defaults = { page: 1, limit: 50, maxLimit: 100 }) {
  const page = Math.max(1, Number.parseInt(query.page ?? String(defaults.page), 10) || defaults.page);
  const limit = Math.min(defaults.maxLimit, Math.max(1, Number.parseInt(query.limit ?? String(defaults.limit), 10) || defaults.limit));
  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function trimString(value) {
  return typeof value === "string" ? value.trim() : undefined;
}

export function toPositiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

export function toPositiveInteger(value) {
  const number = Number.parseInt(String(value), 10);
  return Number.isInteger(number) && number > 0 ? number : undefined;
}
