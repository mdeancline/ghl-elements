import HighLevelElement from "./high-level-element";
import OrderForm from "./order-form";

/**
 * Represents a HighLevel order bump, an optional add-on offer displayed within an order form,
 * allowing customers to add an additional product or service to their order.
 *
 * Order bumps are registered automatically by `hldocument` and can be retrieved either
 * directly or through their parent {@link OrderForm}.
 *
 * **Retrieving order bumps directly:** Order bumps do not have IDs in HighLevel's DOM. 
 * This library assigns them automatically using the format: `{orderFormId}-bump-{index}`, where `index` is one-based.
 *
 * **Retrieving order bumps through an order form:**
 * Use {@link OrderForm.orderBumps} to get all bumps belonging to a specific form.
 *
 * @example
 * // Selecting all order bumps across all order forms
 * const bumps = hldocument.getElementsByType(OrderBump);
 * for (const bump of bumps) {
 *     bump.select();
 * }
 *
 * @example
 * // Retrieve a specific order bump by its generated ID (one-based index)
 * const bump = hldocument.getElementById('one-step-order-IjosAGseXl-bump-1', OrderBump);
 * bump?.select();
 *
 * @example
 * // Retrieve order bumps from a specific order form
 * const form = hldocument.getElementById('one-step-order-IjosAGseXl', OrderForm);
 * for (const bump of form?.orderBumps ?? []) {
 *     bump.select();
 * }
 */
export default abstract class OrderBump extends HighLevelElement<HTMLElement, OrderBumpEventMap> {
    /**
     * Programmatically selects the order bump, as if the customer checked it.
     * Fires the `select` event on this element and `orderbumpselect` on `hldocument`.
     */
    abstract select(): void;

    /**
     * Programmatically deselects the order bump, as if the customer unchecked it.
     * Fires the `deselect` event on this element and `orderbumpdeselect` on `hldocument`.
     */
    abstract deselect(): void;

    /**
     * The bump's header element containing the checkbox, flashing arrow, and headline.
     */
    abstract get header(): HTMLDivElement;

    /**
     * The one-time offer headline element displayed within the bump header.
     */
    abstract get headline(): HTMLSpanElement;

    /**
     * The bump's description element displayed below the header.
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