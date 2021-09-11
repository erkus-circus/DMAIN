// if the user must login again if the userID expires
var requireLogin = false;

// this SHOULD NOT be in this scope, very unsafe
var loginCallback = ()=>{};

// the namespace for using accounts and stuff
var accountSocket = io("/accounts");

var userID = sessionStorage.getItem("userID") || null;

var username;

async function isAuth() {
    var retVal;
    await fetch("/isAuth/" + userID).then(response => response.text()). then(data => retVal = data);
    return retVal;
}

// this gets the userID.
accountSocket.on("auth-user-res", function(res) {
    if (!res) {
        // the user failed to sign in
        var msgContent = $('.msg-content');
        msgContent.text("An error occured while logging you in. Please input a valid username and password.").color("red");

        return;
    }

    // user signed in, get their ID
    userID = res.userID;
    sessionStorage.setItem("userID", userID);
    MessageBox.hide();

    // also call the login callback here, since this also is where the login process could end.
    loginCallback();
});

function loginSubmit(data) {
    // one day i will hash this
    username = data.username;
    sessionStorage.setItem("username", username);
    
    $('.msg-content').text("You are being logged in! Please wait");
    accountSocket.emit("auth-user", data.username, data.password);
}

function signupSubmit(data) {

    // check if the inputs are valid then create the account.
    // after account is created log in.
    if(/[~`!#$%\^&*+@=\-\[\]\\';,/{}|\\":<>\? ]/g.test(data.username)) {
        // the username is invalid.
        $('.msg-content').text("Your username cannot contain spaces or special characters.");
        return false;
    }
    if (data.password != data.password2) {
        // the passwords dont match
        $('.msg-content').text("Password do not match.");
        return false;
    }

    if (data.password.length < 8) {
        $('.msg-content').text("Your password must be 8 characters long.");
        return false;
    }

    // if all is well then create the account.
    // this process is picked up in socket.io event handler
    accountSocket.emit("create-account", data.username, data.email, data.password, data.fullname);

    $('.msg-content').text("Your account is being created, please wait.");
}

accountSocket.on("create-account-res", function(res) {
    if (!res) {
        // the username already exists
        $('.msg-content').text("That username already exists! Try another one.");
        return;
    }
    $('.msg-content').text("Your account has been created! You are being logged in.");
    // login the user
    loginSubmit(res);
});

// show the overlay screens:
function showStart(callback) {
    loginCallback = callback;
    // check if the userID is in session storage
    if (sessionStorage.getItem("userID")) {
        // the userID is in session storage
        userID = sessionStorage.getItem("userID");

        // if the userID exists, then the username key must also exist. if it doesnt, then prompt login.
        if (sessionStorage.getItem("username")) {
            username = sessionStorage.getItem("username");
        } else {
            sessionStorage.clear();
            // unable to restore session, force login again.
            showStart();
            return;
        }
        // then set a variable to tell the user they must login again if their userID ever expires,
        // since we do not have the password stored here.
        
        // return the callback, it is called here
        // it also might be called somewhere else too.
        return callback();
    }

    MessageBox.setMessage("start");
    MessageBox.show();
}

function showSignupScreen () {
    MessageBox.setMessage("signup");
    MessageBox.show();
}

function showLoginScreen () {
    MessageBox.setMessage("login");
    MessageBox.show();
}