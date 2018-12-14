const should = require("should");
const helper = require("node-red-node-test-helper");
const mlLoaderNode = require("../ml-loader.js");
const models = require("../js-models");
global.fetch = require("node-fetch");

helper.init(require.resolve('node-red'));

describe('ml-loader Node', function () {
    afterEach(function () {
        helper.unload();
    });

    it('should be loaded', function (done) {
        let flow = [
            {
                id: "n1",
                type: "ml-loader",
                name: "test-name",
                mtype : { value : "" },
                msource : { value: "url", required: true},
                url : { value: ""},
                file : {value: ""}
            }
        ];
        helper.load(mlLoaderNode, flow, function () {
            let n1 = helper.getNode("n1");
            should.exists(n1);
            n1.should.have.property("name", "test-name");
            done();
        });
    });

    it("should be able to load a TF model from given url", function (done) {
        this.timeout(5000);
        let flow = [
            {
                id: "n1",
                type: "ml-loader",
                name: "test-name",
                mtype : "tensorflow",
                modelurl : "http://localhost:30000/webModel/keras_model.json",
            }
        ];

        helper.load(mlLoaderNode, flow, function () {
            let n1 = helper.getNode("n1");
            should.exists(n1);

            n1.model.arch.should.be.Promise();

            return n1.model.arch.should.be.fulfilled();
        });
    });

    it("should be able to load a python scikit-learn model from given url", function (done) {
        this.timeout(5000);
        let flow = [
            {
                id: "n1",
                type: "ml-loader",
                name: "test-name",
                mtype : "sklearn",
                modelurl : "http://localhost:30000/model.joblib",
                loaderurl : "http://localhost:30000/loader.py"
            }
        ];

        helper.load(mlLoaderNode, flow, function () {
            let n1 = helper.getNode("n1");
            should.exists(n1);
            n1.model.should.instanceOf(models.SKModel);
            done();
        });
    });

    it("should return a payload that contains the python scikit-learn model output", function (done) {
        this.timeout(5000);
        let flow = [
            {
                id: "n1",
                type: "ml-loader",
                name: "test-name",
                mtype : "sklearn",
                modelurl : "http://localhost:30000/model.joblib",
                loaderurl : "http://localhost:30000/loader.py"
            },
            { id: "n2", type: "helper" }
        ];

        helper.load(mlLoaderNode, flow, function () {
            let n1 = helper.getNode("n1");
            let n2 = helper.getNode("n2");

            n2.on("input", function (msg) {
                msg.should.have.property("payload");
                msg.payload.should.have.property("prediction").which.is.not.undefined();
                (msg.payload.prediction[0] - 10).should.be.below(0.00001);
                done();
            });

            n1.receive({ payload: { values : [5], shape: [-1,1] } });
        });
    });
});
