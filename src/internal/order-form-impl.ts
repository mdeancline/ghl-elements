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

    private readonly stripeElementsPromise: Promise<StripeElements> = new Promise(resolve => this.resolveStripeElementsPromise = resolve);
    private resolveStripeElementsPromise!: (elements: StripeElements) => void;
    private resolvedStripeElements: StripeElements | null = null;

    private couponBtn: HTMLButtonElement | null = null;
    private couponInputRef: WeakRef<HTMLInputElement> | null = null;
    private readonly creationObserver: ElementCreationObserver<HTMLElement>;
    private readonly updateObserver: ElementUpdateObserver<HTMLElement>;
    private readonly mappedOrderBumps: Map<string, OrderBumpImpl> = new Map;
    private submittingCoupon: boolean = false;

    public constructor(private readonly hldocument: HighLevelDocumentImpl, private readonly element: HTMLDivElement) {
        super();
        this.creationObserver = new ElementCreationObserver(element);
        this.updateObserver = new ElementUpdateObserver(element);

        const orderBumpElements = element.querySelectorAll<HTMLElement>(OrderFormImpl.ORDER_BUMP_SELECTOR);

        for (const orderBumpElement of orderBumpElements) {
            const id = orderBumpElement.id ? orderBumpElement.id : `${element.id}-bump-${this.mappedOrderBumps.size}`;
            this.mappedOrderBumps.set(id, new OrderBumpImpl(this, this.hldocument, orderBumpElement));
        }
    }

    public mount(): void {
        for (const orderBump of this.mappedOrderBumps.values()) {
            this.hldocument.mount(orderBump);
        }

        this.creationObserver.start();
        this.updateObserver.start();

        this.creationObserver.watchSelector(OrderFormImpl.COUPON_BTN_SELECTOR, btn => {
            this.couponBtn = btn as HTMLButtonElement;

            btn.addEventListener('click', () => {
                if (this.submittingCoupon) return;

                this.submittingCoupon = true;

                const beforeEvent = new CustomEvent('beforecouponsubmit', {
                    bubbles: true,
                    detail: { couponCode: this.couponInputRef?.deref()?.value }
                });

                this.dispatchEvent(beforeEvent);
                this.hldocument.dispatchEvent(beforeEvent);
            });
        });

        this.creationObserver.watchSelector(OrderFormImpl.COUPON_INPUT_SELECTOR, input => {
            this.couponInputRef = new WeakRef(input as HTMLInputElement);
        });

        this.updateObserver.watchSelector(OrderFormImpl.COUPON_INPUT_SELECTOR, (input, info): void => {
            if (!(input instanceof HTMLInputElement) || !this.couponBtn) return;

            if (info.type === 'attributes' && info.attributeName === 'class' && input.value.length > 0) {
                this.couponBtn.disabled = input.classList.contains('text-box-error');
            }
        });

        this.creationObserver.watchSelector(OrderFormImpl.COUPON_APPLIED_TEXT_SELECTOR, () => {
            if (!this.submittingCoupon) return;

            this.submittingCoupon = false;

            const afterEvent = new CustomEvent('aftercouponsubmit', {
                bubbles: true,
                detail: { couponCode: this.couponInputRef?.deref()?.value }
            });

            this.dispatchEvent(afterEvent);
            this.hldocument.dispatchEvent(afterEvent);
        });
    }

    public resolveStripeElements(elements: StripeElements): void {
        this.resolvedStripeElements = elements;
        this.resolveStripeElementsPromise(elements);
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
        if (this.resolvedStripeElements === null) return undefined;
        return (this.resolvedStripeElements.getElement as (type: K) => StripeElementTypeMap[K] | null)(name) ?? undefined;
    }

    public getStripeElements(): Promise<StripeElements> {
        return this.stripeElementsPromise;
    }

    public get orderBumps(): readonly OrderBump[] {
        return [...this.mappedOrderBumps.values()];
    }
}