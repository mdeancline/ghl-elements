import { Mountable } from "./mountable";
import { OrderBump, OrderBumpEventMap, OrderBumpSelectionDetails } from "../api/order-bump";
import { assert } from "ts-essentials";
import { OrderForm } from "../api/order-form";

export class OrderBumpImpl extends OrderBump implements Mountable {
    private readonly checkboxElement: HTMLInputElement;

    public constructor(private readonly orderForm: OrderForm, private readonly element: HTMLElement) {
        super();
        const checkboxElement = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
        assert(checkboxElement !== null, 'input[type="checkbox"] not found');
        this.checkboxElement = checkboxElement;
    }

    public mount(): void {
        this.checkboxElement.addEventListener('change', () => {
            const eventType: keyof OrderBumpEventMap = this.checkboxElement.checked ? 'select' : 'deselect';
            const details: OrderBumpSelectionDetails = { orderForm: this.orderForm };
            const event = new CustomEvent(eventType, { detail: details });
            this.dispatchEvent(event);
        });
    }

    public select(): void {
        this.checkboxElement.checked = true;
        this.checkboxElement.dispatchEvent(new Event('change'));
    }

    public deselect(): void {
        this.checkboxElement.checked = false;
        this.checkboxElement.dispatchEvent(new Event('change'));
    }

    public isSelected(): boolean {
        return this.checkboxElement.checked;
    }

    public get domElement(): HTMLElement {
        return this.element;
    }
}