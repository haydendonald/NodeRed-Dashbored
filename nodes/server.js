module.exports = function (RED) {
    const path = require("path");
    const fs = require("fs");
    const WebSocket = require("ws");
    var rootFolder = path.join(__dirname, "..");
    var webFolder = path.join(rootFolder, "web");
    var dashboards = {};
    var widgets = {};

    function server(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var weatherLat = config.weatherLat || "";
        var weatherLong = config.weatherLong || "";
        var weatherUnit = config.weatherUnit || "";
        var weatherAppId = config.apiKey || "";
        var weatherInterval;

        dashboards = {};
        widgets = {};

        RED.log.info("-------- Dashbored Let's Start! --------");
        RED.log.info(`Root Folder: ${rootFolder}`);
        RED.log.info(`Web Folder: ${webFolder}`);
        RED.log.info(`Weather Location -> Latitude: ${weatherLat}, Longitude: ${weatherLong}`);
        RED.log.info(`Weather Unit: ${weatherUnit}`);

        //Setup the web socket server
        const wss = new WebSocket.WebSocketServer({ port: 4235 });
        wss.on("connection", (ws, request, client) => {
            RED.log.debug("Got new websocket connection");
            ws.on("message", (data) => {
                RED.log.debug(`Got websocket message [${data}]`);

                //Send the message to the dashboards
                for (var endpoint in dashboards) {
                    RED.nodes.getNode(dashboards[endpoint].id).onMessage(JSON.parse(data));
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

        //Kick all the web socket clients
        var kickClients = () => {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.WebSocket.OPEN) {
                    client.terminate();
                }
            });
        }

        //Setup the weather if set
        var getWeather = () => {
            if (weatherLat != "" && weatherLong != "" && weatherUnit != "" && weatherAppId != "") {
                try {
                    RED.log.debug("Attempt to get weather information");
                    var weather = require("openweathermap");
                    weather.now({ lat: weatherLat, lon: weatherLong, units: weatherUnit, appid: weatherAppId }, (error, out) => {
                        if (error || out.cod != 200) {
                            RED.log.error("Failed to get weather information");
                            return;
                        }

                        //Broadcast to all sessions
                        this.sendMsg("weather", {
                            temp: out.main.temp,
                            iconUrl: out.weather[0].iconUrl
                        });
                    });
                } catch (e) { }
            }
        }

        //Get weather updates every couple minutes
        weatherInterval = setInterval(getWeather, 500000);

        ////////////////////

        //Send a message to all dashboreds
        node.sendMsg = (id, payload) => {
            broadcastMessage(JSON.stringify({
                id,
                payload
            }));
        }

        //Return the widgets
        node.getWidgets = () => {
            return widgets;
        }

        //Return the dashboreds
        node.getDashboreds = () => {
            return dashboards;
        }

        node.addDashbored = (id, name, endpoint) => {
            dashboards[endpoint] = {
                id,
                name
            };
            RED.log.info(`- Added Dashbored [${name}] at /${endpoint}`);
        }

        node.addWidget = (widget) => {
            RED.log.info(`- Added widget ${widget.name} (${widget.id})`);
            widgets[widget.id] = widget;
        }

        //On redeploy
        node.on("close", () => {
            kickClients();
            wss.close();
            clearInterval(weatherInterval);
        });
    }

    //Setup the HTTP server
    RED.httpNode.get(`/script.js`, (req, res) => { res.sendFile("script.js", { root: webFolder }); });
    RED.httpNode.get(`/style.css`, (req, res) => { res.sendFile("style.css", { root: webFolder }); });
    //Send the widget ids for the node red editor to populate (if theres a better way i'd like to know...)
    RED.httpNode.get(`/dashboredgetallnodeids`, (req, res) => {
        var send = [];
        for (var i in widgets) { send.push(`{"value":"${i}", "label":"${widgets[i].name}"}`); }
        res.send(send);
    })
    RED.httpNode.get("/*", (req, res) => {
        for (var endpoint in dashboards) {
            if ("/" + endpoint == req.url) {
                RED.log.debug("Got request for dashbored " + dashboards[endpoint].name);

                //Handle the request
                if (req.method != "GET") {
                    res.type("text/plain");
                    res.status(500);
                    res.send("500 - Internal Server Error");
                }
                else {
                    var file = req.url.split(`/${endpoint}/`)[1];
                    if (!file || file == "index.html") {
                        fs.readFile(path.join(webFolder, "index.html"), "utf-8", (error, data) => {
                            if (error) {
                                RED.log.error("Failed to load HTML: " + error);
                                res.type("text/plain");
                                res.status(500);
                                res.send("Internal Server Error");
                            }
                            else {
                                RED.nodes.getNode(dashboards[endpoint].id).handleHTTP(data, req, res);
                            }
                        });
                    } else {
                        //If not index send the file if it exists
                        res.sendFile(file, { root: webFolder });
                    }
                }
                break;
            }
        }
    });

    RED.nodes.registerType("dashbored-server", server);
}