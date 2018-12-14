const fs = require("fs");
const url = require("url");
const path = require("path");
global.fetch = require("node-fetch");
const tf = require("@tensorflow/tfjs");
require("@tensorflow/tfjs-node");
const PythonShell = require("python-shell").PythonShell;

/** Generic class for Machine Learning models
 *
 */
class MLModel {}

/** Class for handling TensorFlow models
 *
 */
class TFModel extends MLModel {
    constructor() {
        super();
    }

    loadTFModel(modelUrl) {
        return tf.loadModel(modelUrl)
            .then((mod) => {
                this.arch = mod;
            })
            .catch((err) => {
                throw new Error(`Error downloading the model! ${err}`);
            });
    }

    predict(values, shape) {
        let data = tf.tensor(values, shape);
        if (this.arch) return this.arch.predict(data).data();
    }
}

/** Class for handling Python Scikit-learn models
 *
 */
class SKModel extends MLModel {
    constructor(modelLoader, modelUrl) {
        super();
        this.modelLoader = modelLoader;
        this.modelUrl = modelUrl;
        this.fileName = "localLoader.py";
        // remove potential models that has been downloaded before
        if (fs.existsSync(path.join(__dirname, this.fileName)))
            fs.unlinkSync(path.join(__dirname, this.fileName));
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

        if (fs.existsSync(path.join(__dirname, this.fileName))) return new Promise(performPrediction);
        else return new Promise((rs, rj) => rj(new Error("Missing loader file!")));
    }
}

module.exports = {
    MLModel : MLModel,
    TFModel: TFModel,
    SKModel: SKModel
};