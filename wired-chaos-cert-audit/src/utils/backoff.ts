export type BackoffOptions = {
  tries: number;
  baseMs: number;
  factor: number;
};

export async function backoff<T>(fn: () => Promise<T>, opts: BackoffOptions): Promise<T> {
  let delay = opts.baseMs;
  for (let attempt = 0; attempt < opts.tries - 1; attempt++) {
    try {
      return await fn();
    } catch (err) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= opts.factor;
    }
  }
  return fn();
}
