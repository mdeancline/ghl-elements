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
 */
export abstract class Accordion extends KeyboardAccessibleElement<HTMLDivElement, AccordionEventMap> {
    /**
     * Opens the accordion. Has no effect if the accordion is already open.
     * 
     * Fires the `open` event on this element.
     */
    abstract open(): void;

    /**
     * Closes the accordion.
     * 
     * Has no effect if the accordion is already closed.
     * Fires the `close` event on this element.
     */
    abstract close(): void;

    /**
     * Toggles the accordion between open and closed states.
     * 
     * Opens if currently closed, closes if currently open.
     */
    abstract toggle(): void;

    /**
     * Whether the accordion is currently open.
     */
    abstract isActive(): boolean;
}

/**
 * Details included in interaction events fired on {@link Accordion}.
 *
 * @see {@link AccordionEventMap}
 * @public
 */
export interface AccordionInteractionDetails {
    /** The UI event that triggered the interaction, if initiated by the user. Absent if triggered programmatically. */
    cause?: UIEvent;
}

/**
 * Event map for accordion-specific events.
 * @public
 */
export interface AccordionEventMap extends KeyboardEventMap {
    /** Fired when the accordion opens. */
    'open': CustomEvent<AccordionInteractionDetails>;
    /** Fired when the accordion closes. */
    'close': CustomEvent<AccordionInteractionDetails>;
}