(function (window, document) { // Erklib

    "use strict";

    function isArray(arr) {
        return typeof arr === "object" && typeof arr.length === "number";
    }

    function undefVar(v, d) {
        if (typeof v === "undefined") {
            return d;
        }
        return v;
    }

    function findElem(sel, scope, makeArr) {
        makeArr = undefVar(makeArr, true); // return array or not
        scope = undefVar(scope, document);

        var seltype = sel.charAt(0);
        var name = sel.substring(1, sel.length);


        if (seltype == ".") {
            return scope.getElementsByClassName(name);
        } else if (seltype == "#") {
            var elem = scope.getElementById(name);
            return makeArr ? [elem] : elem;
        } else {
            return scope.getElementsByTagName(sel);
        }
    }


    function init() {
        function List(elems, sel, scope) {
            for (var i = 0; i < elems.length; i++) {
                this[i] = elems[i];
                if (this[i] !== null && this[i].hasOwnProperty('style')) {
                    this[i].disp = this[i].style.display;
                } else {
                    if (this[i] !== null) {
                        this[i].disp = '';
                    }
                }
            }
            this.length = elems.length || 0;
            this.selector = sel;
            this.erk = true;
            this.scope = scope;
        }

        List.prototype.map = function (callback) {
            var res = [],
                num;
            if (typeof callback === "undefined") {
                callback = function (elem) {
                    return elem;
                };
            } else if (typeof callback === "number") {
                num = callback;
                callback = function (elem) {
                    return elem;
                };
                for (var i = 0; i < this.length; i++) {
                    res.push(callback.call(this, this[i], i));
                }
                return res[num];
            }
            for (var i = 0; i < this.length; i++) {
                res.push(callback.call(this, this[i], i));
            }
            return res;
        };

        List.prototype.each = function (callack) {
            return this.forEach(function (el, i) {
                callack(Erklib(el), i);
            });
        }

        List.prototype.forEach = function (callback) {
            this.map(callback)
            return this;
        }

        List.prototype.style = function (attr, val) {
            if (val !== undefined) {
                return this.forEach(function (elem) {
                    elem.style[attr] = val;
                });
            } else {
                return this.map(function (elem) {
                    return elem.style[attr];
                });
            }
        }

        function _attr(attr, title) {
            if (title === undefined) {
                title = attr;
            }

            List.prototype[title] = function (val) {
                if (val === undefined) {
                    return this.map(function (elem) {
                        return elem[attr];
                    });
                }
                return this.forEach((elem) => elem[attr] = val);
            };
        }

        function _css(attr, title) {
            if (title === undefined) {
                title = attr
            }
            List.prototype[title] = function (val) {
                if (val === undefined) {
                    return this.map((elem) => elem.style[attr]);
                }
                return this.forEach((elem) => elem.style[attr] = val);
            };
        }

        function _meth(name, dname) {
            if (dname === undefined) {
                dname = name;
            }
            List.prototype[dname] = function (...args) {
                return this.map((elem) => elem[name](...args));
            };
        }

        function _evt(attr, title) {
            if (title === undefined) {
                title = attr
            }
            List.prototype[title] = function (callback) {
                if (callback === undefined) {
                    return this.forEach(el => {
                        el[attr];
                    });
                }
                return this.on(attr, callback);
            };
        }

        List.prototype.append = function (elems) {
            return this.forEach(function (elemP, i) {
                elems.forEach(function (childElem) {
                    if (i > 0) {
                        childElem = childElem.cloneNode(true);
                    }
                    elemP.appendChild(childElem);
                });
            });
        };

        List.prototype.copy = function (tf) {
            tf = typeof tf === "boolean" ? tf : false;
            return new List(this.map(function (elem) {
                return elem.cloneNode(tf);
            }), this.selector);
        };

        List.prototype.prepend = function (elems) {
            return this.forEach(function (elemP, i) {
                for (var e = elems.length - 1; e >= 0; e--) {
                    var elem = (e > 0) ? elems[i].cloneNode(true) : elems[e];
                    elemP.insertBefore(elem, elemP.childNodes[0]);
                }
            });
        };

        List.prototype.attr = function (attr, val) {
            if (typeof val !== "undefined") {
                return this.forEach(function (elem) {
                    elem.setAttribute(attr, val);
                });
            } else {
                return this.map(function (elem) {
                    return elem.getAttribute(attr);
                });
            }
        };

        List.prototype.delattr = function (attr) {
            return this.forEach(function (elem) {
                elem.removeAttribute(attr)
            });
        };

        List.prototype.on = function (evt, callback) {
            if (evt.indexOf(' ') > 0) {
                for (let i = 0; i < evt.split(' ').length; i++) {
                    const a = evt.split(' ')[i];
                    this.on(a, callback);
                }
            }
            return this.forEach(function (elem) {
                elem.addEventListener(evt, function (e) {
                    callback(e, Erklib(elem));
                }, Array.prototype.slice.call(arguments).slice(2, arguments.length));
            });
        };

        List.prototype.off = function (evt, callback) {
            if (evt.index(' ') >= 0) {
                for (let i = 0; i < evt.split(' ').length; i++) {
                    const a = evt.split(' ')[i];
                    this.off(a, callback)
                }
            }
            return this.forEach(function (elem) {
                elem.removeEventListener(evt, function (e) {
                    callback(e, Erklib(elem));
                }, Array.prototype.slice.call(arguments).slice(2,arguments.length));
            });
        };

        List.prototype.show = function (callback = () => {}) {
            return this.forEach(function (elem, ti, i) {
                elem.style.display = 'block';
                callback(this, ti, i);
            });
        }

        List.prototype.load = function (callback) {
            return this.on('load', callback);
        }

        List.prototype.hide = function (callback = () => {}) {
            return this.forEach(function (elem, ti, i) {
                elem.style.display = 'none';
                callback(this, ti, i);
            });
        }

        List.prototype.toggle = function (callback = function () {}) {
            return this.forEach(function (elem, ti, i) {
                if (elem.style.display == 'none') {
                    Erklib(elem).show();
                } else {
                    elem.style.display = 'none';
                }
                callback(this, ti, i);
            });
        };

        List.prototype.removeClass = function (c) {
            this.forEach(function (elem) {
                var cn = elem.className.split(" "),
                    i;
                while ((i = cn.indexOf(c)) > -1) {
                    cn = cn.slice(0, i).concat((cn.slice(++i)));
                }
                elem.className = cn.join(" ");
            });
            return this;
        };

        List.prototype.hasClass = function (className) {
            return this.map(function (elem) {
                return elem.className.split(" ").indexOf(className) >= 0;
            });
        }

        List.prototype.addClass = function (c) {
            var cn = "";
            if (typeof c === "string") {
                cn += " " + c;
            } else {
                for (var cla = 0; cla < c.length; cla++) {
                    cn += " " + c[cla];
                }
            }
            this.forEach(function (elem) {
                elem.className += cn;
            });
            return this;
        };

        List.prototype.remove = function () {
            return this.forEach(function (elem) {
                elem.parentNode.removeChild(elem);
            });
        };

        List.prototype.ctx = function (name, ...args) {
            if (args.length < 1) {
                return this.map(function (elem) {
                    return elem.getContext("2d")[name];
                });
            } else {
                return this.map(function (elem) {
                    var ctx = elem.getContext("2d");
                    if (typeof ctx[name] === "function") {
                        return ctx[name](...args);
                    } else {
                        return ctx[name] = args[0];
                    }
                });
            }
        };

        List.prototype.parent = function () {
            return new Erklib(this.map(function (elem) {
                return elem.parentNode;
            }));
        }

        List.prototype.clone = function (deep=false) {
            return this.forEach(function (elem) {
                return elem.cloneNode(deep);
            });
        };

        //METHODS:
        _meth('scroll');
        _meth("getContext");
        //ATTRS:
        _attr('innerHTML', 'html'); // change innerHTML
        _attr('innerText', 'text'); // change Text
        _attr('value');
        _attr('download');
        _attr("name");
        _attr('id');
        _attr("children");
        _attr("href");
        _attr('checked')
        _attr('className');
        _attr('checked');
        _attr('title');
        _attr('src');
        _attr('width');
        _attr('height');
        _attr("type");
        _attr("min");
        _attr("max");
        _attr("offsetLeft");
        _attr("offsetTop");
        _attr("offsetRight");
        _attr("offsetBottom");

        // CSS:
        _css('width', 'csswidth');
        _css('height', 'cssheight');
        _css("minWidth");
        _css("minHeight");
        _css("maxWidth");
        _css("maxHeight");
        _css('cursor');
        _css('order');
        _css('backroundColor');
        _css('cursor');
        _css("top");
        _css("left");
        _css("right");
        _css("bottom");
        _css('fontSize');
        _css('display');
        _css('background', 'bg');
        _css('zIndex');
        _css('scrollOverflow');
        _css('color');
        _css('transparency');
        _css('visibility', 'visi');
        //Margins:
        _css('margin');
        _css('marginTop');
        _css('marginBotton');
        _css('marginLeft');
        _css('marginRight');
        //Paddings:
        _css('padding');
        _css('paddingTop', 'padTop');
        _css('paddingBotton', 'padBotton');
        _css('paddingLeft', 'padLeft');
        _css('paddingRight', 'padRight');

        // events:
        _evt('click');
        _evt("dblclick");
        _evt('focus');
        _evt('change');
        _evt('unfocus');
        _evt('mouseenter', 'mouseover');
        _evt('mouseleave', 'mouseout');
        _evt("mouseup");
        _evt("mousedown");
        _evt("keydown");
        _evt("keyup");

        _evt('mousemove');


        function strHasChar(str, char) {
            var arr = str.split("");
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] === char) {
                    return true;
                }
            }
            return false;
        }

        function meths(__) {
            "use strict";
            __.assign = function (meth) {
                if (typeof meth === "object" && !isArray(meth)) {
                    for (var key in meth) {
                        __[key] = meth[key];
                    }

                } else if (typeof meth === "string") {
                    __[meth] == arguments[1];

                } else if (isArray(meth)) {
                    for (var i = 0; i < meth.length; i++) {
                        __.assign(meth[i]);
                    }
                }
            }

            __.assign({
                all: function () {
                    return __("*");
                },
                sel: function (sel, scope) {
                    return findElem(sel, scope, false)
                },
                fn: List.prototype,
                GET: function (attr) { // js equivelent to PHP `$_GET[]`
                    var wind = window.location.href,
                        h2 = wind.split("?")[1];
                    if (!strHasChar(wind, "?")) {
                        return {};
                    }
                    var res = {};
                    if (typeof attr === "undefined") { // returns all url params in key:value pairs. 
                        if (strHasChar(h2, "&")) {
                            var hs3 = h2.split("&");
                            for (var i = 0; i < hs3.length; i++) {
                                var a = hs3[i].split("=");
                                for (var e = 0; e < a.length; e += 2) {
                                    res[a[e]] = a[e + 1];
                                }
                            }
                        } else {
                            var arr = h2.split("=");
                            res[arr[0]] = arr[1];
                        }
                        return res;
                    } else {
                        var res = "";
                        if (strHasChar(wind, "&")) { // if url has multiple params.
                            var hs3 = h2.split("&");
                            for (var i = 0; i < hs3.length; i++) {
                                if (hs3[i].split("=")[0] == attr) {
                                    res = hs3[i].split("=")[1];
                                }
                            }
                        } else {
                            var arr = h2.split("=");
                            res = arr[1];
                        }
                        return res;
                    }
                },

                find: function (sel, scope, makeArr) {
                    return this.sel(sel, scope);
                },
                merge: function (...args) {
                    var res = [];
                    for (var i = 0; i < args.length; i++) {
                        var arr = args[i];
                        for (var j = 0; j < arr.length; j++) {
                            res.push(arr[j]);
                        }
                    }
                    return Erklib(res);
                },
                extend: function (toBeExt) {
                    var i = 2,
                        args = arguments;
                    for (; i < args.length; i++) {
                        for (var o in args[i]) {
                            toBeExt[o] = args[i][o];
                        }
                    }
                    return toBeExt;
                }
            });

            return __;
        }
        var _ = function (sel, scope) {
            var elems;
            scope = undefVar(scope, document)
            if (typeof sel !== "undefined") {
                if (typeof sel === "string") {
                    if (sel.charAt(0) == "<" && sel.charAt(sel.length - 1) == ">") {
                        elems = [scope.createElement(sel.substring(1, sel.length - 1))]
                    } else {
                        elems = findElem(sel, scope);
                    }
                } else if (sel.length) {
                    elems = sel;
                } else {
                    elems = [sel];
                }
                List.prototype = Erklib.fn;

                return new List(elems, sel, scope)
            } else {
                return this;
            }
        };
        meths(_); // Add methods to _
        return _
    }

    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = init()
    }
    window.$ = window._ = window.Erklib = init();
})(window, window.document);