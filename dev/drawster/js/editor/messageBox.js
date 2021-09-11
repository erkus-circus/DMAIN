(function (window) {

    // cteate a button for the box
    function createButton(btn, inputs) {
        // what function to call
        var action = btn.action;

        // create the button, onclick
        var btnElem = $("<span>").className("msg-btn").text(btn.title).click(function () {
            // get inputs into object, name: value
            var inputObject = btn.args;

            // unknown what does this do???????
            $(".msg-input-value").map(function (l) {
                inputObject[l.name] = l.value;
            });
            window.Project.Editor.getPath(action)(inputObject);
        });

        // append the button to the messageBox
        $(".msg-btns").append(btnElem);
    }

    window.Project.prototype.MessageBox = {

        // alias for messageData? same thing?
        messageData: null,

        // set the message of the message box.
        setMessage: function setMessage(name) {

            // get the object for the message
            var message = Project.MessageBox.messageData[name];

            // change the title of the message box to the new title
            $(".msg-title").text(message.title);

            // set the content of the message to new content
            $(".msg-content").text(message.content);

            // clear the other buttons and inputs.
            $(".msg-btns").html("");
            $(".msg-inputs").html("");

            // create the inputs
            for (let i = 0; i < message.inputs.length; i++) {

                // array of inputs, for format look at the messages JSON file
                const input = message.inputs[i];
                var inputElem = $("<span>").className(".msg-input").text(input.content)
                    .append(
                        $("<input>").value(input.value).name(input.name).className("msg-input-value").type(input.type)
                    );
                $(".msg-inputs").append(inputElem);
            }

            for (let i = 0; i < message.buttons.length; i++) {
                createButton(message.buttons[i]);
            }
        },

        // get and set attributes for the message box. Idk why it is here, should not have a system here
        attrs: {},
        set: function (a, b) {
            this.attrs[a] = b;
        },
        get: function (a) {
            return this.attrs[a];
        },

        // hide the message box
        hide: function hide() {
            $(".outer-msg-box").hide();
        },
        // show the message box
        show: function show() {
            $(".outer-msg-box").show();
        },
    };

    // load all the avalible messages
    $(window).load(async function () {
        const response = await fetch('data/messageBox.json');
        const json = await response.json();
        window.Project.MessageBox.messageData = json;
    });
})(window);