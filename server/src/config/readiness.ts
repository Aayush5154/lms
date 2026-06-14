// Shared server readiness state — avoids circular imports between app.ts and routes
let _dbReady = false;

export function setDbReady(ready: boolean): void {
  _dbReady = ready;
}

export function isDbReady(): boolean {
  return _dbReady;
}
