// src/global.d.ts
interface Window {
  ErrorNotificationContext?: {
    showError: (message: string) => void;
  };
  global: Window;
}
