/**
 * Button Selector Widget for Dashbored
 * Allows for selecting a value using multiple buttons
 * https://github.com/haydendonald/NodeRed-Dashbored
*/

var util = require("../util.js");
module.exports = {
    widgetType: "buttonSelector",
    version: "1.0.0",
    label: "Button Selector",
    description: "Generates buttons that select states",
    widthMultiplier: 1,
    heightMultiplier: 1,
    minWidth: undefined,
    minWeight: undefined,
    maxWidth: undefined,
    maxHeight: undefined,

    //Insert the HTML into the config on the NodeRed flow
    //The ids MUST be node-config-input-<WIDGETNAME>-<CONFIGNAME> otherwise they may not be set
    generateConfigHTML: function () {
        return `
                    <p><a href="https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widgetTypes/buttonSelector.md" target="_blank">See the wiki for more information</a></p>
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
                        this["buttonSelector-options"] = [];
                        var optionsList = $("#options").editableList('items');
                        optionsList.each(function (i) {
                            var option = $(this);
                            var curr = {};
                            curr["label"] = option.find(".node-input-option-label").val();
                            curr["value"] = option.find(".node-input-option-value").typedInput('value');
                            curr["onColor"] = option.find(".node-input-option-onColor").val();
                            curr["offColor"] = option.find(".node-input-option-offColor").val();
                            self["buttonSelector-options"].push(curr);
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
                    if (element["buttonSelector-options"]) {
                        element["buttonSelector-options"].forEach(function (option, index) {
                            optionsList.editableList('addItem', { label: option.label, value: option.value, onColor: option.onColor, offColor: option.offColor });
                        });
                    }

                    element.cssEditor = RED.editor.createEditor({
                        id: "CSS",
                        mode: "ace/mode/css",
                        value: element["buttonSelector-CSS"]
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

                    element["buttonSelector-options"] = temp;

                    //Set the CSS value
                    element["buttonSelector-CSS"] = element.cssEditor.getValue();

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
                    for(var i in settings.options.value) {
                        var option = settings.options.value[i];
                        optionsList.editableList('addItem', { label: option.label, value: option.value, onColor: option.onColor, offColor: option.offColor });
                    }
                
                    element.cssEditor.setValue(settings.CSS.value);
                    element.cssEditor.clearSelection();
                `
        }
    },
    //Default config
    defaultConfig: {
        options: {
            value: [
                {
                    "label": "Option 0",
                    "value": "option_0",
                    "onColor": "#32CD32",
                    "offColor": "#ff3333"
                },
                {
                    "label": "Option 1",
                    "value": "option_1",
                    "onColor": "#32CD32",
                    "offColor": "#ff3333"
                }
            ],
            validate: function (values) {
                if (values === undefined) { return false; }
                for (var i in values) {
                    if (values[i].label === undefined) { return false; }
                    if (values[i].value === undefined || values[i].value == "") { return false; }
                    if (values[i].offColor === undefined || values[i].offColor == "") { return false; }
                    if (values[i].onColor === undefined || values[i].onColor == "") { return false; }
                }
                return true;
            }
        },

        CSS: {
            value: `
                        .button {
                            width: calc(100% - 10px);
                            margin: 5px;
                        }
                        .on {}
                        .off {}
                    `.replace(/^\s+|\s+$/gm, ''), required: true
        }
    },
    //Current config
    config: {},

    //Default value(s)
    getDefaultValues: function () {
        return {
            value: undefined
        }
    },

    //Return the current values
    getValues: function () {
        return {
            value: this.getValue("value")
        }
    },

    //Setup the widget
    setupWidget: function (config) {
        this.heightMultiplier = this.config.options.length;
    },

    //When node red redeploys or closes
    onClose: function () { },

    //When a message comes from the dashbored
    onMessage: function (msg) {
        if (msg.id == this.id) {
            this.sendStatusChangesToFlow(msg.sessionId, { "value": msg.payload, "previousValue": this.getValue("value") });

            if (this.setsState) {
                this.setValue("value", msg.payload);
                this.sendToDashbored(this.id, msg.sessionId, msg.payload);
            }
        }
    },

    //When a message comes from a node red flow
    onFlowMessage: function (msg) {
        if (msg.payload && msg.payload.value) {
            this.setValue("value", msg.payload.value);
            this.sendToDashbored(this.id, msg.sessionId, msg.payload.value);
        }
    },

    //Generate the CSS for the widget
    generateCSS: function () {
        return this.config.CSS;
    },

    //Generate the HTML for the widget that will be inserted into the dashbored
    generateHTML: function (htmlId) {
        var ret = "";
        for (var i in this.config.options) {
            var button = this.config.options[i];
            var on = button.value == this.getValue("value");
            var color = on ? button.onColor : button.offColor;
            ret += util.generateTag(htmlId, "button", i, button.label, `class="${util.generateCSSClass(htmlId, "button")} ${util.generateCSSClass(htmlId, on ? "on" : "off")}" style="background-color: ${color}; height: calc((100% / ${this.config.options.length}) - 10px)"`);
        }
        return ret;
    },

    //Generate the script that will be executed when the dashbored loads
    generateOnload: function (htmlId, lockedAccess, alwaysPassword, ask, askText) {
        var ret = "";
        for (var i in this.config.options) {
            var button = this.config.options[i];
            ret += `${util.getElement(htmlId, i)}.onclick = function(event) {
                        var yesAction = function() {
                            var waiting = true;
                            setTimeout(function(){if(waiting){loadingAnimation(event.target.id, true);}}, 500);
                            sendMsg("${htmlId}", "${this.id}", "${button.value}", function(id, sessionId, success, msg) {
                                if(id == "${this.id}") {
                                    waiting = false;
                                    loadingAnimation(event.target.id, false);
                                    if(!success) {
                                        failedToSend();
                                    }
                                }
                            });
                        }
                        var noAction = function(){}

                        ${util.generateWidgetAction(lockedAccess, alwaysPassword, ask, askText, "yesAction", "noAction")}
                    }
                    `
        }
        return ret;
    },

    //Generate the script that will be called when a message comes from NodeRed on the dashbored
    generateOnMsg: function (htmlId) {
        var ret = "";
        for (var i in this.config.options) {
            var button = this.config.options[i];
            ret += `
                        ${util.getElement(htmlId, i)}.style.backgroundColor = (msg.payload == "${button.value}") ? "${button.onColor}" : "${button.offColor}";
                        ${util.getElement(htmlId, i)}.classList.add((msg.payload == "${button.value}") ? "${util.generateCSSClass(htmlId, "on")}" : "${util.generateCSSClass(htmlId, "off")}");
                        ${util.getElement(htmlId, i)}.classList.remove((msg.payload == "${button.value}") ? "${util.generateCSSClass(htmlId, "off")}" : "${util.generateCSSClass(htmlId, "on")}");
                    `;
        }
        return ret;
    },

    //Generate any extra scripts to add to the document
    generateScript: function () { },
}