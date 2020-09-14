import { DragItem, Dragger } from "./src/dragger";
// const globalDragger = new Dragger();
export var dragger = {
    beforeMount: function (el) {
        new Dragger(el);
    },
};
export var dropItem = {
    mounted: function (el, binding) {
        el.__v_dragitem = new DragItem(el, binding.value);
    },
    beforeUnmount: function (el) {
        var _a;
        (_a = el.__v_dragitem) === null || _a === void 0 ? void 0 : _a.remove();
    },
};
export var dropTrigger = {
    beforeMount: function (el) {
        el.dataset.vDragTrigger = "";
    },
    beforeUnmount: function (el) {
        delete el.dataset.vDragTrigger;
    },
};
export default function useDragger(Vue) {
    Vue.directive("drag-item", dropItem);
    Vue.directive("drag-trigger", dropTrigger);
    Vue.directive("dragger", dragger);
}
