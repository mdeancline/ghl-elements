import CustomAccordion from "./custom-accordion";
import HighLevelDocumentImpl from "./high-level-document-impl";

export default class FAQAccordionImpl extends CustomAccordion {
    private static readonly CHILD_PANEL_SELECTOR: string = '.hl-faq-child-panel';

    public constructor(hldocument: HighLevelDocumentImpl, element: HTMLDivElement, trigger: HTMLElement) {
        super(hldocument, element, trigger);

        const childPanel = element.querySelector(FAQAccordionImpl.CHILD_PANEL_SELECTOR) as HTMLElement;
        const childParent = childPanel.parentElement as HTMLElement;
        const childIndex = Array.prototype.indexOf.call(childParent.children, childPanel);
        childPanel.id = `${childParent.id}-child-${childIndex}`;
    }

    public override open(cause?: UIEvent): void {
        if (this.isActive) return;
        this.performAction('open', cause);
    }

    public override close(cause?: UIEvent): void {
        if (!this.isActive) return;
        this.performAction('close', cause);
    }

    private performAction(action: string, cause?: UIEvent): void {
        if (!cause) {
            this.trigger.dispatchEvent(new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window,
            }));
        }

        this.dispatch(action, cause);
    }
}