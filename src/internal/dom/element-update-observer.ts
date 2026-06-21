import { assert } from "../utils/utils";
import { GHLElementsError } from "../../api/ghl-elements-error";

export interface ElementUpdateInfo {
    type: 'attributes' | 'characterData' | 'childList';
    target: Node;
    attributeName?: string;
    oldValue?: string | null;
    newValue?: string | null;
    addedNodes?: NodeList;
    removedNodes?: NodeList;
}

export interface WatchOptions {
    attributes?: boolean;
    characterData?: boolean;
    childList?: boolean;
    attributeFilter?: string[] | null;
}

export interface WatcherData<E extends Element> {
    callback: UpdateCallback<E>;
    options: Required<WatchOptions>;
}

export type UpdateCallback<E extends Element> = (element: E, info: ElementUpdateInfo) => void;

export class ElementUpdateObserver<E extends Element> {
    private readonly mutationObserver: MutationObserver = this.createObserver();
    private readonly elementSelectorCache = new WeakMap<Element, Set<string>>();
    private readonly attributeWatcherIndex = new Map<string, Set<string>>();
    private readonly currentWatchers = new Map<string, Set<WatcherData<E>>>();
    private readonly root: Element;
    private observing = false;
    private readonly options: MutationObserverInit = {
        attributes: true,
        attributeOldValue: true,
        characterData: true,
        characterDataOldValue: true,
        childList: true,
        subtree: true
    };

    public constructor(root: Element = document.body, options: MutationObserverInit = {}) {
        this.root = root;
        this.options = { ...this.options, ...options };
    }

    public watchSelector<EE extends E>(selector: string, callback: UpdateCallback<EE>, options: WatchOptions = {}): void {
        assert(this.observing, `${this.constructor.name} is not currently observing`);

        const watchOptions: Required<WatchOptions> = {
            attributes: true,
            characterData: true,
            childList: true,
            attributeFilter: null,
            ...options
        };

        let watchers = this.currentWatchers.get(selector);
        if (!watchers) {
            watchers = new Set();
            this.currentWatchers.set(selector, watchers);
        }

        watchers.add({ callback, options: watchOptions } as WatcherData<E>);

        if (watchOptions.attributeFilter) {
            for (const attr of watchOptions.attributeFilter) {
                let attrWatchers = this.attributeWatcherIndex.get(attr);
                if (!attrWatchers) {
                    attrWatchers = new Set();
                    this.attributeWatcherIndex.set(attr, attrWatchers);
                }

                attrWatchers.add(selector);
            }
        }
    }

    public unwatchSelector(selector: string, callback: UpdateCallback<E> | null = null): void {
        const watchers = this.currentWatchers.get(selector);
        if (!watchers) return;

        if (callback) {
            for (const watcher of watchers) {
                if (watcher.callback === callback) {
                    watchers.delete(watcher);
                    break;
                }
            }

            if (watchers.size === 0) {
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
        this.attributeWatcherIndex.clear();
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

    public isWatching(selector: string): boolean {
        return this.currentWatchers.has(selector);
    }

    public get watchers(): Iterable<[string, Set<WatcherData<E>>]> {
        return this.currentWatchers.entries();
    }

    private createObserver(): MutationObserver {
        return new MutationObserver((mutations: MutationRecord[]): void => {
            for (const mutation of mutations) {
                this.processMutation(mutation);
            }
        });
    }

    private processMutation(mutation: MutationRecord): void {
        const target = mutation.target;

        if (mutation.type === 'childList') {
            for (const node of [...mutation.addedNodes, ...mutation.removedNodes]) {
                if (node.nodeType !== 1) continue;
                const element = node as Element;
                const matchingSelectors = this.resolveMatchingSelectors(element, mutation);
                if (matchingSelectors.size === 0) continue;

                const updateInfo = ElementUpdateObserver.buildUpdateInfo(mutation);

                for (const selector of matchingSelectors) {
                    const watchers = this.currentWatchers.get(selector);
                    if (!watchers) continue;

                    for (const { callback, options } of watchers) {
                        if (!options.childList) continue;
                        try {
                            callback(element as E, updateInfo);
                        } catch (error) {
                            console.error(`Error in callback for selector "${selector}":`, error);
                        }
                    }
                }
            }
            return;
        }

        const element: Element | null = target.nodeType === 1 ? target as Element : target.parentElement;
        if (!element) return;

        const matchingSelectors = this.resolveMatchingSelectors(element, mutation);
        if (matchingSelectors.size === 0) return;

        const updateInfo = ElementUpdateObserver.buildUpdateInfo(mutation);

        for (const selector of matchingSelectors) {
            const watchers = this.currentWatchers.get(selector);
            if (!watchers) continue;

            for (const { callback, options } of watchers) {
                if (!ElementUpdateObserver.shouldTrigger(mutation, options)) continue;

                try {
                    callback(element as E, updateInfo);
                } catch (error) {
                    console.error(`Error in callback for selector "${selector}":`, error);
                }
            }
        }
    }

    private resolveMatchingSelectors(element: Element, mutation: MutationRecord): Set<string> {
        let cached = this.elementSelectorCache.get(element);

        if (!cached) {
            cached = new Set<string>();

            for (const selector of this.currentWatchers.keys()) {
                try {
                    if (element.matches(selector)) cached.add(selector);
                } catch {
                    console.error(`Invalid selector "${selector}"`);
                }
            }

            this.elementSelectorCache.set(element, cached);
        }

        if (mutation.type === 'attributes' && mutation.attributeName) {
            const indexedSelectors = this.attributeWatcherIndex.get(mutation.attributeName);
            if (indexedSelectors) {
                return new Set([...cached].filter(s => indexedSelectors.has(s) || !this.hasAttributeFilter(s)));
            }
        }

        return cached;
    }

    private hasAttributeFilter(selector: string): boolean {
        const watchers = this.currentWatchers.get(selector);
        if (!watchers) return false;
        return [...watchers].some(w => w.options.attributeFilter !== null);
    }

    private static shouldTrigger(mutation: MutationRecord, options: Required<WatchOptions>): boolean {
        if (mutation.type === 'attributes') {
            if (!options.attributes) return false;
            if (options.attributeFilter && options.attributeFilter.length > 0) {
                return mutation.attributeName !== null && options.attributeFilter.includes(mutation.attributeName);
            }
            return true;
        }

        if (mutation.type === 'characterData') {
            return options.characterData;
        }

        return false;
    }

    private static buildUpdateInfo(mutation: MutationRecord): ElementUpdateInfo {
        const info: ElementUpdateInfo = {
            type: mutation.type as 'attributes' | 'characterData' | 'childList',
            target: mutation.target
        };

        switch (mutation.type) {
            case 'attributes':
                if (mutation.attributeName !== null) {
                    info.attributeName = mutation.attributeName;
                }
                info.oldValue = mutation.oldValue;
                info.newValue = (mutation.target as Element).getAttribute(mutation.attributeName ?? '');
                break;
            case 'characterData':
                info.oldValue = mutation.oldValue;
                info.newValue = mutation.target.textContent;
                break;
            case 'childList':
                info.addedNodes = mutation.addedNodes;
                info.removedNodes = mutation.removedNodes;
                break;
            default:
                throw new GHLElementsError(`Unrecognized mutation type "${mutation.type}"`);
        }

        return info;
    }
}