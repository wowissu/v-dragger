import { App, ObjectDirective } from "vue";

export interface DragItem {
  el: HTMLElement;
  height: number;
  width: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
  index: number;
  moveTo: number;
  translateY: number;
  // 暫存原始屬性
  tempStyleText: string;
  tempTransformText: string;
  tempTransitionText: string;
}

export interface DragItemOptObject {
  trigger: string;
  onDragend?: (index: Record<number, number>) => void;
}

export type DragItemOptFunction = DragItemOptObject["onDragend"];

export type DragItemOpt = DragItemOptObject | DragItemOptFunction | undefined;

const dragGroups: {
  [key: string]: DragItem[];
} = {};

const draggableOn = (target: HTMLElement) => {
  target.setAttribute("draggable", "true");
  target.style.setProperty("transition", "transform 0.5s");
};
const draggableOff = (target: HTMLElement) => {
  target.removeAttribute("draggable");
  target.style.removeProperty("transition");
};

function isOptObj(opt: DragItemOpt): opt is DragItemOptObject {
  return typeof opt !== "function";
}

export const dropItem: ObjectDirective<HTMLElement, DragItemOpt | undefined> = {
  beforeMount(el, binding) {
    const groupName = binding.arg || "default";
    const defaultTrigger = "[data-v-drag-trigger]";

    const opt =
      binding.value && isOptObj(binding.value) ? binding.value : ({ onDragend: binding.value } as DragItemOptObject);

    const trigger = el.querySelector<typeof el>((opt && opt.trigger) || defaultTrigger) || el;

    //
    const target = el;
    const targetDragItem = {
      el: target,
      height: 0,
      width: 0,
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      index: 0,
      moveTo: 0,
      translateY: 0,
      tempStyleText: el.style.cssText,
      tempTransformText: el.style.transform,
      tempTransitionText: el.style.transition,
    };

    // onDropHandler

    // 儲存到指定的 group中
    dragGroups[groupName] = dragGroups[groupName] || [];
    dragGroups[groupName].push(targetDragItem);
    // 存取 group
    const items = dragGroups[groupName];

    function triggerMouseDownHandler(this: Element, e: MouseEvent) {
      draggableOn(target);
      e.stopPropagation();
      return false;
    }

    function triggerMouseUpHandler(this: Element) {
      draggableOff(target);
    }

    // window dragover handler
    function dragoverHandler(e: DragEvent) {
      e.preventDefault();
      e.stopPropagation();
      // 取得當前滑鼠位置
      const x = e.pageX;
      const y = e.pageY;

      // 重置被設定的位置
      items.forEach((row) => {
        row.translateY = 0;
        row.moveTo = row.index;
      });

      // 計算被拖曳進的對象
      const item = items.find((row) => row.top <= y && row.bottom >= y && row.left <= x && row.right >= x);

      if (item && item !== targetDragItem) {
        targetDragItem.moveTo = item.index;

        if (item.index > targetDragItem.index) {
          // 往下
          // 設定每個項目要上升的位置 並加總他們的高度(自己下降的高度)
          targetDragItem.translateY = items.slice(targetDragItem.index + 1, item.index + 1).reduce((acc, row) => {
            row.translateY = targetDragItem.height * -1;
            row.moveTo = row.index - 1;
            return acc + row.height;
          }, 0);
        } else {
          // 往上
          // 設定每個項目要下降的位置 並加總他們的高度(自己上升的高度)
          targetDragItem.translateY = items.slice(item.index, targetDragItem.index).reduce((acc, row) => {
            row.translateY = targetDragItem.height;
            row.moveTo = row.index + 1;
            return acc - row.height;
          }, 0);
        }
      }

      // 設定對應位置到style上
      items.forEach((row) => {
        row.el.style.setProperty("transform", `${row.tempTransformText} translateY(${row.translateY}px)`);
      });

      return false;
    }

    // window drop handler
    function dropHandler(e: DragEvent) {
      e.preventDefault();
    }

    function dragstartHandler(e: DragEvent) {
      // 計算目前 群組內的所有拖曳點位置
      updateGroupElementOffset(items);

      // 寫上動畫用的style
      items.forEach((row) => {
        row.el.style.setProperty("transition", `${row.tempTransitionText} transform 0.5s`);
        row.el.style.setProperty("transform", `${row.tempTransformText} translateY(0px)`);
      });

      // 註冊 window drageover event
      window.addEventListener("dragover", dragoverHandler, false);
      window.addEventListener("drop", dropHandler);

      return false;
    }

    function dragendHandler(e: DragEvent) {
      // 將 draggable 屬性刪除
      draggableOff(target);

      // 刪除動畫
      items.forEach((row) => {
        row.el.style.cssText = row.tempStyleText;
        // setTimeout(() => {
        //   row.el.style.removeProperty('transition');
        // }, 500);
      });

      // 新的排序
      const newSort = items.reduce<Record<number, number>>((acc, row) => {
        acc[row.index] = row.moveTo;
        return acc;
      }, {});

      opt.onDragend && opt.onDragend(newSort);

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
  },
  beforeUnmount(el, binding) {
    const groupName = binding.arg || "default";
    const i = dragGroups[groupName].findIndex((row) => row.el === el);

    if (i > -1) {
      dragGroups[groupName].splice(i, 1);
    }
  },
};

export const dropTrigger: ObjectDirective = {
  beforeMount(el: HTMLElement) {
    el.dataset.vDragTrigger = "";
  },
  beforeUnmount(el: HTMLElement) {
    delete el.dataset.vDragTrigger;
  },
};

export default function use(Vue: App) {
  Vue.directive("drag-item", dropItem);
  Vue.directive("drag-trigger", dropTrigger);
}

function updateGroupElementOffset(rows: DragItem[]) {
  rows.forEach((row) => {
    const offset = row.el.getBoundingClientRect();

    row.height = row.el.offsetHeight;
    row.width = row.el.offsetWidth;
    row.top = offset.top;
    row.bottom = offset.top + row.height;
    row.left = offset.left;
    row.right = offset.left + row.width;
  });

  [...rows]
    .sort((a, b) => (a.top > b.top ? 1 : b.top > a.top ? -1 : 0))
    .forEach((row, i) => {
      row.index = i;
      row.moveTo = i;
    });
}
