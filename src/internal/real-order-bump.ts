import { Mountable } from "./mountable";
import { OrderBump, OrderBumpEventMap, OrderBumpSelectionDetails } from "../api/order-bump";
import { OrderForm } from "../api/order-form";
import { DynamicElementRef } from "./dom/dynamic-element-ref";

export class RealOrderBump extends OrderBump implements Mountable {
    private readonly checkboxRef: DynamicElementRef<HTMLInputElement>;

    public constructor(private readonly orderForm: OrderForm, private readonly element: HTMLElement) {
        super();
        this.checkboxRef = new DynamicElementRef('input[type="checkbox"]', element);
    }

    public mount(): void {
        const attachListener = (checkbox: HTMLInputElement) => {
            checkbox.addEventListener('change', () => {
                const eventType: keyof OrderBumpEventMap = checkbox.checked ? 'select' : 'deselect';
                const details: OrderBumpSelectionDetails = { orderForm: this.orderForm };
                this.dispatchEvent(new CustomEvent(eventType, { detail: details }));
            });
        };

        attachListener(this.checkboxRef.deref());
        this.checkboxRef.onReref(attachListener);
    }

    public select(): void {
        if (!this.isSelected()) {
            const checkbox = this.checkboxRef.deref();
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change'));
        }
    }

    public deselect(): void {
        if (this.isSelected()) {
            const checkbox = this.checkboxRef.deref();
            checkbox.checked = false;
            checkbox.dispatchEvent(new Event('change'));
        }
    }

    public isSelected(): boolean {
        return this.checkboxRef.deref().checked;
    }

    public get domElement(): HTMLElement {
        return this.element;
    }
}