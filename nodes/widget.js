module.exports = function (RED, dashboredGeneration = undefined) {
    function widget(config) {
        //Set callbacks to nodered or if generated programmatically
        if (!dashboredGeneration) {
            RED.nodes.createNode(this, config);
            var flowContext = this.context().global;
        }
        else {
            this.id = config.id;

            this.contextStore = {};
            flowContext = {
                set: function (name, value) {
                    contextStore[name] = value;
                },
                get: function (name) {
                    return contextStore[name];
                }
            };

            var ons = {};
            this.on = function (evt, fn) {
                ons[evt] = fn;
            }
            this.callOn = function (evt, value) {
                ons[evt](value);
            }
        }

        var self = this;
        var nodeMsgFunctions = {};
        var server = !dashboredGeneration ? RED.nodes.getNode(config.server) : config.server;
        var name = config.name;

        this.widthMultiplier = parseInt(config.widthMultiplier) || 1;
        this.heightMultiplier = parseInt(config.heightMultiplier) || 1;
        this.title = config.title || "";
        this.restoreState = config.restoreState || false;
        this.setsState = config.setsState;

        var widType = server.getWidgetTypes()[config.widgetType];
        if (!widType) { return; }

        this.widgetType = widType.create();
        this.widgetType.util = require("../util.js");
        this.widgetType.id = this.id;
        this.widgetType.type = config.widgetType;
        this.widgetType.version = widType.version;
        this.widgetType.label = widType.label;
        this.widgetType.description = widType.description;

        //Send to the flow
        this.sendToFlow = function (msg, messageType, get = undefined, sessionId = undefined, nodeId = undefined) {
            for (var i in nodeMsgFunctions) {
                nodeMsgFunctions[i](msg, messageType, get, sessionId, nodeId);
            }
        }

        //Send to the dashbored
        this.sendToDashbored = function (id, sessionId, payload) {
            server.sendMsg(id, sessionId, payload);
        }

        //Set values to memory
        /**
         * Set values to memory
         * @param {Object} values The values to set in a key value object
         */
        this.setValues = function (values) {
            var temp = flowContext.get(this.id);
            for (var i in values) {
                temp[i] = values[i];
            }
            flowContext.set(this.id, temp);
        }

        //Set a value
        this.setValue = function (name, value) {
            var temp = {};
            temp[name] = value;
            this.setValues(temp)
        }

        //Get a value
        this.getValue = function (name) {
            if(!flowContext.get(this.id)){return undefined;}
            return flowContext.get(this.id)[name];
        }

        //Request a value from the flow
        this.getFlowValue = function (names) {
            if (typeof names != "Array") { names = [names]; }
            this.widgetType.sendToFlow(undefined, undefined, names)
        }

        //Send the current status to the flow
        this.sendStatusToFlow = function (type, sessionId, nodeId = undefined) {
            this.sendToFlow(this.widgetType.getValues(), type, undefined, sessionId, nodeId);
        }

        /**
         * Send a status update to the flow
         * @param {string} sessionId The session id
         * @param {object} changes The changes to expect in key value form
         * @param {string} nodeId  The node id
         */
        this.sendStatusChangesToFlow = function (sessionId, changes, nodeId = undefined) {
            var temp = this.widgetType.getValues();
            for (var i in changes) {
                temp[i] = changes[i];
            }
            this.sendToFlow(temp, "set", undefined, sessionId, nodeId);
        }

        //Add a callback for the sendToFlow function
        this.addNodeMsgFunction = function (nodeId, fn) {
            nodeMsgFunctions[nodeId] = fn;
        };

        if (!this.widgetType) { RED.log.error(`Widget ${name} (${this.id}) has an invalid type ${config.widgetType}`); }


        //Copy in the default config if it wasn't set
        for (var i in this.widgetType.defaultConfig) {
            if (!this.widgetType.config[i]) {
                if (config[this.widgetType.type + "-" + i]) {
                    this.widgetType.config[i] = config[this.widgetType.type + "-" + i];
                }
                else if (config[i]) {
                    this.widgetType.config[i] = config[i];
                }
                else {
                    this.widgetType.config[i] = this.widgetType.defaultConfig[i].value;
                }
            }
        }

        //Setup the widget
        this.widgetType.setupWidget(this, config);

        //If the values don't agree or we're set not to restore values set the default values
        var defaultValues = this.widgetType.getDefaultValues();
        for (var i in defaultValues) {
            if (!flowContext.get(this.id) || flowContext.get(this.id)[i] === undefined || this.restoreState != true) {
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
                    this.sendStatusToFlow("get", undefined, nodeId);
                    break;
                }
                case "set": {
                    this.widgetType.onFlowMessage(msg);
                    this.sendStatusToFlow("set", undefined, nodeId);
                    break;
                }
            }
        }

        //On redeploy`
        this.on("close", function () { this.widgetType.onClose(); });

        //Add the widget to the server
        if (dashboredGeneration) {
            return this;
        }
        else {
            //Add this widget to the server
            server.addWidget(this.id, this.name, server.getWidgetTypes()[config.widgetType].label, server.getWidgetTypes()[config.widgetType].version);
        }
    }

    //If it's node red creating it register it
    if (!dashboredGeneration) {
        RED.nodes.registerType("dashbored-widget", widget);
    }
    else {
        return widget;
    }
}