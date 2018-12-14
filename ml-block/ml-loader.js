global.fetch = require("node-fetch");
const tf = require("@tensorflow/tfjs");
const models = require("./js-models");

// tensorflow binding for node js
require("@tensorflow/tfjs-node");

module.exports = function (RED) {
    "use strict";
    function MLLoaderNode(config) {
        RED.nodes.createNode(this, config);

        let node = this;
        // let nodeContext = node.context();
        // assign user configuration to current block
        node.mtype = config.mtype;
        node.modelurl = config.modelurl;
        node.weightsurl = config.weightsurl;
        node.loaderurl = config.loaderurl;

        loadModel(node)
            .then((res) => {
                if (res !== null) node.status({fill: "green", shape: "dot", text: "Model loaded!"});
            }).catch((error) => {
                node.status({fill: "red", shape: "dot", text: "Error loading model!"});
                node.error(`Error loading the model: ${error}`);
                throw new Error(`Loading error: ${error}`);
            });
        // input event => called every time a message arrives to this node
        node.on("input", function (msg) {
            msg.payload.prediction = undefined;
            if (typeof node.model === "undefined") {
                node.error("ML model is not loaded!");
                node.send(msg);
            }
            else {
                node.model.predict(msg.payload.values, msg.payload.shape)
                    .then((prediction) => {
                        if (typeof prediction === "string") {
                            msg.payload.prediction = JSON.parse(prediction);
                        }
                        else {
                            msg.payload.prediction = prediction;
                        }
                        node.send(msg);
                    })
                    .catch((error) => {
                        node.warn(`Error performing prediction: ${error}`);
                        node.send(msg);
                    });
            }
        });

        /** Check whether all the required details are available
        *   and then load given machine learning model
        */
        function loadModel(node) {
            if (node.mtype && node.modelurl) {
                node.status({fill: "blue", shape: "dot", text: "Model loading..."});
                // NOTE: at the end the only possible way to load a pre-trained machine learning model
                // into a node red block is to load it from a known URL

                switch (node.mtype) {
                    case "tensorflow":
                        node.model = new models.TFModel();
                        return node.model.loadTFModel(node.modelurl, node.weightsurl);
                    case "sklearn":
                        if (node.loaderurl) {
                            node.model = new models.SKModel(node.loaderurl, node.modelurl);
                            return node.model.downloadLoader();
                        }
                        else {
                            node.status({fill: "red", shape: "ring", text: "Model not loaded!"});
                            node.error("Impossible to load a model without its loader!");
                        }
                        break;
                    default: {
                        node.status({fill: "yellow", shape: "ring", text: "No handler for selected model type!"});
                        return null;
                    }
                }
            }
            else {
                node.status({fill: "red", shape: "ring", text: "Model not loaded!"});
                node.error("Impossible to load an empty model! Assign one to the block.");
            }
        }
    }

    RED.nodes.registerType("ml-loader", MLLoaderNode);
};
