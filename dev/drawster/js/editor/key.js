/* For key commands and things like that */
// records your keys
(function (window) {
  var controlKeys = ["Control", "Alt"];

  window.Project.prototype.Keys = {
    pressed: [],

    // check if a key is pressed
    isPressed: (key) => Project.Keys.pressed.indexOf(key) >= 0,
  };

  // add
  $(window).load(() => {
    // when user unfocuses window, clear all the keys that have been pressed
    $(window).on("unfocus", function () {
      Project.Keys.pressed = [];
    });

    $(window).keydown(function (e) {
      // prevent OS keys
      if (controlKeys.includes(e.key)) {
        e.preventDefault();
      }

      // if the key is already pressed, return
      if (Project.Keys.isPressed(e.key)) return;

      // else: add the key to the keys that have already been pressed
      Project.Keys.pressed.push(e.key);
    });

    // remove key from the keys pressed
    $(window).keyup(function (e) {
      if (controlKeys.includes(e.key)) {
        e.preventDefault();
      }

      while (Project.Keys.pressed.indexOf(e.key) >= 0) {
        Project.Keys.pressed.splice(Project.Keys.pressed.indexOf(e.key), 1);
      }
    });
  });
})(window);
