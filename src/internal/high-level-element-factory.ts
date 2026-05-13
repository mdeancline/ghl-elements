import HighLevelElementImpl from "./high-level-element-impl";

export default interface HighLevelElementFactory<E extends HTMLElement, M extends HTMLElementEventMap, T extends HighLevelElementImpl<E, M>> {
    create(htmlElement: E): T;
    get selector(): string;
}