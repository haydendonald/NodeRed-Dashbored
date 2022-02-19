module.exports = {
    /**
     * Create a tag with id
     * <[TAG] id=[ID] [ATTRIBUTES]>[INNER]</[TAG]>
     * @param {The node element random id} id 
     * @param {The tag to create} tag 
     * @param {The element name} elementName
     * @param {The content inside the tag} inner 
     * @param {Any extra attributes to add} attributes 
     */
    generateTag: (id, tag, elementName, inner, attributes = "") => {
        return `<${tag} id="${id}_${elementName}" ${attributes}>${inner}</${tag}>`;
    },

    /**
     * Generate the CSS
     * [SELECTOR][ID]_[NAME]: [INNER]
     * @param {The node element} node 
     * @param {The selector for example . for class or # for id} selector 
     * @param {The name} name 
     * @param {The actual CSS content} inner 
     * @returns 
     */
    generateCSS: (node, selector, name, inner) => {
        return `${selector}n${node.id.split(".")[0]}_${name} ${inner}`;
    },

    /**
     * Generate the class name with the use of generate CSS
     * @param {The node element} node 
     * @param {The name of the class to use} name 
     */
    generateCSSClass: (node, name) => {
        return `n${node.id.split(".")[0]}_${name}`;
    },

    /**
     * 
     * @param {The node element random id} id 
     * @param {The name of the element} elementName 
     */
    getElement: (id, elementName) => {
        return `document.getElementById("${id}_${elementName}")`;
    },

    //Generate a random string
    randString: () => {
        return "r" + (Math.random() + 1).toString(36).substring(2);
    },

    //Generate a string for the time with AM PM
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