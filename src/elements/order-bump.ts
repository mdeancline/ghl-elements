import HighLevelElement from "./high-level-element";

/**
 * Represents a HighLevel order bump, an add-on offer, displayed within an order form.
 * 
 * @example
 * const bumps = hldocument.getElementsByType(OrderBump);
 * for (const bump of bumps) {
 *     bump.badgeLabel = 'LIMITED TIME OFFER';
 * }
 * // or
 * const form = hldocument.getElementById('one-step-order-IjosAGseXl', OrderForm);
 * for (const bump of form.orderBumps) {
 *     bump.badgeLabel = 'LIMITED TIME OFFER';
 * }
 */
export default abstract class OrderBump extends HighLevelElement<HTMLElement, OrderBumpEventMap> {
    /**
     * Programmatically selects the order bump, as if the customer checked it.
     */
    abstract select(): void;

    /**
     * Programmatically deselects the order bump, as if the customer unchecked it.
     */
    abstract deselect(): void;

    /**
     * Sets the badge label displayed above the order bump.
     * 
     * @example
     * bump.badgeLabel = 'LIMITED TIME OFFER';
     */
    abstract set badgeLabel(label: string);

    /**
     * The bump's header element containing the checkbox, arrow, and headline.
     */
    abstract get header(): HTMLDivElement;

    /**
     * The one-time offer headline element.
     */
    abstract get headline(): HTMLSpanElement;

    /**
     * The bump's description element.
     */
    abstract get description(): HTMLSpanElement;
}

/**
 * Event map for order bump-specific events.
 */
export interface OrderBumpEventMap extends HTMLElementEventMap {
    /** Fired when the order bump is selected. */
    'select': CustomEvent;
    /** Fired when the order bump is deselected. */
    'deselect': CustomEvent;
}