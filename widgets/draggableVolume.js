/**
 * Volume Widget for Dashbored
 * https://github.com/haydendonald/NodeRed-Dashbored
*/

var util = require("../util.js");
module.exports = {
    widgetType: "draggableVolume",
    version: "1.0.0",
    label: "Draggable Volume",
    description: "Displays a volume control that can be dragged to change the volume level",
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
                    <p><a href="https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widgetTypes/draggableVolume.md" target="_blank">See the wiki for more information</a></p>
                    <div class="form-row">
                        <label for="node-config-input-draggableVolume-muteEnabled">Enable Mute</label>
                        <input type="checkbox" id="node-config-input-draggableVolume-muteEnabled">
                    </div>
                    <div class="form-row">
                        <label for="config-input-draggableVolume-mutedValue">Muted Value</label>
                        <input type="text" id="node-config-input-draggableVolume-mutedValue" placeholder="Muted Value">
                    </div>
                    <div class="form-row">
                        <label for="config-input-draggableVolume-unmutedValue">Unmuted Value</label>
                        <input type="text" id="node-config-input-draggableVolume-unmutedValue" placeholder="Unmuted Value">
                    </div>
                    <div class="form-row">
                        <label for="node-config-input-draggableVolume-sendOnRelease">Set Value on Release</label>
                        <input type="checkbox" id="node-config-input-draggableVolume-sendOnRelease">
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
                    $("#node-config-input-draggableVolume-muteEnabled").prop("checked", element["draggableVolume-muteEnabled"]);
                    $("#node-config-input-draggableVolume-sendOnRelease").prop("checked", element["draggableVolume-sendOnRelease"]);
                    element.cssEditor = RED.editor.createEditor({
                        id: "CSS",
                        mode: "ace/mode/css",
                        value: element["draggableVolume-CSS"]
                    });
                `,
            //When the user clicks save on the editor set our values
            oneditsave: `
                    //Set the CSS value
                    element["draggableVolume-CSS"] = element.cssEditor.getValue();
                    element["draggableVolume-muteEnabled"] = $("#node-config-input-draggableVolume-muteEnabled").val();
                    element["draggableVolume-sendOnRelease"] = $("#node-config-input-draggableVolume-sendOnRelease").val();

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
                    $("#node-config-input-draggableVolume-mutedValue").val(settings.mutedValue.value);
                    $("#node-config-input-draggableVolume-unmutedValue").val(settings.unmutedValue.value);
                    $("#node-config-input-draggableVolume-sendOnRelease").prop("checked", settings.sendOnRelease.value);
                    $("#node-config-input-draggableVolume-muteEnabled").prop("checked", settings.muteEnabled.value);
                `
        }
    },
    //Default config
    defaultConfig: {
        mutedValue: { value: "on", required: true },
        unmutedValue: { value: "off", required: true },
        sendOnRelease: { value: true },
        muteEnabled: {value: true },
        CSS: {
            value: `
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
            #volumeLevelContainer {
                transform: rotate(180deg);
                overflow: hidden;
                background-color: white;
                width: 100%;
                height: 90%;
                border-radius: 0.5em;
            }
            #volumeLevelTop {
                background-color: #5dd54a;
                width: 100%;
                height: 100%;
            }
            #volumeLevelHandle {
                background-color: #626262;
                height: 5px
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
                vals["volume"] = (msg.payload.volume * 1.2) - 10;
                if (vals["volume"] >= 100) { vals["volume"] = 100; }
                if (vals["volume"] <= 0) { vals["volume"] = 0; }
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
                this.setValue("volume", (msg.payload.volume / 1.2) + 10);
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
        return `
            ${util.generateTag(htmlId, "div", "container", `
                ${util.generateTag(htmlId, "div", "volumeLevelContainer", `
                    ${util.generateTag(htmlId, "div", "volumeLevelTop", "", "")}
                    ${util.generateTag(htmlId, "div", "volumeLevelHandle", "", "")}
                `, ``)}
                ${util.generateTag(htmlId, "div", "touch", "", `
                    style="
                    z-index: 1;
                    position: absolute;
                    touch-action: none;
                    "
                `)}
                ${this.config.muteEnabled ? util.generateTag(htmlId, "button", "muteButton", "Mute", `class=${util.generateCSSClass(htmlId, "button")}`) : ""}
            `, `style="height: ${this.config.muteEnabled ? "80%" : "100%"}; margin: 5px"`)}
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
            if(${this.config.muteEnabled}){${util.getElement(htmlId, "muteButton")}.classList.add("${util.generateCSSClass(htmlId, "mutedColor")}");}
            ${util.getElement(htmlId, "volumeLevelTop")}.classList.add("${util.generateCSSClass(htmlId, "mutedColor")}");
        }
        else {
            if(${this.config.muteEnabled}){${util.getElement(htmlId, "muteButton")}.classList.remove("${util.generateCSSClass(htmlId, "mutedColor")}");}
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

        //Send the volume to the flow
        var sendVolume = `
            sendMsg("${htmlId}", "${this.id}", {volume: parseInt(${util.getElement(htmlId, "volumeLevelTop")}.style.height)}, function(id, sessionId, success, msg) {
                if(id == "${this.id}") {
                    if(!success) {
                        failedToSend();
                    }
                }
            });
        `;

        //When the volume has been changed
        var volumeAction = `
            var yesAction = function() {
                ${sendVolume}
            }
            var noAction = function() {
                //Update the UI to the previous value
                volume = ${util.getElement(htmlId, "widget")}.getAttribute("volume");
                ${this.showVolume(htmlId)}
            }
            ${util.generateWidgetAction(lockedAccess, alwaysPassword, ask, askText, "yesAction", "noAction")}
        `;


        //Listen if the user has the mouse held or not
        var mouseClickedFunc = `function(event) {this.setAttribute("mouseIsHeld", true);}`;
        var mouseUnClickedFunc = `function(event) {
            if(this.getAttribute("mouseIsHeld") == "true" && !${this.config.sendOnRelease}) {
                ${volumeAction}
            }
            this.setAttribute("mouseIsHeld", false);
        }`;
        var mouseClickListeners = `
            ${util.getElement(htmlId, "touch")}.onpointerdown = ${mouseClickedFunc}

            ${util.getElement(htmlId, "touch")}.onpointerup = ${mouseUnClickedFunc}
            ${util.getElement(htmlId, "touch")}.onpointerout = ${mouseUnClickedFunc}
            ${util.getElement(htmlId, "touch")}.onpointerleave = ${mouseUnClickedFunc}
        `;


        //Add the listener for the mouse position and convert to a percentage
        var updatePosition = `function(event) {
            if(this.getAttribute("mouseIsHeld") == "true") {
                var volume = ((${util.getElement(htmlId, "volumeLevelContainer")}.offsetHeight - event.offsetY) / ${util.getElement(htmlId, "volumeLevelContainer")}.offsetHeight) * 100.0;
                volume = volume < 0.0 ? 0.0 : volume;
                volume = volume > 100.0 ? 100.0: volume;

                if(${this.config.sendOnRelease}) {
                    ${sendVolume}
                }

                ${this.showVolume(htmlId)}
            }
        }`;

        var mousePercentListener = `${util.getElement(htmlId, "touch")}.onpointermove = ${updatePosition}`;
        // var touchPercentListener = `${util.getElement(htmlId, "touch")}.ontouchmove = ${updatePosition}`;

        return `
            //Add the actions
            if(${this.config.muteEnabled}){${util.getElement(htmlId, "muteButton")}.onclick = function(event) {${muteAction}};}
            ${util.getElement(htmlId, "widget")}.setAttribute("muted", "${this.getValue("muted")}");
            ${util.getElement(htmlId, "widget")}.setAttribute("volume", ${this.getValue("volume")});
            ${mouseClickListeners}
            ${mousePercentListener}

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
                if(${util.getElement(htmlId, "touch")}.getAttribute("mouseIsHeld") != "true") {
                    ${this.showVolume(htmlId)}
                }
            }
        `;
    },

    //When the page this widget is on is focused
    onPageFocus: function(htmlId) {
        return `
            //Update the volume touch div to be the correct size of the widget
            ${util.getElement(htmlId, "touch")}.style.width = ${util.getElement(htmlId, "volumeLevelContainer")}.offsetWidth + "px";
            ${util.getElement(htmlId, "touch")}.style.height = ${util.getElement(htmlId, "volumeLevelContainer")}.offsetHeight + "px";
            ${util.getElement(htmlId, "touch")}.style.top = ${util.getElement(htmlId, "volumeLevelContainer")}.offsetTop + "px";
        `;
    },

    //Generate any extra scripts to add to the document
    generateScript: function () { },
}