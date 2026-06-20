import { HighLevelElement } from "../api/high-level-element";

export interface HighLevelElementFactory<E extends HTMLElement, M extends Record<keyof M, M[keyof M]>, T extends HighLevelElement<E, M>> {
    create(htmlElement: E): T;
    get selector(): string;
}