var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var defDraggerOpt = {};
var defDragItemOpt = {};
var Dragger = /** @class */ (function () {
    function Dragger(el, __opt) {
        this.el = el;
        this.__opt = __opt;
        this.items = [];
        this.opt = Object.assign({}, __opt, defDraggerOpt);
        Dragger.__draggers.unshift(this);
    }
    Dragger.prototype.add = function (item) {
        !this.items.includes(item) && this.items.push(item);
    };
    Dragger.prototype.updateIndex = function () {
        this.items.forEach(function (item) { return item.update(); });
        __spreadArrays(this.items).sort(function (a, b) { return (a.top > b.top ? 1 : b.top > a.top ? -1 : 0); })
            .forEach(function (row, i) {
            row.index = i;
            row.moveTo = i;
        });
    };
    Dragger.prototype.removeItem = function (item) {
        var index = this.items.indexOf(item);
        if (index > -1) {
            this.items.splice(index, 1);
        }
    };
    Dragger.__draggers = [];
    Dragger.__global = new Dragger(document);
    return Dragger;
}());
export { Dragger };
var DragItem = /** @class */ (function () {
    function DragItem(el, __opt) {
        var _a;
        this.el = el;
        this.__opt = __opt;
        this.index = 0;
        this.moveTo = 0;
        this.height = 0;
        this.width = 0;
        this.top = 0;
        this.bottom = 0;
        this.left = 0;
        this.right = 0;
        this.translateY = 0;
        var opt = isOptObj(__opt) ? __opt : { onDragend: __opt };
        this.opt = Object.assign({}, defDragItemOpt, opt);
        this.tempStyleText = el.style.cssText;
        this.tempTransformText = el.style.transform;
        this.tempTransitionText = el.style.transition;
        this.dragger = Dragger.__draggers.find(function (d) { return contains(d.el, el); });
        (_a = this.dragger) === null || _a === void 0 ? void 0 : _a.add(this);
        this.trigger = el.querySelector(this.opt.trigger || DragItem.defaultTrigger) || el;
        this.init();
    }
    DragItem.prototype.init = function () {
        var opt = this.opt;
        var dragitem = this;
        var dragger = dragitem.dragger;
        var items = dragger === null || dragger === void 0 ? void 0 : dragger.items;
        var trigger = dragitem.trigger;
        var target = dragitem.el;
        function triggerMouseDownHandler(e) {
            draggableOn(trigger);
            e.stopPropagation();
            return false;
        }
        function triggerMouseUpHandler() {
            draggableOff(trigger);
        }
        // window drop handler
        function dropHandler(e) {
            e.preventDefault();
        }
        function dragstartHandler(e) {
            // 計算目前 群組內的所有拖曳點位置
            dragger === null || dragger === void 0 ? void 0 : dragger.updateIndex();
            // 寫上動畫用的style
            items === null || items === void 0 ? void 0 : items.forEach(function (row) {
                // TODO 動畫時間提出
                row.el.style.setProperty("transition", row.tempTransitionText + " transform 0.5s");
                row.el.style.setProperty("transform", row.tempTransformText + " translateY(0px)");
            });
            // 註冊 window drageover event
            window.addEventListener("dragover", dragoverHandler, false);
            window.addEventListener("drop", dropHandler);
            return false;
        }
        // window dragover handler
        function dragoverHandler(e) {
            var _a, _b;
            e.preventDefault();
            e.stopPropagation();
            // 取得當前滑鼠位置
            var x = e.pageX;
            var y = e.pageY;
            // 重置被設定的位置
            items === null || items === void 0 ? void 0 : items.forEach(function (row) {
                row.translateY = 0;
                row.moveTo = row.index;
            });
            // 計算被拖曳進的對象
            var item = items === null || items === void 0 ? void 0 : items.find(function (row) { return row.top <= y && row.bottom >= y && row.left <= x && row.right >= x; });
            if (item && item !== dragitem) {
                dragitem.moveTo = item.index;
                if (item.index > dragitem.index) {
                    // 往下
                    // 設定每個項目要上升的位置 並加總他們的高度(自己下降的高度)
                    dragitem.translateY = (_a = items === null || items === void 0 ? void 0 : items.slice(dragitem.index + 1, item.index + 1).reduce(function (acc, row) {
                        row.moveTo = row.index - 1;
                        row.translateY = items[row.moveTo].top - items[row.index].top;
                        return acc - row.translateY;
                    }, 0)) !== null && _a !== void 0 ? _a : 0;
                }
                else {
                    // 往上
                    // 設定每個項目要下降的位置 並加總他們的高度(自己上升的高度)
                    dragitem.translateY = (_b = items === null || items === void 0 ? void 0 : items.slice(item.index, dragitem.index).reduce(function (acc, row) {
                        row.moveTo = row.index + 1;
                        row.translateY = items[row.moveTo].top - items[row.index].top;
                        return acc - row.translateY;
                    }, 0)) !== null && _b !== void 0 ? _b : 0;
                }
            }
            // 設定對應位置到style上
            items === null || items === void 0 ? void 0 : items.forEach(function (row) {
                row.el.style.setProperty("transform", row.tempTransformText + " translateY(" + row.translateY.toPrecision(12) + "px)");
            });
        }
        function dragendHandler(e) {
            // 將 draggable 屬性刪除
            draggableOff(target);
            // 刪除動畫
            items === null || items === void 0 ? void 0 : items.forEach(function (row) {
                row.el.style.cssText = row.tempStyleText;
            });
            // 新的排序
            var newSort = items === null || items === void 0 ? void 0 : items.reduce(function (acc, row) {
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
        this.removeEventCall = function () {
            trigger.removeEventListener("mousedown", triggerMouseDownHandler, false);
            trigger.removeEventListener("mouseup", triggerMouseUpHandler, false);
            target.removeEventListener("dragstart", dragstartHandler, false);
            target.removeEventListener("dragend", dragendHandler, false);
        };
    };
    DragItem.prototype.update = function () {
        var el = this.el;
        var offset = el.getBoundingClientRect();
        this.height = el.offsetHeight;
        this.width = el.offsetWidth;
        this.top = offset.top;
        this.bottom = offset.top + this.height;
        this.left = offset.left;
        this.right = offset.left + this.width;
    };
    DragItem.prototype.remove = function () {
        var _a, _b;
        (_a = this.removeEventCall) === null || _a === void 0 ? void 0 : _a.call(this);
        (_b = this.dragger) === null || _b === void 0 ? void 0 : _b.removeItem(this);
    };
    DragItem.defaultTrigger = "[data-v-dragger-group]";
    return DragItem;
}());
export { DragItem };
function contains(p, c) {
    var ce = c;
    while ((ce = ce.parentNode) && ce !== p)
        ;
    return !!ce;
}
function isOptObj(opt) {
    return typeof opt !== "function";
}
var draggableOn = function (target) {
    target.setAttribute("draggable", "true");
    target.style.setProperty("transition", "transform 0.5s");
};
var draggableOff = function (target) {
    target.removeAttribute("draggable");
    target.style.removeProperty("transition");
};
