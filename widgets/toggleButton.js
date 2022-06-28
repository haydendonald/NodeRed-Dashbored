/**
 * Toggle Button Widget for Dashbored
 * https://github.com/haydendonald/NodeRed-Dashbored
*/

var util = require("../util.js");
module.exports = {
    widgetType: "toggleButton",
    version: "1.0.0",
    label: "Toggle Button",
    description: "Toggles between two states",
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
                    <p><a href="https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widgetTypes/toggleButton.md" target="_blank">See the wiki for more information</a></p>
                    <div class="form-row">
                        <label for="config-input-toggleButton-text">Text</label>
                        <input type="text" id="node-config-input-toggleButton-text" placeholder="Text">
                    </div>
                    <div class="form-row">
                        <label for="node-config-input-toggleButton-onValue">On Value</label>
                        <input type="text" id="node-config-input-toggleButton-onValue" placeholder="on">
                    </div>
                    <div class="form-row">
                        <label for="node-config-input-toggleButton-offValue">Off Value</label>
                        <input type="text" id="node-config-input-toggleButton-offValue" placeholder="off">
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
                    element.cssEditor = RED.editor.createEditor({
                        id: "CSS",
                        mode: "ace/mode/css",
                        value: element["toggleButton-CSS"]
                    });
                `,
                //When the user clicks save on the editor set our values
                oneditsave: `
                    //Set the CSS value
                    element["toggleButton-CSS"] = element.cssEditor.getValue();

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
                    $("#node-config-input-toggleButton-text").val(settings.text.value);
                    $("#node-config-input-toggleButton-onValue").val(settings.onValue.value);
                    $("#node-config-input-toggleButton-offValue").val(settings.offValue.value);
                    element.cssEditor.setValue(settings.CSS.value);
                    element.cssEditor.clearSelection();
                `
        }
    },
    //Default config
    defaultConfig: {
        text: { value: "Toggle Button", required: true },
        onValue: { value: "on", required: true },
        offValue: { value: "off", required: true },
        CSS: {
            value: `
                    .on {
                        background-color: #32CD32;
                        color: white;
                    }
                    .off {
                        background-color: #f2f2f2;
                        color: black;
                    }
                    #button {
                        width: calc(100% - 10px);
                        height: calc(100% - 10px);
                        margin: 5px;
                    }
                    #widget {}
                    #title {}
                    #content {}
                `.replace(/^\s+|\s+$/gm, ''), required: true
        }
    },
    //Current config
    config: {},

    //Default value(s)
    getDefaultValues: function () {
        return {
            state: this.config.offValue
        }
    },

    //Return the current values
    getValues: function () {
        return {
            state: this.getValue("state")
        }
    },

    //Setup the widget
    setupWidget: function (config) {
    },

    //When node red redeploys or closes
    onClose: function () { },

    //When a message comes from the dashbored
    onMessage: function (msg) {
        if (msg.id == this.id) {
            this.sendStatusChangesToFlow(msg.sessionId, { "state": msg.payload });

            if (this.setsState) {
                this.setValue("state", msg.payload);
                this.sendToDashbored(this.id, msg.sessionId, msg.payload);
            }
        }
    },

    //When a message comes from a node red flow
    onFlowMessage: function (msg) {
        if (msg.payload && msg.payload.state) {
            this.setValue("state", msg.payload.state);
            this.sendToDashbored(this.id, msg.sessionId, msg.payload.state);
        }
    },

    //Generate the CSS for the widget
    generateCSS: function () {
        return this.config.CSS;
    },

    //Generate the HTML for the widget that will be inserted into the dashbored
    generateHTML: function (htmlId) {
        return `
                    ${util.generateTag(htmlId, "button", "button", this.config.text, `class="${util.generateCSSClass(htmlId, "button")} ${util.generateCSSClass(htmlId, (this.getValue("state") == this.config.offValue ? "off" : "on"))}" state="${this.getValue("state")}"`)}
                `;
    },

    //Generate the script that will be executed when the dashbored loads
    generateOnload: function (htmlId, lockedAccess, alwaysPassword, ask, askText) {
        return `
                    ${util.getElement(htmlId, "button")}.onclick = function(event) {
                        var yesAction = function() {
                            var waiting = true;
                            setTimeout(function(){if(waiting){loadingAnimation(event.target.id, true);}}, 500);
                            sendMsg("${htmlId}", "${this.id}", event.target.getAttribute("state") == "${this.config.onValue}" ? "${this.config.offValue}" : "${this.config.onValue}", function(id, sessionId, success, msg) {
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

                    ${util.getElement(htmlId, "button")}.setAttribute("state", "${this.getValue("state")}");
                `;
    },

    //Generate the script that will be called when a message comes from NodeRed on the dashbored
    generateOnMsg: function (htmlId) {
        return `
                    ${util.getElement(htmlId, "button")}.setAttribute("state", msg.payload);
                    if(msg.payload == "${this.config.onValue}") {
                        ${util.getElement(htmlId, "button")}.classList.add("${util.generateCSSClass(htmlId, "on")}");
                        ${util.getElement(htmlId, "button")}.classList.remove("${util.generateCSSClass(htmlId, "off")}");
                    }
                    else {
                        ${util.getElement(htmlId, "button")}.classList.add("${util.generateCSSClass(htmlId, "off")}");
                        ${util.getElement(htmlId, "button")}.classList.remove("${util.generateCSSClass(htmlId, "on")}");
                    }
                `;
    },

    //Generate any extra scripts to add to the document
    generateScript: function () { },
}