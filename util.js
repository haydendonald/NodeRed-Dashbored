module.exports = {
    /**
     * Create a tag with id
     * <[TAG] id=[ID] [ATTRIBUTES]>[INNER]</[TAG]>
     * @param {The node element} node 
     * @param {The tag to create} tag 
     * @param {The element name} elementName
     * @param {The content inside the tag} inner 
     * @param {Any extra attributes to add} attributes 
     */
    generateTag: (node, tag, elementName, inner, attributes = "") => {
        return `<${tag} id="${node.id.split(".")[0]}_${elementName}" ${attributes}>${inner}</${tag}>`;
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
        return `${selector}${node.id.split(".")[0]}_${name} ${inner}`;
    },

    /**
     * Generate the class name with the use of generate CSS
     * @param {The node element} node 
     * @param {The name of the class to use} name 
     */
    generateCSSClass: (node, name) => {
        return `${node.id.split(".")[0]}_${name}`;
    },

    /**
     * 
     * @param {The node element} node 
     * @param {The name of the element} elementName 
     */
    getElement: (node, elementName) => {
        return `document.getElementById("${node.id.split(".")[0]}_${elementName}")`;
    },

    // /**
    //  * 
    //  * @param {The node element} node 
    //  * @param {The message object to send} msg 
    //  */
    // sendMsg: (node, msg) => {
    //     return `sendNodeMsg("${node.id}", ${msg})`;
    // }

    // generateOnLoadScript: (node, fn) => {
    //     return `addOnLoadFunction(() => {
    //         print("debug", "onload triggered - ${node.name} (${node.id})");
    //         ${fn}
    //     });`;
    // }
}