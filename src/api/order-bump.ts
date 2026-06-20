import { HighLevelElement } from "./high-level-element";
import { OrderForm } from "./order-form";

/**
 * Represents a HighLevel order bump, an optional add-on offer displayed within an order form,
 * allowing customers to add an additional product or service to their order.
 *
 * Order bumps are registered automatically upon creation of their parent {@link OrderForm} and
 * can be retrieved either directly through `hldocument` or through their parent form.
 *
 * **Retrieving order bumps directly:** Order bumps do not have native IDs in HighLevel's DOM. 
 * This library assigns them automatically using the format `{orderFormId}-bump-{index}`, where `index` is one-based.
 *
 * **Retrieving order bumps through an order form:**
 * Use {@link OrderForm.orderBumps} to get all bumps belonging to a specific form.
 *
 * @example
 * ```typescript
 * // Selecting all order bumps across all order forms
 * const bumps = hldocument.getElementsByType(OrderBump);
 * for (const bump of bumps) {
 *     bump.select();
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Retrieve a specific order bump by its generated ID (one-based index)
 * const bump = hldocument.getElementById('one-step-order-IjosAGseXl-bump-1', OrderBump);
 * bump?.select();
 * ```
 *
 * @example
 * ```typescript
 * // Retrieve order bumps from a specific order form
 * const form = hldocument.getElementById('one-step-order-IjosAGseXl', OrderForm);
 * for (const bump of form?.orderBumps ?? []) {
 *     bump.select();
 * }
 * ```
 * @public
 */
export abstract class OrderBump extends HighLevelElement<HTMLElement, OrderBumpEventMap> {
    /**
     * Programmatically selects the order bump, as if the customer checked it.
     * 
     * Fires the `select` event on this element.
     */
    abstract select(): void;

    /**
     * Programmatically deselects the order bump, as if the customer unchecked it.
     * 
     * Fires the `deselect` event on this element.
     */
    abstract deselect(): void;

    /**
     * Whether the order bump is currently selected.
     */
    abstract isSelected(): boolean;
}

/**
 * Details included in selection events fired on {@link OrderBump}.
 *
 * @see {@link OrderBumpEventMap}
 * @public
 */
export interface OrderBumpSelectionDetails {
    /** The order form that contains the order bump. */
    orderForm: OrderForm;
}

/**
 * Event map for order bump-specific events.
 * @public
 */
export interface OrderBumpEventMap {
    /** Fired when the order bump is selected. */
    'select': CustomEvent<OrderBumpSelectionDetails>;
    /** Fired when the order bump is deselected. */
    'deselect': CustomEvent<OrderBumpSelectionDetails>;
}