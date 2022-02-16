
module.exports = function (RED) {

    function widget(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var name = config.name || "dashbored";
        var endpoint = config.endpoint || name.toLowerCase();
        var server = RED.nodes.getNode(config.server);

        //When a message is received from the dashbored
        var onMessage = (data) => {
            if (data.id == node.id) {
                console.log(`WIDGET ${data}`);
            }
        }

        ///////////////////////

        node.generateHTML = () => {
            return `
            <h1>Hello World!</h1>
            
            `;




        }

        //Add this dashboard to the server
        server.addWidget({
            id: node.id,
            name,
            onMessage
        });

        //On redeploy
        node.on("close", () => { });
    }

    RED.nodes.registerType("dashbored-widget", widget);
}