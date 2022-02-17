/**
 * Setup some utility functions that are used throughout the dashbored project
 * 
 * https://github.com/haydendonald/NodeRed-Dashbored
 * 
 */

var debug = true;
var onLoadFunctions = [];
var onMsgFunctions = [];

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
    if(type.toUpperCase() == "debug" && !debug){return;}
    console.log(`[${type.toUpperCase()}] - ${message}`);
}

///////////////////////////////////////////////////////////

window.onload = function() {
    print("info", "Dashbored project by Hayden Donald\nhttps://github.com/haydendonald/NodeRed-Dashbored\nLet's Go!");
    print("debug", "Triggering onload functions");

    //Execute all the onload functions
    for(var i = 0; i < onLoadFunctions.length; i++) {
        onLoadFunctions[i]();
    }
}