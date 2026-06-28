import { StripeElement, StripeElements, StripeElementType } from "@stripe/stripe-js";
import { OrderBump } from "./order-bump";
import { HighLevelElement } from "./high-level-element";

/**
 * Represents a HighLevel order form element.
 * Provides access to order bumps, [Stripe Elements](https://docs.stripe.com/payments/elements), and coupon submission.
 * 
 * @example
 * ```typescript
 * const form = hldocument.getFirstElementByType(OrderForm);
 * form.submitCoupon('SAVE20');
 * ```
 * @public
 */
// TODO add order button getter
// TODO add coupon input getter
export abstract class OrderForm extends HighLevelElement<HTMLDivElement, OrderFormEventMap> {
    /**
     * Retrieves a mounted Stripe element by its type name.
     *
     * This method returns immediately without waiting for Stripe to load. Use
     * {@link OrderForm.hasStripeAvailable} to check whether Stripe is ready before calling this,
     * or use {@link OrderForm.getStripeElements} to wait for Stripe to load first.
     *
     * Returns `null` if Stripe JS has not yet loaded, no element of the given type has
     * been mounted, or the `StripeElements` container has been removed from the DOM.
     *
     * **Note:** The Stripe Elements container may be removed from the DOM at any time,
     * for example, after successful coupon submission or when HighLevel re-renders the
     * available payment methods. When this happens, this method will return `null` until
     * a new `StripeElements` instance has been mounted. Use {@link OrderForm.getStripeElements} to
     * wait for the new instance to become available.
     *
     * **Note:** Due to typing limitations with Stripe JS at the time of this library
     * version, the return type is always the general `StripeElement` union.
     * It is not narrowed to the specific element type for the `name` you pass in.
     * If you need the specific type (e.g. `StripePaymentElement` for `'payment'`),
     * you should narrow it yourself via a type assertion (as shown below) or a runtime 
     * type guard. TypeScript will not catch an incorrect assertion (e.g. casting the
     * result of `getStripeElement('card')` to `StripePaymentElement`) at compile time.
     *
     * @param name - The Stripe element type to retrieve
     * @returns The matching Stripe element, or `null` if not found, Stripe has not yet
     * loaded, or the `StripeElements` container has been removed from the DOM
     *
     * @example
     * ```typescript
     * // Collapse the payment element immediately if Stripe is already available
     * if (form.hasStripeAvailable()) {
     *     const paymentElement = form.getStripeElement('payment') as StripePaymentElement | null;
     *     paymentElement?.collapse();
     * }
     * ```
     */
    abstract getStripeElement<K extends StripeElementType>(name: K): StripeElement | null;

    /**
     * Returns a Promise that resolves to the `StripeElements` instance once
     * Stripe JS has loaded and been initialized by HighLevel.
     *
     * If Stripe JS has already loaded, the Promise resolves shortly after being called.
     *
     * **Note:** If Stripe is not configured as a payment integration on this order form,
     * the Promise never resolves.
     *
     * **Note:** The Stripe Elements container may be removed from the DOM at any time,
     * for example, during coupon submission or when HighLevel re-renders the available
     * payment methods. When this happens, the resolved `StripeElements` instance
     * is no longer valid. Call this method again to get the new instance once Stripe
     * re-mounts. Do not cache the resolved value across re-renders.
     *
     * @returns A Promise that resolves to the `StripeElements` instance, or that
     * never resolves if Stripe is not configured as a payment integration
     *
     * @example
     * ```typescript
     * const elements = await form.getStripeElements();
     * elements.update({ appearance });
     * ```
     *
     * @example
     * ```typescript
     * // Re-acquire after Stripe re-mounts following a coupon clear
     * form.addEventListener('couponclear', () => {
     *     form.getStripeElements().then(elements => {
     *         elements.update({ appearance });
     *     });
     * });
     * ```
     */
    abstract getStripeElements(): Promise<StripeElements>;

    /**
     * Whether Stripe JS has loaded and a `StripeElements` instance is
     * currently available on this order form.
     *
     * Use this as a synchronous check before calling {@link OrderForm.getStripeElement} when you
     * need an immediate result and do not want to wait for a Promise. Returns `false` if
     * Stripe is not configured as a payment integration, has not yet finished loading, or
     * if the `StripeElements` container has been removed from the DOM and not yet re-mounted.
     *
     * @returns `true` if Stripe has loaded and a `StripeElements` instance is
     * available, `false` otherwise
     *
     * @example
     * ```typescript
     * if (form.hasStripeAvailable()) {
     *     form.getStripeElement('payment')?.collapse();
     * }
     * ```
     */
    abstract hasStripeAvailable(): boolean;

    /**
     * The order bumps available within this order form.
     * Iterate over this to access or interact with each bump individually.
     *
     * @returns An iterable of {@link OrderBump} instances belonging to this form
     *
     * @example
     * ```typescript
     * for (const bump of form.orderBumps) {
     *     bump.select();
     * }
     * ```
     */
    abstract get orderBumps(): Iterable<OrderBump>;

    /**
     * Programmatically submits a coupon code to the order form.
     *
     * Fires all coupon-related events from {@link OrderFormEventMap} on this element.
     * 
     * @param code - The coupon code to apply
     * @returns `true` if the coupon was submitted successfully, `false` if the coupon
     * is currently being submitted, the input element is unavailable, or coupon codes
     * are not enabled for this order form
     * 
     * @example
     * ```typescript
     * // Apply a coupon code to the order form
     * const success = form.submitCoupon('SAVE20');
     * ```
     */
    abstract submitCoupon(code: string): boolean;

    /**
     * The coupon apply button, if coupon codes are enabled for this order form.
     *
     * @returns The coupon apply button element, or `null` if coupon codes are not
     * enabled for this order form
     *
     * @example
     * ```typescript
     * if (form.hasCouponsEnabled()) {
     *     form.couponButton.disabled = true;
     * }
     * ```
     */
    abstract get couponButton(): HTMLButtonElement | null;

    /**
     * Whether coupon codes are enabled for this order form.
     *
     * When this returns `true`, {@link OrderForm.couponButton} is guaranteed to be non-null
     * within the same block, allowing direct access without a null check.
     *
     * @returns `true` if coupon codes are enabled, `false` otherwise
     *
     * @example
     * ```typescript
     * // Submit a coupon and disable the button while it processes
     * if (form.hasCouponsEnabled()) {
     *     form.submitCoupon('SAVE20');
     *     form.couponButton.disabled = true;
     * }
     * ```
     */
    abstract hasCouponsEnabled(): this is OrderForm & { couponButton: HTMLButtonElement };

    /**
     * Whether a coupon code is currently applied to this order form.
     *
     * @returns `true` if a coupon has been successfully applied and not yet cleared,
     * `false` otherwise
     *
     * @example
     * ```typescript
     * // Check if a coupon is active before attempting to submit another
     * if (!form.hasCouponApplied()) {
     *     form.submitCoupon('SAVE20AGAIN');
     * }
     * ```
     */
    abstract hasCouponApplied(): boolean;
}

/**
 * Details included in coupon-related events fired on {@link OrderForm}.
 *
 * @see {@link OrderFormEventMap}
 * @public
 */
export interface CouponUsageDetails {
    /** The coupon code that was submitted. */
    coupon: string;
}

/**
 * Event map for order form-specific events.
 * @public
 */
export interface OrderFormEventMap {
    /** Fired when a coupon code is submitted. */
    'couponsubmit': CustomEvent<CouponUsageDetails>;
    /** Fired after a coupon submission has concluded, regardless of whether it succeeded or failed. */
    'couponprocessed': CustomEvent<CouponUsageDetails>;
    /** Fired when a coupon code is successfully applied. */
    'couponsuccess': CustomEvent<CouponUsageDetails>;
    /** Fired when there's an error with applying a coupon code. */
    'couponerror': CustomEvent<CouponUsageDetails>;
    /** Fired when an applied coupon code is cleared from the order form. */
    'couponclear': CustomEvent<CouponUsageDetails>;
}