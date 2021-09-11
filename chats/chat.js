var chats = [];

// the chat that the user is currently sending messages to.
// everyone chat is the chat that contains everyone.
var currentChat = "everyone";

// the list of all the users avalible.
var users = {};

// chat namespace
var socket = io("/chat");

$(".messages").on("scroll", (e)=>e.preventDefault())

async function submitMessage(e, code) {
    
    var message = $("#message-input").value()[0];
    $("#send-message")[0].focus();
    // check if this chat should even be able to be sent:
    if (message.trim() == "") return;
    
    $("#message-input").value("");
    

    socket.emit("sent-message", {
        message: message,
        time: new Date().getTime(),
        sender: username,
        // to: currentChat,
        // userID: userID
    });

    // so page is not reloaded
    e.preventDefault()
    $("#message-input").focus()
    
    return false;
}



// user submits their message:
document.getElementById("message-form").addEventListener("submit", submitMessage);


// update all the chats, based on time.
function updateChatMessages() {

    // clear all messages
    $("#messages").html("");

    for (let i = 0; i < chats.length; i++) {
        const chat = chats[i];

        if(!validateChat(chat)) continue;

        var chatElem = $("<P>");
        chatElem.addClass("message-container");
        chatElem.html(formatMessageToHTML(chat));
        $("#messages").append(chatElem);
        chatElem[0].scrollIntoView();
    }
}

function formatMessageToHTML(chat) {
    var color = "inheirit"; 
    if(chat.sender == "Admin") {
        color = "red";
    }
    return  "<span class='time-label'>" + new Date(chat.time).toLocaleString() + " </span>&lt;<span class='sender-label' style=\"color:" + color + "\">" + chat.sender + "</span>&gt;" + " <span> </span> <span class='message-output'>" + chat.message + "</span>";
}

socket.on("all-messages", function(chatMessages, usersList) {
    chats = chatMessages;
    users = usersList;
    updateChatMessages();
});

function validateChat(chat) {
    return chat != null;
}

// chats are not sent in order, may not work.
socket.on("chat-message", function (chat) {
    chats.push(chat);
    
    if(!validateChat(chat)) return;

    var chatElem = $("<P>");
    chatElem.addClass("message-container");
    chatElem.html(formatMessageToHTML(chat));
    $("#messages").append(chatElem);

    chatElem[0].scrollIntoView();
});

socket.on("people-online", function (numPeople) {
    $("#peopleOnlineDisplay").text("People Online: " + numPeople);
});


$(window).load(async function() {
    await MessageBox.init();

    // the login screen
    // callback is function to execute when user is logged in.
    showStart(function () {
        // requests all messages
        socket.emit("req-all-messages", userID);
    });
    
    // events
    $("#messages").click(function () {
        $("#message-input").focus();
    });

    $("#logOutButton").click(function () {
        username = null;
        userID = null;
        // clear the Id from session storage
        sessionStorage.clear();
        $("#messages").html("")
        MessageBox.setMessage("start");
        MessageBox.show();
    });

    // focus the chat input
    $(window).keydown(function (e) {
        if (MessageBox.hidden && e.key.length <= 1) {
            $("#message-input")[0].focus();
        }
    });
}); 