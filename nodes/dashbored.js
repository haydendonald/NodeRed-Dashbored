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
        var headerImage = ""; //https://images.fastcompany.net/image/upload/w_1280,f_auto,q_auto,fl_lossy/w_596,c_limit,q_auto:best,f_auto/fc/3034007-inline-i-applelogo.jpg
        var headerText = "Dashbored";
        var showClock = true;
        var showWeather = true;
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
            showWeather
        });

        //On redeploy
        node.on("close", () => {});
    }

    RED.nodes.registerType("dashbored-dashbored", dashbored);
}