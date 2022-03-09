module.exports = function (RED) {
    function widget(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var nodeMsgFunctions = [];
        var server = RED.nodes.getNode(config.server);
        var name = config.name;
        var restoreState = config.restoreState || true;
        var flowContext = this.context().global;

        node.widthMultiplier = parseInt(config.widthMultiplier) || 1;
        node.heightMultiplier = parseInt(config.heightMultiplier) || 1;
        node.title = config.title || "";

        node.widgetType = server.getWidgetTypes()[config.widgetType].create();
        node.widgetType.util = require("../util.js");
        node.widgetType.id = node.id;

        //Send to the flow
        this.sendToFlow = function(msg, messageType, get = undefined) {
            for (var i = 0; i < nodeMsgFunctions.length; i++) {
                nodeMsgFunctions[i](msg, messageType, get);
            }
        }
        //node.widgetType.sendToFlow = sendToFlow;

        //Send to the dashbored
        this.sendToDashbored = function(id, payload) {
            server.sendMsg(id, payload);
        }
        //node.widgetType.sendToDashbored = sendToDashbored;

        //Set a value
        this.setValue = function(name, value) {
            var temp = flowContext.get(node.id);
            temp[name] = value;
            flowContext.set(node.id, temp);
        }
        //node.widgetType.setValue = setValue;

        //Get a value
        this.getValue = function(name) {
            return flowContext.get(node.id)[name];
        }
        //node.widgetType.getValue = getValue;

        //Request a value from the flow
        this.getFlowValue = function(names) {
            if (typeof names != "Array") { names = [names]; }
            node.widgetType.sendToFlow(undefined, undefined, names)
        }
        //node.widgetType.getFlowValue = getFlowValue;

        //Add a callback for the sendToFlow function
        node.addNodeMsgFunction = (fn) => {
            nodeMsgFunctions.push(fn);
        };

        if (!node.widgetType) { RED.log.error(`Widget ${name} (${node.id}) has an invalid type ${config.widgetType}`); }

        //Setup the widget
        node.widgetType.setupWidget(config);

        //If the values don't agree or we're set not to restore values set the default values
        var defaultValues = node.widgetType.getDefaultValues();
        for (var i in defaultValues) {
            if (!flowContext.get(node.id) || flowContext.get(node.id)[i] === undefined || restoreState != true) {
                //A value is unset set the defaults
                flowContext.set(node.id, node.widgetType.getDefaultValues());
                setTimeout(function () {
                    node.widgetType.sendToFlow(undefined, "get", Object.keys(node.widgetType.getDefaultValues())); //Request to the flow to get all values
                }, 1000);
                break;
            }
        }

        //When an input is passed to the node in the flow
        node.input = (msg) => {
            switch (msg.topic) {
                case "get": {
                    this.sendToFlow({
                        "state": this.getValue("state")
                    }, "get");
                    node.widgetType.onFlowGetMessage(msg);
                    break;
                }
                case "set": {
                    node.widgetType.onFlowMessage(msg);
                    break;
                }
            }
        }

        //Add this widget to the server
        server.addWidget(node.id, node.name, server.getWidgetTypes()[config.widgetType].label, server.getWidgetTypes()[config.widgetType].version);

        //On redeploy
        node.on("close", () => { node.widgetType.onClose(); });
    }

    RED.nodes.registerType("dashbored-widget", widget);
}