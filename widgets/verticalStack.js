/**
 * Vertical Stack Widget for Dashbored
 * Stacks many widgets vertically
 * https://github.com/haydendonald/NodeRed-Dashbored
*/

module.exports = {
    widgetType: "verticalStack",
    version: "1.0.0",
    label: "Vertical Stack",
    description: "Stacks many widgets vertically",
    widthMultiplier: 1,
    heightMultiplier: 1,
    minWidth: undefined,
    minWeight: undefined,
    maxWidth: undefined,
    maxHeight: undefined,
    noHeight: true,
    noWidth: true,

    //Insert the HTML into the config on the NodeRed flow
    //The ids MUST be node-config-input-<WIDGETNAME>-<CONFIGNAME> otherwise they may not be set
    generateConfigHTML: function () {
        return `
            <p><a href="https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widgetTypes/verticalStack.md" target="_blank">See the wiki for more information</a></p>
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
            var options = [];
            var wids = {};
            for (var i = 0; i < widgets.length; i++) {
                options.push({
                    label: widgets[i].label,
                    value: widgets[i].id
                });
                wids[widgets[i].id] = widgets[i];
            }


            //Validate and add an item
            function validate() {
                var self = this
                this["verticalStack-widgets"] = [];
                var optionsList = $("#options").editableList("items");
                optionsList.each(function (i) {
                    var option = $(this);
                    self["verticalStack-widgets"].push(option.find(".node-input-option-widget").typedInput('value'));
                });
            }

            var optionsList = $("#options").css('min-height', '200px').editableList({
                header: $("<div>").css('padding-left', '32px').append($.parseHTML(
                    "<div style='width:35%; display: inline-grid'><b>Widget</b></div>")),

                addItem: function (container, i, option) {
                    var row = $('<div/>').appendTo(container);
                    var widgetField = $('<input/>', { class: "node-input-option-widget", type: "text" }).css({ "width": "35%", "margin-left": "5px", "margin-right": "5px" }).appendTo(row);

                    widgetField.typedInput({
                        types: [{
                            value: i,
                            options: options
                        }]
                    });
                    if(element["verticalStack-widgets"]) {
                        widgetField.typedInput("value", element["verticalStack-widgets"].split(",")[i]);
                    }
                    validate();

                },
                removeItem: function (data) {
                    validate()
                },
                removable: true,
                sortable: true,

            });

            //Add existing options
            if (element["verticalStack-widgets"]) {
                element["verticalStack-widgets"].split(",").forEach(function (option, index) {
                    optionsList.editableList("addItem", { widget: option});
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
                    var temp = [];
                    var optionsList = $("#options").editableList("items");
                    optionsList.each(function (i) {
                        var option = $(this);
                        temp.push(option.find(".node-input-option-widget").typedInput("value"));
                    });
                    element["verticalStack-widgets"] = temp.join();

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
                    `.replace(/^\s+|\s+$/gm, '')
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
        this.heightMultiplier = this.config.widgets.split(",").length;
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
        for (var i in widgetIds) {
            ret += `
            <widget id="${widgetIds[i]}" style="float: none"></widget>
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