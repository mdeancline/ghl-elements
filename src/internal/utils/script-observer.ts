import { assert } from 'ts-essentials';
import ElementCreationObserver from '../dom/element-creation-observer';
import ScriptWatcher from './script-watcher';

export default class ScriptObserver {
    private readonly watchers: ScriptWatcher[] = [];

    public constructor(
        private readonly observer: ElementCreationObserver<HTMLScriptElement> = new ElementCreationObserver(document.head, { subtree: false })
    ) { }

    public addWatcher(watcher: ScriptWatcher) {
        assert(!this.observer.isObserving, 'Already observing scripts');
        this.watchers.push(watcher);
    }

    public start(): void {
        this.observer.start();

        for (const watcher of this.watchers) {
            this.observer.watchSelector(`script[src*="${watcher.baseSrc}"]`, script => {
                for (const watcher of this.watchers) {
                    watcher.receive(script);
                }
            });
        }
    }
}