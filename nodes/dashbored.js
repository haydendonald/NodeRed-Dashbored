
module.exports = function (RED) {
    //const htmlParse = require("node-html-parser").parse;
    function dashbored(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var name = config.name || "dashbored";
        var endpoint = config.endpoint || name.toLowerCase();
        var server = RED.nodes.getNode(config.server);
        var HTML = config.HTML || "";
        //var widgetIds = [];

        //When a message is received from the dashbored
        var onMessage = (data) => {
            //console.log(`${data}`);
        }

        // //Add a widget to this dashbored
        // var addWidget = (widgetId) => {
        //     widgetIds.push(widgetId);
        // }

        //Add this dashboard to the server
        server.addDashbored({
            id: node.id,
            name,
            endpoint,
            onMessage,
            HTML
        });

        //On redeploy
        node.on("close", () => { });
    }

    RED.nodes.registerType("dashbored-dashbored", dashbored);
}