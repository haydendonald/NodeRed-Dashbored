/**
 * Render a basic text element
 */

module.exports = function(RED)
{
    function node(config)
    {
        RED.nodes.createNode(this, config);
        var node = this;
        var dashbored = RED.nodes.getNode(config.dashbored);

        dashbored.addNodeMsgFunction((topic, payload) => {
            node.send({
                "topic": topic,
                "payload": payload
            });
        });

        //On input fron the flow
        node.on("input", (msg) => {
            if(msg.payload != undefined) {
                switch(msg.payload.action) {
                    case "lock": {
                        dashbored.lockDashbored(msg.payload.id);
                        break;
                    }
                    case "unlock": {
                        dashbored.unlockDashbored(msg.payload.id);
                        break;
                    }
                    case "reload": {
                        dashbored.reloadDashbored(msg.payload.id);
                        break;
                    }
                }
            }
        });

        //On redeploy
        node.on("close", () => {});
    
    }

    RED.nodes.registerType("dashbored-node", node);
}
