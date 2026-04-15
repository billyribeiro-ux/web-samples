/** Express 5 types `req.params` values as `string | string[]` — normalize to a single string. */
export function paramStr(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}
