import AccordionImpl from "./accordion-impl";
import HighLevelDocumentImpl from "./high-level-document-impl";

export default class CustomAccordion extends AccordionImpl {
    protected readonly trigger: HTMLElement;

    public constructor(private readonly hldocument: HighLevelDocumentImpl, element: HTMLDivElement, trigger: HTMLElement) {
        super(element);
        this.trigger = trigger;
    }

    public get isActive(): boolean {
        return this.element.classList.contains('active');
    }

    public open(cause?: UIEvent): void {
        if (this.isActive) return;
        this.element.classList.add('active');
        this.dispatch('open', cause);
    }

    public close(cause?: UIEvent): void {
        if (!this.isActive) return;
        this.element.classList.remove('active');
        this.dispatch('close', cause);
    }

    public toggle(cause?: UIEvent): void {
        this.isActive ? this.close(cause) : this.open(cause);
    }

    protected dispatch(action: string, cause?: UIEvent): void {
        const initDict = {
            bubbles: true,
            detail: {
                accordion: this,
                ...(cause && { cause })
            }
        }

        this.dispatchEvent(new CustomEvent(action, initDict));
        this.hldocument.dispatchEvent(new CustomEvent(`accordion${action}`, initDict));
    }

    public mount(): void {
        this.element.setAttribute('tabindex', '0');

        if (this.trigger.tagName === 'BUTTON') {
            this.trigger.setAttribute('tabindex', '-1');
        }

        this.trigger.addEventListener('click', this.toggle.bind(this));
    }
}
