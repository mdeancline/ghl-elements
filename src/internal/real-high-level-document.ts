import { IterableWeakMap } from 'weakref';
import { isGoHighLevel, assertPackageNotLoaded, declarePackageLoaded } from './utils/utils';
import { AccordionFactory } from './accordion-factory';
import { StandardAccordion } from './standard-accordion';
import { ElementCreationObserver } from './dom/element-creation-observer';
import { FAQAccordion } from './faq-accordion';
import { HighLevelElement } from '../api/high-level-element';
import { HighLevelElementFactory } from './high-level-element-factory';
import { OrderFormFactory } from './order-form-factory';
import { Mountable } from './mountable';
import { HighLevelDocument } from '../api/high-level-document';
import { StripeElementOrchestrator } from './stripe/stripe-element-orchestrator';
import { Mounter } from './mounter';
import { StripeRegistry as StripeRegistry } from './stripe/stripe-registry';
import { GHLElementsError } from '../api/ghl-elements-error';

// TODO add detection system for hldocument already existing in the same scope
class RealHighLevelDocument extends HighLevelDocument implements Mounter {
    private static readonly INSTANCE: RealHighLevelDocument = new RealHighLevelDocument();

    private readonly elements = new IterableWeakMap<HTMLElement, HighLevelElement<any, any>>();
    private readonly creationObserver = new ElementCreationObserver<HTMLElement>();
    private readonly stripeRegistry: StripeRegistry = new StripeRegistry();
    private readonly stripeOrchestrator: StripeElementOrchestrator = new StripeElementOrchestrator(this, this.stripeRegistry);

    static {
        if (!isGoHighLevel()) {
            throw new GHLElementsError('Only compatible with GoHighLevel websites');
        }

        assertPackageNotLoaded();
        declarePackageLoaded();
    }

    private constructor() {
        super();
        this.creationObserver.start();
        this.registerDefaultFactories();
        this.stripeOrchestrator.start();
    }

    private registerDefaultFactories(): void {
        this.register(new AccordionFactory('.accordion', '.accordion-trigger', (element, trigger) => {
            return new StandardAccordion(element, trigger);
        }));

        this.register(new AccordionFactory('.hl-faq-child', '.hl-faq-child-heading', (element, trigger) => {
            return new FAQAccordion(element, trigger);
        }));

        this.register(new OrderFormFactory(this, this.stripeRegistry));
    }

    public static get instance(): RealHighLevelDocument {
        return this.INSTANCE;
    }

    public register(factory: HighLevelElementFactory<any, any, any>): void {
        const htmlElements = document.querySelectorAll(factory.selector);

        for (const htmlElement of htmlElements) {
            this.mount(factory.create(htmlElement));
        }

        this.creationObserver.watchSelector(factory.selector, htmlElement => this.mount(factory.create(htmlElement)));
    }

    public mount(element: HighLevelElement<any, any> & Mountable): void {
        element.mount();
        this.elements.set(element.domElement, element);
        this.dispatchEvent(new CustomEvent('elementloaded', { detail: element }));
    }

    public getElementByNode<E extends HTMLElement, M extends Record<keyof M, M[keyof M]>, T extends HighLevelElement<E, M>>(node: HTMLElement, constructor: abstract new (...args: any[]) => T): T | undefined;
    public getElementByNode(node: HTMLElement, constructor: abstract new (...args: any[]) => HighLevelElement<HTMLElement, Record<string, CustomEvent>>): HighLevelElement<HTMLElement, Record<string, CustomEvent>> | undefined {
        const found = this.elements.get(node);
        if (found instanceof constructor) return found;
        return undefined;
    }

    public getElementById<E extends HTMLElement, M extends Record<keyof M, M[keyof M]>, T extends HighLevelElement<E, M>>(id: string, constructor: abstract new (...args: any[]) => T): T | undefined;
    public getElementById(id: string, constructor: abstract new (...args: any[]) => HighLevelElement<HTMLElement, Record<string, CustomEvent>>): HighLevelElement<HTMLElement, Record<string, CustomEvent>> | undefined {
        const element = document.getElementById(id);
        if (!element) return undefined;
        return this.getElementByNode(element, constructor);
    }

    public getElementsByType<E extends HTMLElement, M extends Record<string, M[keyof M]>, T extends HighLevelElement<E, M>>(constructor: abstract new (...args: any[]) => T): readonly T[];
    public getElementsByType(constructor: abstract new (...args: any[]) => HighLevelElement<HTMLElement, Record<string, CustomEvent>>): readonly HighLevelElement<HTMLElement, Record<string, CustomEvent>>[] {
        const elements: HighLevelElement<HTMLElement, Record<string, CustomEvent>>[] = [];
        for (const element of this.elements.values()) {
            if (element instanceof constructor) elements.push(element);
        }
        return elements;
    }

    public getFirstElementByType<E extends HTMLElement, M extends Record<keyof M, M[keyof M]>, T extends HighLevelElement<E, M>>(constructor: abstract new (...args: any[]) => T): T | undefined;
    public getFirstElementByType(constructor: abstract new (...args: any[]) => HighLevelElement<HTMLElement, Record<string, CustomEvent>>): HighLevelElement<HTMLElement, Record<string, CustomEvent>> | undefined {
        for (const element of this.elements.values()) {
            if (element instanceof constructor) return element;
        }
        return undefined;
    }
}

/**
 * The singleton {@link HighLevelDocument} instance, the entry point for retrieving
 * and listening to registered HighLevel elements on the page.
 *
 * @public
 */
export const hldocument: HighLevelDocument = RealHighLevelDocument.instance;
