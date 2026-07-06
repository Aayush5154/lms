let _dbReady = false;

export function setDbReady(ready) {
  _dbReady = ready;
}

export function isDbReady() {
  return _dbReady;
}
