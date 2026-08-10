const UUID_PATTERN = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

export function isValidMemoId(value: string) {
  return UUID_PATTERN.test(value);
}
