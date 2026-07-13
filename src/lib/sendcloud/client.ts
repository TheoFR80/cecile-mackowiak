const SENDCLOUD_API_BASE = "https://panel.sendcloud.sc/api/v3";

export class SendcloudApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "SendcloudApiError";
  }
}

export function isSendcloudConfigured(): boolean {
  return Boolean(
    process.env.SENDCLOUD_PUBLIC_KEY && process.env.SENDCLOUD_SECRET_KEY
  );
}

function getAuthHeader(): string {
  const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
  const secretKey = process.env.SENDCLOUD_SECRET_KEY;
  if (!publicKey || !secretKey) {
    throw new Error("Sendcloud credentials missing");
  }
  const token = Buffer.from(`${publicKey}:${secretKey}`).toString("base64");
  return `Basic ${token}`;
}

export async function sendcloudRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${SENDCLOUD_API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: getAuthHeader(),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const detail =
      typeof payload === "object" &&
      payload !== null &&
      "errors" in payload &&
      Array.isArray((payload as { errors: unknown[] }).errors)
        ? (payload as { errors: { detail?: string }[] }).errors[0]?.detail
        : undefined;
    throw new SendcloudApiError(
      detail ?? `Sendcloud API error (${response.status})`,
      response.status,
      payload
    );
  }

  return payload as T;
}
