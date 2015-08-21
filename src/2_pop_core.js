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
