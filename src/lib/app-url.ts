export function getAppBaseUrl(): string {
  const raw =
    (typeof process !== "undefined" &&
      process.env &&
      (process.env.AUTH_URL ||
        process.env.NEXTAUTH_URL ||
        process.env.NEXT_PUBLIC_APP_URL)) ||
    "https://www.calcettoxp.com";
  return raw.replace(/\/$/, "");
}
