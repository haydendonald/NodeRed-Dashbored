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
    resetConfig: true,

    //Insert the HTML into the config on the NodeRed flow
    //The ids MUST be node-config-input-<WIDGETNAME>-<CONFIGNAME> otherwise they may not be set
    generateConfigHTML: function () {
        return `
                    <p><a href="https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widgetTypes/draggableVolume.md" target="_blank">See the wiki for more information</a></p>
                    <div class="form-row">
                        <label for="config-input-draggableVolume-mutedValue">Muted Value</label>
                        <input type="text" id="node-config-input-draggableVolume-mutedValue" placeholder="Muted Value">
                    </div>
                    <div class="form-row">
                        <label for="config-input-draggableVolume-unmutedValue">Unmuted Value</label>
                        <input type="text" id="node-config-input-draggableVolume-unmutedValue" placeholder="Unmuted Value">
                    </div>
                    <div class="form-row">
                        <label for="config-input-draggableVolume-increment">Increment</label>
                        <input type="number" id="node-config-input-draggableVolume-increment" placeholder="Increment">
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
                        value: element["draggableVolume-CSS"]
                    });

                    console.log(element);
                `,
            //When the user clicks save on the editor set our values
            oneditsave: `
                    //Set the CSS value
                    element["draggableVolume-CSS"] = element.cssEditor.getValue();

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
                    $("#node-config-input-draggableVolume-increment").val(settings.increment.value);
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
            #volumeLevelContainer {
                transform: rotate(180deg);
                overflow: hidden;
                background-color: white;
                width: 100%;
                height: 90%;
                border-radius: 0.5em;
            }
            #volumeLevelTop {
                background-color: #01e301;
                width: 100%;
                height: 100%;
            }
            #volumeLevelHandle {
                background-color: gray;
                height: 20px
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
        // if (msg.id == this.id) {
        //     var vals = this.getValues();
        //     var temp;
        //     if (msg.payload.muted != undefined) { vals["muted"] = msg.payload.muted; }
        //     if (msg.payload.volume != undefined) {
        //         vals["volume"] = msg.payload.volume;
        //         if(vals["volume"] >= 100){vals["volume"] = 100;}
        //         if(vals["volume"] <= 0){vals["volume"] = 0;}
        //     }
        //     var temp = vals;
        //     temp["previousVolume"] = this.getValues()["volume"];
        //     temp["previousMuted"] = this.getValues()["muted"];
        //     this.sendStatusChangesToFlow(msg.sessionId, temp);

        //     //Set the internal state if set
        //     if (this.setsState) {
        //         this.setValues(vals);
        //         this.sendToDashbored(this.id, msg.sessionId, this.getValues());
        //     }
        // }
    },

    //When a message comes from a node red flow
    onFlowMessage: function (msg) {
        // if (msg.payload) {
        //     if (msg.payload.volume != undefined) {
        //         this.setValue("volume", msg.payload.volume);
        //     }
        //     if (msg.payload.muted != undefined) {
        //         this.setValue("muted", msg.payload.muted);
        //     }
        //     this.sendToDashbored(this.id, msg.sessionId, this.getValues());
        // }
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
                `, `mouseIsHeld="false"`)}
                ${util.generateTag(htmlId, "div", "touch", "", `
                    style="
                    z-index: 1;
                    position: absolute;
                    top: 0;
                    "
                `)}
                ${util.generateTag(htmlId, "button", "muteButton", "Mute", `class=${util.generateCSSClass(htmlId, "button")}`)}
            `, `style="height: 80%"`)}
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
        //When the user changes the volume level
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
        var noAction = function() {
            //TODO: Update the UI to the previous value
        }
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


        //Listen if the user has the mouse held or not
        var mouseClickedFunc = `function(event) {this.setAttribute("mouseIsHeld", true);}`;
        var mouseUnClickedFunc = `function(event) {this.setAttribute("mouseIsHeld", false);}`;
        var mouseClickListeners = `
            ${util.getElement(htmlId, "touch")}.onmousedown = ${mouseClickedFunc}

            ${util.getElement(htmlId, "touch")}.onmouseup = ${mouseUnClickedFunc}
            ${util.getElement(htmlId, "touch")}.onmouseout = ${mouseUnClickedFunc}
            ${util.getElement(htmlId, "touch")}.onmouseleave = ${mouseUnClickedFunc}
        `;

        //Add the listener for the mouse position and convert to a percentage
        var mousePercentListener = `${util.getElement(htmlId, "touch")}.onmousemove = function(event) {
            if(this.getAttribute("mouseIsHeld") == "true") {
                //console.log(event.offsetY - (event.srcElement.clientHeight / 2))

                //console.log(event.srcElement.offsetParent.clientHeight);
                //console.log(event.srcElement.offsetParent.offsetHeight);

                //console.log();


               var volume = parseInt(${util.getElement(htmlId, "widget")}.getAttribute("volume")) + (event.offsetY - (event.srcElement.clientHeight / 2) > 0 ? 1 : -1);
               ${this.showVolume(htmlId)}
              //console.log(event);

            }
        }`;

        return `
            //Update the volume touch div to be the correct size of the widget
            ${util.getElement(htmlId, "touch")}.style.width = ${util.getElement(htmlId, "volumeLevelContainer")}.offsetWidth + "px";
            ${util.getElement(htmlId, "touch")}.style.height = ${util.getElement(htmlId, "volumeLevelContainer")}.offsetHeight + "px";


            //Add the actions
            ${util.getElement(htmlId, "muteButton")}.onclick = function(event) {${muteAction}};
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
        return ``;
        // return `
        //     if(msg.payload.muted != undefined) {
        //         ${util.getElement(htmlId, "widget")}.setAttribute("muted", msg.payload.muted);
        //         var muted = msg.payload.muted == "${this.config.mutedValue}";
        //         ${this.showMute(htmlId)}
        //     }
        //     if(msg.payload.volume != undefined) {
        //         ${util.getElement(htmlId, "widget")}.setAttribute("volume", msg.payload.volume);
        //         var volume = msg.payload.volume;
        //         ${this.showVolume(htmlId)}
        //     }
        // `;
    },

    //Generate any extra scripts to add to the document
    generateScript: function () { },
}