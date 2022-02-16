
module.exports = function (RED) {

    function dashbored(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var name = config.name || "dashbored";
        var endpoint = config.endpoint || name.toLowerCase();
        var server = RED.nodes.getNode(config.server);

        //When a message is received from the dashbored
        var onMessage = (data) => {
            console.log(`${data}`);
        }

        //Add this dashboard to the server
        server.addDashbored({
            id: node.id,
            name,
            endpoint,
            onMessage
        });

        //On redeploy
        node.on("close", () => { });
    }

    RED.nodes.registerType("dashbored-dashbored", dashbored);
}