import { GHLElementsError } from "../../api/ghl-elements-error";

export class DynamicElementRef<T extends Element> {
    private ref: WeakRef<T> | undefined;
    private callback?: (element: T) => void

    public constructor(
        private readonly selector: string,
        private readonly container: ParentNode = document.body
    ) {
        const element = container.querySelector<T>(selector);

        if (element) {
            this.ref = new WeakRef(element);
        }
    }

    public deref(): T {
        const cached = this.ref?.deref();

        if (cached?.isConnected) {
            return cached;
        }

        return this.refresh();
    }

    public refresh(): T {
        const element = this.container.querySelector<T>(this.selector);

        if (!element) {
            throw new GHLElementsError(`Unable to query selector ${this.selector}`);
        }

        this.ref = new WeakRef(element);
        this.callback?.(element);
        return element;
    }

    public tryDeref(): T | null {
        try {
            return this.deref();
        } catch {
            return null;
        }
    }

    public onReref(callback: (element: T) => void) {
        this.callback = callback;
    }
}
