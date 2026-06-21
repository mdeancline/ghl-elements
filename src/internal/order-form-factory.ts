import { HighLevelDocument } from "../api/high-level-document";
import { HighLevelElementFactory } from "./high-level-element-factory";
import { Mounter } from "./mounter";
import { RealOrderForm } from "./real-order-form";
import { StripeRegistry } from "./stripe/stripe-elements-registry";

export class OrderFormFactory implements HighLevelElementFactory<HTMLDivElement, Record<string, CustomEvent>, RealOrderForm> {
    public constructor(
        private readonly hldocument: HighLevelDocument & Mounter,
        private readonly stripeRegistry: StripeRegistry
    ) { }

    public create(htmlElement: HTMLDivElement): RealOrderForm {
        return new RealOrderForm(this.hldocument, htmlElement, this.stripeRegistry);
    }

    public get selector(): string {
        return RealOrderForm.SELECTOR;
    }
}