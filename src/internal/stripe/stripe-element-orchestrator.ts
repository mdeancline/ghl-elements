// stripe-element-orchestrator.ts
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
        const id = selector.slice(1);
        const mountingElement = document.getElementById(id);
        const orderFormElement = mountingElement?.closest(OrderFormImpl.SELECTOR) as HTMLElement | null;

        if (!orderFormElement) {
            console.warn(`Could not find order form for selector "${selector}"`);
            return;
        }

        const orderForm = this.hldocument.getElement(orderFormElement, OrderFormImpl);

        if (!orderForm) {
            console.warn(`Order form element found but not registered for selector "${selector}"`);
            return;
        }

        orderForm.resolveStripeElements(stripeElements);
    }
}