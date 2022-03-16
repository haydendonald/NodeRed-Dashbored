module.exports = function (RED) {
    function widget(config) {
        RED.nodes.createNode(this, config);
        var self = this;
        var nodeMsgFunctions = {};
        var server = RED.nodes.getNode(config.server);
        var name = config.name;
        var restoreState = config.restoreState || true;
        var flowContext = this.context().global;

        this.widthMultiplier = parseInt(config.widthMultiplier) || 1;
        this.heightMultiplier = parseInt(config.heightMultiplier) || 1;
        this.title = config.title || "";

        this.widgetType = server.getWidgetTypes()[config.widgetType].create();
        this.widgetType.util = require("../util.js");
        this.widgetType.id = this.id;
        this.widgetType.type = config.widgetType;
        this.widgetType.version = config.version;
        this.widgetType.label = config.label;
        this.widgetType.description = config.description;

        //Send to the flow
        this.sendToFlow = function (msg, messageType, get = undefined, nodeId = undefined) {
            for (var i in nodeMsgFunctions) {
                nodeMsgFunctions[i](msg, messageType, get, nodeId);
            }
        }

        //Send to the dashbored
        this.sendToDashbored = function (id, payload) {
            server.sendMsg(id, payload);
        }

        //Set a value
        this.setValue = function (name, value) {
            var temp = flowContext.get(this.id);
            temp[name] = value;
            flowContext.set(this.id, temp);
        }

        //Get a value
        this.getValue = function (name) {
            return flowContext.get(this.id)[name];
        }

        //Request a value from the flow
        this.getFlowValue = function (names) {
            if (typeof names != "Array") { names = [names]; }
            this.widgetType.sendToFlow(undefined, undefined, names)
        }

        //Send the current status to the flow
        this.sendStatusToFlow = function (type, nodeId) {
            this.sendToFlow(this.widgetType.getValues(), type, undefined, nodeId);
        }

        //Add a callback for the sendToFlow function
        this.addNodeMsgFunction = function (nodeId, fn) {
            nodeMsgFunctions[nodeId] = fn;
        };

        if (!this.widgetType) { RED.log.error(`Widget ${name} (${this.id}) has an invalid type ${config.widgetType}`); }

        //Setup the widget
        this.widgetType.setupWidget(this, config);

        //If the values don't agree or we're set not to restore values set the default values
        var defaultValues = this.widgetType.getDefaultValues();
        for (var i in defaultValues) {
            if (!flowContext.get(this.id) || flowContext.get(this.id)[i] === undefined || restoreState != true) {
                //A value is unset set the defaults
                flowContext.set(this.id, this.widgetType.getDefaultValues());
                setTimeout(function () {
                    self.sendToFlow(undefined, "get", Object.keys(self.widgetType.getDefaultValues())); //Request to the flow to get all values
                }, 1000);
                break;
            }
        }

        //When an input is passed to the node in the flow
        this.input = (msg, nodeId) => {
            switch (msg.topic) {
                case "get": {
                    this.sendToFlow(this.widgetType.getValues(), "get", undefined, nodeId);
                    break;
                }
                case "set": {
                    this.widgetType.onFlowMessage(msg);
                    this.sendStatusToFlow("set", nodeId);
                    break;
                }
            }
        }

        //Add this widget to the server
        server.addWidget(this.id, this.name, server.getWidgetTypes()[config.widgetType].label, server.getWidgetTypes()[config.widgetType].version);

        //On redeploy`
        this.on("close", function () { this.widgetType.onClose(); });
    }

    RED.nodes.registerType("dashbored-widget", widget);
}