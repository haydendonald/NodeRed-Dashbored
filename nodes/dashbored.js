module.exports = function (RED) {
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
        var id = node.id;

        var navMode = "right"; //Top, Left, Bottom


        var HTML = config.HTML || "";
        var CSS = config.CSS || "";

        //When a message is received from the dashbored
        var onMessage = (data) => {
            if (data.id == id) {
                switch (data.payload.type) {
                    case "password": {
                        var correct = false;
                        if (data.payload.password !== undefined) {
                            if (data.payload.password == password) { correct = true; }
                        }
                        server.sendMsg(id, {
                            type: "password",
                            correct
                        });
                        break;
                    }
                    case "unlock": {
                        var correct = false;
                        if (data.payload.password !== undefined) {
                            if (data.payload.password == password) { correct = true; }
                        }
                        server.sendMsg(id, {
                            type: "unlock",
                            unlock: correct
                        });
                        break;
                    }
                    case "lock": {
                        locked = true;
                        server.sendMsg(id, {
                            type: "lock"
                        });
                        break;
                    }
                }
            }
        }

        //TODO handle locked ad unlocking of the dashboard

        //Add this dashboard to the server
        server.addDashbored({
            id,
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
        node.on("close", () => { });
    }

    RED.nodes.registerType("dashbored-dashbored", dashbored);
}