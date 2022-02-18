
module.exports = function (RED) {
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
        dashboards = {};
        widgets = {};

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

                        var html = htmlParse(data);
                        var pagesDiv = html.querySelector("#pages");
                        var onloadScript = `<script id="onloadScripts" type="text/javascript">`;

                        var dashboredHTML = htmlParse(dashbored.HTML);
                        var dashboredPages = dashboredHTML.querySelectorAll("page");

                        //For each page generate
                        for (var i = 0; i < dashboredPages.length; i++) {
                            var page = dashboredPages[i];
                            var pageId = util.randString();
                            if(!page.getAttribute("name")){page.setAttribute("name", "Page");}
                            var currentPageHTML = `<div id="page_${pageId}">`;
                            var elements = page.querySelectorAll("*");
                            for (var j = 0; j < elements.length; j++) {
                                if (elements[j].rawTagName == "widget") {
                                    //Handle the widget creation
                                    var widget = widgets[elements[j].id];
                                    console.log(widget.generateHTML());
                                    if (!widget) { RED.log.warn(`Widget ${elements[j].id} was not found for dashbored ${dashbored.name}`); break; }

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
                                    `;

                                    //Add any extra scripts/css for the widget
                                    if (widget.generateCSS) { html.querySelector("head").innerHTML += `<style id="${widget.id}">${widget.generateCSS()}</style>`; }
                                    if (widget.generateScript) { html.querySelector("html").innerHTML += `<script id="${widget.id}" type="text/javascript">${widget.generateScript()}</script>`; }

                                    currentPageHTML += `<div id=${widget.id}>${widget.generateHTML()}</div>`;
                                }
                                else {
                                    currentPageHTML += elements[j].outerHTML;
                                }
                            }
                            pagesDiv.innerHTML += currentPageHTML + "</div>";
                           console.log(pagesDiv.innerHTML);
                        }

                        //Add the onload scripts and delete the element
                        html.querySelector("head").innerHTML += `${onloadScript}var temp = document.getElementById("onloadScripts"); temp.parentNode.removeChild(temp)</script>`;
                        res.send(html.innerHTML);
                    });
                }
                else {
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
        });
    }

    //Setup the HTTP server
    RED.httpNode.get(`/socket.js`, (req, res) => { res.sendFile("socket.js", { root: webFolder }); });
    RED.httpNode.get(`/util.js`, (req, res) => { res.sendFile("util.js", { root: webFolder }); });
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
