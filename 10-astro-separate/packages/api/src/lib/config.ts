function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const config = {
  databaseUrl: () => required("DATABASE_URL"),
  sessionSecret: () => required("SESSION_SECRET", "dev-insecure-change-me"),
  memberCookie: () => process.env.MEMBER_SESSION_COOKIE_NAME ?? "platform_member_session",
  adminCookie: () => process.env.ADMIN_SESSION_COOKIE_NAME ?? "platform_admin_session",
  publicSiteUrl: () => process.env.PUBLIC_SITE_URL ?? "http://localhost:4321",
  publicAdminUrl: () => process.env.PUBLIC_ADMIN_URL ?? "http://localhost:5173",
  publicApiUrl: () => process.env.PUBLIC_API_URL ?? "http://localhost:3001",
  stripeSecretKey: () => process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: () => process.env.STRIPE_WEBHOOK_SECRET ?? "",
  resendApiKey: () => process.env.RESEND_API_KEY ?? "",
  resendFrom: () => process.env.RESEND_FROM_EMAIL ?? "noreply@example.com",
  s3Bucket: () => process.env.S3_BUCKET ?? "",
  s3Region: () => process.env.S3_REGION ?? "us-east-1",
  s3Endpoint: () => process.env.S3_ENDPOINT ?? "",
  s3AccessKey: () => process.env.S3_ACCESS_KEY_ID ?? "",
  s3SecretKey: () => process.env.S3_SECRET_ACCESS_KEY ?? "",
  s3PublicBaseUrl: () => process.env.S3_PUBLIC_BASE_URL ?? "",
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd: process.env.NODE_ENV === "production",
};
