import MountingHighLevelElement from "./mounting-high-level-element";

export default interface HighLevelElementFactory<E extends HTMLElement, M extends HTMLElementEventMap, T extends MountingHighLevelElement<E, M>> {
    create(htmlElement: E): T;
    get selector(): string;
}