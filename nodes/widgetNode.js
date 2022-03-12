module.exports = function (RED) {
    function widgetNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var widget = RED.nodes.getNode(config.widget);


        var onlyOutputOnInput = true; //Only output if the value was get/set from the input
        var sendSetToOutput = false; //When set from the input output the change to the output



        //Pass the input message to the widget
        node.on("input", (msg) => {
            widget.input(msg, node.id);
        });

        //Add a callback for when a message comes from the dashbored
        widget.addNodeMsgFunction(this.id, (output, outputType, get, nodeId) => {
            var sendOutput = function () {
                node.send([{
                    "topic": outputType,
                    "payload": output
                }, undefined]);
            }

            //If a get payload exists just send it
            if (get) {
                node.send([undefined, {
                    "topic": "get",
                    "payload": get
                }]);
                return;
            }

            if (onlyOutputOnInput == true) {
                //Only output if it was requested from the node
                if (nodeId == this.id) {
                    sendOutput();
                }
            }

            //Set
            if (outputType == "set") {
                if (nodeId == this.id) {
                    if (sendSetToOutput == true) {
                        sendOutput();
                    }
                }
                else {
                    sendOutput();
                }
            }
            //Get
            else {
                if (onlyOutputOnInput == true) {
                    if (nodeId == this.id) {
                        sendOutput();
                    }
                }
                else {
                    sendOutput();
                }
            }
        });

        //On redeploy
        node.on("close", () => { });
    }

    RED.nodes.registerType("dashbored-widget-node", widgetNode);
}
