export abstract class EventTargetBase<M extends Record<keyof M, M[keyof M]>> implements EventTarget {
    private static readonly EMPTY_LISTENERS: readonly EventListener[] = [];

    private readonly listeners: Map<string, Set<EventListener>> = new Map();
    private readonly captureListeners: Map<string, Set<EventListener>> = new Map();
    private readonly onceWrappers: WeakMap<EventListener, EventListener> = new WeakMap();
    private readonly passiveListeners: WeakSet<EventListener> = new WeakSet();
    private passiveCount: number = 0;

    public addEventListener<K extends keyof M & string>(type: K, listener: (this: this, ev: M[K]) => any, options?: boolean | AddEventListenerOptions): void;
    public addEventListener<K extends keyof M & string>(type: K, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void;
    public addEventListener<K extends keyof M & string>(type: K, listener: ((...args: any[]) => any) | EventListenerObject | null, options?: boolean | AddEventListenerOptions): void {
        if (!listener) return;

        const isObject = typeof options === 'object';
        const once = isObject && (options.once ?? false);
        const passive = isObject && (options.passive ?? false);
        const capture = isObject ? (options.capture ?? false) : (options === true);

        const fn: EventListener = typeof listener === 'function'
            ? listener as EventListener
            : (event: Event) => (listener as EventListenerObject).handleEvent(event);

        const store = capture ? this.captureListeners : this.listeners;

        const wrapper: EventListener = once
            ? (event: Event) => {
                fn(event);
                store.get(event.type)?.delete(wrapper);
                this.onceWrappers.delete(fn);
            }
            : fn;

        if (once) this.onceWrappers.set(fn, wrapper);
        if (passive) { this.passiveListeners.add(wrapper); this.passiveCount++; }

        let set = store.get(type);
        if (!set) store.set(type, set = new Set());
        set.add(wrapper);
    }

    public removeEventListener<K extends keyof M & string>(type: K, listener: (this: this, ev: M[K]) => any, options?: boolean | EventListenerOptions): void;
    public removeEventListener<K extends keyof M & string>(type: K, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions): void;
    public removeEventListener<K extends keyof M & string>(type: K, listener: ((...args: any[]) => any) | EventListenerObject | null, options?: boolean | EventListenerOptions): void {
        if (!listener) return;

        const capture = typeof options === 'object' ? (options.capture ?? false) : (options === true);

        const fn: EventListener = typeof listener === 'function'
            ? listener as EventListener
            : (event: Event) => (listener as EventListenerObject).handleEvent(event);

        const store = capture ? this.captureListeners : this.listeners;
        const wrapper = this.onceWrappers.get(fn) ?? fn;

        store.get(type)?.delete(wrapper);
        if (this.passiveListeners.has(wrapper)) {
            this.passiveListeners.delete(wrapper);
            this.passiveCount--;
        }
        this.onceWrappers.delete(fn);
    }

    public dispatchEvent<K extends keyof M & string>(event: M[K]): boolean;
    public dispatchEvent(event: Event): boolean;
    public dispatchEvent(event: Event): boolean {
        for (const listener of this.listeners.get(event.type) ?? EventTargetBase.EMPTY_LISTENERS) {
            listener(event);
            if (event.cancelable && event.defaultPrevented && (this.passiveCount === 0 || !this.passiveListeners.has(listener))) return false;
        }
        return true;
    }
}