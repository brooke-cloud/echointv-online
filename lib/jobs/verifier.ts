// lib/jobs/verifier.ts

export type JobUrlStatus =
  | 'ACTIVE'
  | 'DEAD'
  | 'BLOCKED'
  | 'TIMEOUT'
  | 'ERROR'
  | 'UNKNOWN';

export interface JobUrlVerification {
  url: string;
  status: JobUrlStatus;
  httpStatus?: number;
  checkedAt: Date;
  durationMs: number;
  error?: string;
}

const USER_AGENT =
  'Mozilla/5.0 (compatible; EchoInterview-JobRadar/3.0; +https://echointv.online/)';

function classifyHttpStatus(status: number): JobUrlStatus {
  if (status >= 200 && status < 400) {
    return 'ACTIVE';
  }

  if (status === 401 || status === 403 || status === 429) {
    return 'BLOCKED';
  }

  if (status === 404 || status === 410) {
    return 'DEAD';
  }

  if (status >= 500 && status <= 599) {
    return 'ERROR';
  }

  return 'UNKNOWN';
}

async function request(
  url: string,
  method: 'HEAD' | 'GET',
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(url, {
      method,
      redirect: 'follow',
      headers: {
        'User-Agent': USER_AGENT,
        Accept:
          'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
      cache: 'no-store',
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function verifyJobUrl(
  url: string,
  timeoutMs = 6000
): Promise<JobUrlVerification> {
  const startedAt = Date.now();
  const checkedAt = new Date();

  if (!url || !/^https?:\/\//i.test(url)) {
    return {
      url,
      status: 'UNKNOWN',
      checkedAt,
      durationMs: Date.now() - startedAt,
      error: 'Invalid URL',
    };
  }

  try {
    let response: Response;

    try {
      response = await request(url, 'HEAD', timeoutMs);
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        return {
          url,
          status: 'TIMEOUT',
          checkedAt,
          durationMs: Date.now() - startedAt,
          error: 'HEAD request timeout',
        };
      }

      response = await request(url, 'GET', timeoutMs);
    }

    // 某些官网禁止 HEAD，GET 再检测一次
    if (
      response.status === 405 ||
      response.status === 501
    ) {
      response = await request(url, 'GET', timeoutMs);
    }

    const status = classifyHttpStatus(response.status);

    return {
      url,
      status,
      httpStatus: response.status,
      checkedAt,
      durationMs: Date.now() - startedAt,
    };
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return {
        url,
        status: 'TIMEOUT',
        checkedAt,
        durationMs: Date.now() - startedAt,
        error: 'Request timeout',
      };
    }

    return {
      url,
      status: 'ERROR',
      checkedAt,
      durationMs: Date.now() - startedAt,
      error: error?.message || 'URL verification failed',
    };
  }
}

export interface BatchVerificationResult {
  total: number;
  active: number;
  dead: number;
  blocked: number;
  timeout: number;
  error: number;
  unknown: number;
  results: JobUrlVerification[];
}

export async function verifyJobUrls(
  urls: string[],
  concurrency = 8
): Promise<BatchVerificationResult> {
  const uniqueUrls = Array.from(
    new Set(urls.filter(Boolean))
  );

  const results: JobUrlVerification[] = [];
  let cursor = 0;

  async function worker() {
    while (true) {
      const index = cursor++;

      if (index >= uniqueUrls.length) {
        return;
      }

      const result = await verifyJobUrl(uniqueUrls[index]);
      results.push(result);
    }
  }

  const workerCount = Math.min(concurrency, uniqueUrls.length);

  await Promise.all(
    Array.from({ length: workerCount }, () => worker())
  );

  return {
    total: results.length,
    active: results.filter((r) => r.status === 'ACTIVE').length,
    dead: results.filter((r) => r.status === 'DEAD').length,
    blocked: results.filter((r) => r.status === 'BLOCKED').length,
    timeout: results.filter((r) => r.status === 'TIMEOUT').length,
    error: results.filter((r) => r.status === 'ERROR').length,
    unknown: results.filter((r) => r.status === 'UNKNOWN').length,
    results,
  };
}