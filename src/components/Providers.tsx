"use client";

import React from 'react';

// Polyfill crypto.randomUUID for insecure HTTP environments (e.g. non-HTTPS, non-localhost custom IP deployments)
if (typeof window !== "undefined") {
  if (!window.crypto) {
    (window as any).crypto = {} as any;
  }
  if (!window.crypto.randomUUID) {
    window.crypto.randomUUID = function () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }) as any;
    };
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
