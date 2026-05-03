import { vi } from 'vitest'

function rafPolyfill(cb: FrameRequestCallback): number {
  return setTimeout(() => cb(Date.now()), 16) as unknown as number
}

function cafPolyfill(id: number): void {
  clearTimeout(id)
}

if (!globalThis.requestAnimationFrame) {
  Object.defineProperty(globalThis, 'requestAnimationFrame', {
    value: rafPolyfill,
    writable: true,
    configurable: true
  })
}

if (!globalThis.cancelAnimationFrame) {
  Object.defineProperty(globalThis, 'cancelAnimationFrame', {
    value: cafPolyfill,
    writable: true,
    configurable: true
  })
}

if (typeof window !== 'undefined') {
  if (!window.requestAnimationFrame) window.requestAnimationFrame = rafPolyfill
  if (!window.cancelAnimationFrame) window.cancelAnimationFrame = cafPolyfill
}

vi.mock('gsap/ScrollTrigger', () => {
  const stub = {
    create: vi.fn(() => ({ kill: vi.fn() })),
    refresh: vi.fn(),
    update: vi.fn(),
    scrollerProxy: vi.fn(),
    killAll: vi.fn(),
    getAll: vi.fn(() => [])
  }
  return { ScrollTrigger: stub, default: stub }
})
