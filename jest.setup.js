import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock authentication context
jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: null,
    token: 'mock-token',
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}))

// Setup for environment variables in tests
process.env.JWT_SECRET = 'test-secret'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
