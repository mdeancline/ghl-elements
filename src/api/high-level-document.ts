import { HighLevelElement } from "./high-level-element";

/**
 * Represents the HighLevel document, the top-level registry and event bus
 * for all {@link HighLevelElement} instances on the page.
 * 
 * Access the singleton instance via `hldocument`.
 * 
 * @example
 * ```typescript
 * import { hldocument } from '@mdcline/ghl-elements';
 * 
 * hldocument.addEventListener('elementloaded', event => {
 *     console.log('Element loaded:', event.detail);
 * });
 * ```
 * @public
 * @since 1.0.0
 */
export abstract class HighLevelDocument extends EventTarget {
    /**
     * @since 1.0.0
     */
    public override addEventListener<K extends keyof HighLevelDocumentEventMap & string>(type: K, listener: (this: this, ev: HighLevelDocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    public override addEventListener<K extends keyof HighLevelDocumentEventMap & string>(type: K, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void;
    public override addEventListener<K extends keyof HighLevelDocumentEventMap & string>(type: K, listener: ((...args: any[]) => any) | EventListenerObject | null, options?: boolean | AddEventListenerOptions): void {
        super.addEventListener(type, listener, options);
    }

    /**
     * @since 1.0.0
     */
    public override removeEventListener<K extends keyof HighLevelDocumentEventMap & string>(type: K, listener: (this: this, ev: HighLevelDocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    public override removeEventListener<K extends keyof HighLevelDocumentEventMap & string>(type: K, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions): void;
    public override removeEventListener<K extends keyof HighLevelDocumentEventMap & string>(type: K, listener: ((...args: any[]) => any) | EventListenerObject | null, options?: boolean | EventListenerOptions): void {
        super.removeEventListener(type, listener, options);
    }

    /**
     * @since 1.0.0
     */
    public override dispatchEvent<K extends keyof HighLevelDocumentEventMap & string>(event: HighLevelDocumentEventMap[K]): boolean {
        return super.dispatchEvent(event);
    }

    /**
     * Retrieves a loaded {@link HighLevelElement} by its DOM element reference.
     *
     * @param node - The DOM element node to look up
     * @param constructor - The class constructor to match against
     * @returns The matching element instance, or `undefined` if not found
     *
     * @example
     * ```typescript
     * const node = document.getElementById('one-step-order-IjosAGseXl');
     * const form = hldocument.getElementByNode(node, OrderForm);
     * ```
     * @since 1.0.0
     */
    abstract getElementByNode<E extends HTMLElement, M extends Record<keyof M, M[keyof M]>, T extends HighLevelElement<E, M>>(node: E, constructor: abstract new (...args: any[]) => T): T | undefined;

    /**
     * Retrieves a registered {@link HighLevelElement} by its DOM element ID.
     * 
     * @param id - The DOM element ID to look up
     * @param constructor - The class constructor to match against
     * @returns The matching element instance, or `undefined` if not found
     * 
     * @example
     * ```typescript
     * const form = hldocument.getElementById('one-step-order-IjosAGseXl', OrderForm);
     * ```
     * @since 1.0.0
     */
    abstract getElementById<E extends HTMLElement, M extends Record<keyof M, M[keyof M]>, T extends HighLevelElement<E, M>>(id: string, constructor: abstract new (...args: any[]) => T): T | undefined;

    /**
     * Retrieves all registered {@link HighLevelElement} instances of a given type.
     * 
     * @param constructor - The class constructor to match against
     * @returns An array of matching element instances
     * 
     * @example
     * ```typescript
     * const forms = hldocument.getElementsByType(OrderForm);
     * ```
     * @since 1.0.0
     */
    abstract getElementsByType<E extends HTMLElement, M extends Record<keyof M, M[keyof M]>, T extends HighLevelElement<E, M>>(constructor: abstract new (...args: any[]) => T): readonly T[];

    /**
     * Retrieves the first registered {@link HighLevelElement} instance of a given type.
     * 
     * @param constructor - The class constructor to match against
     * @returns The first matching element instance, or `undefined` if not found
     * 
     * @example
     * ```typescript
     * const form = hldocument.getFirstElementByType(OrderForm);
     * ```
     * @since 1.0.0
     */
    abstract getFirstElementByType<E extends HTMLElement, M extends Record<keyof M, M[keyof M]>, T extends HighLevelElement<E, M>>(constructor: abstract new (...args: any[]) => T): T | undefined;
}

/**
 * Event map for document-level HighLevel events.
 * @public
 * @since 1.0.0
 */
export interface HighLevelDocumentEventMap {
    /**
     * Fired when a {@link HighLevelElement} is loaded.
     * @since 1.0.0
     */
    'elementloaded': CustomEvent<HighLevelElement<HTMLElement, Record<string, CustomEvent>>>;
}
