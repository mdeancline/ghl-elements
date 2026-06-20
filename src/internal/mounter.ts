import { HighLevelElement } from "../api/high-level-element";
import { Mountable } from "./mountable";

export interface Mounter {
    mount(mountable: HighLevelElement<any, any> & Mountable): void;
}
