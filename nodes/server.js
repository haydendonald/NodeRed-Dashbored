
module.exports = function (RED) {
    function server(config) {
        const path = require("path");
        const fs = require("fs");
        const WebSocket = require("ws");
        const htmlParse = require("node-html-parser").parse;

        RED.nodes.createNode(this, config);
        var node = this;
        var rootFolder = path.join(__dirname, "..");
        var webFolder = path.join(rootFolder, "web");
        var dashboards = [];
        var widgets = {};

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
                    dashboards[i].onMessage(JSON.parse(data));
                }
                for (var i in widgets) {
                    widgets[i].onMessage(JSON.parse(data));
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

        //Send a message to all dashboreds
        node.sendMsg = (msg) => {
            broadcastMessage(JSON.stringify(msg));
        }

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
                        var widgetDiv = html.querySelector("#widgets");

                        var onloadScript = `<script id="onloadScripts" type="text/javascript">`;

                        //For each widget in this dashbored add it to the HTML
                        for (var i = 0; i < dashbored.widgetIds.length; i++) {
                            var widget = widgets[dashbored.widgetIds[i]];
                            if (!widget) { RED.log.warn(`Widget ${dashbored.widgetIds[i]} was not found for dashbored ${dashbored.name}`); break; }

                            //Insert the onload script
                            onloadScript += `
                            addOnLoadFunction(function() {
                                print("debug", "onload triggered - ${widget.name} (${widget.id})");
                                ${widget.generateOnload()}
                            });

                            addOnMsgFunction(function(data) {
                                //Check if the id is equal to this widget, if so execute the actions
                                var msg = JSON.parse(data.data);
                                if(msg.id == "${widget.id}") {
                                    print("debug", "onmsg triggered - ${widget.name} (${widget.id})");
                                    ${widget.generateOnMsg()}
                                }
                            })
                            `

                            //Add any extra scripts/css for the widget
                            if (widget.generateCSS) { html.querySelector("head").innerHTML += `<style id="${widget.id}">${widget.generateCSS()}</style>`; }
                            if (widget.generateScript) { html.querySelector("html").innerHTML += `<script id="${widget.id}" type="text/javascript">${widget.generateScript()}</script>`; }

                            //Insert the HTML for the widget
                            widgetDiv.innerHTML += widget.generateHTML();
                        }

                        //Add the onload scripts and delete the element
                        html.querySelector("head").innerHTML += `${onloadScript}var temp = document.getElementById("onloadScripts"); temp.parentNode.removeChild(temp)</script>`;


                        //console.log(html.innerHTML);
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

            //Because IE is poo send the files if it asks for them
            RED.httpNode.get(`/socket.js`, (req, res) => {res.sendFile("socket.js", { root: webFolder });});
            RED.httpNode.get(`/util.js`, (req, res) => {res.sendFile("util.js", { root: webFolder });});
        }

        node.addWidget = (widget) => {
            RED.log.info(`- Added widget ${widget.name} (${widget.id})`);
            widgets[widget.id] = widget;
        }

        //On redeploy
        node.on("close", () => {
            wss.close();
        });
    }

    RED.nodes.registerType("dashbored-server", server);
}
