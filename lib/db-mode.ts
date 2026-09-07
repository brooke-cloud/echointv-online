export function isDatabaseDisabled(): boolean {
  return process.env.SKIP_DATABASE === 'true';
}