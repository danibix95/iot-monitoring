global.fetch = require("node-fetch");
const tf = require("@tensorflow/tfjs");
const spawn = require("child_process").spawn;
const fs = require('fs');
const path = require("path");
const PythonShell = require("python-shell").PythonShell;
const url = require("url");

// tensorflow binding for node js
require("@tensorflow/tfjs-node");

class MLModel {
    constructor(arch = null) {
        this._arch = arch;
    }

    set arch(model) {
        this._arch = model;
    }
}

class TFModel extends MLModel {
    constructor(arch) {
        super(arch);
    }

    predict(values, shape) {
        let data;
        if (this._arch) return this._arch.predict(data);
    }
}

class SKModel extends MLModel {
    constructor(arch, modelLoader, modelUrl) {
        super(arch);
        this.modelLoader = modelLoader;
        this.modelUrl = modelUrl;
        this.fileName = "localLoader.py";
        // remove potential models that has been downloaded before
        if (fs.existsSync(this.fileName)) fs.unlinkSync(this.fileName);
    }

    downloadLoader() {
        let caller;
        const loaderFile = fs.createWriteStream(path.join(__dirname, this.fileName));
        const URL = url.parse(this.modelLoader);
        const requestOptions = {
            host: URL.hostname,
            port: URL.port,
            path: URL.pathname
        };

        let download = (resolve, reject) => {
            if (URL.protocol.split(":")[0] === "http") {
                caller = require('http');
            }
            else if (URL.protocol.split(":")[0] === "https") {
                caller = require('https');
            }
            else {
                reject(new Error(`Impossible to handle given URL protocol: ${URL.protocol}`));
            }

            caller.get(requestOptions, (response) => {
                if (response.statusCode !== 200) {
                    if (response.statusCode === 404) reject("File not found");
                    else reject(`Download error: ${response.statusCode} ${response.statusMessage}`);
                }
                response.pipe(loaderFile);
            });

            loaderFile.on("finish", () => {
                loaderFile.close();
            });
            loaderFile.on("error", (error) => reject(error));
            loaderFile.on("close", (res) => resolve(res));
        };

        return new Promise(download);
    }

    predict(values, shape) {
        const scriptOptions = {
            mode: 'text',
            pythonPath: 'python',
            pythonOptions: ['-u'],
            scriptPath: __dirname,
            args: [this.modelUrl, ...shape, ...values]
        };

        let performPrediction = (resolve, reject) => {
            PythonShell.run(this.fileName, scriptOptions, function (err, results) {
                if (err) reject(err);

                resolve(results);
            });
        };

        return new Promise(performPrediction);
    }
}

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

        loadModel(node);
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
                        msg.payload.prediction = JSON.parse(prediction);
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
                        return tf.loadModel(tf.io.browserHTTPRequest(node.modelurl, node.weightsurl))
                            .then((mod) => {
                                node.status({fill: "green", shape: "dot", text: "Model loaded!"});
                                node.model = new TFModel(mod);
                            }).catch((error) => {
                                node.status({fill: "red", shape: "dot", text: "Error loading model!"});
                                node.error(`Error loading the model: ${error}`);
                            });
                    case "sklearn":
                        if (node.loaderurl) {
                            node.model = new SKModel(null, node.loaderurl, node.modelurl);
                            return node.model.downloadLoader()
                                .then(() => {
                                    node.status({fill: "green", shape: "dot", text: "Model loaded!"});
                                })
                                .catch((error) => {
                                    node.status({fill: "red", shape: "dot", text: "Error loading model!"});
                                    node.error(`Error loading the model: ${error}`);
                                })
                        }
                        else {
                            node.status({fill: "red", shape: "ring", text: "Model not loaded!"});
                            node.error("Impossible to load a model without its loader!");
                        }
                        break;
                    default: {
                        node.status({fill: "blue", shape: "ring", text: "Issues!"});
                        return undefined;
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
