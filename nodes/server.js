module.exports = function (RED) {
    const path = require("path");
    const fs = require("fs");
    const WebSocket = require("ws");
    var rootFolder = path.join(__dirname, "..");
    var webFolder = path.join(rootFolder, "web");
    var fontAwesomeFolder = path.join(require.resolve('fontawesome-free'), "..");
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
        var statusInterval;

        dashboards = {};
        widgets = {};
        generatedWidgets = {};

        RED.log.info("-------- Dashbored Let's Start! --------");
        RED.log.info(`Root Folder: ${rootFolder}`);
        RED.log.info(`Web Folder: ${webFolder}`);
        RED.log.info(`Font Awesome: ${fontAwesomeFolder}`);
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
                            return out;
                        }
                    });
                }
                catch (e) {
                    RED.log.error("Failed to get weather information: " + e);
                }
            }
        }

        //Send a status update every so often
        var weatherCount = 600;
        var weather;
        statusInterval = setInterval(() => {
            //Don't grab the weather every second, only get it every 10 minutes
            if (weatherCount++ > 600) {
                weather = this.getWeather();
                weatherCount = 0;
            }
            this.sendMsg("status", undefined, {
                "time": Date.now(),
                "weather": weather,
            });
        }, 1000);

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

        //Get a widget
        node.getWidget = (id) => {
            return RED.nodes.getNode(id);
        }

        //Return a generated widget
        node.getGeneratedWidget = (id) => {
            return generatedWidgets[id];
        }

        //Try to find a widget, generated or not
        node.findWidget = (id) => {
            var wid = this.getWidget(id);
            if (!wid) {
                wid = this.getGeneratedWidget(id);
            }
            return wid;
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
            RED.httpNode.get("/" + endpoint, (req, res) => {
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
            });
        }

        node.addWidget = (id, name, type) => {
            RED.log.debug(`- Added widget ${name} (${id}) with type ${type}`);
            widgets[id] = name;
        }

        //Register a new widget to the server
        node.generateWidget = (id, name = "Generated Widget", widgetType, widgetConfig, restoreState = true, setsState = true, widthMultiplier = 1, heightMultiplier = 1, title = "") => {
            var config = {
                id: id,
                server: node,
                name: name,
                restoreState: restoreState,
                setsState: setsState,
                widthMultiplier: widthMultiplier,
                heightMultiplier: heightMultiplier,
                widgetType: widgetType,
                title: title
            };

            //Check if type exists
            if (node.getWidgetTypes()[config.widgetType]) {
                generatedWidgets[id] = {};
                Object.assign(generatedWidgets[id], require("./widget.js")(RED, true)(config));
                RED.log.debug(`- Added generated widget ${name} (${id}) with type ${widgetType}`);

                //Copy in the config
                if (widgetConfig) {
                    for (var j in generatedWidgets[id].defaultConfig) {
                        var val = widgetConfig[j];
                        if (val) {
                            generatedWidgets[id].config[j] = val;
                        }
                    }
                    generatedWidgets[id].setupWidget(generatedWidgets[id].config);
                }

                return generatedWidgets[id];
            }
            else {
                RED.log.error(`Failed to generate widget of type ${type}, the type is invalid`);
            }
        };

        /**
         * Generate a widget given it's HTML element
         * @param {htmlElement} htmlElement The parsed HTML element
         */
        node.generateWidgetHTML = (htmlElement) => {
            return node.generateWidget(htmlElement.getAttribute("id"), htmlElement.getAttribute("name") || "Generated widget", htmlElement.getAttribute("type"),
                htmlElement.attributes, htmlElement.getAttribute("restoreState") || true, htmlElement.getAttribute("setsState") || true,
                htmlElement.getAttribute("widthMultiplier") || 1, htmlElement.getAttribute("heightMultiplier") || 1,
                htmlElement.getAttribute("title"));
        }

        node.getWidgetTypes = () => {
            return widgetTypes;
        }

        //On redeploy
        node.on("close", () => {
            kickClients();
            wss.close();
            clearInterval(statusInterval);
        });
    }

    //Setup the HTTP server
    RED.httpNode.get("/dashbored/script.js", (req, res) => { res.sendFile("script.js", { root: webFolder }); });
    RED.httpNode.get("/dashbored/style.css", (req, res) => { res.sendFile("style.css", { root: webFolder }); });
    RED.httpNode.get("/dashbored/temp.css", (req, res) => { res.sendFile("temp.css", { root: webFolder }); });
    RED.httpNode.get("/dashbored/css/*", (req, res) => {
        res.sendFile("/css/" + req.url.split("/css/")[1], { root: fontAwesomeFolder });
    });
    RED.httpNode.get("/dashbored/webfonts/*", (req, res) => {
        res.sendFile("/webfonts/" + req.url.split("/webfonts/")[1], { root: fontAwesomeFolder });
    });

    //Send the widget ids for the node red editor to populate (if theres a better way i'd like to know...)
    RED.httpNode.get("/dashboredgetallnodeids", (req, res) => {
        var send = [];
        for (var i in widgets) { send.push(`{"value":"${i}", "label":"${widgets[i]}"}`); }
        res.send(send);
    });

    //Dashbored API for node red editor
    RED.httpNode.get("/dashboredAPI", (req, res) => {
        if (!req.query) { RED.log.error("Invalid query passed to the dashbored API url"); }
        else if (req.query.widgets !== undefined) {
            var generate = function (widget) {
                return {
                    id: widget.id,
                    label: widget.name,
                    values: widget.values,
                    widgetType: widget.widgetType,
                    configHTML: widget.generateConfigHTML(),
                    configScript: widget.generateConfigScript(),
                    settings: widget.config
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
        else if (req.query.widgetTypes !== undefined) {
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
        else {
            RED.log.error("Misunderstood query passed to the dashbored API url");
        }
    });

    RED.nodes.registerType("dashbored-server", server);
}