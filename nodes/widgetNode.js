module.exports = function (RED) {
    function widgetNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var widget = RED.nodes.getNode(config.widget);

        var listenToGetFromOthers = true; //Listen to the get requests from other nodes
        var outputMode = "others"; //off, onlyDashbored, onlyInput, others, always

        //Pass the input message to the widget
        node.on("input", (msg) => {
            widget.input(msg, node.id);
        });

        //Add a callback for when a message comes from the dashbored
        widget.addNodeMsgFunction(this.id, (output, outputType, get, nodeId) => {
            var sendOutput = function () {
                node.send([
                    //Output
                    output ? {
                        "topic": outputType,
                        "payload": output
                    } : undefined,
                    //Get
                    get ? {
                        "topic": "get",
                        "payload": get
                    } : undefined
                ]);
            }

            //If it's a get
            console.log(outputType);
            if (outputType == "get") {
                if (listenToGetFromOthers == true) {
                    console.log(nodeId);
                    if (nodeId != undefined) {
                        sendOutput();
                        return;
                    }
                }
                else if (nodeId == node.id) {
                    sendOutput();
                    return;
                }
            }

            //If its a set
            switch (outputMode) {
                //Do nothing
                case "off": {
                    break;
                }
                //Only when the user clicks something on the dashbored
                case "onlyDashbored": {
                    if (nodeId === undefined) {
                        sendOutput();
                    }
                    break;
                }
                //Only when the state changes from the input or dashbored
                case "onlyInput": {
                    if (nodeId == this.id || nodeId == undefined) {
                        sendOutput();
                    }
                    break;
                }
                //Only when the state changes from the input of another widget node or dashbored
                case "others": {
                    if (nodeId != this.id || nodeId == undefined) {
                        sendOutput();
                    }
                    break;
                }
                //Always output
                case "always": {
                    sendOutput();
                    break;
                }
            }
        });

        //On redeploy
        node.on("close", () => { });
    }

    RED.nodes.registerType("dashbored-widget-node", widgetNode);
}
