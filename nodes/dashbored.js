module.exports = function (RED) {
    //const htmlParse = require("node-html-parser").parse;
    function dashbored(config) {
        const htmlParse = require("node-html-parser").parse;
        const util = require("../util.js");

        RED.nodes.createNode(this, config);
        var node = this;

        var id = node.id;
        var server = RED.nodes.getNode(config.server);
        var name = config.name || "dashbored";
        var endpoint = config.endpoint || this.name.toLowerCase();
        var HTML = config.HTML || "";
        var CSS = config.CSS || "";
        var locked = true;
        var headerImage = "red/images/node-red.svg";
        var headerText = "Dashbored";
        var showClock = true;
        var showWeather = false;
        var navMode = "right";
        var password = "";

        //When a message is received from the dashbored
        node.onMessage = (data) => {
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
                            if (data.payload.password == password) { correct = true; locked = false; }
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

        //Add the widgets to a page
        var addWidgetsToPage = (document, page, widgetIdsCSSDone) => {
            var elements = page.querySelectorAll("*");
            for (var i = 0; i < elements.length; i++) {
                if (elements[i].rawTagName == "widget") {
                    var widget = server.getWidgets()[elements[i].id];
                    var widgetElement = elements[i];
                    if (!widget) {
                        RED.log.warn(`Widget ${elements[i].id} was not found`);
                        elements[i].innerHTML = `<p style="background-color: red">Failed to generate widget</p>`;
                        break;
                    }
                    var randomId = util.randString();
                    widgetElement.setAttribute("id", randomId);
                    var lockedAccess = widgetElement.getAttribute("locked-access") || "no";
                    var alwaysPassword = widgetElement.getAttribute("always-password") || "no";
                    var ask = widgetElement.getAttribute("ask") || "no";
                    var askText = widgetElement.getAttribute("ask-text") || "";

                    //Hide the widget when locked
                    if (lockedAccess == "no") {
                        document.addScript(`
                            addElementHiddenWhileLocked("${randomId}");
                        `);
                    }


                    //Insert the onload script
                    document.addScript(`
                        addOnLoadFunction(function() {
                            ${widget.generateOnload(randomId, lockedAccess, alwaysPassword, ask, askText)}
                        });

                        addOnMsgFunction(function(msg) {
                            //Check if the id is equal to this widget, if so execute the actions
                            if(msg.id == "${widget.id}") {
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
        var addPagesToDashbored = (document) => {
            var widgetIdsCSSDone = {};
            var firstPage = true;
            var html = htmlParse(HTML);
            var pages = html.querySelectorAll("page");
            for (var i = 0; i < pages.length; i++) {
                var page = pages[i];
                var name = page.getAttribute("name") || "";
                var icon = page.getAttribute("icon") || "";
                var navigationVisibility = page.getAttribute("navigation-visibility") || "yes";
                var lockedAccess = page.getAttribute("locked-access") || "no";
                var alwaysPassword = page.getAttribute("always-password") || "no";
                var id = "page_" + util.randString();
                page.setAttribute("id", id);

                //Add page to navigation
                if (navigationVisibility != "no") {
                    document.nav.innerHTML += `<button id="trigger_${id}">${icon != "" ? "<i class='fa " + icon + "'></i> " : ""}<p class="mobile-hidden">${name}</p></button>`;
                    //When the button is clicked make this page visible and all others not
                    document.addScript(`
                        addOnLoadFunction(function() {
                            //Change the page
                            document.getElementById("trigger_${id}").onclick = function() {
                                var action = function() {
                                    showCurrentPage("${id}");
                                };
                                if(!locked){
                                    ${alwaysPassword == "yes" ? "askPassword(action);" : "action();"}
                                }
                                else {
                                    ${lockedAccess == "password" ? "askPassword(action)" : ""}
                                    ${lockedAccess == "yes" ? "askPassword(action, undefined, true)" : ""}
                                }
                            }

                            //Hide the element initially if required
                            if(locked) {
                                ${lockedAccess == "no" ? "hideShowElement('" + id + "', false);" : ""}
                                ${lockedAccess == "no" ? "hideShowElement('trigger_" + id + "', false);" : ""}
                            }

                            //Set the first page to visible
                            if(${firstPage}){currentPage = document.getElementById("${id}"); showCurrentPage();}
                        });
                    `);
                }

                //Hide the page when locked
                if (lockedAccess == "no") {
                    document.addScript(`
                        addElementHiddenWhileLocked("${id}");
                        ${navigationVisibility != "no" ? "addElementHiddenWhileLocked('trigger_" + id + "');" : ""}
                    `);
                }

                //Add the widgets
                addWidgetsToPage(document, page, widgetIdsCSSDone);

                //Add our page
                document.pages.innerHTML += page.outerHTML;
                firstPage = false;
            }
        }

        //Handle the incoming HTTP request
        node.handleHTTP = (baseDocument, req, res) => {
            console.log(locked);

            //Grab the elements from the document
            var document = {};
            document.html = htmlParse(baseDocument);
            document.head = document.html.querySelector("head");
            document.pages = document.html.querySelector("#pages");
            document.header = document.html.querySelector("#header");
            document.nav = document.html.querySelector("#nav");
            document.onloadScripts = "";
            document.addScript = (script) => {
                document.onloadScripts += script;
            }

            //Add the CSS from the dashbored
            document.head.innerHTML += `<style>${CSS}</style>`;

            //Set the header
            document.header.innerHTML += `
                ${headerText ? "" : "<h1>" + headerText + "</h1>"}
                ${headerImage ? "<img src='" + headerImage + "' alt='dashbored logo'>" : ""}
            `;
            document.html.querySelector("#clockWeather").innerHTML = `
                ${showClock ? "<h2 id='clock'>" + util.formatAMPM(new Date) + "</h2>" : ""}
                ${showWeather ? "<div id='weather'><img id='weatherImg'></img><h2 id='weatherTemp'></h2></div>" : ""}
            `;

            //Set the listener for the clock updates
            if (showClock) {
                document.addScript(`
                    addOnLoadFunction(function(msg) {
                        setInterval(function() {
                                document.getElementById("clock").innerHTML = formatAMPM(new Date());
                            }, 1000);
                        });
                    `);
            }

            //Set the listener for the weather updates
            if (showWeather) {
                document.addScript(`
                    addOnMsgFunction(function(msg) {
                        if(msg.id == "weather") {
                            document.getElementById("weatherTemp").innerHTML = Math.round(msg.payload.temp) + "°";
                            document.getElementById("weatherImg").setAttribute("src", msg.payload.iconUrl);
                        }
                    });
                `);
            }

            //Set the nav bar position
            switch (navMode) {
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
            addPagesToDashbored(document);

            //Add the onload scripts and delete the element
            document.addScript(`
                //Global variables
                var dashboredId = "${id}";
                var locked = ${locked};

                addOnLoadFunction(function() {
                    setTimeout(function(){hideShowElement("loader", false, 0.5);}, 500);
                });
                var temp = document.getElementById("onLoadScripts");
                temp.parentNode.removeChild(temp);
            `);

            document.head.innerHTML += `<script id="onLoadScripts" type="text/javascript">${document.onloadScripts}</script>`;
            res.send(document.html.innerHTML);
        }

        //Add the dashbored to the server
        server.addDashbored(id, name, endpoint);


        //On redeploy
        node.on("close", () => { });
    }

    RED.nodes.registerType("dashbored-dashbored", dashbored);
}