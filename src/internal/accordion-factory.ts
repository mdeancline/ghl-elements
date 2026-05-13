import { assert } from "ts-essentials";
import { AccordionEventMap } from "../elements/accordion";
import AccordionImpl from "./accordion-impl";
import HighLevelElementFactory from "./high-level-element-factory";

export type AccordionFactoryStrategy<E extends HTMLDivElement, T extends HTMLElement> = (element: E, trigger: T) => AccordionImpl;

export default class AccordionFactory<E extends HTMLDivElement, T extends HTMLElement> implements HighLevelElementFactory<HTMLDivElement, AccordionEventMap, AccordionImpl> {
    public constructor(
        public readonly selector: string,
        private readonly triggerSelector: string,
        private readonly strategy: AccordionFactoryStrategy<E, T>
    ) { }

    public create(accordionElement: HTMLDivElement): AccordionImpl {
        const triggerElement = accordionElement.querySelector<T>(this.triggerSelector);
        assert(triggerElement, 'Accordion trigger not found');
        return this.strategy(accordionElement as E, triggerElement);
    }
}