module.exports = function (RED) {
    function widgetNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var widget = RED.nodes.getNode(config.widget);

        //Pass the input message to the widget
        node.on("input", (msg) => {
            widget.input(msg);
        });

        //Add a callback for when a message comes from the dashbored
        widget.addNodeMsgFunction((output, outputType, get) => {
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
        });

        //On redeploy
        node.on("close", () => { });
    }

    RED.nodes.registerType("dashbored-widget-node", widgetNode);
}
