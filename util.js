module.exports = {
    /**
     * Create a tag with id
     * <[TAG] id=[ID] [ATTRIBUTES]>[INNER]</[TAG]>
     * @param {string} id The node element random id
     * @param {string} tag The tag to create
     * @param {string} elementName The element name
     * @param {string} inner The element name
     * @param {string} attributes The element name
     */
    generateTag: (id, tag, elementName, inner, attributes = "") => {
        return `<${tag} id="${id}_${elementName}" ${attributes}>${inner}</${tag}>`;
    },

    /**
     * Generate the CSS
     * [SELECTOR][ID]_[NAME]: [INNER]
     * @param {string} id The node element random id
     * @param {string} selector The selector for example . for class or # for id
     * @param {string} name The name
     * @param {string} inner The actual CSS content
     * @returns 
     */
    generateCSS: (id, selector, name, inner) => {
        return `${selector}${id.split(".")[0]}_${name} ${inner}`;
    },

    /**
     * Generate the class name with the use of generate CSS
     * @param {string} id The node element random id
     * @param {string} name The name of the class to use
     */
    generateCSSClass: (id, name) => {
        return `${id.split(".")[0]}_${name}`;
    },

    /**
     * 
     * @param {string} htmlId The node element random html id
     * @param {string} elementName The name of the element
     */
    getElement: (htmlId, elementName) => {
        return `document.getElementById("${htmlId}_${elementName}")`;
    },

    /**
     * Generate a random string
     */
    randString: () => {
        return "r" + (Math.random() + 1).toString(36).substring(2);
    },

    /**
     * Generate a string for the time with AM PM
     * @param {Date} date The date object
     */
    formatAMPM: (date) => {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    },

    /**
     * Generate the widget action with locked, areYouSure functionality
     * @param {string} lockedAccess The locked access value
     * @param {string} alwaysPassword The always password value
     * @param {string} ask Should the ask dialog be shown
     * @param {string} askText What text should the ask dialog show
     * @param {string} actionYes The script to execute if the action is yes
     * @param {string} actionNo The script to execute if the action is no
     * @returns The script
     */
    generateWidgetAction: (lockedAccess, alwaysPassword, ask, askText, actionYes, actionNo) => {
        return `
        //Check if the user is sure
        var checkAreYouSure = function () {
            ${ask == "yes" ? "askAreYouSure(" + actionYes + ", " + actionNo + ", '" + askText + "');" : actionYes + "();"}
        }

        //Check for a password depending on what the options are
        if (!locked) {
            ${alwaysPassword == "yes" ? "askPassword(checkAreYouSure);" : "checkAreYouSure()"}
        }
        else {
            ${lockedAccess == "password" ? "if(locked){askPassword(checkAreYouSure);}" : ""}
            ${lockedAccess == "yes" ? "if(locked){askPassword(checkAreYouSure, undefined, true);}" : ""}
        }
        `;
    }
}