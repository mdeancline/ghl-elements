import { AccordionEventMap, AccordionInteractionDetails } from "../api/accordion";
import { AccordionBase } from "./accordion-base";

export class StandardAccordion extends AccordionBase {
    protected readonly trigger: HTMLElement;

    public constructor(element: HTMLDivElement, trigger: HTMLElement) {
        super(element);
        this.trigger = trigger;
    }

    public isActive(): boolean {
        return this.element.classList.contains('active');
    }

    protected openFromCause(cause?: UIEvent): void {
        if (!this.isActive()) {
            this.element.classList.add('active');
            this.dispatchAccordionEvent('open', cause);
        }
    }

    protected closeFromCause(cause?: UIEvent): void {
        if (this.isActive()) {
            this.element.classList.remove('active');
            this.dispatchAccordionEvent('close', cause);
        }
    }

    protected dispatchAccordionEvent(action: keyof AccordionEventMap & string, cause?: UIEvent): void {
        const details: AccordionInteractionDetails = { ...(cause && { cause }) };
        const event = new CustomEvent(action, { bubbles: true, detail: details });
        this.dispatchEvent(event);
    }

    public override mount(): void {
        this.element.setAttribute('tabindex', '0');

        if (this.trigger.tagName === 'BUTTON') {
            this.trigger.setAttribute('tabindex', '-1');
        }

        this.trigger.addEventListener('click', this.toggle.bind(this));
        super.mount();
    }

    protected override toggleFromCause(cause?: UIEvent): void {
        if (this.isActive()) {
            this.closeFromCause(cause);
        } else {
            this.openFromCause(cause);
        }
    }
}
