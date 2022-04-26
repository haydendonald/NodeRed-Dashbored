/**
 * Include widgets for the NodeRed dashbored project
 * https://github.com/haydendonald/NodeRed-Dashbored
 */

//Add widget requires here to include the widget
module.exports = [
    require("../widgets/toggleButton.js"),
    require("../widgets/buttonSelector.js"),
    require("../widgets/horizontalStack.js"),
    require("../widgets/verticalStack.js"),
    require("../widgets/volume.js"),
    require("../widgets/actionButton.js")
]