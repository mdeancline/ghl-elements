/**
 * The base for all HighLevel DOM element wrappers.
 * Provides a typed event system and lifecycle management for HighLevel's available 
 * components, or if available, custom ones.
 * 
 * @typeParam T - The underlying HTML element type
 * @typeParam M - The event map for this element's custom events
 * 
 */
export default abstract class HighLevelElement<T extends HTMLElement, M extends HTMLElementEventMap> extends EventTarget {
    abstract override addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: T, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    abstract override addEventListener<K extends keyof M>(type: K, listener: (this: T, ev: M[K]) => any, options?: boolean | AddEventListenerOptions): void;
    abstract override addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
    abstract override removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    abstract override removeEventListener<K extends keyof M>(type: K, listener: (this: T, ev: M[K]) => any, options?: boolean | EventListenerOptions): void;
    abstract override removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void;

    /**
     * The underlying DOM element this wrapper manages.
     */
    abstract get domElement(): T;
}