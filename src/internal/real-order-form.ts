import { ElementCreationObserver } from './dom/element-creation-observer';
import { ElementUpdateObserver } from './dom/element-update-observer';
import { OrderBump } from '../api/order-bump';
import { StripeElement, StripeElements, StripeElementType } from '@stripe/stripe-js';
import { OrderForm, CouponUsageDetails, OrderFormEventMap } from '../api/order-form';
import { RealOrderBump } from './real-order-bump';
import { Mountable } from './mountable';
import { HighLevelDocument } from '../api/high-level-document';
import { Mounter } from './mounter';
import { StripeRegistry } from './stripe/stripe-registry';
import { DynamicElementRef } from './dom/dynamic-element-ref';

export class RealOrderForm extends OrderForm implements Mountable {
    public static readonly SELECTOR: string = '.c-order';

    private static readonly ORDER_BUMP_SELECTOR: string = '.order-bump-container';
    private static readonly COUPON_BTN_SELECTOR: string = 'button.apply-coupon-btn';
    private static readonly COUPON_INPUT_SELECTOR: string = 'input.coupon-input';
    private static readonly COUPON_APPLIED_TEXT_SELECTOR: string = '.coupon-applied-text';
    private static readonly COUPON_CONTAINER_SELECTOR: string = '.coupon-text-container';

    private readonly couponBtnListeners = new WeakSet<HTMLButtonElement>();
    private readonly couponBtnRef: DynamicElementRef<HTMLButtonElement>;
    private readonly couponInputRef: DynamicElementRef<HTMLInputElement>;
    private appliedCoupon: string | null = null;
    private submittingCoupon = false;
    private couponJustCleared = false;

    private readonly creationObserver: ElementCreationObserver<HTMLElement>;
    private readonly updateObserver: ElementUpdateObserver<HTMLElement>;
    private readonly currentOrderBumps = new Map<string, OrderBump>();

    public constructor(
        private readonly hldocument: HighLevelDocument & Mounter,
        private readonly element: HTMLDivElement,
        private readonly stripeRegistry: StripeRegistry
    ) {
        super();
        this.creationObserver = new ElementCreationObserver(element);
        this.updateObserver = new ElementUpdateObserver(element);
        this.couponBtnRef = new DynamicElementRef(RealOrderForm.COUPON_BTN_SELECTOR, element);
        this.couponBtnRef.onReref(btn => this.attachCouponButtonListeners(btn));
        this.couponInputRef = new DynamicElementRef(RealOrderForm.COUPON_INPUT_SELECTOR, element);
    }

    public mount(): void {
        for (const orderBumpElement of this.domElement.querySelectorAll<HTMLElement>(RealOrderForm.ORDER_BUMP_SELECTOR)) {
            const id = orderBumpElement.id || `${this.domElement.id}-bump-${this.currentOrderBumps.size + 1}`;
            const bump = new RealOrderBump(this, orderBumpElement);
            this.currentOrderBumps.set(id, bump);
            this.hldocument.mount(bump);
        }

        this.creationObserver.start();
        this.updateObserver.start();

        if (this.hasCouponsEnabled()) {
            this.mountCouponHandling();
        }
    }

    private mountCouponHandling(): void {
        this.addEventListener('couponsubmit', () => { this.submittingCoupon = true; });
        this.addEventListener('couponsuccess', e => { this.appliedCoupon = e.detail.coupon; });
        this.addEventListener('couponclear', () => { this.appliedCoupon = null; });
        this.addEventListener('couponprocessed', () => { this.submittingCoupon = false; });

        this.element.addEventListener('click', e => {
            const target = e.target;
            if (target instanceof HTMLButtonElement && target.matches(RealOrderForm.COUPON_BTN_SELECTOR)) {
                if (this.isApplyCouponButton()) {
                    this.couponBtnRef.refresh();
                }
            }
        });

        this.watchCouponInput();
        this.watchCouponAppliedText();
    }

    private isApplyCouponButton(): boolean {
        return this.couponInputRef.tryDeref() !== null;
    }

    private attachCouponButtonListeners(btn: HTMLButtonElement): HTMLButtonElement {
        if (this.couponBtnListeners.has(btn)) return btn;
        this.couponBtnListeners.add(btn);

        btn.addEventListener('click', () => {
            if (this.submittingCoupon) return;
            if (!this.isApplyCouponButton()) return;
            if (this.couponJustCleared) return;

            const input = this.couponInputRef.tryDeref();
            const value = input?.value ?? '';

            if (input?.classList.contains('text-box-error') && value.length > 0) {
                this.dispatchCouponEvent('couponsubmit', value);
                this.dispatchCouponEvent('couponerror', value);
                this.dispatchCouponEvent('couponprocessed', value);
            } else {
                this.dispatchCouponEvent('couponsubmit', value);
            }
        });

        return btn;
    }

    private watchCouponInput(): void {
        this.updateObserver.watchSelector(RealOrderForm.COUPON_INPUT_SELECTOR, (input: HTMLInputElement, info): void => {
            if (!this.submittingCoupon || !this.couponButton) return;
            if (info.type !== 'attributes' || info.attributeName !== 'class') return;
            if (!input.classList.contains('text-box-error') || input.value.length === 0) return;

            this.dispatchCouponEvent('couponerror', input.value);
            this.dispatchCouponEvent('couponprocessed', input.value);
        }, { attributeFilter: ['class'] });
    }

    private watchCouponAppliedText(): void {
        this.creationObserver.watchSelector(RealOrderForm.COUPON_APPLIED_TEXT_SELECTOR, () => {
            const coupon = this.couponInputRef.tryDeref()?.value ?? '';
            this.dispatchCouponEvent('couponsuccess', coupon);
            this.dispatchCouponEvent('couponprocessed', coupon);
        });

        const container = this.element.querySelector(RealOrderForm.COUPON_CONTAINER_SELECTOR);
        if (container) {
            const observer = new MutationObserver(() => {
                if (this.appliedCoupon === null) return;

                const appliedText = this.element.querySelector(RealOrderForm.COUPON_APPLIED_TEXT_SELECTOR);
                if (!appliedText) {
                    this.couponJustCleared = true;
                    this.dispatchCouponEvent('couponclear', this.appliedCoupon);
                    setTimeout(() => { this.couponJustCleared = false; }, 0);
                }
            });

            observer.observe(container, { childList: true });
        }
    }

    private dispatchCouponEvent(type: keyof OrderFormEventMap & string, coupon: string): void {
        this.dispatchEvent(new CustomEvent(type, { bubbles: true, detail: { coupon } satisfies CouponUsageDetails }));
    }

    public get domElement(): HTMLDivElement {
        return this.element;
    }

    public hasCouponsEnabled(): this is RealOrderForm & { couponButton: HTMLButtonElement } {
        return this.couponButton !== null;
    }

    public hasCouponApplied(): boolean {
        return this.appliedCoupon !== null;
    }

    public get couponButton(): HTMLButtonElement | null {
        return this.couponBtnRef.tryDeref();
    }

    public submitCoupon(code: string): boolean {
        if (this.submittingCoupon || !this.hasCouponsEnabled()) return false;

        const couponInput = this.couponInputRef.tryDeref();
        if (!couponInput) return false;

        const couponBtn = this.couponButton;
        if (!this.isApplyCouponButton()) return false;

        couponInput.value = code;
        couponInput.dispatchEvent(new Event('input', { bubbles: true }));
        couponBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

        return true;
    }

    public getStripeElement<K extends StripeElementType>(name: K): StripeElement | null {
        return this.stripeRegistry.getElement(this, name);
    }

    public getStripeElements(): Promise<StripeElements> {
        return this.stripeRegistry.getElements(this);
    }

    public hasStripeAvailable(): boolean {
        return this.stripeRegistry.hasElementsAvailable(this);
    }

    public get orderBumps(): Iterable<OrderBump> {
        return this.currentOrderBumps.values();
    }
}
