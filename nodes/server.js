module.exports = function (RED) {
    const path = require("path");
    const fs = require("fs");
    const WebSocket = require("ws");
    var rootFolder = path.join(__dirname, "..");
    var webFolder = path.join(rootFolder, "web");
    var dashboards = {};
    var widgets = {};
    var generatedWidgets = {};

    //Define the possible widget types
    const widgetTypes = function () {
        //Insert widgets to include here
        var requires = require("../widgets/widgets.js");

        //Generate the map
        var ret = {};
        for (var i in requires) {
            var curr = requires[i];
            RED.log.debug(`Added widget ${curr.widgetType}@${curr.version} to the dashbored project`);
            ret[curr.widgetType] = curr;
        }
        return ret;
    }();

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
        generatedWidgets = {};

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
                var msg = JSON.parse(data);

                //Send the message to the dashboards
                for (var endpoint in dashboards) {
                    RED.nodes.getNode(dashboards[endpoint].id).onMessage(msg);
                }
                for (var id in widgets) {
                    RED.nodes.getNode(id).onMessage(msg);
                }
                for (var id in generatedWidgets) {
                    generatedWidgets[id].onMessage(msg);
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
            var self = this;
            if (weatherLat != "" && weatherLong != "" && weatherUnit != "" && weatherAppId != "") {

                RED.log.debug("Attempt to get weather information");
                try {
                    var weather = require("openweather-apis");
                    weather.setCoordinate(weatherLat, weatherLong);
                    weather.setUnits(weatherUnit);
                    weather.setAPPID(weatherAppId);
                    weather.getAllWeather(function (err, out) {
                        if (err) {
                            RED.log.error("Failed to get weather information: " + err);
                        }
                        else {
                            //Broadcast to all sessions
                            self.sendMsg("weather", undefined, out);
                        }
                    });
                }
                catch (e) {
                    RED.log.error("Failed to get weather information: " + e);
                }
            }
        }

        //Get weather updates every couple minutes
        weatherInterval = setInterval(getWeather, 500000);

        ////////////////////

        //Send a message to all dashboreds
        node.sendMsg = (id, sessionId, payload) => {
            broadcastMessage(JSON.stringify({
                id,
                sessionId,
                payload
            }));
        }

        //Return the widgets
        node.getWidgets = () => {
            return widgets;
        }

        //Return a generated widget
        node.getGeneratedWidget = (id) => {
            return generatedWidgets[id];
        }

        //Get the weather
        node.getWeather = () => {
            getWeather();
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

        node.addWidget = (id, name, type, widgetTypeVersion) => {
            RED.log.info(`- Added widget ${name} (${id}) with type ${type}@${widgetTypeVersion}`);
            widgets[id] = name;
        }

        node.addGeneratedWidget = (id, obj) => {
            generatedWidgets[id] = obj;
        }

        node.getWidgetTypes = () => {
            return widgetTypes;
        }

        //On redeploy
        node.on("close", () => {
            kickClients();
            wss.close();
            clearInterval(weatherInterval);
        });
    }

    //Setup the HTTP server
    RED.httpNode.get("/script.js", (req, res) => { res.sendFile("script.js", { root: webFolder }); });
    RED.httpNode.get("/style.css", (req, res) => { res.sendFile("style.css", { root: webFolder }); });
    RED.httpNode.get("/temp.css", (req, res) => { res.sendFile("temp.css", { root: webFolder }); });

    //Send the widget ids for the node red editor to populate (if theres a better way i'd like to know...)
    RED.httpNode.get("/dashboredgetallnodeids", (req, res) => {
        var send = [];
        for (var i in widgets) { send.push(`{"value":"${i}", "label":"${widgets[i]}"}`); }
        res.send(send);
    });

    RED.httpNode.get("/dashboredAPI", (req, res) => {
        if (!req.query) { return; }
        if (req.query.widgets !== undefined) {
            var generate = function (widget) {
                return {
                    id: widget.id,
                    label: widget.name,
                    values: widget.values,
                    widgetType: widget.widgetType,
                    configHTML: widget.generateConfigHTML(),
                    configScript: widget.generateConfigScript()
                }
            }
            var send = [];
            if (req.query.widgets != "") {
                //Single widget
                var node = RED.nodes.getNode(req.query.widgets);
                if (!node) { res.status(404); res.send("{}"); return; }
                send = generate(node);
            }
            else {
                //All widgets
                for (var i in widgets) {
                    var node = RED.nodes.getNode(i);
                    if (node) {
                        send.push(generate(node));
                    }
                }
            }
            res.send(send);
        }
        if (req.query.widgetTypes !== undefined) {
            var send = {};
            for (var i in widgetTypes) {
                var type = widgetTypes[i];
                if (!type.doNotSendToEditor) {
                    send[i] = {
                        widget: type.widgetType,
                        name: type.label,
                        description: type.description,
                        configHTML: type.generateConfigHTML(),
                        configScript: type.generateConfigScript(),
                        config: type.config,
                        defaultConfig: type.defaultConfig
                    };
                }
            }
            res.send(send);
        }
    });

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