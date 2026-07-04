import { HighLevelLiveRef } from "./high-level-live-ref";
import { KeyboardAccessibleElement, KeyboardEventMap } from "./keyboard-accessible-element";
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
 * @since 1.0.0
 */
export abstract class OrderBump extends KeyboardAccessibleElement<HTMLElement, OrderBumpEventMap> {
    /**
     * Programmatically selects the order bump, as if the customer checked it.
     * 
     * Fires the `select` event on this element.
     * @since 1.0.0
     */
    abstract select(): void;

    /**
     * Programmatically deselects the order bump, as if the customer unchecked it.
     * 
     * Fires the `deselect` event on this element.
     * @since 1.0.0
     */
    abstract deselect(): void;

    /**
     * Whether the order bump is currently selected.
     * @since 1.0.0
     */
    abstract isSelected(): boolean;

    /**
     * A live reference to the order bump checkbox.
     *
     * @returns A live reference to the order bump checkbox
     * @since 1.1.0
     */
    abstract get checkboxRef(): HighLevelLiveRef<HTMLInputElement>;
}

/**
 * Details included in selection events fired on {@link OrderBump}.
 *
 * @see {@link OrderBumpEventMap}
 * @public
 * @since 1.0.0
 */
export interface OrderBumpSelectionDetails {
    /**
     * The order form that contains the order bump.
     * @since 1.0.0
     */
    orderForm: OrderForm;
}

/**
 * Event map for order bump-specific events.
 * @public
 * @since 1.0.0
 */
export interface OrderBumpEventMap extends KeyboardEventMap {
    /**
     * Fired when the order bump is selected.
     * @since 1.0.0
     */
    'select': CustomEvent<OrderBumpSelectionDetails>;
    /**
     * Fired when the order bump is deselected.
     * @since 1.0.0
     */
    'deselect': CustomEvent<OrderBumpSelectionDetails>;
}