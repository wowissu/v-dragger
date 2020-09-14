export interface DragItemOptObject {
    trigger?: string;
    onDragend?: (index: Record<number, number>) => void;
}
export declare type DragItemOptFunction = DragItemOptObject["onDragend"];
export declare type DragItemOpt = DragItemOptObject | DragItemOptFunction | undefined;
export declare type DraggerNode = Node;
export declare type DragItemHTMLElement = HTMLElement & {
    __v_dragitem?: DragItem;
};
export interface DraggerOpt {
    horizontal?: boolean;
}
export declare class Dragger {
    el: Node;
    __opt?: DraggerOpt | undefined;
    static __draggers: Dragger[];
    static __global: Dragger;
    opt: DraggerOpt;
    items: DragItem[];
    constructor(el: Node, __opt?: DraggerOpt | undefined);
    add(item: DragItem): void;
    updateIndex(): void;
    removeItem(item: DragItem): void;
}
export declare class DragItem {
    el: HTMLElement;
    __opt?: DragItemOpt;
    static defaultTrigger: string;
    opt: DragItemOptObject;
    trigger: HTMLElement;
    dragger?: Dragger;
    index: number;
    moveTo: number;
    height: number;
    width: number;
    top: number;
    bottom: number;
    left: number;
    right: number;
    translateY: number;
    tempStyleText: string;
    tempTransformText: string;
    tempTransitionText: string;
    removeEventCall?: Function;
    constructor(el: HTMLElement, __opt?: DragItemOpt);
    private init;
    update(): void;
    remove(): void;
}
