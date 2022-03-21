/**
 * Button Selector Widget for Dashbored
 * Allows for selecting a value using multiple buttons
 * https://github.com/haydendonald/NodeRed-Dashbored
*/

module.exports = {
    widgetType: "horizontalStack",
    version: "0.0.1",
    label: "Horizontal Stack",
    description: "Stacks many widgets horizontally",
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
            <div class="form-row">
                <label for="node-input-horizontalStack-widgets"><i class="icon-bookmark"></i> Widgets</label>
                <input type="text" id="node-input-horizontalStack-widgets">
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
        console.log(this.id);
        var id = this.id;
        return {
            //When the user opens the config panel get things ready
            oneditprepare: `
            var options = [];
            var wids = {};
            for (var i = 0; i < widgets.length; i++) {
                options.push({
                    label: widgets[i].label,
                    value: widgets[i].id
                });
                wids[widgets[i].id] = widgets[i];
            }

            $("#node-input-horizontalStack-widgets").typedInput({
                types: [{
                    value: "widgets",
                    multiple: "true",
                    options: options
                }]
            });
            $("#node-input-horizontalStack-widgets").typedInput("value", element["horizontalStack-widgets"]);

            element.cssEditor = RED.editor.createEditor({
                id: "CSS",
                mode: "ace/mode/css",
                value: element["buttonSelector-CSS"]
            });
        `,
            //When the user clicks save on the editor set our values
            oneditsave: `
                    element["horizontalStack-widgets"] = $("#node-input-horizontalStack-widgets").typedInput("value");

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
            //When the user clicks the "reset configuration" set the options to their defaults
            reset: `
                    element.cssEditor.setValue(defaultConfig.CSS.value);
                    element.cssEditor.clearSelection();
                `
        }
    },
    //Default config
    defaultConfig: {
        widgets: {
            value: "",
            required: true
        },
        CSS: {
            value: `
                        .button {
                            width: calc(100% - 10px);
                            height: calc(100% - 10px);
                            margin: 5px;
                        }
                    `.replace(/^\s+|\s+$/gm, ''), required: true
        }
    },
    //Current config
    config: {},

    //Default value(s)
    getDefaultValues: function () {
        return {
            values: undefined
        }
    },

    //Return the current values
    getValues: function () {
        return {
            value: this.getValue("values")
        }
    },

    //Setup the widget
    setupWidget: function (config) {
        this.widthMultiplier = this.config.widgets.split(",").length;
        this.noHeight = true;
    },

    //When node red redeploys or closes
    onClose: function () { },

    //When a message comes from the dashbored
    onMessage: function (msg) {
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
        var ret = "";
        var widgetIds = this.config.widgets.split(",");
        for(var i in widgetIds) {
            ret += `
            <widget id="${widgetIds[i]}" style="float: left"></widget>
            `;
        }
        return ret;
    },

    //Generate the script that will be executed when the dashbored loads
    generateOnload: function (htmlId, lockedAccess, alwaysPassword, ask, askText) {
        return "";
    },

    //Generate the script that will be called when a message comes from NodeRed on the dashbored
    generateOnMsg: function (htmlId) {
        return "";
    },

    //Generate any extra scripts to add to the document
    generateScript: function () { },
}