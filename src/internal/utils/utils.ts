export default class Utils {
    private constructor() { }

    public static callWhenLoaded(callback: () => void): void {
        if (document.readyState === 'complete') {
            callback();
        } else {
            Utils.callOnFullLoad(callback);
        }
    }

    public static callOnFullLoad(callback: () => void): void {
        window.addEventListener('load', callback, { once: true });
    }
}