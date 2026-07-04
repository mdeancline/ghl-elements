import { GHLElementsError } from "../../api/ghl-elements-error";
import { name } from '../../../package.json';

const PACKAGE_KEY = Symbol.for(name);

const EMPTY_ITERATOR: Iterator<never> = {
    next(): IteratorResult<never> {
        return { done: true, value: undefined };
    }
};

const EMPTY_ITERABLE: Iterable<never> = {
    [Symbol.iterator]() {
        return EMPTY_ITERATOR;
    }
};

export function wrap<O extends object>(
    object: O,
    getCallback: <K extends keyof O>(method: K, returnValue: unknown, args: unknown[]) => void,
    setCallback?: <K extends keyof O>(prop: K, value: unknown) => void
): O {
    return new Proxy(object, {
        get: (target, prop, receiver) => createGetTrap(target, prop, receiver, getCallback),
        set: (target, prop, value, receiver) => createSetTrap(target, prop, value, receiver, setCallback),
    });
}

export function createGetTrap<O extends object>(
    target: O,
    prop: string | symbol,
    receiver: unknown,
    callback: <K extends keyof O>(method: K, returnValue: unknown, args: unknown[]) => void
): unknown {
    const value = Reflect.get(target, prop, receiver);

    if (typeof value !== 'function') return value;

    return new Proxy(value as (...args: unknown[]) => unknown, {
        apply: (fnTarget, thisArg, args) => createApplyTrap(fnTarget, thisArg, args, prop as keyof O, callback),
    });
}

export function createSetTrap<O extends object>(target: O,
    prop: string | symbol,
    value: unknown,
    receiver: unknown,
    callback?: <K extends keyof O>(prop: K, value: unknown) => void
): boolean {
    const result = Reflect.set(target, prop, value, receiver);
    callback?.(prop as keyof O, value);
    return result;
}

export function createApplyTrap<O extends object>(
    fnTarget: (...args: unknown[]) => unknown,
    thisArg: unknown,
    args: unknown[],
    prop: keyof O | string | symbol,
    callback: <K extends keyof O>(method: K, returnValue: unknown, args: unknown[]) => void
): unknown {
    const result = Reflect.apply(fnTarget, thisArg, args);

    if (result instanceof Promise) {
        result.then(resolved => callback(prop as keyof O, resolved, args)).catch(() => {
            // catch handlers here are only to prevent unhandled rejections
        });
    } else {
        callback(prop as keyof O, result, args);
    }

    return result;
}

export function monitor<O extends object, K extends keyof O>(
    object: O,
    method: K,
    callback: (returnValue: unknown, args: unknown[]) => void
): void {
    const original = object[method];

    if (typeof original !== 'function') return;

    (object[method] as unknown) = new Proxy(original as (...args: unknown[]) => unknown, {
        apply: (target, thisArg, args) => createApplyTrap(
            target,
            thisArg,
            args,
            method,
            (_method, returnValue, args) => callback(returnValue, args)
        ),
    });
}

export function callWhenLoaded(callback: () => void): void {
    if (document.readyState === 'complete') {
        callback();
    } else {
        callOnFullLoad(callback);
    }
}

export function callOnFullLoad(callback: () => void): void {
    window.addEventListener('load', callback, { once: true });
}

export function assertGoHighLevel(): void {
    let assertion = false;

    for (const script of document.scripts) {
        const src = script.src;

        if (src.includes('leadconnectorhq.com') || src.includes('msgsndr.com')) {
            assertion = true;
        }
    }

    assert(assertion, 'Not being ran in a GoHighLevel window');
}

export function assert(condition: unknown, message = 'no additional info provided'): asserts condition {
    if (!condition) {
        throw new GHLElementsError(`Assertion error: ${message}`);
    }
}

export function declarePackageLoaded(): void {
    (window as any)[PACKAGE_KEY] = true;
}

export function assertPackageNotLoaded(): void {
    assert(!(window as any)[PACKAGE_KEY], 'GHL Elements is already loaded on this window');
}

export function emptyIterable<T>(): Iterable<T> {
    return EMPTY_ITERABLE as Iterable<T>;
};

export function singleIterable<T>(value: T): Iterable<T> {
    return {
        [Symbol.iterator]() {
            let done = false;
            return {
                next(): IteratorResult<T> {
                    if (done) return { done: true, value: undefined };
                    done = true;
                    return { done: false, value };
                }
            };
        }
    };
}