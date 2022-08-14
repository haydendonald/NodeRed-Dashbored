/**
 * HVAC Widget for Dashbored
 * https://github.com/haydendonald/NodeRed-Dashbored
*/

var util = require("../util.js");
module.exports = {
    widgetType: "HVAC",
    version: "0.0.1",
    label: "HVAC",
    description: "Allows control of a HVAC or AC unit",
    widthMultiplier: 2,
    heightMultiplier: 1,
    minWidth: undefined,
    minWeight: undefined,
    maxWidth: undefined,
    maxHeight: undefined,

    resetConfig: true, //DEBUG FLAG TO CLEAR CONFIGURATION

    //Insert the HTML into the config on the NodeRed flow
    //The ids MUST be node-config-input-<WIDGETNAME>-<CONFIGNAME> otherwise they may not be set
    generateConfigHTML: function () {
        return `
            <p><a href="https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widgetTypes/HVAC.md" target="_blank">See the documentation for more information</a></p>
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
                        value: element["HVAC-CSS"]
                    });
                `,
            //When the user clicks save on the editor set our values
            oneditsave: `
                    //Set the CSS value
                    element["HVAC-CSS"] = element.cssEditor.getValue();

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
                `
        }
    },
    //Default config
    defaultConfig: {
        modes: {
            value: [
                {
                    "label": "Auto",
                    "value": "auto",
                    "onColor": "#32CD32",
                    "offColor": "#ff3333"
                },
                {
                    "label": "Heat",
                    "value": "heat",
                    "onColor": "#32CD32",
                    "offColor": "#ff3333"
                },
                {
                    "label": "Cool",
                    "value": "cool",
                    "onColor": "#32CD32",
                    "offColor": "#ff3333"
                },
                {
                    "label": "Off",
                    "value": "off",
                    "onColor": "#32CD32",
                    "offColor": "#ff3333"
                }
            ],
            validate: function (values) {
                if (values === undefined) { return false; }
                for (var i in values) {
                    if (values[i].label === undefined) { return false; }
                    if (values[i].value === undefined || values[i].value == "") { return false; }
                    if (values[i].offColor === undefined || values[i].offColor == "") { return false; }
                    if (values[i].onColor === undefined || values[i].onColor == "") { return false; }
                }
                return true;
            }
        },
        CSS: {
            value: `
                .button {
                    width: calc(100% - 10px);
                    margin: 5px;
                }
                .div {
                    height: 100%;
                    width: 50%;
                    float: left;
                }
                .tempDiv {
                    text-align: center;
                    width: calc(100% - 10px);
                    padding: 5px;
                }
                .innerTempDiv {
                    background-color: gray;
                    border-radius: 20px;
                    padding: 20px;
                }
                .button h1 {
                    font-size: 150%;
                }
                .button h2 {
                    font-size: 100%;
                    margin-top: 10px;
                }
                `.replace(/^\s+|\s+$/gm, ''), required: false
        }
    },
    //Current config
    config: {},

    //Default value(s)
    getDefaultValues: function () {
        return {
            currentMode: "heat",
            currentAction: "Heating",
            setTemperature: 22,
            currentTemperature: 20
        }
    },

    //Return the current values
    getValues: function () {
        return {
            currentMode: this.getValue("currentMode"),
            currentAction: this.getValue("currentAction"),
            setTemperature: this.getValue("setTemperature"),
            currentTemperature: this.getValue("currentTemperature")
        }
    },

    //Setup the widget
    setupWidget: function (config) {
        this.heightMultiplier = this.config.modes.length;
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

    updateHTML: function (htmlId) {

    },

    //Generate the HTML for the widget that will be inserted into the dashbored
    generateHTML: function (htmlId) {
        var html = "";
        var values = this.getValues();
        //console.log(this);


        //Add the mode buttons
        var modesHTML = `<div class="${util.generateCSSClass(htmlId, "div")}">`;
        var buttonHeight = `height: calc((100% / ${this.config.modes.length}) - 10px)`;
        for(var i in this.config.modes) {
            var current = this.config.modes[i];
            modesHTML += util.generateTag(htmlId, "button", "mode_" + current.value, current.label, `class="${util.generateCSSClass(htmlId, "button")}" style="${buttonHeight}"`);
        }
        modesHTML += "</div>";

        //Add the temperature control
        var tempHTML = `<div class="${util.generateCSSClass(htmlId, "div")}">`;
        var modeColor = "white";
        for(var i in this.config.modes) {
            if(this.config.modes[i].value == values["currentMode"]) {
                modeColor = this.config.modes[i].onColor;
                break;
            }
        }
        tempHTML += util.generateTag(htmlId, "button", "tempDiv", `
            ${util.generateTag(htmlId, "h1", "currentTemperature", ``, ``)}
            <h1>Currently ${values["currentTemperature"]}</h1>


            <h2 style="color: ${modeColor}; display: ${values["currentMode"] == "off" ? "none" : "block"}">${values["currentAction"] != "" ? values["currentAction"] + " to " : "Set:"} ${values["setTemperature"]}</h2>
            <h2 style="color: ${modeColor}; display: ${values["currentMode"] == "off" ? "block" : "none"}">Off</h2>
        
        `, `class="${util.generateCSSClass(htmlId, "button")}" style="${buttonHeight}"`);
        
        //Add blank divs to fill out the space depending on how many modes there are
        for(var i = 0; i < this.config.modes.length - 3; i++) {
            tempHTML += util.generateTag(htmlId, "div", "spacer", "", `class="${util.generateCSSClass(htmlId, "tempDiv")}" style="height: calc((100% / ${this.config.modes.length}) - 10px)"`);
        }
        

        tempHTML += util.generateTag(htmlId, "button", "tempPlus", "+", `class="${util.generateCSSClass(htmlId, "button")}" style="${buttonHeight}"`);
        tempHTML += util.generateTag(htmlId, "button", "tempPlus", "-", `class="${util.generateCSSClass(htmlId, "button")}" style="${buttonHeight}"`);




        tempHTML += "</div>";

        html += modesHTML;
        html += tempHTML;



        // var volumeLevel = util.generateTag(htmlId, "div", "volumeLevelTop", "", "");
        // var buttons = `
        //     ${util.generateTag(htmlId, "button", "plus", "+", `class=${util.generateCSSClass(htmlId, "button")}`)}
        //     ${util.generateTag(htmlId, "button", "minus", "-", `class=${util.generateCSSClass(htmlId, "button")}`)}
        //     ${util.generateTag(htmlId, "button", "muteButton", "Mute", `class=${util.generateCSSClass(htmlId, "button")}`)}
        // `;
        // return `
        //     ${util.generateTag(htmlId, "div", "volumeLevelContainer", volumeLevel, "")}
        //     ${util.generateTag(htmlId, "div", "buttonContainer", buttons, "")}
        // `;
        console.log(html);
        return html;
    },

    //Generate the script that will be executed when the dashbored loads
    generateOnload: function (htmlId, lockedAccess, alwaysPassword, ask, askText) {
        return ``;
        // //When the user clicks the volume up button
        // var volPlusAction = `
        // var yesAction = function() {
        //     var waiting = true;
        //     setTimeout(function(){if(waiting){loadingAnimation(event.target.id, true);}}, 500);
        //     sendMsg("${htmlId}", "${this.id}", {volume: parseInt(${util.getElement(htmlId, "widget")}.getAttribute("volume")) + ${this.config.increment}}, function(id, sessionId, success, msg) {
        //         if(id == "${this.id}") {
        //             waiting = false;
        //             loadingAnimation(event.target.id, false);
        //             if(!success) {
        //                 failedToSend();
        //             }
        //         }
        //     });
        // }
        // var noAction = function() {}
        // ${util.generateWidgetAction(lockedAccess, alwaysPassword, ask, askText, "yesAction", "noAction")} 
        // `;

        // //When the user clicks the volume down button
        // var volMinusAction = `
        // var yesAction = function() {
        //     var waiting = true;
        //     setTimeout(function(){if(waiting){loadingAnimation(event.target.id, true);}}, 500);
        //     sendMsg("${htmlId}", "${this.id}", {volume: parseInt(${util.getElement(htmlId, "widget")}.getAttribute("volume")) - ${this.config.increment}}, function(id, sessionId, success, msg) {
        //         if(id == "${this.id}") {
        //             waiting = false;
        //             loadingAnimation(event.target.id, false);
                    
        //             if(!success) {
        //                 failedToSend();
        //             }
        //         }
        //     });
        // }
        // var noAction = function() {}
        // ${util.generateWidgetAction(lockedAccess, alwaysPassword, ask, askText, "yesAction", "noAction")}
        // `;

        // //When the mute button is pressed
        // var muteAction = `
        //     var yesAction = function() {
        //         var waiting = true;
        //         var currentlyMuted = ${util.getElement(htmlId, "widget")}.getAttribute("muted") == "${this.config.mutedValue}";
        //         setTimeout(function(){if(waiting){loadingAnimation(event.target.id, true);}}, 500);
        //         sendMsg("${htmlId}", "${this.id}", {muted: (currentlyMuted ? "${this.config.unmutedValue}" : "${this.config.mutedValue}")}, function(id, sessionId, success, msg) {
        //             if(id == "${this.id}") {
        //                 waiting = false;
        //                 loadingAnimation(event.target.id, false);
        //                 if(!success) {
        //                     failedToSend();
        //                 }
        //             }
        //         });
        //     }
        //     var noAction = function() {}
        //     ${util.generateWidgetAction(lockedAccess, alwaysPassword, ask, askText, "yesAction", "noAction")}
        // `;

        // return `
        // ${util.getElement(htmlId, "plus")}.onclick = function(event) {${volPlusAction}};
        // ${util.getElement(htmlId, "minus")}.onclick = function(event) {${volMinusAction}};
        // ${util.getElement(htmlId, "muteButton")}.onclick = function(event) {${muteAction}};
        // ${util.getElement(htmlId, "widget")}.setAttribute("muted", "${this.getValue("muted")}");
        // ${util.getElement(htmlId, "widget")}.setAttribute("volume", ${this.getValue("volume")});

        // //Set the default UI
        // ${this.showMute(htmlId, this.getValue("muted") == `${this.config.mutedValue}`)}
        // ${this.showVolume(htmlId, this.getValue("volume"))}
        // `;
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