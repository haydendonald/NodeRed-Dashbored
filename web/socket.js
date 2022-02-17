/**
 * Handle the websocket
 */

var socket = new WebSocket("ws://" + location.host.split(":")[0] + ":4235");

socket.addEventListener('open', function (event) {
    print("debug", "Socket open");
});

socket.addEventListener("message", function (data) {
    print("debug", `Socket message received: ${data}`);
    for(var i = 0; i < onMsgFunctions.length; i++) {
        onMsgFunctions[i](data);
    }
});

socket.addEventListener("error", function (error) {
    print("error", "Socket error");
    console.log(error);
});

socket.addEventListener("close", function () {
    print("debug", "Socket closed");
});

//Send a message to the socket
sendNodeMsg = (id, msg) => {
    print("debug", `Sending msg for ${id}: ${msg}`);
    socket.send(JSON.stringify({
        id,
        msg
    }));
}