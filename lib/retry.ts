export type RetryOptions = {
  attempts?: number;
  delayMs?: number;
  shouldRetry?: (error: unknown) => boolean;
};

const wait = (delayMs: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, delayMs));

export async function retryAsync<T>(
  operation: () => Promise<T>,
  {
    attempts = 2,
    delayMs = 250,
    shouldRetry = () => true,
  }: RetryOptions = {},
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === attempts || !shouldRetry(error)) {
        throw error;
      }
      await wait(delayMs * attempt);
    }
  }

  throw lastError;
}
