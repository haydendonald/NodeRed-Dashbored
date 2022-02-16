/**
 * Render a basic text element
 */

module.exports = function(RED)
{
    function node(config)
    {
        RED.nodes.createNode(this, config);
        var node = this;

        //On redeploy
        node.on("close", () => {});
    
    }

    RED.nodes.registerType("dashbored-node", node);
}
