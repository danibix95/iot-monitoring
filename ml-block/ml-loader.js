module.exports = function(RED) {
    function MLLoaderNode(config) {
        // set node commons functionalities
        RED.nodes.createNode(this, config);

        // this node functionalities implementation
        let node = this;
        node.mtype = config.mtype;
        
        loadModel(node);
        // input event => called every time a message arrives to this node
        node.on("input", function(msg) {
            let prediction = applyModel(node, []);

            // update the message
            msg.payload = { prediction : prediction };
            // this function is necessary to let messages go ahead along the flow
            node.send(msg);
        });
    }

    /** Check whether all the required details are available
    *   and then load the specified machine learning model
    */
    function loadModel(node) {
        console.log("fernihgb", node);
        if (node.mtype && (node.url || node.file)) {
            node.status({ fill: "green", shape: "dot", text: "Model loaded!" });
        }
        else {
            node.status({ fill: "red", shape: "ring", text: "Model not loaded!" });
        }
    }

    /** Apply the loaded model onto given data and return model prediction
    *   
    */
    function applyModel(node, data) {
        return 0;
    }

    RED.nodes.registerType("ml-loader", MLLoaderNode);
}
