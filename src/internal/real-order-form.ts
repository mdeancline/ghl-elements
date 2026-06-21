import { ElementCreationObserver } from './dom/element-creation-observer';
import { ElementUpdateObserver } from './dom/element-update-observer';
import { OrderBump } from '../api/order-bump';
import { StripeElement, StripeElements, StripeElementType } from '@stripe/stripe-js';
import { OrderForm, CouponUsageDetails, OrderFormEventMap } from '../api/order-form';
import { RealOrderBump } from './real-order-bump';
import { Mountable } from './mountable';
import { HighLevelDocument } from '../api/high-level-document';
import { Mounter } from './mounter';
import { StripeRegistry } from './stripe/stripe-elements-registry';

export class RealOrderForm extends OrderForm implements Mountable {
    public static readonly SELECTOR: string = '.c-order';

    private static readonly ORDER_BUMP_SELECTOR: string = '.order-bump-container';
    private static readonly COUPON_BTN_SELECTOR: string = 'button.apply-coupon-btn';
    private static readonly COUPON_INPUT_SELECTOR: string = 'input.coupon-input';
    private static readonly COUPON_APPLIED_TEXT_SELECTOR: string = '.coupon-applied-text';

    private readonly couponBtnListeners = new WeakSet<HTMLButtonElement>();
    private couponBtnRef: WeakRef<HTMLButtonElement> | null = null;
    private couponInputRef: WeakRef<HTMLInputElement> | null = null;
    private appliedCoupon: string | null = null;
    private submittingCoupon = false;

    private readonly creationObserver: ElementCreationObserver<HTMLElement>;
    private readonly updateObserver: ElementUpdateObserver<HTMLElement>;
    private readonly currentOrderBumps = new Map<string, RealOrderBump>();

    public constructor(
        private readonly hldocument: HighLevelDocument & Mounter,
        private readonly element: HTMLDivElement,
        private readonly stripeRegistry: StripeRegistry
    ) {
        super();
        this.creationObserver = new ElementCreationObserver(element);
        this.updateObserver = new ElementUpdateObserver(element);
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
        } else {
            this.creationObserver.watchSelector(RealOrderForm.COUPON_BTN_SELECTOR, (btn: HTMLButtonElement) => {
                this.couponBtnRef = new WeakRef(this.attachCouponButtonListeners(btn));
                this.mountCouponHandling();
            });
        }
    }

    private mountCouponHandling(): void {
        this.addEventListener('couponsubmit', () => { this.submittingCoupon = true; });
        this.addEventListener('couponsuccess', e => { this.appliedCoupon = e.detail.coupon; });
        this.addEventListener('couponclear', () => { this.appliedCoupon = null; });
        this.addEventListener('couponprocessed', () => { this.submittingCoupon = false; });

        this.element.addEventListener('click', e => {
            const target = e.target;
            if (!this.couponBtnRef?.deref() && target instanceof HTMLButtonElement && target.matches(RealOrderForm.COUPON_BTN_SELECTOR)) {
                this.couponBtnRef = new WeakRef(this.attachCouponButtonListeners(target));
            }
        });

        const existingBtn = this.couponButton;
        if (existingBtn) this.attachCouponButtonListeners(existingBtn);

        const existingInput = this.element.querySelector<HTMLInputElement>(RealOrderForm.COUPON_INPUT_SELECTOR);
        if (existingInput) this.couponInputRef = new WeakRef(existingInput);

        this.watchCouponButton();
        this.watchCouponInput();
        this.watchCouponAppliedText();
    }

    private watchCouponButton(): void {
        this.creationObserver.watchSelector(RealOrderForm.COUPON_BTN_SELECTOR, (btn: HTMLButtonElement) => {
            this.couponBtnRef = new WeakRef(this.attachCouponButtonListeners(btn));
        });
    }

    private attachCouponButtonListeners(btn: HTMLButtonElement): HTMLButtonElement {
        if (this.couponBtnListeners.has(btn)) return btn;
        this.couponBtnListeners.add(btn);

        btn.addEventListener('click', () => {
            if (this.submittingCoupon) return;

            if (this.appliedCoupon) {
                this.dispatchCouponEvent('couponclear', this.appliedCoupon);
            } else {
                const input = this.couponInputRef?.deref();
                const value = input?.value ?? '';

                if (input?.classList.contains('text-box-error') && value.length > 0) {
                    this.dispatchCouponEvent('couponsubmit', value);
                    this.dispatchCouponEvent('couponerror', value);
                    this.dispatchCouponEvent('couponprocessed', value);
                } else {
                    this.dispatchCouponEvent('couponsubmit', value);
                }
            }
        });

        return btn;
    }

    private watchCouponInput(): void {
        this.creationObserver.watchSelector(RealOrderForm.COUPON_INPUT_SELECTOR, (input: HTMLInputElement) => {
            this.couponInputRef = new WeakRef(input);
        });

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
            if (!this.submittingCoupon) return;

            const coupon = this.couponInputRef?.deref()?.value ?? '';
            this.dispatchCouponEvent('couponsuccess', coupon);
            this.dispatchCouponEvent('couponprocessed', coupon);
        });
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
        const cached = this.couponBtnRef?.deref() ?? null;
        if (cached) return cached;

        const found = this.element.querySelector<HTMLButtonElement>(RealOrderForm.COUPON_BTN_SELECTOR);
        if (found) this.couponBtnRef = new WeakRef(found);
        return found;
    }

    public submitCoupon(code: string): boolean {
        if (this.submittingCoupon || !this.hasCouponsEnabled()) return false;

        const couponInput = this.couponInputRef?.deref()
            ?? this.element.querySelector<HTMLInputElement>(RealOrderForm.COUPON_INPUT_SELECTOR);

        const couponBtn = this.couponButton;

        if (!couponInput) return false;

        this.couponInputRef = new WeakRef(couponInput);
        this.couponBtnRef = new WeakRef(this.attachCouponButtonListeners(couponBtn));
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