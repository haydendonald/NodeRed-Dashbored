module.exports = function (RED) {
    function widgetNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var widget = RED.nodes.getNode(config.widget);

        var onlyOutputOnInput = config.onlyOutputOnInput; //Only output if the value was get/set from the input
        var sendSetToOutput = config.sendSetToOutput; //When set from the input output the change to the output
        var getOutputOthers = config.getOutputOthers; //Output get requests from other node inputs


        //Pass the input message to the widget
        node.on("input", (msg) => {
            widget.input(msg, node.id);
        });

        //Add a callback for when a message comes from the dashbored
        widget.addNodeMsgFunction(this.id, (output, outputType, get, sessionId, nodeId) => {
            var sendOutput = function () {
                node.send([{
                    "id": nodeId,
                    "topic": outputType,
                    "sessionId": sessionId,
                    "payload": output
                }, undefined]);
            }

            //If a get payload exists just send it
            if (get) {
                node.send([undefined, {
                    "id": nodeId,
                    "topic": "get",
                    "payload": get
                }]);
                return;
            }

            //Only output if it was requested from the node
            if (onlyOutputOnInput == true) {
                if (nodeId != this.id) {
                    return;
                }
            }

            //Block sets if not set to output them
            if(sendSetToOutput != true) {
                if(outputType == "set" && nodeId == this.id) {
                    return;
                }
            }

            //Block get requests from others if not set
            if(getOutputOthers != true) {
                if(outputType == "get" && nodeId != this.id) {
                    return;
                }
            }

            sendOutput();
        });

        //On redeploy
        node.on("close", () => { });
    }

    RED.nodes.registerType("dashbored-widget-node", widgetNode);
}
