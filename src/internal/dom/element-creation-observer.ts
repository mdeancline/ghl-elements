import { assert } from "ts-essentials";

export type CreationWatcher<E extends Element> = (element: E) => void;

export default class ElementCreationObserver<E extends Element> {
    private readonly mutationObserver: MutationObserver = this.createMutationObserver();
    private readonly currentWatchers: Map<string, Set<CreationWatcher<E>>> = new Map();
    private readonly root: Element;
    private readonly options: MutationObserverInit = {
        childList: true,
        subtree: true
    };
    private observing: boolean = false;

    public constructor(root: Element = document.body, options: MutationObserverInit = {}) {
        this.root = root;
        this.options = { ...this.options, ...options };
    }

    public watchSelector(selector: string, callback: CreationWatcher<E>): void {
        assert(this.observing, `${this.constructor.name} is not currently observing`);

        if (!this.currentWatchers.has(selector)) {
            this.currentWatchers.set(selector, new Set());
        }

        this.currentWatchers.get(selector)!.add(callback);
    }

    public watchAll(callback: CreationWatcher<E>): void {
        this.watchSelector('*', callback);
    }

    public unwatchSelector(selector: string, callback: CreationWatcher<E> | null = null): void {
        if (!this.currentWatchers.has(selector)) return;

        if (callback) {
            const callbacks = this.currentWatchers.get(selector)!;
            callbacks.delete(callback);

            if (callbacks.size === 0) {
                this.currentWatchers.delete(selector);
            }
        } else {
            this.currentWatchers.delete(selector);
        }

        if (this.currentWatchers.size === 0) {
            this.stop();
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
