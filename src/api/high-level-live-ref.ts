/**
 * A high-level live reference to an element in the DOM.
 *
 * GoHighLevel pages are built with Nuxt, whose reactivity system can
 * re-render components in response to user interaction or state changes, tearing
 * down and recreating the underlying DOM nodes even when nothing about the visible
 * page appears to have changed. A direct element reference captured before one of
 * these re-renders can end up pointing at a node that has since been detached and
 * replaced. This is the primary motivation behind this reference, but it applies
 * generally to any situation where an element may be removed, replaced, or
 * temporarily detached from the DOM for reasons outside this library's control.
 * 
 * This reference is "live" in that sense: rather than holding onto a
 * single element indefinitely, it caches the element it last found but verifies that
 * element is still attached to the DOM before handing it back, transparently
 * re-querying when it isn't.
 *
 * @typeParam T - The underlying HTML element type
 * 
 * @public
 * @since 1.1.0
 */
export abstract class HighLevelLiveRef<T extends HTMLElement> extends EventTarget {
    /**
     * @since 1.1.0
     */
    public override addEventListener<K extends keyof HighLevelLiveRefEventMap<T> & string>(type: K, listener: (this: this, ev: HighLevelLiveRefEventMap<T>[K]) => any, options?: boolean | AddEventListenerOptions): void;
    public override addEventListener<K extends keyof HighLevelLiveRefEventMap<T> & string>(type: K, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void;
    public override addEventListener<K extends keyof HighLevelLiveRefEventMap<T> & string>(type: K, listener: ((...args: any[]) => any) | EventListenerObject | null, options?: boolean | AddEventListenerOptions): void {
        super.addEventListener(type, listener, options);
    }

    /**
     * @since 1.1.0
     */
    public override removeEventListener<K extends keyof HighLevelLiveRefEventMap<T> & string>(type: K, listener: (this: this, ev: HighLevelLiveRefEventMap<T>[K]) => any, options?: boolean | EventListenerOptions): void;
    public override removeEventListener<K extends keyof HighLevelLiveRefEventMap<T> & string>(type: K, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions): void;
    public override removeEventListener<K extends keyof HighLevelLiveRefEventMap<T> & string>(type: K, listener: ((...args: any[]) => any) | EventListenerObject | null, options?: boolean | EventListenerOptions): void {
        super.removeEventListener(type, listener, options);
    }

    /**
     * @since 1.1.0
     */
    public override dispatchEvent<K extends keyof HighLevelLiveRefEventMap<T> & string>(event: HighLevelLiveRefEventMap<T>[K]): boolean {
        return super.dispatchEvent(event);
    }

    /**
     * Retrieves the current element referenced by this live reference. If a
     * previously found element is still attached to the DOM, it is returned as-is,
     * otherwise the DOM is re-queried automatically to locate the element's
     * replacement.
     *
     * @returns The current element
     * @throws GHLElementsError If the element cannot be found in the DOM
     * @since 1.1.0
     */
    abstract get current(): T;

    /**
     * Attempts to retrieve the current element referenced by this live reference,
     * applying the same caching and re-query behavior as {@link HighLevelLiveRef.current}.
     *
     * @returns The current element, or `null` if the element cannot be found in the DOM
     * @since 1.1.0
     */
    abstract tryCurrent(): T | null;

    /**
     * Unconditionally re-queries the DOM for the element matching this reference's
     * selector, discarding any previously cached element regardless of whether it is
     * still attached to the DOM. Use this to force a fresh lookup rather than relying
     * on the automatic staleness check performed by {@link HighLevelLiveRef.current} and
     * {@link HighLevelLiveRef.tryCurrent}.
     *
     * @returns The refreshed element reference
     * @throws GHLElementsError If the element cannot be found in the DOM
     * @since 1.1.0
     */
    abstract refresh(): T;
}

/**
 * Event map for events a {@link HighLevelLiveRef} can dispatch.
 *
 * @public
 * @since 1.1.0
 */
export interface HighLevelLiveRefEventMap<T extends HTMLElement> {
    /**
     * Dispatched whenever a {@link HighLevelLiveRef} locates a new element,
     * whether triggered explicitly or automatically by {@link HighLevelLiveRef.current}
     * after detecting the previously held element is no longer attached to the DOM.
     * 
     * @since 1.1.0
     */
    'refresh': CustomEvent<HighLevelLiveRefRefreshDetails<T>>;

    /**
     * Dispatched whenever a {@link HighLevelLiveRef} detects that its previously held
     * element is no longer attached to the DOM and no replacement element can be
     * located, whether the element was removed outright or garbage collected. Unlike
     * {@link HighLevelLiveRefEventMap.refresh}, this does not mean a new element was found, only that the
     * reference to the old one has been lost.
     * 
     * @since 1.1.0
     */
    'deref': CustomEvent<HighLevelLiveRefDerefDetails<T>>;
}

/**
 * Details included in a `refresh` event fired on {@link HighLevelLiveRefEventMap}.
 *
 * @public
 * @since 1.1.0
 */
export interface HighLevelLiveRefRefreshDetails<T extends HTMLElement> {
    /**
     * The newly located element.
     * 
     * @since 1.1.0
     */
    current: T;

    /**
     * The previously referenced element, or `null` if this reference has not
     * resolved an element before.
     * 
     * @since 1.1.0
     */
    previous: T | null;
}

/**
 * Details included in a `deref` event fired on {@link HighLevelLiveRefEventMap}.
 *
 * @public
 * @since 1.1.0
 */
export interface HighLevelLiveRefDerefDetails<T extends HTMLElement> {
    /**
     * The element that was previously referenced before the reference was lost, or
     * `null` if the element was garbage collected and can no longer be referenced
     * directly.
     *
     * @since 1.1.0
     */
    previous: T | null;
}
