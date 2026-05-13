import HighLevelElement from "../elements/high-level-element";

export default abstract class HighLevelElementImpl<T extends HTMLElement, M extends HTMLElementEventMap> implements HighLevelElement<T, M> {
    public abstract get domElement(): T;

    public dispatchEvent(event: Event): boolean {
        return this.domElement.dispatchEvent(event);
    }

    public addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: T, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    public addEventListener<K extends keyof M>(type: K, listener: (this: T, ev: M[K]) => any, options?: boolean | AddEventListenerOptions): void;
    public addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void {
        this.domElement.addEventListener(type, listener as EventListener, options);
    }

    public removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    public removeEventListener<K extends keyof M>(type: K, listener: (this: T, ev: M[K]) => any, options?: boolean | EventListenerOptions): void;
    public removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void {
        this.domElement.removeEventListener(type, listener as EventListener, options);
    }

    public abstract mount(): void;
}