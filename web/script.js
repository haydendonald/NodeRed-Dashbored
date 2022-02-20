/**
 * The main script file for the website of the dashbored project
 * 
 * https://github.com/haydendonald/NodeRed-Dashbored
 * 
 */

var debug = true;
var onLoadFunctions = [];
var onMsgFunctions = [];
var socket = new WebSocket("ws://" + location.host.split(":")[0] + ":4235");

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

//Send a message to the socket
function sendNodeMsg(id, payload) {
    print("debug", "Sending msg for " + id + ": " + payload);
    socket.send(JSON.stringify({
        id: id,
        payload: payload
    }));
}

//Hide or show an element
function hideShowElement(id, show, sec = 0.2) {
    try {
        document.getElementById(id).style.transition = `opacity ${sec}s linear`;
        if (show) {
            document.getElementById(id).classList.remove("hidden");
            setTimeout(() => { document.getElementById(id).style.opacity = 1; }, sec * 1000);
        } else {
            document.getElementById(id).style.opacity = 0;
            setTimeout(() => { document.getElementById(id).classList.add("hidden"); }, sec * 1000);
        }
    } catch (e) { }
}

///////////////////////////////////////////////////////////

window.onload = function () {
    print("info", "Dashbored project by Hayden Donald\nhttps://github.com/haydendonald/NodeRed-Dashbored\nLet's Go!");
    print("debug", "Triggering onload functions");

    socket.addEventListener('open', function (event) {
        print("debug", "Socket open");
    });

    socket.addEventListener("message", function (data) {
        var msg = JSON.parse(data.data);
        print("debug", "Socket message received");
        if (debug) { console.log(msg); }
        for (var i = 0; i < onMsgFunctions.length; i++) {
            onMsgFunctions[i](msg);
        }
    });

    socket.addEventListener("error", function (error) {
        print("error", "Socket error");
        console.log(error);
    });

    socket.addEventListener("close", function () {
        print("debug", "Socket closed");
    });

    //Execute all the onload functions
    for (var i = 0; i < onLoadFunctions.length; i++) {
        onLoadFunctions[i]();
    }
}