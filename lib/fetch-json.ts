import { retryAsync } from "@/lib/retry";

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  return retryAsync(
    async () => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 10_000);

      try {
        const response = await fetch(input, {
          ...init,
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const message =
            typeof data?.error === "string"
              ? data.error
              : "请求失败，请稍后重试";
          throw new HttpError(message, response.status);
        }

        return data as T;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          throw new TypeError("请求超时，请检查网络后重试");
        }
        throw error;
      } finally {
        window.clearTimeout(timeoutId);
      }
    },
    {
      attempts: 2,
      delayMs: 400,
      shouldRetry: (error) =>
        error instanceof TypeError ||
        (error instanceof HttpError && [502, 503, 504].includes(error.status)),
    },
  );
}
