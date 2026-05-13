import HighLevelDocumentImpl from "./high-level-document-impl";
import HighLevelElementFactory from "./high-level-element-factory";
import OrderFormImpl from "./order-form-impl";

export default class OrderFormFactory implements HighLevelElementFactory<HTMLDivElement, HTMLElementEventMap, OrderFormImpl> {
    public constructor(private readonly hldocument: HighLevelDocumentImpl) { }

    public create(htmlElement: HTMLDivElement): OrderFormImpl {
        return new OrderFormImpl(this.hldocument, htmlElement);
    }

    public get selector(): string {
        return OrderFormImpl.SELECTOR;
    }
}