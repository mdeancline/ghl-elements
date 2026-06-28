import { StripeElement, StripeElements, StripeElementType } from "@stripe/stripe-js";
import { OrderForm } from "../../api/order-form";
import { StripeElementsHandle } from "./stripe-elements-handle";

export class StripeRegistry {
    private readonly handles = new WeakMap<HTMLDivElement, StripeElementsHandle>();

    public registerElements(form: OrderForm, container: StripeElements): void {
        this.getElementsHandle(form).resolveElements(container);
    }

    public getElements(form: OrderForm): Promise<StripeElements> {
        return this.getElementsHandle(form).getElements();
    }

    public getElement<K extends StripeElementType>(form: OrderForm, name: K): StripeElement | null {
        return this.getElementsHandle(form).getElement(name);
    }

    private getElementsHandle(form: OrderForm): StripeElementsHandle {
        const domElement = form.domElement;
        const existing = this.handles.get(domElement);
        if (existing) return existing;

        const handle = new StripeElementsHandle();
        this.handles.set(domElement, handle);
        return handle;
    }

    public invalidate(form: OrderForm): void {
        this.handles.get(form.domElement)?.invalidate();
    }

    public hasElementsAvailable(form: OrderForm): boolean {
        const domElement = form.domElement;
        const handle = this.handles.get(domElement);
        return handle !== undefined && handle.isAvailable();
    }
}