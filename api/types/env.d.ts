/// <reference types="vite/client" />

interface ImportMetaEnv {
  APP_CLEENG_ALLOWED_PUBLISHERS: string;
  APP_JW_API_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
