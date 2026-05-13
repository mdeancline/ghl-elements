export default class Proxies {
    private constructor() { }

    public static wrap<O extends object>(
        object: O,
        getCallback: <K extends keyof O>(method: K, returnValue: unknown, args: unknown[]) => void,
        setCallback?: <K extends keyof O>(prop: K, value: unknown) => void
    ): O {
        return new Proxy(object, {
            get: (target, prop, receiver) => Proxies.createGetTrap(target, prop, receiver, getCallback),
            set: (target, prop, value, receiver) => Proxies.createSetTrap(target, prop, value, receiver, setCallback),
        });
    }

    public static createGetTrap<O extends object>(
        target: O,
        prop: string | symbol,
        receiver: unknown,
        callback: <K extends keyof O>(method: K, returnValue: unknown, args: unknown[]) => void
    ): unknown {
        const value = Reflect.get(target, prop, receiver);

        if (typeof value !== 'function') return value;

        return new Proxy(value as (...args: unknown[]) => unknown, {
            apply: (fnTarget, thisArg, args) => Proxies.createApplyTrap(fnTarget, thisArg, args, prop as keyof O, callback),
        });
    }

    public static createSetTrap<O extends object>(target: O,
        prop: string | symbol,
        value: unknown,
        receiver: unknown,
        callback?: <K extends keyof O>(prop: K, value: unknown) => void
    ): boolean {
        const result = Reflect.set(target, prop, value, receiver);
        callback?.(prop as keyof O, value);
        return result;
    }

    public static createApplyTrap<O extends object>(
        fnTarget: (...args: unknown[]) => unknown,
        thisArg: unknown,
        args: unknown[],
        prop: keyof O | string | symbol,
        callback: <K extends keyof O>(method: K, returnValue: unknown, args: unknown[]) => void
    ): unknown {
        const result = Reflect.apply(fnTarget, thisArg, args);

        if (result instanceof Promise) {
            result.then(resolved => callback(prop as keyof O, resolved, args));
        } else {
            callback(prop as keyof O, result, args);
        }

        return result;
    }

    public static monitor<O extends object, K extends keyof O>(
        object: O,
        method: K,
        callback: (returnValue: unknown, args: unknown[]) => void
    ): void {
        const original = object[method];

        if (typeof original !== 'function') return;

        (object[method] as unknown) = new Proxy(original as (...args: unknown[]) => unknown, {
            apply: (target, thisArg, args) => Proxies.createApplyTrap(
                target,
                thisArg,
                args,
                method,
                (_method, returnValue, args) => callback(returnValue, args)
            ),
        });
    }
}