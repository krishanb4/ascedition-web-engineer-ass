import '@testing-library/jest-dom'

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeInTheDocument(): R
            toHaveClass(className: string): R
            toHaveAttribute(attr: string, value?: string): R
            toBeVisible(): R
            toBeDisabled(): R
            toHaveValue(value: string | number): R
        }
    }
}

// Global variables for API route tests
declare global {
    var secureWordStore: Map<string, any>
    var mfaStore: Map<string, any>
    var rateLimitStore: Map<string, any>
}