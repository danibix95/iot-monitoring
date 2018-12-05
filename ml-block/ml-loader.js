global.fetch = require("node-fetch");
const tf = require("@tensorflow/tfjs");

// tensorflow binding for node js
require("@tensorflow/tfjs-node");

class MLModel {
    constructor(arch = undefined) {
        this._arch = arch;
    }

    set arch(model) {
        this._arch = model;
    }

    predict(data) {
        if (this._arch) return this._arch.predict(data);
    }
}

module.exports = function (RED) {
    const contextModel = "mlModel";
    "use strict";
    function MLLoaderNode(config) {
        RED.nodes.createNode(this, config);

        let node = this;
        // let nodeContext = node.context();
        // assign user configuration to current block
        node.mtype = config.mtype;
        node.url = config.url;

        loadModel(node);
        // input event => called every time a message arrives to this node
        node.on("input", function (msg) {
            // sample = [ .... ] , shape = [n1, n2]
            let sample = tf.tensor2d(msg.payload.sample, msg.payload.shape);

            let prediction;
            if (typeof node.model === "undefined") {
                node.error("ML model is not loaded!");
            }
            else {
                prediction = applyModel(node, sample);
            }

            // update the message
            msg.payload = { prediction : prediction };
            // this function is necessary to let messages go ahead along the flow
            node.send(msg);
        });

        /** Check whether all the required details are available
        *   and then load given machine learning model
        */
        function loadModel(node) {
            if (node.mtype && node.url) {
                node.status({ fill: "blue", shape: "dot", text: "Model loading..." });
                // NOTE: at the end the only possible way to load a pre-trained machine learning model
                // into a node red block is to load it from a known URL

                return tf.loadModel(node.url)
                    .then((mod) => {
                        node.status({ fill: "green", shape: "dot", text: "Model loaded!" });
                        node.model = new MLModel(mod);
                    }).catch((error) => {
                        node.status({ fill: "red", shape: "dot", text: "Error loading model!" });
                        node.error(`Something went wrong: ${error}`);
                    });
            }
            else {
                node.status({ fill: "red", shape: "ring", text: "Model not loaded!" });
                node.error("Impossible to load an empty model! Assign one to the block.");
            }
        }

        /** Apply loaded model onto given data and return model prediction
        *   
        */
        function applyModel(node, data) {
            return node.model.predict(data);
        }
    }

    RED.nodes.registerType("ml-loader", MLLoaderNode);
};
