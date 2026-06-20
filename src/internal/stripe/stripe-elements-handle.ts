import { StripeElement, StripeElements, StripeElementType } from "@stripe/stripe-js";
import { Deferred } from "ts-deferred";

export class StripeElementsHandle {
    private deferred: Deferred<StripeElements> | null = null;
    private current: StripeElements | null = null;

    public resolveElements(current: StripeElements): void {
        this.current = current;
        this.deferred?.resolve(current);
    }

    public invalidate(): void {
        this.current = null;
        this.deferred = null;
    }

    public getElement<K extends StripeElementType>(name: K): StripeElement | null {
        if (this.current === null) return null;
        return (this.current.getElement as (type: K) => StripeElement | null)(name) ?? null;
    }

    public getElements(): Promise<StripeElements> {
        if (this.current !== null) return Promise.resolve(this.current);
        if (!this.deferred) this.deferred = new Deferred<StripeElements>();
        return this.deferred.promise;
    }

    public isAvailable(): boolean {
        return this.current !== null;
    }
}