import { EventTargetBase } from "../internal/utils/event-target-base";

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
export abstract class HighLevelElement<T extends HTMLElement, M extends Record<keyof M, M[keyof M]>> extends EventTargetBase<M> {
    /**
     * The underlying DOM element this wrapper manages.
     */
    abstract get domElement(): T;
}
