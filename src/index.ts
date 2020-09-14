import { App, ObjectDirective } from "vue";
import { DragItem, DragItemOpt, DraggerOpt, Dragger, DragItemHTMLElement, DraggerNode } from "./dragger";

// const globalDragger = new Dragger();

export const dragger: ObjectDirective<DraggerNode, DraggerOpt | undefined> = {
  beforeMount(el) {
    new Dragger(el);
  },
};

export const dropItem: ObjectDirective<DragItemHTMLElement, DragItemOpt | undefined> = {
  mounted(el, binding) {
    el.__v_dragitem = new DragItem(el, binding.value);
  },
  beforeUnmount(el) {
    el.__v_dragitem?.remove();
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

export default function useDragger(Vue: App) {
  Vue.directive("drag-item", dropItem);
  Vue.directive("drag-trigger", dropTrigger);
  Vue.directive("dragger", dragger);
}
