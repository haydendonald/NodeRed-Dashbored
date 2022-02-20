module.exports = function (RED) {
    //const htmlParse = require("node-html-parser").parse;
    function dashbored(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var server = RED.nodes.getNode(config.server);
        server.addDashbored({
            id: node.id,
            name: config.name || "dashbored",
            endpoint: config.endpoint || this.name.toLowerCase(),
            HTML: config.HTML || "",
            CSS: config.CSS || "",
            locked: false,
            headerImage: "red/images/node-red.svg",
            headerText: "Dashbored",
            showClock: true,
            showWeather: false,
            navMode: "right",
            password: "",

            //When a message is received from the dashbored
            onMessage: (dashbored, data) => {
                if (data.id == dashbored.id) {
                    switch (data.payload.type) {
                        case "password": {
                            var correct = false;
                            if (data.payload.password !== undefined) {
                                if (data.payload.password == dashbored.password) { correct = true; }
                            }
                            server.sendMsg(this.id, {
                                type: "password",
                                correct
                            });
                            break;
                        }
                        case "unlock": {
                            var correct = false;
                            if (data.payload.password !== undefined) {
                                if (data.payload.password == dashbored.password) { correct = true; }
                            }
                            server.sendMsg(dashbored.id, {
                                type: "unlock",
                                unlock: correct
                            });
                            break;
                        }
                        case "lock": {
                            locked = true;
                            server.sendMsg(dashbored.id, {
                                type: "lock"
                            });
                            break;
                        }
                    }
                }
            },
        });

        //On redeploy
        node.on("close", () => { });
    }

    RED.nodes.registerType("dashbored-dashbored", dashbored);
}