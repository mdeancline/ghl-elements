import { StripeElements } from '@stripe/stripe-js';
import { StripeElementTypeMap } from '../../elements/order-form';

export default class StripeElementsHandle {
    private static readonly TIMEOUT_MS: number = 10_000;
    private static readonly TIMEOUT_SECONDS: number = StripeElementsHandle.TIMEOUT_MS / 1000;

    private promise: Promise<StripeElements>;
    private resolve!: (elements: StripeElements) => void;
    private reject!: (reason?: Error) => void;
    private current: StripeElements | null = null;

    public constructor() {
        this.promise = this.createPromise();
    }

    private createPromise(): Promise<StripeElements> {
        const promise = new Promise<StripeElements>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });

        setTimeout(() => {
            this.reject(new Error(`Stripe JS failed to load within ${StripeElementsHandle.TIMEOUT_SECONDS} seconds`));
        }, StripeElementsHandle.TIMEOUT_MS);

        return promise;
    }

    public resolveElements(elements: StripeElements): void {
        this.current = elements;
        this.resolve(elements);
    }

    public invalidate(): void {
        this.current = null;
        this.promise = this.createPromise();
    }

    public getElement<K extends keyof StripeElementTypeMap>(name: K): StripeElementTypeMap[K] | undefined {
        if (this.current === null) return undefined;
        return (this.current.getElement as (type: K) => StripeElementTypeMap[K] | null)(name) ?? undefined;
    }

    public getElements(): Promise<StripeElements> {
        return this.promise;
    }
}