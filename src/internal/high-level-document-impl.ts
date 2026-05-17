import { IterableWeakMap } from 'weakref';
import Utils from './utils/utils';
import AccordionFactory from './accordion-factory';
import CustomAccordion from './custom-accordion';
import ElementCreationObserver from './dom/element-creation-observer';
import FAQAccordionImpl from './faq-accordion-impl';
import HighLevelElement from '../elements/high-level-element';
import HighLevelElementFactory from './high-level-element-factory';
import OrderFormFactory from './order-form-factory';
import HighLevelElementImpl from './high-level-element-impl';
import HighLevelDocument, { HighLevelDocumentEventMap } from '../elements/high-level-document';
import StripeElementOrchestrator from './stripe/stripe-element-orchestrator';

export default class HighLevelDocumentImpl implements HighLevelDocument {
    private static readonly INSTANCE: HighLevelDocumentImpl = new HighLevelDocumentImpl();

    private readonly elements: IterableWeakMap<HTMLElement, HighLevelElement<HTMLElement, HTMLElementEventMap>> = new IterableWeakMap;
    private readonly observer: ElementCreationObserver<HTMLElement> = new ElementCreationObserver;
    private readonly stripeOrchestrator: StripeElementOrchestrator = new StripeElementOrchestrator(this);

    private constructor() {
        Utils.callWhenLoaded(() => {
            this.observer.start();
            this.registerDefaults();
            this.stripeOrchestrator.start();
        });
    }

    private registerDefaults(): void {
        this.register(new AccordionFactory('.accordion', '.accordion-trigger', (element, trigger) => {
            return new CustomAccordion(this, element, trigger);
        }));

        this.register(new AccordionFactory('.hl-faq-child', '.hl-faq-child-heading', (element, trigger) => {
            return new FAQAccordionImpl(this, element, trigger);
        }));

        this.register(new OrderFormFactory(this));
    }

    public static get instance(): HighLevelDocumentImpl {
        return this.INSTANCE;
    }

    public dispatchEvent(event: Event): boolean {
        return document.dispatchEvent(event);
    }

    public addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLDocument, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    public addEventListener<K extends keyof HighLevelDocumentEventMap>(type: K, listener: (this: HTMLDocument, ev: HighLevelDocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    public addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void {
        document.addEventListener(type, listener as EventListener, options);
    }

    public removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLDocument, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    public removeEventListener<K extends keyof HighLevelDocumentEventMap>(type: K, listener: (this: HTMLDocument, ev: HighLevelDocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    public removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void {
        document.removeEventListener(type, listener as EventListener, options);
    }

    public register<E extends HTMLElement, M extends HTMLElementEventMap, T extends HighLevelElementImpl<E, M>>(factory: HighLevelElementFactory<E, M, T>): void {
        const htmlElements = document.querySelectorAll<E>(factory.selector);

        for (const htmlElement of htmlElements) {
            this.mount(factory.create(htmlElement));
        }

        this.observer.watchSelector(factory.selector, htmlElement => this.mount(factory.create(htmlElement as E)));
    }

    public mount<E extends HTMLElement, M extends HTMLElementEventMap, T extends HighLevelElementImpl<E, M>>(element: T): void {
        element.mount();
        this.elements.set(element.domElement, element);
    }

    public getElement<E extends HTMLElement, M extends HTMLElementEventMap, T extends HighLevelElement<E, M>>(htmlElement: HTMLElement, constructor: abstract new (...args: any[]) => T): T | undefined {
        const found = this.elements.get(htmlElement);
        if (found instanceof constructor) return found;
        return undefined;
    }

    public getElementById<E extends HTMLElement, M extends HTMLElementEventMap, T extends HighLevelElement<E, M>>(id: string, constructor: abstract new (...args: any[]) => T): T | undefined {
        const element = document.getElementById(id);
        if (!element) return undefined;
        return this.getElement(element, constructor);
    }

    public getElementsByType<E extends HTMLElement, M extends HTMLElementEventMap, T extends HighLevelElement<E, M>>(constructor: abstract new (...args: any[]) => T): readonly T[] {
        const elements: T[] = [];

        for (const element of this.elements.values()) {
            if (element instanceof constructor) {
                elements.push(element);
            }
        }

        return elements;
    }

    public getFirstElementByType<E extends HTMLElement, M extends HTMLElementEventMap, T extends HighLevelElement<E, M>>(constructor: abstract new (...args: any[]) => T): T | undefined {
        for (const element of this.elements.values()) {
            if (element instanceof constructor) {
                return element;
            }
        }

        return undefined;
    }
}

export const hldocument: HighLevelDocument = HighLevelDocumentImpl.instance;