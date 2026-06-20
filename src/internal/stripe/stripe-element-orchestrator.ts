import { Stripe, StripeElement, StripeElements } from '@stripe/stripe-js';
import { StripeInterceptor } from './stripe-interceptor';
import { wrap, monitor } from '../utils/proxies';
import { ScriptObserver } from '../utils/script-observer';
import { OrderFormImpl } from '../order-form-impl';
import { HighLevelDocument } from '../../api/high-level-document';
import { StripeRegistry as StripeRegistry } from './stripe-elements-registry';

export class StripeElementOrchestrator {
    private readonly scriptObserver: ScriptObserver = new ScriptObserver;

    public constructor(
        private readonly hldocument: HighLevelDocument,
        private readonly stripeRegistry: StripeRegistry
    ) { }

    public start(): void {
        const interceptor = new StripeInterceptor(stripe => this.onStripeInstance(stripe));
        this.scriptObserver.addWatcher(interceptor);
        this.scriptObserver.start();
    }

    private onStripeInstance(stripe: Stripe): Stripe {
        return wrap(stripe, (method, returnValue) => {
            if (method !== 'elements') return;
            this.onElementsCreated(returnValue as StripeElements);
        });
    }

    private onElementsCreated(stripeElements: StripeElements): void {
        monitor(stripeElements, 'create', returnValue => {
            this.onStripeElementCreated(stripeElements, returnValue as StripeElement);
        });
    }

    private onStripeElementCreated(stripeElements: StripeElements, createdElement: StripeElement): void {
        monitor(createdElement, 'mount', (_returnValue, args) => {
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

        const orderForm = this.hldocument.getElementByNode(orderFormElement, OrderFormImpl);

        if (!orderForm) {
            console.warn(`Order form element found but not registered for selector "${selector}"`);
            return;
        }

        this.watchForRemoval(mountingElement, orderForm);
        this.stripeRegistry.registerElements(orderForm, stripeElements)
    }

    private watchForRemoval(mountingElement: HTMLElement, orderForm: OrderFormImpl): void {
        const observer = new MutationObserver(() => {
            if (document.contains(mountingElement)) {
                this.stripeRegistry.invalidate(orderForm);
                observer.disconnect();
            }
        });

        observer.observe(mountingElement.parentElement ?? orderForm.domElement, {
            childList: true,
            subtree: true,
        });
    }
}