import '@testing-library/jest-dom/vitest';

// Polyfill ResizeObserver for Recharts in jsdom
(globalThis as any).ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
