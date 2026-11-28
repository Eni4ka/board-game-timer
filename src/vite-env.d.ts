/// <reference types="vite/client" />
declare module 'virtual:pwa-register' {
    export type RegisterSWOptions = {
        immediate?: boolean;
        onNeedRefresh?: () => void;
        onOfflineReady?: () => void;
    };

    export function registerSW(options?: RegisterSWOptions): void;
}
declare const __BUILD_INFO__: { env: string; version: string; date: string };
