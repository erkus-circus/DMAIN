// the array of chats the user is in.
var enrolledChats = [];

var chats = [];


var toScroll = 1;

// the chat that the user is currently sending messages to.
// everyone chat is the chat that contains everyone.
var currentChat = "";

// the list of all the users avalible.
var users = [];

// chat namespace
var socket = io("/newChat");


// user submits their message:
document.getElementById("message-form").addEventListener("submit", async function() {
    var message = $("#message-input").value()[0];
    $("#send-message")[0].focus();
    // check if this chat should even be able to be sent:
    if (message.trim() == "") return;
    
    $("#message-input").value("");

    socket.emit("sent-message", currentChat, {
        message: message,
        time: new Date().getTime(),
        to: currentChat,
        sender: username,
        media: [],
        userID: userID
    });

    // so page is not reloaded
    return false;
});


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

function validateChat(chat) {
    return chat != null;
}

function setEnrolledChats(eChats) {
    enrolledChats = eChats;

    $(".chats-menu").html("")

    // eChats.sort((a,b) => a.lastUpdated - b.lastUpdated)

    eChats.sort((a, b) => b.lastUpdated - a.lastUpdated).forEach((theChat)=> {
        var chat = $("<div>").addClass("chat-btn").id(theChat.id)

        chat.text(theChat.name)

        // the chat click handler:
        chat.click(function(e) {
            // leave old chat room
            socket.emit("leave-chat-room", currentChat)
            
            // the element
            currentChat = e.target.id
            $(".chat-btn").removeClass("chat-selected")
            $(`#${currentChat}`).addClass("chat-selected")
            // clear all chats
            chats = []
            updateChatMessages()

            // a new chat room is joined, request chats.
            // socket.emit("load-messages-count", currentChat, userID, username, -(toScroll + 30), -toScroll - 1)
            socket.emit("load-messages-count", currentChat, userID, username, 0)
        })

        $(".chats-menu").append(chat)
    })

    try {
        document.getElementById(currentChat).className += " chat-selected"
    } catch {}
}


$(window).load(async function() {
    await MessageBox.init();

    // socket events:
    socket.on("enrolled-chats", setEnrolledChats)

    socket.on("load-messages-count-res", (messages) => {
        chats = messages;
        updateChatMessages();
    });

    socket.on("get-users-res", us => { 
        users = us;
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            // this is for the datalist.
            var option = $("<OPTION>").value(user)
            $("#users-list").append(option)
        }
    })

    // for reordering and updating a chat
    socket.on("time-update", (id, time) => {
        enrolledChats[enrolledChats.findIndex((value, index) => value.id === id)].lastUpdated = time;
        $(`#${id}`).addClass("chat-unread")

        // update the lastUpdated
        setEnrolledChats(enrolledChats)
    })

    // chats are not sent in order, may not work.
    socket.on("chat-message", function (chat) {
        
        
        if (chat.to !== currentChat) {
            // the chat is directed to another dm.
            return;
        }
        
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

    // the login screen
    // callback is function to execute when user is logged in.
    showStart(function () {
        // requests enrolled chats
        socket.emit("get-enrolled-chats", userID, username);

        socket.emit("get-users", userID, username)
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

    $("#newChatButton").click(function() {
        MessageBox.setMessage("newChat");
        
        users.filter((val)=> val != "Admin" ).forEach((user) => {

            $("#users-list").append($("<option>").value(user))
        })
        MessageBox.show();
    })


    // creating new chats:

    // the users selected
    var usersSelected = [];
    $("#add-user-form").submit((e, v) => {
        // add user is for when when user adds people to a groupchat.
        e.preventDefault()
        
        // change this to be able to remove people
        $("#users-selected").text($("#users-selected").text() + $("#add-user-input").value());
    })
    // $("#cancel-create-chat").click(() => $("#create-chat-box").hide())



    // focus the chat input
    $(window).keydown(function (e) {
        // here
        if ($(".outer-msg-box").display() === ["hidden", "hidden"] && e.key.length <= 1) {
            $("#message-input")[0].focus();
        }
    });
}); 

// make sure the userID is always valid:
socket.on("invalid-uuid", () => {
    sessionStorage.clear()
    sessionStorage.setItem("username", username)
    showStart(() => {
        // requests enrolled chats
        socket.emit("get-enrolled-chats", userID, username);

        socket.emit("get-users", userID, username)
    })
});

function notifyMe() {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    }
  
    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
      // If it's okay let's create a notification
      var notification = new Notification("Hi there!");
    }
  
    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          var notification = new Notification("Hi there!");
        }
      });
    }
  
    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them any more.
  }