import { StripeElement, StripeElements, StripeElementType } from "@stripe/stripe-js";
import { OrderForm } from "../../api/order-form";
import { StripeElementsHandle } from "./stripe-elements-handle";

export class StripeRegistry {
    private readonly handles: WeakMap<HTMLDivElement, StripeElementsHandle> = new WeakMap;

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
        return this.handles.get(domElement) ?? this.handles.set(domElement, new StripeElementsHandle).get(domElement)!;
    }

    public invalidate(form: OrderForm): void {
        this.handles.delete(form.domElement);
    }

    public hasElementsAvailable(form: OrderForm): boolean {
        const domElement = form.domElement;
        return this.handles.has(domElement) && this.handles.get(domElement)!.isAvailable();
    }
}