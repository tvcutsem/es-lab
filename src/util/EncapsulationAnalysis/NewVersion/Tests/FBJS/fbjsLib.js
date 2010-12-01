/*
HTTP Host: static.ak.fbcdn.net
Generated: October 19th 2010 12:35:27 PM PDT
Machine: 10.30.145.199
*/

if (window.CavalryLogger) {
    CavalryLogger.start_js(["js\/bmq929sp95w04swo.pkg.js"]);
}

if (!window.skipDomainLower && navigator && navigator.userAgent && document.domain.toLowerCase().match(/(^|\.)facebook\..*/) && !(parseInt((/Gecko\/([0-9]+)/.exec(navigator.userAgent) || []).pop(), 10) <= 20060508)) document.domain = window.location.hostname.replace(/^.*(facebook\..*)$/i, '$1');
var onloadRegister = window.onloadRegister ||
function (a) {
    onloadhooks.push(a);
};
var onloadhooks = window.onloadhooks || [];
var onafterloadRegister = window.onafterloadRegister ||
function (a) {
    onafterloadhooks.push(a);
};
var onafterloadhooks = window.onafterloadhooks || [];

function run_if_loaded(a, b) {
    if (window.loaded) return b.call(a);
}
function run_with(b, a, c) {
    Bootloader.loadComponents(a, bind(b, c));
    return false;
}
function wait_for_load(c, b, e) {
    e = bind(c, e, b);
    if (window.loaded) return e();
    switch ((b || event).type) {
    case 'load':
    case 'focus':
        onafterloadRegister(e);
        return;
    case 'click':
        var d = c.style,
            a = document.body.style;
        d.cursor = a.cursor = 'progress';
        onafterloadRegister(function () {
            d.cursor = a.cursor = '';
            if (c.tagName.toLowerCase() == 'a') {
                if (false !== e() && c.href) window.location.href = c.href;
            } else if (c.click) c.click();
        });
        break;
    }
    return false;
}
function bind(d, c) {
    var a = Array.prototype.slice.call(arguments, 2);
    var b = function () {
        var f = d || (this == window ? false : this),
            e = a.concat(Array.prototype.slice.call(arguments));
        if (typeof(c) == "string") {
            if (f[c]) return f[c].apply(f, e);
        } else return c.apply(f, e);
    };
    if (typeof c == 'string') {
        b.name = c;
    } else if (c && c.name) b.name = c.name;
    b.toString = function () {
        return bind._toString(d, a, c);
    };
    return b;
}
var curry = bind(null, bind, null);
bind._toString = bind._toString ||
function (c, a, b) {
    return (typeof b == 'string') ? ('late bind<' + b + '>') : ('bound<' + b.toString() + '>');
};
window.loadFirebugConsole && loadFirebugConsole();

function env_get(a) {
    return typeof(window['Env']) != 'undefined' && Env[a];
}

function hasArrayNature(a) {
    return ( !! a && (typeof a == 'object' || typeof a == 'function') && ('length' in a) && !('setInterval' in a) && (Object.prototype.toString.call(a) === "[object Array]" || ('callee' in a) || ('item' in a)));
}
function $A(b) {
    if (!hasArrayNature(b)) return [b];
    if (b.item) {
        var a = b.length,
            c = new Array(a);
        while (a--) c[a] = b[a];
        return c;
    }
    return Array.prototype.slice.call(b);
}

function eval_global(c) {
    if ('string' != typeof(c)) {
        throw new Error('JS sent to eval_global is not a string.  Only strings ' + 'are permitted.');
    } else if ('' == c) return;
    var d = document.createElement('script');
    d.type = 'text/javascript';
    try {
        d.appendChild(document.createTextNode(c));
    } catch (a) {
        d.text = c;
    }
    var b = (document.getElementsByTagName("head")[0] || document.documentElement);
    b.appendChild(d);
    b.removeChild(d);
}

function copy_properties(b, c) {
    b = b || {};
    c = c || {};
    for (var a in c) b[a] = c[a];
    if (c.hasOwnProperty && c.hasOwnProperty('toString') && (typeof c.toString != 'undefined') && (b.toString !== c.toString)) b.toString = c.toString;
    return b;
}
function add_properties(a, b) {
    return copy_properties(window[a] || (window[a] = {}), b);
}
function is_empty(b) {
    if (b instanceof Array) {
        return b.length == 0;
    } else if (b instanceof Object) {
        for (var a in b) return false;
        return true;
    } else return !b;
}
if (!window.async_callback) window.async_callback = function (a) {
    return a;
};

function Arbiter() {
    copy_properties(this, {
        _listeners: [],
        _events: {},
        _callbacks: {},
        _last_id: 1,
        _listen: {},
        _index: {}
    });
    copy_properties(this, Arbiter);
}
copy_properties(Arbiter, {
    SUBSCRIBE_NEW: 'new',
    SUBSCRIBE_ALL: 'all',
    BEHAVIOR_EVENT: 'event',
    BEHAVIOR_PERSISTENT: 'persistent',
    BEHAVIOR_STATE: 'state',
    LIVEMESSAGE: 'livemessage',
    BOOTLOAD: 'bootload',
    FUNCTION_EXTENSION: 'function_ext',
    CONTEXT_CHANGE: 'ui/context-change',
    PAGECACHE_INVALIDATE: 'pagecache/invalidate',
    NEW_NOTIFICATIONS: 'chat/new_notifications',
    LIST_EDITOR_LISTS_CHANGED: 'listeditor/friend_lists_changed',
    subscribe: function (k, b, i) {
        if (!k || k.length == 0) return null;
        k = $A(k);
        var a = Arbiter._getInstance(this);
        a._listeners.push({
            callback: b,
            types: k
        });
        var h = a._listeners.length - 1;
        for (var d = 0; d < k.length; d++) if (a._index[k[d]]) {
            a._index[k[d]].push(h);
        } else a._index[k[d]] = [h];
        i = i || Arbiter.SUBSCRIBE_ALL;
        if (i == Arbiter.SUBSCRIBE_ALL) {
            var c, j, g;
            for (var e = 0; e < k.length; e++) {
                j = k[e];
                if (typeof j != "string") throw new TypeError("Event types must be strings.");
                if (j in a._events) for (var f = 0; f < a._events[j].length; f++) {
                    c = a._events[j][f];
                    g = b.apply(null, [j, c]);
                    if (g === false) {
                        a._events[j].splice(f, 1);
                        f--;
                    }
                }
            }
        } else if (i != Arbiter.SUBSCRIBE_NEW) throw new TypeError("Bad subscription policy.");
        return {
            subscriberID: h
        };
    },
    unsubscribe: function (e) {
        if (!('subscriberID' in e)) throw new TypeError("Not an arbiter token.");
        var a = Arbiter._getInstance(this);
        var c = a._listeners[e.subscriberID];
        for (var d = 0; d < c.types.length; d++) {
            var f = c.types[d];
            if (a._index[f]) for (var b = 0; b < a._index[f].length; b++) if (a._index[f][b] == e.subscriberID) {
                a._index[f].splice(b, 1);
                if (a._index[f].length == 0) delete a._index[f];
                break;
            }
        }
        delete a._listeners[e.subscriberID];
    },
    inform: function (i, c, b) {
        var l = hasArrayNature(i);
        var k = $A(i);
        var a = Arbiter._getInstance(this);
        var h = {};
        b = b || Arbiter.BEHAVIOR_EVENT;
        for (var e = 0; e < k.length; e++) {
            var i = k[e],
                d = null;
            if (b == Arbiter.BEHAVIOR_PERSISTENT) {
                d = a._events.length;
                if (!(i in a._events)) a._events[i] = [];
                a._events[i].push(c);
                a._events[i]._stateful = false;
            } else if (b == Arbiter.BEHAVIOR_STATE) {
                d = 0;
                a._events[i] = [c];
                a._events[i]._stateful = true;
            } else if (i in a._events) a._events[i]._stateful = false;
            window.ArbiterMonitor && ArbiterMonitor.getInstance(a).log('event', i, c);
            var g;
            if (a._index[i]) {
                var j = a._index[i];
                for (var f = 0; f < j.length; f++) {
                    g = a._listeners[j[f]].callback.apply(null, [i, c]);
                    if (g === false) {
                        if (d !== null) a._events[i].splice(d, 1);
                        break;
                    }
                }
            }
            a._updateCallbacks(i, c);
            window.ArbiterMonitor && ArbiterMonitor.getInstance(a).log('done', i, c);
            h[i] = g;
        }
        return l ? h : h[k[0]];
    },
    query: function (b) {
        var a = Arbiter._getInstance(this);
        if (!(b in a._events)) return null;
        if (!a._events[b]._stateful) throw new Error("Querying state of an unstateful event.");
        if (a._events[b].length) return a._events[b][0];
        return null;
    },
    _instance: null,
    _getInstance: function (a) {
        if (a instanceof Arbiter) return a;
        if (!Arbiter._instance) Arbiter._instance = new Arbiter();
        return Arbiter._instance;
    },
    registerCallback: function (b, d) {
        var h, c = 0,
            a = Arbiter._getInstance(this),
            g = false;
        if (typeof b == 'function') {
            h = a._last_id;
            a._last_id++;
            g = true;
        } else {
            if (!a._callbacks[b]) return null;
            h = b;
        }
        if (hasArrayNature(d)) {
            var i = {};
            for (var f = 0; f < d.length; f++) i[d[f]] = 1;
            d = i;
        }
        for (var j in d) {
            try {
                if (a.query(j)) continue;
            } catch (e) {}
            c += d[j];
            if (a._listen[j] === undefined) a._listen[j] = {};
            a._listen[j][h] = (a._listen[j][h] || 0) + d[j];
        }
        if (c == 0 && g) {
            b();
            return null;
        }
        if (!g) {
            a._callbacks[h].depnum += c;
        } else a._callbacks[h] = {
            callback: async_callback(b, 'arbiter'),
            depnum: c
        };
        return h;
    },
    _updateCallbacks: function (d, c) {
        if (c === null || !this._listen[d]) return;
        for (var b in this._listen[d]) {
            this._listen[d][b]--;
            if (this._listen[d][b] <= 0) delete this._listen[d][b];
            this._callbacks[b].depnum--;
            if (this._callbacks[b].depnum <= 0) {
                var a = this._callbacks[b].callback;
                delete this._callbacks[b];
                a();
            }
        }
    }
});
Function.prototype.deferUntil = function (a, g, b, h) {
    if (typeof this != 'function' || g && typeof g != 'number') throw new TypeError();
    if (a()) {
        this();
        return;
    }
    var e = this,
        d = null,
        f = (new Date()).getTime();
    var c = function () {
        if (!a()) if (g && (new Date().getTime() - f) >= g) {
            h && h();
        } else return;
        d && clearInterval(d);
        e();
    };
    d = setInterval(c, 20, b);
    return d;
};
var Bootloader = window.Bootloader = (window.Bootloader && window.Bootloader.realBootloader) ? window.Bootloader : (function (a) {
    return {
        realBootloader: true,
        configurePage: function (b) {
            var h = {};
            var g = this.resolveResources(b);
            for (var c = 0; c < g.length; c++) {
                h[g[c].src] = g[c];
                this.requested(g[c].name);
                this._startCSSPoll(g[c].name);
            }
            var e = document.getElementsByTagName('link');
            for (var c = 0; c < e.length; ++c) {
                if (e[c].rel != 'stylesheet') continue;
                for (var d in h) if (e[c].href.indexOf(d) !== -1) {
                    var f = h[d].name;
                    this._cssLinkMap[f] = {
                        link: e[c]
                    };
                    if (h[d].permanent) this._permanent[f] = true;
                    delete h[d];
                    break;
                }
            }
        },
        loadComponents: function (d, b) {
            d = $A(d);
            var g = [];
            for (var e = 0; e < d.length; ++e) {
                if (!d[e]) continue;
                var c = this._componentMap[d[e]];
                if ( !! c) for (var f = 0; f < c.length; ++f) g.push(c[f]);
            }
            return this.loadResources(g, b);
        },
        loadResources: function (j, b, i, m) {
            j = Bootloader.resolveResources($A(j));
            if (i) {
                var g = {};
                var e = j.length && j[0].hash;
                if (!window.ResourceBundler || !e) {
                    for (var d = 0; d < j.length; ++d) g[j[d].name] = true;
                } else ResourceBundler.dropLocalResources(this._earlyResources);
                for (var f in this._requested) if (!(f in this._permanent) && !(f in g) && !(f in this._earlyResources)) this._unloadResource(f);
                this._earlyResources = {};
            }
            var n = [];
            var c = [];
            var h = [];
            for (var d = 0; d < j.length; ++d) {
                var k = j[d];
                if (k.permanent) this._permanent[k.name] = true;
                var l = Arbiter.BOOTLOAD + '/' + k.name;
                if (Arbiter.query(l) !== null) continue;
                if (!k.nonblocking) h.push(l);
                if (!this._requested[k.name]) {
                    this.requested(k.name);
                    if (k.hash) {
                        c.push(k);
                    } else {
                        n.push(k);
                        window.CavalryLogger && CavalryLogger.getInstance().measureResources(k, m);
                    }
                }
            }
            if (b) b = Arbiter.registerCallback(b, h);
            if (c.length) if (!window.ResourceBundler) {
                window.Util && false;
            } else ResourceBundler.fetchComboRsrcs(c);
            for (var d = 0; d < n.length; ++d) this.requestResource(n[d].type, n[d].src, n[d].name);
            return b;
        },
        _fetchWithIframe: function (d) {
            var c = null,
                b = null;
            var e = Arbiter.BOOTLOAD + ':iframe';
            if (!this._iframe) {
                c = this._iframe = document.createElement('iframe');
                copy_properties(c.style, {
                    width: '0',
                    height: '0',
                    frameborder: '0',
                    left: '0',
                    top: '0',
                    position: 'absolute'
                });
                c.onload = bind(null, Arbiter.inform, e, true, Arbiter.BEHAVIOR_STATE);
                c.src = "about:blank";
                c.id = 'bootloader_iframe';
                this.getHardpoint().appendChild(c);
            }
            Arbiter.registerCallback(bind(this, this._addResourceToIframe, d), [e]);
        },
        _addResourceToIframe: function (e) {
            var c = document.getElementById('bootloader_iframe');
            var b = (c.contentDocument ? c.contentDocument : (c.contentWindow ? c.contentWindow.document : window.frames.bootloader_iframe.document));
            var d = b.createElement("script");
            if (e.charAt(0) == '/') e = location.protocol + '/' + '/' + location.host + e;
            d.src = e;
            d.type = 'text/javascript';
            d.async = true;
            b.getElementsByTagName('head')[0].appendChild(d);
        },
        requestResource: function (j, g, e) {
            var b = this.getHardpoint();
            switch (j) {
            case 'js':
                if (/\/rsrc.php\/(v[^\/]+\/)?(z[^\/]+\/)?p\//.test(g)) {
                    this._fetchWithIframe(g);
                } else {
                    var f = document.createElement('script');
                    f.src = g;
                    f.type = 'text/javascript';
                    f.async = true;
                    b.appendChild(f);
                }
                break;
            case 'css':
                if (window.Env && Env.use_css_import_in_ie && document.createStyleSheet) {
                    var h = this._styleTags,
                        i = -1;
                    for (var c = 0; c < h.length; c++) if (h[c].imports.length < 25) {
                        i = c;
                        break;
                    }
                    if (i == -1) {
                        h.push(document.createStyleSheet());
                        i = h.length - 1;
                    }
                    h[i].addImport(g);
                    this._cssLinkMap[e] = {
                        tagIdx: i,
                        href: g
                    };
                } else {
                    var d = document.createElement('link');
                    d.rel = "stylesheet";
                    d.type = "text/css";
                    d.media = "all";
                    d.href = g;
                    this._cssLinkMap[e] = {
                        link: d
                    };
                    b.appendChild(d);
                }
                this._startCSSPoll(e);
                break;
            default:
                throw new TypeError("Bad resource type `" + j + "'.");
            }
        },
        _startCSSPoll: function (d) {
            var c = 'bootloader_' + d.replace(/[^a-z0-9]/ig, '_');

            function b(e, h, f, g) {
                g.deferUntil(e, h, false, function () {
                    window.Util;
                });
            }
            b(function () {
                return document.body;
            }, 5000, "Still no DOM", function () {
                var e = document.createElement('div');
                e.id = c;
                document.body.appendChild(e);
                b(function () {
                    var g = '42';
                    var f;
                    return e.offsetHeight == g || e.currentStyle && e.currentStyle.height == g + 'px' || window.getComputedStyle && (f = document.defaultView.getComputedStyle(e, null)) && f.getPropertyValue('height') == g + 'px';
                }, Bootloader._CSS_POLL_EXPIRATION, "CSS timeout", function () {
                    Bootloader.done([d], true);
                    e.parentNode.removeChild(e);
                });
            });
        },
        done: function (f, c) {
            f = Bootloader.resolveResources(f, 'name');
            var g = (a && a._preloaded) || [];
            (a || {})._preloaded = [];
            f = f.concat(g);
            this.requested(f);
            if (!c) {
                var e = {
                    sender: this
                };
                Arbiter.inform(Arbiter.BOOTLOAD, e, Arbiter.BEHAVIOR_EVENT);
            }
            for (var b = 0; b < f.length; ++b) {
                var d = f[b];
                Arbiter.inform(Arbiter.BOOTLOAD + '/' + d, true, Arbiter.BEHAVIOR_STATE);
            }
        },
        requested: function (c) {
            c = $A(c);
            for (var b = 0; b < c.length; ++b) this._requested[c[b]] = true;
        },
        enableBootload: function (b) {
            for (var c in b) if (!this._componentMap[c]) this._componentMap[c] = b[c];
        },
        _unloadResource: function (e) {
            if (e in this._cssLinkMap) {
                var c = this._cssLinkMap[e],
                    d = c.link;
                if (d) {
                    d.parentNode.removeChild(d);
                } else {
                    var f = this._styleTags[c.tagIdx];
                    for (var b = 0; b < f.imports.length; b++) if (f.imports[b].href == c.href) {
                        f.removeImport(b);
                        break;
                    }
                }
                delete this._cssLinkMap[e];
                delete this._requested[e];
                Arbiter.inform(Arbiter.BOOTLOAD + '/' + e, null, Arbiter.BEHAVIOR_STATE);
            }
        },
        getHardpoint: function () {
            if (!this._hardpoint) {
                var c, b = document.getElementsByTagName('head');
                if (b.length) {
                    c = b[0];
                } else c = document.body;
                this._hardpoint = c;
            }
            return this._hardpoint;
        },
        setResourceMap: function (c) {
            if (!c) return;
            for (var b in c) this._resources[b] = c[b];
        },
        resolveResources: function (e, b) {
            if (!e) return;
            var d = new Array(e.length);
            for (var c = 0; c < e.length; ++c) if (!e[c].type && e[c] in this._resources) {
                d[c] = this._resources[e[c]];
                if (b && (b in d[c])) d[c] = d[c][b];
            } else d[c] = e[c];
            return d;
        },
        loadEarlyResources: function (c) {
            this.loadResources(c);
            for (var b = 0; b < c.length; ++b) if (!c[b].permanent) this._earlyResources[c[b].name] = c[b];
        },
        _requested: {},
        _permanent: {},
        _componentMap: {},
        _cssLinkMap: {},
        _styleTags: [],
        _hardpoint: null,
        _resources: {},
        _earlyResources: {},
        _CSS_POLL_EXPIRATION: 5000
    };
})(window.Bootloader);

function get_intern_ref(c) {
    if ( !! c) {
        var b = {
            profile_minifeed: 1,
            info_tab: 1,
            gb_content_and_toolbar: 1,
            gb_muffin_area: 1,
            ego: 1,
            bookmarks_menu: 1,
            jewelBoxNotif: 1,
            jewelNotif: 1,
            BeeperBox: 1,
            navSearch: 1
        };
        for (var a = c; a && a != document.body; a = a.parentNode) {
            if (!a.id || typeof a.id !== 'string') continue;
            if (a.id.substr(0, 8) == 'pagelet_') return a.id.substr(8);
            if (a.id.substr(0, 8) == 'box_app_') return a.id;
            if (b[a.id]) return a.id;
        }
    }
    return '-';
}
function set_ue_cookie(a) {
    document.cookie = "act=" + encodeURIComponent(a) + "; path=/; domain=" + window.location.hostname.replace(/^.*(\.facebook\..*)$/i, '$1');
}
var user_action = (function () {
    var c = 0,
        a = 0,
        b = (!window.ArbiterMonitor) ? 'r' : 'a';
    return function (i, d, e) {
        var j = null,
            f = null,
            g = null;
        if (a) return;
        a = 1;
        setTimeout(function () {
            a = 0;
        }, 0);
        if ( !! e) {
            j = e.type;
            var h = 0;
            e.ctrlKey && (h += 1);
            e.shiftKey && (h += 2);
            e.altKey && (h += 4);
            e.metaKey && (h += 8);
            if (h) j += h;
        }
        if (!i && e) i = e.getTarget();
        if ( !! i) f = i.action || i.getAttribute && i.getAttribute('ajaxify') != '1' && i.getAttribute('ajaxify') || i.href || i.name;
        c++;
        var l = (+new Date());
        var k = l + '/' + c;
        set_ue_cookie(k);
        if (b == 'a') {
            ArbiterMonitor.initUE(k);
            g = ArbiterMonitor.get_intern_ref(i);
        }
        Arbiter.inform('user/action', {
            context: d,
            event: e,
            node: i
        });
        window.Log && Log('act', [l, c, f || '-', d, j || '-', g || get_intern_ref(i), b, window.URI ? URI.getRequestURI(true, true).getUnqualifiedURI().toString() : location.pathname + location.search + location.hash]);
    };
})();
ge = $ = function (a) {
    return typeof a == 'string' ? document.getElementById(a) : a;
};
CSS = window.CSS || {
    hasClass: function (b, a) {
        b = $(b);
        return (' ' + b.className + ' ').indexOf(' ' + a + ' ') > -1;
    },
    addClass: function (b, a) {
        b = $(b);
        if (a && !CSS.hasClass(b, a)) b.className = b.className + ' ' + a;
        return b;
    },
    removeClass: function (b, a) {
        b = $(b);
        b.className = b.className.replace(new RegExp('(^|\\s)' + a + '(?:\\s|$)', 'g'), '$1');
        return b;
    },
    toggleClass: function (b, a) {
        return CSS.conditionClass(b, a, !CSS.hasClass(b, a));
    },
    conditionClass: function (c, b, a) {
        return (a ? CSS.addClass : CSS.removeClass)(c, b);
    },
    show: function (a) {
        CSS.removeClass(a, 'hidden_elem');
    },
    hide: function (a) {
        CSS.addClass(a, 'hidden_elem');
    },
    toggle: function (a) {
        CSS.toggleClass(a, 'hidden_elem');
    }
};
var Parent = {
    byTag: function (a, b) {
        b = b.toUpperCase();
        while (a && a.nodeName != b) a = a.parentNode;
        return a;
    },
    byClass: function (b, a) {
        while (b && !CSS.hasClass(b, a)) b = b.parentNode;
        return b;
    }
};

function () {
    var a = document;
    var b = a.documentElement;
    var c = null;
    b.onclick = function (d) {
        d = d || window.event;
        c = d.target || d.srcElement;
        var e = Parent.byTag(c, 'A') || b;
        var f = e.getAttribute('ajaxify') || e.href;
        f && user_action(e, 'a', d);
        switch (e.rel) {
        case 'dialog':
        case 'dialog-post':
            Bootloader.loadComponents('dialog', function () {
                Dialog.bootstrap(f, null, e.rel == 'dialog');
            });
            break;
        case 'async':
        case 'async-post':
            Bootloader.loadComponents('async', function () {
                AsyncRequest.bootstrap(f, e);
            });
            break;
        case 'theater':
            if (d.altKey || d.ctrlKey || d.metaKey || d.shiftKey || (d.which && d.which != 1)) return;
            Bootloader.loadComponents('PhotoTheater', function () {
                PhotoTheater.bootstrap(f, e);
            });
            break;
        default:
            return;
        }
        return false;
    };
    b.onsubmit = function (d) {
        d = d || window.event;
        var e = d.target || d.srcElement;
        if (!e || e.nodeName != 'FORM' || !e.getAttribute('ajaxify')) return;
        user_action(e, 'f', d);
        Bootloader.loadComponents('dom-form', function () {
            Form.bootstrap(e, c);
        });
        return false;
    };
    b.className = b.className.replace('no_js', '');
}();
Function.prototype.extend = function (a) {
    if (typeof a != 'string') throw new TypeError('You must extend() with the name of a class, not the function object. ' + 'This generally means you need to replace "Dog.extend(Animal);" with ' + '"Dog.extend(\'Animal\');".');
    if (!Metaprototype._arbiterHandle) Metaprototype._arbiterHandle = Arbiter.subscribe(Arbiter.BOOTLOAD, Metaprototype._onbootload.bind(Metaprototype));
    Metaprototype._queue(this, a);
};

function Metaprototype() {}
copy_properties(Metaprototype, {
    _pending: {},
    _queue: function (b, c) {
        b.__class_extending = true;
        var a = Arbiter.registerCallback(bind(Metaprototype, Metaprototype._apply, b, c), [Arbiter.FUNCTION_EXTENSION + '/' + c, Arbiter.BOOTLOAD]);
        if (a !== null) this._pending[c] = true;
    },
    _onbootload: function (b, a) {
        this._update();
    },
    _update: function () {
        for (var a in this._pending) if ( !! window[a]) {
            delete this._pending[a];
            if (!window[a].__class_extending) {
                Arbiter.inform(Arbiter.FUNCTION_EXTENSION + '/' + a, true, Arbiter.BEHAVIOR_STATE);
            } else window[a].__class_name = a;
        }
    },
    _apply: function (a, c) {
        delete a.__class_extending;
        var d = __metaprototype(window[c], 0);
        var b = __metaprototype(a, d.prototype.__level + 1);
        b.parent = d;
        if ( !! a.__class_name) Arbiter.inform(Arbiter.FUNCTION_EXTENSION + '/' + a.__class_name, true, Arbiter.BEHAVIOR_STATE);
    }
});

function __metaprototype(c, a) {
    if (c.__metaprototype) return c.__metaprototype;
    var b = new Function();
    b.construct = __metaprototype_construct;
    b.prototype.construct = __metaprototype_wrap(c, a, true);
    b.prototype.__level = a;
    b.base = c;
    c.prototype.parent = b;
    c.__metaprototype = b;
    return b;
}
function __metaprototype_construct(a) {
    __metaprototype_init(a.parent);
    var c = [];
    var b = a;
    while (b.parent) {
        c.push(new_obj = new b.parent());
        new_obj.__instance = a;
        b = b.parent;
    }
    a.parent = c[1];
    c.reverse();
    c.pop();
    a.__parents = c;
    a.__instance = a;
    return a.parent.construct.apply(a.parent, arguments);
}
function __metaprototype_init(d) {
    if (d.initialized) return;
    var a = d.base.prototype;
    if (d.parent) {
        __metaprototype_init(d.parent);
        var e = d.parent.prototype;
        for (var b in e) if (b != '__level' && b != 'construct' && a[b] === undefined) a[b] = d.prototype[b] = e[b];
    }
    d.initialized = true;
    var c = d.prototype.__level;
    for (var b in a) if (b != 'parent') a[b] = d.prototype[b] = __metaprototype_wrap(a[b], c);
}
function __metaprototype_wrap(c, b, d) {
    if (typeof c != 'function' || c.__prototyped) return c;
    var a = function () {
        var g = this.__instance;
        if (g) {
            var h = g.parent;
            g.parent = b ? g.__parents[b - 1] : null;
            if (d) {
                var e = [];
                for (var f = 1; f < arguments.length; f++) e.push(arguments[f]);
                var i = c.apply(g, e);
            } else var i = c.apply(g, arguments);
            g.parent = h;
            return i;
        } else return c.apply(this, arguments);
    };
    a.__prototyped = true;
    return a;
}
Function.prototype.mixin = function () {
    var a = [this.prototype].concat(Array.prototype.slice.call(arguments));
    Function.mixin.apply(null, a);
};
Function.mixin = function () {
    for (var b = 1, a = arguments.length; b < a; ++b) copy_properties(arguments[0], Mixins[arguments[b]] || arguments[b]);
};
Function.prototype.bind = function (b) {
    var a = [b, this].concat(Array.prototype.slice.call(arguments, 1));
    return bind.apply(null, a);
};
Function.prototype.curry = Function.prototype.bind.bind(null, null);
Function.prototype.shield = function (b) {
    if (typeof this != 'function') throw new TypeException();
    var a = this.bind.apply(this, $A(arguments));
    return function () {
        return a();
    };
};
Function.prototype.defer = function (b, a) {
    if (typeof this != 'function') throw new TypeError();
    b = b || 0;
    return setTimeout(this, b, a);
};
Function.prototype.recur = function (b, a) {
    if (typeof this != 'function') throw new TypeError();
    return setInterval(this, b, a);
};

function bagofholding() {}
function bagof(a) {
    return function () {
        return a;
    };
}
function abstractMethod() {
    throw new Error('You must implement this function in your base class.');
}
function identity(a) {
    return a;
}
var Mixins = {
    Arbiter: {
        _getArbiterInstance: function () {
            return this._arbiter || (this._arbiter = new Arbiter());
        },
        inform: function (c, b, a) {
            return this._getArbiterInstance().inform(c, b, a);
        },
        subscribe: function (c, a, b) {
            return this._getArbiterInstance().subscribe(c, a, b);
        },
        unsubscribe: function (a) {
            this._getArbiterInstance().unsubscribe(a);
        }
    }
};
var ua = {
    ie: function () {
        return ua._populate() || this._ie;
    },
    firefox: function () {
        return ua._populate() || this._firefox;
    },
    opera: function () {
        return ua._populate() || this._opera;
    },
    safari: function () {
        return ua._populate() || this._safari;
    },
    safariPreWebkit: function () {
        return ua._populate() || this._safari < 500;
    },
    chrome: function () {
        return ua._populate() || this._chrome;
    },
    windows: function () {
        return ua._populate() || this._windows;
    },
    osx: function () {
        return ua._populate() || this._osx;
    },
    linux: function () {
        return ua._populate() || this._linux;
    },
    iphone: function () {
        return ua._populate() || this._iphone;
    },
    _populated: false,
    _populate: function () {
        if (ua._populated) return;
        ua._populated = true;
        var a = /(?:MSIE.(\d+\.\d+))|(?:(?:Firefox|GranParadiso|Iceweasel).(\d+\.\d+))|(?:Opera(?:.+Version.|.)(\d+\.\d+))|(?:AppleWebKit.(\d+(?:\.\d+)?))/.exec(navigator.userAgent);
        var c = /(Mac OS X)|(Windows)|(Linux)/.exec(navigator.userAgent);
        var b = /\b(iPhone|iP[ao]d)/.exec(navigator.userAgent);
        if (a) {
            ua._ie = a[1] ? parseFloat(a[1]) : NaN;
            if (ua._ie >= 8 && !window.HTMLCollection) ua._ie = 7;
            ua._firefox = a[2] ? parseFloat(a[2]) : NaN;
            ua._opera = a[3] ? parseFloat(a[3]) : NaN;
            ua._safari = a[4] ? parseFloat(a[4]) : NaN;
            if (ua._safari) {
                a = /(?:Chrome\/(\d+\.\d+))/.exec(navigator.userAgent);
                ua._chrome = a && a[1] ? parseFloat(a[1]) : NaN;
            } else ua._chrome = NaN;
        } else ua._ie = ua._firefox = ua._opera = ua._chrome = ua._safari = NaN;
        if (c) {
            ua._osx = !! c[1];
            ua._windows = !! c[2];
            ua._linux = !! c[3];
        } else ua._osx = ua._windows = ua._linux = false;
        ua._iphone = b;
    }
};
OnloadEvent = {
    ONLOAD: 'onload/onload',
    ONLOAD_CALLBACK: 'onload/onload_callback',
    ONLOAD_DOMCONTENT: 'onload/dom_content_ready',
    ONLOAD_DOMCONTENT_CALLBACK: 'onload/domcontent_callback',
    ONBEFOREUNLOAD: 'onload/beforeunload',
    ONUNLOAD: 'onload/unload'
};

function _include_quickling_events_default() {
    return !window.loading_page_chrome;
}
function onbeforeunloadRegister(a, b) {
    if (b === undefined) b = _include_quickling_events_default();
    b ? _addHook('onbeforeleavehooks', a) : _addHook('onbeforeunloadhooks', a);
}
function onunloadRegister(a) {
    if (!window.onunload) window.onunload = function () {
        Arbiter.inform(OnloadEvent.ONUNLOAD, true, Arbiter.BEHAVIOR_STATE);
    };
    _addHook('onunloadhooks', a);
}
function onleaveRegister(a) {
    _addHook('onleavehooks', a);
}
function _addHook(b, a) {
    window[b] = (window[b] || []).concat(a);
}
function removeHook(a) {
    window[a] = [];
}
function _domcontentready() {
    Arbiter.inform(OnloadEvent.ONLOAD_DOMCONTENT, true, Arbiter.BEHAVIOR_STATE);
}
function _bootstrapEventHandlers() {
    var a = document,
        d = window;
    if (a.addEventListener) {
        if (ua.safari() < 525) {
            var c = setInterval(function () {
                if (/loaded|complete/.test(a.readyState)) {
                    _domcontentready();
                    clearInterval(c);
                }
            }, 10);
        } else a.addEventListener("DOMContentLoaded", _domcontentready, true);
    } else {
        var b = 'javascript:void(0)';
        if (d.location.protocol == 'https:') b = '//:';
        a.write('<script onreadystatechange="if (this.readyState==\'complete\') {' + 'this.parentNode.removeChild(this);_domcontentready();}" ' + 'defer="defer" src="' + b + '"><\/script\>');
    }
    d.onload = function () {
        d.CavalryLogger && CavalryLogger.getInstance().setTimeStamp('t_layout');
        var e = a && a.body && a.body.offsetWidth;
        Arbiter.inform(OnloadEvent.ONLOAD, true, Arbiter.BEHAVIOR_STATE);
    };
    d.onbeforeunload = function () {
        var e = {};
        Arbiter.inform(OnloadEvent.ONBEFOREUNLOAD, e, Arbiter.BEHAVIOR_STATE);
        if (!e.warn) Arbiter.inform('onload/exit', true);
        return e.warn;
    };
}
onload_callback = Arbiter.registerCallback(function () {
    window.CavalryLogger && CavalryLogger.getInstance().setTimeStamp('t_onload');
    Arbiter.inform(OnloadEvent.ONLOAD_CALLBACK, true, Arbiter.BEHAVIOR_STATE);
}, [OnloadEvent.ONLOAD]);
domcontent_callback = Arbiter.registerCallback(function () {
    window.CavalryLogger && CavalryLogger.getInstance().setTimeStamp('t_domcontent');
    Arbiter.inform(OnloadEvent.ONLOAD_DOMCONTENT_CALLBACK, true, Arbiter.BEHAVIOR_STATE);
}, [OnloadEvent.ONLOAD_DOMCONTENT]);
if (!window._eventHandlersBootstrapped) {
    _eventHandlersBootstrapped = true;
    _bootstrapEventHandlers();
}

function tx(b, a) {
    if (typeof _string_table == 'undefined') return;
    b = _string_table[b];
    return _tx(b, a);
}
function intl_ends_in_punct(a) {
    if (typeof a != 'string') return false;
    return a.match(new RegExp(intl_ends_in_punct.punct_char_class + '[' + ')"' + "'" + '\u00BB' + '\u0F3B' + '\u0F3D' + '\u2019' + '\u201D' + '\u203A' + '\u3009' + '\u300B' + '\u300D' + '\u300F' + '\u3011' + '\u3015' + '\u3017' + '\u3019' + '\u301B' + '\u301E' + '\u301F' + '\uFD3F' + '\uFF07' + '\uFF09' + '\uFF3D' + '\s' + ']*$'));
}
intl_ends_in_punct.punct_char_class = '[' + '.!?' + '\u3002' + '\uFF01' + '\uFF1F' + '\u0964' + '\u2026' + '\u0EAF' + '\u1801' + '\u0E2F' + '\uFF0E' + ']';

function intl_render_list_separator() {
    return _tx("{previous-items}, {next-items}", {
        'previous-items': '',
        'next-items': ''
    });
}
function intl_phonological_rules(e) {
    var c, b = e,
        d = window.intl_locale_rewrites;
    try {
        if (d) {
            var pats = [],
                reps = [];
            for (var p in d.patterns) {
                var pat = p,
                    rep = d.patterns[p];
                for (var m in d.meta) {
                    c = new RegExp(m.slice(1, -1), 'g');
                    pat = pat.replace(c, d.meta[m]);
                    rep = rep.replace(c, d.meta[m]);
                }
                pats[pats.length] = pat;
                reps[reps.length] = rep;
            }
            for (var ii = 0; ii < pats.length; ii++) {
                c = new RegExp(pats[ii].slice(1, -1), 'g');
                if (reps[ii] == 'javascript') {
                    if (m = new String(e.match(c))) e = e.replace(c, m.slice(1).toLowerCase());
                } else e = e.replace(c, reps[ii]);
            }
        }
    } catch (a) {
        e = b;
    }
    c = new RegExp('\x01', 'g');
    e = e.replace(c, '');
    return e;
}
function _tx(e, a) {
    if (a) if (!(typeof a != 'object')) {
        var d;
        for (var c in a) {
            if (intl_ends_in_punct(a[c])) {
                d = new RegExp('\{' + c + '\}' + intl_ends_in_punct.punct_char_class + '*', 'g');
            } else d = new RegExp('\{' + c + '\}', 'g');
            var b = '';
            if (a[c][0] != '~') b = '\x01';
            e = e.replace(d, b + a[c] + b);
        }
        e = intl_phonological_rules(e);
    }
    return e;
}
InitialJSLoader = {
    INITIAL_JS_READY: 'BOOTLOAD/JSREADY',
    load: function (a) {
        InitialJSLoader.callback = Bootloader.loadResources(a, InitialJSLoader.callback);
    },
    callback: Arbiter.registerCallback(function () {
        Arbiter.inform(InitialJSLoader.INITIAL_JS_READY, true, Arbiter.BEHAVIOR_STATE);
    }, [OnloadEvent.ONLOAD_DOMCONTENT_CALLBACK])
};

function goURI(b, a) {
    b = b.toString();
    if (!a && window.PageTransitions && PageTransitions.isInitialized()) {
        PageTransitions.go(b);
    } else if (window.location.href == b) {
        window.location.reload();
    } else window.location.href = b;
}
function loadExternalJavascript(f, b, a) {
    if (f instanceof Array) {
        var e = f.shift(0);
        if (e) {
            loadExternalJavascript(e, function () {
                if (f.length) {
                    loadExternalJavascript(f, b, a);
                } else b && b();
            }, a);
        } else if (b) b();
    } else {
        var c = a ? document.body : document.getElementsByTagName('head')[0];
        var d = document.createElement('script');
        d.type = 'text/javascript';
        d.src = f;
        if (b) {
            d.onerror = d.onload = b;
            d.onreadystatechange = function () {
                if (this.readyState == "complete" || this.readyState == "loaded") b();
            };
        }
        c.appendChild(d);
        return d;
    }
}
var rsrcProvideAndRequire = function () {
    var c = {},
        d = {};

    function b(i, f, e) {
        if (i in d) {
            e = e || {};
            for (var g in d[i].requires) if (!(g in e)) {
                for (var h in d[i].provides) e[h] = 1;
                if ((g in f) || b(g, f, e)) return true;
            }
        }
        return false;
    }
    function a() {
        do {
            var e = false;
            for (var f in d) {
                var h = d[f];
                for (var g in h.requires) if (!c[g] && !b(g, h.provides)) {
                    h = null;
                    break;
                }
                if (h) {
                    for (g in h.provides) {
                        delete d[g];
                        c[g] = 1;
                    }
                    h.fn.call();
                    e = true;
                }
            }
        } while (e);
    }
    return function (h, i, f) {
        var e = {
            provides: h,
            requires: i,
            fn: f
        };
        for (var g in h) d[g] = e;
        a();
    };
}();

function invoke_callbacks(b, d) {
    if (b) for (var c = 0; c < b.length; c++) try {
        (new Function(b[c])).apply(d);
    } catch (a) {}
}
var KEYS = {
    BACKSPACE: 8,
    TAB: 9,
    RETURN: 13,
    ESC: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    DELETE: 46,
    COMMA: 188
};

function BigPipe(a) {
    copy_properties(this, {
        arbiter: Arbiter,
        rootNodeID: 'content',
        lid: 0,
        isAjax: false,
        isReplay: false,
        rrEnabled: true,
        domContentCallback: domcontent_callback,
        onloadCallback: onload_callback,
        domContentEvt: OnloadEvent.ONLOAD_DOMCONTENT_CALLBACK,
        onloadEvt: OnloadEvent.ONLOAD_CALLBACK,
        _phaseDoneCallbacks: [],
        _currentPhase: 0,
        _lastPhase: -1,
        _timeout: 20
    });
    copy_properties(this, a);
    this._cavalry = (this.lid && window.CavalryLogger) ? CavalryLogger.getInstance(this.lid) : null;
    this._inst = this._cavalry && (window._pagelet_profile || this._cavalry.isPageletProfiler());
    BigPipe._current_instance = this;
    this.arbiter.registerCallback(this.domContentCallback, ['pagelet_displayed_all']);
    this.arbiter.inform('phase_begin_0', true, Arbiter.BEHAVIOR_STATE);
    this._inst && this._cavalry.setTimeStamp('t_phase_begin_0');
}
copy_properties(BigPipe.prototype, {
    _ct: function (a) {
        return (!a || 'length' in a && a.length === 0) ? {} : a;
    },
    _displayPagelet: function (d) {
        for (var c in this._ct(d.content)) {
            if (d.append) {
                if (d.append === 'bigpipe_root') {
                    target_id = this.rootNodeID;
                } else target_id = d.append;
            } else target_id = c;
            var b = document.getElementById(target_id);
            var a = d.content[c];
            if (b) {
                if (a) if (d.append || ua.ie() < 8) {
                    if (!d.append) while (b.firstChild) b.removeChild(b.firstChild);
                    this._appendNodes(b, a);
                } else b.innerHTML = a;
                if (this._inst) this._cavalry.onPageletEvent('display', d.id);
            } else window.Util && false;
        }
        this.arbiter.inform(d.id + '_displayed', true, Arbiter.BEHAVIOR_STATE);
    },
    _appendNodes: function (a, d) {
        var e = document.createElement('div');
        var c = ua.ie() < 7;
        if (c) a.appendChild(e);
        e.innerHTML = d;
        var b = document.createDocumentFragment();
        while (e.firstChild) b.appendChild(e.firstChild);
        a.appendChild(b);
        if (c) a.removeChild(e);
    },
    _downloadJsForPagelet: function (a) {
        Bootloader.loadResources(a.js, bind(this, function () {
            if (this._inst) this._cavalry.onPageletEvent('jsdone', a.id);
            if (!this.isAjax || a.phase >= 1) a.requires.push('uipage_onload');
            var c = bind(this, function () {
                if (!this._isRelevant()) return;
                invoke_callbacks(a.onload);
                if (this._inst) this._cavalry.onPageletEvent('onload', a.id);
                this.arbiter.inform('pagelet_onload', true, Arbiter.BEHAVIOR_EVENT);
                if (a.page_cache) {
                    if (!a.id) a.html = $("content").innerHTML;
                    Quickling.cacheAndExecResponse(a, true);
                }
                a.provides && this.arbiter.inform(a.provides, true, Arbiter.BEHAVIOR_STATE);
            });
            var b = bind(this, function () {
                this._isRelevant() && invoke_callbacks(a.onafterload);
            });
            this.arbiter.registerCallback(c, a.requires);
            this.arbiter.registerCallback(b, [this.onloadEvt]);
        }), false, a.id);
    },
    _downloadCssAndDisplayPagelet: function (b) {
        if (this._inst) this._cavalry.onPageletEvent('css', b.id);
        var a = bind(this, function () {
            var c = b.display_dependency || [];
            var e = [];
            for (var d = 0; d < c.length; d++) e.push(c[d] + '_displayed');
            this.arbiter.registerCallback(this._displayPagelet.bind(this, b), e);
        });
        if (this.isReplay) {
            Bootloader.loadResources(b.css, null, false, b.id);
            a();
        } else Bootloader.loadResources(b.css, a, false, b.id);
    },
    onPageletArrive: function (a) {
        if (this._inst) this._cavalry.onPageletEvent('arrive', a.id);
        var b = a.phase;
        if (!this._phaseDoneCallbacks[b]) this._phaseDoneCallbacks[b] = this.arbiter.registerCallback(this._onPhaseDone.bind(this), ['phase_complete_' + b]);
        if (a.the_end) this._lastPhase = a.phase;
        if (a.tti_phase) this._ttiPhase = a.tti_phase;
        Bootloader.setResourceMap(a.resource_map);
        Bootloader.enableBootload(this._ct(a.bootloadable));
        this.arbiter.registerCallback(this._downloadCssAndDisplayPagelet.bind(this, a), ['phase_begin_' + b]);
        this.arbiter.registerCallback(this._downloadJsForPagelet.bind(this, a), [this.domContentEvt]);
        this.onloadCallback = this.arbiter.registerCallback(this.onloadCallback, ['pagelet_onload']);
        this.arbiter.registerCallback(this._phaseDoneCallbacks[b], [a.id + '_displayed']);
        a.is_last && this.arbiter.inform('phase_complete_' + b, true, Arbiter.BEHAVIOR_STATE);
        a.invalidate_cache && a.invalidate_cache.length && Arbiter.inform(Arbiter.PAGECACHE_INVALIDATE, a.invalidate_cache);
    },
    _onPhaseDone: function () {
        if (this._currentPhase === this._ttiPhase && this.rrEnabled) {
            this.arbiter.inform('tti_bigpipe', {
                s: this.lid
            }, Arbiter.BEHAVIOR_EVENT);
            this._cavalry && this._cavalry.measurePageLoad(true);
        }
        var b = this._currentPhase + 1;
        var a = bind(this, function () {
            this._inst && this._cavalry.setTimeStamp('t_phase_begin_' + b);
            this.arbiter.inform('phase_begin_' + b, true, Arbiter.BEHAVIOR_STATE);
        });
        if (this.isReplay) {
            a();
        } else setTimeout(a, this._timeout);
        if (this._currentPhase === this._lastPhase) this.arbiter.inform('pagelet_displayed_all', true, Arbiter.BEHAVIOR_STATE);
        this._currentPhase++;
    },
    _isRelevant: function () {
        return this == BigPipe._current_instance || this.isReplay;
    }
});

function incorporate_fragment(a, b) {
    if (b && a.pathname == '/') return;
    var d = /^(?:(?:[^:\/?#]+):)?(?:\/\/(?:[^\/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?/;
    var c = '';
    a.href.replace(d, function (e, h, i, g) {
        var f, j;
        f = j = h + (i ? '?' + i : '');
        if (g) {
            g = g.replace(/^(!|%21)/, '');
            if (g.charAt(0) == '/') f = g.replace(/^\/+/, '/');
        }
        f = b + f;
        if (f != j) window.location.replace(c + f);
    });
}
if (window._is_quickling_index !== undefined) incorporate_fragment(window.location, window._is_quickling_index);
!
function () {
    var c = document.documentElement;
    var b = 'child_focused';
    var d = 'DOMControl_placeholder';
    var a = function (e) {
        e = e || window.event;
        var f = e.target || e.srcElement,
            h = f.getAttribute('placeholder');
        if (h) {
            var g = Parent.byClass(f, 'focus_target');
            if ('focus' == e.type || 'focusin' == e.type) {
                if (f.value == h) {
                    f.value = '';
                    CSS.removeClass(f, d);
                    g && CSS.addClass(g, b);
                }
            } else if (f.value == '') {
                CSS.addClass(f, d);
                f.value = h;
                g && CSS.removeClass(g, b);
            }
        }
    };
    c.onfocusin = c.onfocusout = a;
    if (c.addEventListener) {
        c.addEventListener('focus', a, true);
        c.addEventListener('blur', a, true);
    }
}();
!
function () {
    document.documentElement.onkeydown = function (a) {
        a = a || window.event;
        var b = a.target || a.srcElement;
        var c = a.keyCode == KEYS.RETURN && !a.shiftKey && CSS.hasClass(b, 'enter_submit');
        if (c) {
            Bootloader.loadComponents(['dom', 'input-methods'], function () {
                if (!Input.isEmpty(b)) {
                    var d = DOM.scry(b.form, '.enter_submit_target')[0] || DOM.scry(b.form, '[type="submit"]')[0];
                    d && d.click();
                }
            });
            return false;
        }
    };
}();

function fc_click(a, b) {
    user_action(a, 'ufi');
    fc_expand(a, b);
}
function fc_expand(a, b) {
    var c = a.form;
    CSS.removeClass(c, 'collapsed_comments');
    CSS.removeClass(c, 'hidden_add_comment');
    if (b !== false) c.add_comment_text.focus();
    return false;
}

if (window.Bootloader) {
    Bootloader.done(["js\/bmq929sp95w04swo.pkg.js"]);
}


/*
HTTP Host: b.static.ak.fbcdn.net
Generated: October 20th 2010 4:23:13 PM PDT
Machine: 10.138.17.186
*/

if (window.CavalryLogger) {
    CavalryLogger.start_js(["js\/8a1ruf3lmug4s8cw.pkg.js"]);
}

function object(b) {
    var a = new Function();
    a.prototype = b;
    return new a();
}
function is_scalar(a) {
    return /string|number|boolean/.test(typeof a);
}
function keys(c) {
    if (hasArrayNature(c)) throw new TypeError('keys() was passed an array.');
    var b = [];
    for (var a in c) b.push(a);
    return b;
}
function values(b) {
    if (hasArrayNature(b)) throw new TypeError('values() was passed an array; use $A().');
    var c = [];
    for (var a in b) c.push(b[a]);
    return c;
}
function count(c) {
    if (hasArrayNature(c)) throw new TypeError('count() was passed an array.');
    var a = 0;
    for (var b in c) a++;
    return a;
}
function are_equal(a, b) {
    return JSON.encode(a) == JSON.encode(b);
}
function merge() {
    var b = {};
    for (var a = 0; a < arguments.length; a++) copy_properties(b, arguments[a]);
    return b;
}
function head(b) {
    for (var a in b) return b[a];
    return null;
}
Object.from = function (c, e) {
    if (!hasArrayNature(c)) throw new TypeError('Must pass an array of keys.');
    var d = {};
    var b = hasArrayNature(e);
    if (typeof e == 'undefined') e = true;
    for (var a = c.length; a--;) d[c[a]] = b ? e[a] : e;
    return d;
};

function coalesce() {
    for (var a = 0; a < arguments.length; ++a) if (arguments[a] != null) return arguments[a];
    return null;
}
Array.prototype.map = function (a, e) {
    if (this == window) throw new TypeError();
    if (typeof(a) !== "function") throw new TypeError();
    var b;
    var c = this.length;
    var d = new Array(c);
    for (b = 0; b < c; ++b) if (b in this) d[b] = a.call(e, this[b], b, this);
    return d;
};
Array.prototype.forEach = function (a, b) {
    this.map(a, b);
    return this;
};
Array.prototype.each = function (a, b) {
    return this.forEach.apply(this, arguments);
};
Array.prototype.filter = function (a, e) {
    a = a || identity;
    if (this == window) throw new TypeError();
    if (typeof(a) !== "function") throw new TypeError();
    var b, f, c = this.length,
        d = [];
    for (b = 0; b < c; ++b) if (b in this) {
        f = this[b];
        if (a.call(e, f, b, this)) d.push(f);
    }
    return d;
};
Array.prototype.every = function (a, b) {
    return (this.filter(a, b).length == this.length);
};
Array.prototype.some = function (a, b) {
    return (this.filter(a, b).length > 0);
};
Array.prototype.pull = function (b) {
    if (this == window) throw new TypeError();
    if (typeof(b) == 'string') {
        var c = b;
        b = function () {
            return this[c];
        };
    }
    if (typeof(b) !== 'function') throw new TypeError();
    var a = Array.prototype.slice.call(arguments, 1);
    var e = this.length;
    var f = new Array(e);
    for (var d = 0; d < e; ++d) if (d in this) f[d] = b.apply(this[d], a);
    return f;
};
Array.prototype.reduce = null;
Array.prototype.reduceRight = null;
Array.prototype.sort = (function (a) {
    return function (b) {
        return (this == window) ? null : (b ? a.call(this, function (c, d) {
            return b(c, d);
        }) : a.call(this));
    };
})(Array.prototype.sort);
Array.prototype.reverse = (function (a) {
    return function () {
        return (this == window) ? null : a.call(this);
    };
})(Array.prototype.reverse);
Array.prototype.concat = (function (a) {
    return function () {
        return (this == window) ? null : a.apply(this, arguments);
    };
})(Array.prototype.concat);
Array.prototype.slice = (function (a) {
    return function () {
        return (this == window) ? null : a.apply(this, arguments);
    };
})(Array.prototype.slice);
Array.prototype.clone = Array.prototype.slice;
if (Array.prototype.indexOf) {
    Array.prototype.indexOf = (function (a) {
        return function (c, b) {
            return (this == window) ? null : a.apply(this, arguments);
        };
    })(Array.prototype.indexOf);
} else Array.prototype.indexOf = function (d, b) {
    if (this == window) throw new TypeError();
    var c = this.length;
    var a = Number(b) || 0;
    a = (a < 0) ? Math.ceil(a) : Math.floor(a);
    if (a < 0) a += c;
    for (; a < c; a++) if (a in this && this[a] === d) return a;
    return -1;
};
Array.prototype.contains = function (a) {
    return this.indexOf(a) != -1;
};
Array.prototype.remove = function (b) {
    var a = this.indexOf(b);
    if (a != -1) this.splice(a, 1);
};

function mapToInt(a) {
    return a.map(function (c, b) {
        return parseInt(c, 10);
    });
}
function unique(a) {
    var c = {};
    var d = [];
    for (var b = 0; b < a.length; b++) {
        var e = a[b];
        if (!c[e]) d.push(e);
        c[e] = 1;
    }
    return d;
}
function array_set_add(a, b) {
    if (!a.contains(b)) a.push(b);
    return a;
}
function array_intersect(a, b) {
    var d = [];
    for (var c = 0; c < a.length; c++) if (b.contains(a[c])) d.push(a[c]);
    return d;
}

function muffinize(d) {
    var c = 'a';
    var b = 'd';
    var a = [c, b].join('');
    return d.replace(/muffin/g, a);
}
var Util = window.Util || {
    isDevelopmentEnvironment: function () {
        return env_get('dev');
    },
    warn: bagofholding,
    error: bagofholding,
    info: bagofholding,
    group: bagofholding,
    groupEnd: bagofholding,
    dir: bagofholding,
    log: bagofholding,
    stack: bagofholding,
    trace: bagofholding,
    slog: bagofholding
};
if (typeof console == 'undefined') console = {
    log: bagofholding
};

function URI(a) {
    if (a === window) return;
    if (this === window) return new URI(a || window.location.href);
    this.parse(a || '');
}
copy_properties(URI, {
    getRequestURI: function (a, b) {
        a = a === undefined || a;
        if (a && window.PageTransitions && PageTransitions.isInitialized()) {
            return PageTransitions.getCurrentURI( !! b).getQualifiedURI();
        } else return new URI(window.location.href);
    },
    getMostRecentURI: function () {
        if (window.PageTransitions && PageTransitions.isInitialized()) {
            return PageTransitions.getMostRecentURI().getQualifiedURI();
        } else return new URI(window.location.href);
    },
    expression: /(((\w+):\/\/)([^\/:]*)(:(\d+))?)?([^#?]*)(\?([^#]*))?(#(.*))?/,
    arrayQueryExpression: /^(\w+)((?:\[\w*\])+)=?(.*)/,
    explodeQuery: function (g) {
        if (!g) return {};
        var h = {};
        g = g.replace(/%5B/ig, '[').replace(/%5D/ig, ']');
        g = g.split('&');
        for (var b = 0, d = g.length; b < d; b++) {
            var e = g[b].match(URI.arrayQueryExpression);
            if (!e) {
                var j = g[b].split('=');
                h[URI.decodeComponent(j[0])] = j[1] === undefined ? null : URI.decodeComponent(j[1]);
            } else {
                var c = e[2].split(/\]\[|\[|\]/).slice(0, -1);
                var f = e[1];
                var k = URI.decodeComponent(e[3] || '');
                c[0] = f;
                var i = h;
                for (var a = 0; a < c.length - 1; a++) if (c[a]) {
                    if (i[c[a]] === undefined) if (c[a + 1] && !c[a + 1].match(/\d+$/)) {
                        i[c[a]] = {};
                    } else i[c[a]] = [];
                    i = i[c[a]];
                } else {
                    if (c[a + 1] && !c[a + 1].match(/\d+$/)) {
                        i.push({});
                    } else i.push([]);
                    i = i[i.length - 1];
                }
                if (i instanceof Array && c[c.length - 1] == '') {
                    i.push(k);
                } else i[c[c.length - 1]] = k;
            }
        }
        return h;
    },
    implodeQuery: function (f, e, a) {
        e = e || '';
        if (a === undefined) a = true;
        var g = [];
        if (f === null || f === undefined) {
            g.push(a ? URI.encodeComponent(e) : e);
        } else if (f instanceof Array) {
            for (var c = 0; c < f.length; ++c) try {
                if (f[c] !== undefined) g.push(URI.implodeQuery(f[c], e ? (e + '[' + c + ']') : c));
            } catch (b) {}
        } else if (typeof(f) == 'object') {
            if (DOM.isNode(f)) {
                g.push('{node}');
            } else for (var d in f) try {
                if (f[d] !== undefined) g.push(URI.implodeQuery(f[d], e ? (e + '[' + d + ']') : d));
            } catch (b) {}
        } else if (a) {
            g.push(URI.encodeComponent(e) + '=' + URI.encodeComponent(f));
        } else g.push(e + '=' + f);
        return g.join('&');
    },
    encodeComponent: function (d) {
        var c = String(d).split(/([\[\]])/);
        for (var a = 0, b = c.length; a < b; a += 2) c[a] = window.encodeURIComponent(c[a]);
        return c.join('');
    },
    decodeComponent: function (a) {
        return window.decodeURIComponent(a.replace(/\+/g, ' '));
    }
});
copy_properties(URI.prototype, {
    parse: function (b) {
        var a = b.toString().match(URI.expression);
        copy_properties(this, {
            protocol: a[3] || '',
            domain: a[4] || '',
            port: a[6] || '',
            path: a[7] || '',
            query_s: a[9] || '',
            fragment: a[11] || ''
        });
        return this;
    },
    setProtocol: function (a) {
        this.protocol = a;
        return this;
    },
    getProtocol: function () {
        return this.protocol;
    },
    setQueryData: function (a) {
        this.query_s = URI.implodeQuery(a);
        return this;
    },
    addQueryData: function (a) {
        return this.setQueryData(copy_properties(this.getQueryData(), a));
    },
    removeQueryData: function (b) {
        if (!(b instanceof Array)) b = [b];
        var d = this.getQueryData();
        for (var a = 0, c = b.length; a < c; ++a) delete d[b[a]];
        return this.setQueryData(d);
    },
    getQueryData: function () {
        return URI.explodeQuery(this.query_s);
    },
    setFragment: function (a) {
        this.fragment = a;
        return this;
    },
    getFragment: function () {
        return this.fragment;
    },
    setDomain: function (a) {
        this.domain = a;
        return this;
    },
    getDomain: function () {
        return this.domain;
    },
    setPort: function (a) {
        this.port = a;
        return this;
    },
    getPort: function () {
        return this.port;
    },
    setPath: function (a) {
        this.path = a;
        return this;
    },
    getPath: function () {
        return this.path.replace(/^\/+/, '/');
    },
    toString: function () {
        var a = '';
        this.protocol && (a += this.protocol + '://');
        this.domain && (a += this.domain);
        this.port && (a += ':' + this.port);
        if (this.domain && !this.path) a += '/';
        this.path && (a += this.path);
        this.query_s && (a += '?' + this.query_s);
        this.fragment && (a += '#' + this.fragment);
        return a;
    },
    valueOf: function () {
        return this.toString();
    },
    isFacebookURI: function () {
        if (!URI._facebookURIRegex) URI._facebookURIRegex = new RegExp('(^|\.)facebook\.(' + env_get('tlds').join('|') + ')([^.]*)$', 'i');
        return !this.domain || URI._facebookURIRegex.test(this.domain);
    },
    isQuicklingEnabled: function () {
        return window.Quickling && Quickling.isActive() && Quickling.isPageActive(this);
    },
    getRegisteredDomain: function () {
        if (!this.domain) return '';
        if (!this.isFacebookURI()) return null;
        var b = this.domain.split('.');
        var a = b.indexOf('facebook');
        return b.slice(a).join('.');
    },
    getTld: function (f) {
        if (!this.domain) return '';
        var d = this.domain.split('.');
        var e = d[d.length - 1];
        if (f) return e;
        var c = env_get('tlds');
        if (c.indexOf(e) == -1) for (var a = 0; a < c.length; ++a) {
            var b = c[a];
            if (new RegExp(b + '$').test(this.domain)) {
                e = b;
                break;
            }
        }
        return e;
    },
    getUnqualifiedURI: function () {
        return new URI(this).setProtocol(null).setDomain(null).setPort(null);
    },
    getQualifiedURI: function () {
        var b = new URI(this);
        if (!b.getDomain()) {
            var a = URI();
            b.setProtocol(a.getProtocol()).setDomain(a.getDomain()).setPort(a.getPort());
        }
        return b;
    },
    isSameOrigin: function (a) {
        var b = a || window.location.href;
        if (!(b instanceof URI)) b = new URI(b.toString());
        if (this.getProtocol() && this.getProtocol() != b.getProtocol()) return false;
        if (this.getDomain() && this.getDomain() != b.getDomain()) return false;
        return true;
    },
    go: function (a) {
        goURI(this, a);
    },
    setSubdomain: function (b) {
        var c = new URI(this).getQualifiedURI();
        var a = c.getDomain().split('.');
        if (a.length <= 2) {
            a.unshift(b);
        } else a[0] = b;
        return c.setDomain(a.join('.'));
    },
    getSubdomain: function () {
        if (!this.getDomain()) return '';
        var a = this.getDomain().split('.');
        if (a.length <= 2) {
            return '';
        } else return a[0];
    },
    isSecure: function () {
        return this.getProtocol() == 'https';
    }
});
window.aiert = (function (a) {
    var b = function _aiert(c) {
        if (window.last_alert) {
            (window.alerts = window.alerts || []).push((new Date()).getTime() - window.last_alert);
            window.alerts.splice(0, window.alerts.length - 3);
            if (window.alerts.length == 3 && window.alerts[0] + window.alerts[1] + window.alerts[2] < 200) {
                if (!confirm(c + '\n\nThis page may be caught in an infinite loop. Press "Cancel" to abort, or "Ok" to continue.')) window.aiert = bagofholding;
                window.last_alert = (new Date()).getTime();
                return;
            }
        }
        a(c);
        window.last_alert = (new Date()).getTime();
    };
    return b;
})(window.alert);
window.alert = function _alert(a) {
    if (typeof a != 'undefined') {
        new Image().src = URI('/ajax/typeahead_callback.php').addQueryData({
            l: document.location.href,
            m: a,
            t: Env && Math.round((new Date() - Env.start) / 100),
            d: typeof fbpd != 'undefined' ? JSON.encode(fbpd) : '',
            ai: window.aiert,
            al: window.alert
        }).toString();
        return window.aiert(a);
    }
};
window.onloadRegister = function (a) {
    window.loaded ? _runHook(a) : _addHook('onloadhooks', a);
};

function onafterloadRegister(a) {
    window.afterloaded ? setTimeout(function () {
        _runHook(a);
    }, 0) : _addHook('onafterloadhooks', a);
}
function _onloadHook() {
    !window.loaded && window.CavalryLogger && CavalryLogger.getInstance().setTimeStamp('t_prehooks');
    _runHooks('onloadhooks');
    !window.loaded && window.CavalryLogger && CavalryLogger.getInstance().setTimeStamp('t_hooks');
    window.loaded = true;
    Arbiter.inform('uipage_onload', true, Arbiter.BEHAVIOR_STATE);
    if (window.logOnloadData) aggregate_js_onload('onloadRegister');
}
function _onafterloadHook() {
    _runHooks('onafterloadhooks');
    window.afterloaded = true;
    if (window.logOnloadData) aggregate_js_onload('onafterloadRegister');
}
function _runHook(b) {
    try {
        b();
    } catch (a) {}
}
function _runHooks(d) {
    var f = d == 'onbeforeleavehooks' || d == 'onbeforeunloadhooks';
    var h = null;
    if (window.logOnloadData) {
        var g = new Date().getTime();
        window.totalHookTime = window.totalHookTime || {};
    }
    do {
        var c = window[d];
        if (!f) window[d] = null;
        if (!c) break;
        for (var e = 0; e < c.length; e++) try {
            if (f) {
                h = h || c[e]();
            } else c[e]();
        } catch (b) {}
        if (f) break;
    } while (window[d]);
    if (window.logOnloadData) {
        var a = new Date().getTime();
        window.totalHookTime[d] = a - g;
    }
    if (f && h) return h;
}
function keep_window_set_as_loaded() {
    if (window.loaded == false) {
        window.loaded = true;
        _runHooks('onloadhooks');
    }
    if (window.afterloaded == false) {
        window.afterloaded = true;
        _runHooks('onafterloadhooks');
    }
}
function log_js_onload(b, d, c) {
    window.logOnloadData = window.logOnloadData || {};
    window.logOnloadData[b] = window.logOnloadData[b] || {};
    var a = window.logOnloadData[b];
    if (a[c]) {
        a[c].count++;
        a[c].total_time += d;
    } else {
        a[c] = {};
        a[c] = {
            count: 1,
            total_time: d
        };
    }
}
function aggregate_js_onload(d) {
    var c = window.logOnloadData[d];
    var a = [];
    var f = 0;
    for (var e in c) {
        f += c[e].total_time;
        a.push(parseInt(c[e].total_time, 10) + 'ms : ' + parseInt(c[e].count, 10) + ' calls : ' + e.replace('Task_', '(Task) '));
    }
    if (!a.length) return;
    a.sort().reverse();
    var b;
    if (d == 'onloadRegister') {
        b = 'onloadhooks';
    } else b = 'onafterloadhooks';
    a.each(function (g) {});
    window.logOnloadData[d] = {};
}
Arbiter.registerCallback(_onloadHook, [OnloadEvent.ONLOAD_DOMCONTENT_CALLBACK, InitialJSLoader.INITIAL_JS_READY]);
Arbiter.registerCallback(_onafterloadHook, [OnloadEvent.ONLOAD_DOMCONTENT_CALLBACK, OnloadEvent.ONLOAD_CALLBACK, InitialJSLoader.INITIAL_JS_READY]);
Arbiter.subscribe(OnloadEvent.ONBEFOREUNLOAD, function (b, a) {
    a.warn = _runHooks('onbeforeleavehooks') || _runHooks('onbeforeunloadhooks');
    if (!a.warn) {
        window.loaded = false;
        window.afterloaded = false;
    }
}, Arbiter.SUBSCRIBE_NEW);
Arbiter.subscribe(OnloadEvent.ONUNLOAD, function (b, a) {
    _runHooks('onunloadhooks');
}, Arbiter.SUBSCRIBE_NEW);

function chain(d, e) {
    var b, a = [];
    for (var c = 0; c < arguments.length; c++) a.push(arguments[c]);
    b = function (event) {
        event = event || window.event;
        for (var f = 0; f < a.length; f++) if (a[f] && a[f].apply(this, arguments) === false) {
            return false;
        } else if (event && event.cancelBubble) return true;
        return true;
    };
    b.toString = function () {
        return chain._toString(a);
    };
    return b;
}
if (!chain._toString) chain._toString = function (b) {
    var d = 'chained fns',
        a = b.filter();
    for (var c = 0; c < b.length; c++) d += '\n' + b[c].toString();
    return d;
};
void(0);
var NavigationMessage = {
    NAVIGATION_BEGIN: 'NavigationMessage/navigationBegin',
    NAVIGATION_SELECT: 'NavigationMessage/navigationSelect',
    NAVIGATION_COMPLETED: 'NavigationMessage/navigationCompleted',
    NAVIGATION_FAILED: 'NavigationMessage/navigationFailed',
    NAVIGATION_COUNT_UPDATE: 'NavigationMessage/navigationCount',
    REFRESH_RIGHT_COLUMN: 'NavigationMessage/refreshRightColumn',
    PREFETCH: 'NavigationMessage/prefetch',
    INTERNAL_LOADING_BEGIN: 'NavigationMessage/internalLoadingBegin',
    INTERNAL_LOADING_COMPLETED: 'NavigationMessage/internalLoadingCompleted'
};

function AsyncSignal(b, a) {
    this.data = a || {};
    if (window.Env && Env.tracking_domain && b.charAt(0) == '/') b = Env.tracking_domain + b;
    this.uri = b;
    this.handler = null;
}
AsyncSignal.prototype.setHandler = function (a) {
    this.handler = a;
    return this;
};
AsyncSignal.prototype.send = function () {
    var c = this.handler,
        b = this.data,
        g = this.uri,
        f = [],
        d = new Image(),
        a = document.getElementById('post_form_id');
    b.asyncSignal = Math.floor(Math.random() * 10000) + 1;
    if (a) b.post_form_id = a.value;
    for (var e in b) f.push(encodeURIComponent(e) + '=' + encodeURIComponent(b[e]));
    if (g.indexOf('?') == -1) g += '?';
    g += f.join('&');
    if (c) d.onload = d.onerror = (function (i, h) {
        return function () {
            h((i.height == 1));
        };
    })(d, c);
    d.src = g;
    return this;
};

function HTML(a) {
    if (this === window) {
        if (a instanceof HTML) return a;
        return new HTML(a);
    }
    this._content = a;
    this._defer = false;
    this._extra_action = '';
    this._nodes = null;
    this._inline_js = bagofholding;
    this._has_option_elements = false;
    return this;
}
copy_properties(HTML.prototype, {
    toString: function () {
        var a = this._content;
        if (this._extra_action) a += '<script type="text/javascript">' + this._extra_action + '</scr' + 'ipt>';
        return a;
    },
    setAction: function (a) {
        this._extra_action = a;
        return this;
    },
    getAction: function () {
        this._fillCache();
        var a = function () {
            this._inline_js();
            eval_global(this._extra_action);
        }.bind(this);
        if (this.getDeferred()) {
            return a.defer.bind(a);
        } else return a;
    },
    setDeferred: function (a) {
        this._defer = !! a;
        return this;
    },
    getDeferred: function () {
        return this._defer;
    },
    getContent: function () {
        return this._content;
    },
    getNodes: function () {
        this._fillCache();
        return this._nodes;
    },
    getRootNode: function () {
        return this.getNodes()[0];
    },
    hasOptionElements: function () {
        this._fillCache();
        return this._has_option_elements;
    },
    _fillCache: function () {
        if (null !== this._nodes) return;
        var d = this._content;
        if (!d) {
            this._nodes = [];
            return;
        }
        d = d.replace(/(<(\w+)[^>]*?)\/>/g, function (l, m, n) {
            return n.match(/^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i) ? l : m + '></' + n + '>';
        });
        var h = d.trim().toLowerCase(),
            k = document.createElement('div'),
            b = false;
        var j = (!h.indexOf('<opt') && [1, '<select multiple="multiple" class="__WRAPPER">', '</select>']) || (!h.indexOf('<leg') && [1, '<fieldset class="__WRAPPER">', '</fieldset>']) || (h.match(/^<(thead|tbody|tfoot|colg|cap)/) && [1, '<table class="__WRAPPER">', '</table>']) || (!h.indexOf('<tr') && [2, '<table><tbody class="__WRAPPER">', '</tbody></table>']) || ((!h.indexOf('<td') || !h.indexOf('<th')) && [3, '<table><tbody><tr class="__WRAPPER">', '</tr></tbody></table>']) || (!h.indexOf('<col') && [2, '<table><tbody></tbody><colgroup class="__WRAPPER">', '</colgroup></table>']) || null;
        if (null === j) {
            k.className = '__WRAPPER';
            if (ua.ie()) {
                j = [0, '<span style="display:none">&nbsp;</span>', ''];
                b = true;
            } else j = [0, '', ''];
        }
        k.innerHTML = j[1] + d + j[2];
        while (j[0]--) k = k.lastChild;
        if (b) k.removeChild(k.firstChild);
        k.className != '__WRAPPER';
        if (0 != k.getElementsByTagName('option').length) this._has_option_elements = true;
        if (ua.ie()) {
            var i;
            if (!h.indexOf('<table') && -1 == h.indexOf('<tbody')) {
                i = k.firstChild && k.firstChild.childNodes;
            } else if (j[1] == '<table>' && -1 == h.indexOf('<tbody')) {
                i = k.childNodes;
            } else i = [];
            for (var f = i.length - 1; f >= 0; --f) if (i[f].nodeName && i[f].nodeName.toLowerCase() == 'tbody' && i[f].childNodes.length == 0) i[f].parentNode.removeChild(i[f]);
        }
        var g = k.getElementsByTagName('script');
        var a = [];
        for (var e = 0; e < g.length; e++) if (g[e].src) {
            a.push(Bootloader.requestResource.bind(Bootloader, 'js', g[e].src));
        } else a.push(eval_global.bind(null, g[e].innerHTML));
        for (var e = g.length - 1; e >= 0; e--) g[e].parentNode.removeChild(g[e]);
        var c = function () {
            for (var l = 0; l < a.length; l++) a[l]();
        };
        this._nodes = $A(k.childNodes);
        this._inline_js = c;
    }
});
var DOM = {
    find: function (a, c) {
        var b = DOM.scry(a, c);
        if (1 != b.length) return null;
        return b[0];
    },
    scry: function (j, v) {
        if (!j) return [];
        var w = v.split(' ');
        var d = [j];
        var i = j === document;
        for (var m = 0; m < w.length; m++) {
            if (d.length == 0) break;
            if (w[m] == '') continue;
            var u = w[m];
            var s = [];
            var zd = false;
            if (u.charAt(0) == '^') if (m == 0) {
                zd = true;
                u = u.slice(1);
            } else return;
            u = u.replace(/\./g, ' .');
            u = u.replace(/\#/g, ' #');
            u = u.replace(/\[/g, ' [');
            var z = u.split(' ');
            var za = z[0] || '*';
            var n = z[1] && z[1].charAt(0) == '#';
            if (n) {
                var h = ge(z[1].slice(1), true);
                if (h && ('*' == za || h.tagName.toLowerCase() == za)) for (var q = 0; q < d.length; q++) if (zd && DOM.contains(h, d[q])) {
                    s = [h];
                    break;
                } else if (document == d[q] || DOM.contains(d[q], h)) {
                    s = [h];
                    break;
                }
            } else {
                var zc = [];
                var c = d.length;
                for (var o = 0; o < c; o++) {
                    if (zd) {
                        var k = [];
                        var g = d[o].parentNode;
                        var a = za == '*';
                        while (DOM.isNode(g, DOM.NODE_TYPES.ELEMENT)) {
                            if (a || g.tagName.toLowerCase() == za) k.push(g);
                            g = g.parentNode;
                        }
                    } else var k = d[o].getElementsByTagName(za);
                    var l = k.length;
                    for (var r = 0; r < l; r++) zc.push(k[r]);
                }
                for (var x = 1; x < z.length; x++) {
                    var y = z[x];
                    var p = y.charAt(0) == '.';
                    var e = y.substring(1);
                    for (var o = 0; o < zc.length; o++) {
                        var zb = zc[o];
                        if (!zb) continue;
                        if (p) {
                            if (!CSS.hasClass(zb, e)) delete zc[o];
                            continue;
                        } else {
                            var f = y.slice(1, y.length - 1);
                            if (f.indexOf('=') == -1) {
                                if (zb.getAttribute(f) === null) {
                                    delete zc[o];
                                    continue;
                                }
                            } else {
                                var t = f.split('=');
                                var b = t[0];
                                var ze = t[1];
                                ze = ze.slice(1, ze.length - 1);
                                if (zb.getAttribute(b) != ze) {
                                    delete zc[o];
                                    continue;
                                }
                            }
                        }
                    }
                }
                for (var o = 0; o < zc.length; o++) if (zc[o]) {
                    s.push(zc[o]);
                    if (zd) break;
                }
            }
            d = s;
        }
        return d;
    },
    getText: (function () {
        var a = document.createElement('div'),
            b = a.innerText == null ? 'textContent' : 'innerText';
        return function (c) {
            if (!c) {
                return '';
            } else if (DOM.isNode(c, DOM.NODE_TYPES.TEXT)) {
                return c.data;
            } else return c[b];
        };
    })(),
    getSelection: function () {
        var b = window.getSelection,
            a = document.selection;
        if (b) {
            return b() + '';
        } else if (a) return a.createRange().text;
        return null;
    },
    create: function (c, a, b) {
        c = document.createElement(c);
        if (a) {
            a = copy_properties({}, a);
            if (a.style) {
                copy_properties(c.style, a.style);
                delete a.style;
            }
            for (var d in a) if (d.toLowerCase().indexOf('on') == 0) {
                if (!(typeof a[d] != 'function')) if (window.Event && Event.listen) {
                    Event.listen(c, d.substr(2), a[d]);
                } else c[d] = a[d];
                delete a[d];
            }
            copy_properties(c, a);
        }
        if (b != undefined) DOM.setContent(c, b);
        return c;
    },
    prependContent: function (c, b) {
        if (!DOM.isNode(c)) throw new Error('DOM.prependContent: reference element is not a node');
        var a = function (d) {
            if (c.firstChild) {
                c.insertBefore(d, c.firstChild);
            } else c.appendChild(d);
        };
        return DOM._addContent(b, a, c);
    },
    insertAfter: function (c, b) {
        if (!DOM.isNode(c) || !c.parentNode) throw new Error('DOM.insertAfter: reference element is not a node');
        var a = function (d) {
            if (c.nextSibling) {
                c.parentNode.insertBefore(d, c.nextSibling);
            } else c.parentNode.appendChild(d);
        };
        return DOM._addContent(b, a, c.parentNode);
    },
    insertBefore: function (b, c) {
        if (!DOM.isNode(c) || !c.parentNode) throw new Error('DOM.insertBefore: reference element is not a node or ' + 'does not have a parent.');
        var a = function (d) {
            c.parentNode.insertBefore(d, c);
        };
        return DOM._addContent(b, a, c.parentNode);
    },
    setContent: function (b, a) {
        if (!DOM.isNode(b)) throw new Error('DOM.setContent: reference element is not a node');
        DOM.empty(b);
        return DOM.appendContent(b, a);
    },
    appendContent: function (c, b) {
        if (!DOM.isNode(c)) throw new Error('DOM.appendContent: reference element is not a node');
        var a = function (d) {
            c.appendChild(d);
        };
        return DOM._addContent(b, a, c);
    },
    replace: function (c, b) {
        if (!DOM.isNode(c) || !c.parentNode) throw new Error('DOM.replace: reference element must be a node with a' + ' parent');
        var a = function (d) {
            c.parentNode.replaceChild(d, c);
        };
        return DOM._addContent(b, a, c.parentNode);
    },
    remove: function (a) {
        a = $(a);
        if (a.parentNode) a.parentNode.removeChild(a);
    },
    empty: function (a) {
        a = $(a);
        while (a.firstChild) DOM.remove(a.firstChild);
    },
    contains: function (b, a) {
        b = ge(b);
        a = ge(a);
        if (!b || !a) {
            return false;
        } else if (b === a) {
            return true;
        } else if (DOM.isNode(b, '#text')) {
            return false;
        } else if (DOM.isNode(a, '#text')) {
            return DOM.contains(b, a.parentNode);
        } else if (b.contains) {
            return b.contains(a);
        } else if (b.compareDocumentPosition) {
            return !!(b.compareDocumentPosition(a) & 16);
        } else return false;
    },
    getRootElement: function () {
        var a = null;
        if (window.Quickling && Quickling.isActive()) a = ge('content');
        return a || document.body;
    },
    isNode: function (d, e) {
        if (typeof(Node) == 'undefined') Node = null;
        try {
            if (!d || !((Node != undefined && d instanceof Node) || d.nodeName)) return false;
        } catch (a) {
            return false;
        }
        if (typeof(e) !== 'undefined') {
            e = $A(e).map(function (g) {
                return (g + '').toUpperCase();
            });
            var c, f;
            try {
                c = new String(d.nodeName).toUpperCase();
                f = d.nodeType;
            } catch (a) {
                return false;
            }
            for (var b = 0; b < e.length; b++) try {
                if (c == e[b] || f == e[b]) return true;
            } catch (a) {}
            return false;
        }
        return true;
    },
    NODE_TYPES: {
        ELEMENT: 1,
        ATTRIBUTE: 2,
        TEXT: 3,
        CDATA_SECTION: 4,
        ENTITY_REFERENCE: 5,
        ENTITY: 6,
        PROCESSING_INSTRUCTION: 7,
        COMMENT: 8,
        DOCUMENT: 9,
        DOCUMENT_TYPE: 10,
        DOCUMENT_FRAGMENT: 11,
        NOTATION_NODE: 12
    },
    _addContent: function (d, a, l) {
        if (d instanceof HTML && -1 == d.toString().indexOf('<scr' + 'ipt') && '' == l.innerHTML) {
            var g = ua.ie();
            if (!g || (g > 7 && !DOM.isNode(l, ['table', 'tbody', 'thead', 'tfoot', 'tr', 'select', 'fieldset']))) {
                l.innerHTML = d;
                return;
            }
        } else if (DOM.isNode(l, DOM.NODE_TYPES.TEXT)) {
            l.data = d;
            return;
        }
        var i, e = [],
            b = [];
        var f = document.createDocumentFragment();
        if (!(d instanceof Array)) d = [d];
        for (var h = 0; h < d.length; h++) {
            i = d[h];
            if (i instanceof HTML) {
                b.push(i.getAction());
                var k = i.getNodes(),
                    c;
                for (var j = 0; j < k.length; j++) {
                    c = (ua.safari() || (ua.ie() && i.hasOptionElements())) ? k[j] : k[j].cloneNode(true);
                    e.push(c);
                    f.appendChild(c);
                }
            } else if (is_scalar(i)) {
                var m = document.createTextNode(i);
                e.push(m);
                f.appendChild(m);
            } else if (DOM.isNode(i)) {
                e.push(i);
                f.appendChild(i);
            } else if (!(i instanceof Array)) i !== null;
        }
        a(f);
        for (var h = 0; h < b.length; h++) b[h]();
        return e;
    }
};

function $N(c, a, b) {
    if (typeof a != 'object' || DOM.isNode(a) || a instanceof Array || a instanceof HTML) {
        b = a;
        a = null;
    }
    return DOM.create(c, a, b);
}
var $$ = function _$$(a) {
    return DOM.scry.apply(null, [document].concat($A(arguments)));
};

function collect_data_attrib(d, g) {
    var f = {};
    var c = 'data-' + g;
    while (d && !DOM.isNode(d, 'body')) {
        var b = d.getAttribute(c);
        if (b) {
            var a = JSON.decode(b);
            for (var e in a) if (f[e] == undefined) f[e] = a[e];
        }
        d = d.parentNode;
    }
    return f;
}
var ft = {
    NF_SOURCE_MINIFEED: 9,
    NF_SOURCE_STREAM: 10,
    NF_SOURCE_HIGHLIGHTS: 11,
    NF_EVENT_SEE_MORE: 28,
    NF_EVENT_HOVERCARD_IMPRESSION: 39,
    enableFeedTracking: function () {
        ft.feedTrackingIsEnabled = true;
        onleaveRegister(function () {
            ft.feedTrackingIsEnabled = false;
        });
    },
    logElemNew: function (a, c) {
        if (!ft.feedTrackingIsEnabled) return;
        if (a.context != 'click' && a.context != 'a' && a.context != 'ufi') return;
        var b = collect_data_attrib(a.node, 'ft');
        if (count(b)) {
            b.dest = a.href;
            ft.logData(b, c);
        }
    },
    logData: function (a, b) {
        var c = {};
        copy_properties(c, a);
        if (b) copy_properties(c, b);
        new AsyncSignal('/ajax/f2.php', {
            link_data: JSON.encode(c)
        }).send();
    }
};
onloadRegister(function () {
    Arbiter.subscribe('user/action', function (b, a) {
        ft.logElemNew(a);
    });
});

function RenderManager(a) {
    copy_properties(this, {
        _isDirty: false,
        _obj: a
    });
}
copy_properties(RenderManager.prototype, {
    dirty: function () {
        if (!this._isDirty) {
            this._isDirty = true;
            bind(this, this.doPaint).defer();
        }
    },
    doPaint: function () {
        this._isDirty = false;
        this._obj.paint();
    }
});

function CounterDisplay(a, f, g, d, c) {
    copy_properties(this, {
        _name: a,
        _valueNode: $(f),
        _wrapperNode: $(g) || null,
        _statusClass: c,
        _rm: new RenderManager(this),
        _arbiterSubscription: null,
        _count: 0
    });
    var b = this._valueNode.firstChild;
    if (b) {
        var e = parseInt(b.nodeValue, 10);
        if (!isNaN(e)) this._count = e;
    }
    this._statusNode = d ? $(d) : null;
    this._subscribeAll();
    CounterDisplay.instances.push(this);
    onleaveRegister(this._destroy.bind(this), true);
}
copy_properties(CounterDisplay, {
    EVENT_TYPE_ADJUST: 'CounterDisplay/adjust',
    EVENT_TYPE_UPDATE: 'CounterDisplay/update',
    instances: [],
    adjustCount: function (a, b) {
        Arbiter.inform(CounterDisplay.EVENT_TYPE_ADJUST + '/' + a, b);
    },
    setCount: function (a, b) {
        Arbiter.inform(CounterDisplay.EVENT_TYPE_UPDATE + '/' + a, b);
    }
});
CounterDisplay.mixin({
    _destroy: function () {
        delete this._valueNode;
        delete this._wrapperNode;
        if (this._arbiterSubscription) {
            Arbiter.unsubscribe(this._arbiterSubscription);
            delete this._arbiterSubscription;
        }
        CounterDisplay.instances.remove(this);
    },
    adjustCount: function (a) {
        this._count = Math.max(0, this._count + a);
        this._rm.dirty();
        return this;
    },
    setCount: function (a) {
        this._count = Math.max(0, a);
        this._rm.dirty();
        return this;
    },
    paint: function () {
        DOM.setContent(this._valueNode, this._count);
        if (this._wrapperNode) CSS.conditionClass(this._wrapperNode, 'hidden_elem', this._count <= 0);
        if (this._statusClass && this._statusNode) CSS.conditionClass(this._statusNode, this._statusClass, this._count > 0);
    },
    _subscribeAll: function () {
        var a = [CounterDisplay.EVENT_TYPE_ADJUST + '/' + this._name, CounterDisplay.EVENT_TYPE_UPDATE + '/' + this._name];
        this._arbiterSubscription = Arbiter.subscribe(a, this._onInform.bind(this), Arbiter.SUBSCRIBE_NEW);
    },
    _onInform: function (a, b) {
        b = parseInt(b);
        if (isNaN(b)) return;
        if (a.indexOf(CounterDisplay.EVENT_TYPE_ADJUST) != -1) {
            this.adjustCount(b);
        } else if (a.indexOf(CounterDisplay.EVENT_TYPE_UPDATE) != -1) {
            this.setCount(b);
        } else return;
        return;
    }
});
DataStore = window.DataStore || {
    _storage: {},
    _elements: {},
    _tokenCounter: 1,
    _NOT_IN_DOM_CONST: 1,
    _getStorage: function (a) {
        var b;
        if (typeof a == 'string') {
            b = 'str_' + a;
        } else {
            b = 'elem_' + (a.__FB_TOKEN || (a.__FB_TOKEN = [DataStore._tokenCounter++]))[0];
            DataStore._elements[b] = a;
        }
        return DataStore._storage[b] || (DataStore._storage[b] = {});
    },
    _shouldDeleteData: function (a) {
        if (!a.nodeName) return false;
        try {
            if (null != a.offsetParent) return false;
        } catch (b) {}
        if (document.documentElement.contains) {
            return !document.documentElement.contains(a);
        } else return (document.documentElement.compareDocumentPosition(a) & DataStore._NOT_IN_DOM_CONST);
    },
    set: function (c, b, d) {
        var a = DataStore._getStorage(c);
        a[b] = d;
        return c;
    },
    get: function (e, d, c) {
        var b = DataStore._getStorage(e),
            f = b[d];
        if (typeof f === 'undefined' && e.getAttribute) {
            var a = e.getAttribute('data-' + d);
            f = (null === a) ? undefined : a;
        }
        if ((c !== undefined) && (f === undefined)) f = b[d] = c;
        return f;
    },
    remove: function (c, b) {
        var a = DataStore._getStorage(c),
            d = a[b];
        delete a[b];
        return d;
    },
    cleanup: function () {
        var b, a;
        for (b in DataStore._elements) {
            a = DataStore._elements[b];
            if (DataStore._shouldDeleteData(a)) {
                delete DataStore._storage[b];
                delete DataStore._elements[b];
            }
        }
    }
};
window.Event = window.Event ||
function () {};
Event.DATASTORE_KEY = 'Event.listeners';
if (!Event.prototype) Event.prototype = {};

function $E(a) {
    a = a || window.event || {};
    if (!a._inherits_from_prototype) for (var c in Event.prototype) try {
        a[c] = Event.prototype[c];
    } catch (b) {}
    return a;
}(function () {
    copy_properties(Event.prototype, {
        _inherits_from_prototype: true,
        stop: function () {
            this.cancelBubble = true;
            this.stopPropagation && this.stopPropagation();
            return this;
        },
        prevent: function () {
            this.returnValue = false;
            this.preventDefault && this.preventDefault();
            return this;
        },
        kill: function () {
            this.stop().prevent();
            return false;
        },
        getTarget: function () {
            var g = this.target || this.srcElement;
            return g ? $(g) : null;
        },
        getRelatedTarget: function () {
            var g = this.relatedTarget || this.fromElement;
            return g ? $(g) : null;
        },
        getModifiers: function () {
            var g = {
                control: !! this.ctrlKey,
                shift: !! this.shiftKey,
                alt: !! this.altKey,
                meta: !! this.metaKey
            };
            g.access = ua.osx() ? g.control : g.alt;
            g.any = g.control || g.shift || g.alt || g.meta;
            return g;
        }
    });
    copy_properties(Event, {
        listen: function (h, p, j, m) {
            if (typeof h == 'string') h = $(h);
            if (typeof m == 'undefined') m = Event.Priority.NORMAL;
            if (typeof p == 'object') {
                var i = {};
                for (var o in p) i[o] = Event.listen(h, o, p[o], m);
                return i;
            }
            if (p.match(/^on/i)) throw new TypeError("Bad event name `" + event + "': use `click', not `onclick'.");
            p = p.toLowerCase();
            var k = DataStore.get(h, b, {});
            if (f[p]) {
                var g = f[p];
                p = g.base;
                j = g.wrap(j);
            }
            a(h, p);
            var q = k[p];
            if (!(m in q)) q[m] = [];
            var l = q[m].length,
                n = new EventHandlerRef(j, q[m], l);
            q[m].push(n);
            return n;
        },
        fire: function (g, i, event) {
            var h = DataStore.get(g, Event.DATASTORE_KEY + i);
            if (h) return h($E(event));
        },
        stop: function (g) {
            return $E(g).stop();
        },
        prevent: function (g) {
            return $E(g).prevent();
        },
        kill: function (g) {
            return $E(g).kill();
        },
        getKeyCode: function (event) {
            event = $E(event);
            if (!event) return false;
            switch (event.keyCode) {
            case 63232:
                return 38;
            case 63233:
                return 40;
            case 63234:
                return 37;
            case 63235:
                return 39;
            case 63272:
            case 63273:
            case 63275:
                return null;
            case 63276:
                return 33;
            case 63277:
                return 34;
            }
            if (event.shiftKey) switch (event.keyCode) {
            case 33:
            case 34:
            case 37:
            case 38:
            case 39:
            case 40:
                return null;
            }
            return event.keyCode;
        },
        getPriorities: function () {
            if (!e) {
                var g = values(Event.Priority);
                g.sort(function (h, i) {
                    return h - i;
                });
                e = g;
            }
            return e;
        }
    });
    var e = null,
        b = Event.DATASTORE_KEY;
    var c = function (g) {
        return function (h) {
            if (!DOM.contains(this, h.getRelatedTarget())) return g.call(this, h);
        };
    };
    var f = {
        mouseenter: {
            base: 'mouseover',
            wrap: c
        },
        mouseleave: {
            base: 'mouseout',
            wrap: c
        }
    };
    var a = function (g, l) {
        var h = 'on' + l;
        var k = d.bind(g);
        var j = DataStore.get(g, b);
        if (l in j) return;
        j[l] = {};
        if (g.addEventListener) {
            g.addEventListener(l, k, false);
        } else if (g.attachEvent) g.attachEvent(h, k);
        DataStore.set(g, b + l, k);
        if (g[h]) {
            var i = g[h];
            g[h] = null;
            Event.listen(g, l, i, Event.Priority.TRADITIONAL);
        }
    };
    var d = function (event) {
        event = $E(event);
        var n = event.type;
        if (!DataStore.get(this, b)) throw new Error("Bad listenHandler context.");
        var o = DataStore.get(this, b)[n];
        if (!o) throw new Error("No registered handlers for `" + n + "'.");
        if (n == 'click') {
            var i = Parent.byTag(event.getTarget(), 'a');
            if (i && i.getAttribute && i.getAttribute('href', 2)) user_action(i, 'click', event);
        }
        var k = Event.getPriorities();
        for (var j = 0; j < k.length; j++) {
            var l = k[j];
            if (l in o) {
                var g = o[l];
                for (var h = 0; h < g.length; h++) {
                    if (!g[h]) continue;
                    var m = g[h].fire(this, event);
                    if (m === false) {
                        return event.kill();
                    } else if (event.cancelBubble) return event.stop();
                }
            }
        }
        return event.returnValue;
    };
})();
Event.Priority = {
    URGENT: -20,
    TRADITIONAL: -10,
    NORMAL: 0
};

function EventHandlerRef(b, a, c) {
    this._handler = b;
    this._container = a;
    this._index = c;
}
EventHandlerRef.prototype = {
    remove: function () {
        delete this._handler;
        delete this._container[this._index];
    },
    fire: function (a, event) {
        return this._handler.call(a, event);
    }
};
add_properties('Hovercard', {
    active: {},
    init: function () {
        if (ua.ie() < 7) return;
        Event.listen(document.documentElement, 'mouseover', this.handle.bind(this));
    },
    handle: function (event) {
        var a = Parent.byTag(event.getTarget(), 'a');
        if (this.setActive(a)) {
            (this.process || this.bootload).call(this, a);
            event.stop();
        }
    },
    bootload: function (a) {
        this.bootload = bagofholding;
        Bootloader.loadComponents(['hovercard-core'], function () {
            if (a == this.active.node) this.process(a);
        }.bind(this));
    },
    getEndpoint: function (a) {
        return a.getAttribute('data-hovercard');
    },
    setActive: function (b) {
        var a;
        if (!b || !(a = this.getEndpoint(b))) {
            this.active = {};
            return false;
        }
        if (this.active.node != b) {
            this.active.moveToken && this.active.moveToken.remove();
            this.active = {
                node: b,
                endpoint: a,
                pos: null
            };
        }
        return true;
    }
});
onloadRegister(Hovercard.init.bind(Hovercard));
String.prototype.trim = function () {
    if (this == window) return null;
    return this.replace(/^\s*|\s*$/g, '');
};

function trim(b) {
    try {
        return String(b.toString()).trim();
    } catch (a) {
        return '';
    }
}
String.prototype.startsWith = function (a) {
    if (this == window) return null;
    return this.substring(0, a.length) == a;
};
String.prototype.endsWith = function (a) {
    if (this == window) return null;
    return this.length >= a.length && this.substring(this.length - a.length) == a;
};
String.prototype.split = (function (a) {
    return function (h, e) {
        var b = "";
        if (h === null || e === null) {
            return [];
        } else if (typeof h == 'string') {
            return a.call(this, h, e);
        } else if (h === undefined) {
            return [this.toString()];
        } else if (h instanceof RegExp) {
            if (!h._2 || !h._1) {
                b = h.toString().replace(/^[\S\s]+\//, "");
                if (!h._1) if (!h.global) {
                    h._1 = new RegExp(h.source, "g" + b);
                } else h._1 = 1;
            }
            separator1 = h._1 === 1 ? h : h._1;
            var i = (h._2 ? h._2 : h._2 = new RegExp("^" + separator1.source + "$", b));
            if (e === undefined || e < 0) {
                e = false;
            } else {
                e = Math.floor(e);
                if (!e) return [];
            }
            var f, g = [],
                d = 0,
                c = 0;
            while ((e ? c++ <= e : true) && (f = separator1.exec(this))) {
                if ((f[0].length === 0) && (separator1.lastIndex > f.index)) separator1.lastIndex--;
                if (separator1.lastIndex > d) {
                    if (f.length > 1) f[0].replace(i, function () {
                        for (var j = 1; j < arguments.length - 2; j++) if (arguments[j] === undefined) f[j] = undefined;
                    });
                    g = g.concat(this.substring(d, f.index), (f.index === this.length ? [] : f.slice(1)));
                    d = separator1.lastIndex;
                }
                if (f[0].length === 0) separator1.lastIndex++;
            }
            return (d === this.length) ? (separator1.test("") ? g : g.concat("")) : (e ? g : g.concat(this.substring(d)));
        } else return a.call(this, h, e);
    };
})(String.prototype.split);
add_properties('CSS', {
    shown: function (a) {
        return !CSS.hasClass(a, 'hidden_elem');
    },
    setClass: function (b, a) {
        $(b).className = a || '';
        return b;
    },
    setStyle: function (a, b, d) {
        switch (b) {
        case 'opacity':
            var c = (d == 1);
            a.style.opacity = c ? '' : '' + d;
            a.style.filter = c ? '' : 'alpha(opacity=' + d * 100 + ')';
            break;
        case 'float':
            a.style.cssFloat = a.style.styleFloat = d;
            break;
        default:
            b = b.replace(/-(.)/g, function (e, f) {
                return f.toUpperCase();
            });
            a.style[b] = d;
        }
        return a;
    },
    getStyle: function (b, d) {
        b = $(b);

        function c(e) {
            return e.replace(/([A-Z])/g, '-$1').toLowerCase();
        }
        if (window.getComputedStyle) {
            var a = window.getComputedStyle(b, null);
            if (a) return a.getPropertyValue(c(d));
        }
        if (document.defaultView && document.defaultView.getComputedStyle) {
            var a = document.defaultView.getComputedStyle(b, null);
            if (a) return a.getPropertyValue(c(d));
            if (d == "display") return "none";
        }
        if (b.currentStyle) return b.currentStyle[d];
        return b.style[d];
    },
    getOpacity: function (a) {
        a = $(a);
        var b = CSS.getStyle(a, 'filter');
        var c = null;
        if (b && (c = /(\d+(?:\.\d+)?)/.exec(b))) {
            return parseFloat(c.pop()) / 100;
        } else if (b = CSS.getStyle(a, 'opacity')) {
            return parseFloat(b);
        } else return 1;
    }
});

function show() {
    for (var b = 0; b < arguments.length; b++) {
        var a = ge(arguments[b]);
        if (a && a.style) a.style.display = '';
    }
    return false;
}
function hide() {
    for (var b = 0; b < arguments.length; b++) {
        var a = ge(arguments[b]);
        if (a && a.style) a.style.display = 'none';
    }
    return false;
}
function shown(a) {
    a = ge(a);
    return (a.style.display != 'none' && !(a.style.display == '' && a.offsetWidth == 0));
}
function toggle() {
    for (var b = 0; b < arguments.length; b++) {
        var a = $(arguments[b]);
        a.style.display = CSS.getStyle(a, "display") == 'block' ? 'none' : 'block';
    }
    return false;
}
function toggleDisplayNone() {
    for (var b = 0; b < arguments.length; b++) {
        var a = $(arguments[b]);
        if (shown(a)) {
            hide(a);
        } else show(a);
    }
    return false;
}

function setCookie(a, b, d, e) {
    if (d) {
        var f = new Date();
        var c = new Date();
        c.setTime(f.getTime() + d);
    }
    document.cookie = a + "=" + encodeURIComponent(b) + "; " + (d ? "expires=" + c.toGMTString() + "; " : "") + "path=" + (e || '/') + "; domain=" + window.location.hostname.replace(/^.*(\.facebook\..*)$/i, '$1');
}
function clearCookie(a) {
    document.cookie = a + "=; expires=Sat, 01 Jan 2000 00:00:00 GMT; " + "path=/; domain=" + window.location.hostname.replace(/^.*(\.facebook\..*)$/i, '$1');
}
function getCookie(d) {
    var e = d + "=";
    var b = document.cookie.split(';');
    for (var c = 0; c < b.length; c++) {
        var a = b[c];
        while (a.charAt(0) == ' ') a = a.substring(1, a.length);
        if (a.indexOf(e) == 0) return decodeURIComponent(a.substring(e.length, a.length));
    }
    return null;
}
add_properties('Input', {
    isEmpty: function (a) {
        return (a.value || '').match(/^\s*$/) || CSS.hasClass(a, 'DOMControl_placeholder');
    },
    getValue: function (a) {
        return Input.isEmpty(a) ? '' : a.value;
    },
    setValue: function (a, b) {
        CSS.removeClass(a, 'DOMControl_placeholder');
        a.value = b;
    },
    setPlaceholder: function (a, b) {
        a.setAttribute('title', b);
        a.setAttribute('placeholder', b);
        if (Input.isEmpty(a)) {
            CSS.addClass(a, 'DOMControl_placeholder');
            a.value = b;
        }
    },
    reset: function (a) {
        Input.setValue(a, '');
        var b = a.getAttribute('placeholder');
        b && Input.setPlaceholder(a, b);
    },
    setSubmitOnEnter: function (a, b) {
        CSS.conditionClass(a, 'enter_submit', b);
    },
    getSubmitOnEnter: function (a) {
        return CSS.hasClass(a, 'enter_submit');
    }
});

function Vector2(b, c, a) {
    copy_properties(this, {
        x: parseFloat(b),
        y: parseFloat(c),
        domain: a || 'pure'
    });
}
copy_properties(Vector2.prototype, {
    toString: function () {
        return '(' + this.x + ', ' + this.y + ')';
    },
    add: function (c, d) {
        if (arguments.length == 1) {
            if (c.domain != 'pure') c = c.convertTo(this.domain);
            return this.add(c.x, c.y);
        }
        var a = parseFloat(c);
        var b = parseFloat(d);
        return new Vector2(this.x + a, this.y + b, this.domain);
    },
    mul: function (a, b) {
        if (typeof(b) == "undefined") b = a;
        return new Vector2(this.x * a, this.y * b, this.domain);
    },
    sub: function (a, b) {
        if (arguments.length == 1) {
            return this.add(a.mul(-1));
        } else return this.add(-a, -b);
    },
    distanceTo: function (a) {
        return this.sub(a).magnitude();
    },
    magnitude: function () {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    },
    convertTo: function (a) {
        if (a != 'pure' && a != 'viewport' && a != 'document') return new Vector2(0, 0);
        if (a == this.domain) return new Vector2(this.x, this.y, this.domain);
        if (a == 'pure') return new Vector2(this.x, this.y);
        if (this.domain == 'pure') return new Vector2(0, 0);
        var b = Vector2.getScrollPosition('document');
        var c = this.x,
            d = this.y;
        if (this.domain == 'document') {
            c -= b.x;
            d -= b.y;
        } else {
            c += b.x;
            d += b.y;
        }
        return new Vector2(c, d, a);
    },
    setElementPosition: function (a) {
        var b = this.convertTo('document');
        a.style.left = parseInt(b.x) + 'px';
        a.style.top = parseInt(b.y) + 'px';
        return this;
    },
    setElementDimensions: function (a) {
        return this.setElementWidth(a).setElementHeight(a);
    },
    setElementWidth: function (a) {
        a.style.width = parseInt(this.x, 10) + 'px';
        return this;
    },
    setElementHeight: function (a) {
        a.style.height = parseInt(this.y, 10) + 'px';
        return this;
    },
    scrollElementBy: function (a) {
        if (a == document.body) {
            window.scrollBy(this.x, this.y);
        } else {
            a.scrollLeft += this.x;
            a.scrollTop += this.y;
        }
        return this;
    }
});
copy_properties(Vector2, {
    getEventPosition: function (b, a) {
        a = a || 'document';
        b = $E(b);
        var d = b.pageX || (b.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft));
        var e = b.pageY || (b.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
        var c = new Vector2(d, e, 'document');
        return c.convertTo(a);
    },
    getScrollPosition: function (a) {
        a = a || 'document';
        var b = document.body.scrollLeft || document.documentElement.scrollLeft;
        var c = document.body.scrollTop || document.documentElement.scrollTop;
        return new Vector2(b, c, 'document').convertTo(a);
    },
    getElementPosition: function (c, b) {
        b = b || 'document';
        if (!c) return;
        if (!('getBoundingClientRect' in c)) return new Vector2(0, 0, 'document');
        var e = c.getBoundingClientRect(),
            a = document.documentElement,
            d = Math.round(e.left) - a.clientLeft,
            f = Math.round(e.top) - a.clientTop;
        return new Vector2(d, f, 'viewport').convertTo(b);
    },
    getElementDimensions: function (a) {
        return new Vector2(a.offsetWidth || 0, a.offsetHeight || 0);
    },
    getViewportDimensions: function () {
        var a = (window && window.innerWidth) || (document && document.documentElement && document.documentElement.clientWidth) || (document && document.body && document.body.clientWidth) || 0;
        var b = (window && window.innerHeight) || (document && document.documentElement && document.documentElement.clientHeight) || (document && document.body && document.body.clientHeight) || 0;
        return new Vector2(a, b, 'viewport');
    },
    getDocumentDimensions: function () {
        var a = (document && document.documentElement && document.documentElement.scrollWidth) || (document && document.body && document.body.scrollWidth) || 0;
        var b = (document && document.documentElement && document.documentElement.scrollHeight) || (document && document.body && document.body.scrollHeight) || 0;
        return new Vector2(a, b, 'document');
    },
    scrollIntoView: function (a) {
        var b = a.offsetParent;
        var d = Rect(a);
        var c = d.boundWithin(Rect(b)).getPositionVector();
        d.getPositionVector().sub(c).scrollElementBy(b);
    }
});
var operaIgnoreScroll = {
    table: true,
    'inline-table': true,
    inline: true
};

function elementX(a) {
    return Vector2.getElementPosition(a, 'document').x;
}
function elementY(a) {
    return Vector2.getElementPosition(a, 'document').y;
}

function KeyEventController() {
    copy_properties(this, {
        handlers: {}
    });
    document.onkeyup = this.onkeyevent.bind(this, 'onkeyup');
    document.onkeydown = this.onkeyevent.bind(this, 'onkeydown');
    document.onkeypress = this.onkeyevent.bind(this, 'onkeypress');
}
copy_properties(KeyEventController, {
    instance: null,
    getInstance: function () {
        return KeyEventController.instance || (KeyEventController.instance = new KeyEventController());
    },
    defaultFilter: function (event, a) {
        event = $E(event);
        return KeyEventController.filterEventTypes(event, a) && KeyEventController.filterEventTargets(event, a) && KeyEventController.filterEventModifiers(event, a);
    },
    filterEventTypes: function (event, a) {
        if (a === 'onkeydown') return true;
        return false;
    },
    filterEventTargets: function (event, b) {
        var a = $E(event).getTarget();
        if (DOM.isNode(a, ['input', 'select', 'textarea', 'object', 'embed'])) if (a.type != 'checkbox' && a.type != 'radio' && a.type != 'submit') return false;
        return a.getAttribute('contentEditable') != 'true';
    },
    filterEventModifiers: function (event, a) {
        if (event.ctrlKey || event.altKey || event.metaKey || event.repeat) return false;
        return true;
    },
    registerKey: function (f, a, d, g) {
        if (d === undefined) d = KeyEventController.defaultFilter;
        var b = KeyEventController.getInstance();
        var c = b.mapKey(f);
        if (is_empty(b.handlers)) onleaveRegister(b.resetHandlers.bind(b));
        for (var e = 0; e < c.length; e++) {
            f = c[e];
            if (!b.handlers[f] || g) b.handlers[f] = [];
            b.handlers[f].push({
                callback: a,
                filter: d
            });
        }
    },
    keyCodeMap: {
        '[': [219],
        ']': [221],
        '`': [192],
        LEFT: [KEYS.LEFT, 63234],
        RIGHT: [KEYS.RIGHT, 63235],
        RETURN: [KEYS.RETURN],
        TAB: [KEYS.TAB],
        DOWN: [KEYS.DOWN, 63233],
        UP: [KEYS.UP, 63232],
        ESCAPE: [KEYS.ESC],
        BACKSPACE: [KEYS.BACKSPACE],
        DELETE: [KEYS.DELETE]
    }
});
copy_properties(KeyEventController.prototype, {
    mapKey: function (a) {
        if (typeof(a) == 'number') return [48 + a, 96 + a];
        if (KeyEventController.keyCodeMap[a.toUpperCase()]) return KeyEventController.keyCodeMap[a.toUpperCase()];
        var b = a.toUpperCase().charCodeAt(0);
        return [b];
    },
    onkeyevent: function (i, c) {
        c = $E(c);
        var d = null;
        var g = this.handlers[c.keyCode];
        var b, f, a;
        if (g) for (var h = 0; h < g.length; h++) {
            b = g[h].callback;
            f = g[h].filter;
            try {
                if (!f || f(c, i)) {
                    var node = null;
                    if (window.Parent && Parent.byTag && c.getTarget) node = Parent.byTag(c.getTarget(), 'a');
                    user_action(node, 'key', c);
                    a = b(c, i);
                    if (a === false) return Event.kill(c);
                }
            } catch (e) {}
        }
        return true;
    },
    resetHandlers: function () {
        this.handlers = {};
    }
});

function animation(a) {
    if (a == undefined) return;
    if (this == window) {
        return new animation(a);
    } else {
        this.obj = a;
        this._reset_state();
        this.queue = [];
        this.last_attr = null;
    }
}
animation.resolution = 20;
animation.offset = 0;
animation.prototype._reset_state = function () {
    this.state = {
        attrs: {},
        duration: 500
    };
};
animation.prototype.stop = function () {
    this._reset_state();
    this.queue = [];
    return this;
};
animation.prototype._build_container = function () {
    if (this.container_div) {
        this._refresh_container();
        return;
    }
    if (this.obj.firstChild && this.obj.firstChild.__animation_refs) {
        this.container_div = this.obj.firstChild;
        this.container_div.__animation_refs++;
        this._refresh_container();
        return;
    }
    var b = document.createElement('div');
    b.style.padding = '0px';
    b.style.margin = '0px';
    b.style.border = '0px';
    b.__animation_refs = 1;
    var a = this.obj.childNodes;
    while (a.length) b.appendChild(a[0]);
    this.obj.appendChild(b);
    this.obj.style.overflow = 'hidden';
    this.container_div = b;
    this._refresh_container();
};
animation.prototype._refresh_container = function () {
    this.container_div.style.height = 'auto';
    this.container_div.style.width = 'auto';
    this.container_div.style.height = this.container_div.offsetHeight + 'px';
    this.container_div.style.width = this.container_div.offsetWidth + 'px';
};
animation.prototype._destroy_container = function () {
    if (!this.container_div) return;
    if (!--this.container_div.__animation_refs) {
        var a = this.container_div.childNodes;
        while (a.length) this.obj.appendChild(a[0]);
        this.obj.removeChild(this.container_div);
    }
    this.container_div = null;
};
animation.ATTR_TO = 1;
animation.ATTR_BY = 2;
animation.ATTR_FROM = 3;
animation.prototype._attr = function (a, d, c) {
    a = a.replace(/-[a-z]/gi, function (e) {
        return e.substring(1).toUpperCase();
    });
    var b = false;
    switch (a) {
    case 'background':
        this._attr('backgroundColor', d, c);
        return this;
    case 'margin':
        d = animation.parse_group(d);
        this._attr('marginBottom', d[0], c);
        this._attr('marginLeft', d[1], c);
        this._attr('marginRight', d[2], c);
        this._attr('marginTop', d[3], c);
        return this;
    case 'padding':
        d = animation.parse_group(d);
        this._attr('paddingBottom', d[0], c);
        this._attr('paddingLeft', d[1], c);
        this._attr('paddingRight', d[2], c);
        this._attr('paddingTop', d[3], c);
        return this;
    case 'backgroundColor':
    case 'borderColor':
    case 'color':
        d = animation.parse_color(d);
        break;
    case 'opacity':
        d = parseFloat(d, 10);
        break;
    case 'height':
    case 'width':
        if (d == 'auto') {
            b = true;
        } else d = parseInt(d, 10);
        break;
    case 'borderWidth':
    case 'lineHeight':
    case 'fontSize':
    case 'marginBottom':
    case 'marginLeft':
    case 'marginRight':
    case 'marginTop':
    case 'paddingBottom':
    case 'paddingLeft':
    case 'paddingRight':
    case 'paddingTop':
    case 'bottom':
    case 'left':
    case 'right':
    case 'top':
    case 'scrollTop':
    case 'scrollLeft':
        d = parseInt(d, 10);
        break;
    default:
        throw new Error(a + ' is not a supported attribute!');
    }
    if (this.state.attrs[a] === undefined) this.state.attrs[a] = {};
    if (b) this.state.attrs[a].auto = true;
    switch (c) {
    case animation.ATTR_FROM:
        this.state.attrs[a].start = d;
        break;
    case animation.ATTR_BY:
        this.state.attrs[a].by = true;
    case animation.ATTR_TO:
        this.state.attrs[a].value = d;
        break;
    }
};
animation._get_box_width = function (c) {
    var d = parseInt(CSS.getStyle(c, 'paddingLeft'), 10),
        e = parseInt(CSS.getStyle(c, 'paddingRight'), 10),
        a = parseInt(CSS.getStyle(c, 'borderLeftWidth'), 10),
        b = parseInt(CSS.getStyle(c, 'borderRightWidth'), 10);
    return c.offsetWidth - (d ? d : 0) - (e ? e : 0) - (a ? a : 0) - (b ? b : 0);
};
animation._get_box_height = function (c) {
    var e = parseInt(CSS.getStyle(c, 'paddingTop'), 10),
        d = parseInt(CSS.getStyle(c, 'paddingBottom'), 10),
        a = parseInt(CSS.getStyle(c, 'borderTopWidth'), 10),
        b = parseInt(CSS.getStyle(c, 'borderBottomWidth'), 10);
    return c.offsetHeight - (e ? e : 0) - (d ? d : 0) - (a ? a : 0) - (b ? b : 0);
};
animation.prototype.to = function (a, b) {
    if (b === undefined) {
        this._attr(this.last_attr, a, animation.ATTR_TO);
    } else {
        this._attr(a, b, animation.ATTR_TO);
        this.last_attr = a;
    }
    return this;
};
animation.prototype.by = function (a, b) {
    if (b === undefined) {
        this._attr(this.last_attr, a, animation.ATTR_BY);
    } else {
        this._attr(a, b, animation.ATTR_BY);
        this.last_attr = a;
    }
    return this;
};
animation.prototype.from = function (a, b) {
    if (b === undefined) {
        this._attr(this.last_attr, a, animation.ATTR_FROM);
    } else {
        this._attr(a, b, animation.ATTR_FROM);
        this.last_attr = a;
    }
    return this;
};
animation.prototype.duration = function (a) {
    this.state.duration = a ? a : 0;
    return this;
};
animation.prototype.checkpoint = function (b, a) {
    if (b === undefined) b = 1;
    this.state.checkpoint = b;
    this.queue.push(this.state);
    this._reset_state();
    this.state.checkpointcb = a;
    return this;
};
animation.prototype.blind = function () {
    this.state.blind = true;
    return this;
};
animation.prototype.hide = function () {
    this.state.hide = true;
    return this;
};
animation.prototype.show = function () {
    this.state.show = true;
    return this;
};
animation.prototype.ease = function (a) {
    this.state.ease = a;
    return this;
};
animation.prototype.go = function () {
    var b = (new Date()).getTime();
    this.queue.push(this.state);
    for (var a = 0; a < this.queue.length; a++) {
        this.queue[a].start = b - animation.offset;
        if (this.queue[a].checkpoint) b += this.queue[a].checkpoint * this.queue[a].duration;
    }
    animation.push(this);
    return this;
};
animation.prototype._show = function () {
    CSS.show(this.obj);
};
animation.prototype._hide = function () {
    CSS.hide(this.obj);
};
animation.prototype._frame = function (l) {
    var d = true;
    var k = false;
    var n = false;
    for (var e = 0; e < this.queue.length; e++) {
        var b = this.queue[e];
        if (b.start > l) {
            d = false;
            continue;
        }
        if (b.checkpointcb) {
            this._callback(b.checkpointcb, l - b.start);
            b.checkpointcb = null;
        }
        if (b.started === undefined) {
            if (b.show) this._show();
            for (var a in b.attrs) {
                if (b.attrs[a].start !== undefined) continue;
                switch (a) {
                case 'backgroundColor':
                case 'borderColor':
                case 'color':
                    var m = animation.parse_color(CSS.getStyle(this.obj, a == 'borderColor' ? 'borderLeftColor' : a));
                    if (b.attrs[a].by) {
                        b.attrs[a].value[0] = Math.min(255, Math.max(0, b.attrs[a].value[0] + m[0]));
                        b.attrs[a].value[1] = Math.min(255, Math.max(0, b.attrs[a].value[1] + m[1]));
                        b.attrs[a].value[2] = Math.min(255, Math.max(0, b.attrs[a].value[2] + m[2]));
                    }
                    break;
                case 'opacity':
                    var m = CSS.getOpacity(this.obj);
                    if (b.attrs[a].by) b.attrs[a].value = Math.min(1, Math.max(0, b.attrs[a].value + m));
                    break;
                case 'height':
                    var m = animation._get_box_height(this.obj);
                    if (b.attrs[a].by) b.attrs[a].value += m;
                    break;
                case 'width':
                    var m = animation._get_box_width(this.obj);
                    if (b.attrs[a].by) b.attrs[a].value += m;
                    break;
                case 'scrollLeft':
                case 'scrollTop':
                    var m = (this.obj == document.body) ? (document.documentElement[a] || document.body[a]) : this.obj[a];
                    if (b.attrs[a].by) b.attrs[a].value += m;
                    b['last' + a] = m;
                    break;
                default:
                    var m = parseInt(CSS.getStyle(this.obj, a), 10) || 0;
                    if (b.attrs[a].by) b.attrs[a].value += m;
                    break;
                }
                b.attrs[a].start = m;
            }
            if ((b.attrs.height && b.attrs.height.auto) || (b.attrs.width && b.attrs.width.auto)) {
                if (ua.firefox() < 3) n = true;
                this._destroy_container();
                for (var a in {
                    height: 1,
                    width: 1,
                    fontSize: 1,
                    borderLeftWidth: 1,
                    borderRightWidth: 1,
                    borderTopWidth: 1,
                    borderBottomWidth: 1,
                    paddingLeft: 1,
                    paddingRight: 1,
                    paddingTop: 1,
                    paddingBottom: 1
                }) if (b.attrs[a]) this.obj.style[a] = b.attrs[a].value + (typeof b.attrs[a].value == 'number' ? 'px' : '');
                if (b.attrs.height && b.attrs.height.auto) b.attrs.height.value = animation._get_box_height(this.obj);
                if (b.attrs.width && b.attrs.width.auto) b.attrs.width.value = animation._get_box_width(this.obj);
            }
            b.started = true;
            if (b.blind) this._build_container();
        }
        var h = (l - b.start) / b.duration;
        if (h >= 1) {
            h = 1;
            if (b.hide) this._hide();
        } else d = false;
        var j = b.ease ? b.ease(h) : h;
        if (!k && h != 1 && b.blind) k = true;
        if (n && this.obj.parentNode) {
            var i = this.obj.parentNode;
            var g = this.obj.nextSibling;
            i.removeChild(this.obj);
        }
        for (var a in b.attrs) switch (a) {
        case 'backgroundColor':
        case 'borderColor':
        case 'color':
            this.obj.style[a] = 'rgb(' + animation.calc_tween(j, b.attrs[a].start[0], b.attrs[a].value[0], true) + ',' + animation.calc_tween(j, b.attrs[a].start[1], b.attrs[a].value[1], true) + ',' + animation.calc_tween(j, b.attrs[a].start[2], b.attrs[a].value[2], true) + ')';
            break;
        case 'opacity':
            CSS.setStyle(this.obj, 'opacity', animation.calc_tween(j, b.attrs[a].start, b.attrs[a].value));
            break;
        case 'height':
        case 'width':
            this.obj.style[a] = j == 1 && b.attrs[a].auto ? 'auto' : animation.calc_tween(j, b.attrs[a].start, b.attrs[a].value, true) + 'px';
            break;
        case 'scrollLeft':
        case 'scrollTop':
            var f = this.obj == document.body;
            var m = (f) ? (document.documentElement[a] || document.body[a]) : this.obj[a];
            if (b['last' + a] != m) {
                delete b.attrs[a];
            } else {
                var c = animation.calc_tween(j, b.attrs[a].start, b.attrs[a].value, true) - m;
                if (!f) {
                    this.obj[a] = c + m;
                } else if (a == 'scrollLeft') {
                    window.scrollBy(c, 0);
                } else window.scrollBy(0, c);
                b['last' + a] = c + m;
            }
            break;
        default:
            this.obj.style[a] = animation.calc_tween(j, b.attrs[a].start, b.attrs[a].value, true) + 'px';
            break;
        }
        if (h == 1) {
            this.queue.splice(e--, 1);
            this._callback(b.ondone, l - b.start - b.duration);
        }
    }
    if (n) i[g ? 'insertBefore' : 'appendChild'](this.obj, g);
    if (!k && this.container_div) this._destroy_container();
    return !d;
};
animation.prototype.ondone = function (a) {
    this.state.ondone = a;
    return this;
};
animation.prototype._callback = function (a, b) {
    if (a) {
        animation.offset = b;
        a.call(this);
        animation.offset = 0;
    }
};
animation.calc_tween = function (a, b, c, d) {
    return (d ? parseInt : parseFloat)((c - b) * a + b, 10);
};
animation.parse_color = function (a) {
    var b = /^#([a-f0-9]{1,2})([a-f0-9]{1,2})([a-f0-9]{1,2})$/i.exec(a);
    if (b) {
        return [parseInt(b[1].length == 1 ? b[1] + b[1] : b[1], 16), parseInt(b[2].length == 1 ? b[2] + b[2] : b[2], 16), parseInt(b[3].length == 1 ? b[3] + b[3] : b[3], 16)];
    } else {
        var c = /^rgba? *\(([0-9]+), *([0-9]+), *([0-9]+)(?:, *([0-9]+))?\)$/.exec(a);
        if (c) {
            if (c[4] === '0') {
                return [255, 255, 255];
            } else return [parseInt(c[1], 10), parseInt(c[2], 10), parseInt(c[3], 10)];
        } else if (a == 'transparent') {
            return [255, 255, 255];
        } else throw 'Named color attributes are not supported.';
    }
};
animation.parse_group = function (a) {
    var a = trim(a).split(/ +/);
    if (a.length == 4) {
        return a;
    } else if (a.length == 3) {
        return [a[0], a[1], a[2], a[1]];
    } else if (a.length == 2) {
        return [a[0], a[1], a[0], a[1]];
    } else return [a[0], a[0], a[0], a[0]];
};
animation.push = function (a) {
    if (!animation.active) animation.active = [];
    animation.active.push(a);
    if (!animation.timeout) animation.timeout = setInterval(animation.animate.bind(animation), animation.resolution, false);
    animation.animate(true);
};
animation.animate = function (c) {
    var d = (new Date()).getTime();
    for (var b = c === true ? animation.active.length - 1 : 0; b < animation.active.length; b++) try {
        if (!animation.active[b]._frame(d)) animation.active.splice(b--, 1);
    } catch (a) {
        animation.active.splice(b--, 1);
    }
    if (animation.active.length == 0) {
        clearInterval(animation.timeout);
        animation.timeout = null;
    }
};
animation.ease = {};
animation.ease.begin = function (a) {
    return Math.sin(Math.PI / 2 * (a - 1)) + 1;
};
animation.ease.end = function (a) {
    return Math.sin(.5 * Math.PI * a);
};
animation.ease.both = function (a) {
    return.5 * Math.sin(Math.PI * (a - .5)) + .5;
};
animation.prependInsert = function (b, a) {
    animation.insert(b, a, DOM.prependContent);
};
animation.appendInsert = function (b, a) {
    animation.insert(b, a, DOM.appendContent);
};
animation.insert = function (c, a, b) {
    CSS.setStyle(a, 'opacity', 0);
    b(c, a);
    animation(a).from('opacity', 0).to('opacity', 1).duration(400).go();
};
add_properties('CSS', {
    supportsBorderRadius: function () {
        var c = ['KhtmlBorderRadius', 'OBorderRadius', 'MozBorderRadius', 'WebkitBorderRadius', 'msBorderRadius', 'borderRadius'];
        var d = false,
            a = document.createElement('div');
        for (var b = c.length; b >= 0; b--) if (d = a.style[c[b]] !== undefined) break;
        CSS.supportsBorderRadius = bagof(d);
        return d;
    }
});

function intl_set_xmode(a) {
    (new AsyncRequest()).setURI('/ajax/intl/save_xmode.php').setData({
        xmode: a
    }).setHandler(function () {
        document.location.reload();
    }).send();
}
function intl_set_cmode(a) {
    (new AsyncRequest()).setURI('/ajax/intl/save_xmode.php').setData({
        cmode: a
    }).setHandler(function () {
        document.location.reload();
    }).send();
}
function intl_set_vmode(a) {
    (new AsyncRequest()).setURI('/ajax/intl/save_xmode.php').setData({
        vmode: a
    }).setHandler(function () {
        document.location.reload();
    }).send();
}
function intl_set_amode(a) {
    (new AsyncRequest()).setURI('/ajax/intl/save_xmode.php').setData({
        amode: a,
        app: false
    }).setHandler(function () {
        document.location.reload();
    }).send();
}
function intl_set_pmode(a) {
    CSS.toggleClass($('translations_nub'), 'pnub');
    if (a == 0) {
        CSS.addClass($('progress_check'), 'progress_hidden');
        CSS.removeClass($('progress_check'), 'progress_shown');
    } else {
        CSS.addClass($('progress_check'), 'progress_shown');
        CSS.removeClass($('progress_check'), 'progress_hidden');
    }(new AsyncRequest()).setURI('/ajax/intl/save_xmode.php').setData({
        pmode: a
    }).setHandler(function () {}).send();
}
function intl_set_locale(c, d, b, a) {
    if (!b) var b = c.options[c.selectedIndex].value;
    intl_save_locale(b, true, null, d, a);
}
function intl_save_locale(b, d, c, e, a) {
    new AsyncRequest().setURI('/ajax/intl/save_locale.php').setData({
        aloc: b,
        source: e,
        app_only: a
    }).setHandler(function (f) {
        if (d) {
            document.location.reload();
        } else goURI(c);
    }).send();
}
function intl_toggle_beta_locale_install(a) {
    if (a.checked) {
        show($('beta_locale_install'));
    } else hide($('beta_locale_install'));
}
function intl_set_cookie_locale(a, d, c) {
    var b = getCookie('locale');
    new AsyncRequest().setURI('/ajax/intl/save_locale_cookie_logging.php').setData({
        new_locale: a,
        old_locale: b,
        source: c
    }).setReadOnly(true).send();
    setCookie('locale', a, 7 * 24 * 3600000);
    goURI(d);
}
function intl_disable_rooster_save(b) {
    var c = document.getElementById('install_translation_app');
    c.disabled = !b.checked;
    var a = document.getElementById('install_container');
    if (b.checked) {
        a.style.display = 'block';
    } else a.style.display = 'none';
}
function intl_confirm_rooster_and_install_app(b, a) {
    goURI('/add.php?api_key=efa7a7045708fcadede8d705e39b1642');
}
function intl_locale_is_rtl() {
    return ('rtl' == CSS.getStyle(document.body, 'direction'));
}
function intl_is_left_click(a) {
    if (a.which == null) {
        if (a.button < 2 && !a.ctrlKey) return true;
    } else if (a.which < 2 && !a.ctrlKey) return true;
    return false;
}
function intl_left_click_cancelBubble(a) {
    if (intl_is_left_click(a)) a.cancelBubble = true;
}
add_properties('Form', {
    getInputs: function (a) {
        a = a || document;
        return [].concat($A(DOM.scry(a, 'input')), $A(DOM.scry(a, 'select')), $A(DOM.scry(a, 'textarea')), $A(DOM.scry(a, 'button')));
    },
    getSelectValue: function (a) {
        return a.options[a.selectedIndex].value;
    },
    setSelectValue: function (b, c) {
        for (var a = 0; a < b.options.length; ++a) if (b.options[a].value == c) {
            b.selectedIndex = a;
            break;
        }
    },
    getRadioValue: function (b) {
        for (var a = 0; a < b.length; a++) if (b[a].checked) return b[a].value;
        return null;
    },
    getElements: function (a) {
        return $A(a.tagName == 'FORM' ? a.elements : Form.getInputs(a));
    },
    setDisabled: function (b, a) {
        Form.getElements(b).forEach(function (c) {
            if (c.disabled != undefined) if (a) {
                DataStore.set(c, 'origDisabledState', c.disabled);
                c.disabled = a;
            } else {
                if (DataStore.get(c, 'origDisabledState') !== true) c.disabled = false;
                DataStore.remove(c, 'origDisabledState');
            }
        });
    },
    bootstrap: function (b, c) {
        var d = b.method.toUpperCase();
        c = Parent.byTag(c, 'button') || c;
        var a = Form.serialize(b, c);
        Form.setDisabled(b, true);
        var e = DOMPath.findNodePath(b);
        var g = Parent.byClass(c, 'stat_elem') || b;
        var f = new AsyncRequest(b.getAttribute('action'));
        f.setData(a).setNectarModuleDataSafe(b).setReadOnly(d == 'GET').setMethod(d).setRelativeTo(b).setStatusElement(g).setHandler(function (h) {
            if (h.isReplay()) f.setRelativeTo(DOMPath.resolveNodePath(e));
        }).setFinallyHandler(Form.setDisabled.bind(null, b, false)).send();
    },
    serialize: function (b, c) {
        var a = {};
        Form.getElements(b).forEach(function (d) {
            if (d.name && !d.disabled && d.type != 'submit') if (!d.type || ((d.type == 'radio' || d.type == 'checkbox') && d.checked) || d.type == 'text' || d.type == 'password' || d.type == 'hidden' || d.tagName == 'TEXTAREA') {
                Form._serializeHelper(a, d.name, Input.getValue(d));
            } else if (d.tagName == 'SELECT') for (var e = 0, f = d.options.length; e < f; ++e) {
                var g = d.options[e];
                if (g.selected) Form._serializeHelper(a, d.name, g.value);
            }
        });
        if (c && 'submit' == c.type && DOM.contains(b, c) && DOM.isNode(c, ['input', 'button'])) Form._serializeHelper(a, c.name, c.value);
        return Form._serializeFix(a);
    },
    _serializeHelper: function (a, d, e) {
        var c = /([^\]]+)\[([^\]]*)\](.*)/.exec(d);
        if (c) {
            a[c[1]] = a[c[1]] || {};
            if (c[2] == '') {
                var b = 0;
                while (a[c[1]][b] != undefined) b++;
            } else b = c[2];
            if (c[3] == '') {
                a[c[1]][b] = e;
            } else Form._serializeHelper(a[c[1]], b.concat(c[3]), e);
        } else a[d] = e;
    },
    _serializeFix: function (a) {
        var e = [];
        for (var b in a) {
            if (a instanceof Object) a[b] = Form._serializeFix(a[b]);
            e.push(b);
        }
        var d = 0,
            c = true;
        e.sort().each(function (g) {
            if (g != d++) c = false;
        });
        if (c) {
            var f = {};
            e.each(function (g) {
                f[g] = a[g];
            });
            return f;
        } else return a;
    },
    post: function (d, b, c) {
        var a = document.createElement('form');
        a.action = d.toString();
        a.method = 'POST';
        a.style.display = 'none';
        if (c) a.target = c;
        if (ge('post_form_id')) b.post_form_id = $('post_form_id').value;
        b.fb_dtsg = Env.fb_dtsg;
        b.post_form_id_source = 'dynamic_post';
        b.next = htmlspecialchars(document.location.href);
        Form.createHiddenInputs(b, a);
        DOM.getRootElement().appendChild(a);
        a.submit();
        return false;
    },
    createHiddenInputs: function (g, a, d, f) {
        d = d || {};
        var c;
        var h = URI.implodeQuery(g, '', false);
        var i = h.split('&');
        for (var b = 0; b < i.length; b++) if (i[b]) {
            var j = i[b].split('=');
            var e = j[0];
            var k = j[1];
            if (e === undefined || k === undefined) continue;
            k = URI.decodeComponent(k);
            if (d[e] && f) {
                d[e].value = k;
            } else {
                c = $N('input', {
                    type: 'hidden',
                    name: e,
                    value: k
                });
                d[e] = c;
                a.appendChild(c);
            }
        }
        return d;
    },
    focusFirst: function (b) {
        var f = ['input[type="text"]', 'textarea', 'input[type="password"]', 'input[type="button"]', 'input[type="submit"]'];
        var e = [];
        for (var c = 0; c < f.length && e.length == 0; c++) e = DOM.scry(b, f[c]);
        if (e.length > 0) {
            var d = e[0];
            try {
                if (elementY(d) > 0 && elementX(d) > 0) d.focus();
            } catch (a) {}
        }
        return true;
    }
});
var DOMPath = {
    findNodePath: function (c, e) {
        e = e || [];
        if (c.id || !DOM.isNode(c.parentNode)) return {
            id: c.id,
            path: e.reverse()
        };
        var d = c.parentNode;
        var b = d.childNodes;
        for (var a = 0; a < b.length; ++a) if (b[a] === c) {
            e.push(a);
            return DOMPath.findNodePath(d, e);
        }
        return null;
    },
    resolveNodePath: function (a) {
        var b = ge(a.id) || document.documentElement;
        return DOMPath._resolveNodePathChildren(a.path, b, 0);
    },
    _resolveNodePathChildren: function (c, d, b) {
        if (b === c.length) return d;
        var a = d.childNodes[c[b]];
        if (!a) return null;
        return DOMPath._resolveNodePathChildren(c, a, b + 1);
    }
};

function Dialog(a) {
    Dialog._setup();
    this._show_loading = true;
    this._loading_text = null;
    this._loading_was_shown = false;
    this._auto_focus = true;
    this._fade_enabled = true;
    this._onload_handlers = [];
    this._top = 125;
    this._content = null;
    this._obj = null;
    this._popup = null;
    this._overlay = null;
    this._hidden_objects = [];
    if (a) this._setFromModel(a);
}
copy_properties(Dialog, {
    OK: {
        name: 'ok',
        label: _tx("Okay")
    },
    CANCEL: {
        name: 'cancel',
        label: _tx("Cancel"),
        className: 'inputaux'
    },
    CLOSE: {
        name: 'close',
        label: _tx("Close")
    },
    NEXT: {
        name: 'next',
        label: _tx("Next")
    },
    SAVE: {
        name: 'save',
        label: _tx("Save")
    },
    SUBMIT: {
        name: 'submit',
        label: _tx("Submit")
    },
    CONFIRM: {
        name: 'confirm',
        label: _tx("Confirm")
    },
    DELETE: {
        name: 'delete',
        label: _tx("Delete")
    },
    _bottoms: [0],
    max_bottom: 0,
    _updateMaxBottom: function () {
        Dialog.max_bottom = Math.max.apply(Math, Dialog._bottoms);
    }
});
copy_properties(Dialog, {
    OK_AND_CANCEL: [Dialog.OK, Dialog.CANCEL],
    _STANDARD_BUTTONS: [Dialog.OK, Dialog.CANCEL, Dialog.CLOSE, Dialog.SAVE, Dialog.SUBMIT, Dialog.CONFIRM, Dialog.DELETE],
    SHOULD_HIDE_OBJECTS: !ua.windows(),
    _useCSSBorders: CSS.supportsBorderRadius() || ua.ie() <= 6,
    SIZE: {
        WIDE: 555,
        STANDARD: 445
    },
    _HALO_WIDTH: 10,
    _BORDER_WIDTH: 1,
    _PADDING_WIDTH: 10,
    MODALITY: {
        DARK: 'dark',
        WHITE: 'white'
    },
    dialogStack: null,
    newButton: function (e, d, b, c) {
        var a = {
            name: e,
            label: d
        };
        if (b) a.className = b;
        if (c) a.handler = c;
        return a;
    },
    getCurrent: function () {
        var a = Dialog.dialogStack;
        if (!a || !a.length) return null;
        return a[a.length - 1];
    },
    bootstrap: function (f, a, e, c, d) {
        a = a || {};
        copy_properties(a, new URI(f).getQueryData());
        c = c || (e ? 'GET' : 'POST');
        var b = new Dialog(d).setAsync(new AsyncRequest().setURI(f).setData(a).setReadOnly( !! e).setMethod(c));
        b.show();
        return false;
    },
    _basicMutator: function (a) {
        return function (b) {
            this[a] = b;
            this._dirty();
            return this;
        };
    },
    _findButton: function (a, c) {
        if (a) for (var b = 0; b < a.length; ++b) if (a[b].name == c) return a[b];
        return null;
    },
    _setup: function () {
        if (Dialog._is_set_up) return;
        Dialog._is_set_up = true;
        var a = function (event, b) {
            return b == 'onkeydown' && KeyEventController.filterEventModifiers(event, b);
        };
        KeyEventController.registerKey('ESCAPE', Dialog._handleEscapeKey, a);
    },
    _hideAll: function () {
        if (Dialog.dialogStack !== null && Dialog.dialogStack.length) {
            var b = Dialog.dialogStack.clone();
            Dialog.dialogStack = null;
            for (var a = b.length - 1; a >= 0; a--) b[a].hide();
        }
    },
    _handleEscapeKey: function (event, a) {
        Dialog._escape();
    },
    _escape: function () {
        var d = Dialog.getCurrent();
        if (!d) return true;
        var e = d._semi_modal;
        var b = d._buttons;
        if (!b && !e) return true;
        if (e && !b) {
            d.hide();
            return false;
        }
        var a;
        var c = Dialog._findButton(b, 'cancel');
        if (d._cancelHandler) {
            d.cancel();
            return false;
        } else if (c) {
            a = c;
        } else if (b.length == 1) {
            a = b[0];
        } else return true;
        d._handleButton(a);
        return false;
    },
    call_or_eval: function (obj, func, args) {
        if (!func) return undefined;
        args = args || {};
        if (typeof(func) == 'string') {
            var params = keys(args).join(', ');
            func = eval('({f: function(' + params + ') { ' + func + '}})').f;
        }
        return func.apply(obj, values(args));
    }
});
copy_properties(Dialog.prototype, {
    show: function (a) {
        this._showing = true;
        if (a) {
            if (this._overlay) this._overlay.style.display = '';
            if (this._fade_enabled) CSS.setStyle(this._obj, 'opacity', 1);
            this._obj.style.display = '';
        } else this._dirty();
        return this;
    },
    showLoading: function () {
        this._loading_was_shown = true;
        this._renderDialog($N('div', {
            className: 'dialog_loading'
        }, this._loading_text || _tx("Loading...")));
        return this;
    },
    hide: function (a) {
        if (!this._showing) return this;
        this._showing = false;
        if (this._autohide_timeout) {
            clearTimeout(this._autohide_timeout);
            this._autohide_timeout = null;
        }
        if (this._fade_enabled && (!Dialog.dialogStack || Dialog.dialogStack.length <= 1)) {
            this._fadeOut(a);
        } else this._hide(a);
        return this;
    },
    cancel: function () {
        if (!this._cancelHandler || this._cancelHandler() !== false) this.hide();
    },
    getRoot: function () {
        return this._obj;
    },
    getBody: function () {
        return DOM.scry(this._obj, 'div.dialog_body')[0];
    },
    getButtonElement: function (a) {
        if (typeof a == 'string') a = Dialog._findButton(this._buttons, a);
        if (!a || !a.name) return null;
        var b = DOM.scry(this._popup, 'input');
        var c = function (d) {
            return d.name == a.name;
        };
        return b.filter(c)[0] || null;
    },
    getContentNode: function () {
        var a = DOM.scry(this._content, 'div.dialog_content');
        a.length != 1;
        return a[0];
    },
    getFormData: function () {
        return Form.serialize(this.getContentNode());
    },
    setShowing: function () {
        this.show();
        return this;
    },
    setHiding: function () {
        this.hide();
        return this;
    },
    setTitle: Dialog._basicMutator('_title'),
    setBody: Dialog._basicMutator('_body'),
    setExtraData: Dialog._basicMutator('_extra_data'),
    setReturnData: Dialog._basicMutator('_return_data'),
    setShowLoading: Dialog._basicMutator('_show_loading'),
    setLoadingText: Dialog._basicMutator('_loading_text'),
    setFullBleed: Dialog._basicMutator('_full_bleed'),
    setImmediateRendering: Dialog._basicMutator('_immediate_rendering'),
    setUserData: Dialog._basicMutator('_user_data'),
    getUserData: function () {
        return this._user_data;
    },
    setAutohide: function (a) {
        if (a) {
            if (this._showing) {
                this._autohide_timeout = setTimeout(this.hide.shield(this), a);
            } else this._autohide = a;
        } else {
            this._autohide = null;
            if (this._autohide_timeout) {
                clearTimeout(this._autohide_timeout);
                this._autohide_timeout = null;
            }
        }
        return this;
    },
    setSummary: Dialog._basicMutator('_summary'),
    setButtons: function (a) {
        var c;
        if (!(a instanceof Array)) {
            c = $A(arguments);
        } else c = a;
        for (var d = 0; d < c.length; ++d) if (typeof c[d] == 'string') {
            var b = Dialog._findButton(Dialog._STANDARD_BUTTONS, c[d]);
            !b;
            c[d] = b;
        }
        this._buttons = c;
        this._updateButtons();
        return this;
    },
    setButtonsMessage: Dialog._basicMutator('_buttons_message'),
    setClickButtonOnEnter: function (b, a) {
        this._clickButtonOnEnter = a;
        this._clickButtonOnEnterInputName = b;
        return this;
    },
    setStackable: function (b, a) {
        this._is_stackable = b;
        this._shown_while_stacked = b && a;
        return this;
    },
    setHandler: function (a) {
        this._handler = a;
        return this;
    },
    setCancelHandler: function (a) {
        this._cancelHandler = Dialog.call_or_eval.bind(null, this, a);
        return this;
    },
    setCloseHandler: function (a) {
        this._close_handler = Dialog.call_or_eval.bind(null, this, a);
        return this;
    },
    clearHandler: function () {
        return this.setHandler(null);
    },
    setPostURI: function (b, a) {
        if (a === undefined) a = true;
        if (a) {
            this.setHandler(this._submitForm.bind(this, 'POST', b));
        } else this.setHandler(function () {
            Form.post(b, this.getFormData());
            this.hide();
        }.bind(this));
        return this;
    },
    setGetURI: function (a) {
        this.setHandler(this._submitForm.bind(this, 'GET', a));
        return this;
    },
    setModal: function (a, b) {
        if (a === undefined) a = true;
        this._showing && this._modal && !a;
        if (a && b) switch (b) {
        case Dialog.MODALITY.DARK:
            this._modal_class = 'dark_dialog_overlay';
            break;
        case Dialog.MODALITY.WHITE:
            this._modal_class = 'light_dialog_overlay';
            break;
        }
        this._modal = a;
        return this;
    },
    setSemiModal: function (a) {
        if (a === undefined) a = true;
        if (a) this.setModal(true, Dialog.MODALITY.DARK);
        this._semi_modal = a;
        return this;
    },
    setWideDialog: Dialog._basicMutator('_wide_dialog'),
    setContentWidth: Dialog._basicMutator('_content_width'),
    setTitleLoading: function (b) {
        if (b === undefined) b = true;
        var a = DOM.find(this._popup, 'h2.dialog_title');
        if (a) CSS.conditionClass(a, 'loading', b);
        return this;
    },
    setSecure: Dialog._basicMutator('_secure'),
    setClassName: Dialog._basicMutator('_class_name'),
    setFading: Dialog._basicMutator('_fade_enabled'),
    setFooter: Dialog._basicMutator('_footer'),
    setAutoFocus: Dialog._basicMutator('_auto_focus'),
    setTop: Dialog._basicMutator('_top'),
    onloadRegister: function (a) {
        $A(a).forEach(function (b) {
            if (typeof b == 'string') b = new Function(b);
            this._onload_handlers.push(b.bind(this));
        }.bind(this));
        return this;
    },
    setAsyncURL: function (a) {
        return this.setAsync(new AsyncRequest(a));
    },
    setAsync: function (a) {
        var c = function (f) {
            if (this._async_request != a) return;
            this._async_request = null;
            var e = f.getPayload();
            if (typeof e == 'string') {
                this.setBody(e);
            } else this._setFromModel(e);
            this._update(true);
        }.bind(this);
        var b = a.getData();
        b.__d = 1;
        a.setData(b);
        var d = bind(this, 'hide');
        a.setHandler(chain(a.getHandler(), c)).setErrorHandler(chain(d, a.getErrorHandler())).setTransportErrorHandler(chain(d, a.getTransportErrorHandler())).send();
        this._async_request = a;
        this._dirty();
        return this;
    },
    _dirty: function () {
        if (!this._is_dirty) {
            this._is_dirty = true;
            if (this._immediate_rendering) {
                this._update();
            } else bind(this, '_update', false).defer();
        }
    },
    _format: function (a) {
        if (typeof a == 'string') return HTML(a).setDeferred(true);
        return a;
    },
    _update: function (d) {
        if (!this._is_dirty && d !== true) return;
        this._is_dirty = false;
        if (!this._showing) return;
        if (this._autohide && !this._async_request && !this._autohide_timeout) this._autohide_timeout = setTimeout(bind(this, 'hide'), this._autohide);
        if (!this._async_request || !this._show_loading) {
            if (this._loading_was_shown === true) {
                this._hide(true);
                this._loading_was_shown = false;
            }
            var b = [];
            if (this._summary) b.push($N('div', {
                className: 'dialog_summary'
            }, this._format(this._summary)));
            b.push($N('div', {
                className: 'dialog_body'
            }, this._format(this._body)));
            var a = this._getButtonContent();
            if (a.length) b.push($N('div', {
                className: 'dialog_buttons clearfix'
            }, a));
            if (this._footer) b.push($N('div', {
                className: 'dialog_footer'
            }, this._format(this._footer)));
            b = $N('div', {
                className: 'dialog_content'
            }, b);
            if (this._title) {
                var g = $N('span', this._format(this._title));
                var h = $N('h2', {
                    className: 'dialog_title'
                }, g);
                CSS.conditionClass(h, 'secure', this._secure);
                b = [h, b];
            } else b = [b];
            this._renderDialog(b);
            CSS.conditionClass(this.getRoot(), 'omitDialogFooter', !a.length);
            if (this._clickButtonOnEnterInputName && this._clickButtonOnEnter && ge(this._clickButtonOnEnterInputName)) Event.listen(ge(this._clickButtonOnEnterInputName), 'keypress', function (i) {
                if (Event.getKeyCode(i) == KEYS.RETURN) this._handleButton(this._clickButtonOnEnter);
                return true;
            }.bind(this));
            for (var f = 0; f < this._onload_handlers.length; ++f) try {
                this._onload_handlers[f]();
            } catch (e) {}
            this._onload_handlers = [];
        } else this.showLoading();
        var c = 2 * Dialog._BORDER_WIDTH;
        if (Dialog._useCSSBorders) c += 2 * Dialog._HALO_WIDTH;
        if (this._content_width) {
            c += this._content_width;
            if (!this._full_bleed) c += 2 * Dialog._PADDING_WIDTH;
        } else if (this._wide_dialog) {
            c += Dialog.SIZE.WIDE;
        } else c += Dialog.SIZE.STANDARD;
        this._popup.style.width = c + 'px';
    },
    _updateButtons: function () {
        if (!this._showing) return;
        var b = this._getButtonContent();
        var c = null;
        if (!this.getRoot()) this._buildDialog();
        CSS.conditionClass(this.getRoot(), 'omitDialogFooter', !b.length);
        if (b.length) c = $N('div', {
            className: 'dialog_buttons clearfix'
        }, b);
        var d = DOM.scry(this._content, 'div.dialog_buttons')[0] || null;
        if (!d) {
            if (!c) return;
            var a = this.getBody();
            if (a) DOM.insertAfter(a, c);
        } else if (c) {
            DOM.replace(d, c);
        } else DOM.remove(d);
    },
    _getButtonContent: function () {
        var b = [];
        if ((this._buttons && this._buttons.length > 0) || this._buttons_message) {
            if (this._buttons_message) b.push($N('div', {
                className: 'dialog_buttons_msg'
            }, this._format(this._buttons_message)));
            if (this._buttons) for (var d = 0; d < this._buttons.length; d++) {
                var a = this._buttons[d];
                var c = $N('label', {
                    className: 'uiButton uiButtonLarge uiButtonConfirm'
                }, $N('input', {
                    type: 'button',
                    name: a.name || '',
                    value: a.label
                }));
                if (a.className) {
                    a.className.split(/\s+/).each(function (e) {
                        CSS.addClass(c, e);
                    });
                    if (CSS.hasClass(c, 'inputaux')) {
                        CSS.addClass(c, 'uiButtonDefault');
                        CSS.removeClass(c, 'inputaux');
                        CSS.removeClass(c, 'uiButtonConfirm');
                    }
                }
                Event.listen(c.firstChild, 'click', this._handleButton.bind(this, a.name));
                b.push(c);
            }
        }
        return b;
    },
    _renderDialog: function (b) {
        if (Dialog.dialogStack === null) {
            onleaveRegister(Dialog._hideAll);
            Arbiter.subscribe('page_transition', Dialog._hideAll);
        }
        if (!this._obj) this._buildDialog();
        if (this._class_name) CSS.addClass(this._obj, this._class_name);
        CSS.conditionClass(this._obj, 'full_bleed', this._full_bleed);
        if (typeof b == 'string') b = HTML(b).setDeferred(this._immediate_rendering !== true);
        DOM.setContent(this._content, b);
        this._showDialog();
        if (this._auto_focus) Form.focusFirst.bind(this, this._content).defer();
        var a = Vector2.getElementDimensions(this._content).y + Vector2.getElementPosition(this._content).y;
        Dialog._bottoms.push(a);
        this._bottom = a;
        Dialog._updateMaxBottom();
        return this;
    },
    _buildDialog: function () {
        this._obj = $N('div', {
            className: 'generic_dialog'
        });
        this._obj.style.display = 'none';
        DOM.getRootElement().appendChild(this._obj);
        if (!this._popup) this._popup = $N('div', {
            className: 'generic_dialog_popup'
        });
        this._popup.style.left = this._popup.style.top = '';
        this._obj.appendChild(this._popup);
        this._buildDialogContent();
    },
    _showDialog: function () {
        if (this._modal) if (this._overlay) {
            this._overlay.style.display = '';
        } else this._buildOverlay();
        if (this._obj && this._obj.style.display) {
            this._obj.style.visibility = 'hidden';
            this._obj.style.display = '';
            this._resetDialog();
            this._obj.style.visibility = '';
            this._obj.dialog = this;
        } else this._resetDialog();
        clearInterval(this.active_hiding);
        this.active_hiding = setInterval(this._activeResize.bind(this), 500);
        if (!Dialog.dialogStack) Dialog.dialogStack = [];
        var c = Dialog.dialogStack;
        if (c.length) {
            var a = c[c.length - 1];
            if (a != this && !a._is_stackable) a._hide();
            for (var b = c.length - 1; b >= 0; b--) if (c[b] == this) {
                c.splice(b, 1);
            } else if (!c[b]._shown_while_stacked) c[b]._hide(true);
        }
        c.push(this);
        return this;
    },
    _activeResize: function () {
        if (this.last_offset_height != this._content.offsetHeight) this.last_offset_height = this._content.offsetHeight;
    },
    _buildDialogContent: function () {
        CSS.addClass(this._obj, 'pop_dialog');
        if (intl_locale_is_rtl()) CSS.addClass(this._obj, 'pop_dialog_rtl');
        var a;
        if (Dialog._useCSSBorders) {
            a = '<div class="pop_container_advanced">' + '<div class="pop_content" id="pop_content"></div>' + '</div>';
        } else a = '<div class="pop_container">' + '<div class="pop_verticalslab"></div>' + '<div class="pop_horizontalslab"></div>' + '<div class="pop_topleft"></div>' + '<div class="pop_topright"></div>' + '<div class="pop_bottomright"></div>' + '<div class="pop_bottomleft"></div>' + '<div class="pop_content pop_content_old" id="pop_content"></div>' + '</div>';
        DOM.setContent(this._popup, HTML(a));
        this._frame = DOM.find(this._popup, 'div.pop_content');
        this._content = this._frame;
    },
    _buildOverlay: function () {
        this._overlay = $N('div', {
            id: 'generic_dialog_overlay'
        });
        if (this._modal_class) CSS.addClass(this._overlay, this._modal_class);
        if (this._semi_modal) {
            var a = function (b) {
                if (b.getTarget() == this._obj || b.getTarget() == this._overlay) this.hide();
            }.bind(this);
            Event.listen(this._obj, 'click', a);
            Event.listen(this._overlay, 'click', a);
        }
        if (ua.ie() < 7) this._overlay.style.height = Vector2.getDocumentDimensions().y + 'px';
        onloadRegister(function () {
            document.body.appendChild(this._overlay);
        }.bind(this));
    },
    _resetDialog: function () {
        if (!this._popup) return;
        this._resetDialogObj();
    },
    _resetDialogObj: function () {
        var c = DOM.find(this._popup, 'div.pop_content');
        var b = Vector2.getScrollPosition().y;
        var f = Vector2.getViewportDimensions().y;
        var d = Vector2.getElementDimensions(c).y;
        var e = b + this._top + 'px';
        if (this._top + d > f) {
            var a = Math.max(f - d, 0);
            e = ((a / 2) + b) + 'px';
        }
        this._popup.style.top = e;
    },
    _fadeOut: function (b) {
        if (!this._popup) return;
        try {
            animation(this._obj).duration(0).checkpoint().to('opacity', 0).hide().duration(250).ondone(this._hide.bind(this, b)).go();
        } catch (a) {
            this._hide(b);
        }
    },
    _hide: function (d) {
        if (this._obj) this._obj.style.display = 'none';
        if (this._overlay) if (d) {
            this._overlay.style.display = 'none';
        } else {
            DOM.remove(this._overlay);
            this._overlay = null;
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        if (this._hidden_objects.length) {
            for (var b = 0, c = this._hidden_objects.length; b < c; b++) this._hidden_objects[b].style.visibility = '';
            this._hidden_objects = [];
        }
        clearInterval(this.active_hiding);
        if (this._bottom) {
            var a = Dialog._bottoms;
            a.splice(a.indexOf(this._bottom), 1);
            Dialog._updateMaxBottom();
        }
        if (d) return;
        this.destroy();
    },
    destroy: function () {
        if (Dialog.dialogStack && Dialog.dialogStack.length) {
            var b = Dialog.dialogStack;
            for (var a = b.length - 1; a >= 0; a--) if (b[a] == this) b.splice(a, 1);
            if (b.length) b[b.length - 1]._showDialog();
        }
        if (this._obj) {
            DOM.remove(this._obj);
            this._obj = null;
        }
        if (this._close_handler) this._close_handler({
            return_data: this._return_data
        });
    },
    _handleButton: function (a) {
        if (typeof a == 'string') a = Dialog._findButton(this._buttons, a);
        if (!a) return;
        var b = Dialog.call_or_eval(a, a.handler);
        if (b === false) return;
        if (a.name == 'cancel') {
            this.cancel();
        } else if (Dialog.call_or_eval(this, this._handler, {
            button: a
        }) !== false) this.hide();
    },
    _submitForm: function (d, e, b) {
        var c = this.getFormData();
        c[b.name] = b.label;
        if (this._extra_data) copy_properties(c, this._extra_data);
        var a = new AsyncRequest().setURI(e).setData(c).setMethod(d).setReadOnly(d == 'GET');
        this.setAsync(a);
        return false;
    },
    _setFromModel: function (a) {
        for (var c in a) {
            if (c == 'onloadRegister') {
                this.onloadRegister(a[c]);
                continue;
            }
            var b = this['set' + c.substr(0, 1).toUpperCase() + c.substr(1)];
            if (!(!b)) b.apply(this, $A(a[c]));
        }
    },
    _updateBottom: function () {
        var a = Vector2.getElementDimensions(this._content).y + Vector2.getElementPosition(this._content).y;
        Dialog._bottoms[Dialog._bottoms.length - 1] = a;
        Dialog._updateMaxBottom();
    }
});

function ErrorDialog() {
    this.parent.construct(this);
    this.setClassName('errorDialog').setModal(true);
    this.setStackable(true);
    return this;
}
ErrorDialog.extend('Dialog');
copy_properties(ErrorDialog, {
    showAsyncError: function (b) {
        try {
            return (new ErrorDialog()).showError(b.getErrorSummary(), b.getErrorDescription());
        } catch (a) {
            aiert(b);
        }
    }
});
copy_properties(ErrorDialog.prototype, {
    displayError: function (b, a) {
        return this.setTitle(b).setBody(a).setButtons([Dialog.OK]).show();
    },
    showError: function (b, a) {
        return this.setTitle(b).setBody(a).setButtons([Dialog.OK]).show();
    }
});

function AsyncRequest(uri) {
    var dispatchResponse = bind(this, function (asyncResponse) {
        try {
            this.clearStatusIndicator();
            this._measureSaved && this._measureSaved();
            if (this._isPrefetch) {
                this._isPrefetch = false;
                return;
            }
            if (!this.isRelevant()) {
                invokeErrorHandler(1010);
                return;
            }
            if (this.initialHandler(asyncResponse) !== false) {
                clearTimeout(this.timer);
                if (this.handler) try {
                    var suppress_onload = this.handler(asyncResponse);
                } catch (exception) {
                    asyncResponse.is_last && this.finallyHandler(asyncResponse);
                    throw exception;
                }
                asyncResponse.is_last && this.finallyHandler(asyncResponse);
                if (suppress_onload !== AsyncRequest.suppressOnloadToken) {
                    var onload = asyncResponse.onload;
                    if (onload) for (var ii = 0; ii < onload.length; ii++) try {
                        (new Function(onload[ii])).apply(this);
                    } catch (exception) {}
                    if (this.lid && !asyncResponse.isReplay()) Arbiter.inform('tti_ajax', {
                        s: this.lid
                    }, Arbiter.BEHAVIOR_EVENT);
                    var onafterload = asyncResponse.onafterload;
                    if (onafterload) for (var ii = 0; ii < onafterload.length; ii++) try {
                        (new Function(onafterload[ii])).apply(this);
                    } catch (exception) {}
                }
                var invalidate_cache = asyncResponse.invalidate_cache;
                if (invalidate_cache && invalidate_cache.length) Arbiter.inform(Arbiter.PAGECACHE_INVALIDATE, invalidate_cache);
            }
            if (asyncResponse.cacheObservation && typeof(TabConsoleCacheobserver) != 'undefined' && TabConsoleCacheobserver.instance) TabConsoleCacheobserver.getInstance().addAsyncObservation(asyncResponse.cacheObservation);
        } catch (exception) {}
    });
    var replayResponses = bind(this, function () {
        if (is_empty(this._asyncResponses)) return;
        this.setNewSerial();
        for (var ii = 0; ii < this._asyncResponses.length; ++ii) {
            var r = this._asyncResponses[ii];
            invokeResponseHandler(r, true);
        }
    });
    var dispatchErrorResponse = bind(this, function (asyncResponse, isTransport) {
        try {
            this.clearStatusIndicator();
            var async_error = asyncResponse.getError();
            if (this._sendTimeStamp) {
                var _duration = (+new Date()) - this._sendTimeStamp;
                asyncResponse.logError('async_error', _duration);
            } else asyncResponse.logError('async_error');
            if ((!this.isRelevant()) || async_error === 1010) return;
            if (async_error == 1357008 || async_error == 1357007 || async_error == 1442002 || async_error == 1357001) {
                var is_confirmation = false;
                if (async_error == 1357008 || async_error == 1357007) is_confirmation = true;
                var payload = asyncResponse.getPayload();
                this._displayServerDialog(payload.__dialog, is_confirmation);
            } else if (this.initialHandler(asyncResponse) !== false) {
                clearTimeout(this.timer);
                try {
                    if (isTransport) {
                        this.transportErrorHandler(asyncResponse);
                    } else this.errorHandler(asyncResponse);
                } catch (exception) {
                    this.finallyHandler(asyncResponse);
                    throw exception;
                }
                this.finallyHandler(asyncResponse);
            }
        } catch (exception) {}
    });
    var _interpretTransportResponse = bind(this, function () {
        if (this.getOption('suppressEvaluation')) {
            var r = new AsyncResponse(this, this.transport);
            return {
                asyncResponse: r
            };
        }
        var shield = "for (;;);";
        var shieldlen = shield.length;
        if (this.transport.responseText.length <= shieldlen) {
            if (window.send_error_signal) send_error_signal('async_xport_resp', '1008_empty:' + this.getURI() + ':' + this.transport.responseText.length + ':' + this.transport.responseText);
            return {
                transportError: 'Response too short on async to ' + this.getURI()
            };
        }
        var text = this.transport.responseText;
        var offset = 0;
        while (text.charAt(offset) == " " || text.charAt(offset) == "\n") offset++;
        offset && text.substring(offset, offset + shieldlen) == shield;
        var safeResponse = text.substring(offset + shieldlen);
        try {
            var response = eval('(' + safeResponse + ')');
        } catch (exception) {
            if (window.send_error_signal) send_error_signal('async_xport_resp', '1008_excep:' + this.getURI() + ':' + safeResponse.length + ':' + safeResponse.substring(0, 200));
            return {
                transportError: 'eval() failed on async to ' + this.getURI()
            };
        }
        return interpretResponse(response);
    });
    var interpretResponse = bind(this, function (response) {
        if (response.redirect) return {
            redirect: response.redirect
        };
        var r = new AsyncResponse(this);
        if (typeof(response.payload) == 'undefined' || typeof(response.error) == 'undefined' || typeof(response.errorDescription) == 'undefined' || typeof(response.errorSummary) == 'undefined' || typeof(response.errorIsWarning) == 'undefined') {
            r.payload = response;
        } else copy_properties(r, response);
        return {
            asyncResponse: r
        };
    });
    var invokeResponseHandler = bind(this, function (interp, is_replay) {
        if (typeof(interp.redirect) != 'undefined') {
            (function () {
                this.setURI(interp.redirect).send();
            }).bind(this).defer();
            return;
        }
        if (this.handler || this.errorHandler || this.transportErrorHandler) if (typeof(interp.asyncResponse) != 'undefined') {
            var r = interp.asyncResponse;
            r.setReplay( !! is_replay);
            if (!this.isRelevant()) {
                invokeErrorHandler(1010);
                return;
            }
            if (r.inlinejs) eval_global(r.inlinejs);
            if (r.lid) {
                if (window.CavalryLogger) this.cavalry = CavalryLogger.getInstance(r.lid);
                this.lid = r.lid;
            }
            if (r.getError() && !r.getErrorIsWarning()) {
                var fn = dispatchErrorResponse;
            } else {
                var fn = dispatchResponse;
                if (this._replayable && !is_replay && !r.dontReplay) {
                    this._asyncResponses = this._asyncResponses || [];
                    this._asyncResponses.push(interp);
                }
            }
            Bootloader.setResourceMap(r.resource_map);
            if (r.bootloadable) Bootloader.enableBootload(r.bootloadable);
            fn = fn.shield(null, r);
            fn = fn.defer.bind(fn);
            var is_transitional = false;
            if (this.preBootloadHandler) is_transitional = this.preBootloadHandler(r);
            r.css = r.css || [];
            r.js = r.js || [];
            Bootloader.loadResources(r.css.concat(r.js), fn, is_transitional, this.getURI());
        } else if (typeof(interp.transportError) != 'undefined') {
            invokeErrorHandler(1008);
        } else invokeErrorHandler(1007);
    });
    var invokeErrorHandler = bind(this, function (explicitError) {
        try {
            if (!window.loaded) return;
        } catch (ex) {
            return;
        }
        var r = new AsyncResponse(this);
        var err;
        try {
            err = explicitError || this.transport.status || 1004;
        } catch (ex) {
            err = 1005;
        }
        try {
            if (this.responseText == '') err = 1002;
        } catch (ignore) {}
        if (this.transportErrorHandler) {
            var desc, summary;
            var silent = true;
            if (false === navigator.onLine) {
                summary = _tx("No Network Connection");
                desc = _tx("Your browser appears to be offline. Please check your internet connection and try again.");
                err = 1006;
                silent = false;
            } else if (err >= 300 && err <= 399) {
                summary = _tx("Redirection");
                desc = _tx("Your access to Facebook was redirected or blocked by a third party at this time, please contact your ISP or reload. ");
                redir_url = this.transport.getResponseHeader("Location");
                if (redir_url) goURI(redir_url, true);
                silent = true;
            } else {
                summary = _tx("Oops!");
                desc = _tx("Something went wrong. We're working on getting this fixed as soon as we can. You may be able to try again.");
            }!this.getOption('suppressErrorAlerts');
            copy_properties(r, {
                error: err,
                errorSummary: summary,
                errorDescription: desc,
                silentError: silent
            });
            dispatchErrorResponse(r, true);
        }
    });
    var handleResponse = function (response) {
        var asyncResponse = this.interpretResponse(response);
        this.invokeResponseHandler(asyncResponse);
    };
    var onStateChange = function () {
        try {
            if (this.transport.readyState == 4) {
                if (this.transport.status >= 200 && this.transport.status < 300) {
                    invokeResponseHandler(_interpretTransportResponse());
                } else if (ua.safari() && (typeof(this.transport.status) == 'undefined')) {
                    invokeErrorHandler(1002);
                } else invokeErrorHandler();
                if (this.getOption('asynchronous') !== false) delete this.transport;
            }
        } catch (exception) {
            try {
                if (!window.loaded) return;
            } catch (ex) {
                return;
            }
            delete this.transport;
            if (this.remainingRetries) {
                --this.remainingRetries;
                this.send(true);
            } else {
                !this.getOption('suppressErrorAlerts');
                invokeErrorHandler(1007);
            }
        }
    };
    var onJSONPResponse = function (data, more_chunked_response) {
        var is_first = (this.is_first === undefined);
        this.is_first = is_first;
        if (this.transportIframe && !more_chunked_response)(function (x) {
            document.body.removeChild(x);
        }).bind(null, this.transportIframe).defer();
        var r = this.interpretResponse(data);
        r.asyncResponse.is_first = is_first;
        r.asyncResponse.is_last = !more_chunked_response;
        this.invokeResponseHandler(r);
        return more_chunked_response;
    };
    copy_properties(this, {
        onstatechange: onStateChange,
        onjsonpresponse: onJSONPResponse,
        replayResponses: replayResponses,
        invokeResponseHandler: invokeResponseHandler,
        interpretResponse: interpretResponse,
        handleResponse: handleResponse,
        transport: null,
        method: 'POST',
        uri: '',
        timeout: null,
        timer: null,
        initialHandler: bagofholding,
        handler: null,
        errorHandler: null,
        transportErrorHandler: null,
        timeoutHandler: null,
        finallyHandler: bagofholding,
        serverDialogCancelHandler: bagofholding,
        relativeTo: null,
        statusElement: null,
        statusClass: '',
        data: {},
        context: {},
        readOnly: false,
        writeRequiredParams: ['post_form_id'],
        remainingRetries: 0,
        option: {
            asynchronous: true,
            suppressErrorHandlerWarning: false,
            suppressEvaluation: false,
            suppressErrorAlerts: false,
            retries: 1,
            jsonp: false,
            bundle: false,
            useIframeTransport: false,
            tfbEndpoint: true
        },
        _replayable: undefined,
        _replayKey: '',
        _isPrefetch: false
    });
    this.errorHandler = AsyncResponse.defaultErrorHandler;
    this.transportErrorHandler = bind(this, 'errorHandler');
    if (uri != undefined) this.setURI(uri);
    return this;
}
Arbiter.subscribe("page_transition", function (b, a) {
    AsyncRequest._id_threshold = a.id;
});
copy_properties(AsyncRequest, {
    pingURI: function (c, a, b) {
        a = a || {};
        return new AsyncRequest().setURI(c).setData(a).setOption('asynchronous', !b).setOption('suppressErrorHandlerWarning', true).setErrorHandler(bagofholding).setTransportErrorHandler(bagofholding).send();
    },
    receiveJSONPResponse: function (b, a, c) {
        if (this._JSONPReceivers[b]) if (!this._JSONPReceivers[b](a, c)) delete this._JSONPReceivers[b];
    },
    _hasBundledRequest: function () {
        return AsyncRequest._allBundledRequests.length > 0;
    },
    stashBundledRequest: function () {
        var a = AsyncRequest._allBundledRequests;
        AsyncRequest._allBundledRequests = [];
        return a;
    },
    setBundledRequestProperties: function (b) {
        var c = null;
        if (b.stashedRequests) AsyncRequest._allBundledRequests = AsyncRequest._allBundledRequests.concat(b.stashedRequests);
        if (!AsyncRequest._hasBundledRequest()) {
            var a = b.callback;
            a && a();
        } else {
            copy_properties(AsyncRequest._bundledRequestProperties, b);
            if (b.start_immediately) c = AsyncRequest._sendBundledRequests();
        }
        return c;
    },
    _bundleRequest: function (b) {
        if (b.getOption('jsonp') || b.getOption('useIframeTransport')) {
            b.setOption('bundle', false);
            return false;
        } else if (!b.uri.isFacebookURI()) {
            b.setOption('bundle', false);
            return false;
        } else if (!b.getOption('asynchronous')) {
            b.setOption('bundle', false);
            return false;
        }
        var a = b.uri.getPath();
        if (AsyncRequest._allBundledRequests.length === 0) AsyncRequest._bundleTimer = setTimeout(function () {
            AsyncRequest._sendBundledRequests();
        }, 0);
        AsyncRequest._allBundledRequests.push([a, b]);
        return true;
    },
    _sendBundledRequests: function () {
        clearTimeout(AsyncRequest._bundleTimer);
        AsyncRequest._bundleTimer = null;
        var a = AsyncRequest._allBundledRequests;
        AsyncRequest._allBundledRequests = [];
        var e = {};
        copy_properties(e, AsyncRequest._bundledRequestProperties);
        AsyncRequest._bundledRequestProperties = {};
        if (is_empty(e) && a.length == 1) {
            var g = a[0][1];
            g.setOption('bundle', false).send();
            return g;
        }
        var d = function () {
            e.callback && e.callback();
        };
        if (a.length === 0) {
            d();
            return null;
        }
        var b = [];
        for (var c = 0; c < a.length; c++) b.push([a[c][0], URI.implodeQuery(a[c][1].data)]);
        var f = {
            data: b
        };
        if (e.extra_data) copy_properties(f, e.extra_data);
        var g = new AsyncRequest();
        g.setURI('/ajax/proxy.php').setData(f).setMethod('POST').setInitialHandler(e.onInitialResponse || bagof(true)).setAllowCrossPageTransition(true).setHandler(function (l) {
            var k = l.getPayload();
            var n = k.responses;
            if (n.length != a.length) {
                return;
            } else for (var i = 0; i < a.length; i++) {
                var j = a[i][0];
                var m = a[i][1];
                m.id = this.id;
                if (n[i][0] != j) {
                    m.invokeResponseHandler({
                        transportError: 'Wrong response order in bundled request to ' + j
                    });
                    continue;
                }
                var h = m.interpretResponse(n[i][1]);
                m.invokeResponseHandler(h);
            }
        }).setTransportErrorHandler(function (m) {
            var k = [];
            var i = {
                transportError: m.errorDescription
            };
            for (var h = 0; h < a.length; h++) {
                var j = a[h][0];
                var l = a[h][1];
                k.push(j);
                l.id = this.id;
                l.invokeResponseHandler(i);
            }
        }).setFinallyHandler(function (h) {
            d();
        }).send();
        return g;
    },
    bootstrap: function (c, b, d) {
        var e = 'GET';
        var f = true;
        var a = {};
        c = URI(c);
        if (d || (b && b.rel == 'async-post')) {
            e = 'POST';
            f = false;
            a = c.getQueryData();
            c.setQueryData({});
        }
        var g = Parent.byClass(b, 'stat_elem') || b;
        if (g && CSS.hasClass(g, 'async_saving')) return false;
        new AsyncRequest(c).setReadOnly(f).setMethod(e).setData(a).setNectarModuleDataSafe(b).setStatusElement(g).setRelativeTo(b).send();
        return false;
    },
    post: function (b, a) {
        new AsyncRequest(b).setReadOnly(false).setMethod('POST').setData(a).send();
        return false;
    },
    clearCache: function () {
        AsyncRequest._reqsCache = {};
    },
    getLastId: function () {
        return AsyncRequest._last_id;
    },
    _JSONPReceivers: {},
    _allBundledRequests: [],
    _bundledRequestProperties: {},
    _bundleTimer: null,
    suppressOnloadToken: {},
    REPLAYABLE_AJAX: 'ajax/replayable',
    _last_id: 2,
    _id_threshold: 2,
    _reqsCache: {}
});
copy_properties(AsyncRequest.prototype, {
    setMethod: function (a) {
        this.method = a.toString().toUpperCase();
        return this;
    },
    getMethod: function () {
        return this.method;
    },
    setData: function (a) {
        this.data = a;
        return this;
    },
    getData: function () {
        return this.data;
    },
    setContextData: function (b, c, a) {
        a = a === undefined ? true : a;
        if (a) this.context['_log_' + b] = c;
        return this;
    },
    setURI: function (a) {
        var b = URI(a);
        if (this.getOption('useIframeTransport') && !b.isFacebookURI()) return this;
        if (!this.getOption('jsonp') && !this.getOption('useIframeTransport') && !b.isSameOrigin()) return this;
        this.uri = b;
        return this;
    },
    getURI: function () {
        return this.uri.toString();
    },
    setInitialHandler: function (a) {
        this.initialHandler = a;
        return this;
    },
    setHandler: function (a) {
        if (!(typeof(a) != 'function')) this.handler = a;
        return this;
    },
    getHandler: function () {
        return this.handler;
    },
    setErrorHandler: function (a) {
        if (!(typeof(a) != 'function')) this.errorHandler = a;
        return this;
    },
    setTransportErrorHandler: function (a) {
        this.transportErrorHandler = a;
        return this;
    },
    getErrorHandler: function () {
        return this.errorHandler;
    },
    getTransportErrorHandler: function () {
        return this.transportErrorHandler;
    },
    setTimeoutHandler: function (b, a) {
        if (!(typeof(a) != 'function')) {
            this.timeout = b;
            this.timeoutHandler = a;
        }
        return this;
    },
    resetTimeout: function (a) {
        if (!(this.timeoutHandler === null)) if (a === null) {
            this.timeout = null;
            clearTimeout(this.timer);
            this.timer = null;
        } else {
            this.timeout = a;
            clearTimeout(this.timer);
            this.timer = this._handleTimeout.bind(this).defer(this.timeout);
        }
        return this;
    },
    _handleTimeout: function () {
        this.abandon();
        this.timeoutHandler(this);
    },
    setNewSerial: function () {
        this.id = ++AsyncRequest._last_id;
        return this;
    },
    setFinallyHandler: function (a) {
        this.finallyHandler = a;
        return this;
    },
    setServerDialogCancelHandler: function (a) {
        this.serverDialogCancelHandler = a;
        return this;
    },
    setPreBootloadHandler: function (a) {
        this.preBootloadHandler = a;
        return this;
    },
    setReadOnly: function (a) {
        if (!(typeof(a) != 'boolean')) this.readOnly = a;
        return this;
    },
    setFBMLForm: function () {
        this.writeRequiredParams = ["fb_sig"];
        return this;
    },
    getReadOnly: function () {
        return this.readOnly;
    },
    setRelativeTo: function (a) {
        this.relativeTo = a;
        return this;
    },
    getRelativeTo: function () {
        return this.relativeTo;
    },
    setStatusClass: function (a) {
        this.statusClass = a;
        return this;
    },
    setStatusElement: function (a) {
        this.statusElement = a;
        return this;
    },
    getStatusElement: function () {
        return ge(this.statusElement);
    },
    isRelevant: function () {
        if (!env_get('ajax_threshold') == '1') return true;
        if (this._allowCrossPageTransition) return true;
        if (!this.id) return true;
        return this.id > AsyncRequest._id_threshold;
    },
    clearStatusIndicator: function () {
        var a = this.getStatusElement();
        if (a) {
            CSS.removeClass(a, 'async_saving');
            CSS.removeClass(a, this.statusClass);
        }
    },
    addStatusIndicator: function () {
        var a = this.getStatusElement();
        if (a) {
            CSS.addClass(a, 'async_saving');
            CSS.addClass(a, this.statusClass);
        }
    },
    specifiesWriteRequiredParams: function () {
        return this.writeRequiredParams.every(function (a) {
            this.data[a] = this.data[a] || Env[a] || (ge(a) || {}).value;
            if (this.data[a] !== undefined) return true;
            return false;
        }, this);
    },
    setReplayable: function (b, a) {
        this._replayable = b;
        this._replayKey = a || '';
        return this;
    },
    setOption: function (a, b) {
        if (typeof(this.option[a]) != 'undefined') this.option[a] = b;
        return this;
    },
    getOption: function (a) {
        typeof(this.option[a]) == 'undefined';
        return this.option[a];
    },
    abort: function () {
        if (this.transport) {
            var a = this.getTransportErrorHandler();
            this.setOption('suppressErrorAlerts', true);
            this.setTransportErrorHandler(bagofholding);
            this.transport.abort();
            this.setTransportErrorHandler(a);
        }
    },
    abandon: function () {
        clearTimeout(this.timer);
        this.setOption('suppressErrorAlerts', true).setHandler(bagofholding).setErrorHandler(bagofholding).setTransportErrorHandler(bagofholding);
        if (this.transport) this.transport.abort();
    },
    setNectarActionData: function (a) {
        if (this.data.nctr === undefined) this.data.nctr = {};
        this.data.nctr._ia = 1;
        if (a) {
            if (this.data.nctr._as === undefined) this.data.nctr._as = {};
            copy_properties(this.data.nctr._as, a);
        }
        return this;
    },
    setNectarData: function (a) {
        if (a) {
            if (this.data.nctr === undefined) this.data.nctr = {};
            copy_properties(this.data.nctr, a);
        }
        return this;
    },
    setNectarModuleDataSafe: function (a) {
        if (this.setNectarModuleData) this.setNectarModuleData(a);
        return this;
    },
    setNectarImpressionIdSafe: function () {
        if (this.setNectarImpressionId) this.setNectarImpressionId();
        return this;
    },
    setPrefetch: function (a) {
        this._isPrefetch = a;
        this.setAllowCrossPageTransition(true);
        return this;
    },
    setAllowCrossPageTransition: function (a) {
        this._allowCrossPageTransition = !! a;
        return this;
    },
    send: function (d) {
        if (this._checkCache && this._checkCache()) return true;
        d = d || false;
        if (!this.uri) return false;
        !this.errorHandler && !this.getOption('suppressErrorHandlerWarning');
        if (this.getOption('jsonp') && this.method != 'GET') this.setMethod('GET');
        if (this.getOption('useIframeTransport') && this.method != 'GET') this.setMethod('GET');
        this.timeoutHandler !== null && (this.getOption('jsonp') || this.getOption('useIframeTransport'));
        if (!this.getReadOnly()) {
            if (!this.specifiesWriteRequiredParams()) return false;
            if (this.method != 'POST') return false;
        }
        if (this.method == 'POST' && this.getOption('tfbEndpoint')) {
            this.data.fb_dtsg = Env.fb_dtsg;
            this.data.lsd = getCookie('lsd');
        }
        this._replayable = (!this.getReadOnly() && this._replayable !== false) || this._replayable;
        if (this._replayable) Arbiter.inform(AsyncRequest.REPLAYABLE_AJAX, this);
        if (!is_empty(this.context) && this.getOption('tfbEndpoint')) {
            copy_properties(this.data, this.context);
            this.data.ajax_log = 1;
        }
        if (!this.getReadOnly() && this.getOption('tfbEndpoint') && this.method == 'POST' && this.data.post_form_id_source === undefined) this.data.post_form_id_source = 'AsyncRequest';
        if (this.getOption('bundle') && AsyncRequest._bundleRequest(this)) return true;
        this.setNewSerial();
        if (this.getOption('tfbEndpoint')) this.uri.addQueryData({
            __a: 1
        });
        var b = env_get('haste_combo');
        if (b) setCookie('force_hcfb', 1, 1000);
        this.finallyHandler = async_callback(this.finallyHandler, 'final');
        var i, e;
        if (this.method == 'GET') {
            i = this.uri.addQueryData(this.data).toString();
            e = '';
        } else {
            i = this.uri.toString();
            e = URI.implodeQuery(this.data);
        }
        if (this.getOption('jsonp') || this.getOption('useIframeTransport')) {
            i = this.uri.addQueryData({
                __a: this.id
            }).toString();
            AsyncRequest._JSONPReceivers[this.id] = async_callback(bind(this, 'onjsonpresponse'), 'json');
            if (this.getOption('jsonp')) {
                (function () {
                    document.body.appendChild($N('script', {
                        src: i,
                        type: "text/javascript"
                    }));
                }).bind(this).defer();
            } else {
                var f = {
                    position: 'absolute',
                    top: '-1000px',
                    left: '-1000px',
                    width: '80px',
                    height: '80px'
                };
                this.transportIframe = $N('iframe', {
                    src: i,
                    style: f
                });
                document.body.appendChild(this.transportIframe);
            }
            return true;
        }
        if (this.transport) return false;
        var h = null;
        try {
            h = new XMLHttpRequest();
        } catch (c) {}
        if (!h) try {
            h = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (c) {}
        if (!h) try {
            h = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (c) {}
        if (!h) return false;
        h.onreadystatechange = async_callback(bind(this, 'onstatechange'), 'xhr');
        if (!d) {
            this.remainingRetries = 0;
            if (this.getReadOnly()) this.remainingRetries = this.getOption('retries');
        }
        if (window.send_error_signal) this._sendTimeStamp = this._sendTimeStamp || (+new Date());
        this.transport = h;
        try {
            this.transport.open(this.method, i, this.getOption('asynchronous'));
        } catch (a) {
            return false;
        }
        var g = env_get('svn_rev');
        if (g) this.transport.setRequestHeader('X-SVN-Rev', String(g));
        if (this.method == 'POST') this.transport.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        this.addStatusIndicator();
        this.transport.send(e);
        if (this.timeout !== null) this.resetTimeout(this.timeout);
        return true;
    },
    _displayServerDialog: function (c, b) {
        var a = new Dialog(c);
        if (b) a.setHandler(this._displayConfirmationHandler.bind(this, a));
        a.setCancelHandler(function () {
            this.serverDialogCancelHandler.apply(this, arguments);
            this.finallyHandler.apply(this, arguments);
        }.bind(this)).setCloseHandler(this.finallyHandler.bind(this)).show();
    },
    _displayConfirmationHandler: function (a) {
        this.data.confirmed = 1;
        copy_properties(this.data, a.getFormData());
        this.send();
    }
});

function AsyncResponse(b, a) {
    copy_properties(this, {
        error: 0,
        errorSummary: null,
        errorDescription: null,
        onload: null,
        replay: false,
        payload: a || null,
        request: b || null,
        silentError: false,
        is_last: true
    });
    return this;
}
copy_properties(AsyncResponse, {
    defaultErrorHandler: function (b) {
        try {
            if (!b.silentError) {
                AsyncResponse.verboseErrorHandler(b);
            } else if (window.Util && window.Util.isDevelopmentEnvironment()) {
                b.setErrorSummary(b.getErrorSummary() + ' (Only shown in Dev)');
                AsyncResponse.verboseErrorHandler(b);
            } else if (typeof(window.Env) == 'undefined' || typeof(window.Env.silent_oops_errors) == 'undefined') {
                AsyncResponse.verboseErrorHandler(b);
            } else b.logErrorByGroup('silent', 10);
        } catch (a) {
            aiert(b);
        }
    },
    verboseErrorHandler: function (b) {
        try {
            var summary = b.getErrorSummary();
            var desc = b.getErrorDescription();
            b.logErrorByGroup('popup', 10);
            if (b.silentError && desc == '') desc = _tx("Something went wrong. We're working on getting this fixed as soon as we can. You may be able to try again.");
            (new ErrorDialog()).displayError(summary, desc);
        } catch (a) {
            aiert(b);
        }
    }
});
copy_properties(AsyncResponse.prototype, {
    getRequest: function () {
        return this.request;
    },
    getPayload: function () {
        return this.payload;
    },
    getError: function () {
        return this.error;
    },
    getErrorSummary: function () {
        return this.errorSummary;
    },
    setErrorSummary: function (a) {
        a = (a === undefined ? null : a);
        this.errorSummary = a;
        return this;
    },
    getErrorDescription: function () {
        return this.errorDescription;
    },
    getErrorIsWarning: function () {
        return this.errorIsWarning;
    },
    setReplay: function (a) {
        a = (a === undefined ? true : a);
        this.replay = !! a;
        return this;
    },
    isReplay: function () {
        return this.replay;
    },
    logError: function (a, b) {
        if (window.send_error_signal) {
            b = (b === undefined ? '' : (':' + b));
            send_error_signal(a, this.error + ':' + (env_get('vip') || '-') + b + ':' + this.request.getURI());
        }
    },
    logErrorByGroup: function (b, a) {
        if (Math.floor(Math.random() * a) == 0) if (this.error == 1357010 || this.error < 15000) {
            this.logError('async_error_oops_' + b);
        } else this.logError('async_error_logic_' + b);
    }
});

function DOMControl(a) {
    this.root = a && $(a);
    this.updating = false;
    if (this.root) this.root.getControl = identity.bind(null, this);
}
DOMControl.prototype = {
    getRoot: function () {
        return this.root;
    },
    beginUpdate: function () {
        if (this.updating) return false;
        this.updating = true;
        return true;
    },
    endUpdate: function () {
        this.updating = false;
    },
    update: function (a) {
        if (!this.beginUpdate()) return this;
        this.onupdate(a);
        this.endUpdate();
    }
};
var FormControl = {
    _gettingCaretPosition: false,
    getCaretPosition: function (a) {
        a = $(a);
        if (!DOM.isNode(a, ['input', 'textarea'])) return {
            start: undefined,
            end: undefined
        };
        if (!document.selection) return {
            start: a.selectionStart,
            end: a.selectionEnd
        };
        if (DOM.isNode(a, 'input')) {
            var c = document.selection.createRange();
            return {
                start: -c.moveStart('character', -a.value.length),
                end: -c.moveEnd('character', -a.value.length)
            };
        } else {
            if (!this._gettingCaretPosition) {
                this._gettingCaretPosition = true;
                a.focus();
                this._gettingCaretPosition = false;
            }
            var c = document.selection.createRange();
            var d = c.duplicate();
            d.moveToElementText(a);
            d.setEndPoint('StartToEnd', c);
            var b = a.value.length - d.text.length;
            d.setEndPoint('StartToStart', c);
            return {
                start: a.value.length - d.text.length,
                end: b
            };
        }
    },
    setCaretPosition: function (c, f, a) {
        c = $(c);
        if (document.selection) {
            if (c.tagName == 'TEXTAREA') {
                var b = c.value.indexOf("\r", 0);
                while (b != -1 && b < a) {
                    a--;
                    if (b < f) f--;
                    b = c.value.indexOf("\r", b + 1);
                }
            }
            var d = c.createTextRange();
            d.collapse(true);
            d.moveStart('character', f);
            if (a != undefined) d.moveEnd('character', a - f);
            d.select();
        } else {
            c.selectionStart = f;
            var e = a == undefined ? f : a;
            c.selectionEnd = Math.min(e, c.value.length);
            c.focus();
        }
    }
};

function TextInputControl(b) {
    this.parent.construct(this, b);
    var a = this.getRoot();
    this.maxLength = a.maxLength || null;
    var c = function () {
        this.update.bind(this).defer();
    }.bind(this);
    Event.listen(a, {
        keydown: c,
        paste: c
    });
}
TextInputControl.extend('DOMControl');
TextInputControl.prototype = {
    setMaxLength: function (a) {
        var b = this.getRoot();
        this.maxLength = a;
        if (a) {
            b.maxLength = a;
        } else b.removeAttribute('maxlength');
        return this;
    },
    getValue: function () {
        return Input.getValue(this.getRoot());
    },
    isEmpty: function () {
        return Input.isEmpty(this.getRoot());
    },
    setValue: function (a) {
        this.getRoot().value = a;
        this.update();
        return this;
    },
    clear: function () {
        return this.setValue('');
    },
    setPlaceholderText: function (a) {
        Input.setPlaceholder(this.getRoot(), a);
    },
    onupdate: function () {
        var d = this.getRoot();
        if (this.maxLength > 0) if (d.value.length > this.maxLength) {
            var e = d.value;
            var c = e.length - this.maxLength;
            var a = FormControl.getCaretPosition(d);
            var b = a.end || e.length;
            d.value = e.substring(0, b - c) + e.substring(b);
            if (typeof a.start != 'undefined') FormControl.setCaretPosition(d, a.start - c, Math.max(a.start, a.end) - c);
        }
    }
};

function TextAreaControl(a) {
    this.autogrow = false;
    this.parent.construct(this, a);
}
TextAreaControl.extend('TextInputControl');
TextAreaControl.prototype = {
    setAutogrow: function (a) {
        this.autogrow = a;
        return this;
    },
    resizeCallback: bagofholding,
    setResizeCallback: function (a) {
        this.resizeCallback = a;
    },
    onupdate: function () {
        this.parent.onupdate();
        if (this.autogrow) {
            var b = this.getRoot();
            var c = this.getShadow(b);
            if (!c) return;
            CSS.setStyle(c, 'width', Math.max(b.offsetWidth - 8, 0) + 'px');
            DOM.setContent(c, HTML(htmlize(b.value) + '...'));
            var a = Math.max(this.minHeight, c.offsetHeight);
            if (a != this.height) {
                CSS.setStyle(b, 'height', this.isEmpty() ? '' : a + 'px');
                this.resizeCallback(a, this.height);
                this.height = a;
            }
        } else if (this.shadow) {
            DOM.remove(this.shadow);
            this.shadow = null;
        }
    },
    getShadow: function (c) {
        if (!this.shadow) {
            var a = CSS.getStyle(c, 'fontSize');
            if (!a) return false;
            var b = parseInt(CSS.getStyle(c, 'height'), 10);
            this.minHeight = b > 0 ? b : c.offsetHeight - 8;
            this.shadow = $N('div', {
                className: 'DOMControl_shadow',
                style: {
                    wordWrap: 'break-word',
                    fontSize: a,
                    fontFamily: CSS.getStyle(c, 'fontFamily')
                }
            });
            DOM.getRootElement().appendChild(this.shadow);
        }
        return this.shadow;
    }
};
var DOMScroll = {
    getScrollState: function () {
        var d = Vector2.getViewportDimensions();
        var a = Vector2.getDocumentDimensions();
        var b = (a.x > d.x);
        var c = (a.y > d.y);
        b += 0;
        c += 0;
        return new Vector2(b, c);
    },
    _scrollbarSize: null,
    _initScrollbarSize: function () {
        var a = $N('p');
        a.style.width = '100%';
        a.style.height = '200px';
        var b = $N('div');
        b.style.position = 'absolute';
        b.style.top = '0px';
        b.style.left = '0px';
        b.style.visibility = 'hidden';
        b.style.width = '200px';
        b.style.height = '150px';
        b.style.overflow = 'hidden';
        b.appendChild(a);
        document.body.appendChild(b);
        var c = a.offsetWidth;
        b.style.overflow = 'scroll';
        var d = a.offsetWidth;
        if (c == d) d = b.clientWidth;
        document.body.removeChild(b);
        DOMScroll._scrollbarSize = c - d;
        if (DOMScroll._scrollbarSize < 5) DOMScroll._scrollbarSize = 15;
    },
    getScrollbarSize: function () {
        if (DOMScroll._scrollbarSize === null) DOMScroll._initScrollbarSize();
        return DOMScroll._scrollbarSize;
    },
    scrollTo: function (e, d, b, a) {
        d = d || d === undefined;
        if (!(e instanceof Vector2)) {
            var f = Vector2.getScrollPosition().x;
            var g = Vector2.getElementPosition($(e)).y;
            g = g - Math.min(0, Math.max(Vector2.getViewportDimensions().y / 3, 100));
            e = new Vector2(f, g, 'document');
        }
        if (b) {
            e.y -= Vector2.getViewportDimensions().y / 2;
        } else if (a) {
            e.y -= Vector2.getViewportDimensions().y;
            e.y += a;
        }
        e = e.convertTo('document');
        if (d && window.animation) {
            var c = document.body;
            animation(c).to('scrollTop', e.y).to('scrollLeft', e.x).ease(animation.ease.end).duration(750).go();
        } else if (window.scrollTo) window.scrollTo(e.x, e.y);
    }
};

function UntrustedLink(a, d, b, c) {
    this.dom = a;
    this.url = a.href;
    this.hash = d;
    this.func_get_params = c ||
    function () {
        return {};
    };
    Event.listen(this.dom, 'click', this.onclick.bind(this));
    Event.listen(this.dom, 'mousedown', this.onmousedown.bind(this));
    Event.listen(this.dom, 'mouseup', this.onmouseup.bind(this));
    Event.listen(this.dom, 'mouseout', this.onmouseout.bind(this));
    this.onmousedown($E(b));
}
UntrustedLink.bootstrap = function (a, d, b, c) {
    if (a.__untrusted) return;
    a.__untrusted = true;
    new UntrustedLink(a, d, b, c);
};
UntrustedLink.prototype.getRewrittenURI = function () {
    var a = copy_properties({
        u: this.url,
        h: this.hash
    }, this.func_get_params(this.dom));
    return new URI('/l.php').setQueryData(a).setSubdomain('www');
};
UntrustedLink.prototype.onclick = function () {
    (function () {
        this.dom.href = this.url;
    }).bind(this).defer(100);
    this.dom.href = this.getRewrittenURI();
};
UntrustedLink.prototype.onmousedown = function (a) {
    if (a.button == 2) this.dom.href = this.getRewrittenURI();
};
UntrustedLink.prototype.onmouseup = function () {
    this.dom.href = this.getRewrittenURI();
};
UntrustedLink.prototype.onmouseout = function () {
    this.dom.href = this.url;
};

function ElementController() {
    this.handlers = [
        [],
        []
    ];
}
copy_properties(ElementController, {
    ALL: 1,
    TARGETS: 2,
    MODIFIERS: 4,
    BUTTONS: 8
});
ElementController.prototype = {
    initialize: function () {
        this.initialize = bagofholding;
        onloadRegister(this.register.bind(this));
    },
    handle: function (e, event, a) {
        a = a || bagof(true);
        var b = this.handlers[0].concat(this.handlers[1]);
        for (var c = 0, d = b.length; c < d; c++) if (a(b[c].filters, e, event) && b[c].callback(e, event) === false) return event.kill();
    },
    _registerHandler: function (b, a, c, d) {
        this.initialize();
        b[d ? 'unshift' : 'push']({
            callback: a,
            filters: c || 0
        });
    },
    registerHandler: function (a, b, c) {
        this._registerHandler(this.handlers[0], a, b, c);
    },
    registerFallbackHandler: function (a, b, c) {
        this._registerHandler(this.handlers[1], a, b, c);
    }
};
var LinkController = new ElementController();
copy_properties(LinkController, {
    key: 'LinkControllerHandler',
    register: function () {
        Event.listen(document.documentElement, 'mousedown', this.handler.bind(this));
        Event.listen(document.documentElement, 'keydown', this.handler.bind(this));
    },
    handler: function (event) {
        var b = Parent.byTag(event.getTarget(), 'a');
        var a = b && b.getAttribute('href', 2);
        if (!a || b.rel || !this.usesWebProtocol(a) || DataStore.get(b, this.key)) return;
        DataStore.set(b, this.key, Event.listen(b, 'click', function (event) {
            if (a.charAt(a.length - 1) == '#') {
                event.prevent();
                return;
            }
            this.handle(b, event, this.filter);
        }.bind(this)));
    },
    filter: function (a, b, event) {
        if (a & ElementController.ALL) return true;
        if ((!(a & ElementController.TARGETS) && b.target) || (!(a & ElementController.MODIFIERS) && event.getModifiers().any) || (!(a & ElementController.BUTTONS) && ua.safari() >= 525 && event.which != 1)) return false;
        return true;
    },
    usesWebProtocol: function (a) {
        var b = a.match(/^(\w+):/);
        return !b || b[1].match(/^http/i);
    }
});
var FormController = new ElementController();
copy_properties(FormController, {
    register: function () {
        Event.listen(document.documentElement, 'submit', this.handler.bind(this));
    },
    handler: function (event) {
        user_action(event.getTarget(), 'form', event);
        return this.handle(event.getTarget(), event);
    }
});
onloadRegister(function () {
    copy_properties(AsyncRequest.prototype, {
        setNectarModuleData: function (c) {
            if (this.method == 'POST') {
                var d = Env.module;
                if (c && d === undefined) {
                    var b = {
                        fbpage_fan_confirm: 1
                    };
                    var e = null;
                    for (var a = c; a && a != document.body; a = a.parentNode) {
                        if (!a.id || typeof a.id !== 'string') continue;
                        if (a.id.startsWith('pagelet_')) {
                            d = a.id;
                            break;
                        }
                        if (!e && b[a.id]) e = a.id;
                    }
                    if (d === undefined && e) d = e;
                }
                if (d !== undefined) {
                    if (this.data.nctr === undefined) this.data.nctr = {};
                    this.data.nctr._mod = d;
                }
            }
        },
        setNectarImpressionId: function () {
            if (this.method == 'POST') {
                var a = env_get('impid');
                if (a !== undefined) {
                    if (this.data.nctr === undefined) this.data.nctr = {};
                    this.data.nctr._impid = a;
                }
            }
        }
    });
});

function htmlspecialchars(a) {
    if (typeof(a) == 'undefined' || a === null || !a.toString) return '';
    if (a === false) {
        return '0';
    } else if (a === true) return '1';
    return a.toString().replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function htmlize(a) {
    return htmlspecialchars(a).replace(/\n/g, '<br />');
}
function escape_js_quotes(a) {
    if (typeof(a) == 'undefined' || !a.toString) return '';
    return a.toString().replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/"/g, '\\x22').replace(/'/g, '\\\'').replace(/</g, '\\x3c').replace(/>/g, '\\x3e').replace(/&/g, '\\x26');
}
var DocumentTitle = (function (a) {
    return {
        get: function () {
            return a;
        },
        set: function (b, c) {
            document.title = b;
            if (!c) {
                a = b;
                Arbiter.inform('update_title', b);
            }
        }
    };
})(document.title);

function AjaxPipeRequest(b, a) {
    this._uri = b;
    this._query_data = a;
    this._request = new AsyncRequest();
    this._canvas_id = null;
    this._allow_cross_page_transition = true;
    this._replayable = false;
}
copy_properties(AjaxPipeRequest.prototype, {
    setCanvasId: function (a) {
        this._canvas_id = a;
        return this;
    },
    setURI: function (a) {
        this._uri = a;
        return this;
    },
    setData: function (a) {
        this._query_data = a;
        return this;
    },
    setAllowCrossPageTransition: function (a) {
        this._allow_cross_page_transition = a;
        return this;
    },
    setAppend: function (a) {
        this._append = a;
        return this;
    },
    send: function () {
        this._request.setURI(this._uri).setData(copy_properties({
            ajaxpipe: 1
        }, this._query_data)).setPreBootloadHandler(this._preBootloadHandler.bind(this)).setInitialHandler(this._onInitialResponse.bind(this)).setHandler(this._onResponse.bind(this)).setReplayable(this._replayable).setMethod('GET').setReadOnly(true).setAllowCrossPageTransition(this._allow_cross_page_transition).setOption('useIframeTransport', true);
        AjaxPipeRequest._current_request = this._request;
        this._request.send();
        return this;
    },
    _preBootloadFirstResponse: function (a) {
        return false;
    },
    _fireDomContentCallback: function () {
        this._arbiter.inform('ajaxpipe/domcontent_callback', true, Arbiter.BEHAVIOR_STATE);
    },
    _fireOnloadCallback: function () {
        this._arbiter.inform('ajaxpipe/onload_callback', true, Arbiter.BEHAVIOR_STATE);
    },
    _isRelevant: function (a) {
        return this._request == AjaxPipeRequest._current_request || a.isReplay();
    },
    _preBootloadHandler: function (a) {
        if (a.getPayload().redirect || !this._isRelevant(a)) return false;
        var b = false;
        if (a.is_first) {
            !this._append && AjaxPipeRequest.clearCanvas(this._canvas_id);
            this._arbiter = new Arbiter();
            b = this._preBootloadFirstResponse(a);
            this.pipe = new BigPipe({
                arbiter: this._arbiter,
                rootNodeID: this._canvas_id,
                lid: this._request.lid,
                rrEnabled: a.payload.roadrunner_enabled,
                isAjax: true,
                domContentCallback: this._fireDomContentCallback.bind(this),
                onloadCallback: this._fireOnloadCallback.bind(this),
                domContentEvt: 'ajaxpipe/domcontent_callback',
                onloadEvt: 'ajaxpipe/onload_callback',
                isReplay: a.isReplay()
            });
        }
        return b;
    },
    _redirect: function (a) {
        return false;
    },
    _versionCheck: function (a) {
        return true;
    },
    _onInitialResponse: function (b) {
        var a = b.getPayload();
        if (!this._isRelevant(b)) return false;
        if (!a) return true;
        if (this._redirect(a) || !this._versionCheck(a)) return false;
        return true;
    },
    _processFirstPayload: function (a) {
        if (ge(this._canvas_id) && a.canvas_class !== null) CSS.setClass(this._canvas_id, a.canvas_class);
    },
    _onResponse: function (b) {
        var a = b.payload;
        if (!this._isRelevant(b)) return AsyncRequest.suppressOnloadToken;
        if (b.is_first) {
            this._processFirstPayload(a);
            a.provides.push('uipage_onload');
            if (this._append) a.append = this._canvas_id;
        }
        if (!b.is_last || b.is_first) {
            if ('content' in a.content && this._canvas_id != 'content') {
                a.content[this._canvas_id] = a.content.content;
                delete a.content.content;
            }
            this.pipe.onPageletArrive(a);
        }
        if (b.is_last) {
            AjaxPipeRequest.restoreCanvas(this._canvas_id);
            this._request.cavalry && this._request.cavalry.setTimeStamp('t_html');
        }
        return AsyncRequest.suppressOnloadToken;
    },
    setFinallyHandler: function (a) {
        this._request.setFinallyHandler(a);
        return this;
    },
    setErrorHandler: function (a) {
        this._request.setErrorHandler(a);
        return this;
    },
    abort: function () {
        this._request.abort();
        if (AjaxPipeRequest._current_request == this._request) AjaxPipeRequest._current_request = null;
        this._request = null;
        return this;
    },
    setReplayable: function (a) {
        this._replayable = a;
        return this;
    }
});
copy_properties(AjaxPipeRequest, {
    clearCanvas: function (a) {
        var b = ge(a);
        if (b) {
            b.style.minHeight = '600px';
            DOM.empty(b);
        }
    },
    restoreCanvas: function (a) {
        var b = ge(a);
        if (b) b.style.minHeight = '100px';
    },
    getCurrentRequest: function () {
        return AjaxPipeRequest._current_request;
    },
    setCurrentRequest: function (a) {
        AjaxPipeRequest._current_request = a;
    },
    isActiveOnPage: function (b) {
        if (!env_get('ajaxpipe_enabled')) return false;
        var a = new RegExp(env_get('ajaxpipe_inactive_page_regex') || null);
        return !a.test(URI(b).getPath());
    }
});
JSCC = window.JSCC ||
function () {
    var a = {},
        b = {};
    return {
        get: function (c) {
            if (c in b) {
                return b[c];
            } else {
                b[c] = a[c]();
                delete a[c];
                return b[c];
            }
        },
        init: function (d, c) {
            if (c) {
                a = {};
                b = {};
            }
            JSCC.put(d);
        },
        put: function (c) {
            copy_properties(a, c);
        }
    };
}();
var HistoryManager = window.HistoryManager || {
    _IFRAME_BASE_URI: 'http://static.ak.facebook.com/common/history_manager.php',
    history: null,
    current: 0,
    fragment: null,
    _setIframeSrcFragment: function (b) {
        b = b.toString();
        var a = HistoryManager.history.length - 1;
        HistoryManager.iframe.src = HistoryManager._IFRAME_BASE_URI + '?|index=' + a + '#' + encodeURIComponent(b);
        return HistoryManager;
    },
    getIframeSrcFragment: function () {
        return decodeURIComponent(URI(HistoryManager.iframe.contentWindow.document.location.href).getFragment());
    },
    nextframe: function (a, b) {
        if (b) {
            HistoryManager._setIframeSrcFragment(a);
            return;
        }
        if (a !== undefined) {
            HistoryManager.iframeQueue.push(a);
        } else {
            HistoryManager.iframeQueue.splice(0, 1);
            HistoryManager.iframeTimeout = null;
            HistoryManager.checkURI();
        }
        if (HistoryManager.iframeQueue.length && !HistoryManager.iframeTimeout) {
            var c = HistoryManager.iframeQueue[0];
            HistoryManager.iframeTimeout = setTimeout(function () {
                HistoryManager._setIframeSrcFragment(c);
            }, 100, false);
        }
    },
    isInitialized: function () {
        return !!HistoryManager._initialized;
    },
    init: function () {
        if (!env_get('ALLOW_TRANSITION_IN_IFRAME') && window != window.top) return;
        if (HistoryManager._initialized) return HistoryManager;
        var b = URI();
        var a = b.getFragment() || '';
        if (a.charAt(0) === '!') {
            a = a.substr(1);
            b.setFragment(a);
        }
        if (URI.getRequestURI(false).getProtocol().toLowerCase() == 'https') HistoryManager._IFRAME_BASE_URI = 'https://s-static.ak.facebook.com/common/history_manager.php';
        copy_properties(HistoryManager, {
            _initialized: true,
            fragment: a,
            orig_fragment: a,
            history: [b],
            callbacks: [],
            lastChanged: new Date().getTime(),
            canonical: URI('#'),
            fragmentTimeout: null,
            user: 0,
            iframeTimeout: null,
            iframeQueue: [],
            enabled: true,
            debug: bagofholding
        });
        if (window.history && history.pushState) {
            this.lastURI = document.location.href;
            window.history.replaceState(this.lastURI, null);
            Event.listen(window, 'popstate', function (c) {
                if (c && c.state && HistoryManager.lastURI != c.state) {
                    HistoryManager.lastURI = c.state;
                    HistoryManager.lastChanged = (+new Date());
                    HistoryManager.notify(URI(c.state).getUnqualifiedURI().toString());
                }
            }.bind(HistoryManager));
            if (ua.chrome() > 5 || ua.safari() > 533) setInterval(HistoryManager.checkURI, 42, false);
            if (ua.safari() < 534) HistoryManager._updateRefererURI(this.lastURI);
            return HistoryManager;
        }
        HistoryManager._updateRefererURI(URI.getRequestURI(false));
        if (ua.safari() < 500 || ua.firefox() < 2) {
            HistoryManager.enabled = false;
            return HistoryManager;
        }
        if (ua.ie() < 8) {
            HistoryManager.iframe = document.createElement('iframe');
            copy_properties(HistoryManager.iframe.style, {
                width: '0',
                height: '0',
                frameborder: '0',
                left: '0',
                top: '0',
                position: 'absolute'
            });
            onloadRegister(function () {
                HistoryManager._setIframeSrcFragment(a);
                document.body.insertBefore(HistoryManager.iframe, document.body.firstChild);
            });
        } else if ('onhashchange' in window) {
            Event.listen(window, 'hashchange', function () {
                HistoryManager.checkURI.bind(HistoryManager).defer();
            });
        } else setInterval(HistoryManager.checkURI, 42, false);
        return HistoryManager;
    },
    registerURIHandler: function (a) {
        HistoryManager.callbacks.push(a);
        return HistoryManager;
    },
    setCanonicalLocation: function (a) {
        HistoryManager.canonical = URI(a);
        return HistoryManager;
    },
    notify: function (c) {
        if (c == HistoryManager.orig_fragment) c = HistoryManager.canonical.getFragment();
        for (var b = 0; b < HistoryManager.callbacks.length; b++) try {
            if (HistoryManager.callbacks[b](c)) return true;
        } catch (a) {}
        return false;
    },
    checkURI: function () {
        if (new Date().getTime() - HistoryManager.lastChanged < 400) return;
        if (window.history && history.pushState) {
            var c = document.URL;
            if (c != HistoryManager.lastURI) {
                HistoryManager.lastChanged = (+new Date());
                HistoryManager.lastURI = c;
                if (ua.safari() < 534) HistoryManager._updateRefererURI(c);
                HistoryManager.notify(URI(c).getUnqualifiedURI().toString());
            }
            return;
        }
        if (ua.ie() < 8 && HistoryManager.iframeQueue.length) return;
        if (ua.safari() && window.history.length == 200) {
            if (!HistoryManager.warned) HistoryManager.warned = true;
            return;
        }
        var a = URI().getFragment();
        if (a.charAt(0) == '!') a = a.substr(1);
        if (ua.ie() < 8) a = HistoryManager.getIframeSrcFragment();
        a = a.replace(/%23/g, '#');
        if (a != HistoryManager.fragment.replace(/%23/g, '#')) {
            HistoryManager.debug([a, ' vs ', HistoryManager.fragment, 'whl: ', window.history.length, 'QHL: ', HistoryManager.history.length].join(' '));
            for (var b = HistoryManager.history.length - 1; b >= 0; --b) if (HistoryManager.history[b].getFragment().replace(/%23/g, '#') == a) break;
            ++HistoryManager.user;
            if (b >= 0) {
                HistoryManager.go(b - HistoryManager.current);
            } else HistoryManager.go('#' + a);
            --HistoryManager.user;
        }
        delete a;
    },
    _updateRefererURI: function (c) {
        c = c.toString();
        if (c.charAt(0) != '/' && c.indexOf('//') == -1) return;
        var b = new URI(window.location);
        if (b.isFacebookURI()) {
            var a = b.getPath() + window.location.search;
        } else var a = '';
        setCookie('x-referer', URI(c).getQualifiedURI().setFragment(a).toString());
    },
    go: function (c, e, f) {
        if (window.history && history.pushState) {
            e || typeof(c) == 'number';
            var h = URI(c).removeQueryData('ref').toString();
            HistoryManager.lastChanged = (+new Date());
            this.lastURI = h;
            if (f) {
                window.history.replaceState(c, null, h);
            } else window.history.pushState(c, null, h);
            if (ua.safari() < 534) HistoryManager._updateRefererURI(c);
            return false;
        }
        HistoryManager.debug('go: ' + c);
        if (e === undefined) e = true;
        if (!HistoryManager.enabled) if (!e) return false;
        if (typeof(c) == 'number') {
            if (!c) return false;
            var b = c + HistoryManager.current;
            var d = Math.max(0, Math.min(HistoryManager.history.length - 1, b));
            HistoryManager.current = d;
            b = HistoryManager.history[d].getFragment() || HistoryManager.orig_fragment;
            b = URI(b).removeQueryData('ref').getUnqualifiedURI().toString();
            HistoryManager.fragment = b;
            HistoryManager.lastChanged = new Date().getTime();
            if (ua.ie() < 8) {
                if (HistoryManager.fragmentTimeout) clearTimeout(HistoryManager.fragmentTimeout);
                HistoryManager._temporary_fragment = b;
                HistoryManager.fragmentTimeout = setTimeout(function () {
                    window.location.hash = '#!' + b;
                    delete HistoryManager._temporary_fragment;
                }, 750, false);
                if (!HistoryManager.user) HistoryManager.nextframe(b, f);
            } else if (!HistoryManager.user) go_or_replace(window.location, window.location.href.split('#')[0] + '#!' + b, f);
            if (e) HistoryManager.notify(b);
            HistoryManager._updateRefererURI(b);
            return false;
        }
        c = URI(c);
        if (c.getDomain() == URI().getDomain()) c = URI('#' + c.getUnqualifiedURI());
        var a = HistoryManager.history[HistoryManager.current].getFragment();
        var g = c.getFragment();
        if (g == a || (a == HistoryManager.orig_fragment && g == HistoryManager.canonical.getFragment())) {
            if (e) HistoryManager.notify(g);
            HistoryManager._updateRefererURI(g);
            return false;
        }
        if (f) HistoryManager.current--;
        var i = (HistoryManager.history.length - HistoryManager.current) - 1;
        HistoryManager.history.splice(HistoryManager.current + 1, i);
        HistoryManager.history.push(URI(c));
        return HistoryManager.go(1, e, f);
    },
    getCurrentFragment: function () {
        var a = HistoryManager._temporary_fragment !== undefined ? HistoryManager._temporary_fragment : URI.getRequestURI(false).getFragment();
        return a == HistoryManager.orig_fragment ? HistoryManager.canonical.getFragment() : a;
    }
};
var PageTransitions = window.PageTransitions || {
    _transition_handlers: [],
    _scroll_positions: {},
    _scroll_locked: false,
    isInitialized: function () {
        return !!PageTransitions._initialized;
    },
    _init: function () {
        if (!env_get('ALLOW_TRANSITION_IN_IFRAME') && window != window.top) return;
        if (PageTransitions._initialized) return PageTransitions;
        PageTransitions._initialized = true;
        var d = URI.getRequestURI(false);
        var a = d.getUnqualifiedURI();
        var e = URI(a).setFragment(null);
        var c = a.getFragment();
        if (c.charAt(0) === '!' && e.toString() === c.substr(1)) a = e;
        copy_properties(PageTransitions, {
            _current_uri: a,
            _most_recent_uri: a,
            _next_uri: a
        });
        var b;
        if (d.getFragment().startsWith('/')) {
            b = d.getFragment();
        } else b = a;
        HistoryManager.init().setCanonicalLocation('#' + b).registerURIHandler(PageTransitions._historyManagerHandler);
        LinkController.registerFallbackHandler(PageTransitions._rewriteHref, LinkController.TARGETS | LinkController.MODIFIERS);
        LinkController.registerFallbackHandler(PageTransitions._onlinkclick);
        FormController.registerFallbackHandler(PageTransitions._onformsubmit);
        Event.listen(window, 'scroll', function () {
            if (!PageTransitions._scroll_locked) PageTransitions._scroll_positions[PageTransitions._current_uri] = Vector2.getScrollPosition();
        });
        return PageTransitions;
    },
    registerHandler: function (b, a) {
        PageTransitions._init();
        a = a || 5;
        if (!PageTransitions._transition_handlers[a]) PageTransitions._transition_handlers[a] = [];
        PageTransitions._transition_handlers[a].push(b);
    },
    getCurrentURI: function (a) {
        if (!PageTransitions._current_uri && !a) return new URI(PageTransitions._most_recent_uri);
        return new URI(PageTransitions._current_uri);
    },
    getMostRecentURI: function () {
        return new URI(PageTransitions._most_recent_uri);
    },
    getNextURI: function () {
        return new URI(PageTransitions._next_uri);
    },
    _rewriteHref: function (a) {
        var c = a.getAttribute('href');
        var b = _computeRelativeURI(PageTransitions._most_recent_uri.getQualifiedURI(), c).toString();
        if (c != b) a.setAttribute('href', b);
    },
    _onlinkclick: function (a) {
        _BusyUIManager.lookBusy(a);
        PageTransitions.go(a.getAttribute('href'));
        return false;
    },
    _onformsubmit: function (a) {
        var c = new URI(a.getAttribute('action') || ''),
            b = _computeRelativeURI(PageTransitions._most_recent_uri, c);
        a.setAttribute('action', b.toString());
        if (!a.method || a.method.toUpperCase() == 'GET') {
            PageTransitions.go(b.addQueryData(Form.serialize(a)));
            return false;
        }
    },
    go: function (d, b) {
        var a = new URI(d).removeQueryData('quickling').getQualifiedURI();
        var c = a.getUnqualifiedURI();
        delete PageTransitions._scroll_positions[c];
        !b && user_action({
            href: a.toString()
        }, 'uri', null);
        _BusyUIManager.lookBusy();
        PageTransitions._loadPage(a, function (e) {
            if (e) {
                HistoryManager.go(a.toString(), false, b);
            } else go_or_replace(window.location, a, b);
        });
    },
    _historyManagerHandler: function (a) {
        if (a.charAt(0) != '/') return false;
        user_action({
            href: a
        }, 'h', null);
        PageTransitions._loadPage(new URI(a), function (b) {
            if (!b) go_or_replace(window.location, a, true);
        });
        return true;
    },
    _loadPage: function (e, c) {
        if (e.getFragment() && are_equal(URI(e).setFragment(null).getQualifiedURI(), URI(PageTransitions._current_uri).setFragment(null).getQualifiedURI())) {
            PageTransitions._current_uri = PageTransitions._most_recent_uri = e;
            PageTransitions.restoreScrollPosition();
            _BusyUIManager.stopLookingBusy();
            return;
        }
        var d = PageTransitions._scroll_positions[PageTransitions._current_uri];
        PageTransitions._current_uri = null;
        PageTransitions._next_uri = e;
        if (d) DOMScroll.scrollTo(d, false);
        var b = function () {
            PageTransitions._scroll_locked = true;
            var f = PageTransitions._handleTransition(e);
            c && c(f);
        };
        var a = _runHooks('onbeforeleavehooks');
        if (a) {
            _BusyUIManager.stopLookingBusy();
            PageTransitions._warnBeforeLeaving(a, b);
        } else b();
    },
    _handleTransition: function (f) {
        window.onbeforeleavehooks = undefined;
        _BusyUIManager.lookBusy();
        if (!f.isSameOrigin()) return false;
        var e = window.AsyncRequest && AsyncRequest.getLastId();
        Arbiter.inform("pre_page_transition", {
            from: PageTransitions.getMostRecentURI(),
            to: f
        });
        for (var b = PageTransitions._transition_handlers.length - 1; b >= 0; --b) {
            var a = PageTransitions._transition_handlers[b];
            if (!a) continue;
            for (var c = a.length - 1; c >= 0; --c) if (a[c](f) === true) {
                var d = {
                    sender: this,
                    uri: f,
                    id: e
                };
                Arbiter.inform("page_transition", d);
                return true;
            } else a.splice(c, 1);
        }
        return false;
    },
    unifyURI: function () {
        PageTransitions._current_uri = PageTransitions._most_recent_uri = PageTransitions._next_uri;
    },
    transitionComplete: function (a) {
        PageTransitions._executeCompletionCallback();
        _BusyUIManager.stopLookingBusy();
        PageTransitions.unifyURI();
        if (!a) PageTransitions.restoreScrollPosition();
    },
    _executeCompletionCallback: function () {
        if (PageTransitions._completionCallback) PageTransitions._completionCallback();
        PageTransitions._completionCallback = null;
    },
    setCompletionCallback: function (a) {
        PageTransitions._completionCallback = a;
    },
    _warnBeforeLeaving: function (b, a) {
        new Dialog().setTitle(_tx("Are you sure you want to leave this page?")).setBody(htmlize(b)).setButtons([{
            name: 'leave_page',
            label: _tx("Leave This Page"),
            handler: a
        },
        {
            name: 'continue_editing',
            label: _tx("Continue Editing"),
            className: 'inputaux'
        }]).setModal().show();
    },
    restoreScrollPosition: function () {
        PageTransitions._scroll_locked = false;
        var c = PageTransitions._current_uri;
        var e = PageTransitions._scroll_positions[c];
        if (e) {
            DOMScroll.scrollTo(e, false);
            return;
        }
        function d(f) {
            return (f || null) && (DOM.scry(document.body, "a[name='" + escape_js_quotes(f) + "']")[0] || ge(f));
        }
        var a = d(c.getFragment());
        if (a) {
            var b = Vector2.getElementPosition(a);
            b.x = 0;
            DOMScroll.scrollTo(b);
        }
    }
};

function _computeRelativeURI(d, b) {
    var e = new URI(),
        c = b;
    d = new URI(d);
    b = new URI(b);
    if (!b.isFacebookURI()) return c;
    var f = d;
    var a = ['Protocol', 'Domain', 'Port', 'Path', 'QueryData', 'Fragment'];
    a.forEach(function (h) {
        var g = h == 'Path' && f === d;
        if (g) e.setPath(_computeRelativePath(d.getPath(), b.getPath()));
        if (!is_empty(b['get' + h]())) f = b;
        if (!g) e['set' + h](f['get' + h]());
    });
    return e;
}
function _computeRelativePath(b, a) {
    if (!a) return b;
    if (a.charAt(0) == '/') return a;
    var c = b.split('/').slice(0, -1);
    c[0] !== '';
    a.split('/').forEach(function (d) {
        if (!(d == '.')) if (d == '..') {
            if (c.length > 1) c = c.slice(0, -1);
        } else c.push(d);
    });
    return c.join('/');
}
function go_or_replace(a, d, c) {
    var e = new URI(d);
    if (a.pathname == '/' && e.getPath() != '/' && e.isQuicklingEnabled()) {
        var b = a.search ? {} : {
            q: ''
        };
        e = new URI().setPath('/').setQueryData(b).setFragment(e.getUnqualifiedURI()).toString();
        d = e.toString();
    }
    if (c && !(ua.ie() < 8)) {
        a.replace(d);
    } else if (a.href == d) {
        a.reload();
    } else a.href = d;
}
var _BusyUIManager = window._BusyUIManager || {
    _looking_busy: false,
    _original_cursors: [],
    lookBusy: function (a) {
        if (a) _BusyUIManager._giveProgressCursor(a);
        if (_BusyUIManager._looking_busy) return;
        _BusyUIManager._looking_busy = true;
        _BusyUIManager._giveProgressCursor(document.body);
    },
    stopLookingBusy: function () {
        if (!_BusyUIManager._looking_busy) return;
        _BusyUIManager._looking_busy = false;
        while (_BusyUIManager._original_cursors.length) {
            var c = _BusyUIManager._original_cursors.pop();
            var b = c[0];
            var a = c[1];
            if (b.style) b.style.cursor = a || '';
        }
    },
    _giveProgressCursor: function (a) {
        if (!ua.safari()) {
            _BusyUIManager._original_cursors.push([a, a.style.cursor]);
            a.style.cursor = 'progress';
        }
    }
};
onloadRegister(function () {
    Event.listen(document.documentElement, 'submit', function (b) {
        var a = b.getTarget().getElementsByTagName('*');
        for (var c = 0; c < a.length; c++) if (a[c].getAttribute('placeholder') && Input.isEmpty(a[c])) a[c].value = '';
    });
});
var UIIntentionalStreamMessage = {
    SET_AUTO_INSERT: 'UIIntentionalStream/setAutoInsert',
    UPDATE_STREAM: 'UIIntentionalStreamRefresh/updateStream',
    REFRESH_STREAM: 'UIIntentionalStreamRefresh/refreshStream',
    SAVE_PENDING_HIGHLIGHTS: 'UIIntentionalStreamRefresh/savePendingHighlights',
    UPDATE_AUTOREFRESH_CONFIG: 'UIIntentionalStream/updateAutoRefreshConfig',
    UPDATE_HTML_CONTENT: 'UIIntentionalStream/updateHtmlContent',
    UPDATE_LAST_REFRESH_TIME: 'UIIntentionalStream/updateLastRefreshTime'
};
if (!this.JSON) this.JSON = function () {
    function f(n) {
        return n < 10 ? '0' + n : n;
    }
    Date.prototype.toJSON = function () {
        return this.getUTCFullYear() + '-' + f(this.getUTCMonth() + 1) + '-' + f(this.getUTCDate()) + 'T' + f(this.getUTCHours()) + ':' + f(this.getUTCMinutes()) + ':' + f(this.getUTCSeconds()) + 'Z';
    };
    var m = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"': '\\"',
        '\\': '\\\\'
    };

    function stringify(value, whitelist) {
        var a, i, k, l, v;
        switch (typeof value) {
        case 'string':
            return (new RegExp('[\x00-\x1f\\\\"]')).test(value) ? '"' + value.replace(/[\x00-\x1f\\"]/g, function (a) {
                var c = m[a];
                if (c) return c;
                c = a.charCodeAt();
                return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
            }) + '"' : '"' + value + '"';
        case 'number':
            return isFinite(value) ? String(value) : 'null';
        case 'boolean':
            return String(value);
        case 'null':
            return 'null';
        case 'object':
            if (DOM.isNode(value)) return null;
            if (!value) return 'null';
            if (typeof value.toJSON === 'function') return stringify(value.toJSON());
            a = [];
            if (typeof value.length === 'number' && !(propertyIsEnumerable(value, 'length'))) {
                l = value.length;
                for (i = 0; i < l; i += 1) a.push(stringify(value[i], whitelist) || 'null');
                return '[' + a.join(',') + ']';
            }
            if (whitelist) {
                l = whitelist.length;
                for (i = 0; i < l; i += 1) {
                    k = whitelist[i];
                    if (typeof k === 'string') {
                        v = stringify(value[k], whitelist);
                        if (v) a.push(stringify(k) + ':' + v);
                    }
                }
            } else for (k in value) if (typeof k === 'string') {
                v = stringify(value[k], whitelist);
                if (v) a.push(stringify(k) + ':' + v);
            }
            return '{' + a.join(',') + '}';
        }
    }
    return {
        stringify: stringify,
        parse: function (text, filter) {
            var j;

            function walk(k, v) {
                var i, n;
                if (v && typeof v === 'object') for (i in v) if (Object.prototype.hasOwnProperty.apply(v, [i])) {
                    n = walk(i, v[i]);
                    if (n !== undefined) v[i] = n;
                }
                return filter(k, v);
            }
            if (text && /^[\],:{}\s]*$/.test(text.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(:?[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                j = eval('(' + text + ')');
                return typeof filter === 'function' ? walk('', j) : j;
            }
            throw new SyntaxError('decodeJSON');
        }
    };
}();
this.JSON.encode = this.JSON.stringify;
this.JSON.decode = this.JSON.parse;

function propertyIsEnumerable(a, b) {
    if (a.propertyIsEnumerable) return a.propertyIsEnumerable(b);
    for (var c in a) if (c == b) return true;
    return false;
}

function Tabset(a, b) {
    if (!Tabset.instances) Tabset.instances = {};
    Tabset.instances[a] = this;
    onleaveRegister(function () {
        Tabset.instances = {};
    });
    this.id = a;
    this.selectedId = b;
}
Tabset.getInstance = function (a) {
    if (Tabset.instances && Tabset.instances[a]) return Tabset.instances[a];
    return null;
};
Tabset.prototype.getFullTabId = function (a) {
    return this.id + '_' + a;
};
Tabset.prototype.selectTab = function (c, b, a) {
    if (a && !a()) return false;
    if (this.selectedId) {
        this.lastSelected = this.selectedId;
        CSS.removeClass(ge(this.selectedId), 'Tabset_selected');
    }
    this.selectedId = c;
    CSS.addClass(ge(this.selectedId), 'Tabset_selected');
    if (b) return b();
    return true;
};
Tabset.prototype.unselect = function () {
    if (this.selectedId) CSS.removeClass($(this.selectedId), 'Tabset_selected');
};
Tabset.prototype.hasTabElem = function (a) {
    return ge(this.id + '_' + a);
};
Tabset.prototype.getTabElem = function (a) {
    return $(this.id + '_' + a);
};
window.__UIControllerRegistry = window.__UIControllerRegistry || {};

function UIPagelet(c, d, a, b) {
    this._id = c || null;
    this._element = ge(c || $N('div'));
    this._src = d || null;
    this._context_data = a || {};
    this._data = b || {};
    this._handler = bagofholding;
    this._request = null;
    this._use_ajaxpipe = false;
    this._is_bundle = true;
    this._allow_cross_page_transition = false;
    this._append = false;
    return this;
}
UIPagelet.loadFromEndpoint = function (b, e, a, c) {
    c = c || {};
    var d = ('/pagelet/generic.php/' + b).replace(/\/+/g, '/');
    new UIPagelet(e, d, a).setUseAjaxPipe(c.usePipe).setBundleOption(b.substring(0, 8) != '/intern/').setReplayable(c.replayable).setAppend(c.append).setAllowCrossPageTransition(c.crossPage).go();
};
copy_properties(UIPagelet.prototype, {
    getElement: function (a) {
        a = a || false;
        if (a) this._element = ge(this._id);
        return this._element;
    },
    setHandler: function (a) {
        this._handler = a;
        return this;
    },
    go: function (b, a) {
        if (arguments.length >= 2 || typeof b == 'string') {
            this._src = b;
            this._data = a || {};
        } else if (arguments.length == 1) this._data = b;
        this.refresh();
        return this;
    },
    setAllowCrossPageTransition: function (a) {
        this._allow_cross_page_transition = a;
        return this;
    },
    setBundleOption: function (a) {
        this._is_bundle = a;
        return this;
    },
    refresh: function (b) {
        var a = function (d) {
            this._request = null;
            if (b && this._id) this._element = ge(this._id);
            var c = HTML(d.getPayload());
            if (this._append) {
                DOM.appendContent(this._element, c);
            } else DOM.setContent(this._element, c);
            this._handler();
        }.bind(this);
        if (this._use_ajaxpipe) {
            this._request = new AjaxPipeRequest();
            this._request.setCanvasId(this._id).setAppend(this._append);
        } else this._request = new AsyncRequest().setMethod('GET').setReadOnly(true).setOption('bundle', this._is_bundle).setHandler(a);
        this._request.setURI(this._src).setReplayable(this._replayable).setAllowCrossPageTransition(this._allow_cross_page_transition).setData({
            data: JSON.encode(merge(this._context_data, this._data))
        }).send();
        return this;
    },
    cancel: function () {
        if (this._request) this._request.abort();
    },
    setUseAjaxPipe: function (a) {
        this._use_ajaxpipe = !! a;
        return this;
    },
    setReplayable: function (a) {
        this._replayable = !! a;
        return this;
    },
    setAppend: function (a) {
        this._append = !! a;
        return this;
    }
});

if (window.Bootloader) {
    Bootloader.done(["js\/8a1ruf3lmug4s8cw.pkg.js"]);
}

/*
HTTP Host: static.ak.fbcdn.net
Generated: October 11th 2010 1:10:02 PM PDT
Machine: 10.30.146.199
*/

if (window.CavalryLogger) {
    CavalryLogger.start_js(["js\/4gj8wkxihgu8cgkc.pkg.js"]);
}

function create_hidden_input(a, b) {
    return $N('input', {
        name: a,
        id: a,
        value: b,
        type: 'hidden'
    });
}
function abTest(a, b) {
    AsyncRequest.pingURI('/ajax/abtest.php', {
        data: a,
        post_form_id: null
    }, true);
    return !b;
}
function ac(a) {
    new AsyncSignal('/ajax/ac.php', {
        meta: a
    }).send();
    return true;
}
function scribe_log(a, b) {
    new AsyncSignal('/ajax/scribe_log.php', {
        category: a,
        message: b
    }).send();
}
function textLimit(b, a) {
    var c = ge(b);
    if (c.value.length > a) {
        c.value = c.value.substring(0, a);
        if (arguments.length > 2) $(arguments[2]).style.display = 'block';
    }
}
function textLimitStrict(h, d, e, a, f) {
    var g = ge(h);
    if (g) {
        var c = g.value.length;
        var b = c - d;
        if (b > 0) {
            if (b > 25000) {
                g.value = g.value.substring(0, d + 25000);
                b = 25000;
            }
            $(e).style.display = 'block';
            $(a).innerHTML = b;
            $(f).disabled = true;
        } else if (c == 0) {
            $(e).style.display = 'none';
            $(f).disabled = true;
            $(a).innerHTML = 1;
        } else if ($(a).innerHTML != 0) {
            $(a).innerHTML = 0;
            $(e).style.display = 'none';
            $(f).disabled = false;
        }
    }
}
function city_selector_onfound(a, b) {
    a.value = b ? b.i : -1;
}
function city_selector_onselect(a) {
    if (window[a]) window[a]();
}

function adjustImage(e, g) {
    if (!g) {
        var a = e.parentNode;
        while (a.parentNode && (CSS.getStyle(a, 'display') != 'block' || a.offsetWidth == 0)) a = a.parentNode;
        g = a.offsetWidth;
    }
    var c = e.offsetWidth;
    if (c == 0) {
        var d = e.nextSibling,
            f = e.parentNode;
        document.body.appendChild(e);
        c = e.offsetWidth;
        if (d) {
            f.insertBefore(e, d);
        } else f.appendChild(e);
    }
    if (c > g) try {
        if (ua.ie() < 8) {
            var img_div = document.createElement('div');
            img_div.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + e.src.replace('"', '%22') + '", sizingMethod="scale")';
            img_div.style.width = g + 'px';
            img_div.style.height = Math.floor(((g / e.offsetWidth) * e.offsetHeight)) + 'px';
            if (e.parentNode.tagName == 'A') img_div.style.cursor = 'pointer';
            e.parentNode.insertBefore(img_div, e);
            e.parentNode.removeChild(e);
        } else throw 1;
    } catch (b) {
        e.style.width = g + 'px';
    }
    CSS.removeClass(e, 'img_loading');
}
function imageConstrainSize(e, b, c, d) {
    var a = new Image();
    a.onload = function () {
        if (a.width > 0 && a.height > 0) {
            var k = a.width;
            var h = a.height;
            if (k > b || h > c) {
                var g = c / b;
                var f = h / k;
                if (f > g) {
                    k = k * (c / h);
                    h = c;
                } else {
                    h = h * (b / k);
                    k = b;
                }
            }
            var j = ge(d);
            if (j) {
                var i = document.createElement('img');
                i.src = e;
                i.width = k;
                i.height = h;
                j.parentNode.insertBefore(i, j);
                j.parentNode.removeChild(j);
            }
        }
    };
    a.src = e;
}
function image_has_loaded(a) {
    if (a.naturalWidth !== undefined) {
        return a.complete && a.width != 0;
    } else if (a.height == 20 && a.width == 20 && a.complete) {
        return false;
    } else if (a.complete === undefined && ua.safari() < 500) {
        var b = new Image();
        b.src = a.src;
        return b.complete;
    }
    return a.complete;
}
function image_has_failed(a) {
    if ((a.complete == null && a.width == 20 && a.height == 20) || (a.mimeType != null && a.complete && a.mimeType == '') || (a.naturalHeight != null && a.complete && a.naturalHeight == 0)) return true;
}

function ComposerAttachment() {
    this._container = null;
}
copy_properties(ComposerAttachment, {
    newFromURL: function (c, b) {
        if (!/(?:https?:\/\/)?\w+\.\w+/.test(c)) return false;
        var a = new ComposerAttachment();
        a.url = c;
        new AsyncRequest().setURI('/ajax/inbox/ajax.php').setData({
            action: 'attachment',
            url: c
        }).setHandler(a._asyncCallback.bind(a)).setErrorHandler(b).send();
        return a;
    },
    setupThumbnails: function (a, b) {
        var c = new ImageSandbox();
        c.onfinish = function () {
            a = c.getImages();
            for (var d = a.length - 1; d >= 0; d--) if (a[d].width && (a[d].height < 50 || a[d].width < 50 || a[d].height / a[d].width > 3 || a[d].width / a[d].height > 3)) a.splice(d, 1);
            if (!a.length) {
                CSS.removeClass(b, 'loading');
                CSS.removeClass(b.parentNode, 'has_image');
                var e = b;
                while (e.parentNode && e.tagName.toLowerCase() != 'form') e = e.parentNode;
                e = e.getElementsByTagName('input');
                for (var d = 0; d < e.length; d++) if (e[d].name.indexOf('[params][images]') != -1) e[d].parentNode.removeChild(e[d]);
                return;
            }
            for (var f = 0; f < a.length - 1; f++) for (var g = a.length - 1; g >= f; g--) if (a[f].width * a[f].height < a[g].width * a[g].height) {
                temp = a[f];
                a[f] = a[g];
                a[g] = temp;
            }
            var e = b;
            while (e.parentNode && e.tagName.toLowerCase() != 'form') e = e.parentNode;
            e = e.getElementsByTagName('input');
            for (var d = 0; d < e.length; d++) if (e[d].name.indexOf('[params][images]') != -1) {
                e = e[d];
                break;
            }
            CSS.removeClass(b, 'loading');
            new ThumbnailSelector(b, e, a);
        }.bind(this);
        c.loadImages(a);
    }
});
copy_properties(ComposerAttachment.prototype, {
    containerReady: function (d, e) {
        this._container = d;
        var c = d.getElementsByTagName('input');
        var a = [''];
        for (var b = 0; b < c.length; b++) if (c[b].type == 'text' || c[b].type == 'hidden') a.push('<input type="hidden" name="' + htmlspecialchars(c[b].name) + '" value="' + htmlspecialchars(c[b].value) + '" />');
        if (e) {
            a.push('&nbsp;');
            d.innerHTML = a.join('');
            CSS.addClass(d, 'share_attachment_loading');
        } else d.innerHTML += a.join('');
    },
    _renderInputsRecursive: function (c, d) {
        if (d === null) return '';
        var a = [];
        if (typeof(d) == 'object') {
            for (var b in d) a.push(this._renderInputsRecursive(c + '[' + b + ']', d[b]));
        } else if (typeof(d) != 'function') a.push('<input type="hidden" name="', c, '" value="', htmlspecialchars(d), '" />');
        return a.join('');
    },
    _asyncCallback: function (b) {
        var a = b.getPayload().html;
        CSS.removeClass(this._container, 'share_attachment_loading');
        DOM.setContent(this._container, HTML(a));
    }
});

function ThumbnailSelector(f, d, c) {
    var b = ['<div class="thumbnail_stage"><h4>' + _tx("Choose a Thumbnail") + '</h4><div class="selector clearfix"><div class="arrows clearfix">', '<span class="left"><a href="#" class="arrow disabled">&nbsp;</a></span>', '<span class="right"><a href="#" class="arrow ', c.length > 1 ? 'enabled' : 'disabled', '">&nbsp;</a></span>', '</div><div class="counter"><span>1 of ', c.length, '</span></div></div>'];
    for (var e = 0; e < c.length; e++) b.push('<div class="thumbnail', e == 0 ? ' thumbnail_selected' : ' thumbnail_unselected', '">', '<img class="img_loading" src="', c[e].src, '" onload="adjustImage(this);" />', '</div>');
    b.push('<label style="white-space:nowrap"><input name="no_picture" type="checkbox" onclick="this.parentNode.parentNode.parentNode.thumbnail.use_thumbnail(this.checked)" />' + _tx("No Picture") + '</label></div>');
    f.innerHTML = b.join('');
    this.images = c;
    this.input = d;
    d.value = this.images[0].src;
    this.obj = f;
    this.obj.thumbnail = this;
    this.label = f.getElementsByTagName('span')[2];
    this.index = 0;
    var a = f.getElementsByTagName('a');
    this.left = a[0];
    this.right = a[1];
    this.left.onclick = this.left_arrow_press.bind(this);
    this.right.onclick = this.right_arrow_press.bind(this);
    this.left.onselectstart = this.right.onselectstart = function () {
        return false;
    };
    this.left.onmousedown = this.right.onmousedown = this._onmousedown;
    this.left.onmouseout = this.right.onmouseout = this._onmouseout;
}
copy_properties(ThumbnailSelector.prototype, {
    use_thumbnail: function (a) {
        if (!a) {
            this.move_selection(0);
            CSS.removeClass(this.obj, 'thumbnail_dont_use');
        } else {
            this.input.value = '';
            CSS.addClass(this.obj, 'thumbnail_dont_use');
        }
    },
    _onmousedown: function () {
        CSS.addClass(this, 'active');
        return false;
    },
    _onmouseout: function () {
        CSS.removeClass(this, 'active');
    },
    left_arrow_press: function () {
        CSS.addClass(this.left, 'active');
        this.move_selection(-1);
        return false;
    },
    right_arrow_press: function () {
        CSS.removeClass(this.right, 'active');
        this.move_selection(1);
        return false;
    },
    move_selection: function (f) {
        var d = this.index + f;
        if (d >= 0 && d < this.images.length) {
            var b = this.obj.getElementsByTagName('div');
            var e = 0;
            this.index = d;
            for (var c = 0; c < b.length; c++) {
                var a = b[c].className;
                if (!CSS.hasClass(b[c], 'thumbnail ')) continue;
                var g = e == d;
                if (a.indexOf(g ? '_unselected' : '_selected') != -1) CSS.setClass(b[c], a.replace(/thumbnail_(?:un)?selected/, g ? 'thumbnail_selected' : 'thumbnail_unselected'));
                e++;
            }
            this.label.innerHTML = _tx("{selected} of {total}", {
                selected: (d + 1),
                total: e
            });
            CSS.setClass(this.left, this.left.className.replace(/[^ ]+abled/, d == 0 ? 'disabled' : 'enabled'));
            CSS.setClass(this.right, this.right.className.replace(/[^ ]+abled/, d == this.images.length - 1 ? 'disabled' : 'enabled'));
            this.input.value = this.images[d].src;
        }
    }
});

function ImageSandbox() {
    this.obj = document.createElement('div');
    this.obj.style.left = this.obj.style.top = '-100px';
    this.obj.style.width = this.obj.style.height = '1px';
    this.obj.style.overflow = 'hidden';
    this.images = 0;
    this.done = 0;
    DOM.getRootElement().appendChild(this.obj);
}
copy_properties(ImageSandbox.prototype, {
    loadImages: function (b) {
        this.images = b.length;
        for (var a = 0; a < b.length; a++) new ImageSandboxLoader(this, b[a]);
    },
    onImageLoaded: function (a) {
        this.done++;
        this._stateChange();
    },
    onImageFailed: function (a) {
        a.destroy();
        this.images--;
        this._stateChange();
    },
    getImages: function () {
        var c = new Array();
        var a = this.obj.getElementsByTagName('img');
        for (var b = 0; b < a.length; b++) c.push(a[b]);
        return c;
    },
    _stateChange: function () {
        if (this.done == this.images) if (this.onfinish) this.onfinish();
    }
});

function ImageSandboxLoader(b, a) {
    this._timeout = 4000;
    this._start = new Date().getTime();
    this._sandbox = b;
    if (typeof a != 'object') a = {
        src: a
    };
    this._obj = document.createElement('img');
    this._obj.onload = function () {
        if (this._pollImage) this._pollImage(1);
    }.bind(this);
    this._obj.onerror = function () {
        if (this._pollImage) this._pollImage(2);
    }.bind(this);
    copy_properties(this._obj, a);
    this._sandbox.obj.appendChild(this._obj);
    if (this._pollImage !== null) this._pollImage();
}
copy_properties(ImageSandboxLoader.prototype, {
    _pollImage: function (a) {
        if (a == 1) {
            this._pollImage = null;
            this._sandbox.onImageLoaded(this);
        } else if (a == 2) {
            this._pollImage = null;
            this._sandbox.onImageFailed(this);
        } else if (image_has_failed(this._obj)) {
            this._pollImage(2);
        } else if (image_has_loaded(this._obj)) {
            this._pollImage(1);
        } else if ((this._start + this._timeout) < new Date().getTime()) {
            this._pollImage(2);
        } else setTimeout(function () {
            if (this._pollImage) this._pollImage();
        }.bind(this), 20);
    },
    destroy: function () {
        DOM.remove(this._obj);
        this._obj = null;
    }
});

function fix_attachment_more_menu_alignment(d) {
    var a = ge('attachment_buttons_list');
    var j = a.offsetWidth;
    if (d) {
        var f = Vector2.getElementPosition(d).x;
        var b = Vector2.getElementPosition(a).x;
        var g = f - b;
        var c = d.offsetWidth;
        var i = j - g;
        if (i >= c && i < 126) {
            var e = ge('wall_more_menu');
            var h = 0;
            e.style.left = 'auto';
            e.style.right = h + 'px';
        }
    }
}
function wall_video_thumb_adjust(a, b) {
    if (ua.ie() >= 6 && ua.ie() < 7) {
        a.style.marginTop = (-1 * b.height - 3) + 'px';
        a.style.paddingTop = (b.height - 19) + 'px';
    }
    a.style.display = 'block';
}
function attachments(a) {
    this.attachment_added = false;
    this.attachment_oid = null;
    this.attachment_app_id = null;
    this.is_share = false;
    this.attached_share = false;
    this.scrape_last_count = 0;
    this.dialog = null;
    this.wall_attachments = {};
    this.last_url_scraped = null;
    this.context = a;
    this.edit_container_id = 'attachment_edit_container_' + a;
    this.edit_loading_id = 'attachment_edit_loading_' + a;
    this.edit_id = 'attachment_edit_' + a;
    this.view_container_id = 'attachment_view_container_' + a;
    this.view_wrapper_id = 'attachment_view_wrapper_' + a;
    this.view_id = 'attachment_view_' + a;
    this.remove_id = 'attachment_remove_' + a;
    this.view_loading_id = 'attachment_view_loading_' + a;
    this.is_active = false;
}
attachments.prototype.show_edit_loading = function () {
    show(this.edit_loading_id);
};
attachments.prototype.hide_edit_loading = function () {
    hide(this.edit_loading_id);
};
attachments.prototype.show_attachment_edit = function (g, d, f, a) {
    this.is_active = true;
    if (this.dialog) return;
    var e = (f == 14);
    this.is_share = (f == 100);
    var h = '<div id="' + this.edit_container_id + '">' + '<div id="' + this.edit_loading_id + '">&nbsp;</div>' + '</div>';
    this.dialog = new Dialog().setImmediateRendering(true).setClassName('attachment_dialog').setTitle(g).setBody(h).setStackable(true).setButtons([Dialog.newButton('attach', _tx("Attach"), '', function () {
        if (this.is_share) {
            this._share_attach();
        } else this._attach(e, a, true);
        this.dialog.hide();
        this.dialog = null;
        this.is_active = false;
    }.bind(this)), Dialog.newButton('cancel', _tx("Cancel"), 'inputaux', function () {
        this.dialog.hide();
        this.remove_attachment_view();
        this.dialog = null;
        this.is_active = false;
    }.bind(this))]).show();
    var b = ge(this.edit_container_id);
    var c = document.createElement('div');
    c.className = 'share_stage';
    CSS.addClass(c, 'attachment_edit');
    c.id = this.edit_id;
    c.is_app = e;
    b.appendChild(c);
    DOM.setContent(c, HTML(d));
    return c;
};
attachments.prototype._show_attachment_view = function (c, d) {
    var a = ge(this.view_container_id);
    var b = document.createElement('div');
    b.className = 'share_stage';
    CSS.addClass(b, 'attachment_view');
    b.id = this.view_id;
    b.is_app = d;
    a.appendChild(b);
    DOM.setContent(b, HTML(c));
    hide('attachment_buttons_list');
    var e = ge(this.view_wrapper_id);
    e.style.display = 'block';
    this.attachment_added = true;
    return b;
};
attachments.prototype.remove_attachment_view = function () {
    var c = ge(this.view_container_id);
    var a = ge(this.view_id);
    if (this.attachment_added && a) {
        this.removed = true;
        c.removeChild(a);
        hide(this.view_wrapper_id);
        if (ge('attachment_buttons_list')) show('attachment_buttons_list');
        var b = ge(this.remove_id);
        CSS.setClass(b, b.className.replace(' edit', ''));
    }
    this.attachment_added = false;
    this.attachment_oid = null;
    this.attachment_app_id = null;
    this.is_share = false;
    this.attached_share = false;
};
attachments.prototype.get_all_form_elements = function (a) {
    var f = [];
    if (a) {
        var b = a.getElementsByTagName('input');
        for (var e = 0; e < b.length; e++) f.push(b[e]);
        var c = a.getElementsByTagName('select');
        for (var e = 0; e < c.length; e++) f.push(c[e]);
        var d = a.getElementsByTagName('textarea');
        for (var e = 0; e < d.length; e++) f.push(d[e]);
    }
    return f;
};
attachments.prototype._add_attachment_input_data = function (b, a) {
    if (!a) return false;
    var e = this.get_all_form_elements(a);
    if (a.is_app) {
        b.attachment = {
            app: {},
            type: 14
        };
        for (var d = 0; d < e.length; d++) if (!(e[d].type == "radio" || e[d].type == "checkbox") || e[d].checked) b.attachment.app[e[d].name] = e[d].value;
    } else {
        var c = false;
        for (var d = 0; d < e.length; d++) {
            if (e[d].name == 'attachment[type]') c = true;
            if (e[d].name == 'attachment[params][url]') if (!e[d].value || e[d].value == 'http://') return false;
            b[e[d].name] = e[d].value;
        }
        if (!c) return false;
    }
    b.context = this.context;
    return true;
};
attachments.prototype._attach = function (f, b, e) {
    var c = {};
    if (e) {
        var d = ge(this.edit_id);
        var a = this._add_attachment_input_data(c, d);
        if (!a) return;
    }
    if (b) for (var i in b) c[i] = b[i];
    var g = ge(this.view_loading_id);
    g.style.display = 'block';
    var j = this._show_attachment_view('', f);
    var h = function (k) {
        var l = k.getPayload();
        if (!j.removed) {
            hide(this.view_loading_id);
            DOM.setContent(j, HTML(l.html));
            this.attachment_oid = l.oid;
            this.attachment_app_id = l.app_id;
        }
    }.bind(this);
    new AsyncRequest().setHandler(h).setURI('/ajax/attachments.php').setErrorHandler(this.remove_attachment_view).setData(c).send();
};
attachments.prototype.add_post_data = function (a) {
    if (this.attachment_added) if (this.attached_share) {
        this._add_attachment_input_data(a, ge(this.view_id));
    } else a.attachment = {
        oid: this.attachment_oid,
        app_id: this.attachment_app_id
    };
};
attachments.prototype.prepare_wall_post = function () {
    var a = ge(this.view_id);
    if (a) {
        var c = this.get_all_form_elements(a);
        for (var b = 0; b < c.length; b++) c[b].disabled = true;
    }
};
attachments.prototype.show_full_attachment = function (a) {
    if (typeof this.wall_attachments[a] != 'string') return;
    hide('attachment_compact_' + a);
    hide('attached_item_info_' + a);
    hide('attachment_compact_td_' + a);
    attachment_div = ge('wall_attachment_' + a);
    DOM.setContent(attachment_div, HTML(this.wall_attachments[a]));
};
attachments.prototype.fix_app_inputs_on_send = function () {
    var a = ge(this.view_id);
    if (!this.attachment_added || !a) return;
    if (!this.attached_share) {
        new_inputs = [];
        new_inputs.push(create_hidden_input('attachment[oid]', this.attachment_oid));
        new_inputs.push(create_hidden_input('attachment[app_id]', this.attachment_app_id));
        if (a.is_app) {
            new_inputs.push(create_hidden_input('attachment[type]', 14));
            new_inputs.push(create_hidden_input('attachment[app][message_sent]', true));
        }
        for (var b = 0, c = new_inputs.length; b < c; b++) a.appendChild(new_inputs[b]);
    }
};
attachments.prototype.share_attach_from_dialog = function () {
    this._share_attach();
    Dialog.getCurrent().hide();
    this.dialog = null;
};
attachments.prototype._share_attach = function () {
    var a = ge('share_link');
    var b = a.value;
    if (b && b != 'http://') this._share_submit_url(b);
};
attachments.prototype._share_submit_url = function (c) {
    this._show_attachment_view(this.share_html_block, false);
    var d = ge(this.view_container_id);
    var b = d.childNodes[0].childNodes[0].childNodes[0];
    this._attach_link_url(b, c, true);
    var a = ge(this.remove_id);
    a.className += ' edit';
    this.attached_share = true;
};
attachments.prototype._attach_link_url = function (c, e, d) {
    var b = function (f) {
        this.remove_attachment_view();
        AsyncResponse.defaultErrorHandler(f);
    }.bind(this);
    var a = ComposerAttachment.newFromURL(e, b);
    a.containerReady(c, d);
};
attachments.prototype._is_fb_code_url = function (a) {
    return a.search('fb:') == 0;
};
attachments.prototype._auto_attach_link = function (event, b) {
    if (this._is_fb_code_url(b)) {
        var a = {
            code: b,
            context: this.context
        };
        this._attach(true, a, false);
    } else this._share_submit_url(b);
};
attachments.prototype.register_url_detection = function (b) {
    var a = new UrlDetector($(b));
    a.subscribe('urlDetected', this._auto_attach_link.bind(this));
    a.setSuppressDetectionCheck(function () {
        return this.attachment_added;
    }.bind(this));
};
var TargetedPrivacyConsts = {
    GENDER_BOTH: 0,
    GENDER_MALE: 1,
    GENDER_FEMALE: 2,
    LOC_ALL: 0,
    LOC_REGION: 1,
    LOC_CITY: 2
};

function TargetedPrivacyModel() {
    this.value = PrivacyBaseValue.EVERYONE;
    this.countries = [];
    this.countries_names = [];
    this.location_type = TargetedPrivacyConsts.LOC_ALL;
    this.location_ids = [];
    this.location_ids_names = [];
    this.locales = [];
    this.locales_names = [];
    this.gender = TargetedPrivacyConsts.GENDER_BOTH;
    this.age_min = 0;
    this.age_max = 0;
    return this;
}
TargetedPrivacyModel.prototype = {
    init: function (m, c, d, j, h, i, b, a, e, f, g, k, l) {
        this.value = m;
        this.countries = c.clone();
        this.countries_names = d.clone();
        this.location_type = j;
        this.location_ids = h.clone();
        this.location_ids_names = i.clone();
        this.age_min = b;
        this.age_max = a;
        this.gender = e;
        this.locales = f.clone();
        this.locales_names = g.clone();
        this.see_regions = l;
        this.see_cities = k;
    },
    getData: function () {
        var d = {};
        if (this.value == PrivacyBaseValue.EVERYONE) return d;
        var b = ['countries', 'location_type', 'location_ids', 'age_min', 'age_max', 'gender', 'locales'];
        for (var c = 0; c < b.length; ++c) {
            var a = b[c];
            d[a] = this[a];
        }
        return d;
    }
};

function UITargetedPrivacyWidget(a, c) {
    var b = {
        useLegacyFormData: true
    };
    this.parent.construct(this, a, b);
    this._profileId = c;
    this._model = new TargetedPrivacyModel();
    this._formDataKey = 'targeted_privacy_data';
    UITargetedPrivacyWidget.instances[this._controllerId] = this;
}
copy_properties(UITargetedPrivacyWidget, {
    DIALOG_URI: '/ajax/privacy/targeted_privacy_widget_dialog.php',
    instances: {},
    getInstance: function (a) {
        return this.instances[a];
    }
});
UITargetedPrivacyWidget.extend('BasePrivacyWidget');
UITargetedPrivacyWidget.mixin('Arbiter', {
    init: function (a) {
        this._initSelector(a);
        this._saveFormData();
    },
    reset: function () {
        this._model = new TargetedPrivacyModel();
        this._updateSelector();
        this._saveFormData();
        return this;
    },
    _onMenuSelect: function (a) {
        if (a == PrivacyBaseValue.EVERYONE) this._model = new TargetedPrivacyModel();
        this._saveFormData();
        this._updateSelector();
        if (this._isCustomSetting(a)) this._showDialog();
    },
    _showDialog: function () {
        var a = {
            controller_id: this._controllerId,
            profile_id: this._profileId
        };
        this._dialog = new Dialog().setAsync(new AsyncRequest().setURI(UITargetedPrivacyWidget.DIALOG_URI).setData(a)).setModal(true).show();
    }
});

function FeedFormBase() {
    this._storyType = 63;
    this._feedData = null;
    this._uri = '/fbml/ajax/prompt_feed.php';
    this._buttonCallback = null;
    this._isNile = false;
    this._supportsUserMessage = false;
    this._userMessagePrompt = '';
    this._userMessage = {
        value: ''
    };
    this._privacyWidget = null;
    this._currentSize = 0;
    this._connectLocation = 0;
    this._postId = null;
    this._hasTargets = false;
    this._profileType = 0;
    this._targeted = false;
}
FeedFormBase.SIZES = {
    small: 1,
    medium: 2
};
FeedFormBase.AUTO_PUBLISH_OPTIONS = {
    never: 2,
    small: 4,
    medium: 5
};
FeedFormBase.PROFILE_TYPE = {
    user: 101,
    page: 102,
    group: 103
};
FeedFormBase.shouldShowLoadingToSelf = false;
FeedFormBase.shouldShowLoadingToOthers = false;
FeedFormBase.prototype.setStoryType = function (a) {
    this._storyType = a;
    return this;
};
FeedFormBase.prototype.setProfileType = function (a) {
    this._profileType = a;
    return this;
};
FeedFormBase.prototype.setForm = function (a) {
    if (this._elements) return null;
    this._form = $(a);
    return this;
};
FeedFormBase.prototype.setElements = function (a) {
    if (this._form) return null;
    this._elements = a;
    return this;
};
FeedFormBase.prototype.setFeedData = function (a) {
    this._feedData = a;
    return this;
};
FeedFormBase.prototype.setAppId = function (a) {
    this._appid = a;
    return this;
};
FeedFormBase.prototype.setConnectLocation = function (a) {
    this._connectLocation = a;
    return this;
};
FeedFormBase.prototype.setUserMessagePrompt = function (a) {
    this._userMessagePrompt = a;
    return this;
};
FeedFormBase.prototype.setUserMessage = function (a) {
    if (a) if (typeof a == 'string') {
        this._userMessage = {
            value: a
        };
    } else this._userMessage = a;
    return this;
};
FeedFormBase.prototype.setURI = function (a) {
    this._uri = a;
    return this;
};
FeedFormBase.prototype.setContinuation = function (a) {
    this._continuation = a;
    return this;
};
FeedFormBase.prototype.setButtonCallback = function (a) {
    this._buttonCallback = a;
    return this;
};
FeedFormBase.prototype.setPrivacyWidget = function (a, b) {
    this._targeted = b;
    if (b) {
        this._privacyWidget = UITargetedPrivacyWidget.getInstance(a);
    } else this._privacyWidget = UIPrivacyWidget.getInstance(a);
    return this;
};
FeedFormBase.prototype._selectSize = function (a) {
    var b = a.size;
    if (b != this._currentSize) {
        CSS.removeClass(this._selectedSize, 'Tabset_selected');
        animation($('preview_' + this._currentSize)).to('opacity', 0).hide().duration(150).go();
        animation($('preview_' + b)).duration(150).checkpoint().show().from('opacity', 0).to('opacity', 1).duration(150).go();
        this._selectedSize = a;
        this._currentSize = b;
        CSS.addClass(this._selectedSize, 'Tabset_selected');
    }
    return false;
};
FeedFormBase.prototype.attachHandlers = function (a) {
    if (!this._isNile) this._attachSizeHandlers(a);
    var b = DOM.scry($('preview_container'), 'a');
    b.forEach(function (c) {
        Event.listen(c, 'click', function (d) {
            d.kill();
        });
    });
    if (this._supportsUserMessage) $('feedform_user_message').focus();
    return this;
};
FeedFormBase.prototype._attachSizeHandlers = function (b) {
    var f = this._selectorOptions;
    var d = this._feedformFilter;
    for (var c = 0; c < f.length; c++) {
        var e = $(d + '_' + f[c].size);
        var a = $(d + '_' + f[c].size + '_anchor');
        var g = f[c].size;
        f[c].node = e;
        if (CSS.hasClass(e, 'Tabset_selected')) {
            this._selectedSize = f[c];
            this._currentSize = g;
        }
        Event.listen(a, 'click', this._selectSize.bind(this, f[c]));
    }
    return true;
};
FeedFormBase.prototype._finish = function () {
    this._enableSubmitButtons();
    if (this._dialog) this._dialog.hide();
    if (this._continuation) this._continuation(this._postId, null, {
        user_message: this._userMessage.value
    });
};
FeedFormBase.prototype.shouldShowLoading = function () {
    return false;
};
FeedFormBase.prototype.showDialog = function (a) {
    this._dialog = new Dialog().setContentWidth(580).setClassName('interaction_form').setAsync(a).setHandler(this.handleButton.bind(this)).onloadRegister(this.attachHandlers.bind(this));
    if (this.shouldShowLoading()) this._dialog.show();
    return this;
};
FeedFormBase.prototype._confirm = function (b) {
    if (this._isNile && this._supportsUserMessage) {
        user_message = $('feedform_user_message').value;
        this._userMessage.value = b.user_message = user_message;
    }
    var a = new AsyncRequest().setURI(this._uri).setData(b).setNectarActionData().setHandler(this.showConfirmed.bind(this));
    new Dialog().setAsync(a);
};
FeedFormBase.prototype.handleButton = function (a) {
    if (this._buttonCallback) this._buttonCallback(a);
    if (a.name == "publish") {
        var b = this._dialog ? this._dialog.getButtonElement(a.name) : a;
        if (b) b.disabled = true;
        this.confirmFeed();
        return false;
    } else if (a.name == "cancel") this.cancelFeed();
};
FeedFormBase.prototype.cancelFeed = function () {
    this._finish();
};
FeedFormBase.prototype.attachProperties = function (a) {
    copy_properties(this, a);
    if (this._continuationJS) {
        this._continuation = new Function(this._continuationJS);
        delete this._continuationJS;
    }
    return this;
};
FeedFormBase.prototype._showBase = function (b) {
    var a = new AsyncRequest().setURI(this._uri).setHandler(function (c) {
        var d = c.getPayload().userData;
        this.attachProperties(d);
        if (d.no_dialog_shown) this._finish();
        return true;
    }.bind(this)).setNectarActionData().setErrorHandler(this._showApplicationError.bind(this)).setData(b);
    this.showDialog(a);
    return this;
};
FeedFormBase.prototype.showConfirmed = function (b) {
    var a;
    if (this._profileType == FeedFormBase.PROFILE_TYPE.page) {
        a = _tx("The post is now visible on the Page's Wall and home pages of people who like this.");
    } else if (this._profileType == FeedFormBase.PROFILE_TYPE.group) {
        a = _tx("The post is now visible on the group's Wall.");
    } else if (this._hasTargets) {
        a = _tx("The post is now visible on your friend's Wall.");
    } else a = _tx("The post is now visible on your Wall and your friends' home pages.");
    this.showConfirmedWithMessage(a, b);
};
FeedFormBase.prototype.showConfirmedWithMessage = function (c, e) {
    this.attachProperties(e.payload.userData);
    var b = '<div class="interim_status">' + c + '</div>';
    var f = _tx("Post Published");
    if (this._dialog) {
        this._dialog.setBody(b);
        this._dialog.setTitle(f);
        this._dialog.setButtons(Dialog.OK);
        this._dialog.setButtonsMessage('');
    } else {
        $('dialog_body').innerHTML = b;
        var d = ge('publish');
        if (d != null) DOM.remove(d);
        if (this._privacyWidget) DOM.remove(this._privacyWidget.getRoot());
        var a = ge('cancel');
        if (a != null) a.value = _tx("Done");
    }
    setTimeout(this._finish.bind(this), 2500);
    return false;
};
FeedFormBase.prototype._enableSubmitButtons = function () {
    var b = ['send', 'publish'];
    for (var c = 0; c < b.length; c++) {
        var a = ge(b[c]);
        if (a) {
            a.disabled = false;
            break;
        }
    }
};
FeedFormBase.prototype._showApplicationError = function (b) {
    this._enableSubmitButtons();
    var d = b.getPayload().userData;
    var c = function (f) {
        var g = _tx("There was an application error. Please try again later.");
        var e = null;
        if (f) {
            if (d && d.errorTitle) {
                g = d.errorTitle;
            } else if (b.getErrorSummary) g = b.getErrorSummary();
            if (d && d.errorMessage) {
                e = d.errorMessage;
            } else if (b.getErrorDescription) e = b.getErrorDescription();
        }(new ErrorDialog()).showError(g, e);
    };
    var a = b.getError();
    if (a == 1349008) {
        if (d.showDebug) {
            c(true);
        } else if (this._continuation) {
            this._continuation();
        } else c(false);
    } else c(true);
    return false;
};

function FeedForm() {
    this.parent.construct(this);
}
FeedForm.extend('FeedFormBase');
FeedForm.attachSubmitHandler = function (b, a) {
    b.onsubmit = '';
    Event.listen(b, 'submit', function (d, c, event) {
        FeedForm.shouldShowLoadingToSelf = true;
        new FeedForm().setForm(d).setAppId(c).show();
        return false;
    }.curry(b, a));
};
FeedForm.prototype._setPublishButtonText = function (a) {
    this.publish_button.value = a;
};
FeedForm.prototype._setCancelButtonText = function (a) {
    this.cancel_button.value = a;
};
FeedForm.prototype.shouldShowLoading = function () {
    return FeedForm.shouldShowLoadingToSelf;
};
FeedForm.prototype.show = function () {
    var b = {};
    if (this._form) {
        b = {
            callback: this._form.getAttribute('action'),
            elements: Form.serialize(this._form)
        };
    } else if (this._elements) b.elements = this._elements;
    var a = {
        app_id: this._appid,
        feedform_type: this._storyType,
        feed_info: this._feedData,
        user_message_prompt: this._userMessagePrompt,
        user_message: this._userMessage.value,
        preview: true,
        feed_target_type: 'self_feed',
        extern: this._connectLocation
    };
    copy_properties(a, b);
    return this._showBase(a);
};
FeedForm.prototype.cancelFeed = function () {
    this._finish();
};
FeedForm.prototype.confirmFeed = function () {
    var a = {
        feed_info: this._feedData,
        feedform_type: this._storyType,
        preview: false,
        feed_target_type: 'self_feed',
        app_id: this._appid,
        size: FeedFormBase.SIZES[this._currentSize],
        extern: this._connectLocation
    };
    if (this._privacyWidget) if (this._targeted) {
        a.targeted_privacy_data = this._privacyWidget.getData();
    } else a.privacy_data = this._privacyWidget.getData();
    this._confirm(a);
};

function MultiFeedForm() {
    this.parent.construct(this);
    this._hasTargets = true;
}
MultiFeedForm.extend('FeedFormBase');
MultiFeedForm.prototype.setPrefillId = function (a) {
    if (a > 0) {
        this._prefillId = a;
    } else this._prefillId = null;
    return this;
};
MultiFeedForm.prototype.removeRecipient = function (a) {
    this._toIds = this._toIds.filter(function (b) {
        return b != a;
    });
    if (this._toIds.length == 0) {
        this._finish();
    } else DOM.remove('sp' + a);
    return false;
};
MultiFeedForm.prototype.confirmFeed = function () {
    var a = {
        feed_info: this._feedData,
        feedform_type: this._storyType,
        to_ids: this._toIds,
        preview: false,
        feed_target_type: 'multi_feed',
        app_id: this._appid,
        size: FeedFormBase.SIZES[this._currentSize],
        extern: this._connectLocation
    };
    this._confirm(a);
};
MultiFeedForm.prototype.shouldShowLoading = function () {
    return FeedFormBase.shouldShowLoadingToOthers;
};
MultiFeedForm.prototype.show = function () {
    var c = [];
    if (this._prefillId) {
        c.push(this._prefillId);
    } else {
        var d = this._form.getElementsByTagName('input');
        for (var b = 0; b < d.length; b++) if (d[b].getAttribute('fb_protected') == 'true' && (CSS.hasClass(d[b], 'fb_token_hidden_input') || d[b].name == 'ids[]' || d[b].name == 'friend_selector_id') && (d[b].type != 'checkbox' || d[b].checked)) c.push(d[b].value);
    }
    this._toIds = c;
    var a = {
        app_id: this._appid,
        to_ids: this._toIds,
        callback: this._form.action,
        preview: true,
        form_id: this._form.id,
        prefill: (this.prefillId > 0),
        elements: Form.serialize(this._form),
        user_message_prompt: this._userMessagePrompt,
        user_message: this._userMessage.value,
        feed_target_type: 'multi_feed',
        extern: this._connectLocation
    };
    return this._showBase(a);
};
MultiFeedForm.prototype.attachHandlers = function (a) {
    for (var b = 0; b < this._toIds.length; b++) {
        var c = ge('spl_' + this._toIds[b]);
        if (c) c.onclick = this.removeRecipient.bind(this, this._toIds[b]);
    }
    this.parent.attachHandlers(a);
    return this;
};

function TargetFeedForm() {
    this.parent.construct(this);
}
TargetFeedForm.extend('MultiFeedForm');
TargetFeedForm.prototype.confirmFeed = function () {
    var a = {
        feed_info: this._feedData,
        feedform_type: this._storyType,
        to_ids: this._toIds,
        preview: false,
        feed_target_type: 'target_feed',
        app_id: this._appid,
        size: FeedFormBase.SIZES[this._currentSize],
        extern: this._connectLocation
    };
    this._confirm(a);
};
TargetFeedForm.prototype.setTarget = function (a) {
    this._toIds = [a];
    return this;
};
TargetFeedForm.prototype.show = function () {
    var a = {
        app_id: this._appid,
        to_ids: this._toIds,
        feed_info: this._feedData,
        preview: true,
        prefill: (this.prefillId > 0),
        user_message_prompt: this._userMessagePrompt,
        user_message: this._userMessage.value,
        feed_target_type: 'target_feed',
        extern: this._connectLocation
    };
    return this._showBase(a);
};
var FBML = (function () {
    var z = {};
    var zq = {};
    Arbiter.subscribe('PLATFORM_UI_SERVER_DIALOGS', function (event, zr) {
        FBML.uiServerDialogs = zr;
    });

    function y(zs, zu, zt) {
        var zr = document.createElement('INPUT');
        zr.name = zs.getAttribute('idname');
        zr.type = 'hidden';
        zr.setAttribute('fb_protected', 'true');
        zr.typeahead = this;
        if (zs.form) zs.form.appendChild(zr);
        this._idInput = zr;
        return this.parent.construct(this, zs, zu, zt);
    }
    y.extend('typeaheadpro');
    y.prototype.updateID = function (zr) {
        if (zr.i) {
            this._idInput.value = zr.i;
        } else if (zr.is) {
            this._idInput.value = zr.is;
        } else this._idInput.value = '';
    };
    y.prototype.destroy = function () {
        this._idInput.parentNode.removeChild(this._idInput);
        this._idInput.typeahead = null;
        this._idInput = null;
        this.parent.destroy();
    };
    y.prototype._onselect = function (zr) {
        this.updateID(zr);
        this.parent._onselect(zr);
    };
    var a = new Object();

    function x(zr) {
        if (window.console) window.console.log('Facebook FBML Mock AJAX ERROR: ' + zr);
        return false;
    }
    function g(zr, zs, zu, zt) {
        if (!zr['url']) return x("no input with id url in form");
        if (!zr['fb_sig_api_key']) return x("no input with id fb_api_key in form");
        if (zu) zu();
        f(zr, zs, zt);
    }
    function f(zr, zs, zt) {
        new AsyncRequest().setURI('/fbml/ajax/attach.php').setData(zr).setMethod('POST').setHandler(function (zu) {
            if (zt) zt();
            if (!zs.removed) DOM.setContent(zs, HTML(zu.getPayload().html));
        }.bind(this)).send();
    }
    function h(zs) {
        if (zs == 'wall') {
            var zr = wallAttachments;
        } else if (zs == 'message') var zr = inboxAttachments;
        if (zr) {
            var zw = ge(zr.edit_id);
            var zu = zr.get_all_form_elements(zw);
            var zv = Object();
            for (var zt = 0; zt < zu.length; zt++) if (!(zu[zt].type == "radio" || zu[zt].type == "checkbox") || zu[zt].checked) zv[zu[zt].name] = zu[zt].value;
            zv.context = zr.context;
            zv.action = 'edit';
            f(zv, zw);
        }
    }
    function j(zr, zu, zv, zw, zs, zt) {
        this.requireLogin(zr, function () {
            return c(zv, zw, zs, zt);
        });
        return false;
    }
    function c(zy, zz, zr, zt) {
        var zx = ge(zy);
        if (!zx) return x("target " + zy + " not found");
        var zs = zx.getAttribute("fbcontext");
        var zw = FBML.Contexts[zs];
        if (!zr) return x("You must either specify a clickrewriteform (an id) or use the clickrewrite attribute inside a form");
        var zu = typeof this.PROFILE_OWNER_ID == 'undefined' ? 0 : this.PROFILE_OWNER_ID;
        var zv = Form.serialize(zr);
        zv.fb_mockajax_context = zw;
        zv.fb_mockajax_context_hash = zs;
        zv.fb_mockajax_url = zz;
        zv.fb_target_id = zu;
        zv.fb_mockajax_rewrite_id = zy;
        new AsyncRequest().setURI('/fbml/mock_ajax_proxy.php').setMethod("POST").setFBMLForm().setData(zv).setHandler(function (zzb) {
            var zza = zzb.getPayload();
            if (zza.ok) {
                DOM.setContent(zx, HTML(zza.html));
            } else return x(zza.error_message);
            FBML.mockAjaxResponse = zza;
            return zza.ok;
        }.bind(this)).setErrorHandler(function (zza) {
            return x("Failed to successfully retrieve data from Facebook when making mock AJAX call to rewrite id " + zy);
        }.bind(this)).send();
        if (zt) DOM.setContent(zx, HTML(zt));
        return false;
    }
    function p(zr) {
        return o(zr, "");
    }
    function q(zw) {
        var zu = null;
        if (zu = ge(zw)) {
            var zt = zu.parentNode.innerHTML;
            zu.id = 'dialog_invoked_' + zu.id;
            var zr = parseInt(zu.getAttribute('fb_dialog_width'));
            var zv = zu.cloneNode(true);
            DOM.empty(zu);
            var zs = new Dialog();
            if (zr) zs.setContentWidth(zr);
            zs.setImmediateRendering(true).setStackable(true).setBody(zt).setFullBleed(true).show();
            z[zu.id] = {
                elem: zv,
                dialog: zs
            };
        }
        return false;
    }
    function s(zw) {
        var zs = null;
        var zr = 'dialog_invoked_' + zw;
        for (dialog_id in z) if (zs = ge(dialog_id)) {
            var zu = zs.id.replace('dialog_invoked_', '');
            var zt = null;
            if (zt = ge(zu)) zt.id = 'dialog_closed_' + zu;
            var zv = zs.parentNode;
            DOM.empty(zv);
            zv.appendChild(z[dialog_id].elem);
            z[dialog_id].elem.id = zu;
        }
        if (z[zr].dialog) z[zr].dialog.hide();
    }
    function m(zr) {
        return o(zr, "none");
    }
    function r(zs) {
        var zr = ge(zs);
        if (!zr) {
            return x("Could not find target " + zs);
        } else {
            zr.style.display = (zr.style.display == "none") ? '' : 'none';
            return false;
        }
    }
    function o(zt, zr) {
        var zs = ge(zt);
        if (!zs) {
            return x("Could not find target " + zt);
        } else {
            zs.style.display = zr;
            return false;
        }
    }
    function l(zr) {
        return n(zr, '');
    }
    function k(zr) {
        return n(zr, 'disabled');
    }
    function n(zt, zr) {
        var zs = ge(zt);
        if (!zs) {
            return x("Could not find target " + zt);
        } else {
            zs.disabled = zr;
            return false;
        }
    }
    function e(zs, zr) {
        var zt;
        for (zt = zs.childNodes.length - 1; zt >= 0; zt--) if (zs.childNodes[zt].name && zs.childNodes[zt].name.indexOf('fb_sig') == 0) zs.removeChild(zs.childNodes[zt]);
        for (keyVar in zr) DOM.appendContent(zs, $N('input', {
            name: keyVar,
            value: zr[keyVar],
            type: 'hidden'
        }));
    }
    function zb(zr, zu, zs) {
        var zv = function (zw) {
            Arbiter.subscribe('PLATFORM_HAS_SESSION_DATA', function (event, zx) {
                zs(zx.session.uid);
            });
        };
        var zt = bagofholding;
        d(zr, {
            perms: zu
        }, zv, zt);
    }
    function zk(zr, zx, zs, zu, zy, zv) {
        var zz = zs;
        var zt = zs;
        if (zv != null) zz = function (zza) {
            DOM.appendContent(zv, $N('input', {
                name: 'fb_perms_approved',
                value: '1',
                type: 'hidden'
            }));
            zs.apply(this, arguments);
        }.bind(this);
        var zw = {
            perms: zx
        };
        if (zu) zw.enable_profile_selector = 1;
        if (zy != null) {
            zw.enable_profile_selector = 1;
            zw.profile_selector_ids = zy;
        }
        d(zr, zw, zz, zt);
    }
    function d(zr, zw, zv, zu) {
        var zt = function (zy) {
            var zz = zy && (zy.installed || zy.perms || zy.session);
            if (zz && zw && zw.perms) zz = v(zw.perms, zy.perms);
            if (zz) {
                this._hasGrantedPerms = true;
                zv(zy.perms);
            } else if (zu) zu(null);
        }.bind(this);
        var zx = function () {
            this.loginDialog = zm(zr, 'permissions.request', zw, zt, 600);
        }.bind(this);
        if (zw.perms) {
            zx();
        } else if (!this._hasGrantedPerms) {
            var zs = function (event, zy) {
                Arbiter.unsubscribe(this._arbiterSessionSubscription);
                if (zy.session.session_key) {
                    zv(null);
                } else zx();
            };
            this._arbiterSessionSubscription = Arbiter.subscribe('PLATFORM_HAS_SESSION_DATA', function (event, zy) {
                zs.bind(this, event, zy).defer();
            });
        }
    }
    function v(zu, zr) {
        var zv = true;
        var zu = zu.split(',');
        var zr = zr.split(',');
        for (var zs = 0; zs < zu.length; zs++) {
            zv = false;
            for (var zt = 0; zt < zr.length; zt++) if (zu[zs].trim() == zr[zt].trim()) {
                zv = true;
                break;
            }
            if (!zv) break;
        }
        return zv;
    }
    function za(zr) {
        return this.uiServerDialogs[zr];
    }
    function zi(zr, zs, zt) {
        zm(zr, 'bookmark.add', {}, zs);
    }
    function zl(zr, zs) {
        zm(zr, 'profile.addTab', {}, zs);
    }
    function zh(zr, zt, zs) {
        zm(zr, 'friends.add', {
            id: zt
        }, zs);
    }
    function u(zr, zs) {
        b(function () {
            FB.Connect.createApplication(zr, zs);
        });
    }
    function zn(zt, zy, zu, zr, zx, zz, zw, zv, zs) {
        zm(zt, 'stream.publish', {
            actor_id: zs,
            target_id: zx,
            attachment: JSON.encode(zu),
            action_links: JSON.encode(zr),
            message: zy,
            user_message_prompt: zz
        }, function (zza) {
            if (zza && zza.post_id) {
                zw(zza.post_id, null, {
                    user_message: zza.message
                });
            } else zw(null, null, null);
        });
    }
    function zm(zr, zx, zy, zu, zz) {
        var zt = {
            method: zx,
            app_id: zr,
            display: 'async'
        };
        for (var zw in zt) if (zt.hasOwnProperty(zw)) zy[zw] = zt[zw];
        var zs = new AsyncRequest().setURI('/fbml/ajax/uiserver.php').setData(zy).setMethod('GET').setReadOnly(true);
        var zv = new Dialog().setAsync(zs).setModal(true).setStackable(true).setCloseHandler(zu);
        if (zz) zv.setContentWidth(zz);
        zv.show();
        return zv;
    }
    function b(zr) {
        Arbiter.subscribe('PLATFORM_HAS_SESSION_DATA', function (event, zs) {
            FB.init({
                apiKey: zs.api_key,
                disableCookies: true,
                xdChannelUrl: "/xd_receiver_v0.4.php"
            });
            FB.ensureInit(function () {
                FB.Facebook.apiClient.set_session(zs.session);
                zr();
            });
        });
    }
    function zj(zr, zx, zy, zs, zw, zt, zza, zz) {
        var zu = {
            template_id: zx,
            template_data: zy,
            body_general: zs
        };
        var zv;
        if (zw && (!hasArrayNature(zw) || zw.length > 0)) {
            if (hasArrayNature(zw)) zw = zw[0];
            zv = new TargetFeedForm().setTarget(zw);
        } else zv = new FeedForm();
        zv.setContinuation(zt).setFeedData(zu).setAppId(zr).setUserMessagePrompt(zza).setUserMessage(zz).show();
    }
    function t() {
        if (this.loginDialog) {
            var zr = this.loginDialog;
            this.loginDialog = null;
            zr.close();
        }
    }
    function zg(zr, zt, zs, zu) {
        d(zr, {}, zt, zs, zu);
    }
    function i(zs) {
        var zr = Dialog.getCurrent();
        zr && zr.hide();
    }
    function zd(zs) {
        var zu = $('sp' + zs);
        var zt = zu.parentNode;
        zt.removeChild(zu);
        for (var zr = 0; zr < zt.childNodes.length; zr++) if (zt.childNodes[zr].nodeName == 'SPAN') return false;
        i(zt);
        return false;
    }
    function zf(zs, zv, zu) {
        var zt = zv.getElementsByTagName('input');
        for (var zr = 0; zr < zt.length; zr++) if (((zt[zr].name == 'emails[]') || (zt[zr].name == 'ids[]')) && (zt[zr].value == zs)) {
            delNode = zt[zr].parentNode.parentNode.parentNode.parentNode.parentNode.token;
            if (delNode) delNode.remove(false);
        }
        zd(zs);
        return false;
    }
    function ze(zv, zu, zt) {
        if (zt) {
            if (fs.selected_ids[zv]) {
                fs.unselect(zv);
                fs.force_reset();
            } else {
                zf(zv, zu, zt);
                return false;
            }
        } else {
            var zs = zu.getElementsByTagName('input');
            for (var zr = 0; zr < zs.length; zr++) if (zs[zr].getAttribute('fb_protected') == 'true' && zs[zr].value == zv) if (zs[zr].name == 'ids[]') {
                if (zs[zr].type == 'checkbox') {
                    if (zs[zr].checked) zs[zr].click();
                } else zs[zr].parentNode.parentNode.parentNode.parentNode.parentNode.token.remove(true);
            } else if (zs[zr].name == 'friend_selector_id') {
                zs[zr].typeahead.select_suggestion(false);
                zs[zr].typeahead.set_value('');
                zs[zr].value = '';
            }
        }
        zd(zv);
        return false;
    }
    var zo = function (zr) {
        var zu = zr.getElementsByTagName('a');
        for (var zt = 0; zt < zu.length; zt++) if (!zu[zt].getAttribute('flash')) Event.listen(zu[zt], 'click', Event.kill);
        var zs = zr.getElementsByTagName('form');
        for (var zt = 0; zt < zs.length; zt++) zs[zt].onsubmit = function () {
            return false;
        };
    };
    var w = function (zr, zs) {
        for (styleName in zs) zr.style[styleName] = zs[styleName];
    };
    var zc = function (zr, zs) {
        var zt = fbjs_sandbox.getSandbox(zr);
        if (zt) zt.setBridgeHash(zs);
    };
    var zp = function (zs, event) {
        if (zs.onsubmit) try {
            if (!zs.onsubmit(event)) return;
        } catch (zr) {
            if (zr.message == "Object doesn't support this action") {
                if (!zs.onsubmit()) return;
            } else throw zr;
        }
        zs.submit();
    };
    return {
        friendSelector: y,
        Contexts: a,
        attachCurlFromObject: g,
        attachFromPreview: h,
        clickRewriteAjax: j,
        clickToShow: p,
        clickToShowDialog: q,
        clickToHide: m,
        clickToEnable: l,
        clickToDisable: k,
        clickToToggle: r,
        closeDialogInvoked: s,
        createApplication: u,
        removeTokenizerRecipient: zf,
        removeReqRecipient: ze,
        cancelDialog: i,
        addHiddenInputs: e,
        requireLogin: zg,
        closeLoginDialog: t,
        showFeedDialog: zj,
        streamPublish: zn,
        promptPermissionPro: zb,
        showPermissionDialog: zk,
        isUIServerEnabled: za,
        showBookmarkDialog: zi,
        showProfileTabDialog: zl,
        showAddFriendDialog: zh,
        stripLinks: zo,
        enforceStyle: w,
        registerFBJSBridge: zc,
        submitForm: zp
    };
})();

function PlatformCanvasController(b, e, g, f, c, d, a, i, h) {
    this.sessionKey = e;
    this.appName = c;
    this.appId = b;
    this.callback = d;
    this.api_key = a;
    this.isFirstPage = false;
    this.isIFrame = false;
    this._movingPage = false;
    this.sessionRefresh = (g * 900);
    if (this.appId && this.sessionKey && this.sessionRefresh) setTimeout(this.refreshAppSession.bind(this), this.sessionRefresh);
    PlatformCanvasController.singleton = this;
    Arbiter.inform('PLATFORM_HAS_SESSION_DATA', {
        api_key: a,
        session: {
            session_key: e,
            uid: i,
            expires: g,
            secret: f
        }
    }, Arbiter.BEHAVIOR_PERSISTENT);
    Arbiter.inform('PLATFORM_UI_SERVER_DIALOGS', h, Arbiter.BEHAVIOR_PERSISTENT);
}
PlatformCanvasController.AUTO_REFRESH = 30000;
PlatformCanvasController.prototype.setUpIFrame = function (a) {
    PageTransitions.registerHandler(this.handleChange.bind(this));
    this.isIFrame = true;
    this.isStatic = a;
};
PlatformCanvasController.prototype.autoRefreshAd = function () {
    if (this.isIFrame) {
        this.isFirstPage = true;
        $('app' + this.appId + '_iframe_canvas').onload = this._clickRefresh.bind(this);
    }
    this._ignoreNext = true;
    this._loopRefresh();
};
PlatformCanvasController.prototype.requireLogin = function () {
    var a = FB.IFrameUtil.CanvasUtilServer.loginResponse;
    FBML.requireLogin(this.appId, a.bind(null, true), a.bind(null, false), null, true, true);
};
PlatformCanvasController.prototype.closeLogin = function () {
    FBML.closeLoginDialog();
};
PlatformCanvasController.prototype.showFeedDialog = function (c, d, a, b, f, e) {
    FBML.showFeedDialog(this.appId, c, d, a, b, FB.IFrameUtil.CanvasUtilServer.loginResponse.bind(null), f, e);
};
PlatformCanvasController.prototype._loopRefresh = function () {
    if (this._ignoreNext) {
        this._ignoreNext = false;
    } else this.refreshAd();
    this._loopRefresh.bind(this).defer(PlatformCanvasController.AUTO_REFRESH);
};
PlatformCanvasController.prototype._clickRefresh = function () {
    this.refreshAd();
    this._ignoreNext = true;
};
PlatformCanvasController.prototype.refreshAppSession = function () {
    new AsyncRequest().setURI('/ajax/session.php').setData({
        app_id: this.appId,
        session_key: this.sessionKey
    }).setReadOnly(true).setHandler(function (b) {
        var a = b.getPayload();
        if (a.session_end > 0) setTimeout(this.refreshAppSession.bind(this), this.sessionRefresh);
    }.bind(this)).send();
};
PlatformCanvasController.prototype.refreshUrl = function (c) {
    var a = c.href;
    if (a.startsWith(this.callback)) {
        var b = new URI(a.substring(this.callback.length));
        this.changeUrlSuffix(b, true);
    }
    return false;
};
PlatformCanvasController.refreshUrl = function (a) {
    if (PlatformCanvasController.singleton) PlatformCanvasController.singleton.refreshUrl(a);
};
PlatformCanvasController.prototype.changeUrlSuffix = function (d, b) {
    this.currentUri = URI.getRequestURI().getUnqualifiedURI();
    var c = new URI(this.getAppPrefix() + d);
    this.stripFbParams(c);
    var a = b && PlatformCanvasController.storesIFrameHistory(this.isStatic);
    if (this.currentUri.toString() != c.toString()) {
        this.currentUri = c;
        this.refreshAd();
        PageTransitions.go(c.toString(), a);
    }
};
PlatformCanvasController.prototype.getAppPrefix = function () {
    return "/" + this.appName + "/";
};
PlatformCanvasController.prototype.convertFromApps = function (c) {
    var a = this.getAppPrefix();
    var b = c.getUnqualifiedURI().toString().substring(a.length);
    return new URI(this.callback + b);
};
PlatformCanvasController.prototype.convertToApps = function (b) {
    var a = b.toString().substring(this.callback.length);
    return new URI(this.getAppPrefix() + a);
};
PlatformCanvasController.prototype.stripFbParams = function (d) {
    var c = d.getQueryData();
    var b = {};
    for (var a in c) if ((!a.startsWith("fb_") || a.startsWith("fb_force_mode")) && !a.startsWith("_fb") && !a.startsWith("quickling_apps")) b[a] = c[a];
    d.setQueryData(b);
};
PlatformCanvasController.prototype.refreshAd = function () {
    if (this.isFirstPage) {
        this.isFirstPage = false;
    } else ads_refresh(this.appName, '/canvas.php');
};
PlatformCanvasController.prototype.handleChange = function (b) {
    if (!b.getPath().startsWith("/" + this.appName) || this._movingPage) return false;
    var a = b.getUnqualifiedURI();
    this.stripFbParams(a);
    if (this.currentUri.toString() != a.toString()) {
        FB.IFrameUtil.CanvasUtilServer.loadNewUrl(this.convertFromApps(b).toString());
        this.currentUri = a;
    }
    PageTransitions.transitionComplete();
    return true;
};
PlatformCanvasController.prototype.goURI = function (a) {
    this._movingPage = true;
    PageTransitions.go(new URI(a));
};
PlatformCanvasController.storesIFrameHistory = function (a) {
    if (ua.ie()) {
        return true;
    } else if (ua.firefox()) {
        if (a) {
            return true;
        } else return false;
    } else if (ua.safari()) {
        return false;
    } else return false;
};
var canvasResizeListener;
var smartIframes = [];

function smartSizingFrameAdded() {
    canvasResizeListener = Event.listen(window, 'resize', _resizeSmartFrames);
    smartIframes = [];
    var a = document.getElementsByTagName('iframe');
    for (var c = 0; c < a.length; c++) {
        var b = a[c];
        if (CSS.hasClass(b, 'smart_sizing_iframe')) {
            CSS.removeClass(b, 'canvas_iframe_util');
            smartIframes.push(b);
            b.style.width = 758 + "px";
        }
    }
    _resizeSmartFrames();
}
if (window.innerHeight) {
    var windowHeight = function () {
        return window.innerHeight;
    };
} else if (document.documentElement && document.documentElement.clientHeight) {
    var windowHeight = function () {
        return document.documentElement.clientHeight;
    };
} else var windowHeight = function () {
    return document.body.clientHeight;
};

function _resizeSmartFrames() {
    var b = windowHeight();
    for (var c = 0; c < smartIframes.length; c++) {
        var a = smartIframes[c];
        var d = b - elementY(a) - 61;
        a.style.height = d / (smartIframes.length - c) + 'px';
    }
}
Arbiter.subscribe('Connect.Unsafe.setSize', function (f, e) {
    if (e.frame && e.frame != 'iframe_canvas') return;
    var a = document.getElementsByTagName('iframe');
    for (var d = 0; d < a.length; d++) {
        var b = a[d];
        if (b.name != 'iframe_canvas') continue;
        var c = parseInt(e.height, 10);
        b.style.height = c + 'px';
        b.style.overflowY = 'hidden';
    }
    if (canvasResizeListener && canvasResizeListener.remove) {
        canvasResizeListener.remove();
        canvasResizeListener = null;
    }
});

function Flash() {}
copy_properties(Flash, {
    INIT: 'flash/init',
    READY: 'flash/ready',
    FAILED: 'flash/failed'
});

function pages_show_block_app(b, a, d) {
    var c = new AsyncRequest().setMethod('POST').setData({
        app_id: b,
        action: a,
        source: d
    }).setURI('/ajax/apps/block.php');
    new Dialog().setAsync(c).show();
}
var details_shown = false;

function toggle_stored_cc(a) {
    if (a.checked == true) {
        show('cvv2_div');
        hide_new_cc();
    } else {
        hide('cvv2_div');
        show_new_cc();
    }
}
function hide_cc_payment() {
    hide('card_payment');
    hide('cvv2_div');
    hide_new_cc();
    var a = ge('cc_id');
    if (a) a.checked = false;
}
function show_cc_payment() {
    show('card_payment');
}
function hide_new_cc() {
    hide('cc_input');
    hide('enter_new_card');
}
function show_new_cc() {
    show('cc_input');
    show('enter_new_card');
    if (details_shown) toggleStoredCreditCardDetails();
}
function toggleStoredCreditCardDetails() {
    var a = ge('toggle_stored_credit_card_details_link');
    if (!details_shown) {
        show('stored_credit_card_details');
        a.innerHTML = _tx("hide details");
        details_shown = true;
    } else {
        hide('stored_credit_card_details');
        a.innerHTML = _tx("show details");
        details_shown = false;
    }
}
function show_csc_info(b) {
    var c = _tx("A Card Security Code (CSC) is a security feature of debit and credit cards that helps fight credit card fraud.  The following graphic illustrates where to find the CSC code on your credit card.");
    var d = 'float: left;';
    var g = 'text-align: center; margin: 5px 0;';
    var a = '';
    a += '<div style="' + d + '">';
    a += '<img src="/images/cvv2_types/amex_csc.gif" alt="" />';
    a += '<p style="' + g + '">' + _tx("American Express") + '</p>';
    a += '</div>';
    var f = '';
    f += '<div style="margin-right: 8px;' + d + '">';
    f += '<img src="/images/cvv2_types/backofcard.gif" alt="" />';
    f += '<p style="' + g + '">' + _tx("Visa, Mastercard, JCB") + '</p>';
    f += '</div>';
    var e = '';
    e += '<div class="clearfix">';
    e += '<p>' + c + '</p>';
    if (b == null) {
        e += f;
        e += a;
    } else if (b == 65) {
        e += a;
    } else e += f;
    e += '</div>';
    new Dialog().setClassName('csc_type').setTitle(_tx("What's a CSC?")).setBody(e).setButtons([Dialog.OK]).show();
}
function show_csc_validation_info() {
    var a = '';
    a += '<div class="clearfix">';
    a += '<div style="float: left">';
    a += '<p style="text-align: left; margin: 5px 0;">';
    a += _tx("In order to fight credit card fraud, we have started to enforce CSC code validation in credit card payments.  For credit cards we have stored before, this means they will need to be CSC validated once for later uses.  You will not be prompted in the future once the card gets validated.");
    a += '</p>';
    a += '</div>';
    a += '</div>';
    new Dialog().setClassName('validation').setTitle(_tx("Why is CSC validation required?")).setBody(a).setButtons([Dialog.OK]).show();
}
function get_selected_cc_type(a, b) {
    if (b) {
        cc_type = Form.getSelectValue(get_dialog_pro_elem(a));
    } else cc_type = Form.getSelectValue(ge(a));
    return cc_type;
}
function validate_csc(a, d) {
    if (d) {
        var c = get_dialog_pro_elem('cc_cvv2');
    } else var c = ge('cc_cvv2');
    var b = get_selected_cc_type(a, d);
    if (b == 65) {
        if (c.value.length != 4) {
            c.style.border = "1px solid red;";
        } else c.style.border = "";
    } else if (c.value.length != 3) {
        c.style.border = "1px solid red;";
    } else c.style.border = "";
}
function get_dialog_pro_elem(c) {
    var b = document.getElementsByName(c);
    var d;
    var e = null;
    for (d = 0; d < b.length; d++) {
        var a = b[d];
        if (DOM.contains('pop_content', a)) e = a;
    }
    return e;
}

function share_play_video(b, c) {
    var a = -1;
    if (b != a) _share_log_play_content(b, 'video');
    if (holder = ge(c + '_holder')) if (container = holder.parentNode.parentNode) CSS.addClass(container, 'playing');
    return false;
}
function _share_log_play_content(b, a) {
    new AsyncRequest().setURI('/ajax/shareplay_ajax.php').setData({
        s: b,
        m: a
    }).send();
}

if (window.Bootloader) {
    Bootloader.done(["js\/4gj8wkxihgu8cgkc.pkg.js"]);
}

/*
HTTP Host: static.ak.fbcdn.net
Generated: October 10th 2010 11:52:03 PM PDT
Machine: 10.30.147.196
*/

if (window.CavalryLogger) {
    CavalryLogger.start_js(["js\/7hnggt5u7q4g4gkc.pkg.js"]);
}

function ads_refresh(k, g, f, h, l, j) {
    if (window.ads_refreshing) return;
    if (l === undefined) l = 0;
    if (j === undefined) j = 0;
    var i = ['sidebar_ads', 'home_sponsor_nile', 'ego'];
    var e = [];
    for (var d = 0; d < i.length; d++) if (ge(i[d]) || (i[d] == 'ego' && DOM.scry($('content'), 'div.ego_column').length > 0)) e.push(i[d]);
    if (e.length == 0) return;
    var c = {
        page: g,
        queryId: j,
        tab: k,
        timestamp: (+new Date()),
        locations: e,
        photo_refresh: (h ? 'yes' : 'no'),
        cache: l
    };
    if (e.indexOf('ego') >= 0) c.page_url = URI.getRequestURI().toString();
    var b = function (r) {
        window.ads_refreshing = false;
        var m = r.getPayload();
        for (var q in m) {
            if (q == 'ego') {
                var n = DOM.scry($('content'), 'div.ego_column');
                if (n.length > 0) {
                    DOM.replace(n[0], HTML(m[q]));
                    for (var p = 1; p < n.length; ++p) DOM.empty(n[p]);
                }
                continue;
            }
            var o = ge(q);
            if (o && m[q].length > 0) if (ua.ie() < 7) {
                o.outerHTML = m[q];
            } else DOM.replace(o, HTML(m[q]));
        }
        if (f) f(r);
    };
    var a = function (m) {
        window.ads_refreshing = false;
    };
    new AsyncRequest().setURI('/ajax/location_refresh.php').setData(c).setOption('bundle', true).setHandler(b).setErrorHandler(a).send();
    window.ads_refreshing = true;
}

function typeaheadpro(a, c, b) {
    if (!typeaheadpro.hacks) {
        typeaheadpro.should_check_missing_events = ua.safari() < 500;
        typeaheadpro.should_simulate_keypress = ua.ie() || (ua.safari() > 500 && ua.safari() < 523 || ua.safari() >= 525);
        if (typeaheadpro.should_use_iframe == undefined) typeaheadpro.should_use_iframe = ua.ie() < 7;
        typeaheadpro.should_use_overflow = ua.opera() < 9.5 || ua.safari() < 500;
        if (ua.firefox()) this.activate_poll_on_focus_events = true;
        typeaheadpro.hacks = true;
    }
    typeaheadpro.instances = (typeaheadpro.instances || []);
    typeaheadpro.instances.push(this);
    this.instance = typeaheadpro.instances.length - 1;
    copy_properties(this, b || {});
    this.obj = a;
    this.obj.typeahead = this;
    this.attachEventListeners();
    this.want_icon_list = false;
    this.showing_icon_list = false;
    this.stop_suggestion_select = false;
    if (this.typeahead_icon_class && this.typeahead_icon_get_return) {
        this.typeahead_icon = document.createElement('div');
        CSS.addClass(this.typeahead_icon, 'typeahead_list_icon');
        CSS.addClass(this.typeahead_icon, this.typeahead_icon_class);
        this.typeahead_icon.innerHTML = '&nbsp;';
        this.setup_typeahead_icon();
        setTimeout(function () {
            this.focus();
        }.bind(this), 50);
        this.typeahead_icon.onmousedown = function (event) {
            return this.typeahead_icon_onclick(event || window.event);
        }.bind(this);
    }
    this.focused = this.focused || this.obj.offsetWidth ? true : false;
    this.focused = this.focused && !this.enumerate_on_focus;
    this.anchor = this.setup_anchor();
    this.dropdown = document.createElement('div');
    CSS.addClass(this.dropdown, 'typeahead_list');
    if (!this.focused) this.dropdown.style.display = 'none';
    this.anchor_block = this.anchor_block || this.anchor.tagName.toLowerCase() == 'div';
    document.body.appendChild(this.dropdown);
    this.dropdown.className += ' typeahead_list_absolute';
    this.list = $N('div');
    this.dropdown.appendChild(this.list);
    this.dropdown.onmousedown = function (event) {
        return this.dropdown_onmousedown(event || window.event);
    }.bind(this);
    if (typeaheadpro.should_use_iframe && !typeaheadpro.iframe) {
        typeaheadpro.iframe = document.createElement('iframe');
        typeaheadpro.iframe.src = "/common/blank.html";
        CSS.setClass(typeaheadpro.iframe, 'typeahead_iframe');
        typeaheadpro.iframe.style.display = 'none';
        typeaheadpro.iframe.frameBorder = 0;
        document.body.appendChild(typeaheadpro.iframe);
    }
    if (typeaheadpro.should_use_iframe && typeaheadpro.iframe) typeaheadpro.iframe.style.zIndex = parseInt(CSS.getStyle(this.dropdown, 'zIndex')) - 1;
    this.log_data = {
        kt: 0,
        kp: 0,
        sm: null,
        ty: 0,
        f: 1
    };
    this.results_text = '';
    this.last_key_suggestion = 0;
    this.status = typeaheadpro.STATUS_BLOCK_ON_SOURCE_BOOTSTRAP;
    this.clear_placeholder();
    if (c) this.set_source(c);
    if (this.source) {
        this.selectedindex = -1;
        if (this.focused) {
            this._onfocus();
            this.show();
            this._onkeyup();
            this.set_class('');
            this.capture_submit();
        }
    } else this.hide();
    onleaveRegister(this._onunload.bind(this), true);
}
typeaheadpro.prototype.enumerate = false;
typeaheadpro.prototype.interactive = false;
typeaheadpro.prototype.changed = false;
typeaheadpro.prototype.render_block_size = 50;
typeaheadpro.prototype.typeahead_icon_class = false;
typeaheadpro.prototype.typeahead_icon_get_return = false;
typeaheadpro.prototype.old_value = null;
typeaheadpro.prototype.poll_handle = null;
typeaheadpro.prototype.activate_poll_on_focus_events = false;
typeaheadpro.prototype.suggestion_count = 0;
typeaheadpro.STATUS_IDLE = 0;
typeaheadpro.STATUS_WAITING_ON_SOURCE = 1;
typeaheadpro.STATUS_BLOCK_ON_SOURCE_BOOTSTRAP = 2;
typeaheadpro.prototype.clear_value_on_blur = true;
typeaheadpro.prototype.max_results = 0;
typeaheadpro.prototype.max_display = 10;
typeaheadpro.prototype.allow_placeholders = false;
typeaheadpro.prototype.auto_select = true;
typeaheadpro.prototype.auto_select_exactmatch = false;
typeaheadpro.prototype.enumerate_on_focus = false;
typeaheadpro.dirty_instances = function () {
    if (typeaheadpro.instances) typeaheadpro.instances.forEach(function (a) {
        a.update_status(typeaheadpro.STATUS_BLOCK_ON_SOURCE_BOOTSTRAP);
        if (a.source) a.source.is_ready = false;
    });
};
typeaheadpro.prototype.set_source = function (a) {
    this.source = a;
    this.source.set_owner(this);
    this.status = typeaheadpro.STATUS_IDLE;
    this.cache = {};
    this.last_search = 0;
    this.suggestions = [];
};
typeaheadpro.prototype.setup_anchor = function () {
    return this.obj;
};
typeaheadpro.prototype.destroy = function () {
    if (this.typeahead_icon) {
        DOM.remove(this.typeahead_icon);
        this.toggle_icon_list = function () {};
    }
    this.clear_render_timeouts();
    if (!this.anchor_block && this.anchor.nextSibling.tagName.toLowerCase() == 'br') DOM.remove(this.anchor.nextSibling);
    if (this.dropdown) DOM.remove(this.dropdown);
    if (this.obj) {
        this.removeEventListeners();
        this.obj.typeahead = null;
        DOM.remove(this.obj);
    }
    this.anchor = this.obj = this.dropdown = null;
    delete typeaheadpro.instances[this.instance];
};
typeaheadpro.prototype.check_value = function () {
    if (this.obj) {
        var a = this.obj.value;
        if (a != this.old_value) {
            this.dirty_results();
            this.old_value = a;
            if (this.old_value === '') this._onselect(false);
        }
    }
};
typeaheadpro.prototype._onkeyup = function (a) {
    a = $E(a);
    this.last_key = a ? a.keyCode : -1;
    if (this.key_down == this.last_key) this.key_down = 0;
    var b = true;
    switch (this.last_key) {
    case KEYS.ESC:
        this.selectedindex = -1;
        this._onselect(false);
        this.hide();
        a.stop();
        b = false;
        break;
    }
    return b;
};
typeaheadpro.prototype._onkeydown = function (a) {
    a = $E(a);
    this.key_down = this.last_key = a ? a.keyCode : -1;
    this.interactive = true;
    switch (this.last_key) {
    case KEYS.PAGE_UP:
    case KEYS.PAGE_DOWN:
    case KEYS.UP:
    case KEYS.DOWN:
        this.log_data.kt += 1;
        if (typeaheadpro.should_simulate_keypress) this._onkeypress({
            keyCode: this.last_key
        });
        return false;
    case KEYS.TAB:
        this.log_data.kt += 1;
        this.select_suggestion(this.selectedindex);
        if (a.shiftKey) {
            this.reverse_focus();
        } else this.advance_focus();
        break;
    case KEYS.RETURN:
        this.log_data.sm = 'key_ret';
        if (this.select_suggestion(this.selectedindex)) this.hide();
        if (typeof(this.submit_keydown_return) != 'undefined') this.submit_keydown_return = this._onsubmit(this.get_current_selection());
        return this.submit_keydown_return;
    case 229:
        if (!this.poll_handle) this.poll_handle = setInterval(this.check_value.bind(this), 100);
        break;
    default:
        this.log_data.kp += 1;
        setTimeout(bind(this, 'check_value'), this.source.check_limit);
    }
};
typeaheadpro.prototype._onkeypress = function (a) {
    a = $E(a);
    var b = 1;
    this.last_key = a ? Event.getKeyCode(a) : -1;
    this.interactive = true;
    switch (this.last_key) {
    case KEYS.PAGE_UP:
        b = this.max_display;
    case KEYS.UP:
        this.set_suggestion(b > 1 && this.selectedindex > 0 && this.selectedindex < b ? 0 : this.selectedindex - b);
        this.last_key_suggestion = (new Date()).getTime();
        return false;
    case KEYS.PAGE_DOWN:
        b = this.max_display;
    case KEYS.DOWN:
        if (trim(this.get_value()) == '' && !this.enumerate) {
            this.enumerate = true;
            this.results_text = null;
            this.dirty_results();
        } else {
            this.set_suggestion(this.suggestions.length <= this.selectedindex + b ? this.suggestions.length - 1 : this.selectedindex + b);
            this.last_key_suggestion = (new Date()).getTime();
        }
        return false;
    case KEYS.RETURN:
        var c = null;
        if (typeof(this.submit_keydown_return) == 'undefined') {
            c = this.submit_keydown_return = this._onsubmit(this.get_current_selection());
        } else {
            c = this.submit_keydown_return;
            delete this.submit_keydown_return;
        }
        a.stop();
        return c;
    default:
        setTimeout(bind(this, 'check_value'), this.source.check_limit);
        break;
    }
    return true;
};
typeaheadpro.prototype._onchange = function () {
    this.changed = true;
};
typeaheadpro.prototype._onfound = function (a) {
    return this.onfound ? this.onfound.call(this, a) : true;
};
typeaheadpro.prototype._onsubmit = function (a) {
    if (this.onsubmit) {
        var b = this.onsubmit.call(this, a);
        if (b && this.obj.form) {
            if (!this.obj.form.onsubmit || this.obj.form.onsubmit()) this.obj.form.submit();
            return false;
        }
        return b;
    } else {
        this.advance_focus();
        return false;
    }
};
typeaheadpro.prototype._onselect = function (c) {
    var b = (function () {
        if (this.onselect) this.onselect.call(this, c);
    }).bind(this);
    if (c.no_email) {
        var a = new AsyncRequest().setData({
            action: 'require',
            require_field: 'email',
            uid: c.i
        }).setMethod('GET').setReadOnly(true).setURI('/friends/ajax/external.php');
        new Dialog().setCloseHandler(function (e) {
            var d = this.getUserData();
            if (d) {
                b();
            } else e.set_value('');
        }.bind(null, this)).setAsync(a).show();
    } else b();
};
typeaheadpro.prototype._onfocus = function () {
    if (!this.poll_handle && this.activate_poll_on_focus_events) this.poll_handle = setInterval(this.check_value.bind(this), 100);
    if (this.source) this.source.bootstrap();
    if (this.last_dropdown_mouse > (new Date()).getTime() - 10 || this.focused) return;
    if (this.changed) this.dirty_results();
    this.focused = true;
    this.changed = false;
    this.clear_placeholder();
    this.results_text = '';
    this.set_class('');
    this.show();
    this.capture_submit();
    if (this.typeahead_icon) show(this.typeahead_icon);
    if (this.enumerate_on_focus) setTimeout(function () {
        this.enumerate = true;
        this.results_text = null;
        this.dirty_results();
        this.selectedindex = -1;
        return false;
    }.bind(this), 0);
};
typeaheadpro.prototype._onblur = function (event) {
    if (this.last_dropdown_mouse && this.last_dropdown_mouse > (new Date()).getTime() - 10 && this.is_showing_suggestions()) {
        Event.kill(event);
        setTimeout(function () {
            this.focus();
        }.bind(this), 0);
        return false;
    }
    if (!this.stop_hiding) {
        if (this.showing_icon_list) this.toggle_icon_list(true);
    } else {
        this.focus();
        return false;
    }
    this.focused = false;
    if (this.changed && !this.interactive) {
        this.dirty_results();
        this.changed = false;
        return;
    }
    if (!this.suggestions) {
        this._onselect(false);
    } else if (this.selectedindex >= 0 && (this.auto_select || this.auto_select_exactmatch)) this.select_suggestion(this.selectedindex);
    this.hide();
    this.update_class();
    if (this.clear_value_on_blur && !this.get_value()) {
        var a = this.allow_placeholders ? this.source.gen_noinput() : '';
        this.set_value(a ? a : '');
        this.set_class('DOMControl_placeholder');
    }
    if (this.poll_handle) {
        clearInterval(this.poll_handle);
        this.poll_handle = null;
    }
};
typeaheadpro.prototype._onunload = function () {
    if (typeaheadpro.instances[this.instance]) this.hide();
};
typeaheadpro.prototype.typeahead_icon_onclick = function (event) {
    this.stop_hiding = true;
    this.focus();
    setTimeout(function () {
        this.toggle_icon_list();
    }.bind(this), 50);
    Event.kill(event);
    return false;
};
typeaheadpro.prototype.dropdown_onmousedown = function (event) {
    this.last_dropdown_mouse = (new Date()).getTime();
};
typeaheadpro.prototype.setup_typeahead_icon = function () {
    this.typeahead_parent = document.createElement('div');
    CSS.addClass(this.typeahead_parent, 'typeahead_parent');
    this.typeahead_parent.appendChild(this.typeahead_icon);
    this.obj.parentNode.insertBefore(this.typeahead_parent, this.obj);
};
typeaheadpro.prototype.mouse_set_suggestion = function (a) {
    if (!this.visible) return;
    if ((new Date()).getTime() - this.last_key_suggestion > 50) this.set_suggestion(a);
};
typeaheadpro.prototype.capture_submit = function () {
    if (!typeaheadpro.should_check_missing_events) return;
    if ((!this.captured_form || this.captured_substitute != this.captured_form.onsubmit) && this.obj.form) {
        this.captured_form = this.obj.form;
        this.captured_event = this.obj.form.onsubmit;
        this.captured_substitute = this.obj.form.onsubmit = function () {
            return ((this.key_down && this.key_down != KEYS.RETURN && this.key_down != KEYS.TAB) ? this.submit_keydown_return : (this.captured_event ? this.captured_event.apply(arguments, this.captured_form) : true)) ? true : false;
        }.bind(this);
    }
};
typeaheadpro.prototype.set_suggestion = function (b) {
    this.stop_suggestion_select = false;
    if (!this.suggestions || this.suggestions.length <= b) return;
    var c = this.get_suggestion_node(this.selectedindex);
    this.selectedindex = (b <= -1) ? -1 : b;
    var a = this.get_suggestion_node(this.selectedindex);
    if (c) {
        CSS.removeClass(c, 'typeahead_selected');
        CSS.addClass(c, 'typeahead_not_selected');
    }
    if (a) {
        CSS.removeClass(a, 'typeahead_not_selected');
        CSS.addClass(a, 'typeahead_selected');
    }
    this.recalc_scroll();
    this._onfound(this.get_current_selection());
};
typeaheadpro.prototype.get_suggestion_node = function (a) {
    var b = this.list.childNodes;
    return a == -1 ? null : b[Math.floor(a / this.render_block_size)].childNodes[a % this.render_block_size];
};
typeaheadpro.prototype.get_current_selection = function () {
    return this.selectedindex == -1 ? false : this.suggestions[this.selectedindex];
};
typeaheadpro.prototype.update_class = function () {
    if (this.suggestions && this.selectedindex != -1 && typeahead_source.flatten_string(this.get_current_selection().t) == typeahead_source.flatten_string(this.get_value())) {
        this.set_class('typeahead_found');
    } else this.set_class('');
};
typeaheadpro.prototype.select_suggestion = function (a) {
    if (!this.stop_suggestion_select && this.current_selecting != a) this.current_selecting = a;
    var b = true;
    if (!this.suggestions || a == undefined || a === false || this.suggestions.length <= a || a < 0) {
        this._onfound(false);
        this._onselect(false);
        this.selectedindex = -1;
        this.set_class('');
        b = false;
    } else {
        this.selectedindex = a;
        var c = this.suggestions[a].ty;
        if (c != 'web' && c != 'search') this.set_value(this.suggestions[a].t);
        this.set_class('typeahead_found');
        this._onfound(this.suggestions[this.selectedindex]);
        this._onselect(this.suggestions[this.selectedindex]);
    }
    if (!this.interactive) {
        this.hide();
        this.blur();
    }
    this.current_selecting = null;
    if (!b && this.ignore_invalid_suggestion) return false;
    return true;
};
typeaheadpro.prototype.is_showing_suggestions = function () {
    return (this.suggestions) && (this.suggestions.length > 0);
};
typeaheadpro.prototype.set_value = function (a) {
    this.obj.value = a;
};
typeaheadpro.prototype.get_value = function () {
    if (this.showing_icon_list && this.old_typeahead_value != this.obj.value) this.toggle_icon_list();
    if (this.want_icon_list) {
        return this.typeahead_icon_get_return;
    } else if (this.showing_icon_list) this.toggle_icon_list();
    return this.obj.value;
};
typeaheadpro.prototype.found_suggestions = function (p, q, e) {
    if (!p) p = [];
    this.suggestion_count = p.length;
    if (!e) {
        this.status = typeaheadpro.STATUS_IDLE;
        this.add_cache(q, p);
    }
    this.clear_render_timeouts();
    if (this.get_value() == this.results_text) {
        return;
    } else if (!e) {
        this.results_text = typeahead_source.flatten_string(q);
        if (this.enumerate && trim(this.results_text) != '') this.enumerate = false;
    }
    if (this.dedupe_suggestions) {
        var i = DOM.scry(this.tokenizer.obj, 'input.fb_token_hidden_input');
        if (i.length > 0) {
            var d = [];
            var a = [];
            for (var h = 0; h < i.length; h++) a[i[h].value] = true;
            for (var h = 0, j = p.length; h < j; h++) if (p[h] && !a[p[h].i]) d.push(p[h]);
            p = d;
        }
    }
    var c = -1;
    if (this.selectedindex > 0 || (this.selectedindex == 0 && !this.auto_select)) {
        var n = this.suggestions[this.selectedindex].i;
        for (var h = 0, j = p.length; h < j; h++) if (p[h].i == n) {
            c = h;
            break;
        }
    }
    if (c == -1 && this.auto_select && p.length) {
        c = 0;
        this._onfound(p[0]);
    } else if (this.auto_select_exactmatch && p.length) if (q.toLowerCase() === p[0].t.toLowerCase()) {
        c = 0;
        this._onfound(p[0]);
    } else c = -1;
    this.selectedindex = c;
    this.suggestions = p;
    if (!e) this.real_suggestions = p;
    if (p.length) {
        var g = [],
            b = Math.ceil(p.length / this.render_block_size),
            k = {},
            f, m = null;
        DOM.empty(this.list);
        for (var h = 0; h < b; h++) this.list.appendChild(document.createElement('div'));
        if (c > -1) {
            f = Math.floor(c / this.render_block_size);
            k[f] = true;
            if (c % this.render_block_size > this.render_block_size / 2) {
                k[f + 1] = true;
            } else if (f != 0) k[f - 1] = true;
        } else k[0] = true;
        for (var l in k) {
            this.render_block(l);
            sample = this.list.childNodes[l].firstChild;
        }
        this.show();
        if (b) {
            var o = sample.offsetHeight;
            this.render_timeouts = [];
            for (var h = 1; h < b; h++) if (!k[h]) {
                this.list.childNodes[h].style.height = o * Math.min(this.render_block_size, p.length - h * this.render_block_size) + 'px';
                this.render_timeouts.push(setTimeout(this.render_block.bind(this, h), 700 + h * 50));
            }
        }
    } else {
        this.selectedindex = -1;
        this.set_message(this.status == typeaheadpro.STATUS_IDLE ? this.source.gen_nomatch() : this.source.gen_loading());
        this._onfound(false);
    }
    this.recalc_scroll();
    if (!e && this.results_text != typeahead_source.flatten_string(this.get_value())) this.dirty_results();
};
typeaheadpro.prototype.render_block = function (a, h) {
    var i = this.suggestions,
        g = this.selectedindex,
        j = this.get_value(),
        d = this.instance,
        b = [],
        f = this.list.childNodes[a];
    for (var c = a * this.render_block_size, e = Math.min(i.length, (a + 1) * this.render_block_size); c < e; c++) {
        b.push('<div class="');
        if (g == c) {
            b.push('typeahead_suggestion typeahead_selected');
        } else b.push('typeahead_suggestion typeahead_not_selected');
        if (c > 0 && i[c - 1].o < 0 && i[c].o >= 0) b.push(' typeahead_delimiter');
        b.push('" onmouseover="typeaheadpro.instances[', d, '].mouse_set_suggestion(', c, ')" ', 'onmousedown="var instance=typeaheadpro.instances[', d, ']; instance.select_suggestion(', c, ');instance.hide();Event.kill(event);">', this.source.gen_html(i[c], j), '</div>');
    }
    f.innerHTML = b.join('');
    f.style.height = 'auto';
    CSS.addClass(f, 'typeahead_suggestions');
};
typeaheadpro.prototype.clear_render_timeouts = function () {
    if (this.render_timeouts) {
        for (var a = 0; a < this.render_timeouts.length; a++) clearTimeout(this.render_timeouts[a]);
        this.render_timeouts = null;
    }
};
typeaheadpro.prototype.recalc_scroll = function () {
    var a = this.list.firstChild;
    if (!a) return;
    if (a.childNodes.length > this.max_display) {
        var c = a.childNodes[this.max_display - 1];
        var b = c.offsetTop + c.offsetHeight;
        this.dropdown.style.height = b + 'px';
        var e = this.get_suggestion_node(this.selectedindex);
        if (e) {
            var d = this.dropdown.scrollTop;
            if (e.offsetTop < d) {
                this.dropdown.scrollTop = e.offsetTop;
            } else if (e.offsetTop + e.offsetHeight > b + d) this.dropdown.scrollTop = e.offsetTop + e.offsetHeight - b;
        }
        if (!typeaheadpro.should_use_overflow) {
            this.dropdown.style.overflowY = 'scroll';
            this.dropdown.style.overflowX = 'hidden';
        }
    } else {
        this.dropdown.style.height = 'auto';
        if (!typeaheadpro.should_use_overflow) this.dropdown.style.overflowY = 'hidden';
    }
};
typeaheadpro.prototype.search_cache = function (a) {
    return this.cache[typeahead_source.flatten_string(a)];
};
typeaheadpro.prototype.add_cache = function (b, a) {
    if (this.source.cache_results) this.cache[typeahead_source.flatten_string(b)] = a;
};
typeaheadpro.prototype.update_status = function (a) {
    this.status = a;
    this.dirty_results();
};
typeaheadpro.prototype.set_class = function (a) {
    CSS.setClass(this.obj, (this.obj.className.replace(/typeahead_[^\s]+/g, '') + ' ' + a).replace(/ {2,}/g, ' '));
};
typeaheadpro.prototype.dirty_results = function () {
    if (!this.enumerate && this.get_value().trim() == '') {
        DOM.empty(this.list);
        this.results_text = '';
        this.set_message(this.source.gen_placeholder());
        this.suggestions = [];
        this.selectedindex = -1;
        return;
    } else if (this.results_text == typeahead_source.flatten_string(this.get_value())) {
        return;
    } else if (this.status == typeaheadpro.STATUS_BLOCK_ON_SOURCE_BOOTSTRAP) {
        this.set_message(this.source.gen_loading());
        return;
    }
    var c = (new Date()).getTime();
    var e = false;
    if (this.last_search <= (c - this.source.search_limit) && this.status == typeaheadpro.STATUS_IDLE) {
        e = this.perform_search();
    } else if (this.status == typeaheadpro.STATUS_IDLE) if (!this.search_timeout) this.search_timeout = setTimeout(function () {
        this.search_timeout = false;
        if (this.status == typeaheadpro.STATUS_IDLE) this.dirty_results();
    }.bind(this), this.source.search_limit - (c - this.last_search));
    if (this.source.allow_fake_results && this.real_suggestions && !e) {
        var d = typeahead_source.tokenize(this.get_value()).sort(typeahead_source._sort);
        var a = [];
        for (var b = 0; b < this.real_suggestions.length; b++) if (typeahead_source.check_match(d, this.real_suggestions[b].t + ' ' + this.real_suggestions[b].n)) a.push(this.real_suggestions[b]);
        if (a.length) {
            this.found_suggestions(a, this.get_value(), true);
        } else {
            this.selectedindex = -1;
            this.set_message(this.source.gen_loading());
        }
    }
};
typeaheadpro.prototype.perform_search = function () {
    if (this.get_value() == this.results_text) return true;
    var a;
    if ((a = this.search_cache(this.get_value())) === undefined && !(a = this.source.search_value(this.get_value()))) {
        this.status = typeaheadpro.STATUS_WAITING_ON_SOURCE;
        this.last_search = (new Date()).getTime();
        return false;
    }
    this.found_suggestions(a, this.get_value(), false);
    return true;
};
typeaheadpro.prototype.set_message = function (a) {
    this.clear_render_timeouts();
    if (a) {
        this.list.innerHTML = '<div class="typeahead_message">' + a + '</div>';
        this.reset_iframe();
    } else this.hide();
    this.recalc_scroll();
};
typeaheadpro.prototype.reset_iframe = function () {
    if (!typeaheadpro.should_use_iframe) return;
    typeaheadpro.iframe.style.top = this.dropdown.style.top;
    typeaheadpro.iframe.style.left = this.dropdown.style.left;
    typeaheadpro.iframe.style.width = this.dropdown.offsetWidth + 'px';
    typeaheadpro.iframe.style.height = this.dropdown.offsetHeight + 'px';
    typeaheadpro.iframe.style.display = '';
};
typeaheadpro.prototype.advance_focus = function () {
    return this._move_focus(true);
};
typeaheadpro.prototype.reverse_focus = function () {
    return this._move_focus(false);
};
typeaheadpro.prototype._move_focus = function (c) {
    var b = this.obj.form ? Form.getInputs(this.obj.form) : Form.getInputs();
    var d = [];
    d._insert = c ? d.push : d.unshift;
    var e = !c;
    for (var a = 0; a < b.length; a++) if (!c && b[a] == this.obj) {
        e = false;
    } else if (e && b[a].type != 'hidden' && b[a].tabIndex != -1 && b[a].offsetParent) {
        d._insert(b[a]);
    } else if (b[a] == this.obj) e = true;
    setTimeout(function () {
        for (var g = 0; g < this.length; g++) try {
            if (this[g].offsetParent) {
                this[g].focus();
                setTimeout(function () {
                    try {
                        this.focus();
                    } catch (h) {}
                }.bind(this[g]), 0);
                return;
            }
        } catch (f) {}
    }.bind(d ? d : []), 0);
    this.blur();
    this.hide();
};
typeaheadpro.prototype.clear_placeholder = function () {
    if (CSS.hasClass(this.obj, 'DOMControl_placeholder')) {
        this.set_value('');
        CSS.removeClass(this.obj, 'DOMControl_placeholder');
    }
};
typeaheadpro.prototype.clear = function () {
    this.set_value('');
    this.set_class('');
    this.selectedindex = -1;
    this.enumerate = false;
    this.dirty_results();
};
typeaheadpro.prototype.hide = function () {
    if (this.stop_hiding) return;
    this.visible = false;
    this.dropdown.style.display = 'none';
    this.clear_render_timeouts();
    if (typeaheadpro.should_use_iframe) typeaheadpro.iframe.style.display = 'none';
};
typeaheadpro.prototype.show = function () {
    this.visible = true;
    if (this.focused) {
        this.dropdown.style.top = elementY(this.anchor) + this.anchor.offsetHeight + 'px';
        this.dropdown.style.left = elementX(this.anchor) + 'px';
        this.dropdown.style.width = (this.anchor.offsetWidth - 2) + 'px';
        this.dropdown.style.display = '';
        if (typeaheadpro.should_use_iframe) {
            typeaheadpro.iframe.style.display = '';
            this.reset_iframe();
        }
    }
};
typeaheadpro.prototype.toggle_icon_list = function (a) {
    if (this.showing_icon_list) {
        this.showing_icon_list = false;
        this.source.showing_icon_list = false;
        if (!a) this.focus();
        CSS.removeClass(this.typeahead_icon, 'on_selected');
        this.want_icon_list = false;
        this.showing_icon_list = false;
        this.stop_suggestion_select = true;
        if (this.obj) this.dirty_results();
    } else {
        this.source.showing_icon_list = true;
        this.old_typeahead_value = this.obj.value;
        this.stop_suggestion_select = true;
        this.want_icon_list = true;
        this.dirty_results();
        this.focus();
        CSS.addClass(this.typeahead_icon, 'on_selected');
        this.show();
        this.set_suggestion(-1);
        this.showing_icon_list = true;
    }
    setTimeout(function () {
        this.stop_hiding = false;
    }.bind(this), 100);
};
typeaheadpro.prototype.focus = function () {
    this.obj.focus();
};
typeaheadpro.prototype.blur = function (a) {
    if (this.obj) this.obj.blur(a);
};
typeaheadpro.prototype.attachEventListeners = function () {
    this._eventRefs = Event.listen(this.obj, {
        focus: this._onfocus.bind(this),
        blur: this._onblur.bind(this),
        change: this._onchange.bind(this),
        keyup: this._onkeyup.bind(this),
        keydown: this._onkeydown.bind(this),
        keypress: this._onkeypress.bind(this)
    });
};
typeaheadpro.prototype.removeEventListeners = function () {
    if (this._eventRefs) for (var a in this._eventRefs) this._eventRefs[a].remove();
};
typeaheadpro.kill_typeahead = function (a) {
    if (a.typeahead) {
        if (!this.anchor_block) a.parentNode.removeChild(a.nextSibling);
        a.parentNode.removeChild(a.nextSibling);
        if (a.typeahead.source) a.typeahead.source = a.typeahead.source.owner = null;
        a.typeahead.removeEventListeners();
        a.typeahead = null;
    }
};

function typeahead_source() {}
typeahead_source.prototype.cache_results = false;
typeahead_source.prototype.enumerable = false;
typeahead_source.prototype.allow_fake_results = false;
typeahead_source.prototype.escape_results = false;
typeahead_source.prototype.search_limit = 10;
typeahead_source.prototype.check_limit = 10;
typeahead_source.prototype.bootstrap = bagofholding;
typeahead_source.check_match = function (f, g) {
    g = typeahead_source.tokenize(g);
    for (var b = 0, c = f.length; b < c; b++) if (f[b].length) {
        var a = false;
        for (var d = 0, e = g.length; d < e; d++) if (g[d].length >= f[b].length && g[d].substring(0, f[b].length) == f[b]) {
            a = true;
            g[d] = '';
            break;
        }
        if (!a) return false;
    }
    return true;
};
typeahead_source.tokenize = function (c, a, b) {
    return (b ? c : typeahead_source.flatten_string(c)).split(a ? typeahead_source.normalizer_regex_capture : typeahead_source.normalizer_regex);
};
typeahead_source.normalizer_regex_str = '(?:(?:^| +)["\'.\\-]+ *)|(?: *[\'".\\-]+(?: +|$)|[@_]| +)';
typeahead_source.normalizer_regex = new RegExp(typeahead_source.normalizer_regex_str, 'g');
typeahead_source.normalizer_regex_capture = new RegExp('(' + typeahead_source.normalizer_regex_str + ')', 'g');
typeahead_source.flatten_string = function (b) {
    if (!typeahead_source.accents) typeahead_source.accents = {
        a: /\u0430|\u00e0|\u00e1|\u00e2|\u00e3|\u00e4|\u00e5/g,
        b: /\u0431/g,
        c: /\u0446|\u00e7/g,
        d: /\u0434|\u00f0/g,
        e: /\u044d|\u0435|\u00e8|\u00e9|\u00ea|\u00eb/g,
        f: /\u0444/g,
        g: /\u0433/g,
        h: /\u0445/g,
        i: /\u0438|\u00ec|\u00ed|\u00ee|\u00ef/g,
        j: /\u0439/g,
        k: /\u043a/g,
        l: /\u043b/g,
        m: /\u043c/g,
        n: /\u043d|\u00f1/g,
        o: /\u043e|\u00f8|\u00f6|\u00f5|\u00f4|\u00f3|\u00f2/g,
        p: /\u043f/g,
        r: /\u0440/g,
        s: /\u0441/g,
        t: /\u0442/g,
        u: /\u0443|\u044e|\u00fc|\u00fb|\u00fa|\u00f9/g,
        v: /\u0432/g,
        y: /\u044b|\u00ff|\u00fd/g,
        z: /\u0437/g,
        ae: /\u00e6/g,
        oe: /\u0153/g,
        ts: /\u0446/g,
        ch: /\u0447/g,
        sh: /\u0448/g,
        ya: /\u044f/g
    };
    b = b.toLowerCase();
    for (var a in typeahead_source.accents) b = b.replace(typeahead_source.accents[a], a);
    return b;
};
typeahead_source.prototype.set_owner = function (a) {
    this.owner = a;
    if (this.is_ready) this.owner.update_status(typeaheadpro.STATUS_IDLE);
};
typeahead_source.prototype.ready = function () {
    if (this.owner && !this.is_ready) {
        this.is_ready = true;
        this.owner.update_status(typeaheadpro.STATUS_IDLE);
    } else this.is_ready = true;
};
typeahead_source.highlight_found = function (g, h) {
    var b = [];
    resultv = typeahead_source.tokenize(g, true, true);
    g = typeahead_source.tokenize(g, true);
    h = typeahead_source.tokenize(h);
    h.sort(typeahead_source._sort);
    for (var c = 0, d = resultv.length; c < d; c++) {
        var a = false;
        for (var e = 0, f = h.length; e < f; e++) if (h[e] && g[c].lastIndexOf(h[e], 0) != -1) {
            b.push('<em>', htmlspecialchars(resultv[c].substring(0, h[e].length)), '</em>', htmlspecialchars(resultv[c].substring(h[e].length, resultv[c].length)));
            a = true;
            break;
        }
        if (!a) b.push(htmlspecialchars(resultv[c]));
    }
    return b.join('');
};
typeahead_source._sort = function (a, b) {
    return b.length - a.length;
};
typeahead_source.prototype.gen_nomatch = function () {
    return this.text_nomatch != null ? this.text_nomatch : _tx("No matches found");
};
typeahead_source.prototype.gen_loading = function () {
    return this.text_loading != null ? this.text_loading : _tx("Loading...");
};
typeahead_source.prototype.gen_placeholder = function () {
    return this.text_placeholder != null ? this.text_placeholder : _tx("Start typing...");
};
typeahead_source.prototype.gen_noinput = function () {
    return this.text_noinput != null ? this.text_noinput : _tx("Start typing...");
};
typeahead_source.prototype.onselect_not_found = function () {
    if (typeof this.tokenizer._ontokennotfound != 'undefined') this.tokenizer._ontokennotfound(this.obj.value);
    if (typeof this.tokenizer.onselect != 'undefined') return this.tokenizer.onselect();
};
typeahead_source.prototype.gen_html = function (d, a) {
    var e = d.t || d;
    var b = ['<div>', typeahead_source.highlight_found(e, a), '</div>'];
    if (d.s) {
        var c = (this.escape_results ? htmlspecialchars(d.s) : d.s);
        b.push('<div class="sub_result"><small>', c, '</small></div>');
    }
    return b.join('');
};

function Rect(e, d, a, c, b) {
    if (this === window) {
        if (e instanceof Rect) return e;
        if (e instanceof Vector2) return new Rect(e.y, e.x, e.y, e.x, e.domain);
        return Rect.getElementBounds($(e));
    }
    copy_properties(this, {
        t: e,
        r: d,
        b: a,
        l: c,
        domain: b || 'pure'
    });
}
copy_properties(Rect.prototype, {
    w: function () {
        return this.r - this.l;
    },
    h: function () {
        return this.b - this.t;
    },
    toString: function () {
        return '((' + this.l + ', ' + this.t + '), (' + this.r + ', ' + this.b + '))';
    },
    contains: function (b) {
        b = Rect(b).convertTo(this.domain);
        var a = this;
        if (b instanceof Vector2) {
            return (a.l <= b.x && a.r >= b.x && a.t <= b.y && a.b >= b.y);
        } else return (a.l <= b.l && a.r >= a.r && a.t <= b.t && a.b >= b.b);
    },
    add: function (c, d) {
        if (arguments.length == 1) {
            if (c.domain != 'pure') c = c.convertTo(this.domain);
            return this.add(c.x, c.y);
        }
        var a = parseFloat(c);
        var b = parseFloat(d);
        return new Rect(this.t + b, this.r + a, this.b + b, this.l + a, this.domain);
    },
    sub: function (a, b) {
        if (arguments.length == 1) {
            return this.add(a.mul(-1));
        } else return this.add(-a, -b);
    },
    boundWithin: function (a) {
        var b = 0,
            c = 0;
        if (this.l < a.l) {
            b = a.l - this.l;
        } else if (this.r > a.r) b = a.r - this.r;
        if (this.t < a.t) {
            c = a.t - this.t;
        } else if (this.b > a.b) c = a.b - this.b;
        return this.add(b, c);
    },
    getPositionVector: function () {
        return new Vector2(this.l, this.t, this.domain);
    },
    getDimensionVector: function () {
        return new Vector2(this.w(), this.h(), 'pure');
    },
    convertTo: function (a) {
        if (this.domain == a) return this;
        if (a == 'pure') return new Rect(this.t, this.r, this.b, this.l, 'pure');
        if (this.domain == 'pure') return new Rect(0, 0, 0, 0);
        var b = new Vector2(this.l, this.t, this.domain).convertTo(a);
        return new Rect(b.y, b.x + this.w(), b.y + this.h(), b.x, a);
    }
});
copy_properties(Rect, {
    newFromVectors: function (b, a) {
        return new Rect(b.y, b.x + a.x, b.y + a.y, b.x, b.domain);
    },
    getElementBounds: function (a) {
        return Rect.newFromVectors(Vector2.getElementPosition(a), Vector2.getElementDimensions(a));
    },
    getViewportBounds: function () {
        return Rect.newFromVectors(Vector2.getScrollPosition(), Vector2.getViewportDimensions());
    }
});

function Collection(e, d) {
    if (!e.__collection__) {
        var a = new Function();
        for (var c in e.prototype) a.prototype[c] = Collection._call.bind(null, c);
        e.__collection__ = a;
    }
    var b = new e.__collection__();
    b._elements = d;
    return b;
}
Collection._call = function (b) {
    var a = Array.prototype.slice.call(arguments, 1);
    this._elements.each(function (c) {
        c[b].apply(c, a);
    });
    return this;
};

function Scroller(a) {
    this.canvas = a;
    this.scrollZone = 50;
    this.velocity = 100;
    this.coefficient = 1;
}
Scroller.findScrollParent = function (a) {
    var b;
    a = a.parentNode;
    while (a) {
        if (a.scrollHeight != a.offsetTop) {
            b = CSS.getStyle(a, 'overflowY');
            if (b == 'scroll' || b == 'auto') return a;
        }
        a = a.parentNode;
    }
    return document.body;
};
Scroller.prototype.activate = function () {
    this.activate = bagofholding;
    this.event = Event.listen(document, 'mousemove', this._onmousemove.bind(this));
    this.interval = this._intervalHandler.bind(this).recur(50);
    this.cursor = null;
};
Scroller.prototype.deactivate = function () {
    delete this.activate;
    this.event && this.event.remove();
    this.event = null;
    clearInterval(this.interval);
};
Scroller.prototype._onmousemove = function (event) {
    this.cursor = new Vector2.getEventPosition(event);
};
Scroller.prototype._intervalHandler = function () {
    if (!this.cursor) return;
    var c = this.canvas == document.body ? Rect.getViewportBounds() : Rect(this.canvas);
    var a = new Rect(this.cursor.y - c.t, c.r - this.cursor.x, c.b - this.cursor.y, this.cursor.x - c.l);
    var b = new Vector2(0, 0);
    if (a.t < a.b && a.t < this.scrollZone) {
        b.y = -this.scrollZone + a.t;
    } else if (a.b < this.scrollZone) b.y = this.scrollZone - a.b;
    b.y = this._doMath(b.y);
    if (a.l < a.r && a.l < this.scrollZone) {
        b.x = -this.scrollZone + a.l;
    } else if (a.r < this.scrollZone) b.x = this.scrollZone - a.r;
    b.x = this._doMath(b.x);
    if (b.x || b.y) {
        b.scrollElementBy(this.canvas);
        if (document.body == this.canvas) this.cursor = this.cursor.add(b);
        Arbiter.inform('scroller/scroll', this.cursor);
    }
};
Scroller.prototype._doMath = function (a) {
    return Math.floor(Math.pow((a >= 0 ? Math.min(a, this.scrollZone) : Math.max(a, -this.scrollZone)) / this.scrollZone * this.velocity, this.coefficient));
};
var Drag = {};
Drag.currentDraggable = null;
Drag.grab = function (a) {
    if (Drag.currentDraggable) Drag._onmouseup();
    a.lastDragOver = null;
    Drag.attachDragEvents();
    Drag.currentDraggable = a;
};
Drag.attachDragEvents = function () {
    document.onselectstart = function () {
        document.onselectstart = null;
        return false;
    };
    if (Drag.dragEventsAttached) return;
    Drag.dragEventsAttached = true;
    Arbiter.subscribe('scroller/scroll', Drag._onmousemove);
    Event.listen(document, {
        mousemove: Drag._onmousemove,
        mouseup: Drag._onmouseup
    });
};
Drag.droppables = {};
Drag.addDroppable = function (b, a) {
    (Drag.droppables[b] = Drag.droppables[b] || []).push(a);
};
Drag.removeDroppable = function (b, a) {
    Drag.droppables[b] = Drag.droppables[b].filter(function (c) {
        return c != a;
    });
};
Drag._onmousemove = function (event, c) {
    if (!Drag.currentDraggable) return;
    var d = c || Vector2.getEventPosition(event),
        b = Drag.currentDraggable,
        e = Drag.droppables[b.namespace];
    if (b.namespace && b.active && e) {
        var j = {};
        e.each(function (k) {
            j[k.zIndex] = k.zIndex;
        });
        var i = [];
        for (var f in j) i.push(j[f]);
        i.sort();
        var g = b.lastDragOver,
            a = null;
        for (var h = i.length - 1; h >= 0; h--) if (g && g.dom != null && g.zIndex == i[h] && g.pointInside(d)) {
            a = g;
            break;
        } else for (var f = 0; f < e.length; f++) {
            if (i[h] != e[f].zIndex) continue;
            if (g != e[f] && b.dom != e[f].dom && e[f].pointInside(d)) {
                a = e[f];
                h = -1;
                break;
            }
        }
        if (a && a != g) a.ondragover(b);
        if (a) a.ondragmove(b, d.sub(Vector2.getElementPosition(a.dom)));
        b.lastDragOver = a;
    }
    Drag.currentDraggable._onmousemove(d);
};
Drag._onmouseup = function (a) {
    document.onselectstart = null;
    if (Drag.currentDraggable) {
        Drag.currentDraggable._ondrop();
        Drag.currentDraggable = null;
    }
};

function Draggable(b) {
    if (!b) throw new Error('Element should be a DOM node');
    if (this == window) {
        if (b instanceof Array) {
            var a = [];
            b.each(function (c) {
                a.push(new Draggable(c));
            });
            return new Collection(Draggable, a);
        } else return new Draggable(b);
    } else {
        this.data = {};
        this.handles = [];
        this.dom = b;
        this.boundingBox = null;
        this.addHandle(this.dom);
    }
}
Draggable.prototype.destroy = function () {
    this.handles.each(function (a) {
        this.removeHandle(a.obj);
    }.bind(this));
    this.data = this.dom = null;
};
Draggable.prototype._onclick = function (event) {
    if (this.active) return Event.kill(event);
};
Draggable.prototype._ongrab = function (a) {
    this.ongrab();
    if (!this.scroller) this.scroller = new Scroller(Scroller.findScrollParent(this.dom));
    this.scroller.activate();
    if (this.active) {
        if (!this.oldPosition) this.oldPosition = this.dom.style.position;
        this.dom.style.position = this.absolute ? 'absolute' : 'relative';
        a.sub(this.cursorPositionVector).setElementPosition(this.dom);
    }
};
Draggable.prototype._onmousedown = function (event) {
    var a = $E(event).getTarget();
    if (DOM.isNode(a, ['input', 'select', 'textarea', 'object', 'embed'])) return true;
    var b = Vector2.getEventPosition(event);
    this.draggableInitialVector = Vector2.getElementPosition(this.dom);
    this.cursorPositionVector = b.sub(this.draggableInitialVector);
    Drag.grab(this, event);
    if (this.gutter) {
        this.cursorInitialVector = b;
    } else {
        this._setActive(true);
        this._ongrab(b);
    }
    return Event.kill(event);
};
Draggable.prototype._onmousemove = function (d) {
    if (!this.active) if (d.distanceTo(this.cursorInitialVector) >= this.gutter) {
        this._setActive(true);
        this._ongrab(d);
    }
    if (this.active) {
        var c = Vector2.getElementPosition(this.dom).sub(new Vector2(parseInt(this.dom.style.left ? this.dom.style.left : CSS.getStyle(this.dom, 'left'), 10) || 0, parseInt(this.dom.style.top ? this.dom.style.top : CSS.getStyle(this.dom, 'top'), 10) || 0));
        var e = d.sub(c).sub(this.cursorPositionVector);
        if (this.boundingBox) {
            var a = Rect.newFromVectors(e, Vector2.getElementDimensions(this.dom));
            a = a.boundWithin(this.boundingBox);
            e = a.getPositionVector(a);
            if (this.boundingBox.w() == 0) {
                var b = new Vector2(this.draggableInitialVector.x, e.y, 'document');
            } else if (this.boundingBox.h() == 0) {
                var b = new Vector2(e.x, this.draggableInitialVector.y, 'document');
            } else var b = e;
        } else var b = e;
        b.setElementPosition(this.dom);
        this.ondrag(d);
    }
};
Draggable.prototype._ondrop = function () {
    this.scroller && this.scroller.deactivate();
    if (this.active) {
        (function () {
            this._setActive(false);
        }).bind(this).defer();
        this.ondrop();
        if (this.lastDragOver) this.lastDragOver.ondrop(this);
    }
};
Draggable.prototype.killDrag = function () {
    this._setActive(false);
    Drag._onmouseup();
};
Draggable.prototype.setBoundingBox = function (a) {
    this.boundingBox = a;
    return this;
};
Draggable.prototype.resetPosition = function () {
    this.dom.style.position = this.oldPosition;
    this.oldPosition = null;
    this.dom.style.left = '';
    this.dom.style.top = '';
    return this;
};
Draggable.prototype.setUseAbsolute = function (a) {
    this.absolute = a;
    return this;
};
Draggable.prototype.ondrag = bagofholding;
Draggable.prototype.setDragHandler = function (a) {
    this.ondrag = a;
    return this;
};
Draggable.prototype.ongrab = bagofholding;
Draggable.prototype.setGrabHandler = function (a) {
    this.ongrab = a;
    return this;
};
Draggable.prototype.ondrop = bagofholding;
Draggable.prototype.setDropHandler = function (a) {
    this.ondrop = a;
    return this;
};
Draggable.prototype.gutter = 0;
Draggable.prototype.setGutter = function (a) {
    this.gutter = a;
    return this;
};
Draggable.prototype.setNamespace = function (a) {
    this.namespace = a;
    return this;
};
Draggable.prototype.handles = null;
Draggable.prototype.addHandle = function (a) {
    if (this.handles.length == 1 && this.handles[0].obj == this.dom) this.removeHandle(this.dom);
    this.handles.push({
        obj: a,
        evt: [Event.listen(a, 'mousedown', this._onmousedown.bind(this)), Event.listen(a, 'click', this._onclick.bind(this)), Event.listen(a, 'drag', Event.kill), Event.listen(a, 'selectstart', Event.kill)]
    });
    return this;
};
Draggable.prototype.removeHandle = function (a) {
    this.handles = this.handles.filter(function (b) {
        if (b.obj != a) {
            return true;
        } else {
            b.evt.each(function (c) {
                c.remove();
            });
            return false;
        }
    });
};
Draggable.prototype.getDOM = function () {
    return this.dom;
};
Draggable.prototype.setKey = function (a, b) {
    this.data[a] = b;
    return this;
};
Draggable.prototype.getKey = function (a) {
    return this.data[a];
};
Draggable.prototype._setActive = function (b) {
    this.dom.activeDrag = this.active = b;
    for (var a = 0; a < this.handles.length; a++) this.handles[a].obj.activeDrag = b;
};

function Droppable(b) {
    if (!b) throw new Error('Element should be a DOM node');
    if (this == window) {
        if (b instanceof Array) {
            var a = [];
            b.each(function (c) {
                a.push(new Droppable(c));
            });
            return new Collection(Droppable, a);
        } else return new Droppable(b);
    } else {
        this.data = {};
        this.dom = b;
        this.namespace = null;
    }
}
Droppable.prototype.destroy = function () {
    if (this.namespace) Drag.removeDroppable(this.namespace, this);
    this.data = this.dom = null;
};
Droppable.prototype.setNamespace = function (a) {
    if (this.namespace) Drag.removeDroppable(a, this);
    this.namespace = a;
    Drag.addDroppable(a, this);
    return this;
};
Droppable.prototype.zIndex = 0;
Droppable.prototype.setZIndex = function (a) {
    this.zIndex = a;
    return this;
};
Droppable.prototype.pointInside = function (b) {
    var a = Vector2.getElementPosition(this.dom);
    return a.x <= b.x && this.dom.offsetWidth + a.x > b.x && a.y <= b.y && this.dom.offsetHeight + a.y > b.y;
};
Droppable.prototype.ondragover = bagofholding;
Droppable.prototype.setDragOverHandler = function (a) {
    this.ondragover = a;
    return this;
};
Droppable.prototype.ondragmove = bagofholding;
Droppable.prototype.setDragMoveHandler = function (a) {
    this.ondragmove = a;
    return this;
};
Droppable.prototype.ondrop = bagofholding;
Droppable.prototype.setDropHandler = function (a) {
    this.ondrop = a;
    return this;
};
Droppable.prototype.getDOM = Draggable.prototype.getDOM;
Droppable.prototype.setKey = Draggable.prototype.setKey;
Droppable.prototype.getKey = Draggable.prototype.getKey;

function SortableGroup() {
    this.namespace = 'sortable' + (++SortableGroup.instanceCount);
    this.draggables = {};
    this.droppables = {};
    this.sortables = {};
    this.linkedGroups = [];
    this.linkedGroups.onbeforelinkjump = bagofholding;
    this.linkedGroups.onlinkjump = bagofholding;
    this.rootNode = null;
    this.boundingBox = null;
    this.neverEmpty = false;
    this.hasEmptyMessage = false;
    this.isDroppable = true;
    this.requireSameParent = true;
    this.anchor = null;
}
SortableGroup.instanceCount = 0;
SortableGroup.prototype = {
    gutter: 15,
    onbeforegrabcallback: bagofholding,
    onbeforedragover: bagofholding,
    ondragover: bagofholding,
    ondropcallback: bagofholding,
    ongrabcallback: bagofholding,
    onorderchange: bagofholding,
    addEmptyMessage: function (b, c) {
        var a = 'placeholder';
        if (b.parentNode != c) DOM.appendContent(c, b);
        this._initializeAdded(a, b);
        this.hasEmptyMessage = true;
        this.sortables[a] = b;
        this.droppables[a] = (new Droppable(b)).setNamespace(this.namespace).setDragOverHandler(this._dragOverHandlerShim.bind(this, a));
        return this;
    },
    addSortable: function (b, c, a) {
        this._initializeAdded(b, c);
        this.sortables[b] = c;
        this.draggables[b] = (new Draggable(c)).setNamespace(this.namespace).setGutter(this.gutter).setUseAbsolute(true).setGrabHandler(this.grabHandler.bind(this, b)).setDropHandler(this.dropHandler.bind(this, b)).setKey('key', b).setBoundingBox(this.boundingBox);
        if (a) this.draggables[b].addHandle(a);
        this.droppables[b] = (new Droppable(c)).setNamespace(this.namespace).setDragOverHandler(this._dragOverHandlerShim.bind(this, b));
        return this;
    },
    destroy: function () {
        for (var c in this.droppables) this.droppables[c].destroy();
        for (var b in this.draggables) this.draggables[b].destroy();
        this.droppables = this.draggables = this.rootNode = null;
        this.linkedGroups.remove(this);
        for (var a = 0; a < this.linkedGroups.length; a++) this.linkedGroups[a].linkedGroups = this.linkedGroups;
    },
    dragOverHandler: function (f, d) {
        if (!this.isDroppable && !this.anchor) return;
        var h = false;
        if (!(d in this.draggables)) {
            this.linkedGroups.onbeforelinkjump.call(this, d);
            if (!this.migrateLinkedSortable(d)) throw new Error('Draggable dropped onto a foreign droppable!');
            h = true;
        }
        var a = true,
            b = this.getSortables(),
            c = this.sortables[d],
            e = this.sortables[f];
        if (!this.anchor) {
            var i = b.length;
            for (var g = 0; g < i; g++) if (b[g] == e) {
                break;
            } else if (b[g] == c) {
                a = false;
                break;
            }
        } else e = this.anchor;
        this.onbeforedragover(c, e);
        var j = this.linkedGroups.placeholder;
        this.insertPlaceholder(j, e, a || this.anchor);
        j.parentNode.insertBefore(c, j);
        this.ondragover(c, e);
        if (h) this.linkedGroups.onlinkjump.call(this, d);
    },
    dropHandler: function (a) {
        if (this._checkLastRemaining()) {
            this.draggables[a].resetPosition();
            return;
        }
        var c = this.linkedGroups.placeholder;
        CSS.removeClass(this.sortables[a], 'drag');
        this.draggables[a].resetPosition();
        c.parentNode.insertBefore(this.sortables[a], c);
        c.parentNode.removeChild(c);
        for (var b = 0; b < this.linkedGroups.length; b++) if (this.linkedGroups[b].anchor) delete this.linkedGroups[b].anchor;
        this.ondropcallback(a, this.sortables[a]);
        this.onorderchange();
    },
    getOrder: function () {
        var d = [],
            a = this.getSortables();
        for (var b = 0; b < a.length; b++) for (var c in this.sortables) if (this.sortables[c] == a[b]) {
            d.push(c);
            break;
        }
        return d;
    },
    getSortables: function () {
        return this.rootNode ? this.rootNode.childNodes : [];
    },
    grabHandler: function (a) {
        if (this._checkLastRemaining()) {
            this.draggables[a].killDrag();
            return;
        }
        this.onbeforegrabcallback(this.sortables[a], a);
        var b = this.linkedGroups.placeholder;
        var c = this.sortables[a];
        CSS.setClass(b, c.className);
        CSS.addClass(b, 'droppable_placeholder');
        CSS.addClass(c, 'drag');
        Vector2.getElementDimensions(c).setElementDimensions(b);
        c.parentNode.insertBefore(b, c);
        this.ongrabcallback(this.sortables[a], a);
        if (!this.isDroppable) {
            this.anchor = c.nextSibling;
            if (!this.anchor) {
                this.anchor = $N('div');
                c.parentNode.appendChild(this.anchor);
            }
        }
    },
    insertPlaceholder: function (b, c, a) {
        if (a) {
            DOM.insertBefore(b, c);
        } else DOM.insertAfter(c, b);
    },
    keyExists: function (a) {
        return this.sortables[a];
    },
    link: function (d) {
        d.linkedGroups = this.linkedGroups;
        if (!this.linkedGroups.length) this.linkedGroups.push(this);
        this.linkedGroups.push(d);
        for (var b = 0; b < this.linkedGroups.length; b++) if (this.linkedGroups[b].namespace != this.namespace) {
            this.linkedGroups[b].namespace = this.namespace;
            for (var c in this.linkedGroups[b].droppables) {
                this.linkedGroups[b].droppables[c].setNamespace(this.namespace);
                var a = this.linkedGroups[b].draggables[c];
                a && a.setNamespace(this.namespace);
            }
        }
        return this;
    },
    migrateLinkedSortable: function (b) {
        for (var a = 0; a < this.linkedGroups.length; a++) if (b in this.linkedGroups[a].draggables) {
            this.sortables[b] = this.linkedGroups[a].sortables[b];
            this.draggables[b] = this.linkedGroups[a].draggables[b];
            this.draggables[b].setGrabHandler(this.grabHandler.bind(this, b)).setDropHandler(this.dropHandler.bind(this, b));
            this.droppables[b] = this.linkedGroups[a].droppables[b];
            this.droppables[b].setDragOverHandler(this._dragOverHandlerShim.bind(this, b));
            delete this.linkedGroups[a].sortables[b];
            delete this.linkedGroups[a].draggables[b];
            delete this.linkedGroups[a].droppables[b];
            return true;
        }
        return false;
    },
    removeSortable: function (a) {
        if (a in this.sortables) {
            this.draggables[a].destroy();
            this.droppables[a].destroy();
            delete this.draggables[a];
            delete this.droppables[a];
            delete this.sortables[a];
        }
    },
    setBeforeGrabCallback: function (a) {
        this.onbeforegrabcallback = a;
        return this;
    },
    setBoundingBox: function (a) {
        this.boundingBox = a;
        for (var b in this.draggables) this.draggables[b].setBoundingBox(this.boundingBox);
        return this;
    },
    setBeforeDragOverCallback: function (a) {
        this.onbeforedragover = a;
        return this;
    },
    setDragOverCallback: function (a) {
        this.ondragover = a;
        return this;
    },
    setDropCallback: function (a) {
        this.ondropcallback = a;
        return this;
    },
    setDroppable: function (a) {
        this.isDroppable = a;
        return this;
    },
    setGrabCallback: function (a) {
        this.ongrabcallback = a;
        return this;
    },
    setBeforeLinkJumpHandler: function (a) {
        this.linkedGroups.onbeforelinkjump = a;
        return this;
    },
    setInsertPlaceholderHandler: function (a) {
        this.insertPlaceholder = a;
    },
    setLinkJumpHandler: function (a) {
        this.linkedGroups.onlinkjump = a;
        return this;
    },
    setNeverEmpty: function (a) {
        this.neverEmpty = a;
    },
    setOrderChangeHandler: function (a) {
        this.onorderchange = a;
        return this;
    },
    setRequireSameParent: function (a, b) {
        this.requireSameParent = b;
    },
    setSortablesGetter: function (a) {
        this.getSortables = a;
    },
    _checkLastRemaining: function (a) {
        var b = this.hasEmptyMessage ? 2 : 1;
        return this.neverEmpty && this.getSortables().length == b;
    },
    _dragOverHandlerShim: function (b, a) {
        this.dragOverHandler(b, a.getKey('key'));
    },
    _initializeAdded: function (a, b) {
        if (this.rootNode === null) {
            this.rootNode = b.parentNode;
            if (!this.linkedGroups.placeholder) this.linkedGroups.placeholder = $N(b.tagName, {
                className: 'dragPlaceholder',
                style: {
                    padding: '0px'
                }
            });
        } else if (this.requireSameParent && this.rootNode != b.parentNode) throw new Error('All sortables of a collection must share the same parentNode');
        if (a in this.draggables) throw new Error('All sortables must have a unique key');
    }
};

function UrlDetector(a) {
    this.element = a;
    this.lastCharCount = 0;
    this.lastScrapedURL = null;
    this.detectionInterval = null;
    this.suppressDetection = bagofholding;
    Event.listen(a, 'focus', this.startDetectionInterval.bind(this));
    Event.listen(a, 'blur', this.stopDetectionInterval.bind(this));
    var b = DOM.isNode(this.element, ['input', 'textarea']);
    copy_properties(this, {
        getText: b ?
        function () {
            return this.element.value;
        } : function () {
            return DOM.getText(this.element);
        },
        setText: b ?
        function (c) {
            this.element.value = c;
        } : function (c) {
            DOM.setContent(this.element, c);
        }
    });
}
UrlDetector.mixin('Arbiter', {
    getText: bagofholding,
    setText: bagofholding,
    setSuppressDetectionCheck: function (a) {
        this.suppressDetection = a;
    },
    startDetectionInterval: function () {
        if (this.detectionInterval || this.suppressDetection()) return;
        this.detectionInterval = setInterval(this.detectionIntervalFire.bind(this), 250);
    },
    stopDetectionInterval: function () {
        this.detectionInterval = clearInterval(this.detectionInterval);
    },
    detectionIntervalFire: function () {
        if (this.suppressDetection()) return;
        var a = this.getText().length;
        if ((a - this.lastCharCount) > 5 || (this.lastCharCount == 0 && a > 1)) var b = true;
        this.lastCharCount = a;
        var c = this.detectUrl(b);
        if (c) this.inform('urlDetected', c);
    },
    detectUrl: function (d) {
        var g = '',
            f = this.getText(),
            e = -1,
            a = -1;
        if (d) {
            g = f.match(/(?:^|[^a-z])(www\.\S+)/mi);
            if (g) {
                e = f.indexOf(g[1]);
                a = e + g[1].length;
                g = "http://" + g[1];
            } else {
                var c = f.match(/(http|fb):\/\/\S*/i);
                if (c) {
                    g = c[0];
                    e = f.indexOf(c[0]);
                    a = e + c[0].length;
                }
            }
        } else {
            g = f.match(/(?:^|[^a-z])(www\.\S+[\s|\)|\!])/mi);
            if (g) {
                e = f.indexOf(g[1]);
                a = e + g[1].length;
                g = "http://" + g[1];
            } else {
                var c = f.match(/(http|fb):\/\/\S*[\s|\)|\!]/i);
                if (c) {
                    g = c[0];
                    e = f.indexOf(c[0]);
                    a = e + c[0].length;
                }
            }
        }
        if (g) {
            g = g.replace(/[\s|\)]/g, '');
            while (true) {
                var b = g.charAt(g.length - 1);
                if (!b.match(/[,|.|\!]/)) break;
                g = g.substr(0, g.length - 1);
            }
            if (g != this.lastScrapedURL) {
                this.lastScrapedURL = g;
                if (g.search('fb:') == 0) this.setText(f.substr(0, e) + f.substr(a));
            } else g = '';
        }
        return g;
    }
});

if (window.Bootloader) {
    Bootloader.done(["js\/7hnggt5u7q4g4gkc.pkg.js"]);
}


/*
HTTP Host: static.ak.fbcdn.net
Generated: October 5th 2010 2:44:40 PM PDT
Machine: 10.30.148.193
*/

if (window.CavalryLogger) {
    CavalryLogger.start_js(["js\/al30yejsyzccgsok.pkg.js"]);
}

var ChatHomePage = {
    rankedFriends: [],
    chatFriends: [],
    offlineFriends: [],
    init: function (d, b, c, a, e) {
        this.rankedFriends = d;
        this.chatFriends = b;
        this.offlineFriends = c;
        this.initToken = Arbiter.subscribe(ChatBuddyList.BUDDY_LIST_INITIALIZED, this.buddyListInitialized.bind(this, a, e));
        this.listChangedToken = Arbiter.subscribe(ChatBuddyList.AVAILABILITY_CHANGED, this.availableListChanged.bind(this));
        this.visibilityChangedToken = Arbiter.subscribe(ChatOptions.VISIBILITY_CHANGED, this.visibilityChanged.bind(this));
        onleaveRegister(this.onunload.bind(this));
    },
    onunload: function () {
        Arbiter.unsubscribe(this.initToken);
        Arbiter.unsubscribe(this.listChangedToken);
        Arbiter.unsubscribe(this.visibilityChangedToken);
        buddyList.forceRetrieveAll(false);
    },
    buddyListInitialized: function (a, c) {
        buddyList.forceRetrieveAll(true);
        for (var b in a) buddyList.availableList[b] = a[b];
        for (var b in c) ChatUserInfos[b] = c[b];
    },
    visibilityChanged: function () {
        var a = $('fbFriendsSidebar');
        CSS.conditionClass(a, 'isOnline', chatOptions.visibility);
        if (!chatOptions.visibility) {
            var b = DOM.find(a, '.wrapper');
            CSS.removeClass(b, 'hasOnlineFriends');
            if (this.offlineFriends) this.availableListChanged();
        }
    },
    availableListChanged: function () {
        var b = 0;
        var o = [];
        if (chatOptions.visibility) {
            var m = {};
            var f = [];
            this.fillToRenderAndIdleLists(this.NUM_RENDERED_FRIENDS, this.rankedFriends, m, o, f);
            var k = this.NUM_RENDERED_FRIENDS - (o.length + f.length);
            if (k > 0) this.fillToRenderAndIdleLists(k, buddyList.getAvailableIds(), m, o, f);
            if (f.length) o = o.concat(f);
        }
        if (are_equal(o, this.chatFriends)) return;
        var n = buddyList._sort(o);
        var l = ge('fbFriendsSidebar');
        if (!l) return;
        var p = DOM.find(l, '.friendsList');
        var q = CSS.hasClass(p, 'facepileFriendsList');
        if (q) p = p.firstChild;
        var c = p.childNodes[0];
        var j = [c];
        for (var d = 0; d < n.length; d++) {
            var e = n[d];
            if (!ChatUserInfos[e]) continue;
            var h = c.cloneNode(true);
            j.push(this.renderChatRow(h, e, false));
        }
        if (k) {
            if (o.length && this.offlineFriends.length) j.push($N('li', {
                className: 'separator'
            }));
            var i = this.offlineFriends.length;
            for (var g = 0; g < i && k; g++) {
                var e = this.offlineFriends[g];
                if (n.contains(e)) continue;
                if (!ChatUserInfos[e]) continue;
                var h = c.cloneNode(true);
                j.push(this.renderChatRow(h, e, true));
                k--;
            }
        }
        var a = DOM.find(l, '.wrapper');
        CSS.conditionClass(a, 'hasOnlineFriends', o.length);
        DOM.setContent(p, j);
        CSS.show(p);
        this.chatFriends = o;
    },
    fillToRenderAndIdleLists: function (f, c, g, h, d) {
        for (var e = 0; e < c.length && (f > 0); e++) {
            var b = c[e];
            if (!g[b]) {
                var a = buddyList.getAvailability(b);
                if (a) {
                    if (!a.i) {
                        h.push(b);
                    } else d.push(b);
                    g[b] = true;
                    f--;
                }
            }
        }
    },
    renderChatRow: function (a, b, c) {
        CSS.show(a);
        var d = DOM.find(a, 'a');
        if (c) {
            CSS.addClass(a, 'offline');
        } else {
            Event.listen(d, 'click', function (f) {
                chatDisplay.focusTab(f, true);
                return false;
            }.bind(this, b));
            CSS.conditionClass(a, 'idle', buddyList.getAvailability(b).i);
        }
        d.setAttribute('href', chatDisplay.profileURL + '?id=' + b);
        DOM.find(a, 'img').src = ChatUserInfos[b].thumbSrc;
        var e = DOM.scry(a, 'div.UIImageBlock_Content');
        if (e[0]) {
            DOM.setContent(e[0], buddyList.shortenedBuddyName(ChatUserInfos[b].name));
        } else Bootloader.loadComponents('TooltipLink', function () {
            TooltipLink.setTooltipText(d, ChatUserInfos[b].name);
        });
        return a;
    }
};
var PrivacyBaseValue = {
    GROUP: 113,
    FACEBOOK_EMPLOYEES: 112,
    CUSTOM: 111,
    OPEN: 100,
    EVERYONE: 80,
    NETWORKS_FRIENDS_OF_FRIENDS: 60,
    NETWORKS_FRIENDS: 55,
    FRIENDS_OF_FRIENDS: 50,
    ALL_FRIENDS: 40,
    SELF: 10,
    NOBODY: 0
};
var PrivacyFriendsValue = {
    EVERYONE: 80,
    NETWORKS_FRIENDS: 55,
    FRIENDS_OF_FRIENDS: 50,
    ALL_FRIENDS: 40,
    SOME_FRIENDS: 30,
    SELF: 10,
    NO_FRIENDS: 0
};
var PrivacySpecialPreset = {
    ONLY_CORP_NETWORK: 200,
    COLLEGE_NETWORK_FRIENDS_OF_FRIENDS: 201,
    COLLEGE_NETWORK_FRIENDS: 202
};
var PrivacyNetworkTypes = {
    TYPE_COLLEGE: 1,
    TYPE_HS: 2,
    TYPE_CORP: 3,
    TYPE_GEO: 4,
    TYPE_MANAGED: 14,
    TYPE_TEST: 50
};
var PrivacyNetworksAll = 1;
copy_properties(PrivacyBaseValue, PrivacySpecialPreset);

function PrivacyModel() {
    this.value = PrivacyBaseValue.ALL_FRIENDS;
    this.friends = PrivacyFriendsValue.NO_FRIENDS;
    this.networks = [];
    this.objects = [];
    this.lists = [];
    this.lists_x = [];
    this.list_anon = 0;
    this.ids_anon = [];
    this.list_x_anon = 0;
    this.ids_x_anon = [];
    this.tdata = {};
    return this;
}
copy_properties(PrivacyModel.prototype, {
    init: function (k, a, h, i, f, g, d, b, e, c, j) {
        this.value = k;
        this.friends = a;
        this.networks = h.clone();
        this.objects = i.clone();
        this.lists = f.clone();
        this.lists_x = g.clone();
        this.list_anon = d;
        this.ids_anon = b.clone();
        this.list_x_anon = e;
        this.ids_x_anon = c.clone();
        j = j || {};
        copy_properties(this.tdata, j);
    },
    clone: function () {
        var a = new PrivacyModel();
        a.init(this.value, this.friends, this.networks, this.objects, this.lists, this.lists_x, this.list_anon, this.ids_anon, this.list_x_anon, this.ids_x_anon, this.tdata);
        return a;
    },
    getData: function () {
        var b = ['value', 'friends', 'networks', 'objects', 'lists', 'lists_x', 'list_anon', 'ids_anon', 'list_x_anon', 'ids_x_anon'];
        var d = {};
        for (var c = 0; c < b.length; ++c) {
            var a = b[c];
            d[a] = this[a];
        }
        return d;
    }
});
var Menu = function () {
    var i = 'menu:mouseover';
    var a = null;

    function b(k) {
        return Parent.byClass(k, 'uiMenu');
    }
    function c(k) {
        return Parent.byClass(k, 'uiMenuItem');
    }
    function d(k) {
        if (document.activeElement) {
            var l = c(document.activeElement);
            return k.indexOf(l);
        }
        return -1;
    }
    function e(k) {
        return DOM.find(k, 'a.itemAnchor');
    }
    function f(k) {
        return CSS.hasClass(k, 'checked');
    }
    function g(k) {
        return !CSS.hasClass(k, 'disabled');
    }
    function h(event) {
        var k = c(event.getTarget());
        k && Menu.focusItem(k);
    }
    function j(k) {
        Menu.inform(Menu.ITEM_SELECTED, {
            menu: b(k),
            item: k
        });
    }
    onloadRegister(function () {
        var k = {};
        k.click = function (event) {
            var n = c(event.getTarget());
            if (n && g(n)) {
                j(n);
                var l = e(n);
                var m = l.href;
                var o = l.getAttribute('rel');
                return (o && o !== 'ignore') || (m && m.charAt(m.length - 1) !== '#');
            }
        };
        k.keydown = function (event) {
            var u = event.getTarget();
            if (!a || DOM.isNode(u, ['input', 'textarea'])) return;
            var q = Event.getKeyCode(event);
            switch (q) {
            case KEYS.UP:
            case KEYS.DOWN:
                var m = Menu.getEnabledItems(a);
                var o = d(m);
                Menu.focusItem(m[o + (q === KEYS.UP ? -1 : 1)]);
                return false;
            case KEYS.SPACE:
                var t = c(u);
                if (t) {
                    j(t);
                    event.prevent();
                }
                break;
            default:
                var l = String.fromCharCode(q).toLowerCase();
                var p = Menu.getEnabledItems(a);
                var o = d(p);
                var n = o;
                var r = p.length;
                while ((~o && (n = ++n % r) !== o) || (!~o && ++n < r)) {
                    var s = Menu.getItemLabel(p[n]);
                    if (s && s.charAt(0).toLowerCase() === l) {
                        Menu.focusItem(p[n]);
                        return false;
                    }
                }
            }
        };
        Event.listen(document.body, k);
    });
    return copy_properties(new Arbiter(), {
        ITEM_SELECTED: 'menu/item-selected',
        ITEM_TOGGLED: 'menu/item-toggled',
        focusItem: function (k) {
            if (k) {
                this._removeSelected(b(k));
                CSS.addClass(k, 'selected');
                g(k) && e(k).focus();
            }
        },
        getEnabledItems: function (k) {
            return Menu.getItems(k).filter(g);
        },
        getCheckedItems: function (k) {
            return Menu.getItems(k).filter(f);
        },
        getItems: function (k) {
            return DOM.scry(k, 'li.uiMenuItem');
        },
        getItemLabel: function (k) {
            return k.getAttribute('data-label', 2) || '';
        },
        isItemChecked: function (k) {
            return CSS.hasClass(k, 'checked');
        },
        register: function (k) {
            k = b(k);
            if (!DataStore.get(k, i)) DataStore.set(k, i, Event.listen(k, 'mouseover', h));
            a = k;
        },
        setItemEnabled: function (l, k) {
            if (!k && !DOM.scry(l, 'span.disabledAnchor')[0]) DOM.appendContent(l, $N('span', {
                className: 'itemAnchor disabledAnchor'
            }, HTML(e(l).innerHTML)));
            CSS.conditionClass(l, 'disabled', !k);
        },
        toggleItem: function (l) {
            var k = !Menu.isItemChecked(l);
            CSS.conditionClass(l, 'checked', k);
            e(l).setAttribute('aria-checked', k);
            Menu.inform(Menu.ITEM_TOGGLED, {
                menu: b(l),
                item: l,
                checked: k
            });
        },
        unregister: function (l) {
            l = b(l);
            var k = DataStore.remove(l, i);
            k && k.remove();
            a = null;
            this._removeSelected(l);
        },
        _removeSelected: function (k) {
            Menu.getItems(k).filter(function (l) {
                return CSS.hasClass(l, 'selected');
            }).each(function (l) {
                CSS.removeClass(l, 'selected');
            });
        }
    });
}();
var Selector = function () {
    var a;
    var k = false;

    function b(l) {
        return Parent.byClass(l, 'uiSelector');
    }
    function c(l) {
        return Parent.byClass(l, 'uiSelectorButton');
    }
    function d(l) {
        return DOM.find(l, 'a.uiSelectorButton');
    }
    function g(l) {
        return DOM.scry(l, 'select')[0];
    }
    function e(l) {
        return DOM.scry(l, 'ul.uiSelectorMenu')[0];
    }
    function f(l) {
        return DOM.find(l, 'div.uiSelectorMenuWrapper');
    }
    function h() {
        h = bagofholding;
        Menu.subscribe(Menu.ITEM_SELECTED, function (l, n) {
            if (!a || !n || n.menu !== e(a)) return;
            var o = i(a);
            var q = j(n.item);
            if (q) {
                var m = a;
                var r = Selector.inform('select', {
                    selector: m,
                    option: n.item
                });
                if (r === false) return;
                var p = Selector.isOptionSelected(n.item);
                if (o || !p) {
                    Selector.setSelected(m, Selector.getOptionValue(n.item), !p);
                    Selector.inform('toggle', {
                        selector: m,
                        option: n.item
                    });
                    Selector.inform('change', {
                        selector: m
                    });
                }
            }
            if (!o || !q) a && Selector.toggle(a);
        });
    }
    function i(l) {
        return CSS.hasClass(l, 'uiSelectorMultiple');
    }
    function j(l) {
        return CSS.hasClass(l, 'uiSelectorOption');
    }
    onloadRegister(function () {
        var l = {};
        l.click = function (event) {
            var m = c(event.getTarget());
            if (m) {
                Selector.toggle(m);
                return false;
            }
        };
        l.keydown = function (event) {
            var n = event.getTarget();
            if (DOM.isNode(n, ['input', 'textarea'])) return;
            switch (Event.getKeyCode(event)) {
            case KEYS.DOWN:
            case KEYS.SPACE:
            case KEYS.UP:
                k = true;
                if (c(n)) {
                    var m = b(n);
                    Selector.toggle(m);
                    return false;
                }
                break;
            case KEYS.ESC:
                k = true;
                if (a) {
                    Selector.toggle(a);
                    return false;
                }
                break;
            case KEYS.RETURN:
                k = true;
                break;
            }
        };
        l.keyup = function () {
            !
            function () {
                k = false;
            }.defer();
        };
        Event.listen(document.body, l);
    });
    return copy_properties(new Arbiter(), {
        attachMenu: function (o, l, m) {
            o = b(o);
            if (o) {
                a && Menu.unregister(e(a));
                DOM.setContent(f(o), l);
                a && Menu.register(e(o));
                if (m) {
                    var n = g(o);
                    if (n) DOM.replace(n, m);
                }
                return true;
            }
        },
        getOption: function (n, o) {
            var m = Selector.getOptions(n),
                l = m.length;
            while (l--) if (o === Selector.getOptionValue(m[l])) return m[l];
            return null;
        },
        getOptions: function (m) {
            var l = Menu.getItems(e(m));
            return l.filter(j);
        },
        getEnabledOptions: function (m) {
            var l = Menu.getEnabledItems(e(m));
            return l.filter(j);
        },
        getSelectedOptions: function (l) {
            return Menu.getCheckedItems(e(l));
        },
        getOptionText: function (l) {
            return Menu.getItemLabel(l);
        },
        getOptionValue: function (m) {
            var o = b(m);
            var n = g(o);
            var l = Selector.getOptions(o).indexOf(m);
            return l >= 0 ? n.options[l].value : '';
        },
        getValue: function (p) {
            var n = g(p);
            var m = n.options;
            if (!i(p)) return n.value;
            var q = [];
            for (var l = 0, o = m.length; l < o; l++) if (m[l].selected) q.push(m[l].value);
            return q;
        },
        isOptionSelected: function (l) {
            return Menu.isItemChecked(l);
        },
        setButtonLabel: function (o, m) {
            var l = d(o);
            var n = parseInt(l.getAttribute('data-length'), 10);
            m = m || l.getAttribute('data-label') || '';
            Button.setLabel(l, m);
            if (typeof m === 'string') {
                CSS.conditionClass(l, 'uiSelectorBigButtonLabel', m.length > n);
                if (n && m.length > n) {
                    l.setAttribute('title', m);
                } else l.removeAttribute('title');
            }
        },
        setButtonTooltip: function (n, m) {
            var l = d(n);
            TooltipLink.setTooltipText(l, m || l.getAttribute('data-tooltip') || '');
        },
        setOptionEnabled: function (m, l) {
            Menu.setItemEnabled(m, l);
        },
        setSelected: function (p, q, n) {
            n = n !== false;
            var m = Selector.getOption(p, q);
            if (!m) return;
            var l = Selector.isOptionSelected(m);
            if (n !== l) {
                if (!i(p) && !l) {
                    var o = Selector.getSelectedOptions(p)[0];
                    o && Menu.toggleItem(o);
                }
                Menu.toggleItem(m);
                Selector.updateSelector(p);
            }
        },
        listen: function (m, n, l) {
            return this.subscribe(n, function (p, o) {
                if (o.selector === m) return l(o, p);
            });
        },
        toggle: function (p) {
            p = b(p);
            if (!a || a !== p) CSS.addClass(p.firstChild, 'openToggler');
            var m = d(p);
            var o = e(p);
            if (!o) {
                var l = m.getAttribute('ajaxify');
                if (l) {
                    var q = $N('div', {
                        className: 'uiSelectorMenuWrapper'
                    }, HTML('<ul class="uiMenu uiSelectorMenu loading">' + '<li><span></span></li>' + '</ul>'));
                    DOM.appendContent(m.parentNode, q);
                    Bootloader.loadComponents('async', function () {
                        AsyncRequest.bootstrap(l, m);
                    });
                    o = e(p);
                }
            }
            h();
            var n = p === a;
            Toggler.toggle(m, function (r) {
                CSS.conditionClass(m, 'selected', r);
                if (r) {
                    a = p;
                    Menu.register(o);
                } else {
                    a = null;
                    Menu.unregister(o);
                }
                Selector.inform(r ? 'open' : 'close', {
                    selector: p
                });
            }.bind(this));
            !
            function () {
                if (!k) return;
                if (n) {
                    m.focus();
                } else {
                    var r = e(p);
                    var s = Menu.getCheckedItems(r);
                    if (!s.length) s = Menu.getEnabledItems(r);
                    Menu.focusItem(s[0]);
                }
            }.defer();
        },
        updateSelector: function (t) {
            var r = Selector.getOptions(t);
            var o = g(t).options;
            var q = [];
            for (var n = 0, p = r.length; n < p; n++) {
                var s = Selector.isOptionSelected(r[n]);
                o[n].selected = s;
                if (s) q.push(Selector.getOptionText(r[n]));
            }
            var l = CSS.hasClass(t, 'uiSelectorDynamicLabel');
            var m = CSS.hasClass(t, 'uiSelectorDynamicTooltip');
            if (l || m) {
                q = q.join(i(t) ? d(t).getAttribute('data-delimiter') : '');
                l && Selector.setButtonLabel(t, q);
                m && Selector.setButtonTooltip(t, q);
            }
        }
    });
}();

function BasePrivacyWidget(a, c, b) {
    this._controllerId = a;
    this._root = $(a);
    this._options = copy_properties(b || {}, c || {});
    this._formDataKey = 'privacy_data';
}
BasePrivacyWidget.mixin('Arbiter', {
    getData: function () {
        return this._model.getData();
    },
    _getPrivacyData: function (a) {
        a = a || this._fbid;
        var b = {};
        b[a] = this.getData();
        return b;
    },
    getRoot: function () {
        return this._root;
    },
    _initSelector: function (a) {
        this._selector = a;
        Selector.listen(a, 'select', function (b) {
            var c = Selector.getOptionValue(b.option);
            this._onMenuSelect(c);
        }.bind(this));
        Event.listen(a, 'click', function () {
            this.inform('menuActivated');
        }.bind(this));
    },
    _isCustomSetting: function (a) {
        return (a == PrivacyBaseValue.CUSTOM);
    },
    _updateSelector: function (a) {
        Selector.setSelected(this._selector, this._model.value);
        if (!this._isCustomSetting(this._model.value)) return;
        var b = Selector.getOption(this._selector, PrivacyBaseValue.CUSTOM + '');
        b.setAttribute('data-label', a || _tx("Custom"));
        Selector.updateSelector(this._selector);
    },
    _onPrivacyChanged: function () {
        this._saveFormData();
        this.inform('privacyChanged', this.getData());
        Arbiter.inform(UIPrivacyWidget.GLOBAL_PRIVACY_CHANGED_EVENT, {
            fbid: this._fbid,
            data: this.getData()
        });
    },
    _saveFormData: function () {
        var b = DOM.find(this._root, 'div.UIPrivacyWidget_Form');
        DOM.empty(b);
        var a = {};
        if (this._options.useLegacyFormData) {
            a[this._formDataKey] = this.getData();
        } else a[this._formDataKey] = this._getPrivacyData();
        Form.createHiddenInputs(a, b);
    }
});

function UIPrivacyWidget(a, b, h, c, e, g) {
    var f = {
        autoSave: false,
        saveAsDefaultFbid: 0,
        initialExplanation: '',
        useLegacyFormData: false
    };
    if (b == '0') b = 0;
    this.parent.construct(this, a, g, f);
    this._lists = c;
    this._networks = e;
    this._fbid = b;
    this._row = h;
    this._groups = {};
    for (var d in e) this._groups[e[d].fbid] = d;
    UIPrivacyWidget.instances[this._controllerId] = this;
}
copy_properties(UIPrivacyWidget, {
    GLOBAL_PRIVACY_CHANGED_EVENT: 'UIPrivacyWidget/globalPrivacyChanged',
    instances: {},
    getInstance: function (a) {
        return this.instances[a];
    }
});
UIPrivacyWidget.extend('BasePrivacyWidget');
UIPrivacyWidget.mixin('Arbiter', {
    init: function (a) {
        this._initSelector(a);
        this.setData(this._row, this._options.initialExplanation, true);
        this._saveFormData();
    },
    reset: function () {
        this._model = this._originalModel.clone();
        this._modelClone = this._originalModel.clone();
        this._updateSelector(this._options.initialExplanation);
        this._saveFormData();
        return this;
    },
    revert: function () {
        this._model = this._modelClone.clone();
        this._updateSelector(this._previousDescription);
        this._saveFormData();
        return this;
    },
    getValue: function () {
        return this._model.value;
    },
    getDefaultValue: function () {
        return this._originalModel.value;
    },
    isEveryonePrivacy: function () {
        return this._model.value == PrivacyBaseValue.EVERYONE;
    },
    dialogOpen: function () {
        return this._dialog && this._dialog.getRoot();
    },
    setData: function (b, a, c) {
        this._model = new PrivacyModel();
        this._model.init(b.value, b.friends, b.networks, b.objects, b.lists, b.lists_x, b.list_anon, b.ids_anon, b.list_x_anon, b.ids_x_anon, b.tdata);
        this._modelClone = this._model.clone();
        if (c) this._originalModel = this._model.clone();
        this._previousDescription = a;
        this._customModel = null;
        this._updateSelector(a);
    },
    setLists: function (a) {
        this._lists = a;
        return this;
    },
    setNetworks: function (a) {
        this._networks = a;
        return this;
    },
    _isCustomSetting: function (a) {
        return (a == PrivacyBaseValue.CUSTOM || a == PrivacyBaseValue.NETWORKS_FRIENDS_OF_FRIENDS || a == PrivacyBaseValue.SELF);
    },
    _onMenuSelect: function (b) {
        this._modelClone = this._model.clone();
        var a = this._isCustomSetting(this._model.value);
        var c = this._isCustomSetting(b);
        if (a && !c) this._customModel = this._model.clone();
        if (!(a && c)) {
            this._model.value = b;
            this._resetModelAuxiliaryData();
        }
        if (b == PrivacyBaseValue.CUSTOM) {
            if (this._customModel) {
                this._model = this._customModel.clone();
            } else if (this._modelClone.value != PrivacyBaseValue.CUSTOM) this._model.friends = PrivacyFriendsValue.ALL_FRIENDS;
            this._showDialog();
        } else {
            if (this._groups[b]) {
                this._model = new PrivacyModel();
                this._model.value = PrivacyBaseValue.CUSTOM;
                this._model.objects = [b];
            }
            this._onPrivacyChanged();
            if (this._options.autoSave) this._saveSetting();
        }
        this._updateSelector();
    },
    _showDialog: function () {
        if (!this._fbid) {
            this._model.list_x_anon = 0;
            this._model.list_anon = 0;
        }
        var a = {
            controller_id: this._controllerId,
            privacy_data: this.getData(),
            fbid: this._fbid,
            save_as_default_fbid: this._options.saveAsDefaultFbid
        };
        this._dialog = new Dialog().setAsync(new AsyncRequest('/ajax/privacy/privacy_widget_dialog.php').setData(a)).setModal(true).show();
        return false;
    },
    _resetModelAuxiliaryData: function () {
        if (this._model.value != PrivacyBaseValue.CUSTOM) {
            this._model.lists_x = this._model.lists = this._model.networks = this._model.ids_anon = this._model.ids_x_anon = [];
            this._model.list_x_anon = 0;
            this._model.list_anon = 0;
        }
    },
    _saveSetting: function (a) {
        a = a || this._fbid;
        new AsyncRequest('/ajax/privacy/widget_save.php').setData({
            privacy_data: this._getPrivacyData(a),
            fbid: a
        }).setHandler(this._handleResponse.bind(this)).setErrorHandler(this._handleError.bind(this)).send();
    },
    _handleResponse: function (b) {
        var a = b.getPayload();
        this.setData(a.privacy_row, a.explanation);
    },
    _handleError: function (a) {
        AsyncResponse.defaultErrorHandler(a);
        this.revert();
    }
});

if (window.Bootloader) {
    Bootloader.done(["js\/al30yejsyzccgsok.pkg.js"]);
}

/*
HTTP Host: f.static.ak.fbcdn.net
Generated: October 13th 2010 1:32:47 PM PDT
Machine: 10.138.16.184
*/

if (window.CavalryLogger) {
    CavalryLogger.start_js(["js\/2c1hw1cl9yhw4owo.pkg.js"]);
}

var XD = {
    _callbacks: [],
    _opts: {
        autoResize: false,
        allowShrink: true,
        channelUrl: null,
        hideOverflow: false,
        newResizeMethod: false,
        resizeTimeout: 100,
        resizeWidth: false,
        expectResizeAck: false
    },
    init: function (a) {
        this._opts = copy_properties(copy_properties({}, this._opts), a);
        if (this._opts.autoResize) this._startResizeMonitor();
        Arbiter.subscribe('Connect.Unsafe.resize.ack', function () {
            this._opts.gotResizeAck = true;
        }.bind(this), Arbiter.BEHAVIOUR_PERSISTANT);
    },
    send: function (b, a) {
        a = a || this._opts.channelUrl;
        if (!a) return;
        if (a.substr(0, 4) != 'http') return;
        var h = a + '&' + URI.implodeQuery(b),
            d = 'f' + (Math.random() * (1 << 30)).toString(16).replace('.', ''),
            c = document.body.appendChild(document.createElement('div')),
            g = false;
        c.style.position = 'absolute';
        c.style.top = '-10000px';
        c.style.width = '1px';
        c.style.height = '1px';
        XD._callbacks[d] = function () {
            if (g) {
                (function () {
                    c.parentNode.removeChild(c);
                }).defer(3000);
                delete XD._callbacks[d];
            }
        };
        if (ua.ie()) {
            var e = ('<iframe ' + ' src="' + h + '"' + ' onload="XD._callbacks.' + d + '()"' + '></iframe>');
            c.innerHTML = '<iframe src="javascript:false"></iframe>';
            g = true;
            (function () {
                c.innerHTML = e;
            }).defer();
        } else {
            var f = document.createElement('iframe');
            f.onload = XD._callbacks[d];
            c.appendChild(f);
            g = true;
            f.src = h;
        }
    },
    _computeSize: function () {
        var a = document.body,
            e = document.documentElement,
            h = 0,
            f;
        if (this._opts.newResizeMethod) {
            f = Math.max(Math.max(a.offsetHeight, a.scrollHeight) + a.offsetTop, Math.max(e.offsetHeight, e.scrollHeight) + e.offsetTop);
        } else {
            if (ua.ie()) {
                f = Math.max(a.offsetHeight, a.scrollHeight) + a.offsetTop;
            } else f = e.offsetHeight + e.offsetTop;
            if (window.Dialog) f = Math.max(f, Dialog.max_bottom);
        }
        if (this._opts.resizeWidth) {
            if (a.offsetWidth < a.scrollWidth) {
                h = a.scrollWidth + a.offsetLeft;
            } else {
                var d = a.childNodes;
                for (var g = 0; g < d.length; g++) {
                    var b = d[g];
                    var c = b.offsetWidth + b.offsetLeft;
                    if (c > h) h = c;
                }
            }
            if (XD.forced_min_width) h = Math.max(h, XD.forced_min_width);
            if (e.clientLeft > 0) h += (e.clientLeft * 2);
            if (e.clientTop > 0) f += (e.clientTop * 2);
        }
        return {
            width: h,
            height: f
        };
    },
    _startResizeMonitor: function () {
        var b, a = document.documentElement;
        if (this._opts.hideOverflow) a.style.overflow = 'hidden';
        (function () {
            var e = this._computeSize();
            if (!b || (this._opts.expectResizeAck && !this._opts.gotResizeAck) || (this._opts.allowShrink && b.width != e.width) || (!this._opts.allowShrink && b.width < e.width) || (this._opts.allowShrink && b.height != e.height) || (!this._opts.allowShrink && b.height < e.height)) {
                b = e;
                var d = {
                    type: 'resize',
                    height: e.height
                };
                if (e.width && e.width != 0) d.width = e.width;
                try {
                    if (URI(document.referrer).isFacebookURI() && window.parent != window && window.name && window.parent.location && URI(window.parent.location).isFacebookURI()) {
                        var iframes = window.parent.document.getElementsByTagName('iframe');
                        for (var i in iframes) if (iframes[i].name == window.name) {
                            if (this._opts.resizeWidth) iframes[i].width = d.width;
                            iframes[i].height = d.height;
                        }
                    } else this.send(d);
                } catch (c) {
                    this.send(d);
                }
            }
        }).bind(this).recur(this._opts.resizeTimeout);
    }
};
var UnverifiedXD = copy_properties({}, XD);
var Base64 = (function () {
    var c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    function d(e) {
        e = (e.charCodeAt(0) << 16) | (e.charCodeAt(1) << 8) | e.charCodeAt(2);
        return String.fromCharCode(c.charCodeAt(e >>> 18), c.charCodeAt((e >>> 12) & 63), c.charCodeAt((e >>> 6) & 63), c.charCodeAt(e & 63));
    }
    var a = '>___?456789:;<=_______' + '\0\1\2\3\4\5\6\7\b\t\n\13\f\r\16\17\20\21\22\23\24\25\26\27\30\31' + '______\32\33\34\35\36\37 !"#$%&\'()*+,-./0123';

    function b(e) {
        e = (a.charCodeAt(e.charCodeAt(0) - 43) << 18) | (a.charCodeAt(e.charCodeAt(1) - 43) << 12) | (a.charCodeAt(e.charCodeAt(2) - 43) << 6) | a.charCodeAt(e.charCodeAt(3) - 43);
        return String.fromCharCode(e >>> 16, (e >>> 8) & 255, e & 255);
    }
    return {
        encode: function (f) {
            f = unescape(encodeURI(f));
            var e = (f.length + 2) % 3;
            f = (f + '\0\0'.slice(e)).replace(/[\s\S]{3}/g, d);
            return f.slice(0, f.length + e - 2) + '=='.slice(e);
        },
        decode: function (g) {
            g = g.replace(/[^A-Za-z0-9+\/]/g, '');
            var f = (g.length + 3) & 3,
                e;
            g = (g + 'AAA'.slice(f)).replace(/..../g, b);
            g = g.slice(0, g.length + f - 3);
            try {
                return decodeURIComponent(escape(g));
            } catch (e) {
                throw new Error('Not valid UTF-8');
            }
        },
        encodeObject: function (e) {
            return Base64.encode(JSON.encode(e));
        },
        decodeObject: function (e) {
            return JSON.decode(Base64.decode(e));
        },
        encodeNums: function (e) {
            var f = "";
            e.each(function (g) {
                f += c.charAt((g >= 63) && 63 || (g > 0) && Math.floor(g) || 0);
            });
            return f;
        }
    };
})();

function ContextualDialog(a) {
    this.parent.construct(this);
}
ContextualDialog.extend('Dialog');
ContextualDialog.prototype = {
    setContext: function (a) {
        this._context = a;
        this._dirty();
        return this;
    },
    _buildDialogContent: function () {
        Bootloader.loadComponents('contextual-dialog-css', function () {
            CSS.addClass(this._obj, 'contextual_dialog');
            this._content = this._frame = $N('div', {
                className: 'contextual_dialog_content'
            });
            this._arrow = $N('div', {
                className: 'arrow'
            });
            DOM.setContent(this._popup, [this._content, this._arrow]);
        }.bind(this));
    },
    _resetDialogObj: function () {
        if (!this._context) return;
        var a = Vector2.getElementPosition(this._context);
        var c = this._context.offsetWidth,
            b = this._context.offsetHeight;
        var d = a.x,
            e = a.y + b;
        if (c < 64) d += c / 2 - 32;
        new Vector2(d, e, 'document').setElementPosition(this._popup);
    },
    _renderDialog: function (a) {
        if (window != top) this._auto_focus = false;
        this.parent._renderDialog(a);
    }
};
var Button = (function () {
    var a = 'uiButtonDisabled',
        b = 'button:blocker';

    function d(f) {
        var g = Parent.byClass(f, 'uiButton');
        if (!g) throw new Error('invalid use case');
        return g;
    }
    function e(f) {
        return DOM.isNode(f, 'a');
    }
    function c(f) {
        if (e(f)) throw new Error('invalid use case');
        return f;
    }
    return {
        getInputElement: function (f) {
            return DOM.find(c(d(f)), 'input');
        },
        isEnabled: function (f) {
            return !CSS.hasClass(c(d(f)), a);
        },
        setEnabled: function (i, g) {
            i = c(d(i));
            CSS.conditionClass(i, a, !g);
            var h = Button.getInputElement(i);
            h.disabled = !g;
            var f = DataStore.get(h, b);
            if (g) {
                if (f) {
                    f.remove();
                    DataStore.remove(h, b);
                }
            } else if (!f) DataStore.set(h, b, Event.listen(h, 'click', function (event) {
                event.kill();
            }, Event.Priority.URGENT));
        },
        setLabel: function (g, f) {
            g = d(g);
            if (e(g)) {
                var h = DOM.find(g, 'span.uiButtonText');
                DOM.setContent(h, f);
            } else Button.getInputElement(g).value = f;
            CSS.conditionClass(g, 'uiButtonNoText', !f);
        },
        setIcon: function (g, f) {
            if (!DOM.isNode(f)) return;
            CSS.addClass(f, 'customimg');
            g = d(g);
            var h = DOM.scry(g, '.img')[0];
            if (h) {
                DOM.replace(h, f);
            } else DOM.prependContent(g, f);
        }
    };
})();
WidgetArbiter = {
    _findSiblings: function () {
        if (WidgetArbiter._siblings) return;
        WidgetArbiter._siblings = [];
        for (var b = parent.frames.length - 1; b >= 0; b--) try {
            if (parent.frames[b] && parent.frames[b].Arbiter && parent.frames[b].Arbiter.inform) WidgetArbiter._siblings.push(parent.frames[b].Arbiter);
        } catch (a) {}
    },
    inform: function () {
        WidgetArbiter._findSiblings();
        var a = $A(arguments);
        WidgetArbiter._siblings.each(function (b) {
            b.inform.apply(b, a);
        });
    }
};

if (window.Bootloader) {
    Bootloader.done(["js\/2c1hw1cl9yhw4owo.pkg.js"]);
}


/*
HTTP Host: static.ak.fbcdn.net
Generated: October 8th 2010 4:02:34 PM PDT
Machine: 10.30.145.195
*/

if (window.CavalryLogger) {
    CavalryLogger.start_js(["js\/fbjs.js"]);
}

if (Object.prototype.eval) window.eval = Object.prototype.eval;
delete Object.prototype.eval;
delete Object.prototype.valueOf;

function fbjs_sandbox(a) {
    if (fbjs_sandbox.instances['a' + a]) return fbjs_sandbox.instances['a' + a];
    this.appid = a;
    this.pending_bootstraps = [];
    this.bootstrapped = false;
    fbjs_sandbox.instances['a' + a] = this;
}
fbjs_sandbox.instances = {};
fbjs_sandbox.prototype.bootstrap = function () {
    if (!this.bootstrapped) {
        var appid = this.appid;
        var code = ['a', appid, '_Math = new fbjs_math();', 'a', appid, '_Date = fbjs_date();', 'a', appid, '_String = new fbjs_string();', 'a', appid, '_RegExp = new fbjs_regexp();', 'a', appid, '_Ajax = fbjs_ajax(', appid, ');', 'a', appid, '_Dialog = fbjs_dialog(', appid, ');', 'a', appid, '_Facebook = new fbjs_facebook(', appid, ');', 'a', appid, '_Animation = new fbjs_animation();', 'a', appid, '_LiveMessage = new fbjs_livemessage(', appid, ');', 'a', appid, '_document = new fbjs_main(', appid, ');', 'a', appid, '_undefined = undefined;', 'a', appid, '_console = new fbjs_console();', 'a', appid, '_setTimeout = fbjs_sandbox.set_timeout;', 'a', appid, '_setInterval = fbjs_sandbox.set_interval;', 'a', appid, '_escape = encodeURIComponent;', 'a', appid, '_unescape = decodeURIComponent;'];
        for (var i in {
            clearTimeout: 1,
            clearInterval: 1,
            parseFloat: 1,
            parseInt: 1,
            isNaN: 1,
            isFinite: 1
        }) code = code.concat(['a', appid, '_', i, '=', i, ';']);
        eval(code.join(''));
    }
    try {
        for (var i = 0, il = this.pending_bootstraps.length; i < il; i++) eval_global(this.pending_bootstraps[i]);
    } finally {
        fbjs_sandbox.clean_mess();
    }
    this.pending_bootstraps = [];
    this.bootstrapped = true;
};
fbjs_sandbox.prototype.setBridgeHash = function (a) {
    this.bridgeHash = a;
    return this;
};
fbjs_sandbox.getSandbox = function (a) {
    return fbjs_sandbox.instances['a' + a];
};
fbjs_sandbox.loadScripts = function (a) {
    script = a.shift(0);
    if (!script) return false;
    if (script.inline) {
        eval_global(script.inline);
        fbjs_sandbox.loadScripts(a);
    } else loadExternalJavascript(script.src, fbjs_sandbox.loadScripts.bind(null, a));
};
var $FBJS = (function () {
    function d(e) {
        if (e == window) {
            return null;
        } else if (e.ownerDocument === document) {
            fbjs_console.error('ref called with a DOM object!');
            return fbjs_dom.get_instance(e);
        } else {
            if (ua.safari() < 528.16 && (typeof e == 'object') && !(e instanceof Object)) return null;
            return e;
        }
    }
    function c(e) {
        return (e instanceof Object || b[e]) ? '__unknown__' : e;
    }
    var b = {
        caller: true,
        $FBJS: true
    };

    function a(e) {
        var g = [];
        for (var f = 0; f < e.length; f++) g.push(e[f]);
        return g;
    }
    return ({
        arg: a,
        idx: c,
        ref: d
    });
})();
(function () {
    var a = String.prototype.replace,
        b = String.prototype.toLowerCase;
    fbjs_sandbox.safe_string = function (c) {
        String.prototype.replace = a;
        String.prototype.toLowerCase = b;
        return c + '';
    };
})();
fbjs_sandbox.clean_mess = function () {
    delete Function.prototype.bind.call;
    delete Function.prototype.bind.apply;
};
fbjs_sandbox.set_timeout = function (a, b) {
    if (typeof a != 'function') {
        fbjs_console.error('setTimeout may not be used with a string. Please enclose your event in an anonymous function.');
    } else return setTimeout(function () {
        try {
            a();
        } finally {
            fbjs_sandbox.clean_mess();
        }
    }, b);
};
fbjs_sandbox.set_interval = function (b, a) {
    if (typeof b != 'function') {
        fbjs_console.error('setInterval may not be used with a string. Please enclose your event in an anonymous function.');
    } else return setInterval(function () {
        try {
            b();
        } finally {
            fbjs_sandbox.clean_mess();
        }
    }, a);
};

function fbjs_main(a) {
    fbjs_private.get(this).appid = a;
}
fbjs_main.allowed_elements = {
    a: true,
    abbr: true,
    acronym: true,
    address: true,
    b: true,
    br: true,
    bdo: true,
    big: true,
    blockquote: true,
    caption: true,
    center: true,
    cite: true,
    code: true,
    del: true,
    dfn: true,
    div: true,
    dl: true,
    dd: true,
    dt: true,
    em: true,
    fieldset: true,
    font: true,
    form: true,
    h1: true,
    h2: true,
    h3: true,
    h4: true,
    h5: true,
    h6: true,
    hr: true,
    i: true,
    img: true,
    input: true,
    ins: true,
    iframe: true,
    kbd: true,
    label: true,
    legend: true,
    li: true,
    ol: true,
    option: true,
    optgroup: true,
    p: true,
    pre: true,
    q: true,
    s: true,
    samp: true,
    select: true,
    small: true,
    span: true,
    strike: true,
    strong: true,
    sub: true,
    sup: true,
    table: true,
    textarea: true,
    tbody: true,
    td: true,
    tfoot: true,
    th: true,
    thead: true,
    tr: true,
    tt: true,
    u: true,
    ul: true
};
fbjs_main.allowed_editable = {
    embed: true,
    object: true
};
fbjs_main.allowed_events = {
    focus: true,
    click: true,
    mousedown: true,
    mouseup: true,
    dblclick: true,
    change: true,
    reset: true,
    select: true,
    submit: true,
    keydown: true,
    keypress: true,
    keyup: true,
    blur: true,
    load: true,
    mouseover: true,
    mouseout: true,
    mousemove: true,
    selectstart: true
};
fbjs_main.prototype.getElementById = function (b) {
    var a = fbjs_private.get(this).appid;
    return fbjs_dom.get_instance(document.getElementById('app' + a + '_' + b), a);
};
fbjs_main.prototype.getRootElement = function () {
    var a = fbjs_private.get(this).appid;
    return fbjs_dom.get_instance(document.getElementById('app_content_' + a).firstChild, a);
};
fbjs_main.prototype.createElement = function (a) {
    var b = fbjs_sandbox.safe_string(a.toLowerCase());
    if (fbjs_main.allowed_elements[b]) {
        return fbjs_dom.get_instance(document.createElement(b), fbjs_private.get(this).appid);
    } else switch (b) {
    case 'fb:swf':
        return new fbjs_fbml_dom('fb:swf', fbjs_private.get(this).appid);
        break;
    default:
        fbjs_console.error(b + ' is not an allowed DOM element');
        break;
    }
};
fbjs_main.prototype.setLocation = function (a) {
    a = fbjs_sandbox.safe_string(a);
    if (fbjs_dom.href_regex.test(a)) {
        document.location.href = a;
        return this === window ? null : this;
    } else fbjs_console.error(a + ' is not a valid location');
};

function fbjs_facebook(a) {
    var b = fbjs_private.get(this);
    b.appid = a;
    b.sandbox = fbjs_sandbox.instances['a' + a];
    this.appid = a;
}
fbjs_facebook.prototype.getUser = function () {
    var a = fbjs_private.get(this);
    if (a.sandbox.data.installed) {
        return a.sandbox.data.user;
    } else return null;
};
fbjs_facebook.prototype.isApplicationAdded = function () {
    return fbjs_private.get(this).sandbox.data.installed;
};
fbjs_facebook.prototype.isLoggedIn = function () {
    return fbjs_private.get(this).sandbox.data.installed;
};
fbjs_facebook.prototype.trackPageview = function (a) {
    if (_gaq) {
        _gaq.push(["_trackPageview", a]);
    } else fbjs_console.error('There is no fb:google-analytics tag on this page!');
};
fbjs_facebook.prototype.urchinTracker = fbjs_facebook.prototype.trackPageview;
fbjs_facebook.prototype.trackEvent = function (b, a, c, d) {
    if (_gaq) {
        _gaq.push(["_trackEvent", b, a, c, d]);
    } else fbjs_console.error('There is no fb:google-analytics tag on this page!');
};
fbjs_facebook.prototype.showFeedDialog = function (d, e, a, c, b, g, f) {
    FBML.showFeedDialog(this.appid, d, e, a, c, b, g, f);
};
fbjs_facebook.prototype.streamPublish = function (g, c, a, f, h, e, d, b) {
    FBML.streamPublish(this.appid, g, c, a, f, h, e, d, b);
};
fbjs_facebook.prototype.promptPermission = function (b, a) {
    FBML.promptPermissionPro(this.appid, b, a);
};
fbjs_facebook.prototype.showPermissionDialog = function (c, a, b, d) {
    FBML.showPermissionDialog(this.appid, c, a, b, d);
};
fbjs_facebook.prototype.showBookmarkDialog = function (a, b) {
    FBML.showBookmarkDialog(this.appid, a, b);
};
fbjs_facebook.prototype.showProfileTabDialog = function (a) {
    FBML.showProfileTabDialog(this.appid, a);
};
fbjs_facebook.prototype.showAddFriendDialog = function (b, a) {
    FBML.showAddFriendDialog(this.appid, b, a);
};
fbjs_facebook.prototype.createApplication = function (a, b) {
    FBML.createApplication(a, b);
};
fbjs_facebook.prototype.setPublishStatus = function (c) {
    var d = ge(this.appid + '_publish_button');
    if (d) {
        d.disabled = !c;
        CSS.conditionClass(d, 'disabled_button', !c);
    }
    var b = ge('app_content_' + this.appid);
    if (b) {
        var a = DataStore.get(b, 'attachment');
        if (a) a.setEnabled(c);
    }
};
fbjs_facebook.prototype.requireLogin = function (b, a) {
    if (!b) {
        fbjs_console.error('Continuation is a required parameter for requireLogin');
        return false;
    }
    var c = fbjs_private.get(this);
    if (!c.sandbox.data.installed) {
        FBML.requireLogin(this.appid, function () {
            c.sandbox.data.installed = true;
            try {
                b();
            } finally {
                fbjs_sandbox.clean_mess();
            }
        }, (a || bagofholding));
    } else try {
        b();
    } finally {
        fbjs_sandbox.clean_mess();
    }
};
fbjs_facebook.prototype.submitOrder = function (e) {
    var a = fbjs_private.get(this).appid;
    var g = e.receiver;
    var f = e.order_info;
    var c = e.next_js;
    var d = e.next_url;
    var j = {
        cc: '',
        mobile: '',
        paypal_ba: '',
        offer: ''
    };
    if (e.shortcut in j) {
        var h = e.shortcut;
    } else var h = null;
    var b = {
        oscif: e.oscif,
        shortcut: h
    };
    GiftCredits.getPrompt(a, g, f, d, c, GiftCredits.PLACE_APP, null, null, false, b);
};

function fbjs_dom(c, a) {
    this.__instance = fbjs_dom.len;
    try {
        c.fbjs_instance = fbjs_dom.len;
    } catch (b) {}
    fbjs_dom[fbjs_dom.len] = {
        instance: this,
        obj: c,
        events: {},
        appid: a
    };
    fbjs_dom.len++;
}
fbjs_dom.len = 0;
fbjs_dom.attr_setters = {
    href: 'setHref',
    id: 'setId',
    dir: 'setDir',
    checked: 'setChecked',
    action: 'setAction',
    value: 'setValue',
    method: 'setMethod',
    target: 'setTarget',
    src: 'setSrc',
    'class': 'setClassName',
    dir: 'setDir',
    title: 'setTitle',
    tabIndex: 'setTabIndex',
    name: 'setName',
    cols: 'setCols',
    rows: 'setRows',
    accessKey: 'setAccessKey',
    disabled: 'setDisabled',
    readOnly: 'setReadOnly',
    type: 'setType',
    selectedIndex: 'setSelectedIndex',
    selected: 'setSelected'
};
fbjs_dom.factory = function (b, a) {
    if (!b.tagName || ((!fbjs_main.allowed_elements[b.tagName.toLowerCase()] && !fbjs_main.allowed_editable[b.tagName.toLowerCase()]) || CSS.hasClass(b, '__fbml_tag') || (b.tagName == 'INPUT' && (b.name.substring(0, 2) == 'fb' || b.name == 'post_form_id')) || b.getAttribute('fb_protected') == 'true')) {
        return null;
    } else return new this(b, a);
};
fbjs_dom.get_data = function (b) {
    if (b.__instance instanceof Object) {
        return null;
    } else {
        var a = fbjs_dom[b.__instance];
        return a.instance == b ? a : null;
    }
};
fbjs_dom.get_obj = function (b) {
    if (b instanceof fbjs_fbml_dom) {
        return fbjs_fbml_dom.get_obj(b);
    } else if (typeof b.__instance == 'number') {
        var a = fbjs_dom[b.__instance];
        if (a && a.instance == b) {
            return a.obj;
        } else throw ('This DOM node is no longer valid.');
    } else throw ('This DOM node is no longer valid.');
};
fbjs_dom.render = function (a) {
    if (a instanceof fbjs_fbml_dom) fbjs_fbml_dom.render(a);
};
fbjs_dom.get_instance = function (b, a) {
    if (!b) return null;
    if (typeof b.fbjs_instance == 'undefined') {
        return fbjs_dom.factory(b, a);
    } else return fbjs_dom[b.fbjs_instance].instance;
};
fbjs_dom.get_instance_list = function (c, a) {
    var e = [];
    for (var b = 0; b < c.length; b++) {
        var d = fbjs_dom.get_instance(c[b], a);
        if (d) e.push(d);
    }
    return e;
};
fbjs_dom.get_first_valid_instance = function (c, b, a) {
    var d = null;
    if (c && ((c.id && c.id.indexOf('app_content') != -1) || (c.tagName && c.tagName.toLowerCase() == 'body'))) return null;
    while (c && (!(d = fbjs_dom.factory(c, a)))) {
        if ((c.id && c.id.indexOf('app_content') != -1) || (c.tagName && c.tagName.toLowerCase() == 'body')) return null;
        c = c[b];
    }
    return d;
};
fbjs_dom.clear_instances = function (d, c) {
    if (c && d.fbjs_instance) {
        delete fbjs_dom[d.fbjs_instance].obj;
        delete fbjs_dom[d.fbjs_instance].events;
        delete fbjs_dom[d.fbjs_instance].instance;
        delete fbjs_dom[d.fbjs_instance];
        d.fbjs_instance = undefined;
    }
    var a = d.childNodes;
    for (var b = 0; b < a.length; b++) fbjs_dom.clear_instances(a[b], true);
};
fbjs_dom.prototype.appendChild = function (a) {
    fbjs_dom.get_obj(this).appendChild(fbjs_dom.get_obj(a));
    fbjs_dom.render(a);
    return a;
};
fbjs_dom.prototype.insertBefore = function (b, a) {
    if (a) {
        fbjs_dom.get_obj(this).insertBefore(fbjs_dom.get_obj(b), fbjs_dom.get_obj(a));
    } else fbjs_dom.get_obj(this).appendChild(fbjs_dom.get_obj(b));
    fbjs_dom.render(b);
    return b;
};
fbjs_dom.prototype.removeChild = function (a) {
    var a = fbjs_dom.get_obj(a);
    fbjs_dom.clear_instances(a, true);
    fbjs_dom.get_obj(this).removeChild(a);
    return this;
};
fbjs_dom.prototype.replaceChild = function (a, b) {
    fbjs_dom.clear_instances(b, true);
    fbjs_dom.get_obj(this).replaceChild(fbjs_dom.get_obj(a), fbjs_dom.get_obj(b));
    return this;
};
fbjs_dom.prototype.cloneNode = function (c) {
    var a = fbjs_dom.get_data(this);
    var b = a.obj.cloneNode(c);
    b.fbjs_instance = undefined;
    return fbjs_dom.get_instance(b, a.appid);
};
fbjs_dom.prototype.getParentNode = function () {
    var a = fbjs_dom.get_data(this);
    return fbjs_dom.get_first_valid_instance(a.obj.parentNode, 'parentNode', a.appid);
};
fbjs_dom.prototype.getNextSibling = function () {
    var a = fbjs_dom.get_data(this);
    return fbjs_dom.get_first_valid_instance(a.obj.nextSibling, 'nextSibling', a.appid);
};
fbjs_dom.prototype.getPreviousSibling = function () {
    var a = fbjs_dom.get_data(this);
    return fbjs_dom.get_first_valid_instance(a.obj.previousSibling, 'previousSibling', a.appid);
};
fbjs_dom.prototype.getFirstChild = function () {
    var a = fbjs_dom.get_data(this);
    return fbjs_dom.get_first_valid_instance(a.obj.firstChild, 'nextSibling', a.appid);
};
fbjs_dom.prototype.getLastChild = function () {
    var a = fbjs_dom.get_data(this);
    return fbjs_dom.get_first_valid_instance(a.obj.lastChild, 'previousSibling', a.appid);
};
fbjs_dom.prototype.getChildNodes = function () {
    var a = fbjs_dom.get_data(this);
    return fbjs_dom.get_instance_list(a.obj.childNodes, a.appid);
};
fbjs_dom.prototype.getElementsByTagName = function (b) {
    var a = fbjs_dom.get_data(this);
    return fbjs_dom.get_instance_list(a.obj.getElementsByTagName(b), a.appid);
};
fbjs_dom.prototype.getOptions = function () {
    var a = fbjs_dom.get_data(this);
    return fbjs_dom.get_instance_list(a.obj.options, a.appid);
};
fbjs_dom.prototype.getForm = function () {
    var a = fbjs_dom.get_data(this);
    return fbjs_dom.get_instance(a.obj.form, a.appid);
};
fbjs_dom.prototype.serialize = function () {
    var b = fbjs_dom.get_data(this).obj.elements;
    var a = {};
    for (var c = b.length - 1; c >= 0; c--) if (b[c].name && b[c].name.substring(0, 2) != 'fb' && b[c].name != 'post_form_id' && !b[c].disabled) if (b[c].tagName == 'SELECT') {
        var f = b[c].multiple ? b[c].name + '[]' : b[c].name;
        for (var d = 0, e = b[c].options.length; d < e; d++) if (b[c].options[d].selected) Form._serializeHelper(a, f, (b[c].options[d].getAttribute('value') == null) ? undefined : b[c].options[d].value);
    } else if (!(b[c].type == 'radio' || b[c].type == 'checkbox') || b[c].checked || (!b[c].type || b[c].type == 'text' || b[c].type == 'password' || b[c].type == 'hidden' || b[c].tagName == 'TEXTAREA')) Form._serializeHelper(a, b[c].name, b[c].value);
    return a;
};
fbjs_dom.prototype.setInnerXHTML = function (b) {
    var a = fbjs_dom.get_data(this);
    var e = new fbjs_fbml_sanitize(a.appid);
    var c = e.parseFBML(b);
    if (!c) return this;
    var d = fbjs_dom.get_obj(this);
    switch (d.tagName) {
    case 'TEXTAREA':
        fbjs_console.error('setInnerXHTML is not supported on textareas. Please use .value instead.');
        break;
    case 'COL':
    case 'COLGROUP':
    case 'TABLE':
    case 'TBODY':
    case 'TFOOT':
    case 'THEAD':
    case 'TR':
        fbjs_console.error('setInnerXHTML is not supported on this node.');
        break;
    default:
        fbjs_dom.clear_instances(d, false);
        DOM.empty(d);
        this.appendChild(c);
        break;
    }
    return this;
};
fbjs_dom.prototype.setInnerFBML = function (a) {
    var b = fbjs_private.get(a).htmlstring;
    var c = fbjs_dom.get_obj(this);
    switch (c.tagName) {
    case 'TEXTAREA':
        fbjs_console.error('setInnerFBML is not supported on textareas. Please use .value instead.');
        break;
    case 'COL':
    case 'COLGROUP':
    case 'TABLE':
    case 'TBODY':
    case 'TFOOT':
    case 'THEAD':
    case 'TR':
        fbjs_console.error('setInnerFBML is not supported on this node.');
        break;
    default:
        DOM.setContent(c, b);
        break;
    }
    return this;
};
fbjs_dom.prototype.setTextValue = function (b) {
    var a = fbjs_dom.get_obj(this);
    fbjs_dom.clear_instances(a, false);
    DOM.setContent(a, fbjs_sandbox.safe_string(b));
    return this;
};
fbjs_dom.prototype.setValue = function (a) {
    fbjs_dom.get_obj(this).value = a;
    return this;
};
fbjs_dom.prototype.getValue = function () {
    var a = fbjs_dom.get_obj(this);
    if (a.tagName == 'SELECT') {
        var b = a.selectedIndex;
        if (b == -1) {
            return null;
        } else if (a.options[b].getAttribute('value') == null) {
            return undefined;
        } else return a.value;
    } else return fbjs_dom.get_obj(this).value;
};
fbjs_dom.prototype.getSelectedIndex = function () {
    return fbjs_dom.get_obj(this).selectedIndex;
};
fbjs_dom.prototype.setSelectedIndex = function (a) {
    fbjs_dom.get_obj(this).selectedIndex = a;
    return this;
};
fbjs_dom.prototype.getChecked = function () {
    return fbjs_dom.get_obj(this).checked;
};
fbjs_dom.prototype.setChecked = function (a) {
    fbjs_dom.get_obj(this).checked = a;
    return this;
};
fbjs_dom.prototype.getSelected = function () {
    return fbjs_dom.get_obj(this).selected;
};
fbjs_dom.prototype.setSelected = function (a) {
    fbjs_dom.get_obj(this).selected = a;
    return this;
};
fbjs_dom.set_style = function (b, c, d) {
    if (typeof c == 'string') {
        if (c == 'opacity') {
            CSS.setStyle(b, 'opacity', parseFloat(d, 10));
        } else {
            d = fbjs_sandbox.safe_string(d);
            if (fbjs_dom.css_regex.test(d)) {
                b.style[c] = d;
            } else fbjs_console.error(c + ': ' + d + ' is not a valid CSS style');
        }
    } else for (var a in c) fbjs_dom.set_style(b, a, c[a]);
};
fbjs_dom.css_regex = /^(?:[\w\-#%+]+|rgb\(\d+ *, *\d+, *\d+\)|url\('?http[^ ]+?'?\)| +)*$/i;
fbjs_dom.prototype.setStyle = function (a, b) {
    fbjs_dom.set_style(fbjs_dom.get_obj(this), a, b);
    return this;
};
fbjs_dom.prototype.getStyle = function (a) {
    return fbjs_dom.get_obj(this).style[$FBJS.idx(a)];
};
fbjs_dom.prototype.setHref = function (a) {
    a = fbjs_sandbox.safe_string(a);
    if (fbjs_dom.href_regex.test(a)) {
        fbjs_dom.get_obj(this).href = a;
        return this;
    } else fbjs_console.error(a + ' is not a valid hyperlink');
};
fbjs_dom.href_regex = /^(?:https?|mailto|ftp|aim|irc|itms|gopher|\/|#)/;
fbjs_dom.sanitizeUri = function (a) {
    var c = new URI().parse(a);
    for (var b in c.getQueryData()) if (b.startsWith("_fb")) c.removeQueryData(b);
    return c.toString();
};
fbjs_dom.prototype.getHref = function () {
    return fbjs_dom.sanitizeUri(fbjs_dom.get_obj(this).href);
};
fbjs_dom.prototype.setAction = function (a) {
    a = fbjs_sandbox.safe_string(a);
    if (fbjs_dom.href_regex.test(a)) {
        fbjs_dom.get_obj(this).action = a;
        return this;
    } else fbjs_console.error(a + ' is not a valid hyperlink');
};
fbjs_dom.prototype.getAction = function () {
    return fbjs_dom.get_obj(this).action;
};
fbjs_dom.prototype.setMethod = function (a) {
    a = fbjs_sandbox.safe_string(a);
    fbjs_dom.get_obj(this).method = a.toLowerCase() == 'get' ? 'get' : 'post';
    return this;
};
fbjs_dom.prototype.getMethod = function () {
    return fbjs_dom.get_obj(this).method;
};
fbjs_dom.prototype.setSrc = function (a) {
    a = fbjs_sandbox.safe_string(a);
    if (fbjs_dom.href_regex.test(a)) {
        fbjs_dom.get_obj(this).src = a;
        return this;
    } else fbjs_console.error(a + ' is not a valid hyperlink');
};
fbjs_dom.prototype.getSrc = function () {
    return fbjs_dom.get_obj(this).src;
};
fbjs_dom.prototype.setTarget = function (a) {
    fbjs_dom.get_obj(this).target = a;
    return this;
};
fbjs_dom.prototype.getTarget = function () {
    return fbjs_dom.get_obj(this).target;
};
fbjs_dom.prototype.setClassName = function (a) {
    fbjs_dom.get_obj(this).className = a;
    return this;
};
fbjs_dom.prototype.getClassName = function () {
    return fbjs_dom.get_obj(this).className;
};
fbjs_dom.prototype.hasClassName = function (a) {
    return CSS.hasClass(fbjs_dom.get_obj(this), a);
};
fbjs_dom.prototype.addClassName = function (a) {
    CSS.addClass(fbjs_dom.get_obj(this), a);
    return this;
};
fbjs_dom.prototype.removeClassName = function (a) {
    CSS.removeClass(fbjs_dom.get_obj(this), a);
    return this;
};
fbjs_dom.prototype.toggleClassName = function (a) {
    this.hasClassName(a) ? this.removeClassName(a) : this.addClassName(a);
    return $FBJS.ref(this);
};
fbjs_dom.prototype.getTagName = function () {
    return fbjs_dom.get_obj(this).tagName;
};
fbjs_dom.prototype.getNodeType = function () {
    return fbjs_dom.get_obj(this).nodeType;
};
fbjs_dom.prototype.getId = function () {
    var a = fbjs_dom.get_obj(this).id;
    if (a) {
        return a.replace(/^app\d+_/, '');
    } else return a;
};
fbjs_dom.prototype.setId = function (b) {
    var a = fbjs_dom.get_data(this);
    a.obj.id = ['app', a.appid, '_', b].join('');
    return this;
};
fbjs_dom.prototype.setDir = function (a) {
    fbjs_dom.get_obj(this).dir = a;
    return this;
};
fbjs_dom.prototype.getDir = function (a) {
    return fbjs_dom.get_obj(this).dir;
};
fbjs_dom.prototype.getdir = function (a) {
    return fbjs_dom.get_obj(this).dir;
};
fbjs_dom.prototype.getClientWidth = function () {
    return fbjs_dom.get_obj(this).clientWidth;
};
fbjs_dom.prototype.getClientHeight = function () {
    return fbjs_dom.get_obj(this).clientHeight;
};
fbjs_dom.prototype.getOffsetWidth = function () {
    return fbjs_dom.get_obj(this).offsetWidth;
};
fbjs_dom.prototype.getOffsetHeight = function () {
    return fbjs_dom.get_obj(this).offsetHeight;
};
fbjs_dom.prototype.getAbsoluteLeft = function () {
    return elementX(fbjs_dom.get_obj(this));
};
fbjs_dom.prototype.getAbsoluteTop = function () {
    return elementY(fbjs_dom.get_obj(this));
};
fbjs_dom.prototype.getScrollHeight = function () {
    return fbjs_dom.get_obj(this).scrollHeight;
};
fbjs_dom.prototype.getScrollWidth = function (a) {
    return fbjs_dom.get_obj(this).scrollWidth;
};
fbjs_dom.prototype.getScrollTop = function () {
    return fbjs_dom.get_obj(this).scrollTop;
};
fbjs_dom.prototype.setScrollTop = function (a) {
    fbjs_dom.get_obj(this).scrollTop = a;
    return this;
};
fbjs_dom.prototype.getScrollLeft = function () {
    return fbjs_dom.get_obj(this).scrollLeft;
};
fbjs_dom.prototype.setScrollLeft = function (a) {
    fbjs_dom.get_obj(this).scrollLeft = a;
    return this;
};
fbjs_dom.prototype.getTabIndex = function () {
    return fbjs_dom.get_obj(this).tabIndex;
};
fbjs_dom.prototype.setTabIndex = function (a) {
    fbjs_dom.get_obj(this).tabIndex = a;
    return this;
};
fbjs_dom.prototype.getTitle = function () {
    return fbjs_dom.get_obj(this).title;
};
fbjs_dom.prototype.setTitle = function (a) {
    fbjs_dom.get_obj(this).title = a;
    return this;
};
fbjs_dom.prototype.getRowSpan = function () {
    return fbjs_dom.get_obj(this).rowSpan;
};
fbjs_dom.prototype.setRowSpan = function (a) {
    fbjs_dom.get_obj(this).rowSpan = a;
    return this;
};
fbjs_dom.prototype.getColSpan = function () {
    return fbjs_dom.get_obj(this).colSpan;
};
fbjs_dom.prototype.setColSpan = function (a) {
    fbjs_dom.get_obj(this).colSpan = a;
    return this;
};
fbjs_dom.prototype.getName = function () {
    return fbjs_dom.get_obj(this).name;
};
fbjs_dom.prototype.setName = function (a) {
    fbjs_dom.get_obj(this).name = a;
    return this;
};
fbjs_dom.prototype.getCols = function () {
    return fbjs_dom.get_obj(this).cols;
};
fbjs_dom.prototype.setCols = function (a) {
    fbjs_dom.get_obj(this).cols = a;
    return this;
};
fbjs_dom.prototype.getRows = function () {
    return fbjs_dom.get_obj(this).rows;
};
fbjs_dom.prototype.setRows = function (a) {
    fbjs_dom.get_obj(this).rows = a;
    return this;
};
fbjs_dom.prototype.getAccessKey = function () {
    return fbjs_dom.get_obj(this).accessKey;
};
fbjs_dom.prototype.setAccessKey = function (a) {
    fbjs_dom.get_obj(this).accessKey = a;
    return this;
};
fbjs_dom.prototype.setDisabled = function (a) {
    fbjs_dom.get_obj(this).disabled = a;
    return this;
};
fbjs_dom.prototype.getDisabled = function () {
    return fbjs_dom.get_obj(this).disabled;
};
fbjs_dom.prototype.setMaxLength = function (a) {
    fbjs_dom.get_obj(this).maxLength = a;
    return this;
};
fbjs_dom.prototype.getMaxLength = function () {
    return fbjs_dom.get_obj(this).maxLength;
};
fbjs_dom.prototype.setReadOnly = function (a) {
    fbjs_dom.get_obj(this).readOnly = a;
    return this;
};
fbjs_dom.prototype.getReadOnly = function () {
    return fbjs_dom.get_obj(this).readOnly;
};
fbjs_dom.prototype.setType = function (a) {
    a = fbjs_sandbox.safe_string(a);
    fbjs_dom.get_obj(this).type = a;
    return this;
};
fbjs_dom.prototype.getType = function () {
    return fbjs_dom.get_obj(this).type;
};
fbjs_dom.prototype.getSelection = function () {
    var a = fbjs_dom.get_obj(this);
    return FormControl.getCaretPosition(a);
};
fbjs_dom.prototype.setSelection = function (c, a) {
    var b = fbjs_dom.get_obj(this);
    FormControl.setCaretPosition(b, c, a);
    return this;
};
fbjs_dom.prototype.submit = function () {
    fbjs_dom.get_obj(this).submit();
    return this;
};
fbjs_dom.prototype.focus = function () {
    fbjs_dom.get_obj(this).focus();
    return this;
};
fbjs_dom.prototype.select = function () {
    fbjs_dom.get_obj(this).select();
    return this;
};
fbjs_dom.eventHandler = function (event) {
    var a = (event instanceof fbjs_event) ? event : new fbjs_event(event ? event : window.event, this[2]);
    if (a.ignore) return;
    try {
        var r = this[1].call(this[0], a);
    } finally {
        fbjs_sandbox.clean_mess();
    }
    if (r === false) a.preventDefault();
    return fbjs_event.destroy(a);
};
fbjs_dom.prototype.addEventListener = function (f, b) {
    f = fbjs_sandbox.safe_string(f.toLowerCase());
    if (!fbjs_main.allowed_events[f]) {
        fbjs_console.error(f + ' is not an allowed event');
        return false;
    }
    var a = fbjs_dom.get_data(this);
    var e = a.obj;
    if (!a.events[f]) a.events[f] = [];
    var c = null;
    var d = null;
    if (e.addEventListener) {
        e.addEventListener(f, c = fbjs_dom.eventHandler.bind([this, b, a.appid]), false);
    } else if (e.attachEvent) e.attachEvent('on' + f, c = fbjs_dom.eventHandler.bind([this, b, a.appid]));
    a.events[f].push({
        func: b,
        handler: c,
        listener: d
    });
    return $FBJS.ref(this);
};
fbjs_dom.prototype.removeEventListener = function (f, b) {
    f = f.toLowerCase();
    var a = fbjs_dom.get_data(this);
    var e = a.obj;
    if (a.events[f]) for (var c = 0, d = a.events[f].length; c < d; c++) if (a.events[f][c].func == b) {
        if (e.removeEventListener) {
            e.removeEventListener(f, a.events[f][c].handler, false);
        } else if (e.detachEvent) e.detachEvent('on' + f, a.events[f][c].handler);
        a.events[f].splice(c, 1);
    }
    return this;
};
fbjs_dom.prototype.listEventListeners = function (e) {
    e = e.toLowerCase();
    var a = fbjs_dom.get_data(this);
    var b = [];
    if (a.events[e]) for (var c = 0, d = a.events[e].length; c < d; c++) b.push(a.events[e].func);
    if (a.obj['on' + e]) b.push(a.obj['on' + e]);
    return b;
};
fbjs_dom.prototype.purgeEventListeners = function (e) {
    e = e.toLowerCase();
    var a = fbjs_dom.get_data(this);
    var d = a.obj;
    if (a.events[e]) for (var b = 0, c = a.events[e].length; b < c; b++) if (d.removeEventListener) {
        d.removeEventListener(e, a.events[e][b].handler, false);
    } else if (d.detachEvent) d.detachEvent('on' + e, a.events[e][b].handler);
    return this;
};
fbjs_dom.prototype.callSWF = function (e) {
    var f = fbjs_dom.get_data(this).obj;
    var a = new Array(arguments.length - 1);
    var d = 0;
    var b = null;
    for (var c = 1; c < arguments.length; c++) a[c - 1] = arguments[c];
    if (ua.ie()) {
        for (var c = 0; c < f.childNodes.length; c++) if (f.childNodes[c].name == "fbjs") d = f.childNodes[c].getAttribute("value");
        b = window.so_swf_fbjs;
        if (!b.callFlash) b = document.so_swf_fbjs;
    } else {
        d = f.getAttribute("fbjs");
        b = document.so_swf_fbjs;
    }
    if (b.length !== undefined) b = b[0];
    return b.callFlash(d, e, a);
};

function fbjs_fbml_dom(c, a) {
    var b = fbjs_private.get(this);
    b.type = c;
    b.appid = a;
}
fbjs_fbml_dom.get_obj = function (b) {
    var a = fbjs_private.get(b);
    if (!a.obj) {
        a.obj = document.createElement('div');
        a.obj.className = '__fbml_tag';
    }
    return a.obj;
};
fbjs_fbml_dom.render = function (h) {
    var b = fbjs_private.get(h);
    if (b.rendered) return;
    if (!b.id) b.id = 'swf' + parseInt(Math.random() * 999999);
    switch (b.type) {
    case 'fb:swf':
        var d = new SWFObject(b.swf_src, b.id, b.width, b.height, ['5.0.0'], b.bg_color ? b.bg_color : '000000');
        var e = {
            loop: true,
            quality: true,
            scale: true,
            align: true,
            salign: true
        };
        for (f in e) if (b[f]) d.addParam(f, b[f]);
        d.addParam('wmode', 'transparent');
        d.addParam('allowScriptAccess', 'never');
        if (b.flash_vars) for (var f in b.flash_vars) d.addVariable(f, b.flash_vars[f]);
        var j = fbjs_sandbox.instances['a' + b.appid];
        if (j.validation_vars) for (var f in j.validation_vars) d.addVariable(f, j.validation_vars[f]);
        d.addVariable('fb_local_connection', j.bridgeHash);
        var c = '_' + 'swf' + parseInt(Math.random() * 999999);
        d.addVariable('fb_fbjs_connection', c);
        d.addParam('fbjs', c);
        if (b.wait_for_click) {
            var g = document.createElement('img');
            g.src = b.img_src;
            if (b.width) g.width = b.width;
            if (b.height) g.height = b.height;
            if (b.img_style) fbjs_dom.set_style(g, b.img_style);
            if (b.img_class) g.className = b.img_class;
            var a = document.createElement('a');
            a.href = '#';
            a.onclick = function () {
                d.write(b.obj);
                return false;
            };
            a.appendChild(g);
            b.obj.appendChild(a);
        } else d.write(b.obj);
        break;
    }
};
fbjs_fbml_dom.prototype.setId = function (b) {
    var a = fbjs_private.get(this);
    a.id = ['app', a.appid, '_', b].join('');
    return $FBJS.ref(this);
};
fbjs_fbml_dom.prototype.setSWFSrc = function (b) {
    var a = fbjs_private.get(this);
    b = fbjs_sandbox.safe_string(b);
    if (fbjs_dom.href_regex.test(b)) {
        a.swf_src = b;
    } else fbjs_console.error(b + ' is not a valid swf');
};
fbjs_fbml_dom.prototype.setImgSrc = function (b) {
    var a = fbjs_private.get(this);
    b = fbjs_sandbox.safe_string(b);
    if (fbjs_dom.href_regex.test(b)) {
        a.img_src = b;
    } else fbjs_console.error(b + ' is not a valid src');
    return $FBJS.ref(this);
};
fbjs_fbml_dom.prototype.setWidth = function (b) {
    var a = fbjs_private.get(this);
    a.width = (/\d+%?/.exec(b) || []).pop();
    return $FBJS.ref(this);
};
fbjs_fbml_dom.prototype.setHeight = function (b) {
    var a = fbjs_private.get(this);
    a.height = (/\d+%?/.exec(b) || []).pop();
    return $FBJS.ref(this);
};
fbjs_fbml_dom.prototype.setImgStyle = function (c, e) {
    var a = fbjs_private.get(this);
    var d = a.img_style ? a.img_style : a.img_style = {};
    if (typeof c == 'string') {
        d[c] = e;
    } else for (var b in c) this.setImgStyle(b, c[b]);
    return $FBJS.ref(this);
};
fbjs_fbml_dom.prototype.setImgClass = function (b) {
    var a = fbjs_private.get(this);
    a.img_class = b;
    return $FBJS.ref(this);
};
fbjs_fbml_dom.prototype.setFlashVar = function (c, d) {
    var a = fbjs_private.get(this);
    var b = a.flash_vars ? a.flash_vars : a.flash_vars = {};
    b[c] = d;
    return $FBJS.ref(this);
};
fbjs_fbml_dom.prototype.setSWFBGColor = function (a) {
    var b = fbjs_private.get(this);
    if (fbjs_dom.css_regex.text(a)) {
        b.bg_color = a;
    } else fbjs_console.error(a + ' is not a valid background color.');
    return $FBJS.ref(this);
};
fbjs_fbml_dom.prototype.setWaitForClick = function (b) {
    var a = fbjs_private.get(this);
    a.wait_for_click = b;
    return $FBJS.ref(this);
};
fbjs_fbml_dom.prototype.setLoop = function (b) {
    var a = fbjs_private.get(this);
    a.loop = b;
    return $FBJS.ref(this);
};
fbjs_fbml_dom.prototype.setQuality = function (b) {
    var a = fbjs_private.get(this);
    a.quality = b;
    return $FBJS.ref(this);
};
fbjs_fbml_dom.prototype.setScale = function (b) {
    var a = fbjs_private.get(this);
    a.scale = b;
    return $FBJS.ref(this);
};
fbjs_fbml_dom.prototype.setAlign = function (b) {
    var a = fbjs_private.get(this);
    a.align = b;
    return $FBJS.ref(this);
};
fbjs_fbml_dom.prototype.setSAlign = function (b) {
    var a = fbjs_private.get(this);
    a.salign = b;
    return $FBJS.ref(this);
};

function fbjs_event(event, a) {
    if (!fbjs_event.hacks) {
        fbjs_event.hacks = true;
        fbjs_event.should_check_double_arrows = ua.safari() && (ua.safari() < 500);
        fbjs_event.arrow_toggle = {};
    }
    for (var c in fbjs_event.allowed_properties) this[c] = event[c];
    this.keyCode = this.keyCode || event.charCode;
    var d = null;
    if (event.target) {
        d = event.target;
    } else if (event.srcElement) d = event.srcElement;
    if (d && d.nodeType == 3) d = d.parentNode;
    this.target = fbjs_dom.get_instance(d, a);
    var b = Vector2.getEventPosition(event);
    this.pageX = b.x;
    this.pageY = b.y;
    if (fbjs_event.should_check_double_arrows && this.keyCode >= 37 && this.keyCode <= 40) {
        fbjs_event.arrow_toggle[this.type] = !fbjs_event.arrow_toggle[this.type];
        if (fbjs_event.arrow_toggle[this.type]) this.ignore = true;
    }
    fbjs_private.get(this).event = event;
}
fbjs_event.allowed_properties = {
    type: true,
    ctrlKey: true,
    keyCode: true,
    metaKey: true,
    shiftKey: true
};
fbjs_event.prototype.preventDefault = function () {
    var a = fbjs_private.get(this);
    if (!a.prevented && a.event.preventDefault) {
        a.event.preventDefault();
        a.prevented = true;
    }
    a.return_value = false;
};
fbjs_event.prototype.stopPropagation = function () {
    var event = fbjs_private.get(this).event;
    if (event.stopPropagation) {
        event.stopPropagation();
    } else event.cancelBubble = true;
};
fbjs_event.destroy = function (a) {
    var b = fbjs_private.get(a).return_value;
    fbjs_private.remove(a);
    delete a.target;
    return b == undefined ? true : b;
};

function fbjs_math() {}
fbjs_math.prototype.abs = Math.abs;
fbjs_math.prototype.acos = Math.acos;
fbjs_math.prototype.asin = Math.asin;
fbjs_math.prototype.atan = Math.atan;
fbjs_math.prototype.atan2 = Math.atan2;
fbjs_math.prototype.ceil = Math.ceil;
fbjs_math.prototype.cos = Math.cos;
fbjs_math.prototype.exp = Math.exp;
fbjs_math.prototype.floor = Math.floor;
fbjs_math.prototype.log = Math.log;
fbjs_math.prototype.max = Math.max;
fbjs_math.prototype.min = Math.min;
fbjs_math.prototype.pow = Math.pow;
fbjs_math.prototype.random = Math.random;
fbjs_math.prototype.round = Math.round;
fbjs_math.prototype.sin = Math.sin;
fbjs_math.prototype.sqrt = Math.sqrt;
fbjs_math.prototype.tan = Math.tan;
fbjs_math.prototype.valueOf = Math.valueOf;
fbjs_math.prototype.E = Math.E;
fbjs_math.prototype.LN2 = Math.LN2;
fbjs_math.prototype.LN10 = Math.LN10;
fbjs_math.prototype.LOG2E = Math.LOG2E;
fbjs_math.prototype.PI = Math.PI;
fbjs_math.prototype.SQRT1_2 = Math.SQRT1_2;
fbjs_math.prototype.SQRT2 = Math.SQRT2;

function fbjs_string() {}
fbjs_string.prototype.fromCharCode = String.fromCharCode;

function fbjs_date() {
    var a = function () {
        var b = new Date();
        if (arguments.length) b.setFullYear.apply(b, arguments);
        return b;
    };
    a.parse = Date.parse;
    return a;
}
function fbjs_regexp() {
    var a = function () {
        var b = arguments.length ? new RegExp(arguments[0], arguments[1]) : new RegExp();
        return b;
    };
    return a;
}
function fbjs_console() {}
fbjs_console.error = function (a) {
    if (typeof console != 'undefined' && console.error) console.error(a);
};
fbjs_console.render = function (d) {
    if (d && typeof d.__priv != 'undefined') {
        var c = {};
        for (var b in d) c[b] = d[b];
        delete c.__priv;
        delete c.__private;
        for (var b in c) c[b] = fbjs_console.render(c[b]);
        var e = fbjs_private.get(d);
        for (var b in e) c['PRIV_' + b] = e[b];
        if (d.__private) {
            var e = fbjs_private.get(d.__private);
            for (var b in e) c['PRIV_' + b] = e[b];
        }
        return c;
    } else if (d && typeof d.__instance != 'undefined' && d.setInnerFBML) {
        var c = {};
        for (var b in d) c[b] = d[b];
        delete c.__instance;
        c.PRIV_obj = fbjs_dom.get_obj(d);
        return c;
    } else if (d && typeof d == 'object' && d.ownerDocument != document) {
        var c = d instanceof Array ? [] : {};
        var a = false;
        for (var b in d) {
            d instanceof Array ? c.push(fbjs_console.render(d[b])) : c[b] = fbjs_console.render(d[b]);
            if (c[b] != d[b]) a = true;
        }
        return a ? c : d;
    } else return d;
};
fbjs_console.render_args = function (a) {
    var c = [];
    for (var b = 0; b < a.length; b++) c[b] = fbjs_console.render(a[b]);
    return c;
};
if (typeof console != 'undefined') for (var i in console) fbjs_console.prototype[i] = console[i];
fbjs_console.prototype.debug = function () {
    if (typeof console != 'undefined' && console.debug) console.debug.apply(console, fbjs_console.render_args(arguments));
};
fbjs_console.prototype.log = function () {
    if (typeof console != 'undefined' && console.log) console.log.apply(console, fbjs_console.render_args(arguments));
};
fbjs_console.prototype.warn = function () {
    if (typeof console != 'undefined' && console.warn) console.warn.apply(console, fbjs_console.render_args(arguments));
};
fbjs_console.prototype.error = function () {
    if (typeof console != 'undefined' && console.error) console.error.apply(console, fbjs_console.render_args(arguments));
};
fbjs_console.prototype.assert = function () {
    if (typeof console != 'undefined' && console.assert) console.assert.apply(console, fbjs_console.render_args(arguments));
};
fbjs_console.prototype.dir = function () {
    if (typeof console != 'undefined' && console.dir) console.dir.apply(console, fbjs_console.render_args(arguments));
};
fbjs_console.prototype.group = function () {
    if (typeof console != 'undefined' && console.group) console.group.apply(console, fbjs_console.render_args(arguments));
};
fbjs_console.prototype.dirxml = function (a) {
    if (typeof console != 'undefined' && console.dirxml) if (a.get_obj) {
        console.dirxml(a.get_obj(a));
    } else console.dirxml(a);
};

function fbjs_ajax(a) {
    var d = function () {};
    for (var b in fbjs_ajax.prototype) d.prototype[b] = fbjs_ajax.prototype[b];
    var c = fbjs_private.get(d.prototype.__private = {});
    c.appid = a;
    c.sandbox = fbjs_sandbox.instances['a' + a];
    c.request = null;
    d.JSON = fbjs_ajax.JSON;
    d.FBML = fbjs_ajax.FBML;
    d.RAW = fbjs_ajax.RAW;
    return d;
}
fbjs_ajax.proxy_url = '/fbml/fbjs_ajax_proxy.php';
fbjs_ajax.RAW = 0;
fbjs_ajax.JSON = 1;
fbjs_ajax.FBML = 2;
fbjs_ajax.STATUS_WAITING_FOR_USER = 1;
fbjs_ajax.STATUS_WAITING_FOR_SERVER = 2;
fbjs_ajax.STATUS_IDLE = 0;
fbjs_ajax.prototype.responseType = 0;
fbjs_ajax.prototype.useLocalProxy = false;
fbjs_ajax.prototype.requireLogin = false;
fbjs_ajax.prototype.status = fbjs_ajax.STATUS_IDLE;
fbjs_ajax.tokencount = 0;
fbjs_ajax.tokens = new Object();
fbjs_ajax.flash_success = function (a, b) {
    fbjs_ajax.tokens[b].success(a);
};
fbjs_ajax.flash_fail = function (a) {
    fbjs_ajax.tokens[a].fail();
};
fbjs_ajax.prototype.post = function (g, f) {
    var e = fbjs_private.get(this.__private);
    var a = e.appid;
    var d = ge('post_form_id');
    if (!e.sandbox.data.installed && this.requireLogin) {
        this.status = fbjs_ajax.STATUS_WAITING_FOR_USER;
        FBML.requireLogin(a, function () {
            this.status = fbjs_ajax.STATUS_READY;
            e.sandbox.data.installed = true;
            this.post(g, f);
        }.bind(this), fbjs_ajax.errorHandler.bind(this));
        return;
    }
    if (this.useLocalProxy && window.localProxy.callUrl && this.responseType != fbjs_ajax.FBML) {
        fbjs_ajax.tokencount++;
        fbjs_ajax.tokens[fbjs_ajax.tokencount] = {
            success: function (j) {
                this.status = fbjs_ajax.STATUS_READY;
                this.ondone(j);
            }.bind(this),
            fail: fbjs_ajax.errorHandler.bind(this)
        };
        var h = (this.responseType == fbjs_ajax.JSON);
        var b = localProxy.callUrl(g + '?query=' + f, h, "fbjs_ajax.flash_success", "fbjs_ajax.flash_fail", fbjs_ajax.tokencount);
        if (!b)(fbjs_ajax.errorHandler.bind(this))();
    } else {
        var c = {
            url: g,
            query: f,
            type: this.responseType,
            require_login: this.requireLogin,
            fb_mockajax_context: fbjs_sandbox.instances['a' + a].contextd,
            fb_mockajax_context_hash: fbjs_sandbox.instances['a' + a].context,
            appid: a
        };
        this.status = fbjs_ajax.STATUS_WAITING_FOR_SERVER;
        e.request = new AsyncRequest();
        e.request.setURI(fbjs_ajax.proxy_url).setData(c).setHandler(fbjs_ajax.doneHandler.bind(this)).setErrorHandler(fbjs_ajax.errorHandler.bind(this));
        if (!this.requireLogin) {
            e.request.setReadOnly(true);
            e.request.specifiesWriteRequiredParams();
        }
        e.request.send();
    }
};
fbjs_ajax.prototype.abort = function () {
    var a = fbjs_private.get(this.__private);
    if (a.request) a.request.setHandler(bagofholding).setErrorHandler(bagofholding);
    this.status = fbjs_ajax.STATUS_READY;
};
fbjs_ajax.doneHandler = function (c) {
    if (!(this.ondone instanceof Function)) this.ondone = function () {};
    this.status = fbjs_ajax.STATUS_READY;
    var b = c.getPayload();
    var a = b.data;
    try {
        switch (b.type) {
        case fbjs_ajax.RAW:
            this.ondone(a);
            break;
        case fbjs_ajax.JSON:
            fbjs_ajax.make_fbjs_recursive(a);
            this.ondone(a);
            break;
        case fbjs_ajax.FBML:
            this.ondone(new fbjs_fbml_string(a));
            break;
        }
    } finally {
        fbjs_sandbox.clean_mess();
    }
};
fbjs_ajax.errorHandler = function () {
    this.status = fbjs_ajax.STATUS_READY;
    if (this.onerror) {
        try {
            this.onerror();
        } finally {
            fbjs_sandbox.clean_mess();
        }
    } else fbjs_console.error('There was an uncaught Ajax error. Please attach on onerror handler to properly handle failures.');
};
fbjs_ajax.make_fbjs_recursive = function (b) {
    for (var a in b) if (a.substring(0, 5) == 'fbml_') {
        b[a] = new fbjs_fbml_string(b[a]);
    } else if (typeof b[a] == 'object') fbjs_ajax.make_fbjs_recursive(b[a]);
};

function fbjs_dialog(a) {
    var c = function (e) {
        var d = fbjs_private.get(this);
        switch (e) {
        case fbjs_dialog.DIALOG_CONTEXTUAL:
            d.dialog = new ContextualDialog();
            break;
        case fbjs_dialog.DIALOG_POP:
        default:
            d.dialog = new Dialog();
            break;
        }
        d.dialog.setImmediateRendering(true).setClassName('app_content_' + a).setStackable(true);
        d.type = e;
        d.ready = false;
    };
    for (var b in fbjs_dialog.prototype) c.prototype[b] = fbjs_dialog.prototype[b];
    c.DIALOG_POP = fbjs_dialog.DIALOG_POP;
    c.DIALOG_CONTEXTUAL = fbjs_dialog.DIALOG_CONTEXTUAL;
    return c;
}
fbjs_dialog.DIALOG_POP = 1;
fbjs_dialog.DIALOG_CONTEXTUAL = 2;
fbjs_dialog.onconfirm = function () {
    var a = true;
    try {
        if (this.onconfirm) if (this.onconfirm() === false) a = false;
    } finally {
        fbjs_sandbox.clean_mess();
    }
    if (a) this.hide();
    return false;
};
fbjs_dialog.oncancel = function () {
    var a = true;
    try {
        if (this.oncancel) if (this.oncancel() === false) a = false;
    } finally {
        fbjs_sandbox.clean_mess();
    }
    if (a) this.hide();
    return false;
};
fbjs_dialog.build_dialog = function () {
    var a = fbjs_private.get(this);
    if (!a.ready) {
        a.dialog._buildDialog();
        a.ready = true;
    }
};
fbjs_dialog.prototype.setStyle = function (c, d) {
    var b = fbjs_private.get(this);
    fbjs_dialog.build_dialog.call(this);
    var a = null;
    if (c == 'width' || c == 'height') {
        a = b.type == fbjs_dialog.DIALOG_CONTEXTUAL ? b.dialog._frame : b.dialog._frame.parentNode;
    } else a = b.dialog._content;
    fbjs_dom.set_style(a, c, d);
    return $FBJS.ref(this);
};
fbjs_dialog.prototype.showMessage = function (c, b, a) {
    this.showChoice(c, b, a, false);
    return $FBJS.ref(this);
};
fbjs_dialog.prototype.showChoice = function (h, f, a, c) {
    var g = fbjs_private.get(this).dialog;
    fbjs_dialog.build_dialog.call(this);
    var e = [];
    var b = a ? fbjs_fbml_string.get(a) : _tx("Okay");
    e.push({
        label: b,
        name: 'button1',
        handler: bind(this, fbjs_dialog.onconfirm)
    });
    if (c || c === undefined) {
        var d = c ? fbjs_fbml_string.get(c) : _tx("Cancel");
        e.push({
            label: d,
            name: 'button2',
            handler: bind(this, fbjs_dialog.oncancel)
        });
    }
    g.setTitle(fbjs_fbml_string.get(h)).setBody(fbjs_fbml_string.get(f)).setButtons(e).show();
    g._content.id = 'app_content_' + (+new Date());
    return $FBJS.ref(this);
};
fbjs_dialog.prototype.setContext = function (b) {
    var a = fbjs_private.get(this).dialog;
    var c = fbjs_dom.get_obj(b);
    a.setContext(c);
    return $FBJS.ref(this);
};
fbjs_dialog.prototype.hide = function () {
    var a = fbjs_private.get(this).dialog;
    a.hide();
    return $FBJS.ref(this);
};

function fbjs_animation() {
    var b = function (c) {
        if (this == window) {
            return new arguments.callee(fbjs_dom.get_obj(c));
        } else {
            fbjs_private.get(this).animation = new animation(c);
            fbjs_private.get(this).animation._show = function () {
                this.obj.style.display = '';
            };
            fbjs_private.get(this).animation._hide = function () {
                this.obj.style.display = 'none';
            };
        }
    };
    for (var a in fbjs_animation.prototype) b.prototype[a] = fbjs_animation.prototype[a];
    b.ease = {
        begin: animation.ease.begin,
        end: animation.ease.end,
        both: animation.ease.both
    };
    return b;
}
fbjs_animation.prototype.stop = function () {
    fbjs_private.get(this).animation.stop();
    return this;
};
fbjs_animation.prototype.to = function (a, b) {
    fbjs_private.get(this).animation.to(a, b);
    return this;
};
fbjs_animation.prototype.by = function (a, b) {
    fbjs_private.get(this).animation.by(a, b);
    return this;
};
fbjs_animation.prototype.from = function (a, b) {
    fbjs_private.get(this).animation.from(a, b);
    return this;
};
fbjs_animation.prototype.duration = function (a) {
    fbjs_private.get(this).animation.duration(a);
    return this;
};
fbjs_animation.prototype.checkpoint = function (b, a) {
    var c = this;
    fbjs_private.get(this).animation.checkpoint(b, typeof a == 'function' ?
    function () {
        try {
            a.call(c);
        } finally {
            fbjs_sandbox.clean_mess();
        }
    } : null);
    return this;
};
fbjs_animation.prototype.ondone = function (a) {
    var b = this;
    if (typeof a == 'function') {
        fbjs_private.get(this).animation.checkpoint(function () {
            try {
                a.call(b);
            } finally {
                fbjs_sandbox.clean_mess();
            }
        });
        return this;
    }
};
fbjs_animation.prototype.blind = function () {
    fbjs_private.get(this).animation.blind();
    return this;
};
fbjs_animation.prototype.show = function () {
    fbjs_private.get(this).animation.show();
    return this;
};
fbjs_animation.prototype.hide = function () {
    fbjs_private.get(this).animation.hide();
    return this;
};
fbjs_animation.prototype.ease = function (a) {
    fbjs_private.get(this).animation.ease(a);
    return this;
};
fbjs_animation.prototype.go = function () {
    fbjs_private.get(this).animation.go();
    return this;
};

function fbjs_livemessage(a) {
    var c = function (e, d) {
        if (!e) throw ('Parameter "event_name" must be non-empty.');
        var f = fbjs_private.get(this);
        f.appid = a;
        f.event_name = e;
        f.send_success_handler = null;
        f.send_error_handler = null;
        f.livemessage = new LiveMessageReceiver(e).setAppId(a).setHandler(d).register();
    };
    for (var b in fbjs_livemessage.prototype) c.prototype[b] = fbjs_livemessage.prototype[b];
    return c;
}
fbjs_livemessage.prototype.send = function (c, a) {
    if (!c) throw ('Parameter "recipient" must be non-empty.');
    var b = fbjs_private.get(this);
    new AsyncRequest().setURI('/fbml/ajax/livemessage_send.php').setData({
        app_id: b.appid,
        recipient: c,
        event_name: b.event_name,
        message: JSON.encode(a)
    }).setMethod('POST').setHandler(function (e) {
        payload = e.getPayload();
        if (payload.error_code) {
            var d = b.send_error_handler;
            if (d) try {
                d(payload.error_code, payload.error_msg, c, a);
            } finally {
                fbjs_sandbox.clean_mess();
            }
        } else {
            var f = b.send_success_handler;
            if (f) try {
                f(c, a);
            } finally {
                fbjs_sandbox.clean_mess();
            }
        }
    }).setErrorHandler(function (e) {
        var d = b.send_error_handler;
        if (d) try {
            d(e.getError(), e.getErrorSummary(), c, a);
        } finally {
            fbjs_sandbox.clean_mess();
        }
    }).send();
};
fbjs_livemessage.prototype.setSendSuccessHandler = function (a) {
    var b = fbjs_private.get(this);
    b.send_success_handler = a;
    return $FBJS.ref(this);
};
fbjs_livemessage.prototype.setSendErrorHandler = function (a) {
    var b = fbjs_private.get(this);
    b.send_error_handler = a;
    return $FBJS.ref(this);
};
fbjs_livemessage.prototype.setShutdownHandler = function (a) {
    var b = fbjs_private.get(this);
    b.livemessage.setShutdownHandler(a);
    return $FBJS.ref(this);
};
fbjs_livemessage.prototype.setRestartHandler = function (a) {
    var b = fbjs_private.get(this);
    b.livemessage.setRestartHandler(a);
    return $FBJS.ref(this);
};

function fbjs_fbml_string(a, b) {
    a = HTML(a);
    if (b) a.setAction(b);
    fbjs_private.get(this).htmlstring = a;
}
fbjs_fbml_string.get = function (a) {
    if (a instanceof fbjs_fbml_string) {
        return fbjs_private.get(a).htmlstring.toString();
    } else return htmlspecialchars(fbjs_sandbox.safe_string(a));
};
fbjs_private = new Object();
fbjs_private.len = 0;
fbjs_private.get = function (a) {
    if (typeof a != 'object') return null;
    if (a == window) throw ('Invalid object supplied');
    if (a.__priv == undefined) {
        var b = {
            data: {},
            instance: a
        };
        a.__priv = fbjs_private.len;
        fbjs_private.len++;
        b.instance = a;
        fbjs_private[a.__priv] = b;
        return b.data;
    } else if (typeof a.__priv == 'number') {
        var b = fbjs_private[a.__priv];
        if (b.instance == a) {
            return b.data;
        } else throw ('Invalid object supplied to fbjs_private.get');
    } else throw ('Invalid object supplied to fbjs_private.get');
};
fbjs_private.remove = function (a) {
    if (a.__priv != undefined) if (fbjs_private[a.__priv].instance == a) {
        delete fbjs_private[a.__priv];
        delete a.__priv;
    }
};

function fbjs_fbml_sanitize(appid) {
    this.appid = appid;
    this.main = eval('a' + appid + '_document');
    return this;
}
fbjs_fbml_sanitize.prototype.parseFBML = function (c) {
    if (window.ActiveXObject) {
        var a = new ActiveXObject("Microsoft.XMLDOM");
        a.async = "false";
        a.loadXML(c);
        if (a.parseError.reason) {
            fbjs_console.error(a.parseError.reason);
            return null;
        }
    } else {
        var b = new DOMParser();
        var a = b.parseFromString(c, "text/xml");
        if (a.documentElement.nodeName == 'parsererror') {
            fbjs_console.error(a.documentElement.textContent);
            return null;
        }
    }
    var d = a.documentElement;
    return this.processElement(d);
};
fbjs_fbml_sanitize.prototype.processElement = function (h) {
    if (h.nodeType == 3) {
        return new fbjs_dom(document.createTextNode(h.nodeValue), this.appid);
    } else if (h.nodeType != 1) return null;
    var e = this.main.createElement(h.nodeName);
    if (!e) return null;
    for (var k = 0; k < h.attributes.length; k++) {
        var b = h.attributes[k];
        var a = b.nodeName;
        if (a == 'style') {
            var f = b.nodeValue.split(";");
            for (var g = 0; g < f.length; g++) if (f[g] != '') {
                var j = f[g].split(":");
                e.setStyle(j[0], j[1].replace(/^\s+|\s+$/g, ''));
            }
        } else {
            setter = fbjs_dom.attr_setters[a];
            if (e[setter]) e[setter](b.nodeValue);
        }
    }
    for (var k = 0; k < h.childNodes.length; k++) {
        var d = h.childNodes[k];
        var c = this.processElement(d);
        if (c) e.appendChild(c);
    }
    return e;
};
Arbiter.inform('fbjs_initialized', null, Arbiter.BEHAVIOR_STATE);

if (window.Bootloader) {
    Bootloader.done(["js\/fbjs.js"]);
}



