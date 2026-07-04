import { Accordion } from "../api/accordion";
import { HighLevelLiveRef } from "../api/high-level-live-ref";
import { Mountable } from "./mountable";
import { emptyIterable } from "./utils/utils";

// BUG RangeError for maximum call stack size exceeded is thrown upon manual and programmatic open/close/toggle
export abstract class AccordionBase extends Accordion implements Mountable {
    private readonly keydownListener: (this: HTMLDivElement, ev: HTMLElementEventMap['keydown']) => any = this.handleKeydown.bind(this);
    private _keyboardAccessible = true;

    protected constructor(protected readonly element: HTMLDivElement) {
        super();
    }

    public mount() {
        if (this.keyboardAccessible) {
            this.domElement.addEventListener('keydown', this.keydownListener);
        }
    }

    private handleKeydown(event: KeyboardEvent): void {
        switch (event.key) {
            case 'Enter':
            case ' ': {
                const dispatched = new CustomEvent('keyboardaction', { bubbles: true, detail: { cause: event } });
                event.preventDefault();
                this.toggle();
                this.dispatchEvent(dispatched);
                break;
            }
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

    public get keyboardAccessible(): boolean {
        return this._keyboardAccessible;
    }

    public set keyboardAccessible(value: boolean) {
        if (value) {
            this.domElement.addEventListener('keydown', this.keydownListener);
        } else {
            this.domElement.removeEventListener('keydown', this.keydownListener);
        }

        this._keyboardAccessible = value;
    }

    public get domElement(): HTMLDivElement {
        return this.element;
    }

    public get liveRefs(): Iterable<HighLevelLiveRef<HTMLElement>> {
        return emptyIterable();
    }

    protected abstract openFromCause(cause?: UIEvent): void;
    protected abstract closeFromCause(cause?: UIEvent): void;
    protected abstract toggleFromCause(cause?: UIEvent): void;
}