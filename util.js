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
     * @param {widget} node The node element
     * @param {string} selector The selector for example . for class or # for id
     * @param {string} name The name
     * @param {string} inner The actual CSS content
     * @returns 
     */
    generateCSS: (node, selector, name, inner) => {
        return `${selector}n${node.id.split(".")[0]}_${name} ${inner}`;
    },

    /**
     * Generate the class name with the use of generate CSS
     * @param {widget} node The node element
     * @param {string} name The name of the class to use
     */
    generateCSSClass: (node, name) => {
        return `n${node.id.split(".")[0]}_${name}`;
    },

    /**
     * 
     * @param {string} id The node element random id
     * @param {string} elementName The name of the element
     */
    getElement: (id, elementName) => {
        return `document.getElementById("${id}_${elementName}")`;
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
    }
}