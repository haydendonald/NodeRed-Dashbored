/**
 * Action Button Widget for Dashbored
 * https://github.com/haydendonald/NodeRed-Dashbored
*/

var util = require("../util.js");
module.exports = {
    widgetType: "actionButton",
    version: "1.0.0",
    label: "Action Button",
    description: "Performs an action",
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
                    <p><a href="https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widgetTypes/actionButton.md" target="_blank">See the wiki for more information</a></p>
                    <div class="form-row">
                        <label for="config-input-actionButton-text">Text</label>
                        <input type="text" id="node-config-input-actionButton-text" placeholder="Text">
                    </div>
                    <div class="form-row">
                        <label for="config-input-actionButton-color">Color</label>
                        <input type="color" id="node-config-input-actionButton-color" placeholder="Color">
                    </div>
                    <div class="form-row">
                        <label for="config-input-actionButton-flashColor">Flash Color</label>
                        <input type="color" id="node-config-input-actionButton-flashColor" placeholder="Color">
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
                        value: element["actionButton-CSS"]
                    });
                `,
            //When the user clicks save on the editor set our values
            oneditsave: `
                    //Set the CSS value
                    element["actionButton-CSS"] = element.cssEditor.getValue();

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
                    $("#node-config-input-actionButton-text").val(settings.text.value);
                    $("#node-config-input-actionButton-color").val(settings.color.value);
                    $("#node-config-input-actionButton-flashColor").val(settings.flashColor.value);
                    element.cssEditor.setValue(settings.CSS.value);
                    element.cssEditor.clearSelection();
                `
        }
    },
    //Default config
    defaultConfig: {
        text: { value: "Action Button", required: true },
        color: { value: "#434343", required: true },
        flashColor: { value: "#f2f2f2", required: true },
        CSS: {
            value: `
                    #button {
                        width: calc(100% - 10px);
                        height: calc(100% - 10px);
                        margin: 5px;
                        transition: background-color 0.1s ease;
                    }
                `.replace(/^\s+|\s+$/gm, ''), required: true
        }
    },
    //Current config
    config: {},

    //Default value(s)
    getDefaultValues: function () {
        return {}
    },

    //Return the current values
    getValues: function () {
        return {}
    },

    //Setup the widget
    setupWidget: function (config) {
    },

    //When node red redeploys or closes
    onClose: function () { },

    //When a message comes from the dashbored
    onMessage: function (msg) {
        if (msg.id == this.id) {
            this.sendStatusChangesToFlow(msg.sessionId, {});

            if (this.setsState) {
                this.sendToDashbored(this.id, msg.sessionId, {});
            }
        }
    },

    //When a message comes from a node red flow
    onFlowMessage: function (msg) {
    },

    //Generate the CSS for the widget
    generateCSS: function () {
        return this.config.CSS;
    },

    //Generate the HTML for the widget that will be inserted into the dashbored
    generateHTML: function (htmlId) {
        return `
        ${util.generateTag(htmlId, "button", "button", this.config.text, `style = "background-color: ${this.config.color}"`)}
        `;
    },

    //Generate the script that will be executed when the dashbored loads
    generateOnload: function (htmlId, lockedAccess, alwaysPassword, ask, askText) {
        return `
                    ${util.getElement(htmlId, "button")}.onclick = function(event) {
                        var yesAction = function() {
                            //Flash the button
                            ${util.getElement(htmlId, "button")}.style.backgroundColor = "${this.config.flashColor}";
                            ${util.getElement(htmlId, "button")}.classList.add("${util.generateCSSClass(htmlId, "flashColor")}");
                            setTimeout(function() {
                                ${util.getElement(htmlId, "button")}.style.backgroundColor = "${this.config.color}";
                                ${util.getElement(htmlId, "button")}.classList.remove("${util.generateCSSClass(htmlId, "flashColor")}");
                            }, 200);

                            //Send the message
                            sendMsg("${htmlId}", "${this.id}", "");
                        }

                        var noAction = function(){}

                        ${util.generateWidgetAction(lockedAccess, alwaysPassword, ask, askText, "yesAction", "noAction")}
                    }
                `;
    },

    //Generate the script that will be called when a message comes from NodeRed on the dashbored
    generateOnMsg: function (htmlId) {
        return "";
    },

    //Generate any extra scripts to add to the document
    generateScript: function () { },
}