import { vi } from "vitest"

// Note: @testing-library/react with Vitest handles cleanup automatically
// when globals: true is set in vitest.config.ts. No manual cleanup needed.

// Mock environment variables for tests
vi.stubEnv("SESSION_SECRET", "test-secret-that-is-at-least-32-chars-long")
vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")
