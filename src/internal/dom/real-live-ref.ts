import { GHLElementsError } from "../../api/ghl-elements-error";
import { HighLevelLiveRef, HighLevelLiveRefRefreshDetails, HighLevelLiveRefDerefDetails } from "../../api/high-level-live-ref";

export class RealLiveRef<T extends HTMLElement> extends HighLevelLiveRef<T> {
    private static readonly REGISTRY = new FinalizationRegistry<() => void>(callback => callback());

    private ref: WeakRef<T> | undefined;

    public constructor(
        private readonly selector: string,
        private readonly container: ParentNode
    ) {
        super();
        const element = container.querySelector<T>(selector);

        if (element) {
            this.track(element);
        }
    }

    public get current(): T {
        const cached = this.ref?.deref();

        if (cached?.isConnected) {
            return cached;
        }

        return this.refresh();
    }

    public refresh(): T {
        const previous = this.ref?.deref() ?? null;
        const element = this.container.querySelector<T>(this.selector);

        if (!element) {
            if (previous) {
                const details: HighLevelLiveRefDerefDetails<T> = { previous };
                this.dispatchEvent(new CustomEvent('deref', { detail: details }));
            }

            throw new GHLElementsError(`Unable to query selector ${this.selector}`);
        }

        const details: HighLevelLiveRefRefreshDetails<T> = { current: element, previous };
        this.track(element, previous ?? undefined);
        this.dispatchEvent(new CustomEvent('refresh', { detail: details }));
        return element;
    }

    public tryCurrent(): T | null {
        try {
            return this.current;
        } catch {
            return null;
        }
    }

    private track(element: T, previousElement?: T): void {
        if (previousElement) {
            RealLiveRef.REGISTRY.unregister(previousElement);
        }

        this.ref = new WeakRef(element);

        RealLiveRef.REGISTRY.register(element, () => {
            if (this.ref?.deref() === undefined) {
                const details: HighLevelLiveRefDerefDetails<T> = { previous: null };
                this.dispatchEvent(new CustomEvent('deref', { detail: details }));
            }
        }, element);
    }
}
