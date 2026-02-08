/// <reference types="vite/client" />

declare const __APP_VERSION__: string

interface Window {
  electronAPI: {
    connect: (url: string) => Promise<{ success: boolean; url: string }>
    getConfig: () => Promise<{ defaultUrl: string; theme: string }>
    openExternal: (url: string) => Promise<void>
    trustHost: (hostname: string) => Promise<{ trusted: boolean; hostname: string }>
    saveToken: (token: string) => Promise<{ saved: boolean }>
    getToken: () => Promise<string>
    isEncryptionAvailable: () => Promise<boolean>
    showNotification: (title: string, body: string) => Promise<void>
    platform: NodeJS.Platform
  }
}
