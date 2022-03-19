/**
 * Button Selector Widget for Dashbored
 * Allows for selecting a value using multiple buttons
 * https://github.com/haydendonald/NodeRed-Dashbored
*/

module.exports = {
    type: "buttonSelector",
    version: "0.0.1",
    label: "Button Selector",
    description: "Generates buttons that select states",
    create: function () {
        return {
            widthMultiplier: 1,
            heightMultiplier: 1,
            minWidth: undefined,
            minWeight: undefined,
            maxWidth: undefined,
            maxHeight: undefined,
            widget: undefined, //Reference back to the widget node

            //Insert the HTML into the config on the NodeRed flow
            //The ids MUST be node-config-input-<WIDGETNAME>-<CONFIGNAME> otherwise they may not be set
            configHTML: function () {
                return `
                    <!-- CSS Editor -->
                    <div class="form-row">
                        <label for="CSS">CSS</label>
                        <div style="height: 250px; min-height:150px;" class="node-text-editor" id="CSS"></div>
                    </div>
                `;
            }(),
            //Scripts to call on the NodeRed config dashbored
            configScript: {
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
                //When the user clicks the "reset configuration" set the options to their defaults
                reset: `
                    element.cssEditor.setValue(defaultConfig.CSS.value);
                    element.cssEditor.clearSelection();
                `
            },
            //Default config
            defaultConfig: {
                CSS: {
                    value: ``.replace(/^\s+|\s+$/gm, ''), required: true
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
            setupWidget: function (widget, config) {
                this.widget = widget;

                //Set the configuration
                this.config.CSS = config["toggleButton-CSS"];
            },

            //When node red redeploys or closes
            onClose: function () { },

            //When a message comes from the dashbored
            onMessage: function (msg) {
                // if (msg.id == this.id) {
                //     this.widget.setValue("state", msg.payload);
                //     this.widget.sendStatusToFlow("set", msg.sessionId);
                // }
            },

            //When a message comes from a node red flow
            onFlowMessage: function (msg) {
                // if (msg.payload && msg.payload.state) {
                //     this.widget.setValue("state", msg.payload.state);
                //     this.widget.sendToDashbored(this.id, msg.sessionId, msg.payload.state);
                // }
            },

            //Generate the CSS for the widget
            generateCSS: function () {
                return this.config.CSS;
            },

            //Generate the HTML for the widget that will be inserted into the dashbored
            generateHTML: function (htmlId) {
                var buttonCSS = `
                    .on {
                        background-color: #32CD32;
                        color: black;
                    }
                    .off {
                        background-color: #800000;
                        color: black;
                    }
                    #button {
                        width: calc(100% - 10px);
                        height: calc(100% - 10px);
                        margin: 5px;
                    }
                    #widget {
                        background-color: red;
                    }
                `;

                var ret = "";
                for (var i = 0; i < 10; i++) {
                    ret += this.util.generateTag(htmlId, "widget", "button" + i, "", `type="toggleButton" CSS="${buttonCSS}"`);
                }
                return ret;


                // return `
                //     ${this.util.generateTag(htmlId, "button", "button", this.config.text, `class="${this.util.generateCSSClass(htmlId, "button")} ${this.util.generateCSSClass(htmlId, (this.widget.getValue("state") == this.config.offValue ? "off" : "on"))}" state="${this.widget.getValue("state")}"`)}
                // `;
            },

            //Generate the script that will be executed when the dashbored loads
            generateOnload: function (htmlId, lockedAccess, alwaysPassword, ask, askText) {
                return "";
                // return `
                //     ${this.util.getElement(htmlId, "button")}.onclick = function(event) {
                //         var yesAction = function() {
                //             sendMsg("${this.id}", event.target.getAttribute("state") == "${this.config.onValue}" ? "${this.config.offValue}" : "${this.config.onValue}");
                //         }
                //         var noAction = function(){}

                //         ${this.util.generateWidgetAction(lockedAccess, alwaysPassword, ask, askText, "yesAction", "noAction")}
                //     }

                //     ${this.util.getElement(htmlId, "button")}.setAttribute("state", "${this.widget.getValue("state")}");
                // `;
            },

            //Generate the script that will be called when a message comes from NodeRed on the dashbored
            generateOnMsg: function (htmlId) {
                return "";
                // return `
                //     ${this.util.getElement(htmlId, "button")}.setAttribute("state", msg.payload);
                //     if(msg.payload == "${this.config.onValue}") {
                //         ${this.util.getElement(htmlId, "button")}.classList.add("${this.util.generateCSSClass(htmlId, "on")}");
                //         ${this.util.getElement(htmlId, "button")}.classList.remove("${this.util.generateCSSClass(htmlId, "off")}");
                //     }
                //     else {
                //         ${this.util.getElement(htmlId, "button")}.classList.add("${this.util.generateCSSClass(htmlId, "off")}");
                //         ${this.util.getElement(htmlId, "button")}.classList.remove("${this.util.generateCSSClass(htmlId, "on")}");
                //     }
                // `;
            },

            //Generate any extra scripts to add to the document
            generateScript: function () { },
        }
    }
}