/**
 * The main script file for the website of the dashbored project
 * 
 * https://github.com/haydendonald/NodeRed-Dashbored
 * 
 */

var debug = true;
var onLoadFunctions = [];
var onMsgFunctions = [];
var onLockFunctions = [];
var onUnlockFunctions = [];
var socketCallbacks = [];
var elementsHiddenWhileLocked = [];
var currentPage;
var socketWasClosed = false;
var socket;

//Add a function to action when the window loads in
function addOnLoadFunction(fn) {
    onLoadFunctions.push(fn);
}

//Add a function that will be called when a message is received on the websocket
function addOnMsgFunction(fn) {
    onMsgFunctions.push(fn);
}

//Print to the console
function print(type, message) {
    if (type.toUpperCase() == "debug" && !debug) { return; }
    console.log("[" + type.toUpperCase() + "] - " + message);
}

//Generate a string for the time with AM PM
function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

/**
 * Send a message to NodeRed over the websocket
 * @param {string} id The node or event id 
 * @param {object} payload The payload to send
 * @param {function} callback When a message is received on the socket this callback will be called with callback(id, success, msg) this MUST return true if successful otherwise the timeout will be called
 */
function sendMsg(id, payload, callback) {
    print("debug", "Sending msg for " + id + ": " + payload);
    if (callback) {
        var index = socketCallbacks.length;
        socketCallbacks.push(
            {
                timeout: setTimeout(function () {
                    socketCallbacks = socketCallbacks.splice(index + 1, 1);
                    callback(id, false);
                }, 1000),
                id: id,
                fn: callback
            });
    }
    socket.send(JSON.stringify({
        id: id,
        payload: payload
    }));
}


/**
 * Show or show an element
 * @param {string} id The HTML element id
 * @param {boolean} show Should it be shown
 * @param {number} sec How long should it take to fade in seconds
 */
function hideShowElement(id, show, sec) {
    if (sec === undefined) { sec = 0.2; }
    try {
        document.getElementById(id).style.transition = "opacity " + sec + "s linear";
        if (show) {
            document.getElementById(id).classList.remove("hidden");
            setTimeout(function () { document.getElementById(id).style.opacity = 1; }, sec * 1000);
        } else {
            document.getElementById(id).style.opacity = 0;
            setTimeout(function () { document.getElementById(id).classList.add("hidden"); }, sec * 1000);
        }
    } catch (e) { }
}

/**
 * Show a message popup
 * @param {string} type The type of message. (info, warn, error) 
 * @param {string} title The title of the message
 * @param {string} description The description of the message
 * @param {number} closeAfterSec How long until it's closed. False will not close the message, True will close the message
 */
 function message(type, title, description, closeAfterSec) {
    if (closeAfterSec === undefined) { closeAfterSec = 3; }
    console.log(description);
    //TODO
}


/**
 * Add a function to be called when the dashbored becomes locked
 * @param {function} fn The function to execute
 */
function addOnLockFunction(fn) {
    onLockFunctions.push(fn);
}
/**
 * Add a function to be called when the dashbored becomes unlocked
 * @param {function} fn The function to execute
 */
function addOnUnlockFunction(fn) {
    onUnlockFunctions.push(fn);
}
/**
 * Lock the dashbored
 */
function lockDashbored() {
    print("info", "Locking the dashbored");
    sendMsg(dashboredId, { type: "lock" });
}
/**
 * Attempt to unlock the dashbored using a password
 */
function unlockDashbored() {
    askPassword(function (password) {
        sendMsg(dashboredId, {
            type: "unlock",
            password: password
        }, function (id, success, msg) {
            return true;
        });
    });
}

function addElementHiddenWhileLocked(id) {
    elementsHiddenWhileLocked.push(id);
}

/**
 * Ask for a password before performing the callback
 */
function askPassword(correctCallback, incorrectCallback, bypassPassword) {
    if (bypassPassword === undefined) { bypassPassword = false; }
    if (bypassPassword == true) { correctCallback(); return; }
    hideShowElement("password", true);
    var password = "";

    //Convert the password to dots
    var convertStringToDots = function (string) {
        var ret = "";
        for (var i = 0; i < string.length; i++) { ret += "&bull;"; }
        return ret;
    }

    //Set the button numbers
    var elms = document.getElementById("buttonPad").getElementsByTagName("button");
    for (var i = 0; i < elms.length; i++) {
        //Backspace button
        if (i == 10) {
            elms[i].onclick = function () {
                password = "";
                document.getElementById("currentPassword").innerHTML = convertStringToDots(password);
            }
            break;
        }

        //Num buttons
        elms[i].setAttribute("num", i != 9 ? i + 1 : 0);
        elms[i].onclick = function (event) {
            password += event.target.getAttribute("num");
            document.getElementById("currentPassword").innerHTML = convertStringToDots(password);
        }
    }

    //When the user clicks the OK button check the password and execute actions
    document.getElementById("checkPassword").onclick = function () {
        //Check if the password is correct
        sendMsg(dashboredId, {
            type: "password",
            password: password
        }, function (id, success, msg) {
            if (id != dashboredId) { return; }
            if (success) {
                if (msg.payload.type == "password") {
                    if (msg.payload.correct == true) {
                        print("debug", "Password correct");
                        if (correctCallback) { correctCallback(password); }
                        hideShowElement("passwordCorrect", true);
                        setTimeout(function () {
                            hideShowElement("password", false);
                            hideShowElement("passwordCorrect", false);
                        }, 1000);
                    }
                    else {
                        print("debug", "Password incorrect");
                        document.getElementById("currentPassword").innerHTML = "";
                        password = "";
                        if (incorrectCallback) { incorrectCallback(); }
                        hideShowElement("passwordIncorrect", true);
                        setTimeout(function () {
                            hideShowElement("passwordIncorrect", false);
                        }, 1000);
                    }
                }
                else { return; }
            }
            else {
                message("error", "Something went wrong", "Couldn't check your password, please try again");
            }

            return true;
        });
    }

    document.getElementById("closePassword").onclick = function () {
        hideShowElement("password", false);
        if (incorrectCallback) { incorrectCallback(); }
    }
}

//Ask if the user is sure
function askAreYouSure(yesCallback, noCallback, description) {
    document.getElementById("areYouSureDesc").innerHTML = description;
    document.getElementById("yesButton").onclick = function () {
        hideShowElement("ask", false);
        if (yesCallback) { yesCallback(); }
    }
    document.getElementById("noButton").onclick = function () {
        hideShowElement("ask", false);
        if (noCallback) { noCallback(); }
    }
    hideShowElement("ask", true);
}

//Hide all other pages except the current
function showCurrentPage(newPageId) {
    if (newPageId) { currentPage = document.getElementById(newPageId); }
    var others = document.getElementsByTagName("page");
    for (var i = 0; i < others.length; i++) {
        others[i].classList.add("hidden");
    }
    currentPage.classList.remove("hidden");
}

//Attempt to connect to the socket and setup the handlers
var connectionInterval;
function connect() {
    var attempt = function () {
        print("debug", "Attempt connection to the socket");
        if (socket) { socket = undefined; }
        socket = new WebSocket("ws://" + location.host.split(":")[0] + ":4235");
        socket.addEventListener("open", function (event) {
            print("debug", "Socket open");
            clearInterval(connectionInterval);
            connectionInterval = undefined;

            //If we lost the socket and got it back refresh to regenerate the page
            if (socketWasClosed == true) {
                window.location.reload();
            }
        });

        socket.addEventListener("message", function (data) {
            //Check for control signals
            if(data.data == "reload"){setTimeout(function(){window.location.reload();}, 1000); return;}

            var msg = JSON.parse(data.data);
            print("debug", "Socket message received");
            if (debug) { console.log(msg); }

            //Send to onMsgCallbacks
            for (var i = 0; i < onMsgFunctions.length; i++) {
                onMsgFunctions[i](msg);
            }

            //Send to socket callbacks
            var del = [];
            for (var i = 0; i < socketCallbacks.length; i++) {
                if (socketCallbacks[i].fn(socketCallbacks[i].id, true, msg) === true) {
                    clearTimeout(socketCallbacks[i].timeout);
                    del.push(i);
                }
            }
            //Delete all the completed callbacks
            for (var i = 0; i < del.length; i++) { socketCallbacks = socketCallbacks.splice(del[i], 1); }

            //If the message is for this dashbored handle it
            if (msg.id == dashboredId) {
                switch (msg.payload.type) {
                    case "lock": {
                        print("info", "Request to lock dashbored");
                        for (var i = 0; i < onLockFunctions.length; i++) {
                            onLockFunctions[i]();
                        }
                        for (var i = 0; i < elementsHiddenWhileLocked.length; i++) {
                            hideShowElement(elementsHiddenWhileLocked[i], false);
                        }
                        showCurrentPage();
                        locked = true;
                        break;
                    }
                    case "unlock": {
                        if (msg.payload.unlock == true) {
                            print("info", "Request to unlock dashbored");
                            for (var i = 0; i < onUnlockFunctions.length; i++) {
                                onUnlockFunctions[i]();
                            }
                            for (var i = 0; i < elementsHiddenWhileLocked.length; i++) {
                                hideShowElement(elementsHiddenWhileLocked[i], true);
                            }
                            showCurrentPage();
                            locked = false;
                        }
                        break;
                    }
                }
            }
        });

        socket.addEventListener("error", function (error) {
            print("error", "Socket error");
        });

        socket.addEventListener("close", function () {
            print("debug", "Socket closed");
            socketWasClosed = true;
            message("error", "Disconnected From Server", "We are currently disconnected from the server! Attempting to get it back!", false);
            connect();
        });
    }

    //Retry every 5 seconds
    if (!connectionInterval) {
        connectionInterval = setInterval(function () {
            attempt();
        }, 5000);
        attempt();
    }
}

///////////////////////////////////////////////////////////

window.onload = function () {
    print("info", "Dashbored project by Hayden Donald\nhttps://github.com/haydendonald/NodeRed-Dashbored\nLet's Go!");
    print("debug", "Triggering onload functions");

    connect();

    //Execute all the onload functions
    for (var i = 0; i < onLoadFunctions.length; i++) {
        onLoadFunctions[i]();
    }
}