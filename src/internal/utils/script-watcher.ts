export default interface ScriptWatcher {
    receive(script: HTMLScriptElement): void;
    get baseSrc(): string;
}