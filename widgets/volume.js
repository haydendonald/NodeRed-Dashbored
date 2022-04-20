/**
 * Volume Widget for Dashbored
 * https://github.com/haydendonald/NodeRed-Dashbored
*/

var util = require("../util.js");
module.exports = {
    widgetType: "volume",
    version: "0.0.1",
    label: "Volume",
    description: "Displays a volume control",
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
                        value: element["volume-CSS"]
                    });
                `,
            //When the user clicks save on the editor set our values
            oneditsave: `
                    //Set the CSS value
                    element["volume-CSS"] = element.cssEditor.getValue();

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
            //When the user clicks the "reset configuration" set the options to their defaults
            reset: `
                    element.cssEditor.setValue(defaultConfig.CSS.value);
                    element.cssEditor.clearSelection();
                `
        }
    },
    //Default config
    defaultConfig: {
        CSS: {
            value: `
                #volumeLevelContainer {
                    background-color: green;
                    width: 20%;
                    height: 100%;
                    float: left;
                }
                #volumeLevelTop {
                    background-color: white;
                    width: 100%;
                    height: 100%;
                }
                #buttonContainer {
                    float: left;
                }
                .button {
                    display: block;
                }
                `.replace(/^\s+|\s+$/gm, ''), required: false
        }
    },
    //Current config
    config: {},

    //Default value(s)
    getDefaultValues: function () {
        return {
            volume: 50, //Volume %
            muted: true
        }
    },

    //Return the current values
    getValues: function () {
        return {
            state: this.getValue("volume"),
            muted: this.getValue("muted")
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
            //this.sendStatusChangesToFlow(msg.sessionId, { "muted": msg.payload });

            if (this.setsState) {
                // this.setValue("state", msg.payload);
                // this.sendToDashbored(this.id, msg.sessionId, msg.payload);
            }
        }
    },

    //When a message comes from a node red flow
    onFlowMessage: function (msg) {
        if (msg.payload) {
            if (msg.payload.volume) {
                this.setValue("volume", msg.payload.volume);
            }
            if (msg.payload.muted) {
                this.setValue("muted", msg.payload.muted);
            }
            this.sendToDashbored(this.id, msg.sessionId, this.getValues());
        }
    },

    //Generate the CSS for the widget
    generateCSS: function () {
        return this.config.CSS;
    },

    //Generate the HTML for the widget that will be inserted into the dashbored
    generateHTML: function (htmlId) {
        var volumeLevel = util.generateTag(htmlId, "div", "volumeLevelTop", "", "");
        var buttons = `
        ${util.generateTag(htmlId, "button", "plus", "+", `class=${util.generateCSSClass(htmlId, "button")}`)}
        ${util.generateTag(htmlId, "button", "minus", "-", `class=${util.generateCSSClass(htmlId, "button")}`)}
        `;
        return `
        ${util.generateTag(htmlId, "div", "volumeLevelContainer", volumeLevel, "")}
        ${util.generateTag(htmlId, "div", "buttonContainer", buttons, "")}
        ${util.generateTag(htmlId, "button", "mute", "Mute", "")}

        
        
        
        `



        // return `
        //             ${this.util.generateTag(htmlId, "button", "button", this.config.text, `class="${this.util.generateCSSClass(htmlId, "button")} ${this.util.generateCSSClass(htmlId, (this.getValue("state") == this.config.offValue ? "off" : "on"))}" state="${this.getValue("state")}"`)}
        //         `;
    },

    //Generate the script that will be executed when the dashbored loads
    generateOnload: function (htmlId, lockedAccess, alwaysPassword, ask, askText) {
        return "";
        // return `
        //             ${this.util.getElement(htmlId, "button")}.onclick = function(event) {
        //                 var yesAction = function() {
        //                     var waiting = true;
        //                     setTimeout(function(){if(waiting){loadingAnimation(event.target.id, true);}}, 500);
        //                     sendMsg("${htmlId}", "${this.id}", event.target.getAttribute("state") == "${this.config.onValue}" ? "${this.config.offValue}" : "${this.config.onValue}", function(id, sessionId, success, msg) {
        //                         if(id == "${this.id}") {
        //                             waiting = false;
        //                             loadingAnimation(event.target.id, false);
        //                             if(!success) {
        //                                 failedToSend();
        //                             }
        //                         }
        //                     });
                            
        //                 }
        //                 var noAction = function(){}

        //                 ${this.util.generateWidgetAction(lockedAccess, alwaysPassword, ask, askText, "yesAction", "noAction")}
        //             }

        //             ${this.util.getElement(htmlId, "button")}.setAttribute("state", "${this.getValue("state")}");
        //         `;
    },

    //Generate the script that will be called when a message comes from NodeRed on the dashbored
    generateOnMsg: function (htmlId) {
        return "";
        // return `
        //             ${this.util.getElement(htmlId, "button")}.setAttribute("state", msg.payload);
        //             if(msg.payload == "${this.config.onValue}") {
        //                 ${this.util.getElement(htmlId, "button")}.classList.add("${this.util.generateCSSClass(htmlId, "on")}");
        //                 ${this.util.getElement(htmlId, "button")}.classList.remove("${this.util.generateCSSClass(htmlId, "off")}");
        //             }
        //             else {
        //                 ${this.util.getElement(htmlId, "button")}.classList.add("${this.util.generateCSSClass(htmlId, "off")}");
        //                 ${this.util.getElement(htmlId, "button")}.classList.remove("${this.util.generateCSSClass(htmlId, "on")}");
        //             }
        //         `;
    },

    //Generate any extra scripts to add to the document
    generateScript: function () { },
}