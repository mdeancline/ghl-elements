import { assert } from "ts-essentials";

export interface ElementUpdateInfo {
    type: 'attributes' | 'characterData';
    target: Node;
    attributeName?: string;
    oldValue?: string | null;
    newValue?: string | null;
}

export interface WatchOptions {
    attributes?: boolean;
    characterData?: boolean;
    attributeFilter?: string[] | null;
}

export interface WatcherData<E extends Element> {
    callback: UpdateCallback<E>;
    options: Required<WatchOptions>;
}

export type UpdateCallback<E extends Element> = (element: E, info: ElementUpdateInfo) => void;

export default class ElementUpdateObserver<E extends Element> {
    private mutationObserver: MutationObserver = this.createObserver();
    private watchers: Map<string, Set<WatcherData<E>>> = new Map();
    private root: Element;
    private observing: boolean = false;
    private options: MutationObserverInit = {
        attributes: true,
        attributeOldValue: true,
        characterData: true,
        characterDataOldValue: true,
        subtree: true
    };

    public constructor(root: Element = document.body, options: MutationObserverInit = {}) {
        this.root = root;
        this.options = { ...this.options, ...options };
        this.mutationObserver.observe(this.root, this.options);
    }

    public watchSelector(selector: string, callback: UpdateCallback<E>, options: WatchOptions = {}): void {
        assert(this.observing, `${this.constructor.name} is not currently observing`);

        const watchOptions: Required<WatchOptions> = {
            attributes: true,
            characterData: true,
            attributeFilter: null,
            ...options
        };

        if (!this.watchers.has(selector)) {
            this.watchers.set(selector, new Set());
        }

        const watcherData: WatcherData<E> = { callback, options: watchOptions };
        this.watchers.get(selector)!.add(watcherData);

        if (!this.mutationObserver) {
            this.createObserver();
            this.start();
        }
    }

    public unwatchSelector(selector: string, callback: UpdateCallback<E> | null = null): void {
        if (!this.watchers.has(selector)) return;

        if (callback) {
            const watchers: Set<WatcherData<E>> = this.watchers.get(selector)!;

            for (const watcher of watchers) {
                if (watcher.callback === callback) {
                    watchers.delete(watcher);
                    break;
                }
            }

            if (watchers.size === 0) {
                this.watchers.delete(selector);
            }
        } else {
            this.watchers.delete(selector);
        }

        if (this.watchers.size === 0) {
            this.disconnect();
        }
    }

    public unwatchAll(): void {
        this.watchers.clear();
        this.disconnect();
    }

    public start(): void {
        if (!this.observing) {
            this.mutationObserver.observe(this.root, this.options);
            this.observing = true;
        }
    }

    public disconnect(): void {
        if (this.observing) {
            this.mutationObserver.disconnect();
            this.observing = false;
        }
    }

    public isWatching(selector: string): boolean {
        return this.watchers.has(selector);
    }

    public getWatchers(): string[] {
        return Array.from(this.watchers.keys());
    }

    private createObserver(): MutationObserver {
        return new MutationObserver((mutations: MutationRecord[]): void => {
            for (const mutation of mutations) {
                this.processMutation(mutation);
            }
        });
    }

    private processMutation(mutation: MutationRecord): void {
        const target: Node = mutation.target;
        const element: Element | null = target.nodeType === 1 ? target as Element : target.parentElement;

        if (!element) return;

        for (const [selector, watchers] of this.watchers) {
            try {
                if (!element.matches(selector)) continue;

                for (const { callback, options } of watchers) {
                    if (!this.shouldTrigger(mutation, options)) continue;

                    const updateInfo: ElementUpdateInfo = this.buildUpdateInfo(mutation);

                    try {
                        callback(element as E, updateInfo);
                    } catch (error) {
                        console.error(`Error in callback for selector "${selector}":`, error);
                    }
                }
            } catch (error) {
                console.error(`Invalid selector "${selector}":`, error);
            }
        }
    }

    private shouldTrigger(mutation: MutationRecord, options: Required<WatchOptions>): boolean {
        if (mutation.type === 'attributes') {
            if (!options.attributes) return false;

            if (options.attributeFilter && options.attributeFilter.length > 0) {
                return options.attributeFilter.includes(mutation.attributeName!);
            }

            return true;
        }

        if (mutation.type === 'characterData') {
            return options.characterData;
        }

        return false;
    }

    private buildUpdateInfo(mutation: MutationRecord): ElementUpdateInfo {
        const info: ElementUpdateInfo = {
            type: mutation.type as 'attributes' | 'characterData',
            target: mutation.target
        };

        if (mutation.type === 'attributes') {
            info.attributeName = mutation.attributeName!;
            info.oldValue = mutation.oldValue;
            info.newValue = (mutation.target as Element).getAttribute(mutation.attributeName!);
        }

        if (mutation.type === 'characterData') {
            info.oldValue = mutation.oldValue;
            info.newValue = mutation.target.textContent;
        }

        return info;
    }
}
