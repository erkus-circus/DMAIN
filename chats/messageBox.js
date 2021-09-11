(function (window) {

    function createButton(btn, inputs) {
        var action = btn.action;
        var btnElem = $("<span>").className("msg-btn").text(btn.title).click(function () {
            // get inputs into object, name: value
            var inputObject = btn.args;
            $("#msg-input-value").map(function (l) {
                inputObject[l.name] = l.value;
            });
            action.split('.').reduce((o, i) => o[i], window)(inputObject);
        });

        $("#msg-btns").append(btnElem);
    }

    window.MessageBox = {
        messageData: null,
        setMessage: function setMessage(name, callback) {
            var message = messageData[name];
            $("#msg-title").text(message.title);
            $("#msg-content").text(message.content);

            $("#msg-btns").html("");
            $("#msg-inputs").html("");

            for (let i = 0; i < message.inputs.length; i++) {
                const input = message.inputs[i];
                
                var inputElem = $(`<input>`).value(input.value).name(input.name).className("msg-input-value").type(input.type);
                if ("attributes" in input) {
                    for (const i in input.attributes) {
                        inputElem.attr(i, input.attributes[i]);
                    }
                }

                // to make a datalist:
                let dataElem; 
                if ("options" in input) {
                    dataElem = $("<datalist>").id(input.attributes.list);
                    for (let i = 0; i < input.options.length; i++) {
                        const option = input.options[i];
                        dataElem.append($("<option>").value(option))
                    }
                }

                var spanElem = $("<span>").className("msg-input").text(input.content)
                    .append(
                        inputElem
                        );
                if ("options" in input) {
                    spanElem.append(dataElem)
                }
                $("#msg-inputs").append(spanElem);
            }

            for (let i = 0; i < message.buttons.length; i++) {
                createButton(message.buttons[i]);
            }

            return typeof callback === "function" ? callback() : null;
        },
        attrs: {},
        set: function (a, b) {
            this.attrs[a] = b;
        },
        get: function (a) {
            return this.attrs[a];
        },
        hide: function hide() {
            $("#outer-msg-box").hide();
            this.hidden = true
        },
        hidden: true,
        show: function show() {
            $("#outer-msg-box").show();
            this.hidden = false;
            var inputs = $("#msg-input-value");
            if (inputs.length > 0) {
                inputs[0].autofocus = true;
            }
        },
        init: async function () {
            const response = await fetch('./data/messages.json');
            const json = await response.json();
            window.MessageBox.messageData = messageData = json;
        }
    };

    //LOADER:
    var messageData;
})(window);