import ElementCreationObserver from './dom/element-creation-observer';
import ElementUpdateObserver from './dom/element-update-observer';
import OrderBump from '../elements/order-bump';
import { StripeElements } from '@stripe/stripe-js';
import OrderForm, { OrderFormEventMap, StripeElementTypeMap } from '../elements/order-form';
import OrderBumpImpl from './order-bump-impl';
import HighLevelElementImpl from './high-level-element-impl';
import HighLevelDocumentImpl from './high-level-document-impl';

export default class OrderFormImpl extends HighLevelElementImpl<HTMLDivElement, OrderFormEventMap> implements OrderForm {
    public static readonly SELECTOR: string = '.c-order';

    private static readonly ORDER_BUMP_SELECTOR: string = '.order-bump-container';
    private static readonly COUPON_BTN_SELECTOR: string = 'button.apply-coupon-btn';
    private static readonly COUPON_INPUT_SELECTOR: string = 'input[name="coupon_code"]';
    private static readonly COUPON_APPLIED_TEXT_SELECTOR: string = '.coupon-applied-text';

    private static readonly PAYMENT_INTEGRATION_TIMEOUT: number = 10_000;
    private static readonly PAYMENT_INTEGRATION_TIMEOUT_SECONDS: number = OrderFormImpl.PAYMENT_INTEGRATION_TIMEOUT / 1000;

    private stripeElementsPromise: Promise<StripeElements> = new Promise((resolve, reject) => {
        this.resolvePromisedStripeElements = resolve;
        this.rejectPromisedStripeElements = reject;
    });

    private resolvePromisedStripeElements!: (elements: StripeElements) => void;
    private rejectPromisedStripeElements!: (reason?: Error) => void;
    private promisedStripeElements: StripeElements | null = null;

    private couponBtn: HTMLButtonElement | null = null;
    private couponInputRef: WeakRef<HTMLInputElement> | null = null;
    private submittingCoupon: boolean = false;

    private readonly creationObserver: ElementCreationObserver<HTMLElement>;
    private readonly updateObserver: ElementUpdateObserver<HTMLElement>;
    private readonly currentOrderBumps: Map<string, OrderBumpImpl> = new Map();

    public constructor(private readonly hldocument: HighLevelDocumentImpl, private readonly element: HTMLDivElement) {
        super();
        this.creationObserver = new ElementCreationObserver(element);
        this.updateObserver = new ElementUpdateObserver(element);

        const orderBumpElements = element.querySelectorAll<HTMLElement>(OrderFormImpl.ORDER_BUMP_SELECTOR);

        for (const orderBumpElement of orderBumpElements) {
            const id = orderBumpElement.id ? orderBumpElement.id : `${element.id}-bump-${this.currentOrderBumps.size + 1}`;
            this.currentOrderBumps.set(id, new OrderBumpImpl(this, this.hldocument, orderBumpElement));
        }

        setTimeout(() => {
            this.rejectPromisedStripeElements(new Error(`Stripe JS failed to load within ${OrderFormImpl.PAYMENT_INTEGRATION_TIMEOUT_SECONDS} seconds`));
        }, OrderFormImpl.PAYMENT_INTEGRATION_TIMEOUT);
    }

    public mount(): void {
        for (const orderBump of this.currentOrderBumps.values()) {
            this.hldocument.mount(orderBump);
        }

        this.creationObserver.start();
        this.updateObserver.start();

        this.watchCouponButton();
        this.watchCouponInput();
        this.watchCouponAppliedText();
    }

    private watchCouponButton(): void {
        this.creationObserver.watchSelector(OrderFormImpl.COUPON_BTN_SELECTOR, btn => {
            this.couponBtn = btn as HTMLButtonElement;

            btn.addEventListener('click', () => {
                if (this.submittingCoupon) return;
                this.submittingCoupon = true;
                this.dispatchCouponEvent('beforecouponsubmit', this.couponInputRef?.deref()?.value ?? '');
            });
        });
    }

    private watchCouponInput(): void {
        this.creationObserver.watchSelector(OrderFormImpl.COUPON_INPUT_SELECTOR, input => {
            this.couponInputRef = new WeakRef(input as HTMLInputElement);
        });

        this.updateObserver.watchSelector(OrderFormImpl.COUPON_INPUT_SELECTOR, (input, info): void => {
            if (!(input instanceof HTMLInputElement) || !this.couponBtn) return;
            if (info.type !== 'attributes' || info.attributeName !== 'class') return;

            const hasError = input.classList.contains('text-box-error');
            const hadError = info.oldValue?.includes('text-box-error') ?? false;

            this.couponBtn.disabled = hasError && input.value.length > 0;

            if (hasError && this.submittingCoupon && input.value.length > 0) {
                this.submittingCoupon = false;
                this.dispatchCouponEvent('couponerror', input.value);
                this.dispatchCouponEvent('aftercouponsubmit', input.value);
            } else if (hadError && !hasError && !this.submittingCoupon) {
                this.dispatchCouponEvent('couponreset', input.value);
            }
        });
    }

    private watchCouponAppliedText(): void {
        this.creationObserver.watchSelector(OrderFormImpl.COUPON_APPLIED_TEXT_SELECTOR, () => {
            if (!this.submittingCoupon) return;

            this.submittingCoupon = false;

            const couponCode = this.couponInputRef?.deref()?.value ?? '';
            this.dispatchCouponEvent('couponsuccess', couponCode);
            this.dispatchCouponEvent('aftercouponsubmit', couponCode);
        });
    }

    private dispatchCouponEvent(type: keyof OrderFormEventMap, couponCode: string): void {
        const event = new CustomEvent(type, {
            bubbles: true,
            detail: { couponCode }
        });

        this.dispatchEvent(event);
        this.hldocument.dispatchEvent(event);
    }

    public resolveNewStripeElements(elements: StripeElements): void {
        this.promisedStripeElements = elements;
        this.resolvePromisedStripeElements(elements);
        this.stripeElementsPromise = Promise.resolve(elements);
    }

    public invalidateStripeElements(): void {
        this.promisedStripeElements = null;
        this.stripeElementsPromise = new Promise((resolve, reject) => {
            this.resolvePromisedStripeElements = resolve;
            this.rejectPromisedStripeElements = reject;
        });

        setTimeout(() => {
            this.rejectPromisedStripeElements(new Error(`Stripe elements failed to reinitialize within ${OrderFormImpl.PAYMENT_INTEGRATION_TIMEOUT_SECONDS} seconds`));
        }, OrderFormImpl.PAYMENT_INTEGRATION_TIMEOUT);
    }

    public get domElement(): HTMLDivElement {
        return this.element;
    }

    public submitCoupon(code: string): boolean {
        const input = this.couponInputRef?.deref();
        if (!input || !this.couponBtn || this.submittingCoupon) return false;
        input.value = code;
        this.couponBtn.click();
        return true;
    }

    public getStripeElement<K extends keyof StripeElementTypeMap>(name: K): StripeElementTypeMap[K] | undefined {
        if (this.promisedStripeElements === null) return undefined;
        return (this.promisedStripeElements.getElement as (type: K) => StripeElementTypeMap[K] | null)(name) ?? undefined;
    }

    public getStripeElements(): Promise<StripeElements> {
        return this.stripeElementsPromise;
    }

    public get orderBumps(): Iterable<OrderBump> {
        return this.currentOrderBumps.values();
    }
}