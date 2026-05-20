import ElementCreationObserver from './dom/element-creation-observer';
import ElementUpdateObserver from './dom/element-update-observer';
import OrderBump from '../elements/order-bump';
import { StripeElements } from '@stripe/stripe-js';
import OrderForm, { OrderFormEventMap, StripeElementTypeMap } from '../elements/order-form';
import OrderBumpImpl from './order-bump-impl';
import MountingHighLevelElement from './mounting-high-level-element';
import StripeElementsHandle from './stripe/stripe-elements-handle';
import MountingHighLevelDocument from './mounting-high-level-document';

export default class OrderFormImpl extends MountingHighLevelElement<HTMLDivElement, OrderFormEventMap> implements OrderForm {
    public static readonly SELECTOR: string = '.c-order';

    private static readonly ORDER_BUMP_SELECTOR: string = '.order-bump-container';
    private static readonly COUPON_BTN_SELECTOR: string = 'button.apply-coupon-btn';
    private static readonly COUPON_INPUT_SELECTOR: string = 'input[name="coupon_code"]';
    private static readonly COUPON_APPLIED_TEXT_SELECTOR: string = '.coupon-applied-text';

    private readonly stripeHandle: StripeElementsHandle = new StripeElementsHandle();
    private couponBtn: HTMLButtonElement | null = null;
    private couponInputRef: WeakRef<HTMLInputElement> | null = null;
    private submittingCoupon: boolean = false;

    private readonly creationObserver: ElementCreationObserver<HTMLElement>;
    private readonly updateObserver: ElementUpdateObserver<HTMLElement>;
    private readonly currentOrderBumps: Map<string, OrderBumpImpl> = new Map();

    public constructor(private readonly hldocument: MountingHighLevelDocument, private readonly element: HTMLDivElement) {
        super();
        this.creationObserver = new ElementCreationObserver(element);
        this.updateObserver = new ElementUpdateObserver(element);

        const orderBumpElements = element.querySelectorAll<HTMLElement>(OrderFormImpl.ORDER_BUMP_SELECTOR);

        for (const orderBumpElement of orderBumpElements) {
            const id = orderBumpElement.id ? orderBumpElement.id : `${element.id}-bump-${this.currentOrderBumps.size + 1}`;
            this.currentOrderBumps.set(id, new OrderBumpImpl(this, this.hldocument, orderBumpElement));
        }
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

    public resolveStripeElements(elements: StripeElements): void {
        this.stripeHandle.resolveElements(elements);
    }

    public invalidateStripeElements(): void {
        this.stripeHandle.invalidate();
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
        return this.stripeHandle.getElement(name);
    }

    public getStripeElements(): Promise<StripeElements> {
        return this.stripeHandle.getElements();
    }

    public get orderBumps(): Iterable<OrderBump> {
        return this.currentOrderBumps.values();
    }
}