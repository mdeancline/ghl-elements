import { HighLevelDocument } from "../api/high-level-document";
import { HighLevelElementFactory } from "./high-level-element-factory";
import { Mounter } from "./mounter";
import { OrderFormImpl } from "./order-form-impl";
import { StripeRegistry } from "./stripe/stripe-elements-registry";

export class OrderFormFactory implements HighLevelElementFactory<HTMLDivElement, Record<string, CustomEvent>, OrderFormImpl> {
    public constructor(
        private readonly hldocument: HighLevelDocument & Mounter,
        private readonly stripeRegistry: StripeRegistry
    ) { }

    public create(htmlElement: HTMLDivElement): OrderFormImpl {
        return new OrderFormImpl(this.hldocument, htmlElement, this.stripeRegistry);
    }

    public get selector(): string {
        return OrderFormImpl.SELECTOR;
    }
}