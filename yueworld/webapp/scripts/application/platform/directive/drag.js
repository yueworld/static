module.exports = function ($app) {
    var isTouch = 'createTouch' in document;
    var html = document.documentElement;
    var isIE6 = !('minWidth' in html.style);
    var isLosecapture = !isIE6 && 'onlosecapture' in html;
    var isSetCapture = 'setCapture' in html;

    function noop() {
    }

    function preventDefault() {
        return false;
    }

    var eventTypes = {
        start: isTouch ? 'touchstart' : 'mousedown',
        move: isTouch ? 'touchmove' : 'mousemove',
        end: isTouch ? 'touchend' : 'mouseup'
    };

    var touchId = 0;
    var getEvent = isTouch ? function (event, touchId) {
        return (event.touches || event.originalEvent.touches)[touchId];
    } : function (event) {
        return event;
    };


    var supports = (function () {
        var div = document.createElement('div');
        var vendors = 'Khtml Ms O Moz Webkit'.split(' ');
        var len = vendors.length;

        return function (prop) {
            if (prop in div.style) {
                return prop;
            }

            prop = prop.replace(/^[a-z]/, function (val) {
                return val.toUpperCase();
            });

            while (len--) {
                if (vendors[len] + prop in div.style) {
                    return vendors[len] + prop;
                }
            }

            return null;
        };
    })();


    var transform = supports('transform');


    /**
     * 拖拽事件类，解决浏览器兼容问题
     * @constructor
     */
    function Drag(elem, event, GPU) {

        if (elem) {
            return new Drag.create(elem, event, GPU);
        }

        this.start = $app.$.proxy(this.start, this);
        this.move = $app.$.proxy(this.move, this);
        this.end = $app.$.proxy(this.end, this);
    }

    Drag.prototype = {

        constructor: Drag,

        start: function (event) {

            this.touchId = touchId;
            event = getEvent(event, touchId);
            touchId++;

            this.target = $app.$(event.target);

            $app.el.document
                .on('selectstart', preventDefault)
                .on('dblclick', this.end);

            if (isLosecapture) {
                this.target.on('losecapture', this.end);
            } else {
                $app.window.on('blur', this.end);
            }

            if (isSetCapture) {
                this.target[0].setCapture();
            }

            $app.el.document
                .on(eventTypes.move, this.move)
                .on(eventTypes.end, this.end);

            this.onstart(event);
            return false;
        },

        move: function (event) {
            event = getEvent(event, this.touchId);
            this.onmove(event);
            return false;
        },

        end: function (event) {
            this.touchId = touchId;
            event = getEvent(event, touchId);
            touchId--;

            $app.el.document
                .off('selectstart', preventDefault)
                .off('dblclick', this.end);

            if (isLosecapture) {
                this.target.off('losecapture', this.end);
            } else {
                $app.window.off('blur', this.end);
            }

            if (isSetCapture) {
                this.target[0].releaseCapture();
            }

            $app.el.document
                .off(eventTypes.move, this.move)
                .off(eventTypes.end, this.end);

            this.onend(event);
            return false;
        }

    };


    /**
     * @constructor
     * @param   {HTMLElement}   被拖拽的元素
     * @param   {Event}         触发拖拽的事件对象。若无则监听 elem 的按下事件启动
     */

    Drag.create = function (elem, event, GPU) {

        var $elem = $app.$(elem);
        var drag = this;
        var dragEvent = new Drag();

        var x, y, minX, minY, maxX, maxY, startLeft, startTop, clientX, clientY;

        if (typeof GPU === 'undefined') {
            GPU = !!transform;
        }

        this.GPU = GPU;

        dragEvent.onstart = function (event) {
            var $wrap = elem.parentNode.nodeName === 'BODY' ?
                $app.el.document : $elem.offsetParent();

            var isFixed = $elem.css('position') === 'fixed';
            var position = $elem.position();
            var ww = $app.window.width();
            var wh = $app.window.height();
            var dl = $wrap.scrollLeft();
            var dt = $wrap.scrollTop();
            var dw = $wrap.width();
            var dh = $wrap.height();
            var w = $elem.outerWidth();
            var h = $elem.outerHeight();
            var l = position.left;
            var t = position.top;

            if (drag.GPU) {
                minX = isFixed ? -l : -l - dl;
                minY = isFixed ? -t : -t - dt;
                maxX = isFixed ? ww - w - l : dw - w - l;
                maxY = isFixed ? wh - h - t : dh - h - t;
                x = 0;
                y = 0;
                startLeft = l;
                startTop = t;
            } else {
                minX = 0;
                minY = 0;
                maxX = isFixed ? ww - w + minX : dw - w;
                maxY = isFixed ? wh - h + minY : dh - h;
                x = startLeft = l;
                y = startTop = t;
            }


            clientX = event.clientX;
            clientY = event.clientY;

            drag.onstart(event);
        };


        dragEvent.onmove = function (event) {

            var style = elem.style;

            if (drag.GPU) {
                x = event.clientX - clientX;
                y = event.clientY - clientY;
            } else {
                x = event.clientX - clientX + startLeft;
                y = event.clientY - clientY + startTop;
            }

            // x = Math.max(minX, Math.min(maxX, x));
            // y = Math.max(minY, Math.min(maxY, y));


            // 使用 GPU 加速
            if (drag.GPU) {
                style[transform] = 'translate3d(' + x + 'px, ' + y + 'px, 0px)';
                // 使用传统的方式
            } else {
                style.left = x + 'px';
                style.top = y + 'px';
            }


            drag.onmove(event);
        };


        dragEvent.onend = function (event) {
            var style = elem.style;
            if (drag.GPU) {
                style[transform] = '';
                style.left = x + startLeft + 'px';
                style.top = y + startTop + 'px';
            } else {
                style.left = x + 'px';
                style.top = y + 'px';
            }

            drag.onend(event);
        };


        if (event) {
            // TODO onstart 事件此时可能还没注册
            dragEvent.start(event);
        } else {
            $elem.on(Drag.START, dragEvent.start);
            this.destroy = function () {
                $elem.off(Drag.START, dragEvent.start);
            };
        }
    };


    Drag.START = eventTypes.start;
    Drag.MOVE = eventTypes.move;
    Drag.END = eventTypes.end;


    Drag.create.prototype = {
        constructor: Drag.create,
        onstart: noop,
        onmove: noop,
        onend: noop,
        destroy: noop,
    };


    // =================================================================================================================
    $app.register.directive('ysPlatformDrag', function () {
        return {
            restrict: 'A',
            link: function (scope, elem) {
                var dragNode = elem[0];
                var dragHandle = dragNode.querySelector('[drag-handle]');
                if (!dragHandle) {
                    new Drag(dragNode);
                }
            }
        };
    });

    $app.register.directive('ysPlatformDragHandle', function () {
        return {
            restrict: 'A',
            link: function (scope, elem) {
                var dragNode = elem[0];
                while (!dragNode.hasAttribute('drag')) {
                    dragNode = dragNode.parentNode;
                }
                elem.on(Drag.START, function (event) {
                    new Drag(dragNode, event);
                    event.preventDefault();
                });
            }
        };
    });
}