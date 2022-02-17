/**
 * Toggle button
 * 
 * Will toggle between two states
 * 
 * onValue = The value when the switch is "on"
 * offValue = The value when the switch is "off"
 * onColor = The color when the switch is "on"
 * offColor = The color when the switch is "off"
 * 
 * Input/output is a payload of the on/off value.
 * {
 *  "payload": true
 * }
 * 
 * https://github.com/haydendonald/NodeRed-Dashbored
 * 
 */

module.exports = function (RED) {

    function widget(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        const util = require("../util.js");

        var name = config.name || "dashbored";
        var server = RED.nodes.getNode(config.server);
        var text = config.text || "Toggle Button";
        var onValue = config.onValue || "on";
        var offValue = config.offValue || "off";
        var onColor = config.onColor || "green";
        var offColor = config.offColor || "red";
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
            return `
            ${util.generateCSS(node, "#", "button", `
            {
                border-radius: 6px;
                border-width: 0;
                cursor: pointer;
                font-size: 100%;
                height: 44px;
                overflow: hidden;
                width: 100%;
            }
            `)}
            ${util.generateCSS(node, "#", "button:disabled", `
            {
                cursor: default;
            }
            `)}
            ${util.generateCSS(node, "#", "button:hover", `
            {
                font-weight: bold;
            }
            `)}
            ${util.generateCSS(node, ".", "onColor", `
            {
                background-color: ${onColor};
                color: #fff;
            }
            `)}
            ${util.generateCSS(node, ".", "offColor", `
            {
                background-color: ${offColor};
                color: #fff;
            }
            `)}
            `;
        }

        //Generate the HTML for the widget to be inserted into the dashbored
        var generateHTML = () => {
            return `
            ${util.generateTag(node, "button", "button", text, `class="${util.generateCSSClass(node, (currentState == offValue ? "offColor" : "onColor"))}" state="${currentState}"`)}
            `;
        }

        //Generate the script to be executed in the dashbored when the page loads
        var generateOnload = () => {
            return `
            ${util.getElement(node, "button")}.onclick = function(event) {
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
        var generateOnMsg = () => {
            return `
            ${util.getElement(node, "button")}.setAttribute("state", msg.payload);
            if(msg.payload == "${onValue}") {
                ${util.getElement(node, "button")}.classList.add("${util.generateCSSClass(node, "onColor")}");
                ${util.getElement(node, "button")}.classList.remove("${util.generateCSSClass(node, "offColor")}");
            }
            else {
                ${util.getElement(node, "button")}.classList.add("${util.generateCSSClass(node, "offColor")}");
                ${util.getElement(node, "button")}.classList.remove("${util.generateCSSClass(node, "onColor")}");
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