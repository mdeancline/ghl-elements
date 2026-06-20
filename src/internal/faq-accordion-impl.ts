import { AccordionEventMap } from "../api/accordion";
import { StandardAccordionImpl } from "./standard-accordion-impl";

export class FAQAccordionImpl extends StandardAccordionImpl {
    private static readonly CHILD_PANEL_SELECTOR: string = '.hl-faq-child-panel';

    public constructor(element: HTMLDivElement, trigger: HTMLElement) {
        super(element, trigger);
    }

    public override mount() {
        const childPanel = this.domElement.querySelector(FAQAccordionImpl.CHILD_PANEL_SELECTOR) as HTMLElement;
        const childParent = childPanel.parentElement as HTMLElement;
        const childIndex = Array.prototype.indexOf.call(childParent.children, childPanel);
        childPanel.id = `${childParent.id}-child-${childIndex + 1}`;
        super.mount();
    }

    public override open(cause?: UIEvent): void {
        if (this.isActive()) return;
        this.performAction('open', cause);
    }

    public override close(cause?: UIEvent): void {
        if (!this.isActive) return;
        this.performAction('close', cause);
    }

    private performAction(action: keyof AccordionEventMap & string, cause?: UIEvent): void {
        if (!cause) {
            this.trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        }

        this.dispatch(action, cause);
    }

    protected override openFromCause(cause?: UIEvent): void {
        if (this.isActive()) return;
        this.performAction('open', cause);
    }

    protected override closeFromCause(cause?: UIEvent): void {
        if (!this.isActive) return;
        this.performAction('close', cause);
    }
}