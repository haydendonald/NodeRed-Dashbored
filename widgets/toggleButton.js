/**
 * Toggle Button Widget for Dashbored
 *
*/


module.exports = {
    name: "Toggle Button",
    description: "Toggles between two states",
    style: {
        heightMultiplier: 1,
        widthMultiplier: 1,
        minWidth: undefined,
        minWeight: undefined,
        maxWidth: undefined,
        maxHeight: undefined
    },
    options: {
        text: "Toggle Button",
        onValue: "on",
        offValue: "off",
        CSS: ""
    },


    text: "Toggle Button",
    onValue: "on",
    offValue: "off",
    CSS: "",

    //Setup the widget
    setupWidget: function () {
        this.currentState = this.options.offValue;
    },

    //Send a message to the NodeRed flow (Will be allocated by widget.js)
    sendToFlow: function (msg) { },
    //Send a message to the widgets in the NodeRed flows (Will be allocated by widget.js)
    sendToDashbored: function(id, payload) {},

    //When node red redeploys or closes
    onClose: function() {},

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
        //Go through the CSS and add the ids
        var rebuild = "";
        var classes = this.CSS.split("}");
        for (var i = 0; i < classes.length - 1; i++) {
            var selectors = classes[i].split(" {");
            selectors[0] = selectors[0].replace(/^\s+|\s+$/gm, '');
            var output = `${selectors[0][0]}n${this.id.split(".")[0]}_${selectors[0].substring(1)} {${selectors[1]}}\n`;
            rebuild += output;
        }
        console.log(rebuild);
        return rebuild;
    },

    //Generate the HTML for the widget that will be inserted into the dashbored
    generateHTML: function (htmlId) {
        return `
            ${this.util.generateTag(htmlId, "button", "button", this.text, `class="${this.util.generateCSSClass(this.id, "button")} ${this.util.generateCSSClass(this.id, (this.currentState == this.offValue ? "off" : "on"))}" state="${this.currentState}"`)}
        `;
    },

    //Generate the script that will be executed when the dashbored loads
    generateOnload: function (htmlId, lockedAccess, alwaysPassword, ask, askText) {
        return `
            ${this.util.getElement(htmlId, "button")}.onclick = function(event) {
                var yesAction = function() {
                    sendMsg("${this.id}", event.target.getAttribute("state") == "${this.onValue}" ? "${this.offValue}" : "${this.onValue}");
                }
                var noAction = function(){console.log("no");}

                ${this.util.generateWidgetAction(lockedAccess, alwaysPassword, ask, askText, "yesAction", "noAction")}
            } 
            
            //Hide the element initially if required
            if(locked) {
                ${lockedAccess == "no" ? "hideShowElement('" + htmlId + "', false);" : ""}
            }
        `;
    },

    //Generate the script that will be called when a message comes from NodeRed on the dashbored
    generateOnMsg: function (htmlId) {
        return `
            ${this.util.getElement(htmlId, "button")}.setAttribute("state", msg.payload);
            if(msg.payload == "${this.onValue}") {
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
