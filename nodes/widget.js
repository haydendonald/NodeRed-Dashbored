module.exports = function (RED) {
    function widget(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var nodeMsgFunctions = [];
        var server = RED.nodes.getNode(config.server);
        var name = config.name;
        var restoreState = config.restoreState || true;
        var flowContext = this.context().global;

        console.log(config);

        node.widgetType = server.getWidgetTypes()[config.widgetType].create();
        node.widgetType.util = require("../util.js");
        node.widgetType.id = node.id;

        node.widgetType.sendToFlow = (msg) => {
            for (var i = 0; i < nodeMsgFunctions.length; i++) {
                nodeMsgFunctions[i](msg);
            }
        }
        node.widgetType.sendToDashbored = (id, payload) => {
            server.sendMsg(id, payload);
        }
        node.widgetType.setValue = (name, value) => {
            var temp = flowContext.get(node.id);
            temp[name] = value;
            flowContext.set(node.id, temp);
        }
        node.widgetType.getValue = (name) => {
            return flowContext.get(node.id)[name];
        }

        //If the values don't agree or we're set not to restore values set the default values
        var defaultValues = node.widgetType.getDefaultValues();
        for(var i in defaultValues) {
            if(!flowContext.get(node.id) || flowContext.get(node.id)[i] === undefined || restoreState != true) {
                //A value is unset set the defaults
                flowContext.set(node.id, node.widgetType.getDefaultValues());
            }
        }

        if (!node.widgetType) { RED.log.error(`Widget ${name} (${node.id}) has an invalid type ${config.widgetType}`); }

        //Setup the widget
        node.widgetType.setupWidget(config);

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