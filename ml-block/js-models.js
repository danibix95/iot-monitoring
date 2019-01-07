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
    /** Create an instance of a TFModel (a TensorFlow model) */
    constructor() {
        super();
    }

    /** Load into current instance the model architecture and weights
     *  that have been passed in the given URL.
     *
     * @param modelUrl  The URL where to find the model architecture.
     *                  **NOTE:** TFModel implementation accepts only TensorFlow models
     *                  that have been saved for TensorFlow JS with Keras format.
     *                  Moreover, while it is expected that given URL points to the JSON architecture representation,
     *                  in the same folder there should also be the list of shards
     *                  that represents model parameters saved in binary form.
     * @returns {Promise<Model | never>}
     */
    loadTFModel(modelUrl) {
        return tf.loadModel(modelUrl)
            .then((mod) => {
                this.arch = mod;
            })
            .catch((err) => {
                throw new Error(`Error downloading the model! ${err}`);
            });
    }

    /** Execute loaded model on given input values and return its prediction outcome
     *
     * @param values    the values passed in input to the model
     * @param shape     the shape of values parameter (e.g. 1-D vector, 2-D vector, ...)
     *                  usually it has the following form: [number of sample, dim1, [dim2, ] ...]
     * @returns {*}     the value predicted by the model
     */
    predict(values, shape) {
        let data = tf.tensor([...values], shape);
        if (this.arch) return this.arch.predict(data).data();
    }
}

/** Class for handling Python Scikit-learn models */
class SKModel extends MLModel {
    /** Create an instance of a SKModel (Scikit-Learn model)
     *
     * @param modelLoader   the url from which download the python model loader
     * @param modelUrl      the url from which download the pre-trained python model
     */
    constructor(modelLoader, modelUrl) {
        super();
        this.modelLoader = modelLoader;
        this.modelUrl = modelUrl;
        this.fileName = "localLoader.py";
        // remove potential models that has been downloaded before
        if (fs.existsSync(path.join(__dirname, this.fileName)))
            fs.unlinkSync(path.join(__dirname, this.fileName));
    }

    /** Perform the downloading of the sci-kit learn model loader.
     *  This is a python script that will be used to run the pre-trained model
     *
     * @returns {Promise<any>}
     */
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

    /** Execute the previous downloaded script with given parameters
     *  and return the predicted value.
     *
     * @param values    the values passed in input to the model
     * @param shape     the shape of values parameter (e.g. 1-D vector, 2-D vector, ...)
     *                  usually it has the following form: [number of sample, dim1, [dim2, ] ...]
     * @returns {Promise<any>} the predicted value after the promise is fulfilled
     */
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