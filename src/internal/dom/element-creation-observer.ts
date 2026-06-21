import { assert } from "../utils/utils";

export type CreationWatcher<E extends Element> = (element: E) => void;

export class ElementCreationObserver<E extends Element> {
    private readonly mutationObserver: MutationObserver = this.createMutationObserver();
    private readonly currentWatchers = new Map<string, Set<CreationWatcher<E>>>();
    private readonly root: Element;
    private readonly options: MutationObserverInit = {
        childList: true,
        subtree: true
    };
    private observing = false;

    public constructor(root: Element = document.body, options: MutationObserverInit = {}) {
        this.root = root;
        this.options = { ...this.options, ...options };
    }

    public watchSelector<EE extends E>(selector: string, callback: CreationWatcher<EE>): void {
        assert(this.observing, `${this.constructor.name} is not currently observing`);

        let watchers = this.currentWatchers.get(selector);
        if (!watchers) {
            watchers = new Set();
            this.currentWatchers.set(selector, watchers);
        }

        watchers.add(callback as CreationWatcher<E>);
    }

    public watchAll<EE extends E>(callback: CreationWatcher<EE>): void {
        this.watchSelector('*', callback);
    }

    public unwatchSelector(selector: string, callback: CreationWatcher<E> | null = null): void {
        const callbacks = this.currentWatchers.get(selector);
        if (!callbacks) return;

        if (callback) {
            callbacks.delete(callback);

            if (callbacks.size === 0) {
                this.currentWatchers.delete(selector);
            }
        } else {
            this.currentWatchers.delete(selector);
        }
    }

    public unwatchAll(): void {
        this.currentWatchers.clear();
        this.stop();
    }

    public start(): void {
        if (!this.observing) {
            this.mutationObserver.observe(this.root, this.options);
            this.observing = true;
        }
    }

    public stop(): void {
        if (this.observing) {
            this.mutationObserver.disconnect();
            this.observing = false;
        }
    }

    public get isObserving(): boolean {
        return this.observing;
    }

    public isWatching(selector: string): boolean {
        return this.currentWatchers.has(selector);
    }

    public get watchers(): Iterable<[string, Set<CreationWatcher<E>>]> {
        return this.currentWatchers.entries();
    }

    private createMutationObserver(): MutationObserver {
        const processedElements = new WeakSet<Element>();

        return new MutationObserver((mutations: MutationRecord[]): void => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== 1) continue;

                    const element = node as E;

                    this.checkElement(element, processedElements);
                    this.checkChildren(element, processedElements);
                }
            }
        });
    }

    private checkElement(element: E, processedElements: WeakSet<Element>): void {
        if (processedElements.has(element)) return;

        for (const [selector, callbacks] of this.currentWatchers) {
            try {
                if (!element.matches(selector)) continue;

                processedElements.add(element);

                for (const callback of callbacks) {
                    try {
                        callback(element);
                    } catch (error) {
                        console.error(`Error in callback for selector "${selector}":`, error);
                    }
                }
            } catch (error) {
                console.error(`Invalid selector "${selector}":`, error);
            }
        }
    }

    private checkChildren(parent: Element, processedElements: WeakSet<Element>): void {
        for (const [selector, callbacks] of this.currentWatchers) {
            try {
                const matchingChildren = parent.querySelectorAll<E>(selector);

                for (const child of matchingChildren) {
                    if (processedElements.has(child)) continue;

                    processedElements.add(child);

                    for (const callback of callbacks) {
                        try {
                            callback(child);
                        } catch (error) {
                            console.error(`Error in callback for selector "${selector}":`, error);
                        }
                    }
                }
            } catch (error) {
                console.error(`Invalid selector "${selector}":`, error);
            }
        }
    }
}
