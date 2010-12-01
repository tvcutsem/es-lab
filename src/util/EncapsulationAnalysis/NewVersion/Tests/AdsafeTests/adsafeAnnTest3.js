attacker  = (function () {   	
    var adsafe_id,      // The id of the current widget
        adsafe_lib,     // The script libraries loaded by the current widget

// These member names are banned from guest scripts. The ADSAFE.get and
// ADSAFE.put methods will not allow access to these properties.

      
        name,
        pecker,     // set of pecker patterns
        result,
        star,
        the_range,
        value;


//  The error function is called if there is a violation or confusion.
//  It throws an exception.

  

    hunter = {

// These functions implement the hunter behaviors.

        '': function (node) {
            var e = node.getElementsByTagName(name), i;
            for (i = 0; i < 1000; i += 1) {
                if (e[$A$Num(i)]) {
                    result.push(e[$A$Num(i)]);
                } else {
                    break;
                }
            }
        },
        '+': function (node) {
            node = node.nextSibling;
            name = name.toUpperCase();
            while (node && !node.tagName) {
                node = node.nextSibling;
            }
            if (node && node.tagName === name) {
                result.push(node);
            }
        },
        '>': function (node) {
            node = node.firstChild;
            name = name.toUpperCase();
            while (node) {
                if (node.tagName === name) {
                    result.push(node);
                }
                node = node.nextSibling;
            }
        },
        '#': function (node) {
            var n = document.getElementById(name);
            if (n.tagName) {
                result.push(n);
            }
        },
        '/': function (node) {
            var e = node.childNodes, i;
            for (i = 0; i < e.length; i += 1) {
                result.push(e[$A$Num(i)]);
            }
        },
        '*': function (node) {
            star = true;
            walkTheDOM(node, function (node) {
                result.push(node);
            }, true);
        }
    };

    pecker = {
        '.': function (node) {
            return (' ' + node.className + ' ').indexOf(' ' + name + ' ') >= 0;
        },
        '&': function (node) {
            return node.name === name;
        },
        '_': function (node) {
            return node.type === name;
        },
        '[': function (node) {
            return typeof node[$A$Dom(name)] === 'string';
        },
        '[=': function (node) {
            var member = node[$A$Dom(name)];
            return typeof member === 'string' && member === value;
        },
        '[!=': function (node) {
            var member = node[$A$Dom(name)];
            return typeof member === 'string' && member !== value;
        },
        '[^=': function (node) {
            var member = node[$A$Dom(name)];
            return typeof member === 'string' &&
                member.slice(0, member.length) === value;
        },
        '[$=': function (node) {
            var member = node[$A$Dom(name)];
            return typeof member === 'string' &&
                member.slice(-member.length) === value;
        },
        '[*=': function (node) {
            var member = node[$A$Dom(name)];
            return typeof member === 'string' &&
                member.slice.indexOf(value) >= 0;
        },
        '[~=': function (node) {
            var member = node[$A$Dom(name)];
            return typeof member === 'string' &&
                (' ' + member + ' ').slice.indexOf(' ' + value + ' ') >= 0;
        },
        '[|=': function (node) {
            var member = node[$A$Dom(name)];
            return typeof member === 'string' &&
                ('-' + member + '-').slice.indexOf('-' + value + '-') >= 0;
        },
        ':blur': function (node) {
            return node !== has_focus;
        },
        ':checked': function (node) {
            return node.checked;
        },
        ':disabled': function (node) {
            return node.tagName && node.disabled;
        },
        ':enabled': function (node) {
            return node.tagName && !node.disabled;
        },
        ':even': function (node) {
            var f;
            if (node.tagName) {
                f = flipflop;
                flipflop = !flipflop;
                return f;
            } else {
                return false;
            }
        },
        ':focus': function (node) {
            return node === has_focus;
        },
        ':hidden': function (node) {
            return node.tagName && getStyleObject(node).visibility !== 'visible';
        },
        ':odd': function (node) {
            if (node.tagName) {
                flipflop = !flipflop;
                return flipflop;
            } else {
                return false;
            }
        },
        ':tag': function (node) {
            return node.tagName;
        },
        ':text': function (node) {
            return node.nodeName === '#text';
        },
        ':trim': function (node) {
            return node.nodeName !== '#text' || /\W/.test(node.nodeValue);
        },
        ':unchecked': function (node) {
            return node.tagName && !node.checked;
        },
        ':visible': function (node) {
            return node.tagName && getStyleObject(node).visibility === 'visible';
        }
    };


    function quest(query, nodes) {
        var selector, func, i, j;

// Step through each selector.

           
          //  func = hunter[$A$AdsafeSelecter(selector.op)]; // BOX-ANNOTATE Check this annotation (can use hasOwnProperty on hunter)

// There are two kinds of selectors: hunters and peckers. If this is a hunter,
// loop through the the nodes, passing each node to the hunter function.
// Accumulate all the nodes it finds.


// If this is a pecker, get its function. There is a special case for
// the :first and :rest selectors because they are so simple.

             
	   // func = pecker[$A$AdsafeSelector(selector.op)]; // BOX-ANNOTATE Check this annotation (can use hasOwnProperty on pecker)
		    nodes.a();
                
// For the other selectors, make an array of nodes that are filtered by
// the pecker function.

                    result = [];
                  
        nodes = result;        
      //  return result;
    }


    function make_root(root, id) {

// A Bunch is a container that holds zero or more dom nodes.
// It has many useful methods.

       

	Bunch ={}
	Bunch.prototype = {
           
            q: function (text) {
		quest("", this.___nodes___);
                return  {};
            }
        };

//

    
        return [ Bunch.prototype];
}


//  Return the ADSAFE object.

    return {

      
//  ADSAFE.go allows a guest widget to get access to a wrapped dom node and
//  approved ADsafe libraries. It is passed an id and a function. The function
//  will be passed the wrapped dom node and an object containing the libraries.

        go: function (id, f) {
           
            root = document.getElementById(id+" ");
           


            newroot = make_root(root, id);
            dom = newroot[0];

                f(dom, adsafe_lib);
            
           
	    adsafe_lib =  {};

        },


//  ADSAFE.lib allows an approved ADsafe library to make itself available
//  to a widget. The library provides a name and a function. The result of
//  calling that function will be made available to the widget via the name.

        lib: function (name, f) {
            if (!adsafe_id) {
                return error();
            }
            adsafe_lib[$A$AdsafeRejectNot(name)] = f(adsafe_lib);
        }

    };
}());

	
