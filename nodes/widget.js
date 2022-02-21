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

module.exports = function (RED) {
    //Define the possible widget types
    var types = {
        "toggleButton": require("../widgets/toggleButton.js")
    };

    function widget(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var nodeMsgFunctions = [];
        var server = RED.nodes.getNode(config.server);
        node.widgetType = types[config.widgetType];
        node.widgetType.util = require("../util.js");
        node.widgetType.id = node.id;
        node.widgetType.name = config.name;
        node.widgetType.CSS = config.CSS;
        node.widgetType.sendToFlow = (msg) => {
            for(var i = 0; i < nodeMsgFunctions.length; i++) {
                nodeMsgFunctions[i](msg);
            }
        }
        node.widgetType.sendToDashbored = (id, payload) => {
            server.sendMsg(id, payload);
        }
        if(!node.widgetType){RED.log.error(`Widget ${name} (${id}) has an invalid type ${config.widgetType}`);}
        node.widgetType.setupWidget();

        //Add this widget to the server
        server.addWidget(node.id, node.widgetType.name);

        //When an input is passed to the node in the flow
        node.input = (msg) => {
            node.widgetType.onFlowMessage(msg);
        }

        //Add a callback for the sendToFlow function
        node.addNodeMsgFunction = (fn) => {
            nodeMsgFunctions.push(fn);
        };

        //On redeploy
        node.on("close", () => { node.widgetType.onClose(); });
    }

    RED.nodes.registerType("dashbored-widget", widget);
}