import { StripeAddressElement, StripeAuBankAccountElement, StripeCardCvcElement, StripeCardElement, StripeCardExpiryElement, StripeCardNumberElement, StripeContactDetailsElement, StripeElements, StripeExpressCheckoutElement, StripeIbanElement, StripeLinkAuthenticationElement, StripePaymentElement, StripePaymentMethodMessagingElement, StripePaymentRequestButtonElement, StripeShippingAddressElement, StripeTaxIdElement } from "@stripe/stripe-js";
import OrderBump from "./order-bump";
import HighLevelElement from "./high-level-element";

/**
 * Represents a HighLevel order form element.
 * Provides access to order bumps, [Stripe Elements](https://docs.stripe.com/payments/elements), and coupon submission.
 * 
 * @example
 * const form = hldocument.getElementsByType(OrderForm)[0];
 * form.submitCoupon('SAVE20');
 */
export default abstract class OrderForm extends HighLevelElement<HTMLDivElement, OrderFormEventMap> {
    /**
     * Programmatically submits a coupon code to the order form.
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
     * has been mounted. Use {@link getStripeElements} to wait for Stripe to be ready
     * before calling this method.
     * 
     * @param name - The Stripe element type to retrieve
     * @returns The matching Stripe element, or `undefined` if not found or Stripe is not yet ready
     * 
     * @example
     * await form.getStripeElements();
     * const paymentElement = form.getStripeElement('payment');
     */
    abstract getStripeElement<K extends keyof StripeElementTypeMap>(name: K): StripeElementTypeMap[K] | undefined;

    /**
     * Resolves the Stripe Elements instance associated with this order form.
     * Returns a Promise since Stripe JS may not be immediately available.
     * 
     * @returns A Promise that resolves to the {@link StripeElements} instance
     * 
     * @example
     * const elements = await form.getStripeElements();
     * elements.update({ appearance });
     */
    abstract getStripeElements(): Promise<StripeElements>;

    /**
     * The order bumps available within this order form.
     */
    abstract get orderBumps(): readonly OrderBump[];
}

/**
 * Event map for order form-specific events.
 */
export interface OrderFormEventMap extends HTMLElementEventMap {
    /** Fired before a coupon code is submitted. */
    'beforecouponsubmit': CustomEvent;
    /** Fired after a coupon code is submitted. */
    'aftercouponsubmit': CustomEvent;
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