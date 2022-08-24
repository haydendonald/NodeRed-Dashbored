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

    resetConfig: true, //DEBUG FLAG TO CLEAR CONFIGURATION

    //Insert the HTML into the config on the NodeRed flow
    //The ids MUST be node-config-input-<WIDGETNAME>-<CONFIGNAME> otherwise they may not be set
    generateConfigHTML: function () {
        return `
            <p><a href="https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widgetTypes/HVAC.md" target="_blank">See the documentation for more information</a></p>
            <div class="form-row">       
                <ol id="options"></ol>
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
                //Validate and add an item
                function validate() {
                    var self = this
                    this["HVAC-modes"] = [];
                    var optionsList = $("#options").editableList('items');
                    optionsList.each(function (i) {
                        var option = $(this);
                        var curr = {};
                        curr["label"] = option.find(".node-input-option-label").val();
                        curr["value"] = option.find(".node-input-option-value").typedInput('value');
                        curr["onColor"] = option.find(".node-input-option-onColor").val();
                        curr["offColor"] = option.find(".node-input-option-offColor").val();
                        self["HVAC-modes"].push(curr);
                    });
                }

                var optionsList = $("#options").css('min-height', '200px').editableList({
                    header: $("<div>").css('padding-left', '32px').append($.parseHTML(
                        "<div style='width:35%; display: inline-grid'><b>Label</b></div>" +
                        "<div style='width:35%; display: inline-grid'><b>Value</b></div>" +
                        "<div style='width:15%; display: inline-grid' class='node-input-option-color'><b>On Colour</b></div>" +
                        "<div style='width:15%; display: inline-grid' class='node-input-option-color'><b>Off Colour</b></div>")),

                    addItem: function (container, i, option) {
                        var row = $('<div/>').appendTo(container);
                        var labelField = $('<input/>', { class: "node-input-option-label", type: "text" }).css({ "width": "35%", "margin-left": "5px", "margin-right": "5px" }).appendTo(row);
                        labelField.val(option.label || "Option " + i);

                        var valueField = $('<input/>', { class: "node-input-option-value", type: "text" }).css({ "width": "35%", "margin-left": "5px", "margin-right": "5px" }).appendTo(row);
                        valueField.typedInput({ types: ['str', 'num', 'bool'] });
                        valueField.typedInput("type", option.valueType || "str");
                        valueField.typedInput("value", option.value || "option_" + i);
                        valueField.on('change', function (type, value) {
                            validate();
                        });


                        var onColorField = $('<input/>', { class: "node-input-option-onColor", type: "color" }).css({ "width": "10%", "margin-left": "5px", "display": onColorField }).appendTo(row);
                        onColorField.val(option.onColor || "#32CD32");

                        var offColorField = $('<input/>', { class: "node-input-option-offColor", type: "color" }).css({ "width": "10%", "margin-left": "5px", "display": offColorField }).appendTo(row);
                        offColorField.val(option.offColor || "#f2f2f2");
                        validate();


                    },
                    removeItem: function (data) {
                        validate()
                    },
                    removable: true,
                    sortable: true,

                });

                //Add existing options
                if (element["HVAC-modes"]) {
                    element["HVAC-modes"].forEach(function (option, index) {
                        optionsList.editableList('addItem', { label: option.label, value: option.value, onColor: option.onColor, offColor: option.offColor });
                    });
                }

                element.cssEditor = RED.editor.createEditor({
                    id: "CSS",
                    mode: "ace/mode/css",
                    value: element["HVAC-CSS"]
                });
                `,
            //When the user clicks save on the editor set our values
            oneditsave: `
                    var self = this;
                    var temp = [];
                    var optionsList = $("#options").editableList('items');
                    optionsList.each(function (i) {
                        var option = $(this);
                        var curr = {};
                        curr["label"] = option.find(".node-input-option-label").val();
                        curr["value"] = option.find(".node-input-option-value").typedInput('value');
                        curr["onColor"] = option.find(".node-input-option-onColor").val();
                        curr["offColor"] = option.find(".node-input-option-offColor").val();
                        temp.push(curr);
                    });

                    element["HVAC-modes"] = temp;


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
                    var optionsList = $("#options");
                    optionsList.editableList("empty");
                    for(var i in settings.modes.value) {
                        var option = settings.modes.value[i];
                        optionsList.editableList('addItem', { label: option.label, value: option.value, onColor: option.onColor, offColor: option.offColor });
                    }
        

                    element.cssEditor.setValue(settings.CSS.value);
                    element.cssEditor.clearSelection();
                `
        }
    },
    //Default config
    defaultConfig: {
        // modes: {
        //     value: [
        //         {
        //             "label": "Auto",
        //             "value": "auto",
        //             "onColor": "rgb(50, 205, 50)",
        //             "offColor": "#434343"
        //         },
        //         {
        //             "label": "Heat",
        //             "value": "heat",
        //             "onColor": "rgb(255, 0, 0)",
        //             "offColor": "#434343"
        //         },
        //         {
        //             "label": "Cool",
        //             "value": "cool",
        //             "onColor": "rgb(50, 100, 205)",
        //             "offColor": "#434343"
        //         },
        //         {
        //             "label": "Off",
        //             "value": "off",
        //             "onColor": "rgb(205, 50, 50)",
        //             "offColor": "#434343"
        //         }
        //     ],
        //     validate: function (values) {
        //         // if (values === undefined) { return false; }
        //         // for (var i in values) {
        //         //     if (values[i].label === undefined) { return false; }
        //         //     if (values[i].value === undefined || values[i].value == "") { return false; }
        //         //     if (values[i].offColor === undefined || values[i].offColor == "") { return false; }
        //         //     if (values[i].onColor === undefined || values[i].onColor == "") { return false; }
        //         // }
        //         return true;
        //     }
        // },
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
        this.heightMultiplier = this.config.modes.length;
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
    generateValues: function (values, modes) {
        var temp = {};

        //Get the current mode and it's colour
        var modeColor = "white";
        var currentModeColor = "gray";
        for (var i in modes) {
            if(modes[i].value == values["currentMode"]) {
                currentModeColor = modes[i].onColor;
            }
            if (modes[i].value == values["setMode"]) {
                modeColor = modes[i].onColor;
                temp[modes[i].value] = modes[i].onColor;
            }
            else {
                temp[modes[i].value] = modes[i].offColor;
            }
        }

        //Generate the set temperature html
        var currentTemperatureHTML = `Currently ${values.currentTemperature}`;
        var setTemperatureHTML = `Off`;
        if (values.setMode != "off") {
            var action = "Working";
            switch(values.currentMode) {
                case "heat": {action = "Heating"; break;}
                case "cool": {action = "Cooling"; break;}
                case "off": {action = "Reached"; break;}
                case "auto": {
                    if(values["currentTemperature"] == values["setTemperature"]) {
                        action = "Reached";
                    }
                    if(values["currentTemperature"] > values["setTemperature"]) {
                        action = "Cooling to";
                    }
                    else {
                        action = "Heating to";
                    }
                    break;
                }
            }

            setTemperatureHTML = `${action} ${values.setTemperature}`;
        }

        return {
            currentTemperatureHTML,
            setTemperatureHTML,
            modes: temp,
            currentModeColor
        };
    },

    //Generate the HTML for the widget that will be inserted into the dashbored
    generateHTML: function (htmlId) {
        var html = "";
        var values = this.getValues();
        var generatedValues = this.generateValues(values, this.config.modes);

        console.log(generatedValues);

        var buttonHeight = `height: calc((100% / ${this.config.modes.length}) - 10px)`;
        var modesHTML = "";
        for (var i in this.config.modes) {
            var current = this.config.modes[i];
            modesHTML += util.generateTag(htmlId, "button", "mode_" + current.value,
                current.label, `class="${util.generateCSSClass(htmlId, "button")}" style="${buttonHeight};
                                background-color:${generatedValues.modes[current.value]};"
                                mode="${current.value}"`);
        }
        html += `${util.generateTag(htmlId, "div", "modesDiv", modesHTML, `class="${util.generateCSSClass(htmlId, "div")}" setMode="${values["setMode"]}"`)}`;

        //Add the temperature control
        var tempHTML = `<div class="${util.generateCSSClass(htmlId, "div")}">`;
        tempHTML += util.generateTag(htmlId, "button", "tempDiv", `
            ${util.generateTag(htmlId, "h1", "currentTemperature", `${generatedValues.currentTemperatureHTML}`, "")}
            ${util.generateTag(htmlId, "h2", "setTemperature", `${generatedValues.setTemperatureHTML}`, `value=${values["setTemperature"]}`)}
        `, `class="${util.generateCSSClass(htmlId, "button")}" style="height: calc((100% / ${(this.config.modes.length - 2)}) - 10px); background-color: ${generatedValues.currentModeColor}"`);

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
                ${util.generateWidgetAction(lockedAccess, alwaysPassword, ask, askText, "yesAction", "noAction")} 
            `;
        }

        var generateMode = function (mode) {
            return `
                var yesAction = function() {
                    var waiting = true;
                    setTimeout(function(){if(waiting){loadingAnimation(event.target.id, true);}}, 500);
                    sendMsg("${htmlId}", "${self.id}", {setMode: "${mode.value}"}, function(id, sessionId, success, msg) {
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
            modes += `${util.getElement(htmlId, "mode_" + this.config.modes[i].value)}.onclick = function(event) {${generateMode(this.config.modes[i])}};`
        }


        return `
            ${util.getElement(htmlId, "tempPlus")}.onclick = function(event) {${generateTempClick(1)}};
            ${util.getElement(htmlId, "tempMinus")}.onclick = function(event) {${generateTempClick(-1)}};
            ${modes}
        `;
    },

    //Generate the script that will be called when a message comes from NodeRed on the dashbored
    generateOnMsg: function (htmlId) {
        var updateModes = "";
        for (var i in this.config.modes) {
            var curr = this.config.modes[i];
            updateModes += `${util.getElement(htmlId, "mode_" + curr.value)}.style.backgroundColor = 
                msg.payload.setMode == "${curr.value}" ? "${curr.onColor}": "${curr.offColor}";
            
            if(msg.payload.currentMode == "${curr.value}"){color = "${curr.onColor}"}`;
        }

        return `
            var values = ${this.generateValues}(msg.payload, JSON.parse(${util.getElement(htmlId, "modesDiv")}.getAttribute("modes")));


            console.log(values);


            if(msg.payload.setTemperature != undefined) {
                ${util.getElement(htmlId, "setTemperature")}.setAttribute("value", msg.payload.setTemperature);
                ${util.getElement(htmlId, "setTemperature")}.innerHTML = values.setTemperatureHTML;
            }
            if(msg.payload.setMode != undefined) {
                var color = "gray";
                ${updateModes}
                ${util.getElement(htmlId, "tempDiv")}.style.backgroundColor = color;
                ${util.getElement(htmlId, "modesDiv")}.setAttribute("setMode", msg.payload.setMode);    
            }
            if(msg.payload.currentTemperature !== undefined) {
                ${util.getElement(htmlId, "currentTemperature")}.innerHTML = values.currentTemperatureHTML;
            }
        `;
    },

    //Generate any extra scripts to add to the document
    generateScript: function () { },
}