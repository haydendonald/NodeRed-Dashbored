/**
 * A basic clock widget for the dashbored project
 * This will add a clock widget which just simply displays the current time
 * https://github.com/haydendonald/NodeRed-Dashbored
 */
module.exports = {
    widget: "clock",
    version: "0.0.1",
    label: "Simple Clock",
    description: "Shows a basic clock",
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
                <p>There is no configuration for this widget :)</p>
                `;
            }(),
            //Scripts to call on the NodeRed config dashbored
            configScript: {
                oneditprepare: undefined,
                oneditsave: undefined,
                oneditcancel: undefined,
                reset: undefined
            },
            //Default config
            defaultConfig: {},
            config: {},

            //Setup the widget
            setupWidget: function () { },

            //Send a message to the NodeRed flow (Will be allocated by widget.js)
            sendToFlow: function (msg) { },

            //Send a message to the widgets in the NodeRed flows (Will be allocated by widget.js)
            sendToDashbored: function (id, payload) { },

            //When node red redeploys or closes
            onClose: function () { },

            //When a message comes from the dashbored
            onMessage: function (msg) { },

            //When a message comes from a node red flow
            onFlowMessage: function (msg) { },

            //Generate the CSS for the widget
            generateCSS: function (htmlId) {
                return `
                    #${htmlId}_clock {
                        text-align: center;
                        margin: 5px;
                    }
                `;
            },

            //Generate the HTML for the widget that will be inserted into the dashbored
            generateHTML: function (htmlId) {
                return `
                    ${this.util.generateTag(htmlId, "h1", "clock", this.config.text)}
                `;
            },

            //Generate the script that will be executed when the dashbored loads
            generateOnload: function (htmlId, lockedAccess, alwaysPassword, ask, askText) {
                return `
                    setInterval(function() {
                        ${this.util.getElement(htmlId, "clock")}.innerHTML = formatAMPM(new Date());
                    }, 500);
                `;
            },

            //Generate the script that will be called when a message comes from NodeRed on the dashbored
            generateOnMsg: function (htmlId) {return "";},

            //Generate any extra scripts to add to the document
            generateScript: function () { },

            //Generate the CSS specified by the user in the node configuration
            generateCustomCSS: function () { return "";}
        }
    }
}