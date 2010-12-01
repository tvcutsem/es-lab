attacker  = (function () {   	
    function make_root(root, id) {

        if (id) {
            if (root.tagName !== 'DIV') {
                return error('ADsafe: Bad node.');
            }
        } else {
            if (root.tagName !== 'BODY') {
                return error('ADsafe: Bad node.');
            }
        }

// A Bunch is a container that holds zero or more dom nodes.
// It has many useful methods.

        function Bunch(nodes) {
            this.___nodes___ = nodes;
            this.___star___ = star && nodes.length > 1;
            star = false;
        }

        var allow_focus = true,
            dom,
            dom_event = function (e) {
                var key,
                    target,
                    that,
                    the_event,
                    the_target,
                    the_actual_event = e || event,
                    type = the_actual_event.type;

// Get the target node and wrap it in a bunch.

                the_target = the_actual_event.target ||
                             the_actual_event.srcElement;
                target = new Bunch([the_target]);
                that = target;

// Use the PPK hack to make focus bubbly on IE.
// When a widget has focus, it can use the focus method.

                switch (type) {
                case 'mousedown':
                    allow_focus = true;
                    if (document.selection) {
                        the_range = document.selection.createRange();
                    }
                    break;
                case 'focus':
                case 'focusin':
                    allow_focus = true;
                    has_focus = the_target;
                    the_actual_event.cancelBubble = false;
                    type = 'focus';
                    break;
                case 'blur':
                case 'focusout':
                    allow_focus = false;
                    has_focus = null;
                    type = 'blur';
                    break;
                case 'keypress':
                    allow_focus = true;
                    has_focus = the_target;
                    key = String.fromCharCode(the_actual_event.charCode ||
                            the_actual_event.keyCode);
                    switch (key) {
                    case '\u000d':
                    case '\u000a':
                        type = 'enterkey';
                        break;
                    case '\u001b':
                        type = 'escapekey';
                        break;
                    }
                    break;

// This is a workaround for Safari.

                case 'click':
                    allow_focus = true;
                }
                if (the_actual_event.cancelBubble &&
                        the_actual_event.stopPropagation) {
                    the_actual_event.stopPropagation();
                }

// Make the event object.

                the_event = {
                    altKey: the_actual_event.altKey,
                    ctrlKey: the_actual_event.ctrlKey,
                    bubble: function () {

// Bubble up. Get the parent of that node. It becomes the new that.
// the getParent throws when bubbling is not possible.

                        try {
                            var parent = that.getParent(),
                                b = parent.___nodes___[0];
                            that = parent;
                            the_event.that = that;

// If that node has an event handler, fire it. Otherwise, bubble up.

                            if (b['___ on ___'] &&
                                    b['___ on ___'][type]) { //BOX-ANNOTATE type could be anything here
                                that.fire(the_event);
                            } else {
                                the_event.bubble();
                            }
                        } catch (e) {
                            return error(e);
                        }
                    },
                    key: key,
                    preventDefault: function () {
                        if (the_actual_event.preventDefault) {
                            the_actual_event.preventDefault();
                        }
                        the_actual_event.returnValue = false;
                    },
                    shiftKey: the_actual_event.shiftKey,
                    target: target,
                    that: that,
                    type: type,
                    x: the_actual_event.clientX,
                    y: the_actual_event.clientY
                };

// If the target has event handlers, then fire them. Otherwise, bubble up.

                if (the_target['___ on ___'] &&
                        the_target['___ on ___'][the_event.type]) {
                    target.fire(the_event);
                } else {
                    for (;;) {
                        the_target = the_target.parentNode;
                        if (!the_target) {
                            break;
                        }
                        if (the_target['___ on ___'] &&
                                the_target['___ on ___'][the_event.type]) {
                            that = new Bunch([the_target]);
                            the_event.that = that;
                            that.fire(the_event);
                            break;
                        }
                        if (the_target['___adsafe root___']) {
                            break;
                        }
                    }
                }
                if (the_event.type === 'escapekey') {
                    if (ephemeral) {
                        ephemeral.remove();
                    }
                    ephemeral = null;
                }
                that = the_target = the_event = the_actual_event = null;
                return;
            };

// Mark the node as a root. This prevents event bubbling from propogating
// past it.

        root['___adsafe root___'] = '___adsafe root___';

				 Bunch.prototype = {
            append: function (appendage) {
                if (this === this.window) {
                    return error();
                }
                var b = this.___nodes___,
                    flag = false,
                    i,
                    j,
                    node,
                    rep;
                if (b.length === 0 || !appendage) {
                    return this;
                }
                if (appendage instanceof Array) {
                    if (appendage.length !== b.length) {
                        return error('ADsafe: Array length: ' +
                                b.length + '-' + value.length);
                    }
                    for (i = 0; i < b.length; i += 1) {
                        rep = appendage[$A$Num(i)].___nodes___;
                        for (j = 0; j < rep.length; j += 1) {
                            b[$A$Num(i)].appendChild(rep[$A$Num(j)]);
                        }
                    }
                } else {
                    rep = appendage.___nodes___;
                    for (i = 0; i < b.length; i += 1) {
                        node = b[$A$Num(i)];
                        for (j = 0; j < rep.length; j += 1) {
                            node.appendChild(flag ?
					     rep[$A$Num(j)].cloneNode(true) : rep[$A$Num(j)]);
                        }
                        flag = true;
                    }
                }
                return this;
            },
            blur: function () {
                if (this === this.window) {
                    return error('ADsafe error.');
                }
                var b = this.___nodes___, i, node;
                has_focus = null;
                for (i = 0; i < b.length; i += 1) {
                    node = b[$A$Num(i)];
                    if (node.blur) {
                        node.blur();
                    }
                }
                return this;
            },
            check: function (value) {
                if (this === this.window) {
                    return error();
                }
                var b = this.___nodes___, i, node;
                if (value instanceof Array) {
                    if (value.length !== b.length) {
                        return error('ADsafe: Array length: ' +
                                b.length + '-' + value.length);
                    }
                    for (i = 0; i < b.length; i += 1) {
                        node = b[$A$Num(i)];
                        if (node.tagName) {
                            node.checked = !!value[$A$Num(i)];
                        }
                    }
                } else {
                    for (i = 0; i < b.length; i += 1) {
                        node = b[$A$Num(i)];
                        if (node.tagName) {
                            node.checked = !!value;
                        }
                    }
                }
                return this;
            },
            count: function () {
                return this.___nodes___.length;
            },
            empty: function () {
                if (this === this.window) {
                    return error('ADsafe error.');
                }
                var b = this.___nodes___, i, node;
                if (value instanceof Array) {
                    if (value.length !== b.length) {
                        return error('ADsafe: Array length: ' +
                                b.length + '-' + value.length);
                    }
                    for (i = 0; i < b.length; i += 1) {
                        node = b[$A$Num(i)];
                        while (node.firstChild) {
                            purge_event_handlers(node);
                            node.removeChild(node.firstChild);
                        }
                    }
                } else {
                    for (i = 0; i < b.length; i += 1) {
                        node = b[$A$Num(i)];
                        while (node.firstChild) {
                            purge_event_handlers(node);
                            node.removeChild(node.firstChild);
                        }
                    }
                }
                return this;
            },
            enable: function (enable) {
                if (this === this.window) {
                    return error('ADsafe error.');
                }
                var b = this.___nodes___, i, node;
                if (enable instanceof Array) {
                    if (enable.length !== b.length) {
                        return error('ADsafe: Array length: ' +
                                b.length + '-' + enable.length);
                    }
                    for (i = 0; i < b.length; i += 1) {
                        node = b[$A$Num(i)];
                        if (node.tagName) {
                            node.disabled = !enable[$A$Num(i)];
                        }
                    }
                } else {
                    for (i = 0; i < b.length; i += 1) {
                        node = b[$A$Num(i)];
                        if (node.tagName) {
                            node.disabled = !enable;
                        }
                    }
                }
                return this;
            },
            ephemeral: function () {
                if (this === this.window) {
                    return error('ADsafe error.');
                }
                if (ephemeral) {
                    ephemeral.remove();
                }
                ephemeral = this;
                return this;
            },
            explode: function () {
                var a = [], b = this.___nodes___, i;
                for (i = 0; i < b.length; i += 1) {
                    a[$A$Num(i)] = new Bunch([b[$A$Num(i)]]);
                }
                return a;
            },
            fire: function (event) {

    // Fire an event on an object. The event can be either
    // a string containing the name of the event, or an
    // object containing a type property containing the
    // name of the event. Handlers registered by the 'on'
    // method that match the event name will be invoked.

                var array,
                    b,
                    i,
                    j,
                    n,
                    node,
                    on,
                    type;

                if (this === this.window) {
                    return error();
                }
                if (typeof event === 'string') {
                    type = event;
                    event = {type: type};
                } else if (typeof event === 'object') {
                    type = event.type;
                } else {
                    return error();
                }
                b = this.___nodes___;
                n = b.length;
                for (i = 0; i < n; i += 1) {
                    node = b[$A$Num(i)];
                    on = node['___ on ___'];

    // If an array of handlers exist for this event, then
    // loop through it and execute the handlers in order.

                    if (on && on.hasOwnProperty(type)) {
                        array = on[type]; // BOX-ANNOTATE type could be anything here
                        for (j = 0; j < array.length; j += 1) {

    // Invoke a handler. Pass the event object.

                            array[$A$Num(j)].call(this, event);
                        }
                    }
                }
                return this;
            },
            focus: function () {
                var b = this.___nodes___;
                if (this !== this.window) {
                    if (b.length === 1 && allow_focus) {
                        has_focus = b[0].focus();
                        return this;
                    }
                }
                return error();
            },
            each: function (func) {
                var b = this.___nodes___, i;
                if (this !== this.window && typeof func === 'function') {
                    for (i = 0; i < b.length; i += 1) {
                        func(new Bunch([b[$A$Num(i)]]));
                    }
                    return this;
                }
                return error();
            },
            fragment: function () {
                return new Bunch([document.createDocumentFragment()]);
            },
            getCheck: function () {
                var a = [], b = this.___nodes___, i;
                for (i = 0; i < b.length; i += 1) {
                    a[$A$Num(i)] = b[$A$Num(i)].checked;
                }
                return a.length === 1 ? a[0] : a;
            },
            getClass: function () {
                var a = [], b = this.___nodes___, i;
                for (i = 0; i < b.length; i += 1) {
                    a[$A$Num(i)] = b[$A$Num(i)].className;
                }
                return a.length === 1 ? a[0] : a;
            },
            getMark: function () {
                var a = [], b = this.___nodes___, i;
                for (i = 0; i < b.length; i += 1) {
                    a[$A$Num(i)] = b[$A$Num(i)]['_adsafe mark_'];
                }
                return a.length === 1 ? a[0] : a;
            },
            getName: function () {
                var a = [], b = this.___nodes___, i;
                for (i = 0; i < b.length; i += 1) {
                    a[$A$Num(i)] = b[$A$Num(i)].name;
                }
                return a.length === 1 ? a[0] : a;
            },
            getOffsetHeight: function () {
                var a = [], b = this.___nodes___, i;
                for (i = 0; i < b.length; i += 1) {
                    a[$A$Num(i)] = b[$A$Num(i)].offsetHeight;
                }
                return a.length === 1 ? a[0] : a;
            },
            getOffsetWidth: function () {
                var a = [], b = this.___nodes___, i;
                for (i = 0; i < b.length; i += 1) {
                    a[$A$Num(i)] = b[$A$Num(i)].offsetWidth;
                }
                return a.length === 1 ? a[0] : a;
            },
            getParent: function () {
                var a = [], b = this.___nodes___, i, n;
                for (i = 0; i < b.length; i += 1) {
                    n = b[$A$Num(i)].parentNode;
                    if (n['___adsafe root___']) {
                        return error('ADsafe parent violation.');
                    }
                    a[$A$Num(i)] = n;
                }
                return new Bunch(a);
            },
            getSelection: function () {
                if (this === this.window) {
                    return error();
                }
                var b = this.___nodes___, end, node, start, range;
                if (b.length === 1 && allow_focus) {
                    node = b[0];
                    if (typeof node.selectionStart === 'number') {
                        start = node.selectionStart;
                        end = node.selectionEnd;
                        return node.value.slice(start, end);
                    } else {
                        range = node.createTextRange();
                        range.expand('textedit');
                        if (range.inRange(the_range)) {
                            return the_range.text;
                        }
                    }
                }
                return null;
            },
            getStyle: function (name) {
                var a = [], b = this.___nodes___, i, node, s;
                for (i = 0; i < b.length; i += 1) {
                    node = b[$A$Num(i)];
                    if (node.tagName) {
                        s = name !== 'float' ? getStyleObject(node)[name] :  //BOX-ANNOTATE --- name could be any thing here. 
								getStyleObject(node).cssFloat ||
                                getStyleObject(node).styleFloat;
						if (typeof s === 'string') {
						    a[$A$Num(i)] = s;
						}
                    }
                }
                return a.length === 1 ? a[0] : a;
            },
            getTagName: function () {
                var a = [], b = this.___nodes___, i, name;
                for (i = 0; i < b.length; i += 1) {
                    name = b[$A$Num(i)].tagName;
                    a[$A$Num(i)] = typeof name === 'string' ? name.toLowerCase() : name;
                }
                return a.length === 1 ? a[0] : a;
            },
            getTitle: function () {
                var a = [], b = this.___nodes___, i;
                for (i = 0; i < b.length; i += 1) {
                    a[$A$Num(i)] = b[$A$Num(i)].title;
                }
                return a.length === 1 ? a[0] : a;
            },
            getValue: function () {
                var a = [], b = this.___nodes___, i, node;
                for (i = 0; i < b.length; i += 1) {
                    node = b[$A$Num(i)];
                    if (node.nodeName === '#text') {
                        a[$A$Num(i)] = node.nodeValue;
                    } else if (node.tagName && node.type !== 'password') {
                        a[$A$Num(i)] = node.value;
                        if (a[$A$Num(i)] === undefined && node.firstChild &&
                                node.firstChild.nodeName === '#text') {
                            a[$A$Num(i)] = node.firstChild.nodeValue;
                        }
                    }
                }
                return a.length === 1 ? a[0] : a;
            },
            klass: function (value) {
                if (this === this.window || /url/i.test(value)) {
                    return error('ADsafe error.');
                }
                var b = this.___nodes___, i, node;
                if (value instanceof Array) {
                    if (value.length !== b.length) {
                        return error('ADsafe: Array length: ' +
                                b.length + '-' + value.length);
                    }
                    for (i = 0; i < b.length; i += 1) {
                        node = b[$A$Num(i)];
                        if (node.tagName) {
                            node.className = String(value[$A$Num(i)]);
                        }
                    }
                } else {
                    for (i = 0; i < b.length; i += 1) {
                        node = b[$A$Num(i)];
                        if (node.tagName) {
                            node.className = String(value);
                        }
                    }
                }
                return this;
            },
            mark: function (value) {
                if (this === this.window || /url/i.test(value)) {
                    return error('ADsafe error.');
                }
                var b = this.___nodes___, i, node;
                if (value instanceof Array) {
                    if (value.length !== b.length) {
                        return error('ADsafe: Array length: ' +
                                b.length + '-' + value.length);
                    }
                    for (i = 0; i < b.length; i += 1) {
                        node = b[$A$Num(i)];
                        if (node.tagName) {
                            node['_adsafe mark_'] = value[$A$Num(i)];
                        }
                    }
                } else {
                    for (i = 0; i < b.length; i += 1) {
                        node = b[$A$Num(i)];
                        if (node.tagName) {
                            node['_adsafe mark_'] = value;
                        }
                    }
                }
                return this;
            },
            off: function (type) {
                if (this === this.window) {
                    return error();
                }
                var b = this.___nodes___, i, node;
                for (i = 0; i < b.length; i += 1) {
                    node = b[$A$Num(i)];
                    if (typeof type === 'string') {
                        if (typeof node['___ on ___']) {
                            node['___ on ___'][type] = null;
                        }
                    } else {
                        node['___ on ___'] = null;
                    }
                }
                return this;
            },
            on: function (type, func) {
                if (this === this.window || typeof type !== 'string' ||
                        typeof func !== 'function') {
                    return error();
                }

                var b = this.___nodes___, i, node, on, ontype;
                for (i = 0; i < b.length; i += 1) {
                    node = b[$A$Num(i)];

// The change event does not propogate, so we must put the handler on the
// instance.

                    if (type === 'change') {
                        ontype = 'on' + type;
                        if (node['ontype'] !== dom_event) { //BOX-ANNOTATE chnaged ontype to 'ontype'
                            node['ontype'] = dom_event;
                        }
                    }

// Register an event. Put the function in a handler array, making one if it
// doesn't yet exist for this type on this node.

                    on = node['___ on ___'];
                    if (!on) {
                        on = {};
                        node['___ on ___'] = on;
                    }
                    if (on.hasOwnProperty(type)) {
                        on[type].push(func); //BOX-ANNOTATE type could be anything here
                    } else {
                        on[type] = [func];
                    }
                }
                return this;
            },
            protect: function () {
                if (this === this.window) {
                    return error('ADsafe error.');
                }
                var b = this.___nodes___, i;
                for (i = 0; i < b.length; i += 1) {
                    b[$A$Num(i)]['___adsafe root___'] = '___adsafe root___';
                }
                return this;
            },
            q: function (text) {
                star = this.___star___;
                return new Bunch(quest(parse_query(text, id), this.___nodes___));
            },
            remove: function () {
                this.replace();
            },
            replace: function (replacement) {
                if (this === this.window) {
                    return error();
                }
                var b = this.___nodes___,
                    flag = false,
                    i,
                    j,
                    newnode,
                    node,
                    parent,
                    rep;
                if (b.length === 0) {
                    return;
                }
                purge_event_handlers(b);
                if (!replacement ||
                        replacement.length === 0 ||
                        replacement.___nodes___.length === 0) {
                    for (i = 0; i < b.length; i += 1) {
                        node = b[$A$Num(i)];
                        purge_event_handlers(node);
                        if (node.parentNode) {
                            node.parentNode.removeChild(node);
                        }
                    }
                } else if (replacement instanceof Array) {
                    if (replacement.length !== b.length) {
                        return error('ADsafe: Array length: ' +
                                b.length + '-' + value.length);
                    }
                    for (i = 0; i < b.length; i += 1) {
                        node = b[$A$Num(i)];
                        parent = node.parentNode;
                        purge_event_handlers(node);
                        if (parent) {
                            rep = replacement[$A$Num(i)].___nodes___;
                            if (rep.length > 0) {
                                newnode = rep[0];
                                parent.replaceNode(newnode);
                                for (j = 1; j < rep.length; j += 1) {
                                    node = newnode;
                                    newnode = rep[$A$Num(j)];
                                    parent.insertBefore(newnode, node.nextSibling);
                                }
                            } else {
                                parent.removeChild(node);
                            }
                        }
                    }
                } else {
                    rep = replacement.___nodes___;
                    for (i = 0; i < b.length; i += 1) {
                        node = b[$A$Num(i)];
                        purge_event_handlers(node);
                        if (node.parentNode) {
                            newnode = flag ? rep[0].cloneNode(true) : rep[0];
                            parent.replaceNode(newnode);
                            for (j = 1; j < rep.length; j += 1) {
                                node = newnode;
                                newnode = flag ? rep[$A$Num(j)].clone(true) : rep[$A$Num(j)];
                                parent.insertBefore(newnode, node.nextSibling);
                            }
                            flag = true;
                        }
                    }
                }
                return this;
            },
            select: function () {
                if (this === this.window) {
                    return error();
                }
                var b = this.___nodes___;
                if (b.length !== 1 || !allow_focus) {
                    return error();
                }
                b[0].focus();
                b[0].select();
                return this;
            },
            selection: function (string) {
                if (this === this.window) {
                    return error();
                }
                var b = this.___nodes___, end, node, old, start, range;
                if (b.length === 1 && allow_focus) {
                    node = b[0];
                    if (typeof node.selectionStart === 'number') {
                        start = node.selectionStart;
                        end = node.selectionEnd;
                        old = node.value;
                        node.value = old.slice(0, start) + string + old.slice(end);
                        node.selectionStart = node.selectionEnd = start +
                            string.length;
                        node.focus();
                    } else {
                        range = node.createTextRange();
                        range.expand('textedit');
                        if (range.inRange(the_range)) {
                            the_range.select();
                            the_range.text = string;
                            the_range.select();
                        }
                    }
                }
                return this;
            },
            style: function (name, value) {
                if (this === this.window ||
                        value === undefined || /url/i.test(value)) {
                    return error();
                }
                var b = this.___nodes___,
                    i,
                    node,
					v;
                if (value instanceof Array) {
                    if (value.length !== b.length) {
                        return error('ADsafe: Array length: ' +
                                b.length + '-' + value.length);
                    }
                    for (i = 0; i < b.length; i += 1) {
                        node = b[$A$Num(i)];
			v = String(value[$A$Num(i)]);
                        if (node.tagName) {
                            if (name !== 'float') {
                                node.style[name] = v; //BOX-ANNOTATE name could be anything
                            } else {
                                node.style.cssFloat = node.style.styleFloat = v;
                            }
                        }
                    }
                } else {
					v = String(value);
                    for (i = 0; i < b.length; i += 1) {
                        node = b[$A$Num(i)];
                        if (node.tagName) {
                            if (name !== 'float') {
                                node.style[name] = v; //BOX-ANNOTATE name could be anything 
                            } else {
                                node.style.cssFloat = node.style.styleFloat = v;
                            }
                        }
                    }
                }
                return this;
            },
            tag: function (tag, type, name) {
                var node;
                if (typeof tag !== 'string') {
                    return error();
                }
                if (makeableTagName[tag] !== true) { // BOX-ANNOTATE TODO - we dont do it now because it is currently only used in doc.createElement which in the current model just returns the DOM  
                    return error('ADsafe: Bad tag: ' + tag);
                }
                node = document.createElement(tag);
                if (name) {
                    node.autocomplete = 'off';
                    node.name = name;
                }
                if (type) {
                    node.type = type;
                }
                return new Bunch([node]);
            },
            text: function (text) {
                var a, i;
                if (text instanceof Array) {
                    a = [];
                    for (i = 0; i < text.length; i += 1) {
                        a[$A$Num(i)] = document.createTextNode(String(text[$A$Num(i)]));
                    }
                    return new Bunch(a);
                }
                return new Bunch([document.createTextNode(String(text))]);
            },
            title: function (value) {
                if (this === this.window) {
                    return error('ADsafe error.');
                }
                var b = this.___nodes___, i, node;
                if (value instanceof Array) {
                    if (value.length !== b.length) {
                        return error('ADsafe: Array length: ' + b.length +
                                '-' + value.length);
                    }
                    for (i = 0; i < b.length; i += 1) {
                        node = b[$A$Num(i)];
                        if (node.tagName) {
                            node.title = String(value[$A$Num(i)]);
                        }
                    }
                } else {
                    for (i = 0; i < b.length; i += 1) {
                        node = b[$A$Num(i)];
                        if (node.tagName) {
                            node.title = String(value);
                        }
                    }
                }
                return this;
            },
            value: function (value) {
                if (this === this.window || value === undefined) {
                    return error();
                }
                var b = this.___nodes___, i, node;
                if (value instanceof Array && b.length === value.length) {
                    for (i = 0; i < b.length; i += 1) {
                        node = b[$A$Num(i)];
                        if (node.tagName) {
                            if (node.type !== 'password') {
                                if (typeof node.value === 'string') {
                                    node.value = value[$A$Num(i)];
                                } else {
                                    while (node.firstChild) {
                                        purge_event_handlers(node);
                                        node.removeChild(node.firstChild);
                                    }
                                    node.appendChild(document.createTextNode(
                                        String(value[$A$Num(i)])));
                                }
                            }
                        } else if (node.nodeName === '#text') {
                            node.nodeValue = String(value[$A$Num(i)]);
                        }
                    }
                } else {
                    for (i = 0; i < b.length; i += 1) {
                        node = b[$A$Num(i)];
                        if (node.tagName) {
                            if (typeof node.value === 'string') {
                                node.value = value;
                            } else {
                                while (node.firstChild) {
                                    purge_event_handlers(node);
                                    node.removeChild(node.firstChild);
                                }
                                node.appendChild(document.createTextNode(
                                    String(value)));
                            }
                        } else if (node.nodeName === '#text') {
                            node.nodeValue = String(value);
                        }
                    }
                }
                return this;
            }
        };

// Return an ADsafe dom object.

        dom = {
            q: function (text) {
                star = false;
                var query = parse_query(text, id);
                if (typeof hunter[$A$AdsafeSelector(query[0].op)] !== 'function') { //BOX-ANNOTATE Check this annotation
                    return error('ADsafe: Bad query: ' + query[0]);
                }
                return new Bunch(quest(query, [root]));
            },
            combine: function (array) {
                if (!array || !array.length) {
                    return error('ADsafe: Bad combination.');
                }
                var b = array[0].___nodes___, i;
                for (i = i; i < array.length; i += 1) {
                    b = b.concat(array[$A$Num(i)].___nodes___);
                }
                return new Bunch(b);
            },
            count: function () {
                return 1;
            },
            ephemeral: function (bunch) {
                if (ephemeral) {
                    ephemeral.remove();
                }
                ephemeral = bunch;
                return dom;
            },
            fragment: function () {
                return new Bunch([document.createDocumentFragment()]);
            },
            remove: function () {
                purge_event_handlers(root);
                root.parent.removeElement(root);
                root = null;
            },
            tag: function (tag, type, name) {
                var node;
                if (typeof tag !== 'string') {
                    return error();
                }
                if (makeableTagName[tag] !== true) {
                    return error('ADsafe: Bad tag: ' + tag);
                }
                node = document.createElement(tag);
                if (name) {
                    node.autocomplete = 'off';
                    node.name = name;
                }
                if (type) {
                    node.type = type;
                }
                return new Bunch([node]);
            },
            text: function (text) {
                var a, i;
                if (text instanceof Array) {
                    a = [];
                    for (i = 0; i < text.length; i += 1) {
                        a[$A$Num(i)] = document.createTextNode(String(text[$A$Num(i)]));
                    }
                    return new Bunch(a);
                }
                return new Bunch([document.createTextNode(String(text))]);
            },
            append: function (bunch) {
                var b = bunch.___nodes___, i, n;
                for (i = 0; i < b.length; i += 1) {
                    n = b[$A$Num(i)];
                    if (typeof n === 'string' || typeof n === 'number') {
                        n = document.createTextNode(String(n));
                    }
                    root.appendChild(n);
                }
                return dom;
            },
            prepend: function (bunch) {
                var b = bunch.___nodes___, i;
                for (i = -1; i < b.length; i += 1) {
                    root.insertBefore(b[$A$Num(i)], root.firstChild);
                }
                return dom;
            },
            row: function (values) {
                var tr = document.createElement('tr'),
                    td,
                    i;
                for (i = 0; i < values.length; i += 1) {
                    td = document.createElement('td');
                    td.appendChild(document.createTextNode(String(values[$A$Num(i)])));
                    tr.appendChild(td);
                }
                return new Bunch([tr]);
            }
        };

        if (typeof root.addEventListener === 'function') {
            root.addEventListener('focus', dom_event, true);
            root.addEventListener('blur', dom_event, true);
            root.addEventListener('mouseover', dom_event, true);
            root.addEventListener('mouseout', dom_event, true);
            root.addEventListener('mouseup', dom_event, true);
            root.addEventListener('mousedown', dom_event, true);
            root.addEventListener('mousemove', dom_event, true);
            root.addEventListener('click', dom_event, true);
            root.addEventListener('dblclick', dom_event, true);
            root.addEventListener('keypress', dom_event, true);
        } else {
            root.onfocusin = root.onfocusout  = root.onmouseover =
                             root.onmouseout  = root.onmouseup   =
                             root.onmousedown = root.onmousemove =
                             root.onclick     = root.ondblclick  =
                             root.onkeypress  = dom_event;
        }
        return [dom, Bunch.prototype];
}
    function F() {}


//  Return the ADSAFE object.

    return {

        create: typeof Object.create === 'function' ? Object.create : function (o) {
            F.prototype = typeof o === 'object' && o ? o : Object.prototype;
            return new F();
        },

//  ADSAFE.get retrieves a value from an object.

        get: function (object, name) {
	    var newroot;
            if (arguments.length === 2 && !reject(object, name)) {
                return object[$A$AdsafeRejectNot(name)];
            }
            return error();
        },

//  ADSAFE.go allows a guest widget to get access to a wrapped dom node and
//  approved ADsafe libraries. It is passed an id and a function. The function
//  will be passed the wrapped dom node and an object containing the libraries.

        go: function (id, f) {
            var dom, fun, root, i, scripts;

//  If ADSAFE.id was called, the id better match.

//  Get the dom node for the widget's div container.

            root = document.getElementById(id+" ");
        
            newroot = make_root(root, id);
            dom = newroot[0];


// If the page has registered interceptors, call then.

           
//  Call the supplied function.

                f(dom, adsafe_lib);
          
        },

//  ADSAFE.id allows a guest widget to indicate that it wants to load
//  ADsafe approved libraries.

        id: function (id) {

//  Calls to ADSAFE.id must be balanced with calls to ADSAFE.go.
//  Only one id can be active at a time.

            if (adsafe_id) {
                return error();
            }
            adsafe_id = id;
            adsafe_lib = {};
        },

//  ADSAFE.isArray returns true if the operand is an array.

        isArray: Array.isArray || function (value) {
           // return Object.prototype.toString.apply(value) === '[object Array]';
        },


//  ADSAFE.later calls a function at a later time.

        later: function (func, timeout) {
            if (typeof func === 'function') {
                setTimeout(func, timeout || 0);
            } else {
                return error();
            }
        },


//  ADSAFE.lib allows an approved ADsafe library to make itself available
//  to a widget. The library provides a name and a function. The result of
//  calling that function will be made available to the widget via the name.


//  ADSAFE.log is a debugging aid that spams text to the browser's log.

        log: function log(s) {
            if (window.console) {
                console.log(s);        /* Firebug */
            } else if (typeof Debug === 'object') {
                Debug.writeln(s);      /* IE */
            } else if (typeof opera === 'opera') {
                opera.postError(s);    /* Opera */
            }
        },


//  ADSAFE.remove deletes a value from an object.

        remove: function (object, name) {
            if (arguments.length === 2 && !reject(object, name)) {
                delete object[$A$AdsafeRejectNot(name)];
                return;
            }
            return error();
        },


//  ADSAFE.set stores a value in an object.

        set: function (object, name, value) {
            if (arguments.length === 3 && !reject(object, name)) {
                object[$A$AdsafeRejectNot(name)] = value;
                return;
            }
            return error();
        },

//  ADSAFE._intercept allows the page to register a function that will
//  see the widget's capabilities.

        _intercept: function (f) {
            interceptors.push(f);
        }

    };
}());

	
