import { KeyboardAccessibleElement, KeyboardEventMap } from "./keyboard-accessible-element";

/**
 * Represents a HighLevel accordion element, custom or provided by HighLevel, with open/close toggle behavior.
 * 
 * Two accordion types are supported:
 * - **Custom accordions:** elements with the `.accordion` class, registered automatically by `hldocument`
 * - **FAQ accordions:** HighLevel FAQ child elements with the `.hl-faq-child` class, registered automatically by `hldocument`
 * 
 * **Retrieving a custom accordion:**
 * Pass the element's DOM ID directly.
 * 
 * **Retrieving an FAQ child accordion:**
 * FAQ children do not have IDs in HighLevel's DOM. This library assigns them
 * automatically using the format `{faqElementId}-child-{index}`, where `index` is one-based.
 * 
 * @example
 * ```typescript
 * // Custom accordion
 * const accordion = hldocument.getElementById('my-custom-accordion', Accordion);
 * accordion?.open();
 * ```
 * 
 * @example
 * ```typescript
 * // FAQ child accordion (second child, one-based index)
 * const faqChild = hldocument.getElementById('faq-sR-MbONj3oUV-child-2', Accordion);
 * faqChild?.open();
 * ```
 * 
 * @example
 * ```typescript
 * // All accordions
 * const accordions = hldocument.getElementsByType(Accordion);
 * accordions.forEach(a => a.close());
 * ```
 * @public
 * @since 1.0.0
 */
export abstract class Accordion extends KeyboardAccessibleElement<HTMLDivElement, AccordionEventMap> {
    /**
     * Opens the accordion. Has no effect if the accordion is already open.
     * 
     * Fires the `open` event on this element.
     * @since 1.0.0
     */
    abstract open(): void;

    /**
     * Closes the accordion.
     * 
     * Has no effect if the accordion is already closed.
     * Fires the `close` event on this element.
     * @since 1.0.0
     */
    abstract close(): void;

    /**
     * Toggles the accordion between open and closed states.
     * 
     * Opens if currently closed, closes if currently open.
     * @since 1.0.0
     */
    abstract toggle(): void;

    /**
     * Whether the accordion is currently open.
     * @since 1.0.0
     */
    abstract isActive(): boolean;
}

/**
 * Details included in interaction events fired on {@link Accordion}.
 *
 * @see {@link AccordionEventMap}
 * @public
 * @since 1.0.0
 */
export interface AccordionInteractionDetails {
    /**
     * The UI event that triggered the interaction, if initiated by the user. Absent if triggered programmatically.
     * @since 1.0.0
     */
    cause?: UIEvent;
}

/**
 * Event map for accordion-specific events.
 * @public
 * @since 1.0.0
 */
export interface AccordionEventMap extends KeyboardEventMap {
    /**
     * Fired when the accordion opens.
     * @since 1.0.0
     */
    'open': CustomEvent<AccordionInteractionDetails>;
    /**
     * Fired when the accordion closes.
     * @since 1.0.0
     */
    'close': CustomEvent<AccordionInteractionDetails>;
}