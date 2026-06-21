import { AccordionEventMap } from "../api/accordion";
import { StandardAccordion } from "./standard-accordion";

export class FAQAccordion extends StandardAccordion {
    private static readonly CHILD_PANEL_SELECTOR: string = '.hl-faq-child-panel';

    public constructor(element: HTMLDivElement, trigger: HTMLElement) {
        super(element, trigger);
    }

    public override mount() {
        const childPanel = this.domElement.querySelector(FAQAccordion.CHILD_PANEL_SELECTOR) as HTMLElement;
        const childParent = childPanel.parentElement as HTMLElement;
        const childIndex = Array.prototype.indexOf.call(childParent.children, childPanel);
        childPanel.id = `${childParent.id}-child-${childIndex + 1}`;
        super.mount();
    }

    private performAction(action: keyof AccordionEventMap & string, cause?: UIEvent): void {
        if (!cause) {
            this.trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        }

        this.dispatchAccordionEvent(action, cause);
    }

    protected override openFromCause(cause?: UIEvent): void {
        if (!this.isActive()) {
            this.performAction('open', cause);
        }
    }

    protected override closeFromCause(cause?: UIEvent): void {
        if (this.isActive()) {
            this.performAction('close', cause);
        }
    }
}