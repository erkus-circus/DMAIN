/* /toolbar.js */
(function (window) {
    // create the toolbar for the interface
    // data is the JSON object parsed
    function createToolbar(data) {
        // the parent is the element above
        var parent = $("<div>").className("nav-menu");

        // loop through data
        for (let i = 0; i < data.length; i++) {
            
            // the attributes for a menu
            const {
                type, // button, dropdown, or link
                name,
            } = data[i];


            if (type === "button") {
                var elem = $("<span>").html(name).className("nav-button").click(function (e) {
                    // when button is clicked execute the function 
                    data[i]["action"].split('.').reduce((o, i) => o[i], window)();
                });
                parent.append(elem);
            
            } else if (type === "dropdown") {
                var elem = $("<div>").html(name).className("nav-dropdown");
                // recursive and create a menu within the mnenu
                elem.append(createToolbar(data[i].content));
                parent.append(elem);
            
            } else if (type === "link") {
                // hyperlink
                var elem = $("<a>");
                elem.href(data[i].href)
                elem.className("nav-button")
                elem.html(name);
                elem.color("white");
                elem.style("float", "right");
                parent.append(elem);
            } 
        }
        return parent;
    }

    // load the toolbar
    $(window).load(async function () {
        const response = await fetch("data/toolbar.json");
        const json = await response.json();
        $(".nav-bar").append(createToolbar(json));
    });

    // if you want to expand the toolbar, append the results of createToolbar with your object to $(".nav-bar")
})(window);