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
import { RealLiveRef } from './dom/real-live-ref';
import { HighLevelLiveRef } from '../api/high-level-live-ref';

export class RealOrderForm extends OrderForm implements Mountable {
    public static readonly SELECTOR: string = '.c-order';

    private static readonly ORDER_BUMP_SELECTOR: string = '.order-bump-container';
    private static readonly COUPON_BTN_SELECTOR: string = 'button.apply-coupon-btn';
    private static readonly COUPON_INPUT_SELECTOR: string = 'input.coupon-input';
    private static readonly COUPON_APPLIED_TEXT_SELECTOR: string = '.coupon-applied-text';
    private static readonly COUPON_CONTAINER_SELECTOR: string = '.coupon-text-container';
    private static readonly ORDER_BTN_SELECTOR: string = '.payment-content .form-btn';

    private readonly couponBtnListeners = new WeakSet<HTMLButtonElement>();
    private readonly _couponButtonRef: RealLiveRef<HTMLButtonElement>;
    private readonly _couponInputRef: RealLiveRef<HTMLInputElement>;
    private readonly _orderButtonRef: RealLiveRef<HTMLButtonElement>;
    private _liveRefs: Iterable<RealLiveRef<HTMLElement>> | null = null;
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
        this._couponButtonRef = new RealLiveRef(RealOrderForm.COUPON_BTN_SELECTOR, element);
        this._couponButtonRef.addEventListener('refresh', e => this.attachCouponButtonListeners(e.detail.current));
        this._couponInputRef = new RealLiveRef(RealOrderForm.COUPON_INPUT_SELECTOR, element);
        this._orderButtonRef = new RealLiveRef(RealOrderForm.ORDER_BTN_SELECTOR, element);
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
                    this._couponButtonRef.refresh();
                }
            }
        });

        this.watchCouponInput();
        this.watchCouponAppliedText();
    }

    private isApplyCouponButton(): boolean {
        return this._couponInputRef.tryCurrent() !== null;
    }

    private attachCouponButtonListeners(btn: HTMLButtonElement): HTMLButtonElement {
        if (this.couponBtnListeners.has(btn)) return btn;
        this.couponBtnListeners.add(btn);

        btn.addEventListener('click', () => {
            if (this.submittingCoupon) return;
            if (!this.isApplyCouponButton()) return;
            if (this.couponJustCleared) return;

            const input = this._couponInputRef.tryCurrent();
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
            const coupon = this._couponInputRef.tryCurrent()?.value ?? '';
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
                    // HACK setTimeout(0) defers the reset past the current click's full event
                    // propagation, since a microtask can run before the button's own listener
                    // fires. See if there's a cleaner way to sequence this once the coupon
                    // click-handling logic is reworked.
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

    public get liveRefs(): Iterable<HighLevelLiveRef<HTMLElement>> {
        return this._liveRefs ?? (this._liveRefs = [
            this._couponButtonRef,
            this._couponInputRef,
            this._orderButtonRef]
        );
    }

    public hasCouponsEnabled(): this is RealOrderForm & { couponButton: HTMLButtonElement } {
        return this.couponButton !== null;
    }

    public hasCouponApplied(): boolean {
        return this.appliedCoupon !== null;
    }

    public get couponButton(): HTMLButtonElement | null {
        return this._couponButtonRef.tryCurrent();
    }

    public get couponButtonRef(): HighLevelLiveRef<HTMLButtonElement> {
        return this._couponButtonRef;
    }

    public get couponInputRef(): HighLevelLiveRef<HTMLInputElement> {
        return this._couponInputRef;
    }

    public get orderButtonRef(): HighLevelLiveRef<HTMLButtonElement> {
        return this._orderButtonRef;
    }

    public submitCoupon(code: string): boolean {
        if (this.submittingCoupon || !this.hasCouponsEnabled()) return false;

        const couponInput = this._couponInputRef.tryCurrent();
        if (!couponInput) return false;

        const couponBtn = this._couponButtonRef.current;
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
