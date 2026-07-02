import { HighLevelElement } from "./high-level-element";

/**
 * A {@link HighLevelElement} that supports toggling keyboard accessibility behavior
 * added by this library.
 *
 * By default, keyboard accessibility is enabled. Set {@link KeyboardAccessibleElement.keyboardAccessible}
 * to `false` to disable it if the default behavior conflicts with your own keyboard handling.
 *
 * @public
 * @since 1.1.0
 */
export abstract class KeyboardAccessibleElement<T extends HTMLElement, M extends KeyboardEventMap> extends HighLevelElement<T, M> {
    /**
     * Whether keyboard accessibility behavior added by this library is active for this element.
     *
     * When `true`, the element responds to keyboard interactions provided by this library.
     * When `false`, those interactions are suppressed. Your own keyboard handling is unaffected
     * either way.
     *
     * Defaults to `true`.
     *
     * @example
     * ```typescript
     * // Disable keyboard accessibility on a specific accordion
     * const faqChild = hldocument.getElementById('faq-sR-MbONj3oUV-child-2', Accordion);
     * if (faqChild && faqChild.keyboardAccessible) {
     *     faqChild.keyboardAccessible = false;
     * }
     * ```
     * @since 1.1.0
     */
    abstract get keyboardAccessible(): boolean;

    /**
     * @since 1.1.0
     */
    abstract set keyboardAccessible(value: boolean);
}

/**
 * Event map for keyboard-specific events on a {@link KeyboardAccessibleElement}.
 * @public
 * @since 1.1.0
 */
export interface KeyboardEventMap {
    /**
     * Fired when a keyboard interaction is handled by this library.
     * @since 1.1.0
     */
    'keyboardaction': CustomEvent<KeyboardActionDetails>;
}

/**
 * Details included in keyboard interaction events fired on {@link KeyboardAccessibleElement}.
 *
 * @see {@link KeyboardEventMap}
 * @public
 * @since 1.1.0
 */
export interface KeyboardActionDetails {
    /**
     * The original keyboard event that triggered the interaction.
     * @since 1.1.0
     */
    cause: KeyboardEvent;
}