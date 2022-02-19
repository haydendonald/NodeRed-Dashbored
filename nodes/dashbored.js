module.exports = function(RED) {
    //const htmlParse = require("node-html-parser").parse;
    function dashbored(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var name = config.name || "dashbored";
        var endpoint = config.endpoint || name.toLowerCase();
        var server = RED.nodes.getNode(config.server);
        var locked = false;
        var password = "";
        var headerImage = "red/images/node-red.svg";
        var headerText = "Dashbored";
        var showClock = true;
        var showWeather = true;

        var navMode = "right"; //Top, Left, Bottom


        var HTML = config.HTML || "";
        var CSS = config.CSS || "";

        //When a message is received from the dashbored
        var onMessage = (data) => {
            //console.log(`${data}`);
        }

        //TODO handle locked ad unlocking of the dashboard

        //Add this dashboard to the server
        server.addDashbored({
            id: node.id,
            name,
            endpoint,
            onMessage,
            HTML,
            CSS,
            locked,
            headerImage,
            headerText,
            showClock,
            showWeather,
            navMode
        });

        //On redeploy
        node.on("close", () => {});
    }

    RED.nodes.registerType("dashbored-dashbored", dashbored);
}