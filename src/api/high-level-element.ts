/**
 * The base for all HighLevel DOM element wrappers.
 * Provides a typed event system and lifecycle management for GoHighLevel's available 
 * components, or if available, custom ones.
 * 
 * @typeParam T - The underlying HTML element type
 * @typeParam M - The event map for this element's custom events
 * 
 * @public
 */
export abstract class HighLevelElement<T extends HTMLElement, M extends Record<keyof M, M[keyof M]>> extends EventTarget {
    public override addEventListener<K extends keyof M & string>(type: K, listener: (this: this, ev: M[K]) => any, options?: boolean | AddEventListenerOptions): void;
    public override addEventListener<K extends keyof M & string>(type: K, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void;
    public override addEventListener<K extends keyof M & string>(type: K, listener: ((...args: any[]) => any) | EventListenerObject | null, options?: boolean | AddEventListenerOptions): void {
        super.addEventListener(type, listener, options);
    }

    public override removeEventListener<K extends keyof M & string>(type: K, listener: (this: this, ev: M[K]) => any, options?: boolean | EventListenerOptions): void;
    public override removeEventListener<K extends keyof M & string>(type: K, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions): void;
    public override removeEventListener<K extends keyof M & string>(type: K, listener: ((...args: any[]) => any) | EventListenerObject | null, options?: boolean | EventListenerOptions): void {
        super.removeEventListener(type, listener, options);
    }

    public override dispatchEvent<K extends keyof M & string>(event: M[K]): boolean {
        return super.dispatchEvent(event);
    }

    /**
     * The underlying DOM element this wrapper manages.
     */
    abstract get domElement(): T;
}
