/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_API_KEY?: string;
  readonly VITE_IMAGE_SERVICE_URL?: string;
  readonly VITE_IMAGE_SERVICE_KEY?: string;
  readonly VITE_ANALYTICS_ID?: string;
  readonly VITE_ANALYTICS_ENABLED?: string;
  readonly VITE_ANALYTICS_ENDPOINT?: string;
  readonly VITE_DEV_MODE?: string;
  readonly VITE_LOG_LEVEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  function gtag(...args: any[]): void;
  
  namespace Vi {
    interface AsymmetricMatchersContaining {
      any(): any;
    }
  }
}