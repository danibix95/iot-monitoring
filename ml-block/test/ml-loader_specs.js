const should = require("should");
const helper = require("node-red-node-test-helper");
const mlLoaderNode = require("../ml-loader.js");
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

    it("should be able to load a model from given url into the node context", function (done) {
        this.timeout(5000);
        let flow = [
            {
                id: "n1",
                type: "ml-loader",
                name: "test-name",
                mtype : "tensorflow",
                msource : "url",
                url : "https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json",
                file : ""
            }
        ];

        helper.load(mlLoaderNode, flow, function () {
            let n1 = helper.getNode("n1");
            should.exists(n1);

            n1.mlModel.should.be.Promise();
            
            return n1.mlModel.should.be.fulfilled();
            // return p.then((result) => {
            //     result.should.not.be.undefined();
            // })
            // .catch((error) => { console.error(error); });
        });
    });

    it("should return a payload that contains the model output", function (done) {
        this.timeout(5000);
        let flow = [
            {
                id: "n1",
                type: "ml-loader",
                name: "test-name",
                mtype : { value : "tensorflow" },
                msource : { value: "file", required: true},
                url : { value: "https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json"},
                file : {value: ""},
                wires: [["n2"]]
            },
            { id: "n2", type: "helper" }
        ];

        helper.load(mlLoaderNode, flow, function () {
            let n2 = helper.getNode("n2");
            let n1 = helper.getNode("n1");
            n2.on("input", function (msg) {
                msg.should.have.property("payload");
                msg.payload.should.have.property("prediction").which.is.not.undefined();
                done();
            });
            n1.receive({ payload: 0 });
        });
    });
});
