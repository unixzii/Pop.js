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
