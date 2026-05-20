import { StripeAddressElement, StripeAuBankAccountElement, StripeCardCvcElement, StripeCardElement, StripeCardExpiryElement, StripeCardNumberElement, StripeContactDetailsElement, StripeElements, StripeExpressCheckoutElement, StripeIbanElement, StripeLinkAuthenticationElement, StripePaymentElement, StripePaymentMethodMessagingElement, StripePaymentRequestButtonElement, StripeShippingAddressElement, StripeTaxIdElement } from "@stripe/stripe-js";
import OrderBump from "./order-bump";
import HighLevelElement from "./high-level-element";

/**
 * Represents a HighLevel order form element.
 * Provides access to order bumps, [Stripe Elements](https://docs.stripe.com/payments/elements), and coupon submission.
 * 
 * @example
 * const form = hldocument.getFirstElementByType(OrderForm);
 * form.submitCoupon('SAVE20');
 */
export default abstract class OrderForm extends HighLevelElement<HTMLDivElement, OrderFormEventMap> {
    /**
     * Programmatically submits a coupon code to the order form.
     * Fires all events from {@link OrderFormEventMap} on this element and `hldocument`.
     * 
     * @param code - The coupon code to apply
     * @returns `true` if the coupon was submitted successfully, `false` if either the coupon
     * is currently being submitted or the input element is unavailable
     * 
     * @example
     * const success = form.submitCoupon('SAVE20');
     */
    abstract submitCoupon(code: string): boolean;

    /**
     * Retrieves a mounted Stripe element by its type name.
     *
     * Returns `undefined` if the {@link StripeElements} instance has not yet resolved
     * (i.e. Stripe JS has not finished loading) or if no element of the given type
     * has been mounted. This method is only applicable when Stripe is configured as
     * the payment integration in HighLevel. Use {@link getStripeElements} to wait for
     * Stripe JS to be ready before calling this method.
     *
     * **Note:** The Stripe Elements container may be removed from the DOM at any time, for
     * example, during coupon submission or when HighLevel re-renders the available payment methods. When
     * this happens, the current {@link StripeElements} instance is invalidated and this method
     * will return `undefined` until a new {@link StripeElements} instance is mounted and
     * resolved. Use {@link getStripeElements} to await the new instance becoming available again.
     *
     * @param name - The Stripe element type to retrieve
     * @returns The matching Stripe element, or `undefined` if not found, Stripe is not yet ready,
     * or the Stripe Elements container has been removed from the DOM
     *
     * @example
     * await form.getStripeElements();
     * const paymentElement = form.getStripeElement('payment');
     *
     * @example
     * // Re-acquire after Stripe re-mounts following a coupon reset
     * form.addEventListener('couponreset', () => {
     *     form.getStripeElements().then(() => {
     *         const paymentElement = form.getStripeElement('payment');
     *     });
     * });
     */
    abstract getStripeElement<K extends keyof StripeElementTypeMap>(name: K): StripeElementTypeMap[K] | undefined;

    /**
     * Returns a Promise that resolves to the {@link StripeElements} instance associated
     * with this order form once Stripe JS has loaded and been initialized by HighLevel.
     *
     * If Stripe JS has already loaded by the time this is called, the Promise resolves
     * on the next microtask tick. Use {@link getStripeElement} to synchronously access
     * a specific mounted element once the Promise has resolved.
     *
     * **Note:** If Stripe is not configured as a payment integration, the Promise will be
     * rejected with an error after 10 seconds. Additional time is allowed to account for
     * slow connections. Always handle the rejection to avoid unhandled Promise errors
     * in non-Stripe funnels.
     *
     * **Note:** The Stripe Elements container may be removed from the DOM at any time, for
     * example, during coupon submission or when HighLevel re-renders the available payment methods. When
     * this happens, the current {@link StripeElements} instance is invalidated and the Promise
     * returned by subsequent calls to this method will not resolve until Stripe re-mounts and
     * a new instance becomes available. Always call this method again after a known re-render
     * rather than caching the resolved value.
     *
     * @returns A Promise that resolves to the {@link StripeElements} instance, or rejects
     * with an error if Stripe JS fails to load within 10 seconds
     *
     * @example
     * try {
     *     const elements = await form.getStripeElements();
     *     elements.update({ appearance });
     * } catch (e) {
     *     console.warn(e.message);
     * }
     *
     * @example
     * // Access a specific element after Stripe has loaded
     * await form.getStripeElements();
     * const paymentElement = form.getStripeElement('payment');
     *
     * @example
     * // Re-acquire after Stripe re-mounts following a coupon reset
     * form.addEventListener('couponreset', () => {
     *     form.getStripeElements().then(elements => {
     *         elements.update({ appearance });
     *     });
     * });
     */
    abstract getStripeElements(): Promise<StripeElements>;

    /**
     * The order bumps available within this order form.
     */
    abstract get orderBumps(): Iterable<OrderBump>;
}

/**
 * Event map for order form-specific events.
 */
export interface OrderFormEventMap extends HTMLElementEventMap {
    /** Fired before a coupon code is submitted. */
    'beforecouponsubmit': CustomEvent;
    /** Fired after a coupon code is submitted. */
    'aftercouponsubmit': CustomEvent;
    /** Fired when a coupon code is successfully applied. */
    'couponsuccess': CustomEvent;
    /** Fired when a coupon code is invalid. */
    'couponerror': CustomEvent;
    /** Fired when a coupon code is reset. */
    'couponreset': CustomEvent;
}

/**
 * Maps Stripe element type names to their corresponding element interfaces.
 * Used to provide type-safe access to mounted Stripe elements via {@link OrderForm.getStripeElement}.
 * 
 * @see {@link https://docs.stripe.com/js/elements_object/get_element | Stripe getElement docs}
 */
export type StripeElementTypeMap = {
    'address': StripeAddressElement;
    'auBankAccount': StripeAuBankAccountElement;
    'card': StripeCardElement;
    'cardNumber': StripeCardNumberElement;
    'cardExpiry': StripeCardExpiryElement;
    'cardCvc': StripeCardCvcElement;
    'iban': StripeIbanElement;
    'contactDetails': StripeContactDetailsElement;
    'expressCheckout': StripeExpressCheckoutElement;
    'payment': StripePaymentElement;
    'paymentMethodMessaging': StripePaymentMethodMessagingElement;
    'paymentRequestButton': StripePaymentRequestButtonElement;
    'linkAuthentication': StripeLinkAuthenticationElement;
    'shippingAddress': StripeShippingAddressElement;
    'taxId': StripeTaxIdElement;
}