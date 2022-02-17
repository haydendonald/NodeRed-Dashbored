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
        var text = "Test Button";
        var onValue = "true";
        var offValue = "false";
        var onColor = "green";
        var offColor = "red";
        var nodeMsgFunctions = [];

        //When a message is received from the dashbored
        var onMessage = (data) => {
            if (data.id == node.id) {
                for (var i = 0; i < nodeMsgFunctions.length; i++) {
                    nodeMsgFunctions[i](data.msg);
                }
            }
        }

        //Generate the CSS for the widget to be inserted into the dashbored
        var generateCSS = () => {
            return `
            ${util.generateCSS(node, "#", "button", `
            {
                width: 50%
            }
            `)}
            ${util.generateCSS(node, ".", "onColor", `
            {
                background-color: ${onColor};
            }
            `)}
            ${util.generateCSS(node, ".", "offColor", `
            {
                background-color: ${offColor};
            }
            `)}
            `;
        }

        //Generate the HTML for the widget to be inserted into the dashbored
        var generateHTML = () => {
            return `
            ${util.generateTag(node, "button", "button", text, `class="${util.generateCSSClass(node, "offColor")}"`)}
            `;
        }

        //Generate the script to be executed in the dashbored when the page loads
        var generateOnload = () => {
            return `
            ${util.getElement(node, "button")}.setAttribute("state", "${offValue}");
            ${util.getElement(node, "button")}.onclick = (event) => {
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
            msg.id = node.id;
            server.sendMsg(msg);
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