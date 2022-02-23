module.exports = function (RED) {
    function widget(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var nodeMsgFunctions = [];
        var server = RED.nodes.getNode(config.server);
        var name = config.name;
        types = server.getWidgetTypes();

        node.widgetType = types[config.widgetType];
        node.widgetType.util = require("../util.js");
        node.widgetType.id = node.id;

        
        //Copy the config to the widgetType
        for(var i in config) {
            node.widgetType.config[i] = config[i];
        }

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
        server.addWidget(node.id, node.name, node.widgetType.label, node.widgetType.version);

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