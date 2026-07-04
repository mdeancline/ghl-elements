import { Mountable } from "./mountable";
import { OrderBump, OrderBumpEventMap, OrderBumpSelectionDetails } from "../api/order-bump";
import { OrderForm } from "../api/order-form";
import { RealLiveRef } from "./dom/real-live-ref";
import { HighLevelLiveRef } from "../api/high-level-live-ref";
import { KeyboardActionDetails } from "../api/keyboard-accessible-element";
import { singleIterable } from "./utils/utils";

export class RealOrderBump extends OrderBump implements Mountable {
    private readonly _checkboxRef: RealLiveRef<HTMLInputElement>;

    public constructor(private readonly orderForm: OrderForm, private readonly element: HTMLElement) {
        super();
        this._checkboxRef = new RealLiveRef('input[type="checkbox"]', element);
    }

    public mount(): void {
        const attachListener = (checkbox: HTMLInputElement) => {
            checkbox.addEventListener('change', () => {
                const eventType: keyof OrderBumpEventMap = checkbox.checked ? 'select' : 'deselect';
                const details: OrderBumpSelectionDetails = { orderForm: this.orderForm };
                this.dispatchEvent(new CustomEvent(eventType, { detail: details }));
            });

            checkbox.addEventListener('keydown', (e: KeyboardEvent) => {
                if (e.key !== ' ' && e.key !== 'Enter') return;
                const details: KeyboardActionDetails = { cause: e };
                this.dispatchEvent(new CustomEvent('keyboardaction', { detail: details }));
            });
        };

        this._checkboxRef.addEventListener('refresh', e => attachListener(e.detail.current));
    }

    public select(): void {
        if (!this.isSelected()) {
            const checkbox = this._checkboxRef.current;
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change'));
        }
    }

    public deselect(): void {
        if (this.isSelected()) {
            const checkbox = this._checkboxRef.current;
            checkbox.checked = false;
            checkbox.dispatchEvent(new Event('change'));
        }
    }

    public isSelected(): boolean {
        return this._checkboxRef.current.checked;
    }

    public get checkboxRef(): HighLevelLiveRef<HTMLInputElement> {
        return this._checkboxRef;
    }

    public get keyboardAccessible(): boolean {
        return this.checkboxRef.current.tabIndex >= 0;
    }

    // TODO ensure that this accounts for checkboxRef being refreshed and it not having the same tabindex as the old one
    public set keyboardAccessible(value: boolean) {
        if (value) {
            this.domElement.removeAttribute('tabindex');
        } else {
            this.domElement.setAttribute('tabindex', '-1');
        }
    }

    public get liveRefs(): Iterable<HighLevelLiveRef<HTMLElement>> {
        return singleIterable(this._checkboxRef);
    }

    public get domElement(): HTMLElement {
        return this.element;
    }
}