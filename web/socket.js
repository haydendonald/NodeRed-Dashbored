/**
 * Handle the websocket
 */

 var socket = new WebSocket("ws://" + location.host.split(":")[0] + ":4235");

 socket.addEventListener('open', function (event) {
    socket.send('Hello Server!');
});

socket.addEventListener("message", function(data) {
    console.log(data);
});

socket.addEventListener("error", function(error) {
    console.log(error);
});

socket.addEventListener("close", function() {
    console.log("close");
});

 window.onload = function() {
     console.log("lol");
 }