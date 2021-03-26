! function(e) {
    var t = {};

    function n(r) { if (t[r]) return t[r].exports; var i = t[r] = { i: r, l: !1, exports: {} }; return e[r].call(i.exports, i, i.exports, n), i.l = !0, i.exports } n.m = e, n.c = t, n.d = function(e, t, r) { n.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: r }) }, n.r = function(e) { "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e, "__esModule", { value: !0 }) }, n.t = function(e, t) {
        if (1 & t && (e = n(e)), 8 & t) return e;
        if (4 & t && "object" == typeof e && e && e.__esModule) return e;
        var r = Object.create(null);
        if (n.r(r), Object.defineProperty(r, "default", { enumerable: !0, value: e }), 2 & t && "string" != typeof e)
            for (var i in e) n.d(r, i, function(t) { return e[t] }.bind(null, i));
        return r
    }, n.n = function(e) { var t = e && e.__esModule ? function() { return e.default } : function() { return e }; return n.d(t, "a", t), t }, n.o = function(e, t) { return Object.prototype.hasOwnProperty.call(e, t) }, n.p = "https://lab.openbloc.fr/way-of-life/", n(n.s = 9)
}([function(e, t, n) {
    "use strict";
    const r = n(1),
        i = n(2),
        o = n(3);

    function s(e, t) { return t.encode ? t.strict ? r(e) : encodeURIComponent(e) : e }

    function a(e, t) { return t.decode ? i(e) : e }

    function c(e) { const t = e.indexOf("#"); return -1 !== t && (e = e.slice(0, t)), e }

    function l(e) { const t = (e = c(e)).indexOf("?"); return -1 === t ? "" : e.slice(t + 1) }

    function u(e, t) { return t.parseNumbers && !Number.isNaN(Number(e)) && "string" == typeof e && "" !== e.trim() ? e = Number(e) : !t.parseBooleans || null === e || "true" !== e.toLowerCase() && "false" !== e.toLowerCase() || (e = "true" === e.toLowerCase()), e }

    function h(e, t) {
        const n = function(e) {
                let t;
                switch (e.arrayFormat) {
                    case "index":
                        return (e, n, r) => { t = /\[(\d*)\]$/.exec(e), e = e.replace(/\[\d*\]$/, ""), t ? (void 0 === r[e] && (r[e] = {}), r[e][t[1]] = n) : r[e] = n };
                    case "bracket":
                        return (e, n, r) => { t = /(\[\])$/.exec(e), e = e.replace(/\[\]$/, ""), t ? void 0 !== r[e] ? r[e] = [].concat(r[e], n) : r[e] = [n] : r[e] = n };
                    case "comma":
                        return (e, t, n) => {
                            const r = "string" == typeof t && t.split("").indexOf(",") > -1 ? t.split(",") : t;
                            n[e] = r
                        };
                    default:
                        return (e, t, n) => { void 0 !== n[e] ? n[e] = [].concat(n[e], t) : n[e] = t }
                }
            }(t = Object.assign({ decode: !0, sort: !0, arrayFormat: "none", parseNumbers: !1, parseBooleans: !1 }, t)),
            r = Object.create(null);
        if ("string" != typeof e) return r;
        if (!(e = e.trim().replace(/^[?#&]/, ""))) return r;
        for (const i of e.split("&")) {
            let [e, s] = o(i.replace(/\+/g, " "), "=");
            s = void 0 === s ? null : a(s, t), n(a(e, t), s, r)
        }
        for (const e of Object.keys(r)) {
            const n = r[e];
            if ("object" == typeof n && null !== n)
                for (const e of Object.keys(n)) n[e] = u(n[e], t);
            else r[e] = u(n, t)
        }
        return !1 === t.sort ? r : (!0 === t.sort ? Object.keys(r).sort() : Object.keys(r).sort(t.sort)).reduce((e, t) => { const n = r[t]; return Boolean(n) && "object" == typeof n && !Array.isArray(n) ? e[t] = function e(t) { return Array.isArray(t) ? t.sort() : "object" == typeof t ? e(Object.keys(t)).sort((e, t) => Number(e) - Number(t)).map(e => t[e]) : t }(n) : e[t] = n, e }, Object.create(null))
    }
    t.extract = l, t.parse = h, t.stringify = (e, t) => {
        if (!e) return "";
        const n = function(e) {
                switch (e.arrayFormat) {
                    case "index":
                        return t => (n, r) => { const i = n.length; return void 0 === r ? n : null === r ? [...n, [s(t, e), "[", i, "]"].join("")] : [...n, [s(t, e), "[", s(i, e), "]=", s(r, e)].join("")] };
                    case "bracket":
                        return t => (n, r) => void 0 === r ? n : null === r ? [...n, [s(t, e), "[]"].join("")] : [...n, [s(t, e), "[]=", s(r, e)].join("")];
                    case "comma":
                        return t => (n, r, i) => null == r || 0 === r.length ? n : 0 === i ? [
                            [s(t, e), "=", s(r, e)].join("")
                        ] : [
                            [n, s(r, e)].join(",")
                        ];
                    default:
                        return t => (n, r) => void 0 === r ? n : null === r ? [...n, s(t, e)] : [...n, [s(t, e), "=", s(r, e)].join("")]
                }
            }(t = Object.assign({ encode: !0, strict: !0, arrayFormat: "none" }, t)),
            r = Object.keys(e);
        return !1 !== t.sort && r.sort(t.sort), r.map(r => { const i = e[r]; return void 0 === i ? "" : null === i ? s(r, t) : Array.isArray(i) ? i.reduce(n(r), []).join("&") : s(r, t) + "=" + s(i, t) }).filter(e => e.length > 0).join("&")
    }, t.parseUrl = (e, t) => ({ url: c(e).split("?")[0] || "", query: h(l(e), t) })
}, function(e, t, n) {
    "use strict";
    e.exports = e => encodeURIComponent(e).replace(/[!'()*]/g, e => `%${e.charCodeAt(0).toString(16).toUpperCase()}`)
}, function(e, t, n) {
    "use strict";
    var r = new RegExp("%[a-f0-9]{2}", "gi"),
        i = new RegExp("(%[a-f0-9]{2})+", "gi");

    function o(e, t) {
        try { return decodeURIComponent(e.join("")) } catch (e) {}
        if (1 === e.length) return e;
        t = t || 1;
        var n = e.slice(0, t),
            r = e.slice(t);
        return Array.prototype.concat.call([], o(n), o(r))
    }

    function s(e) { try { return decodeURIComponent(e) } catch (i) { for (var t = e.match(r), n = 1; n < t.length; n++) t = (e = o(t, n).join("")).match(r); return e } } e.exports = function(e) {
        if ("string" != typeof e) throw new TypeError("Expected `encodedURI` to be of type `string`, got `" + typeof e + "`");
        try { return e = e.replace(/\+/g, " "), decodeURIComponent(e) } catch (t) {
            return function(e) {
                for (var t = { "%FE%FF": "��", "%FF%FE": "��" }, n = i.exec(e); n;) {
                    try { t[n[0]] = decodeURIComponent(n[0]) } catch (e) {
                        var r = s(n[0]);
                        r !== n[0] && (t[n[0]] = r)
                    }
                    n = i.exec(e)
                }
                t["%C2"] = "�";
                for (var o = Object.keys(t), a = 0; a < o.length; a++) {
                    var c = o[a];
                    e = e.replace(new RegExp(c, "g"), t[c])
                }
                return e
            }(e)
        }
    }
}, function(e, t, n) {
    "use strict";
    e.exports = (e, t) => { if ("string" != typeof e || "string" != typeof t) throw new TypeError("Expected the arguments to be of type `string`"); if ("" === t) return [e]; const n = e.indexOf(t); return -1 === n ? [e] : [e.slice(0, n), e.slice(n + t.length)] }
}, function(e, t, n) {
    var r = n(5);
    "string" == typeof r && (r = [
        [e.i, r, ""]
    ]);
    var i = { sourceMap: !0, hmr: !0, transform: void 0, insertInto: void 0 };
    n(7)(r, i);
    r.locals && (e.exports = r.locals)
}, function(e, t, n) {
    (e.exports = n(6)(!0)).push([e.i, "#universe{border:0;position:relative;width:100%;height:100%;z-index:1;cursor:crosshair;border:1px grey solid;border-radius:4px;box-shadow:0 0 2em #bbb;margin:0 0 1.75em 0}\n", "", { version: 3, sources: ["/home/maxime/github/way-of-life/src/styles/embed.scss"], names: [], mappings: "AAoBA,UACI,QAAS,CACT,iBAAkB,CAClB,UAAW,CACX,YAAa,CACb,SAAU,CACV,gBAAiB,CACjB,qBAAsB,CACtB,iBAAkB,CAClB,uBAAwB,CACxB,mBAAoB", file: "embed.scss", sourcesContent: ['// // surface imports and customization\n// // Colors\n// @import "~surface/src/scss/_imports/_colors.scss";\n// $primary: #e67e22;\n// $secondary: $asbestos;\n// $accent: #ff5722;\n\n// @import "~surface/src/scss/buttons.scss";\n// @import "~surface/src/scss/form.scss";\n\n// ::-moz-selection {\n//   background: #000 !important;\n//   color: #444 !important;\n// }\n\n// ::selection {\n//   background: rgba(255, 255, 255, 0) !important;\n//   color: #444 !important;\n// }\n\n#universe {\n    border: 0;\n    position: relative;\n    width: 100%;\n    height: 100%;\n    z-index: 1;\n    cursor: crosshair;\n    border: 1px grey solid;\n    border-radius: 4px;\n    box-shadow: 0 0 2em #bbb;\n    margin: 0 0 1.75em 0;\n}\n\n// .APL {\n//     background: rgba(243, 243, 243, 0.5);\n//     font-family: "APL385", "APL385 Unicode", "APLX Upright", "Courier APL2 Unicode", "SImPL", "SiMPL medium", monospace;\n//     text-align: center;\n//     padding: 0.5em 0;\n//     border-radius: 0.5em;\n//     // -webkit-text-fill-color: #444;\n//     a {\n//         text-decoration: none;\n//     }\n// }\n\n// .controls {\n//     text-align: center;\n//     position: fixed;\n//     bottom: 0;\n//     margin-left: auto;\n//     margin-right: auto;\n//     left: 0;\n//     right: 0;\n\n//     button {\n//         margin: 0.5rem 1rem;\n//     }\n// }\n\n// .hidden {\n//     display: none;\n// }\n\n// .github-link {\n//     position: fixed;\n//     top: 24px;\n//     left: 125px;\n//     font-size: 1rem;\n//     a {\n//         text-decoration: none;\n//     }\n//     .octicon {\n//         height: 20px;\n//         vertical-align: sub;\n//     }\n// }\n\n// #fps-info {\n//     min-width: 10rem;\n//     position: fixed;\n//     top: 26px;\n//     left: 0;\n//     right: 80px;\n//     text-align: right;\n// }\n\n// .text-content {\n//     position: fixed;\n//     top: 55px;\n//     bottom: 115px;\n//     left: 0;\n//     right: 0;\n//     max-width: 45rem;\n//     overflow: scroll;\n//     overflow-x: hidden;\n//     margin: auto;\n\n//     // nice in FF, broken in chrome\n//     // -webkit-text-fill-color: transparent;\n//     // background: -webkit-linear-gradient(transparent, #444 5%, #444 95%, transparent);\n//     // background: -o-linear-gradient(transparent, #444 5%, #444 95%, transparent);\n//     // -webkit-background-clip: text;\n// }\n\n// small {\n//     font-size: 0.9rem;\n// }'] }])
}, function(e, t, n) {
    "use strict";
    e.exports = function(e) {
        var t = [];
        return t.toString = function() {
            return this.map((function(t) {
                var n = function(e, t) {
                    var n = e[1] || "",
                        r = e[3];
                    if (!r) return n;
                    if (t && "function" == typeof btoa) {
                        var i = (s = r, a = btoa(unescape(encodeURIComponent(JSON.stringify(s)))), c = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(a), "/*# ".concat(c, " */")),
                            o = r.sources.map((function(e) { return "/*# sourceURL=".concat(r.sourceRoot).concat(e, " */") }));
                        return [n].concat(o).concat([i]).join("\n")
                    }
                    var s, a, c;
                    return [n].join("\n")
                }(t, e);
                return t[2] ? "@media ".concat(t[2], "{").concat(n, "}") : n
            })).join("")
        }, t.i = function(e, n) {
            "string" == typeof e && (e = [
                [null, e, ""]
            ]);
            for (var r = {}, i = 0; i < this.length; i++) {
                var o = this[i][0];
                null != o && (r[o] = !0)
            }
            for (var s = 0; s < e.length; s++) {
                var a = e[s];
                null != a[0] && r[a[0]] || (n && !a[2] ? a[2] = n : n && (a[2] = "(".concat(a[2], ") and (").concat(n, ")")), t.push(a))
            }
        }, t
    }
}, function(e, t, n) {
    var r, i, o = {},
        s = (r = function() { return window && document && document.all && !window.atob }, function() { return void 0 === i && (i = r.apply(this, arguments)), i }),
        a = function(e, t) { return t ? t.querySelector(e) : document.querySelector(e) },
        c = function(e) { var t = {}; return function(e, n) { if ("function" == typeof e) return e(); if (void 0 === t[e]) { var r = a.call(this, e, n); if (window.HTMLIFrameElement && r instanceof window.HTMLIFrameElement) try { r = r.contentDocument.head } catch (e) { r = null } t[e] = r } return t[e] } }(),
        l = null,
        u = 0,
        h = [],
        f = n(8);

    function d(e, t) {
        for (var n = 0; n < e.length; n++) {
            var r = e[n],
                i = o[r.id];
            if (i) { i.refs++; for (var s = 0; s < i.parts.length; s++) i.parts[s](r.parts[s]); for (; s < r.parts.length; s++) i.parts.push(b(r.parts[s], t)) } else {
                var a = [];
                for (s = 0; s < r.parts.length; s++) a.push(b(r.parts[s], t));
                o[r.id] = { id: r.id, refs: 1, parts: a }
            }
        }
    }

    function p(e, t) {
        for (var n = [], r = {}, i = 0; i < e.length; i++) {
            var o = e[i],
                s = t.base ? o[0] + t.base : o[0],
                a = { css: o[1], media: o[2], sourceMap: o[3] };
            r[s] ? r[s].parts.push(a) : n.push(r[s] = { id: s, parts: [a] })
        }
        return n
    }

    function m(e, t) {
        var n = c(e.insertInto);
        if (!n) throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
        var r = h[h.length - 1];
        if ("top" === e.insertAt) r ? r.nextSibling ? n.insertBefore(t, r.nextSibling) : n.appendChild(t) : n.insertBefore(t, n.firstChild), h.push(t);
        else if ("bottom" === e.insertAt) n.appendChild(t);
        else {
            if ("object" != typeof e.insertAt || !e.insertAt.before) throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
            var i = c(e.insertAt.before, n);
            n.insertBefore(t, i)
        }
    }

    function v(e) {
        if (null === e.parentNode) return !1;
        e.parentNode.removeChild(e);
        var t = h.indexOf(e);
        t >= 0 && h.splice(t, 1)
    }

    function g(e) {
        var t = document.createElement("style");
        if (void 0 === e.attrs.type && (e.attrs.type = "text/css"), void 0 === e.attrs.nonce) {
            var r = function() { 0; return n.nc }();
            r && (e.attrs.nonce = r)
        }
        return y(t, e.attrs), m(e, t), t
    }

    function y(e, t) { Object.keys(t).forEach((function(n) { e.setAttribute(n, t[n]) })) }

    function b(e, t) {
        var n, r, i, o;
        if (t.transform && e.css) {
            if (!(o = "function" == typeof t.transform ? t.transform(e.css) : t.transform.default(e.css))) return function() {};
            e.css = o
        }
        if (t.singleton) {
            var s = u++;
            n = l || (l = g(t)), r = C.bind(null, n, s, !1), i = C.bind(null, n, s, !0)
        } else e.sourceMap && "function" == typeof URL && "function" == typeof URL.createObjectURL && "function" == typeof URL.revokeObjectURL && "function" == typeof Blob && "function" == typeof btoa ? (n = function(e) { var t = document.createElement("link"); return void 0 === e.attrs.type && (e.attrs.type = "text/css"), e.attrs.rel = "stylesheet", y(t, e.attrs), m(e, t), t }(t), r = _.bind(null, n, t), i = function() { v(n), n.href && URL.revokeObjectURL(n.href) }) : (n = g(t), r = S.bind(null, n), i = function() { v(n) });
        return r(e),
            function(t) {
                if (t) {
                    if (t.css === e.css && t.media === e.media && t.sourceMap === e.sourceMap) return;
                    r(e = t)
                } else i()
            }
    }
    e.exports = function(e, t) {
        if ("undefined" != typeof DEBUG && DEBUG && "object" != typeof document) throw new Error("The style-loader cannot be used in a non-browser environment");
        (t = t || {}).attrs = "object" == typeof t.attrs ? t.attrs : {}, t.singleton || "boolean" == typeof t.singleton || (t.singleton = s()), t.insertInto || (t.insertInto = "head"), t.insertAt || (t.insertAt = "bottom");
        var n = p(e, t);
        return d(n, t),
            function(e) {
                for (var r = [], i = 0; i < n.length; i++) {
                    var s = n[i];
                    (a = o[s.id]).refs--, r.push(a)
                }
                e && d(p(e, t), t);
                for (i = 0; i < r.length; i++) {
                    var a;
                    if (0 === (a = r[i]).refs) {
                        for (var c = 0; c < a.parts.length; c++) a.parts[c]();
                        delete o[a.id]
                    }
                }
            }
    };
    var x, w = (x = [], function(e, t) { return x[e] = t, x.filter(Boolean).join("\n") });

    function C(e, t, n, r) {
        var i = n ? "" : r.css;
        if (e.styleSheet) e.styleSheet.cssText = w(t, i);
        else {
            var o = document.createTextNode(i),
                s = e.childNodes;
            s[t] && e.removeChild(s[t]), s.length ? e.insertBefore(o, s[t]) : e.appendChild(o)
        }
    }

    function S(e, t) {
        var n = t.css,
            r = t.media;
        if (r && e.setAttribute("media", r), e.styleSheet) e.styleSheet.cssText = n;
        else {
            for (; e.firstChild;) e.removeChild(e.firstChild);
            e.appendChild(document.createTextNode(n))
        }
    }

    function _(e, t, n) {
        var r = n.css,
            i = n.sourceMap,
            o = void 0 === t.convertToAbsoluteUrls && i;
        (t.convertToAbsoluteUrls || o) && (r = f(r)), i && (r += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(i)))) + " */");
        var s = new Blob([r], { type: "text/css" }),
            a = e.href;
        e.href = URL.createObjectURL(s), a && URL.revokeObjectURL(a)
    }
}, function(e, t) {
    e.exports = function(e) {
        var t = "undefined" != typeof window && window.location;
        if (!t) throw new Error("fixUrls requires window.location");
        if (!e || "string" != typeof e) return e;
        var n = t.protocol + "//" + t.host,
            r = n + t.pathname.replace(/\/[^\/]*$/, "/");
        return e.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, (function(e, t) { var i, o = t.trim().replace(/^"(.*)"$/, (function(e, t) { return t })).replace(/^'(.*)'$/, (function(e, t) { return t })); return /^(#|data:|http:\/\/|https:\/\/|file:\/\/\/|\s*$)/i.test(o) ? e : (i = 0 === o.indexOf("//") ? o : 0 === o.indexOf("/") ? n + o : r + o.replace(/^\.\//, ""), "url(" + JSON.stringify(i) + ")") }))
    }
}, function(e, t, n) {
    "use strict";

    function r(e, t) {
        for (var n = 0; n < t.length; n++) {
            var r = t[n];
            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
        }
    }
    n.r(t);
    var i = function() {
        function e(t, n) {! function(e, t) { if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function") }(this, e), this.wasm = !1, this.width = t, this._width = t + 2, this.height = n, this._height = n + 2, this.module = { calledRun: !0 } }
        var t, n, i;
        return t = e, (n = [{
            key: "init",
            value: function() {
                var e = new ArrayBuffer(this._width * this._height);
                this._current = new Uint8Array(e);
                var t = new ArrayBuffer(this._width * this._height);
                this._next = new Uint8Array(t), this.module = { calledRun: !0 }
            }
        }, { key: "index", value: function(e, t) { return e * this._width + t } }, { key: "cell", value: function(e, t) { return this._current[this.index(e, t)] } }, { key: "cellSafe", value: function(e, t) { return this._current[(e + 1) * this._width + t + 1] } }, { key: "next", value: function(e, t) { return this._next[this.index(e, t)] } }, {
            key: "loopCurrentState",
            value: function() {
                for (var e = 1; e < this._width + 1; e++) this._current[this.index(0, e)] = this._current[this.index(this._height - 2, e)], this._current[this.index(this._height - 1, e)] = this._current[this.index(1, e)];
                for (var t = 1; t < this._height + 1; t++) this._current[this.index(t, 0)] = this._current[this.index(t, this._width - 2)], this._current[this.index(t, this._width - 1)] = this._current[this.index(t, 1)];
                this._current[this.index(0, 0)] = this._current[this.index(this._height - 2, this._width - 2)], this._current[this.index(0, this._width - 1)] = this._current[this.index(this._height - 2, 1)], this._current[this.index(this._height - 1, 0)] = this._current[this.index(1, this._width - 2)], this._current[this.index(this._height - 1, this._width - 1)] = this._current[this.index(1, 1)]
            }
        }, {
            key: "computeNextState",
            value: function() {
                var e, t, n, r, i, o;
                this.loopCurrentState();
                for (var s = 1; s < this._height - 1; s++) { t = (s - 1) * this._width, n = (s + 1) * this._width, r = s * this._width; for (var a = 1; a < this._width - 1; a++) i = a - 1, o = a + 1, e = this._current[t + i], e += this._current[t + a], e += this._current[t + o], e += this._current[r + i], e += this._current[r + o], e += this._current[n + i], e += this._current[n + a], e += this._current[n + o], this._next[r + a] = 3 === e ? 1 : 2 === e ? this._current[r + a] : 0 } this._current.set(this._next)
            }
        }, {
            key: "set",
            value: function(e, t) {
                var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1;
                this._current[this.index(e, t)] = n
            }
        }, {
            key: "setNext",
            value: function(e, t) {
                var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1;
                this._next[this.index(e, t)] = n
            }
        }]) && r(t.prototype, n), i && r(t, i), e
    }();

    function o(e, t, n) { e.set(t - 1, n), e.set(t, n + 2), e.set(t + 1, n - 1), e.set(t + 1, n), e.set(t + 1, n + 3), e.set(t + 1, n + 4), e.set(t + 1, n + 5) }

    function s(e, t, n) { e.set(t - 1, n), e.set(t, n - 1), e.set(t, n), e.set(t, n + 1), e.set(t + 1, n) }

    function a(e, t, n) { e.set(t - 1, n - 1, 0), e.set(t - 1, n, 0), e.set(t - 1, n + 1, 0), e.set(t, n - 1, 0), e.set(t, n, 0), e.set(t, n + 1, 0), e.set(t + 1, n - 1, 0), e.set(t + 1, n, 0), e.set(t + 1, n + 1, 0) }

    function c(e, t) {
        for (var n = 0; n < t.length; n++) {
            var r = t[n];
            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
        }
    }
    var l = function() {
        function e(t, n) { var r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};! function(e, t) { if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function") }(this, e), this.canvas = t, this.context = t.getContext("2d"), this.engine = n, this.pixelsPerCell = r.pixelsPerCell || 5, this.desiredFPS = r.desiredFPS || 30, this.fpsNode = r.fpsNode || !1, this.strokeStyle = r.strokeStyle || "rgba(255,118,5,0.5)", this.fillStyle = r.fillStyle || "rgba(222,122,39,0.5)", this.play = !1, this.fpsTime = 0, this.engineTime = 0, this.fps = 0, this.frameNumber = 0, this.canvas.width = this.engine.width * this.pixelsPerCell, this.canvas.height = this.engine.height * this.pixelsPerCell }
        var t, n, r;
        return t = e, (n = [{ key: "togglePlay", value: function() { this.play = !this.play } }, {
            key: "draw",
            value: function(e) {
                window.requestAnimationFrame(this.draw.bind(this)), this.context.clearRect(0, 0, this.canvas.width, this.canvas.height), this.context.strokeStyle = this.strokeStyle, this.context.fillStyle = this.fillStyle;
                for (var t = this.pixelsPerCell > 1, n = 0; n < this.engine.height; n++)
                    for (var r = 0; r < this.engine.width; r++)
                        if (this.engine.cellSafe(n, r)) {
                            var i = this.pixelsPerCell * r,
                                o = this.pixelsPerCell * n;
                            this.context.strokeRect(i, o, this.pixelsPerCell, this.pixelsPerCell), t && this.context.fillRect(i, o, this.pixelsPerCell, this.pixelsPerCell)
                        } var s = e - this.engineTime;
                if (s > 1e3 / this.desiredFPS && this.play && (this.engine.computeNextState(), this.frameNumber += 1, this.engineTime = e - s % (1e3 / this.desiredFPS)), this.fpsNode) {
                    var a = e - this.fpsTime;
                    a > 500 && (this.fps = 1e3 / a * this.frameNumber, this.fpsNode.textContent = "".concat(this.fps.toFixed(2), " FPS"), this.fpsTime = e, this.frameNumber = 0)
                }
            }
        }, { key: "start", value: function() { this.engine.computeNextState(), this.play = !0, window.requestAnimationFrame(this.draw.bind(this)) } }]) && c(t.prototype, n), r && c(t, r), e
    }();

    function u(e, t) {
        for (var n = 0; n < t.length; n++) {
            var r = t[n];
            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
        }
    }
    var h = function() {
            function e(t, n, r) { var i = this;! function(e, t) { if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function") }(this, e), this.canvas = t, this.engine = n, this.renderer = r, this.mouseDown = !1, this.listeners = [], this.addEvents([{ eventType: "mousedown", callback: this.mouseIsDown.bind(this) }, { eventType: "mouseup", callback: this.mouseIsUp.bind(this) }, { eventType: "mousemove", callback: this.addCells.bind(this) }, { eventType: "touchmove", callback: function(e) { for (var t = 0; t < e.touches.length; t++) i.addCells(e.touches[t], !0) } }]) }
            var t, n, r;
            return t = e, (n = [{
                key: "addEvents",
                value: function() {
                    var e = this,
                        t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
                    t.forEach((function(t) {
                        e.listeners.push(t);
                        var n = document;
                        t.selector && (n = document.querySelector(t.selector)), n && n.addEventListener(t.eventType, t.callback)
                    }))
                }
            }, {
                key: "addCells",
                value: function(e) {
                    var t = arguments.length > 1 && void 0 !== arguments[1] && arguments[1],
                        n = this.canvas.getBoundingClientRect(),
                        r = { x: (e.clientX - n.left) / (n.right - n.left) * this.canvas.clientWidth, y: (e.clientY - n.top) / (n.bottom - n.top) * this.canvas.clientHeight },
                        i = { i: ~~(r.y / this.renderer.pixelsPerCell), j: ~~(r.x / this.renderer.pixelsPerCell) };
                    (this.mouseDown || t) && (e.ctrlKey ? a(this.engine, i.i, i.j) : s(this.engine, i.i, i.j))
                }
            }, { key: "mouseIsDown", value: function(e) { 0 === e.button && (this.mouseDown = !0, this.addCells(e)) } }, { key: "mouseIsUp", value: function(e) { this.mouseDown = !1 } }]) && u(t.prototype, n), r && u(t, r), e
        }(),
        f = n(0),
        d = n.n(f),
        p = (n(4), { canvasSelector: "#universe", fpsNodeSelector: "#fps-info", playButtonSelector: "#ctrl-play-pause", hideButtonSelector: "#ctrl-hide-show", switchEngineSelector: "#ctrl-engine", desiredFPS: 30, pixelsPerCell: 5, strokeStyle: "rgba(255,118,5,0.5)", fillStyle: "rgba(222,122,39,0.5)", showText: !0, useWasm: !1 }),
        m = d.a.parse(window.location.search);
    (m.desiredFPS || m.pixelsperCell) && (p.showText = !1);
    var v = Object.assign(p, m);
    v.desiredFPS = parseInt(v.desiredFPS, 10), v.pixelsperCell = parseInt(v.pixelsperCell, 10);
    window.onload = function() {
        var e, t = document.querySelector(v.canvasSelector),
            n = ~~(t.clientWidth / v.pixelsPerCell),
            r = ~~(t.clientHeight / v.pixelsPerCell),
            s = new i(n, r),
            a = new i(n, r);
        e = !0 === v.useWasm ? s : a, window.engine = e;
        var c = new l(t, e, { desiredFPS: v.desiredFPS, pixelsPerCell: v.pixelsPerCell, fpsNode: document.querySelector(v.fpsNodeSelector), strokeStyle: v.strokeStyle, fillStyle: v.fillStyle });
        !1 === v.showText && (document.querySelector(".text-content").classList.add("hidden"), document.querySelector(v.hideButtonSelector).textContent = "Show text");
        var u = new h(t, e, c);
        u.addEvents([{ selector: v.playButtonSelector, eventType: "click", callback: function(e) { c.togglePlay(), e.target.textContent = "Pause" === e.target.textContent ? "Play" : "Pause" } }, { selector: v.hideButtonSelector, eventType: "click", callback: function(e) { document.querySelector(".text-content").classList.toggle("hidden"), e.target.textContent = "Hide text" === e.target.textContent ? "Show text" : "Hide text" } }, { selector: v.switchEngineSelector, eventType: "click", callback: function(t) { e = e instanceof i ? a : s, c.engine = e, u.engine = e, t.target.textContent = "Use js engine" === t.target.textContent ? "Use wasm engine" : "Use js engine" } }]);
        ! function t() {!0 !== e.module.calledRun ? window.setTimeout(t.bind(void 0), 100) : (s.init(), a.init(), o(s, ~~(r / 2), ~~(n / 2)), o(s, 0, 0), o(a, ~~(r / 2), ~~(n / 2)), o(a, 0, 0), c.start()) }()
    }
}]);
//# sourceMappingURL=lab-bundle.js.map?594b8cb4