import '@testing-library/jest-dom/vitest'

// jsdom's requestAnimationFrame timestamp isn't reliably in sync with performance.now(),
// which breaks time-based animations (e.g. the CountUp stat) that compute elapsed time as
// `rafTimestamp - performance.now()-at-mount`. Force each animation to complete in one tick.
window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now() + 10000), 0)

// jsdom doesn't implement IntersectionObserver; framer-motion's viewport features and the
// CountUp stat animation use it. Fire the callback as already-intersecting so in-view
// content (KPI numbers, reveal animations) renders its settled state immediately in tests.
if (!window.IntersectionObserver) {
  window.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback
    }
    observe(target) {
      this.callback([{ isIntersecting: true, target }], this)
    }
    unobserve() {}
    disconnect() {}
  }
}

// jsdom doesn't implement matchMedia; ThemeProvider reads it to seed dark-mode state.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}
