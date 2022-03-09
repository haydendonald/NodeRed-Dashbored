/**
 * Toggle Button Widget for Dashbored
 * https://github.com/haydendonald/NodeRed-Dashbored
*/

module.exports = {
    widget: "toggleButton",
    version: "1.0.0",
    label: "Toggle Button",
    description: "Toggles between two states",
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
                    $("#node-config-input-toggleButton-text").val(defaultConfig.text.value);
                    $("#node-config-input-toggleButton-onValue").val(defaultConfig.onValue.value);
                    $("#node-config-input-toggleButton-offValue").val(defaultConfig.offValue.value);
                    element.cssEditor.setValue(defaultConfig.CSS.value);
                    element.cssEditor.clearSelection();
                `
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
                        color: black;
                    }
                    .off {
                        background-color: #800000;
                        color: black;
                    }
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
                    state: this.widget.getValue("state")
                }
            },

            //Setup the widget
            setupWidget: function (widget, config) {
                this.widget = widget;

                //Set the configuration
                this.config.text = config["toggleButton-text"];
                this.config.onValue = config["toggleButton-onValue"];
                this.config.offValue = config["toggleButton-offValue"];
                this.config.CSS = config["toggleButton-CSS"];
            },

            //When node red redeploys or closes
            onClose: function () { },

            //When a message comes from the dashbored
            onMessage: function (msg) {
                if (msg.id == this.id) {
                    this.widget.sendStatusToFlow("set");
                }
            },

            //When a message comes from a node red flow
            onFlowMessage: function (msg) {
                if (msg.payload && msg.payload.state) {
                    this.widget.setValue("state", msg.payload.state);
                    this.widget.sendToDashbored(this.id, msg.payload.state);
                }
            },

            //Generate the CSS for the widget
            generateCSS: function (htmlId) {
                return `
                    #${htmlId}_button {
                        width: calc(100% - 10px);
                        height: calc(100% - 10px);
                        margin: 5px;
                    }
                `;
            },

            //Generate the CSS specified by the user in the node configuration
            generateCustomCSS: function () {
                if (!this.config.CSS) { return ""; }

                //Go through the CSS and add the ids
                var rebuild = "";
                var classes = this.config.CSS.split("}");
                for (var i = 0; i < classes.length - 1; i++) {
                    var selectors = classes[i].split(" {");
                    selectors[0] = selectors[0].replace(/^\s+|\s+$/gm, '');
                    var output = `${selectors[0][0]}n${this.id.split(".")[0]}_${selectors[0].substring(1)} {${selectors[1]}}\n`;
                    rebuild += output;
                }
                return rebuild;
            },

            //Generate the HTML for the widget that will be inserted into the dashbored
            generateHTML: function (htmlId) {
                return `
                    ${this.util.generateTag(htmlId, "button", "button", this.config.text, `class="${this.util.generateCSSClass(this.id, "button")} ${this.util.generateCSSClass(this.id, (this.widget.getValue("state") == this.config.offValue ? "off" : "on"))}" state="${this.widget.getValue("state")}"`)}
                `;
            },

            //Generate the script that will be executed when the dashbored loads
            generateOnload: function (htmlId, lockedAccess, alwaysPassword, ask, askText) {
                return `
                    ${this.util.getElement(htmlId, "button")}.onclick = function(event) {
                        var yesAction = function() {
                            sendMsg("${this.id}", event.target.getAttribute("state") == "${this.config.onValue}" ? "${this.config.offValue}" : "${this.config.onValue}");
                        }
                        var noAction = function(){}

                        ${this.util.generateWidgetAction(lockedAccess, alwaysPassword, ask, askText, "yesAction", "noAction")}
                    }

                    ${this.util.getElement(htmlId, "button")}.setAttribute("state", "${this.widget.getValue("state")}");
                `;
            },

            //Generate the script that will be called when a message comes from NodeRed on the dashbored
            generateOnMsg: function (htmlId) {
                return `
                    ${this.util.getElement(htmlId, "button")}.setAttribute("state", msg.payload);
                    if(msg.payload == "${this.config.onValue}") {
                        ${this.util.getElement(htmlId, "button")}.classList.add("${this.util.generateCSSClass(this.id, "on")}");
                        ${this.util.getElement(htmlId, "button")}.classList.remove("${this.util.generateCSSClass(this.id, "off")}");
                    }
                    else {
                        ${this.util.getElement(htmlId, "button")}.classList.add("${this.util.generateCSSClass(this.id, "off")}");
                        ${this.util.getElement(htmlId, "button")}.classList.remove("${this.util.generateCSSClass(this.id, "on")}");
                    }
                `;
            },

            //Generate any extra scripts to add to the document
            generateScript: function () { },
        }
    }
}