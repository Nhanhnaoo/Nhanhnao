/// <reference types="astro/client" />

declare module "cloudflare:workers" {
  const env: {
    DB: D1Database;
    R2_BUCKET: R2Bucket;
    AI: any;
    GOOGLE_SERVICE_ACCOUNT_JWT: string;
    GOOGLE_DRIVE_FOLDER_ID: string;
  };
}