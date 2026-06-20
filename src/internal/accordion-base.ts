import { Accordion } from "../api/accordion";
import { Mountable } from "./mountable";

export abstract class AccordionBase extends Accordion implements Mountable {
    protected constructor(protected readonly element: HTMLDivElement) {
        super();
    }

    public mount() {
        this.domElement.addEventListener('keydown', this.handleKeydown.bind(this));
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

    public open(): void {
        this.openFromCause();
    }

    public close(): void {
        this.closeFromCause();
    }

    public toggle(): void {
        this.toggleFromCause();
    }

    public get domElement(): HTMLDivElement {
        return this.element;
    }

    protected abstract openFromCause(cause?: UIEvent): void;
    protected abstract closeFromCause(cause?: UIEvent): void;
    protected abstract toggleFromCause(cause?: UIEvent): void;
}