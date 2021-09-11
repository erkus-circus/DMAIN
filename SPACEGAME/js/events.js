$(window).keydown(function (e) {
   // e.preventDefault()
    var m = 1;
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (k == e.keyCode) {
            m = 0;
        }
    }
    var kce = e.keyCode;
    if (m) {
        keys.push(kce);
    }
});

$(window).keyup(function (e) {
    //e.preventDefault();
    for (let i = 0; i < keys.length; i++) {
        if (keys[i] == e.keyCode) {
            keys.splice(i, 1);
        }
    }
})