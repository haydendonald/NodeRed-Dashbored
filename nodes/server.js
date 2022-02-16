
module.exports = function (RED) {
    function server(config) {
        const path = require("path");
        const fs = require("fs");
        const WebSocket = require("ws");
        const htmlParse = require("node-html-parser").parse;
        const debug = true;

        RED.nodes.createNode(this, config);
        var node = this;
        var rootFolder = path.join(__dirname, "..");
        var webFolder = path.join(rootFolder, "web");
        var dashboards = [];
        var widgets = [];

        RED.log.info("-------- Dashbored Let's Start! --------");
        RED.log.info(`Root Folder: ${rootFolder}`);
        RED.log.info(`Web Folder: ${webFolder}`);
        RED.log.info("");

        //Setup the web socket server
        const wss = new WebSocket.WebSocketServer({ port: 4235 });
        wss.on("connection", (ws, request, client) => {
            RED.log.debug("Got new websocket connection");
            ws.on("message", (data) => {
                RED.log.debug(`Got websocket message [${data}]`);

                //Send the message to the dashboards
                for (var i = 0; i < dashboards.length; i++) {
                    dashboards[i].onMessage(data);
                }
                for (var i = 0; i < widgets.length; i++) {
                    widgets[i].onMessage(data);
                }
            });
        });

        //Send a message to all websocket client(s)
        var broadcastMessage = (data) => {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.WebSocket.OPEN) {
                    client.send(data);
                }
            });
        }

        ////////////////////

        node.addDashbored = (dashbored) => {
            RED.log.info(`- Created Dashbored [${dashbored.name}] at /${dashbored.endpoint}`);
            dashboards.push(dashbored);

            //Handle the incoming HTTP request
            var handleHTTP = (req, res) => {
                if (req.method != "GET") {
                    res.type("text/plain");
                    res.status(500);
                    res.send("500 - Internal Server Error");
                    return;
                }

                //Generate the HTML if requesting index
                var file = req.url.split(`/${dashbored.endpoint}/`)[1];
                if (!file || file == "index.html") {
                    fs.readFile(path.join(webFolder, "index.html"), "utf-8", (error, data) => {
                        if (error) {
                            RED.log.error("Failed to load HTML: " + error);
                            res.type("text/plain");
                            res.status(500);
                            res.send("Internal Server Error");
                        }

                        var html = htmlParse(data);
                        var wid = html.querySelector("#widgets");
                        
                        for(var i = 0; i < widgets.length; i++) {
                            wid.innerHTML += widgets[i].generateHTML();
                        }

                        

                        console.log(html.innerHTML);
                        res.send(html.innerHTML);
                    });
                }
                else {
                    //If not index send the file if it exists
                    res.sendFile(file, { root: webFolder });
                }
            }

            //Set our HTTP listeners
            RED.httpNode.get(`/${dashbored.endpoint}`, handleHTTP);
            RED.httpNode.get(`/${dashbored.endpoint}/*`, handleHTTP);
        }

        node.addWidget = (widget) => {
            RED.log.info(`- Added widget ${widget.name}`);
            widgets.push(widget);
        }

        //On redeploy
        node.on("close", () => {
            wss.close();
        });
    }

    RED.nodes.registerType("dashbored-server", server);
}
