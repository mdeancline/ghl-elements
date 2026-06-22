import { Mountable } from "./mountable";
import { OrderBump, OrderBumpEventMap, OrderBumpSelectionDetails } from "../api/order-bump";
import { assert } from "./utils/utils";
import { OrderForm } from "../api/order-form";

export class RealOrderBump extends OrderBump implements Mountable {
    private readonly checkboxElement: HTMLInputElement;

    public constructor(private readonly orderForm: OrderForm, private readonly element: HTMLElement) {
        super();
        const checkboxElement = element.querySelector<HTMLInputElement>('input[type="checkbox"]');
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

    // BUG doesn't actually get selected
    public select(): void {
        this.checkboxElement.checked = true;
        this.checkboxElement.dispatchEvent(new Event('change'));
    }

    // BUG doesn't actually get deselected
    public deselect(): void {
        this.checkboxElement.checked = false;
        this.checkboxElement.dispatchEvent(new Event('change'));
    }

    // BUG always returns false
    public isSelected(): boolean {
        return this.checkboxElement.checked;
    }

    public get domElement(): HTMLElement {
        return this.element;
    }
}