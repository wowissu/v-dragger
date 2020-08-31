"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dropTrigger = exports.dropItem = void 0;
var dragGroups = {};
var draggableOn = function (target) {
    target.setAttribute("draggable", "true");
    target.style.setProperty("transition", "transform 0.5s");
};
var draggableOff = function (target) {
    target.removeAttribute("draggable");
    target.style.removeProperty("transition");
};
function isOptObj(opt) {
    return typeof opt !== "function";
}
exports.dropItem = {
    beforeMount: function (el, binding) {
        var groupName = binding.arg || "default";
        var defaultTrigger = "[data-v-drag-trigger]";
        var opt = binding.value && isOptObj(binding.value) ? binding.value : { onDragend: binding.value };
        var trigger = el.querySelector((opt && opt.trigger) || defaultTrigger) || el;
        //
        var target = el;
        var targetDragItem = {
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
        var items = dragGroups[groupName];
        function triggerMouseDownHandler(e) {
            draggableOn(target);
            e.stopPropagation();
            return false;
        }
        function triggerMouseUpHandler() {
            draggableOff(target);
        }
        // window dragover handler
        function dragoverHandler(e) {
            e.preventDefault();
            e.stopPropagation();
            // 取得當前滑鼠位置
            var x = e.pageX;
            var y = e.pageY;
            // 重置被設定的位置
            items.forEach(function (row) {
                row.translateY = 0;
                row.moveTo = row.index;
            });
            // 計算被拖曳進的對象
            var item = items.find(function (row) { return row.top <= y && row.bottom >= y && row.left <= x && row.right >= x; });
            if (item && item !== targetDragItem) {
                targetDragItem.moveTo = item.index;
                if (item.index > targetDragItem.index) {
                    // 往下
                    // 設定每個項目要上升的位置 並加總他們的高度(自己下降的高度)
                    targetDragItem.translateY = items.slice(targetDragItem.index + 1, item.index + 1).reduce(function (acc, row) {
                        row.translateY = targetDragItem.height * -1;
                        row.moveTo = row.index - 1;
                        return acc + row.height;
                    }, 0);
                }
                else {
                    // 往上
                    // 設定每個項目要下降的位置 並加總他們的高度(自己上升的高度)
                    targetDragItem.translateY = items.slice(item.index, targetDragItem.index).reduce(function (acc, row) {
                        row.translateY = targetDragItem.height;
                        row.moveTo = row.index + 1;
                        return acc - row.height;
                    }, 0);
                }
            }
            // 設定對應位置到style上
            items.forEach(function (row) {
                row.el.style.setProperty("transform", row.tempTransformText + " translateY(" + row.translateY + "px)");
            });
            return false;
        }
        // window drop handler
        function dropHandler(e) {
            e.preventDefault();
        }
        function dragstartHandler(e) {
            // 計算目前 群組內的所有拖曳點位置
            updateGroupElementOffset(items);
            // 寫上動畫用的style
            items.forEach(function (row) {
                row.el.style.setProperty("transition", row.tempTransitionText + " transform 0.5s");
                row.el.style.setProperty("transform", row.tempTransformText + " translateY(0px)");
            });
            // 註冊 window drageover event
            window.addEventListener("dragover", dragoverHandler, false);
            window.addEventListener("drop", dropHandler);
            return false;
        }
        function dragendHandler(e) {
            // 將 draggable 屬性刪除
            draggableOff(target);
            // 刪除動畫
            items.forEach(function (row) {
                row.el.style.cssText = row.tempStyleText;
                // setTimeout(() => {
                //   row.el.style.removeProperty('transition');
                // }, 500);
            });
            // 新的排序
            var newSort = items.reduce(function (acc, row) {
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
    beforeUnmount: function (el, binding) {
        var groupName = binding.arg || "default";
        var i = dragGroups[groupName].findIndex(function (row) { return row.el === el; });
        if (i > -1) {
            dragGroups[groupName].splice(i, 1);
        }
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
function use(Vue) {
    Vue.directive("drag-item", exports.dropItem);
    Vue.directive("drag-trigger", exports.dropTrigger);
}
exports.default = use;
function updateGroupElementOffset(rows) {
    rows.forEach(function (row) {
        var offset = row.el.getBoundingClientRect();
        row.height = row.el.offsetHeight;
        row.width = row.el.offsetWidth;
        row.top = offset.top;
        row.bottom = offset.top + row.height;
        row.left = offset.left;
        row.right = offset.left + row.width;
    });
    __spreadArrays(rows).sort(function (a, b) { return (a.top > b.top ? 1 : b.top > a.top ? -1 : 0); })
        .forEach(function (row, i) {
        row.index = i;
        row.moveTo = i;
    });
}
