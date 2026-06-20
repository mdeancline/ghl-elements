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

export function isGoHighLevel(): boolean {
    for (const script of document.scripts) {
        const src = script.src;

        if (src.includes('leadconnectorhq.com') || src.includes('msgsndr.com')) {
            return true;
        }
    }

    return false;
}
