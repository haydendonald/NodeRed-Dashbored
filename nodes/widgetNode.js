/**
 * Render a basic text element
 */

module.exports = function(RED)
{
    function widgetNode(config)
    {
        RED.nodes.createNode(this, config);
        var node = this;

        //On redeploy
        node.on("close", () => {});
    
    }

    RED.nodes.registerType("dashbored-widget-node", widgetNode);
}
