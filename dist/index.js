"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dropTrigger = exports.dropItem = exports.dragger = void 0;
var dragger_1 = require("./dragger");
// const globalDragger = new Dragger();
exports.dragger = {
    beforeMount: function (el) {
        new dragger_1.Dragger(el);
    },
};
exports.dropItem = {
    mounted: function (el, binding) {
        el["__v_dragitem"] = new dragger_1.DragItem(el, binding.value);
    },
    beforeUnmount: function (el) {
        var _a;
        (_a = el["__v_dragitem"]) === null || _a === void 0 ? void 0 : _a.remove();
    },
};
exports.dropTrigger = {
    beforeMount: function (el) {
        el.dataset.vDragTrigger = "";
    },
    beforeUnmount: function (el) {
        delete el.dataset.vDragTrigger;
    },
};
function useDragger(Vue) {
    Vue.directive("drag-item", exports.dropItem);
    Vue.directive("drag-trigger", exports.dropTrigger);
    Vue.directive("dragger", exports.dragger);
}
exports.default = useDragger;
