import '@testing-library/jest-dom';

// Mock IntersectionObserver
const mockIntersectionObserver = class {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
  }
  observe(target) {
    // Simulate the element being in the viewport
    this.callback([{ isIntersecting: true, target }]);
  }
  unobserve(target) {}
  disconnect() {}
};

global.IntersectionObserver = mockIntersectionObserver;
