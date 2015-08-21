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
