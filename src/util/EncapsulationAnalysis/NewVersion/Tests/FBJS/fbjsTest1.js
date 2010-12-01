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
    var c = (new URI()).parse(a);
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
        f.livemessage = (new LiveMessageReceiver(e)).setAppId(a).setHandler(d).register();
    };
    for (var b in fbjs_livemessage.prototype) c.prototype[b] = fbjs_livemessage.prototype[b];
    return c;
}
fbjs_livemessage.prototype.send = function (c, a) {
    if (!c) throw ('Parameter "recipient" must be non-empty.');
    var b = fbjs_private.get(this);
    (new AsyncRequest()).setURI('/fbml/ajax/livemessage_send.php').setData({
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
    this.main = fbjs_main();
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


attacker = [
		new fbjs_math(),
		fbjs_date(),
		new fbjs_string(),
		new fbjs_regexp(),
		fbjs_ajax(),
		new fbjs_main(),
		new fbjs_facebook(),
		fbjs_dialog(),
		new fbjs_animation(),
		new fbjs_livemessage(),
		fbjs_sandbox.set_timeout,
		fbjs_sandbox.set_interval	
	];	
