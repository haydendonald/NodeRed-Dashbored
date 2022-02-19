/**
 * Toggle button
 * 
 * Will toggle between two states
 * 
 * onValue = The value when the switch is "on"
 * offValue = The value when the switch is "off"
 * 
 * Input/output is a payload of the on/off value.
 * {
 *  "payload": true
 * }
 * 
 * https://github.com/haydendonald/NodeRed-Dashbored
 * 
 */

module.exports = function(RED) {

        function widget(config) {
            RED.nodes.createNode(this, config);
            var node = this;
            const util = require("../util.js");

            var name = config.name || "Toggle Button";
            var server = RED.nodes.getNode(config.server);
            var text = config.text || "Toggle Button";
            var onValue = config.onValue || "on";
            var offValue = config.offValue || "off";
            var CSS = config.CSS || "";
            var currentState = offValue;
            var nodeMsgFunctions = [];

            //When a message is received from the dashbored
            var onMessage = (msg) => {
                if (msg.id == node.id) {
                    for (var i = 0; i < nodeMsgFunctions.length; i++) {
                        nodeMsgFunctions[i](msg.payload);
                        currentState = msg.payload;
                    }
                }
            }

            //Generate the CSS for the widget to be inserted into the dashbored
            var generateCSS = () => {
                //Go through the CSS and add the ids
                var rebuild = "";
                var classes = CSS.split("}");
                for (var i = 0; i < classes.length - 1; i++) {
                    var selectors = classes[i].split(" {");
                    selectors[0] = selectors[0].replace(/^\s+|\s+$/gm, '');
                    var output = `${selectors[0][0]}n${node.id.split(".")[0]}_${selectors[0].substring(1)} {${selectors[1]}}\n`;
                    rebuild += output;
                }

                return rebuild;
            }

            //Generate the HTML for the widget to be inserted into the dashbored
            var generateHTML = (id) => {
                    return `
            ${util.generateTag(id, "button", "button", text, `class="${util.generateCSSClass(node, "button")} ${util.generateCSSClass(node, (currentState == offValue ? "off" : "on"))}" state="${currentState}"`)}
            `;
        }

        //Generate the script to be executed in the dashbored when the page loads
        var generateOnload = (id) => {
            return `
            ${util.getElement(id, "button")}.onclick = function(event) {
                if(event.target.getAttribute("state") == "${onValue}") {
                    sendNodeMsg("${node.id}", "${offValue}");
                }
                else {
                    sendNodeMsg("${node.id}", "${onValue}");
                }
            }
            `;
        }

        //Generate the script to be executed in the dashboard when a msg comes in to the widget
        //msg can be used to get the msg object
        var generateOnMsg = (id) => {
            return `
            ${util.getElement(id, "button")}.setAttribute("state", msg.payload);
            if(msg.payload == "${onValue}") {
                ${util.getElement(id, "button")}.classList.add("${util.generateCSSClass(node, "on")}");
                ${util.getElement(id, "button")}.classList.remove("${util.generateCSSClass(node, "off")}");
            }
            else {
                ${util.getElement(id, "button")}.classList.add("${util.generateCSSClass(node, "off")}");
                ${util.getElement(id, "button")}.classList.remove("${util.generateCSSClass(node, "on")}");
            }
            `;
        }

        //Generate any extra scripts to add to the document for the widget
        var generateScript;

        //Add this dashboard to the server
        server.addWidget({
            id: node.id,
            name,
            onMessage,
            generateCSS,
            generateHTML,
            generateOnload,
            generateOnMsg,
            generateScript
        });

        //When an input is passed to the node in the flow
        node.input = (msg) => {
            if(msg.payload) {
                msg.id = node.id;
                currentState = msg.payload;
                server.sendMsg(msg);
            }
        }

        //Functions to be called when a msg comes from the dashbored
        //fn(msg)
        node.addNodeMsgFunction = (fn) => {
            nodeMsgFunctions.push(fn);
        }

        //On redeploy
        node.on("close", () => { });
    }

    RED.nodes.registerType("dashbored-widget", widget);
}