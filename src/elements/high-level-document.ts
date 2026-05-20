import HighLevelElement from "./high-level-element";

/**
 * Represents the HighLevel document, the top-level registry and event bus
 * for all {@link HighLevelElement} instances on the page.
 * 
 * Access the singleton instance via `hldocument`.
 * 
 * @example
 * import { hldocument } from 'ghl-elements';
 * 
 * hldocument.addEventListener('accordionopen', event => {
 *     console.log('Accordion opened:', event.detail);
 * });
 */
export default interface HighLevelDocument extends EventTarget {
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLDocument, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HighLevelDocumentEventMap>(type: K, listener: (this: HTMLDocument, ev: HighLevelDocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLDocument, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HighLevelDocumentEventMap>(type: K, listener: (this: HTMLDocument, ev: HighLevelDocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void;

    /**
     * Retrieves a registered {@link HighLevelElement} by its DOM element ID.
     * 
     * @param id - The DOM element ID to look up
     * @param constructor - The class constructor to match against
     * @returns The matching element instance, or `undefined` if not found
     * 
     * @example
     * const form = hldocument.getElementById('one-step-order-IjosAGseXl', OrderForm);
     */
    getElementById<E extends HTMLElement, M extends HTMLElementEventMap, T extends HighLevelElement<E, M>>(id: string, constructor: abstract new (...args: any[]) => T): T | undefined;

    /**
     * Retrieves all registered {@link HighLevelElement} instances of a given type.
     * 
     * @param constructor - The class constructor to match against
     * @returns An array of matching element instances
     * 
     * @example
     * const forms = hldocument.getElementsByType(OrderForm);
     */
    getElementsByType<E extends HTMLElement, M extends HTMLElementEventMap, T extends HighLevelElement<E, M>>(constructor: abstract new (...args: any[]) => T): readonly T[];

    /**
     * Retrieves the first registered {@link HighLevelElement} instance of a given type.
     * 
     * @param constructor - The class constructor to match against
     * @returns The first matching element instance, or `undefined` if not found
     * 
     * @example
     * const form = hldocument.getFirstElementByType(OrderForm);
     */
    getFirstElementByType<E extends HTMLElement, M extends HTMLElementEventMap, T extends HighLevelElement<E, M>>(constructor: abstract new (...args: any[]) => T): T | undefined;
}

/**
 * Event map for document-level HighLevel events.
 */
export interface HighLevelDocumentEventMap extends DocumentEventMap {
    /** Fired when any accordion on the page opens. */
    'accordionopen': CustomEvent;
    /** Fired when any accordion on the page closes. */
    'accordionclose': CustomEvent;
    /** Fired before a coupon code is submitted. */
    'beforecouponsubmit': CustomEvent;
    /** Fired after a coupon code is submitted, regardless of outcome. */
    'aftercouponsubmit': CustomEvent;
    /** Fired when a coupon code is successfully applied. */
    'couponsuccess': CustomEvent;
    /** Fired when a coupon code is invalid. */
    'couponerror': CustomEvent;
    /** Fired when a coupon code is reset. */
    'couponreset': CustomEvent;
    /** Fired when an order bump is selected. */
    'orderbumpselect': CustomEvent;
    /** Fired when an order bump is deselected. */
    'orderbumpdeselect': CustomEvent;
}