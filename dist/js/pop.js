if (window.M === undefined) {
  (function(root) {

    var definedModules = [];

    var contains = function(arr, key, value) {
      if (arr.filter(function(body) { return body[key] === value; }).length > 0) {
        return true;
      } else {
        return false;
      }
    };

    var fetch = function(arr, key, value) {
      return arr.filter(function(body) { return body[key] === value; })[0];
    };

    root.M = {

      define: function(name, dependency, module) {

        if (contains(definedModules, "name", name)) {
          console.warn("Module had been defined.");
          return;
        }

        definedModules.push({
          name: name,
          factory: module,
          dependency: dependency
        });
      },

      extend: function(name, module) {
        if (contains(definedModules, "name", name)) {
          var source = M.require(name);
          var entity = module(source);

          for (var prop in entity) {
            source[prop] = entity[prop];
          }

          fetch(definedModules, "name", name).entity = source;
        }
      },

      require: function(name) {
        if (contains(definedModules, "name", name)) {
          var module = fetch(definedModules, "name", name);
          if (module.entity === undefined) {
            var args = [];
            for (var i = 0; i < module.dependency.length; i++) {
              args.push(M.require(module.dependency[i]));
            }
            module.entity = module.factory.apply(null, args);
          }

          return module.entity;
        } else {
          console.warn("Module \"" + name + "\" not exists.");
          return null;
        }
      }
    };
  })(window);
}

M.define("Pop/DomHelper", [], function() {
  var DomElement = function() {
    this.thisElement = null;
  };

  DomElement.prototype.create = function(args, retIndex) {
    for (var i in args) {
      var arg = args[i];
      var el = document.createElement(arg.tag === undefined ? "div" : arg.tag);
      el.id = arg.id === undefined ? "" : arg.id;
      el.className = arg.className === undefined ? "" : arg.className;
      this.thisElement.appendChild(el);
    }

    var domEl = new DomElement();
    domEl.root = this.root;
    domEl.thisElement = this.thisElement.children[retIndex === undefined ? 0 : retIndex];
    return domEl;
  };

  DomElement.prototype.render = function() {
    document.body.appendChild(this.root.thisElement);
  };

  DomElement.prototype.toString = function() {
    return this.root.thisElement.innerHTML;
  };

  var create = function(id) {
    var domEl = new DomElement();
    domEl.root = domEl;
    domEl.thisElement = document.createElement("div");
    domEl.thisElement.id = id;

    return domEl;
  };

  return {
    create: create
  };
});

M.define("Pop/Pop", ["Pop/DomHelper"], function(DomHelper) {
  var isShown = false;
  var isExiting = false;
  var isRejecting = false;
  var isNoticing = false;
  var coreEl = null;
  var overlayEl = null;
  var rootEl = null;

  var defaultLabels = { ok: "OK", cancel: "Cancel", confirm: "Confirm", yes: "Yes", no: "No" };
  var dismissOutside = false;
  var result;

  var setDefaultLabel = function(key, value) {
    defaultLabels[key] = value;
  };

  var getDefaultLabel = function(key, value) {
    return defaultLabels[key];
  };

  var setDismissWhenTouchOutside = function(value) {
    dismissOutside = value;
  };

  var makeFrame = function() {
    DomHelper.create("pop-overlay").render();

    DomHelper.create("pop-root").create([
      { className: "pop-wrapper" }
    ]).create([
      { className: "pop-inner-wrapper" }
    ]).create([
      { className: "pop-core" }
    ]).render();

    isShown = true;
    coreEl = document.getElementsByClassName("pop-core")[0];
    overlayEl = document.getElementById("pop-overlay");
    rootEl = document.getElementById("pop-root");

    rootEl.onclick = function() {
      if (isExiting) {
        return;
      }

      if (dismissOutside) {
        dismissPop();
      } else {
        notice();
      }
    };

    coreEl.onclick = function(e) {
      if (e.stopPropagation) {
        e.stopPropagation();
      }
      if (e.preventBubble) {
        e.preventBubble();
      }
    };
  };

  var clearClass = function(el, className) {
    if (el !== null) {
      el.className = el.className.replace(" " + className, "");
    }
  };

  var dismissPop = function() {
    if (!isShown) {
      return;
    }

    isExiting = true;

    clearClass(coreEl, "enter");
    clearClass(coreEl, "notice");
    clearClass(coreEl, "shake");
    coreEl.className += " exiting";
    overlayEl.className = "exiting";

    setTimeout(function() {
      if (!isExiting) {
        return;
      }

      if (Element.prototype.remove) {
        rootEl.remove();
        overlayEl.remove();
      } else {
        rootEl.removeNode(true);
        overlayEl.removeNode(true);
      }

      coreEl = null;
      overlayEl = null;
      rootEl = null;
      isShown = false;
      isExiting = false;
    }, 500);
  };

  var getResult = function() {
    return result();
  };

  var notice = function() {
    if (isNoticing) {
      return;
    }

    isNoticing = true;
    clearClass(coreEl, "enter");
    coreEl.className += " notice";
    setTimeout(function() {
      clearClass(coreEl, "notice");
      isNoticing = false;
    }, 600);
  };

  var reject = function() {
    if (isRejecting) {
      return;
    }

    isRejecting = true;
    clearClass(coreEl, "enter");
    coreEl.className += " shake";
    setTimeout(function() {
      clearClass(coreEl, "shake");
      isRejecting = false;
    }, 2000);
  };

  var message = function(msg, title, extra, btnExtras, custom) {
    var needNotice = false;
    result = null;

    if (isShown) {
      if (isExiting) {
        isExiting = false;
        coreEl.className = coreEl.className.replace("exiting", "entering");
        overlayEl.className = "";
        coreEl.innerHTML = "";
        needNotice = true;
      } else {
        return;
      }
    } else {
      makeFrame();
    }

    if (title !== undefined) {
      var titleEl = document.createElement("h1");
      titleEl.innerHTML = title;
      coreEl.appendChild(titleEl);
    }

    if (extra !== undefined && extra !== null) {
      coreEl.className = "pop-core enter " + extra;
    } else {
      coreEl.className = "pop-core enter";
    }

    if (needNotice) {
      notice();
    }

    var msgEl = document.createElement("p");
    msgEl.innerHTML = msg;
    coreEl.appendChild(msgEl);

    if (custom !== undefined && custom !== null) {
      coreEl.innerHTML += custom.html;
      result = custom.result;
    }

    if (btnExtras !== undefined) {
      for (var j in btnExtras) {
        var btnExtra = btnExtras[j];
        var btnEl = document.createElement("button");
        btnEl.className = "button " + btnExtra.style;
        btnEl.innerHTML = btnExtra.label;
        btnEl.onclick = btnExtra.action === undefined ? dismissPop : btnExtra.action;
        coreEl.appendChild(btnEl);
      }
    } else {
      var okEl = document.createElement("button");
      okEl.className = "button";
      okEl.innerHTML = defaultLabels['ok'];
      okEl.onclick = dismissPop;
      coreEl.appendChild(okEl);
    }
  };

  var confirm = function(msg, title, callback, extra) {
    var buttons = [];
    buttons.push({
      style: "",
      label: defaultLabels['cancel']
    });
    var confirmBtnStyle = "yellow";
    if (extra === "warning") { confirmBtnStyle = "yellow"; }
    if (extra === "danger") { confirmBtnStyle = "red"; }
    buttons.push({
      style: confirmBtnStyle,
      label: defaultLabels['confirm'],
      action: callback
    });
    message(msg, title, extra === undefined ? "warning" : extra, buttons);
  };

  var success = function(msg, title) {
    message(msg, title, "success", [{ style: "green", label: defaultLabels['ok'] }]);
  };

  var info = function(msg, title) {
    message(msg, title, "info", [{ style: "blue", label: defaultLabels['ok'] }]);
  };

  var warning = function(msg, title) {
    message(msg, title, "warning", [{ style: "yellow", label: defaultLabels['ok'] }]);
  };

  var danger = function(msg, title) {
    message(msg, title, "danger", [{ style: "red", label: defaultLabels['ok'] }]);
  };

  return {
    setDefaultLabel: setDefaultLabel,
    getDefaultLabel: getDefaultLabel,
    setDismissWhenTouchOutside: setDismissWhenTouchOutside,
    getResult: getResult,
    reject: reject,
    dismiss: dismissPop,
    message: message,
    confirm: confirm,
    success: success,
    info: info,
    warning: warning,
    danger: danger
  };
});

M.extend("Pop/Pop", function(Pop) {
  var DomHelper = M.require("Pop/DomHelper");

  var input = function(msg, title, placeholder, callback) {
    var inputEl = DomHelper.create().create([
      { tag: "input", className: "pop-input" }
    ]);

    inputEl.thisElement.setAttribute("placeholder", placeholder);

    var buttons = [];
    buttons.push({
      style: "",
      label: Pop.getDefaultLabel('cancel')
    });
    buttons.push({
      style: "green",
      label: Pop.getDefaultLabel('confirm'),
      action: callback
    });

    Pop.message(msg, title, "", buttons, { html: inputEl.toString(), result: function() {
      return document.getElementsByClassName("pop-input")[0].value;
    } });
  };

  return {
    input: input
  };
});
