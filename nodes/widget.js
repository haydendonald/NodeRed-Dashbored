module.exports = function (RED) {
    function widget(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var nodeMsgFunctions = [];
        var server = RED.nodes.getNode(config.server);
        var name = config.name;

        node.widgetType = server.getWidgetTypes()[config.widgetType].create();
        node.widgetType.util = require("../util.js");
        node.widgetType.id = node.id;

        //Copy config to the widget type
        for (var i in node.widgetType.defaultConfig) {
            if(!config[i]) {
                config[i] = node.widgetType.defaultConfig[i];
            }
            node.widgetType.config[i] = config[i];
        }
        
        node.widgetType.sendToFlow = (msg) => {
            for (var i = 0; i < nodeMsgFunctions.length; i++) {
                nodeMsgFunctions[i](msg);
            }
        }
        node.widgetType.sendToDashbored = (id, payload) => {
            server.sendMsg(id, payload);
        }

        if (!node.widgetType) { RED.log.error(`Widget ${name} (${node.id}) has an invalid type ${config.widgetType}`); }

        node.widgetType.setupWidget();

        //When an input is passed to the node in the flow
        node.input = (msg) => {
            node.widgetType.onFlowMessage(msg);
        }

        //Add a callback for the sendToFlow function
        node.addNodeMsgFunction = (fn) => {
            nodeMsgFunctions.push(fn);
        };


        //Add this widget to the server
        server.addWidget(node.id, node.name, server.getWidgetTypes()[config.widgetType].label, server.getWidgetTypes()[config.widgetType].version);

        //On redeploy
        node.on("close", () => { node.widgetType.onClose(); });
    }

    RED.nodes.registerType("dashbored-widget", widget);
}