module.exports = function (RED) {
    //const htmlParse = require("node-html-parser").parse;
    function dashbored(config) {
        const htmlParse = require("node-html-parser").parse;
        const util = require("../util.js");

        RED.nodes.createNode(this, config);
        var node = this;
        var nodeMsgFunctions = [];

        var id = node.id;
        var server = RED.nodes.getNode(config.server);
        var name = config.name || "dashbored";
        var endpoint = config.endpoint || this.name.toLowerCase();
        var HTML = config.HTML;
        var CSS = config.CSS;
        var locked = false;
        var headerImage = config.headerImage;
        var headerText = config.headerText;
        var showClock = config.showClock == "true" || config.showClock == true;
        var showWeather = config.showWeather == "true" || config.showWeather == true;
        var navMode = config.navMode || "bottom";
        var password = config.password;
        var alwaysShowLockButton = config.alwaysShowLockButton;
        var showHeader = config.showHeader;
        var showNav = config.showNav;

        var baseHeight = config.baseHeight || "150px";
        var baseWidth = config.baseWidth || "200px";
        var headerHeight = showHeader ? config.headerHeight : "0px";
        var navHeight = showNav ? config.navHeight : "0px";

        //Add a callback to listen to msg functions
        node.addNodeMsgFunction = function (fn) {
            nodeMsgFunctions.push(fn);
        }

        //Send a message to the flow
        function sendMsgToFlow(topic, payload) {
            for (var i in nodeMsgFunctions) {
                nodeMsgFunctions[i](topic, payload);
            }
        }

        node.lockDashbored = function (sessionId) {
            this.onMessage({
                id: id,
                sessionId: sessionId,
                payload: {
                    type: "lock",
                    password: password
                }
            });
        }

        //Unlock a dashbored. If id is undefined it will unlock all dashboreds
        node.unlockDashbored = function (sessionId) {
            this.onMessage({
                id: id,
                sessionId: sessionId,
                payload: {
                    type: "unlock",
                    password: password
                }
            });
        }

        node.reloadDashbored = function (sessionId) {
            this.onMessage({
                id: id,
                sessionId: sessionId,
                payload: {
                    type: "reload",
                    password: password
                }
            });
        }

        //When a message is received from the dashbored
        node.onMessage = (data) => {
            if (data.id == id) {
                switch (data.payload.type) {
                    case "password": {
                        var correct = false;
                        if (data.payload.password !== undefined) {
                            if (data.payload.password == password) { correct = true; }
                        }
                        server.sendMsg(id, data.sessionId, {
                            type: "password",
                            correct
                        });
                        break;
                    }
                    case "unlock": {
                        var correct = false;
                        if (data.payload.password !== undefined) {
                            if (data.payload.password == password) {
                                correct = true;
                                if (data.sessionId == undefined) {
                                    locked = false;
                                }
                            }
                        }
                        server.sendMsg(id, data.sessionId, {
                            type: "unlock",
                            unlock: correct
                        });
                        if (correct == true) {
                            sendMsgToFlow("unlock", {
                                id: id,
                                sessionId: data.sessionId
                            });
                        }
                        break;
                    }
                    case "lock": {
                        if (data.sessionId == undefined) {
                            locked = true;
                        }
                        server.sendMsg(id, data.sessionId, {
                            type: "lock"
                        });
                        sendMsgToFlow("lock", {
                            id: id,
                            sessionId: data.sessionId
                        });
                        break;
                    }
                    //Get the weather
                    case "weather": {
                        server.getWeather();
                        break;
                    }
                    //Reload the dashbored
                    case "reload": {
                        server.sendMsg(id, data.sessionId, {
                            type: "reload",
                            sessionId: data.sessionId
                        });
                        break;
                    }
                }
            }
            else {
                //Send the raw data
                sendMsgToFlow("other", {
                    id: id,
                    sessionId: data.sessionId,
                    data: data
                });
            }
        }

        //Add the widgets to a page
        var addWidgetsToPage = (document, page, widgetIdsCSSDone) => {
            var elements = page.querySelectorAll("*");
            server.getGeneratedWidget();
            for (var i = 0; i < elements.length; i++) {
                if (elements[i].rawTagName == "widget") {
                    var widget = RED.nodes.getNode(elements[i].id);

                    //If the widget was not found see if we can generate it
                    if (!widget) {
                        var widId = elements[i].getAttribute("id");

                        //See if it exists first
                        widget = server.getGeneratedWidget(widId);
                        if (!widget && elements[i].getAttribute("type") != undefined) {
                            if (!elements[i].getAttribute("id")) { RED.log.error("A generated widget needs a unique id"); }
                            else {
                                //If we still don't have a widget we need to generate it
                                var widget = server.generateWidgetHTML(elements[i]);
                            }
                            if (!widget) {
                                RED.log.error(`Failed to generate widget of type ${elements[i].getAttribute("type")}`);
                            }
                        }
                    }

                    var widgetElement = elements[i];
                    if (!widget) {
                        RED.log.warn(`Widget ${elements[i].id} was not found`);
                        document.addScript(`
                            addOnLoadFunction(function() {
                                console.error("Failed to generate widget with id ${elements[i].id} as it was not found!");
                            });
                        `);
                        break;
                    }
                    var randomId = util.randString();
                    widgetElement.setAttribute("id", `${randomId}_widget`);
                    var lockedAccess = widgetElement.getAttribute("locked-access") || "no";
                    var alwaysPassword = widgetElement.getAttribute("always-password") || "no";
                    var ask = widgetElement.getAttribute("ask") || "no";
                    var askText = widgetElement.getAttribute("ask-text") || "";
                    var title = widgetElement.getAttribute("title") || widget.title;
                    var widthMultiplier = parseFloat(widgetElement.getAttribute("widthMultiplier") || widget.widthMultiplier);
                    var heightMultiplier = parseFloat(widgetElement.getAttribute("heightMultiplier") || widget.heightMultiplier);

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

                            //Hide the element initially if required
                            if(locked) {
                                ${lockedAccess == "no" ? "hideShowElement('" + randomId + "', false);" : ""}
                            }
                        });

                        addOnMsgFunction(function(msg) {
                            //Check if the id is equal to this widget, if so execute the actions
                            if(msg.id == "${widget.id}") {
                                ${widget.generateOnMsg(randomId)}
                            }
                        })
                    `);

                    //Generate and add the CSS
                    var CSS = function () {
                        var ret = `
                        #${randomId}_widget {`
                        
                        if(!widget.noHeight) {
                            ret += `height: calc(${baseHeight} * ${heightMultiplier});`;
                        }
                        if(!widget.noWidth) {
                            ret += `width: calc(${baseWidth} * ${widthMultiplier}) ;`;
                        }
                        if (widget.minWidth) {
                            ret += `"min-width: ${widget.minWidth};`;
                        }
                        if (widget.minHeight) {
                            ret += `"min-height: ${widget.minHeight};`;
                        }
                        if (widget.maxWidth) {
                            ret += `max-width: ${widget.maxWidth};`;
                        }
                        if (widget.maxHeight) {
                            ret += `max-height: ${widget.maxHeight};`;
                        }

                        ret += `
                            float: left;
                            border-radius: 10px;
                        }`;

                        //If there is a title update the CSS
                        if (title) {
                            ret += `
                            #${randomId}_title {
                                font-size: 1.2em;
                                margin-top: 10px;
                                margin-bottom: 10px;
                                text-align: center;
                            }
                            #${randomId}_content {
                                width: 100%;
                                height: calc(100% - (25px + 1.2em));
                            }
                            `
                        }

                        return ret;
                    }();

                    //Go through the CSS and add the ids
                    var classes = widget.generateCSS().split("}");
                    for (var j = 0; j < classes.length - 1; j++) {
                        var selectors = classes[j].split(" {");
                        selectors[0] = selectors[0].replace(/^\s+|\s+$/gm, '');
                        var output = `${selectors[0][0]}${randomId}_${selectors[0].substring(1)} {${selectors[1]}}\n`;
                        CSS += output;
                    }

                    widgetIdsCSSDone[widget.id] = {};
                    document.head.innerHTML += `<style id="${widget.id}">${CSS}</style>`;
                    widgetElement.rawTagName = "div"; //Make it a div because a widget type doesn't get rendered

                    //Add any extra scripts
                    //if (widget.generateScript) { document.html.innerHTML += `<script id="${widget.id}" type="text/javascript">${widget.generateScript(randomId)}</script>`; }

                    //Add the HTML
                    var widgetHTML = htmlParse(widget.generateHTML(randomId));

                    //Add any widgets inside this widget
                    addWidgetsToPage(document, widgetHTML, widgetIdsCSSDone);

                    elements[i].innerHTML = `
                        ${title ? `${util.generateTag(randomId, "h1", "title", title)}` : ""}
                        ${title ? `${util.generateTag(randomId, "div", "content", widgetHTML.outerHTML)}` : widgetHTML.outerHTML}
                    `;
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
                page.classList.add("background");

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
                            if(${firstPage}){currentPage = document.getElementById("${id}"); showCurrentPage("${id}");}
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

            //Add the title
            document.head.innerHTML += `<title>${headerText}</title>`;

            //Set the header
            if (showHeader) {
                document.header.innerHTML += `
                    ${headerImage ? "<img src='" + headerImage + "' alt='dashbored logo'>" : ""}
                    ${headerText ? "<h1>" + headerText + "</h1>" : ""}
                `;
                document.html.querySelector("#clockWeather").innerHTML = `
                    ${showClock == true ? "<h2 id='clock' style='float: right; margin-left: 20px'>" + util.formatAMPM(new Date) : "</h2>"}
                    ${showWeather == true ? "<h2 id='weatherTemp' style='float: left'></h2>" : ""}
                `;

                //Set the listener for the clock updates
                if (showClock == true) {
                    document.addScript(`
                        addOnMsgFunction(function(msg) {
                            if(msg.id == "status") {
                                if(msg.payload.time) {
                                    document.getElementById("clock").innerHTML = formatAMPM(new Date(msg.payload.time));
                                }
                            }
                        });
                        `);
                }

                //Set the listener for the weather updates
                if (showWeather) {
                    document.addScript(`
                    addOnMsgFunction(function(msg) {
                        if(msg.id == "status") {
                            if(msg.payload.weather) {
                                document.getElementById("weatherTemp").innerHTML = Math.round(msg.payload.weather.main.temp) + "°";
                            }
                        }
                    });
                `);
                }
            }

            //Generate the CSS

            var generatedCSS = CSS;

            //Header
            if (showHeader) {
                generatedCSS += `
                    #header h1 {
                        font-size: calc(${headerHeight} / 3);
                        margin-top: calc(${headerHeight} / 4);
                    }
                    #header img {
                        height: calc(${headerHeight} - 20px);
                    }
                    #clockWeather {
                        height: ${headerHeight};
                        margin-top: 10px;
                    }
                `;
            }
            else {
                generatedCSS += `
                    #header {
                        display: none;
                    }
                `;
            }

            //Nav
            if (showNav) {
            }
            else {
                generatedCSS += `
                    #nav {
                        display: none;
                    }
                `;
            }

            //Set the nav bar position
            switch (navMode) {
                case "bottom": {
                    generatedCSS += `
                        #pages {
                            top: ${headerHeight};
                            height: calc(100% - (${headerHeight} + ${navHeight}));
                        }
                        #header {
                            height: ${headerHeight};
                        }
                        #nav {
                            bottom: 0;
                            left: 0;
                            height: ${navHeight};
                        }
                        #nav #lockButton {
                            position: absolute;
                            right: 0;
                            margin-right: 10px;
                        }
                    `;
                    break;
                }
                case "top": {
                    generatedCSS += `
                        #pages {
                            top: ${navHeight};
                            height: calc(100% - (${headerHeight} + ${navHeight}));
                        }
                        #header {
                            bottom: 0;
                        }
                        #nav {
                            top: 0;
                            height: ${navHeight};
                        }
                        #nav #lockButton {
                            position: absolute;
                            right: 0;
                            margin-right: 10px;
                        }
                    `;
                    break;
                }
                case "left": {
                    generatedCSS += `
                        #pages {
                            top: 0;
                            left: ${navHeight};
                            height: 100%;
                            width: calc(100% - ${navHeight});
                        }
                        #header {
                            display: none;
                        }
                        #nav {
                            top: 0;
                            width: ${navHeight};
                            height: 100%;
                        }
                        #nav button {
                            height: 10%;
                            width: calc(100% - 20px);
                            margin-left: 10px;
                            margin-top: 5px;
                        }
                        #nav #lockButton {
                            position: absolute;
                            bottom: 0;
                            margin-bottom: 10px;
                        }
                    `;
                    break;
                }
            }

            document.head.innerHTML += `<style>${generatedCSS}</style>`;

            //Generate the pages 
            addPagesToDashbored(document);

            //Add the onload scripts and delete the element
            var sessionId = util.randString();
            document.addScript(`
                //Global variables
                var dashboredId = "${id}";
                var sessionId = "${sessionId}";
                var locked = ${locked};
                var debug = ${RED.settings.logging.console.level == "debug" || RED.settings.logging.console.level == "trace" || RED.settings.logging.console.level == "audit" || RED.settings.logging.console.level == "metric"};

                addOnLoadFunction(function() {
                    hideShowElement("lockButton", ${alwaysShowLockButton});
                    document.getElementById("lockButton").innerHTML = "<i class='fa fa-${locked ? "unlock" : "lock"}'></i>";

                    //Hide/show elements when the lock state changes
                    addOnLockFunction(function () {
                        ${alwaysShowLockButton ? "" : "hideShowElement('lockButton', true);"}
                        document.getElementById("lockButton").innerHTML = "<i class='fa fa-unlock'></i>";
                    });
                    addOnUnlockFunction(function () {
                        ${alwaysShowLockButton ? "" : "hideShowElement('lockButton', false);"}
                        document.getElementById("lockButton").innerHTML = "<i class='fa fa-lock'></i>";
                    });
                });
                var temp = document.getElementById("onLoadScripts");
                temp.parentNode.removeChild(temp);
            `);

            document.head.innerHTML += `<script id="onLoadScripts" type="text/javascript">${document.onloadScripts}</script>`;

            //Update the flow
            sendMsgToFlow("session", {
                id: id,
                sessionId: sessionId
            });

            res.send(document.html.innerHTML);
        }

        //Add the dashbored to the server
        server.addDashbored(id, name, endpoint);


        //On redeploy
        node.on("close", () => { });
    }

    RED.nodes.registerType("dashbored-dashbored", dashbored);
}