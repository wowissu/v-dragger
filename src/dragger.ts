export interface DragItemOptObject {
  trigger?: string;
  onDragend?: (index: Record<number, number>) => void;
}

export type DragItemOptFunction = DragItemOptObject["onDragend"];

export type DragItemOpt = DragItemOptObject | DragItemOptFunction | undefined;

export type DraggerNode = Node;
export type DragItemHTMLElement = HTMLElement & { __v_dragitem?: DragItem };

export interface DraggerOpt {
  horizontal?: boolean;
}

const defDraggerOpt: DraggerOpt = {};

const defDragItemOpt: DragItemOptObject = {};

export class Dragger {
  public static __draggers: Dragger[] = [];
  public static __global: Dragger = new Dragger(document);

  public opt!: DraggerOpt;
  public items: DragItem[] = [];

  constructor(public el: Node, public __opt?: DraggerOpt) {
    this.opt = Object.assign({}, __opt, defDraggerOpt);

    Dragger.__draggers.unshift(this);
  }

  public add(item: DragItem) {
    !this.items.includes(item) && this.items.push(item);
  }

  public updateIndex() {
    this.items.forEach((item) => item.update());

    [...this.items]
      .sort((a, b) => (a.top > b.top ? 1 : b.top > a.top ? -1 : 0))
      .forEach((row, i) => {
        row.index = i;
        row.moveTo = i;
      });
  }

  public removeItem(item: DragItem) {
    const index = this.items.indexOf(item);

    if (index > -1) {
      this.items.splice(index, 1);
    }
  }
}

export class DragItem {
  public static defaultTrigger = "[data-v-dragger-group]";

  public opt!: DragItemOptObject;
  public trigger!: HTMLElement;
  public dragger?: Dragger;

  public index = 0;
  public moveTo = 0;

  public height = 0;
  public width = 0;
  public top = 0;
  public bottom = 0;
  public left = 0;
  public right = 0;
  public translateY = 0;
  // 暫存原始屬性
  public tempStyleText!: string;
  public tempTransformText!: string;
  public tempTransitionText!: string;

  public removeEventCall?: Function;

  constructor(public el: HTMLElement, public __opt?: DragItemOpt) {
    const opt = isOptObj(__opt) ? __opt : ({ onDragend: __opt } as DragItemOptObject);
    this.opt = Object.assign({}, defDragItemOpt, opt);
    this.tempStyleText = el.style.cssText;
    this.tempTransformText = el.style.transform;
    this.tempTransitionText = el.style.transition;

    this.dragger = Dragger.__draggers.find((d) => contains(d.el, el));
    this.dragger?.add(this);
    this.trigger = el.querySelector<typeof el>(this.opt.trigger || DragItem.defaultTrigger) || el;

    this.init();
  }

  private init() {
    const opt = this.opt;
    const dragitem = this;
    const dragger = dragitem.dragger;
    const items = dragger?.items;
    const trigger = dragitem.trigger;
    const target = dragitem.el;

    function triggerMouseDownHandler(this: Element, e: MouseEvent) {
      draggableOn(trigger);
      e.stopPropagation();
      return false;
    }

    function triggerMouseUpHandler(this: Element) {
      draggableOff(trigger);
    }

    // window drop handler
    function dropHandler(e: DragEvent) {
      e.preventDefault();
    }

    function dragstartHandler(e: DragEvent) {
      // 計算目前 群組內的所有拖曳點位置
      dragger?.updateIndex();

      // 寫上動畫用的style
      items?.forEach((row) => {
        // TODO 動畫時間提出
        row.el.style.setProperty("transition", `${row.tempTransitionText} transform 0.5s`);
        row.el.style.setProperty("transform", `${row.tempTransformText} translateY(0px)`);
      });

      // 註冊 window drageover event
      window.addEventListener("dragover", dragoverHandler, false);
      window.addEventListener("drop", dropHandler);

      return false;
    }

    // window dragover handler
    function dragoverHandler(e: DragEvent) {
      e.preventDefault();
      e.stopPropagation();
      // 取得當前滑鼠位置
      const x = e.pageX;
      const y = e.pageY;

      // 重置被設定的位置
      items?.forEach((row) => {
        row.translateY = 0;
        row.moveTo = row.index;
      });

      // 計算被拖曳進的對象
      const item = items?.find((row) => row.top <= y && row.bottom >= y && row.left <= x && row.right >= x);

      if (item && item !== dragitem) {
        dragitem.moveTo = item.index;

        if (item.index > dragitem.index) {
          // 往下
          // 設定每個項目要上升的位置 並加總他們的高度(自己下降的高度)
          dragitem.translateY =
            items?.slice(dragitem.index + 1, item.index + 1).reduce((acc, row) => {
              row.moveTo = row.index - 1;
              row.translateY = items[row.moveTo].top - items[row.index].top;

              return acc - row.translateY;
            }, 0) ?? 0;
        } else {
          // 往上
          // 設定每個項目要下降的位置 並加總他們的高度(自己上升的高度)
          dragitem.translateY =
            items?.slice(item.index, dragitem.index).reduce((acc, row) => {
              row.moveTo = row.index + 1;
              row.translateY = items[row.moveTo].top - items[row.index].top;

              return acc - row.translateY;
            }, 0) ?? 0;
        }
      }

      // 設定對應位置到style上
      items?.forEach((row) => {
        row.el.style.setProperty(
          "transform",
          `${row.tempTransformText} translateY(${row.translateY.toPrecision(12)}px)`,
        );
      });
    }

    function dragendHandler(e: DragEvent) {
      // 將 draggable 屬性刪除
      draggableOff(target);

      // 刪除動畫
      items?.forEach((row) => {
        row.el.style.cssText = row.tempStyleText;
      });

      // 新的排序
      const newSort = items?.reduce<Record<number, number>>((acc, row) => {
        acc[row.index] = row.moveTo;
        return acc;
      }, {});

      newSort && opt.onDragend && opt.onDragend(newSort);

      // 取消註冊 window drageover event
      window.removeEventListener("dragover", dragoverHandler, false);
      window.removeEventListener("drop", dropHandler);

      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    trigger.addEventListener("mousedown", triggerMouseDownHandler, false);
    trigger.addEventListener("mouseup", triggerMouseUpHandler, false);
    target.addEventListener("dragstart", dragstartHandler, false);
    target.addEventListener("dragend", dragendHandler, false);

    this.removeEventCall = () => {
      trigger.removeEventListener("mousedown", triggerMouseDownHandler, false);
      trigger.removeEventListener("mouseup", triggerMouseUpHandler, false);
      target.removeEventListener("dragstart", dragstartHandler, false);
      target.removeEventListener("dragend", dragendHandler, false);
    };
  }

  public update() {
    const el = this.el;
    const offset = el.getBoundingClientRect();

    this.height = el.offsetHeight;
    this.width = el.offsetWidth;
    this.top = offset.top;
    this.bottom = offset.top + this.height;
    this.left = offset.left;
    this.right = offset.left + this.width;
  }

  public remove() {
    this.removeEventCall?.();
    this.dragger?.removeItem(this);
  }
}

function contains(p: Node, c: Node) {
  let ce: Node | null = c;
  while ((ce = ce.parentNode!) && ce !== p);
  return !!ce;
}

function isOptObj(opt: DragItemOpt): opt is DragItemOptObject {
  return typeof opt !== "function";
}

const draggableOn = (target: HTMLElement) => {
  target.setAttribute("draggable", "true");
  target.style.setProperty("transition", "transform 0.5s");
};
const draggableOff = (target: HTMLElement) => {
  target.removeAttribute("draggable");
  target.style.removeProperty("transition");
};
