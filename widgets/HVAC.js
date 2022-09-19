/**
 * HVAC Widget for Dashbored
 * https://github.com/haydendonald/NodeRed-Dashbored
*/

var util = require("../util.js");
module.exports = {
    widgetType: "HVAC",
    version: "0.0.1",
    label: "HVAC",
    description: "Allows control of a HVAC or AC unit",
    widthMultiplier: 2,
    heightMultiplier: 1,
    minWidth: undefined,
    minWeight: undefined,
    maxWidth: undefined,
    maxHeight: undefined,

    //resetConfig: true, //DEBUG FLAG TO CLEAR CONFIGURATION

    //Insert the HTML into the config on the NodeRed flow
    //The ids MUST be node-config-input-<WIDGETNAME>-<CONFIGNAME> otherwise they may not be set
    generateConfigHTML: function () {
        return `
            <p><a href="https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widgetTypes/HVAC.md" target="_blank">See the documentation for more information</a></p>
            
            <div class="form-row">
                <label for="node-config-input-HVAC-auto">Enable Auto Mode</label>
                <input type="checkbox" id="node-config-input-HVAC-auto">
            </div>
                <div class="form-row">
                <label for="node-config-input-HVAC-heat">Enable Heat Mode</label>
                <input type="checkbox" id="node-config-input-HVAC-heat">
            </div>
            <div class="form-row">
                <label for="node-config-input-HVAC-cool">Enable Cool Mode</label>
                <input type="checkbox" id="node-config-input-HVAC-cool">
            </div>
            
            <!-- CSS Editor -->
            <div class="form-row">
                <label for="CSS">CSS</label>
                <div style="height: 250px; min-height:150px;" class="node-text-editor" id="CSS"></div>
            </div>
        `;
    },
    //Scripts to call on the NodeRed config dashbored
    generateConfigScript: function () {
        return {
            //When the user opens the config panel get things ready
            oneditprepare: `
                $("#node-config-input-HVAC-auto").prop("checked", element["HVAC-auto"]);
                $("#node-config-input-HVAC-heat").prop("checked", element["HVAC-heat"]);
                $("#node-config-input-HVAC-cool").prop("checked", element["HVAC-cool"]);

                element.cssEditor = RED.editor.createEditor({
                    id: "CSS",
                    mode: "ace/mode/css",
                    value: element["HVAC-CSS"]
                });
                `,
            //When the user clicks save on the editor set our values
            oneditsave: `
                    element["HVAC-auto"] = $("#node-config-input-HVAC-auto").val();
                    element["HVAC-heat"] = $("#node-config-input-HVAC-heat").val();
                    element["HVAC-cool"] = $("#node-config-input-HVAC-cool").val();

                    //Set the CSS value
                    element["HVAC-CSS"] = element.cssEditor.getValue();

                    //Delete the CSS editor
                    element.cssEditor.destroy();
                    delete element.cssEditor;
                `,
            //When the user cancels the edit dialog do some cleanup if required
            oneditcancel: `
                    //Delete the CSS editor
                    element.cssEditor.destroy();
                    delete element.cssEditor;
                `,
            //When the user clicks the "copy configuration" button update the values shown
            update: `
                    $("#node-config-input-HVAC-auto").prop("checked", settings.auto.value);
                    $("#node-config-input-HVAC-heat").prop("checked", settings.heat.value);
                    $("#node-config-input-HVAC-cool").prop("checked", settings.cool.value);

                    element.cssEditor.setValue(settings.CSS.value);
                    element.cssEditor.clearSelection();
                `
        }
    },
    //Default config
    defaultConfig: {
        auto: { value: true },
        heat: { value: true },
        cool: { value: true },
        CSS: {
            value: `
                .button {
                    width: calc(100% - 10px);
                    margin: 5px;
                }
                .div {
                    height: 100%;
                    width: 50%;
                    float: left;
                }
                .tempDiv {
                    text-align: center;
                    width: calc(100% - 10px);
                    padding: 5px;
                }
                .innerTempDiv {
                    background-color: gray;
                    border-radius: 20px;
                    padding: 20px;
                }
                .button h1 {
                    font-size: 150%;
                }
                .button h2 {
                    font-size: 100%;
                    margin-top: 10px;
                }
                .autoColor {
                    background-color: rgb(50, 205, 50);
                }
                .heatColor {
                    background-color: rgb(205, 50, 50);
                }
                .coolColor {
                    background-color: rgb(50, 100, 205);
                }
                .offColor {
                    background-color: gray;
                }
                `.replace(/^\s+|\s+$/gm, ''), required: false
        }
    },
    //Current config
    config: {},

    //Default value(s)
    getDefaultValues: function () {
        return {
            setMode: "off",
            currentMode: "off",
            setTemperature: 21,
            currentTemperature: 21
        }
    },

    //Return the current values
    getValues: function () {
        return {
            setMode: this.getValue("setMode"),
            currentMode: this.getValue("currentMode"),
            setTemperature: this.getValue("setTemperature"),
            currentTemperature: this.getValue("currentTemperature")
        }
    },

    //Setup the widget
    setupWidget: function (config) {
        this.config.modes = ["off"];
        if(config["HVAC-auto"] == true) {this.config.modes.push("auto");}
        if(config["HVAC-heat"] == true) {this.config.modes.push("heat");}
        if(config["HVAC-cool"] == true) {this.config.modes.push("cool");}
        this.heightMultiplier = this.config.modes.length;
        if(this.heightMultiplier < 3){this.heightMultiplier = 3;}
    },

    //When node red redeploys or closes
    onClose: function () { },

    //When a message comes from the dashbored
    onMessage: function (msg) {
        if (msg.id == this.id) {
            var vals = this.getValues();
            var oldVals = this.getValues();
            for (var i in vals) {
                if (msg.payload[i]) {
                    vals[i] = msg.payload[i];
                }
            }

            vals["previousSetTemperature"] = oldVals["setTemperature"];
            vals["previousSetMode"] = oldVals["setMode"];
            vals["previousMode"] = oldVals["currentMode"];
            this.sendStatusChangesToFlow(msg.sessionId, vals);

            //Set the internal state if set
            if (this.setsState) {
                this.setValues(vals);
                this.sendToDashbored(this.id, msg.sessionId, this.getValues());
            }
        }
    },

    //When a message comes from a node red flow
    onFlowMessage: function (msg) {
        if (msg.payload) {
            for (var i in this.getValues()) {
                if (msg.payload[i]) {
                    this.setValue(i, msg.payload[i]);
                }
            }
            this.sendToDashbored(this.id, msg.sessionId, this.getValues());
        }
    },

    //Generate the CSS for the widget
    generateCSS: function () {
        return this.config.CSS;
    },

    //Get the current values to set to HTML
    generateValues: function (values) {
        var currentClass;

        //Generate the set temperature html
        var currentTemperatureHTML = `Currently ${values.currentTemperature}°`;
        var setTemperatureHTML = `Off`;
        if (values.setMode != "off") {
            var action = "Working";
            switch (values.currentMode) {
                case "heat": { action = "Heating to"; currentClass = "heatColor"; break; }
                case "cool": { action = "Cooling to"; currentClass = "coolColor"; break; }
                case "off": { action = "Reached"; currentClass = "offColor"; break; }
                case "auto": {
                    if (values["currentTemperature"] == values["setTemperature"]) {
                        action = "Reached";
                        currentClass = "offColor";
                    }
                    if (values["currentTemperature"] > values["setTemperature"]) {
                        action = "Cooling to";
                        currentClass = "coolColor";
                    }
                    else {
                        action = "Heating to";
                        currentClass = "heatColor";
                    }
                    break;
                }
            }

            setTemperatureHTML = `${action} ${values.setTemperature}°`;
        }

        return {
            currentTemperatureHTML,
            setTemperatureHTML,
            currentClass
        };
    },

    //Generate the HTML for the widget that will be inserted into the dashbored
    generateHTML: function (htmlId) {
        var html = "";
        var values = this.getValues();
        var generatedValues = this.generateValues(values);
        var height = this.config.modes.length < 3 ? 3 : this.config.modes.length;

        var buttonHeight = `height: calc((100% / ${height}) - 10px)`;

        //Add the modes
        var modesHTML = "";
        if (this.config.modes.includes("auto")) {
            modesHTML += `${util.generateTag(htmlId, "button", "mode_auto", "Auto",
                `class="${util.generateCSSClass(htmlId, "button")} ${values["setMode"] == "auto" ? util.generateCSSClass(htmlId, "autoColor") : ""}" style="${buttonHeight}"`)}`;
        }
        if (this.config.modes.includes("heat")) {
            modesHTML += `${util.generateTag(htmlId, "button", "mode_heat", "Heat",
                `class="${util.generateCSSClass(htmlId, "button")} ${values["setMode"] == "heat" ? util.generateCSSClass(htmlId, "heatColor") : ""}" style="${buttonHeight}"`)}`;
        }
        if (this.config.modes.includes("cool")) {
            modesHTML += `${util.generateTag(htmlId, "button", "mode_cool", "Cool",
                `class="${util.generateCSSClass(htmlId, "button")} ${values["setMode"] == "cool" ? util.generateCSSClass(htmlId, "coolColor") : ""}" style="${buttonHeight}"`)}`;
        }
        if (this.config.modes.includes("off")) {
            modesHTML += `${util.generateTag(htmlId, "button", "mode_off", "Off",
                `class="${util.generateCSSClass(htmlId, "button")} ${values["setMode"] == "off" ? util.generateCSSClass(htmlId, "offColor") : ""}" style="${buttonHeight}"`)}`;
        }
        html += `${util.generateTag(htmlId, "div", "modesDiv", modesHTML, `class="${util.generateCSSClass(htmlId, "div")}" setMode="${values["setMode"]}"`)}`;

        //Add the temperature control
        var tempHTML = `<div class="${util.generateCSSClass(htmlId, "div")}">`;
        tempHTML += util.generateTag(htmlId, "button", "tempDiv", `
            ${util.generateTag(htmlId, "h1", "currentTemperature", `${generatedValues.currentTemperatureHTML}`, "")}
            ${util.generateTag(htmlId, "h2", "setTemperature", `${generatedValues.setTemperatureHTML}`, `value=${values["setTemperature"]}`)}
        `, `class="${util.generateCSSClass(htmlId, "button")} ${util.generateCSSClass(htmlId, generatedValues.currentClass)}" style="height: calc((100% / ${height == 3 ? 3 : 2}) - 10px);"`);

        //Add the plus minus buttons for temperature
        tempHTML += util.generateTag(htmlId, "button", "tempPlus", "+", `class="${util.generateCSSClass(htmlId, "button")}" style="${buttonHeight}"`);
        tempHTML += util.generateTag(htmlId, "button", "tempMinus", "-", `class="${util.generateCSSClass(htmlId, "button")}" style="${buttonHeight}"`);
        html += tempHTML + "</div>";

        return html;
    },

    //Generate the script that will be executed when the dashbored loads
    generateOnload: function (htmlId, lockedAccess, alwaysPassword, ask, askText) {
        var self = this;

        //When the user clicks a temp button
        var generateTempClick = function (adjustment) {
            return `
                var yesAction = function() {
                    if(${util.getElement(htmlId, "modesDiv")}.getAttribute("setMode") != "off") {
                        var waiting = true;
                        setTimeout(function(){if(waiting){loadingAnimation(event.target.id, true);}}, 500);
                        sendMsg("${htmlId}", "${self.id}", {setTemperature: parseInt(${util.getElement(htmlId, "setTemperature")}.getAttribute("value")) + ${adjustment}}, function(id, sessionId, success, msg) {
                            if(id == "${self.id}") {
                                waiting = false;
                                loadingAnimation(event.target.id, false);
                                if(!success) {
                                    failedToSend();
                                }
                            }
                        });
                    }
                }
                var noAction = function() {}
                ${util.generateWidgetAction(lockedAccess, alwaysPassword, "no", "", "yesAction", "noAction")} 
            `;
        }

        var generateMode = function (mode) {
            return `
                var yesAction = function() {
                    var waiting = true;
                    setTimeout(function(){if(waiting){loadingAnimation(event.target.id, true);}}, 500);
                    sendMsg("${htmlId}", "${self.id}", {setMode: "${mode}"}, function(id, sessionId, success, msg) {
                        if(id == "${self.id}") {
                            waiting = false;
                            loadingAnimation(event.target.id, false);
                            if(!success) {
                                failedToSend();
                            }
                        }
                    });
                }
                var noAction = function() {}
                ${util.generateWidgetAction(lockedAccess, alwaysPassword, ask, askText, "yesAction", "noAction")} 
            `;
        };

        var modes = [];
        for (var i in this.config.modes) {
            modes += `${util.getElement(htmlId, "mode_" + this.config.modes[i])}.onclick = function(event) {${generateMode(this.config.modes[i])}};`
        }

        return `
            ${util.getElement(htmlId, "tempPlus")}.onclick = function(event) {${generateTempClick(1)}};
            ${util.getElement(htmlId, "tempMinus")}.onclick = function(event) {${generateTempClick(-1)}};
            ${modes}
        `;
    },

    //Generate the script that will be called when a message comes from NodeRed on the dashbored
    generateOnMsg: function (htmlId) {
        var updateCurrentModeDiv = `if(msg.payload.currentMode != undefined) {`;
        var updateModes = `if(msg.payload.setMode != undefined) {${util.getElement(htmlId, "modesDiv")}.setAttribute("setMode", msg.payload.setMode);`;
        for (var i in this.config.modes) {
            updateCurrentModeDiv += `
                if("${this.config.modes[i]}" == msg.payload.currentMode) {
                    ${util.getElement(htmlId, "tempDiv")}.classList.add("${util.generateCSSClass(htmlId, this.config.modes[i])}Color")
                }
                else {
                    ${util.getElement(htmlId, "tempDiv")}.classList.remove("${util.generateCSSClass(htmlId, this.config.modes[i])}Color")
                }  
            `;
            updateModes += `
                if("${this.config.modes[i]}" == msg.payload.setMode) {
                    ${util.getElement(htmlId, "mode_" + this.config.modes[i])}.classList.add("${util.generateCSSClass(htmlId, this.config.modes[i])}Color")
                }
                else {
                    ${util.getElement(htmlId, "mode_" + this.config.modes[i])}.classList.remove("${util.generateCSSClass(htmlId, this.config.modes[i])}Color")
                }
            `;
        }
        updateCurrentModeDiv += "}";
        updateModes += "}";

        return `
            var values = ${this.generateValues}(msg.payload);
            if(msg.payload.setTemperature != undefined) {
                ${util.getElement(htmlId, "setTemperature")}.setAttribute("value", msg.payload.setTemperature);
                ${util.getElement(htmlId, "setTemperature")}.innerHTML = values.setTemperatureHTML;
            }
            ${updateModes}
            ${updateCurrentModeDiv}
        `;
    },

    //Generate any extra scripts to add to the document
    generateScript: function () { },
}