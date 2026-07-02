/**
 * Base error class for all errors thrown by `@mdcline/ghl-elements`.
 *
 * Allows consumers to distinguish errors originating from this library
 * from their own application errors or other dependencies, via
 * `instanceof GHLElementsError`, without relying on parsing error
 * message text.
 *
 * @example
 * ```typescript
 * try {
 *     form.getStripeElement('payment');
 * } catch (error) {
 *     if (error instanceof GHLElementsError) {
 *         // Came from ghl-elements specifically.
 *     } else {
 *         throw error;
 *     }
 * }
 * ```
 * @public
 * @since 1.0.0
 */
export class GHLElementsError extends Error {
    /**
     * @param message - The error message
     * @since 1.0.0
     */
    public constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, GHLElementsError.prototype);
    }
}