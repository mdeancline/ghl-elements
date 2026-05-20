import { Stripe, StripeElement, StripeElements } from '@stripe/stripe-js';
import StripeInterceptor from './stripe-interceptor';
import Proxies from '../utils/proxies';
import ScriptObserver from '../utils/script-observer';
import OrderFormImpl from '../order-form-impl';
import HighLevelDocumentImpl from '../high-level-document-impl';

export default class StripeElementOrchestrator {
    private readonly scriptObserver: ScriptObserver = new ScriptObserver;

    public constructor(private readonly hldocument: HighLevelDocumentImpl) { }

    public start(): void {
        const interceptor = new StripeInterceptor(stripe => this.onStripeInstance(stripe));
        this.scriptObserver.addWatcher(interceptor);
    }

    private onStripeInstance(stripe: Stripe): Stripe {
        return Proxies.wrap(stripe, (method, returnValue) => {
            if (method !== 'elements') return;
            this.onElementsCreated(returnValue as StripeElements);
        });
    }

    private onElementsCreated(stripeElements: StripeElements): void {
        Proxies.monitor(stripeElements, 'create', returnValue => {
            this.onStripeElementCreated(stripeElements, returnValue as StripeElement);
        });
    }

    private onStripeElementCreated(stripeElements: StripeElements, createdElement: StripeElement): void {
        Proxies.monitor(createdElement, 'mount', (_returnValue, args) => {
            this.onStripeElementMounted(stripeElements, args[0] as string);
        });
    }

    private onStripeElementMounted(stripeElements: StripeElements, selector: string): void {
        if (!selector.startsWith('#')) {
            console.warn(`Unexpected Stripe mount selector format: "${selector}"`);
            return;
        }

        const id = selector.slice(1);
        const mountingElement = document.getElementById(id);

        if (!mountingElement) {
            console.warn(`Could not find Stripe mount element for selector "${selector}"`);
            return;
        }

        const orderFormElement = mountingElement.closest<HTMLElement>(OrderFormImpl.SELECTOR);

        if (!orderFormElement) {
            console.warn(`Could not find order form for selector "${selector}"`);
            return;
        }

        const orderForm = this.hldocument.getElement(orderFormElement, OrderFormImpl);

        if (!orderForm) {
            console.warn(`Order form element found but not registered for selector "${selector}"`);
            return;
        }

        this.watchForRemoval(mountingElement, orderForm);
        orderForm.resolveNewStripeElements(stripeElements);
    }

    private watchForRemoval(mountingElement: HTMLElement, orderForm: OrderFormImpl): void {
        const observer = new MutationObserver(() => {
            if (document.contains(mountingElement)) return;
            orderForm.invalidateStripeElements();
            observer.disconnect();
        });

        observer.observe(mountingElement.parentElement ?? orderForm.domElement, {
            childList: true,
            subtree: true,
        });
    }
}