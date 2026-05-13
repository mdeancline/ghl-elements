import HighLevelElementImpl from "./high-level-element-impl";
import OrderBump, { OrderBumpEventMap } from "../elements/order-bump";
import OrderFormImpl from "./order-form-impl";
import HighLevelDocumentImpl from "./high-level-document-impl";
import { assert } from "ts-essentials";

export default class OrderBumpImpl extends HighLevelElementImpl<HTMLElement, OrderBumpEventMap> implements OrderBump {
    private readonly headerElement: HTMLDivElement;
    private readonly otoHeadlineElement: HTMLSpanElement;
    private readonly descriptionElement: HTMLSpanElement;
    private readonly checkboxElement: HTMLInputElement;

    public constructor(private readonly orderForm: OrderFormImpl, private readonly hldocument: HighLevelDocumentImpl, private readonly element: HTMLElement) {
        super();

        const headerElement = element.querySelector('.bump-header') as HTMLDivElement;
        assert(headerElement !== null, '.bump-header not found');
        this.headerElement = headerElement;

        const otoHeadlineElement = headerElement.querySelector('.bump-headline') as HTMLSpanElement;
        assert(otoHeadlineElement !== null, '.bump-headline not found');
        this.otoHeadlineElement = otoHeadlineElement;

        const descriptionElement = element.querySelector('.oto-headline + span') as HTMLSpanElement;
        assert(descriptionElement !== null, '.oto-headline + span not found');
        this.descriptionElement = descriptionElement;

        const checkboxElement = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
        assert(checkboxElement !== null, 'input[type="checkbox"] not found');
        this.checkboxElement = checkboxElement;
    }

    public override mount(): void {
        this.checkboxElement.addEventListener('change', () => {
            const eventType = this.checkboxElement.checked ? 'select' : 'deselect';
            const eventInit = {
                detail: {
                    orderBump: this,
                    orderForm: this.orderForm,
                }
            };

            this.dispatchEvent(new CustomEvent(eventType, eventInit));
            this.hldocument.dispatchEvent(new CustomEvent(`orderbump${eventType}`, eventInit));
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

    public get header(): HTMLDivElement {
        return this.headerElement;
    }

    public get headline(): HTMLSpanElement {
        return this.otoHeadlineElement;
    }

    public get description(): HTMLSpanElement {
        return this.descriptionElement;
    }

    public get domElement(): HTMLElement {
        return this.element;
    }

    public set badgeLabel(label: string) {
        this.element.setAttribute('data-badge-label', label);
    }
}