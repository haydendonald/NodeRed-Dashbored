/**
 * Volume Widget for Dashbored
 * https://github.com/haydendonald/NodeRed-Dashbored
*/

var util = require("../util.js");
module.exports = {
    widgetType: "volume",
    version: "0.0.3",
    label: "Volume",
    description: "Displays a volume control",
    widthMultiplier: 1,
    heightMultiplier: 3,
    minWidth: undefined,
    minWeight: undefined,
    maxWidth: undefined,
    maxHeight: undefined,

    //Insert the HTML into the config on the NodeRed flow
    //The ids MUST be node-config-input-<WIDGETNAME>-<CONFIGNAME> otherwise they may not be set
    generateConfigHTML: function () {
        return `
                    <p><a href="https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widgetTypes/volume.md" target="_blank">See the wiki for more information</a></p>
                    <div class="form-row">
                        <label for="config-input-volume-mutedValue">Muted Value</label>
                        <input type="text" id="node-config-input-volume-mutedValue" placeholder="Muted Value">
                    </div>
                    <div class="form-row">
                        <label for="config-input-volume-unmutedValue">Unmuted Value</label>
                        <input type="text" id="node-config-input-volume-unmutedValue" placeholder="Unmuted Value">
                    </div>
                    <div class="form-row">
                        <label for="config-input-volume-increment">Increment</label>
                        <input type="number" id="node-config-input-volume-increment" placeholder="Increment">
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
            //When the user clicks the "copy configuration" button update the values shown
            update: `
                    element.cssEditor.setValue(settings.CSS.value);
                    element.cssEditor.clearSelection();
                    $("#node-config-input-volume-mutedValue").val(settings.mutedValue.value);
                    $("#node-config-input-volume-unmutedValue").val(settings.unmutedValue.value);
                    $("#node-config-input-volume-increment").val(settings.increment.value);
                `
        }
    },
    //Default config
    defaultConfig: {
        mutedValue: { value: "on", required: true },
        unmutedValue: { value: "off", required: true },
        increment: { value: 1, required: true },
        CSS: {
            value: `
                #volumeLevelContainer {
                    transform: rotate(180deg);
                    overflow: hidden;
                    background-color: white;
                    width: 20%;
                    height: 90%;
                    margin-top: 5%;
                    margin-left: 10%;
                    margin-right: 5%;
                    float: right;
                    border-radius: 10em;
                }
                #volumeLevelTop {
                    background-color: #01e301;
                    width: 100%;
                    height: 100%;
                }
                #buttonContainer {
                    float: right;
                    height: 100%;
                    width: 60%;
                }
                .button {
                    display: block;
                    width: 100%;
                    height: calc((100%/3) - (2.5px * 3));
                    padding: 0;
                    margin-top: 5px;
                    transition: background-color 0.1s;
                }
                .mutedColor {
                    background-color: red !important;
                }
                .clickColor {
                    background-color: white !important;
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
            muted: this.config.mutedValue
        }
    },

    //Return the current values
    getValues: function () {
        return {
            volume: this.getValue("volume"),
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
            var vals = this.getValues();
            var temp;
            if (msg.payload.muted != undefined) { vals["muted"] = msg.payload.muted; }
            if (msg.payload.volume != undefined) {
                vals["volume"] = msg.payload.volume;
                if(vals["volume"] >= 100){vals["volume"] = 100;}
                if(vals["volume"] <= 0){vals["volume"] = 0;}
            }
            var temp = vals;
            temp["previousVolume"] = this.getValues()["volume"];
            temp["previousMuted"] = this.getValues()["muted"];
            this.sendStatusChangesToFlow(msg.sessionId, temp);

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
            if (msg.payload.volume != undefined) {
                this.setValue("volume", msg.payload.volume);
            }
            if (msg.payload.muted != undefined) {
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
            ${util.generateTag(htmlId, "button", "muteButton", "Mute", `class=${util.generateCSSClass(htmlId, "button")}`)}
        `;
        return `
            ${util.generateTag(htmlId, "div", "volumeLevelContainer", volumeLevel, "")}
            ${util.generateTag(htmlId, "div", "buttonContainer", buttons, "")}
        `;
    },

    /**
     * Generate the script to show the mute status
     * @param {*} htmlId 
     * @param {boolean} muted Should it be muted. Leave undefined and use variable "muted"
     * @returns script
     */
    showMute: function (htmlId, muted) {
        return `
        if(${muted != undefined ? muted : "muted"}) {
            ${util.getElement(htmlId, "muteButton")}.classList.add("${util.generateCSSClass(htmlId, "mutedColor")}");
            ${util.getElement(htmlId, "volumeLevelTop")}.classList.add("${util.generateCSSClass(htmlId, "mutedColor")}");
        }
        else {
            ${util.getElement(htmlId, "muteButton")}.classList.remove("${util.generateCSSClass(htmlId, "mutedColor")}");
            ${util.getElement(htmlId, "volumeLevelTop")}.classList.remove("${util.generateCSSClass(htmlId, "mutedColor")}");
        }
        `;
    },

    /**
     * Show a volume level from 0 - 100%
     * @param {*} htmlId 
     * @param {boolean} volume The level. Leave undefined and use variable "volume"
     * @returns script
     */
    showVolume: function (htmlId, volume) {
        return ` 
        ${volume != undefined ? "" : "volume = volume + '%';"};
        ${util.getElement(htmlId, "volumeLevelTop")}.style.height = ${volume != undefined ? '"' + volume + '%"' : "volume"};
        `;
    },

    //Generate the script that will be executed when the dashbored loads
    generateOnload: function (htmlId, lockedAccess, alwaysPassword, ask, askText) {
        //When the user clicks the volume up button
        var volPlusAction = `
        var yesAction = function() {
            var waiting = true;
            setTimeout(function(){if(waiting){loadingAnimation(event.target.id, true);}}, 500);
            sendMsg("${htmlId}", "${this.id}", {volume: parseInt(${util.getElement(htmlId, "widget")}.getAttribute("volume")) + ${this.config.increment}}, function(id, sessionId, success, msg) {
                if(id == "${this.id}") {
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

        //When the user clicks the volume down button
        var volMinusAction = `
        var yesAction = function() {
            var waiting = true;
            setTimeout(function(){if(waiting){loadingAnimation(event.target.id, true);}}, 500);
            sendMsg("${htmlId}", "${this.id}", {volume: parseInt(${util.getElement(htmlId, "widget")}.getAttribute("volume")) - ${this.config.increment}}, function(id, sessionId, success, msg) {
                if(id == "${this.id}") {
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

        //When the mute button is pressed
        var muteAction = `
            var yesAction = function() {
                var waiting = true;
                var currentlyMuted = ${util.getElement(htmlId, "widget")}.getAttribute("muted") == "${this.config.mutedValue}";
                setTimeout(function(){if(waiting){loadingAnimation(event.target.id, true);}}, 500);
                sendMsg("${htmlId}", "${this.id}", {muted: (currentlyMuted ? "${this.config.unmutedValue}" : "${this.config.mutedValue}")}, function(id, sessionId, success, msg) {
                    if(id == "${this.id}") {
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

        return `
        ${util.getElement(htmlId, "plus")}.onclick = function(event) {${volPlusAction}};
        ${util.getElement(htmlId, "minus")}.onclick = function(event) {${volMinusAction}};
        ${util.getElement(htmlId, "muteButton")}.onclick = function(event) {${muteAction}};
        ${util.getElement(htmlId, "widget")}.setAttribute("muted", "${this.getValue("muted")}");
        ${util.getElement(htmlId, "widget")}.setAttribute("volume", ${this.getValue("volume")});

        //Set the default UI
        ${this.showMute(htmlId, this.getValue("muted") == `${this.config.mutedValue}`)}
        ${this.showVolume(htmlId, this.getValue("volume"))}
        `;
    },

    //Generate the script that will be called when a message comes from NodeRed on the dashbored
    generateOnMsg: function (htmlId) {
        return `
            if(msg.payload.muted != undefined) {
                ${util.getElement(htmlId, "widget")}.setAttribute("muted", msg.payload.muted);
                var muted = msg.payload.muted == "${this.config.mutedValue}";
                ${this.showMute(htmlId)}
            }
            if(msg.payload.volume != undefined) {
                ${util.getElement(htmlId, "widget")}.setAttribute("volume", msg.payload.volume);
                var volume = msg.payload.volume;
                ${this.showVolume(htmlId)}
            }
        `;
    },

    //Generate any extra scripts to add to the document
    generateScript: function () { },
}