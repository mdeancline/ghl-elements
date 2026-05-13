import HighLevelElement from "./high-level-element";

/**
 * Represents a HighLevel accordion element, custom or provided by HighLevel, with open/close toggle behavior.
 * 
 * **Note:** If the accordion is an FAQ child, the format for retrieving that specific child with this
 * library is as follows: <i>[FAQ element id]-child-[index]</i>
 * 
 * @example
 * const accordion = hldocument.getElementById('my-custom-accordion', Accordion);
 * accordion.open();
 * 
 * // for an FAQ child
 * const faqChild = hldocument.getElementById('faq-sR-MbONj3oUV-child-1', Accordion);
 * faqChild.open();
 */
export default interface Accordion extends HighLevelElement<HTMLDivElement, AccordionEventMap> {
    /**
     * Opens the accordion.
     */
    open(): void;

    /**
     * Closes the accordion.
     */
    close(): void;

    /**
     * Toggles the accordion between open and closed states.
     */
    toggle(): void;

    /**
     * Whether the accordion is currently open.
     */
    get isActive(): boolean;
}

/**
 * Event map for accordion-specific events.
 */
export interface AccordionEventMap extends HTMLElementEventMap {
    /** Fired when the accordion opens. */
    'open': CustomEvent;
    /** Fired when the accordion closes. */
    'close': CustomEvent;
}