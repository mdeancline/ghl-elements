import { Stripe } from '@stripe/stripe-js';
import { ScriptWatcher } from '../utils/script-watcher';

export type StripeInstanceCallback = (stripe: Stripe) => Stripe;

export class StripeInterceptor implements ScriptWatcher {
    private static readonly BASE_SRC: string = 'https://js.stripe.com';
    private static readonly API_ENTRY_FUNC_NAME = 'Stripe';
    private static readonly API_VERSION = 'v3';

    public constructor(
        private readonly callback: StripeInstanceCallback
    ) { }

    public receive(script: HTMLScriptElement): void {
        if (!script.src.includes(StripeInterceptor.API_VERSION)) {
            console.warn(`Stripe JS version mismatch: expected ${StripeInterceptor.API_VERSION}, got ${script.src}`);
        }

        Object.defineProperty(window, StripeInterceptor.API_ENTRY_FUNC_NAME, {
            configurable: true,
            set: (value: unknown) => {
                Object.defineProperty(window, StripeInterceptor.API_ENTRY_FUNC_NAME, {
                    configurable: true,
                    writable: true,
                    value: new Proxy(value as (...args: unknown[]) => Stripe, {
                        apply: (target, thisArg, args): Stripe => {
                            const instance = Reflect.apply(target, thisArg, args) as Stripe;
                            return this.callback(instance);
                        },
                    }),
                });
            },
        });
    }

    get baseSrc(): string {
        return StripeInterceptor.BASE_SRC;
    }
}