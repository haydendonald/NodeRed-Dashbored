module.exports = function(RED)
{
    function widget(config)
    {
        RED.nodes.createNode(this, config);
        var node = this;

        //On redeploy
        node.on("close", () => {});
    
    }

    RED.nodes.registerType("dashbored-widget", widget);
}
