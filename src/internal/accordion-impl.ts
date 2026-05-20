import Accordion, { AccordionEventMap } from "../elements/accordion";
import MountingHighLevelElement from "./mounting-high-level-element";

export default abstract class AccordionImpl extends MountingHighLevelElement<HTMLDivElement, AccordionEventMap> implements Accordion {
    protected constructor(protected readonly element: HTMLDivElement) {
        super();
        this.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    private handleKeydown(event: KeyboardEvent): void {
        switch (event.key) {
            case 'Enter':
            case ' ':
                event.preventDefault();
                this.toggle();
                break;
        }
    }

    public get domElement(): HTMLDivElement {
        return this.element;
    }

    public abstract open(cause?: UIEvent): void;
    public abstract close(cause?: UIEvent): void;
    public abstract toggle(cause?: UIEvent): void;
    public abstract get isActive(): boolean;
}