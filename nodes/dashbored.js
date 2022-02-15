module.exports = function(RED)
{
    function dashbored(config)
    {
        RED.nodes.createNode(this, config);
        var node = this;

        var name = config.name || "dashbored";
        var endpoint = config.endpoint || name.toLowerCase();
        console.log(this);
        var rootFolder = path.join(RED.settings.userDir + "/node_modules/nodered-bashbored");

        RED.log.info(`Created Dashbored [${name}] at /${endpoint}`);

        //console.log(RED);

        // console.log(RED.server);
        // console.log(RED.httpNode); //ExpressJS server


        //Bind our pages
        var sendError = (res) => {
            res.type("text/plain");
            res.status(500);
            res.send("500 - Internal Server Error");
        };

        //Generate the dashboard and send it
        RED.httpNode.get(`/${endpoint}`, (req, res) => {
            
            res.sendFile(path.join(__dirname, "/index.html"));
            
            //sendError(res);
        });

        console.log(rootFolder);
        //console.log(RED.settings);
        //console.log(RED.server.get);


        //On redeploy
        node.on("close", () => {});
    }
    
    RED.nodes.registerType("dashbored-dashbored", dashbored);
}
