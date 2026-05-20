import HighLevelDocument from "../elements/high-level-document";
import MountingHighLevelElement from "./mounting-high-level-element";

export default interface MountingHighLevelDocument extends HighLevelDocument {
    mount<E extends HTMLElement, M extends HTMLElementEventMap, T extends MountingHighLevelElement<E, M>>(element: T): void;
}