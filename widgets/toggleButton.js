/**
 * Toggle Button Widget for Dashbored
 *
*/


module.exports = {
    widget: "toggleButton",
    version: "0.0.2",
    label: "Toggle Button",
    description: "Toggles between two states",
    create: function () {
        return {

            style: {
                heightMultiplier: 1,
                widthMultiplier: 1,
                minWidth: undefined,
                minWeight: undefined,
                maxWidth: undefined,
                maxHeight: undefined
            },
            //Insert the HTML into the config on the NodeRed flow
            configHTML: function () {
                return `
                    <div class="form-row">
                        <label for="dashbored-text">Text</label>
                        <input type="text" id="dashbored-text" placeholder="Text">
                    </div>
                    <div class="form-row">
                        <label for="dashbored-onValue">On Value</label>
                        <input type="text" id="dashbored-onValue" placeholder="on">
                    </div>
                    <div class="form-row">
                        <label for="dashbored-offValue">Off Value</label>
                        <input type="text" id="dashbored-offValue" placeholder="off">
                    </div>

                    <!-- CSS Editor -->
                    <div class="form-row">
                        <label for="dashbored-css">CSS</label>
                        <div style="height: 250px; min-height:150px;" class="node-text-editor" id="dashbored-css"></div>
                    </div>
                `;
            }(),
            //Scripts to call on the NodeRed config dashbored
            configScript: {
                //When the user opens the config panel get things ready
                oneditprepare: `
                    element.cssEditor = RED.editor.createEditor({
                        id: "dashbored-css",
                        mode: "ace/mode/css",
                        value: element.CSS
                    });

                    //Set the values in the inputs
                    $("#dashbored-text").val(element.text);
                    $("#dashbored-onValue").val(element.onValue);
                    $("#dashbored-offValue").val(element.offValue);
                `,
                //When the user clicks save on the editor set our values
                oneditsave: `
                    //Add the defaults (this is required)
                    element._def.defaults["text"] = {value: "", required: true};
                    element._def.defaults["onValue"] = {value: "", required: true};
                    element._def.defaults["offValue"] = {value: "", required: true};
                    element._def.defaults["CSS"] = {value: "", required: true};

                    //Save the values (this is also required)
                    element.text = $("#dashbored-text").val();
                    element.onValue = $("#dashbored-onValue").val();
                    element.offValue = $("#dashbored-offValue").val();
                    element.CSS = element.cssEditor.getValue();

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
                    $("#dashbored-text").val(defaultConfig.text);
                    $("#dashbored-onValue").val(defaultConfig.onValue);
                    $("#dashbored-offValue").val(defaultConfig.offValue);
                    element.cssEditor.setValue(defaultConfig.CSS);
                    element.cssEditor.clearSelection();
                `
            },
            //Default config
            defaultConfig: {
                text: "Toggle Button",
                onValue: "on",
                offValue: "off",
                CSS: `
                    .on {
                        background-color: #32CD32;
                        color: black;
                    }
                    .off {
                        background-color: #800000;
                        color: black;
                    }
                `.replace(/^\s+|\s+$/gm, '')
            },
            //Current config
            config: {},

            //Check if the configuration is valid
            checkConfig: function() {
                return Object.keys(this.config).length != 0;
            },

            //Setup the widget
            setupWidget: function () {
                this.currentState = this.config.offValue;
            },

            //Send a message to the NodeRed flow (Will be allocated by widget.js)
            sendToFlow: function (msg) { },
            //Send a message to the widgets in the NodeRed flows (Will be allocated by widget.js)
            sendToDashbored: function (id, payload) { },

            //When node red redeploys or closes
            onClose: function () { },

            //When a message comes from the dashbored
            onMessage: function (msg) {
                if (msg.id == this.id) {
                    this.sendToFlow(msg.payload);
                }
            },

            //When a message comes from a node red flow
            onFlowMessage: function (msg) {
                if (msg.payload) {
                    this.currentState = msg.payload;
                    this.sendToDashbored(this.id, this.currentState);
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
                if(!this.config.CSS){return "";}
                
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
                    ${this.util.generateTag(htmlId, "button", "button", this.config.text, `class="${this.util.generateCSSClass(this.id, "button")} ${this.util.generateCSSClass(this.id, (this.currentState == this.config.offValue ? "off" : "on"))}" state="${this.currentState}"`)}
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