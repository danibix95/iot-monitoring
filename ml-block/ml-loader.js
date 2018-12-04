/**/

module.exports = function(RED) {
    function MLLoaderNode(config) {
        // set node commons functionalities
        RED.nodes.createNode(this, config);

        // this node functionalities implementation
        let node = this;
        // input event => called every time a message arrives to this node
        node.on("input", function(msg) {
            msg.payload = msg.payload.toLowerCase();

            // this function is necessary to let messages go ahead along the flow
            node.send(msg);
        });
    }
    RED.nodes.registerType("ml-loader", MLLoaderNode);
}
