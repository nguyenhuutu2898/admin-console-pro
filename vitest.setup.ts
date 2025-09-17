import '@testing-library/jest-dom/vitest';

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// @ts-expect-error - provide minimal ResizeObserver for Radix UI components.
if (typeof globalThis.ResizeObserver === 'undefined') {
  // @ts-expect-error - assign to global scope for tests.
  globalThis.ResizeObserver = ResizeObserver;
}
