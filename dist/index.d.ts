import { App, ObjectDirective } from "vue";
import { DragItemOpt, DraggerOpt, DragItemHTMLElement, DraggerNode } from "./dragger";
export declare const dragger: ObjectDirective<DraggerNode, DraggerOpt | undefined>;
export declare const dropItem: ObjectDirective<DragItemHTMLElement, DragItemOpt | undefined>;
export declare const dropTrigger: ObjectDirective;
export default function useDragger(Vue: App): void;
