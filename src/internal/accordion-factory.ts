import { assert } from "./utils/utils";
import { AccordionEventMap } from "../api/accordion";
import { AccordionBase } from "./accordion-base";
import { HighLevelElementFactory } from "./high-level-element-factory";

export type AccordionFactoryStrategy<E extends HTMLDivElement, T extends HTMLElement> = (element: E, trigger: T) => AccordionBase;

export class AccordionFactory<E extends HTMLDivElement, T extends HTMLElement> implements HighLevelElementFactory<HTMLDivElement, AccordionEventMap, AccordionBase> {
    public constructor(
        public readonly selector: string,
        private readonly triggerSelector: string,
        private readonly strategy: AccordionFactoryStrategy<E, T>
    ) { }

    public create(accordionElement: HTMLDivElement): AccordionBase {
        const triggerElement = accordionElement.querySelector<T>(this.triggerSelector);
        assert(triggerElement, 'Accordion trigger not found');
        return this.strategy(accordionElement as E, triggerElement);
    }
}