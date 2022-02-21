module.exports = function(RED)
{
    function node(config)
    {
        RED.nodes.createNode(this, config);
        var node = this;
        var widget = RED.nodes.getNode(config.widgetId);


        console.log(config.widgetId);
        console.log(widget);

        // //Pass the input message to the widget
        // node.on("input", (msg) => {
        //     widget.input(msg);
        // });

        // //Add a callback for when a message comes from the dashbored
        // widget.addNodeMsgFunction((data) => {
        //     node.send({
        //         "payload": data
        //     });
        // });

        //On redeploy
        node.on("close", () => {});
    
    }

    RED.nodes.registerType("dashbored-widget-toggleButton", node);
}
