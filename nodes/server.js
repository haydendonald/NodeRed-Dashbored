module.exports = function(RED) {
    const path = require("path");
    const fs = require("fs");
    const WebSocket = require("ws");
    const htmlParse = require("node-html-parser").parse;
    const util = require("../util.js");
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
                for (var i in dashboards) {
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
                        broadcastMessage(JSON.stringify({
                            id: "weather",
                            temp: out.main.temp,
                            iconUrl: out.weather[0].iconUrl
                        }));
                    });
                } catch (e) {}
            }
        }

        //Get weather updates every couple minutes
        weatherInterval = setInterval(getWeather, 500000);

        //Add the widgets to a page
        var addWidgetsToPage = (document, page, widgetIdsCSSDone) => {
            var elements = page.querySelectorAll("*");
            for (var i = 0; i < elements.length; i++) {
                if (elements[i].rawTagName == "widget") {
                    var widget = widgets[elements[i].id];
                    if (!widget) {
                        RED.log.warn(`Widget ${elements[i].id} was not found`);
                        elements[i].innerHTML = `<p style="background-color: red">Failed to generate widget</p>`;
                        break;
                    }
                    var randomId = util.randString();

                    //Insert the onload script
                    document.addScript(`
                        addOnLoadFunction(function() {
                            print("debug", "onload triggered for widget - ${widget.name} (${widget.id})");
                            ${widget.generateOnload(randomId)}
                        });

                        addOnMsgFunction(function(msg) {
                            //Check if the id is equal to this widget, if so execute the actions
                            if(msg.id == "${widget.id}") {
                                print("debug", "onmsg triggered - ${widget.name} (${widget.id})");
                                ${widget.generateOnMsg(randomId)}
                            }
                        })
                    `);

                    //Add any extra scripts/css for the widget
                    if (widget.generateCSS && !widgetIdsCSSDone[widget.id]) {
                        document.head.innerHTML += `<style id="${widget.id}">${widget.generateCSS()}</style>`;
                        widgetIdsCSSDone[widget.id] = {};
                    }
                    if (widget.generateScript) { html.querySelector("html").innerHTML += `<script id="${widget.id}" type="text/javascript">${widget.generateScript(randomId)}</script>`; }

                    elements[i].innerHTML = widget.generateHTML(randomId);
                }
            }
        }

        //Add a set of pages to a dashbored
        var addPagesToDashbored = (document, dashbored) => {
            var widgetIdsCSSDone = {};
            var firstPage = true;
            var html = htmlParse(dashbored.HTML);
            var pages = html.querySelectorAll("page");
            for (var i = 0; i < pages.length; i++) {
                var page = pages[i];
                var name = page.getAttribute("name") || "";
                var icon = page.getAttribute("icon") || "";
                var navigationVisibility = page.getAttribute("navigation-visibility") || "yes";
                var lockedAccess = page.getAttribute("locked-access") || "no";
                var url = page.getAttribute("url") || "";
                var id = "page_" + util.randString();
                page.setAttribute("id", id);

                //Add page to navigation
                if (navigationVisibility != "no") {
                    document.nav.innerHTML += `<button id="trigger_${id}">${icon != "" ? "<i class='fa " + icon + "'></i> " : ""}<p class="mobile-hidden">${name}</p></button>`;
                    //When the button is clicked make this page visible and all others not
                    document.addScript(`
                        addOnLoadFunction(function() {
                            var others =  document.getElementsByTagName("page");
                            function hideAllPages() {
                                    for(var i = 0; i < others.length; i++) {
                                    others[i].style.display = "none";
                                }
                            }

                            //Change the page
                            document.getElementById("trigger_${id}").onclick = function() {
                                hideAllPages();
                                document.getElementById("${id}").style.display = "block";
                            }

                            //Set the first page to visible
                            if(${firstPage}){hideAllPages(); document.getElementById("${id}").style.display = "block";}
                        });
                    `);
                }

                //Generate the widgets
                addWidgetsToPage(document, page, widgetIdsCSSDone);

                //Add our page
                document.pages.innerHTML += page.outerHTML;
                firstPage = false;
            }
        }

        ////////////////////

        //Send a message to all dashboreds
        node.sendMsg = (msg) => {
            broadcastMessage(JSON.stringify(msg));
        }

        //Return the widgets
        node.getWidgets = () => {
            return widgets;
        }

        //Return the dashboreds
        node.getDashboreds = () => {
            return dashboards;
        }

        node.addDashbored = (dashbored) => {
            RED.log.info(`- Created Dashbored [${dashbored.name}] at /${dashbored.endpoint}`);

            //Handle the incoming HTTP request
            dashbored.handleHTTP = (req, res) => {
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

                        //Grab the elements from the document
                        var document = {};
                        document.html = htmlParse(data);
                        document.head = document.html.querySelector("head");
                        document.pages = document.html.querySelector("#pages");
                        document.header = document.html.querySelector("#header");
                        document.nav = document.html.querySelector("#nav");
                        document.onloadScripts = "";
                        document.addScript = (script) => {
                            document.onloadScripts += script;
                        }

                        //Add the CSS from the dashbored
                        document.head.innerHTML += `<style>${dashbored.CSS}</style>`;

                        //Set the header
                        document.header.innerHTML += `
                            ${dashbored.headerText ? "" : "<h1>" + dashbored.headerText + "</h1>"}
                            ${dashbored.headerImage ? "<img src='" + dashbored.headerImage + "' alt='dashbored logo'>" : ""}
                        `;
                        document.html.querySelector("#clockWeather").innerHTML = `
                            ${dashbored.showClock ? "<h2 id='clock'>" + util.formatAMPM(new Date) + "</h2>" : ""}
                            ${dashbored.showWeather ? "<div id='weather'><img id='weatherImg'></img><h2 id='weatherTemp'></h2></div>" : ""}
                        `;

                        //Set the listener for the clock updates
                        if (dashbored.showClock) {
                            document.addScript(`
                                addOnLoadFunction(function(msg) {
                                    setInterval(function() {
                                            document.getElementById("clock").innerHTML = formatAMPM(new Date());
                                        }, 1000);
                                    });
                                `);
                        }

                        //Set the listener for the weather updates
                        if (dashbored.showWeather) {
                            document.addScript(`
                                addOnMsgFunction(function(msg) {
                                    if(msg.id == "weather") {
                                        document.getElementById("weatherTemp").innerHTML = Math.round(msg.temp) + "°";
                                        document.getElementById("weatherImg").setAttribute("src", msg.iconUrl);
                                    }
                                });
                            `);
                        }

                        //Set the nav bar position
                        switch (dashbored.navMode) {
                            case "bottom":
                                { break; }
                            case "top":
                                {
                                    document.header.classList.add("navTop");
                                    document.pages.classList.add("navTop");
                                    document.nav.classList.add("top");
                                    break;
                                }
                            case "left":
                                {
                                    document.header.classList.add("navSide");
                                    document.pages.classList.add("navSide");
                                    document.nav.classList.add("left");
                                    break;
                                }
                        }

                        //Generate the pages 
                        addPagesToDashbored(document, dashbored);

                        //Add the onload scripts and delete the element
                        document.addScript(`
                            addOnLoadFunction(function() {
                                hideShowElement("loader", false);
                            });
                            var temp = document.getElementById("onLoadScripts");
                            temp.parentNode.removeChild(temp);
                        `);

                        document.head.innerHTML += `<script id="onLoadScripts" type="text/javascript">${document.onloadScripts}</script>`;
                        res.send(document.html.innerHTML);

                        //And then get the weather information to send to the client via the websocket
                        getWeather();
                    });
                } else {
                    //If not index send the file if it exists
                    res.sendFile(file, { root: webFolder });
                }
            }

            //Add the dashbored
            dashboards[dashbored.id] = dashbored;
        }

        node.addWidget = (widget) => {
            RED.log.info(`- Added widget ${widget.name} (${widget.id})`);
            widgets[widget.id] = widget;
        }

        //On redeploy
        node.on("close", () => {
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
        for (var i in dashboards) {
            if ("/" + dashboards[i].endpoint == req.url) {
                RED.log.debug("Got request for dashbored " + dashboards[i].name);
                dashboards[i].handleHTTP(req, res);
                break;
            }
        }
    });

    RED.nodes.registerType("dashbored-server", server);
}