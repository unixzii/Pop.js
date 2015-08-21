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
