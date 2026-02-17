// Jest setup file
// Add global test configurations and mocks here

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
