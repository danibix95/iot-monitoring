const should = require("should");
const helper = require("node-red-node-test-helper");
const mlLoaderNode = require("../ml-loader.js");

helper.init(require.resolve('node-red'));

describe('ml-loader Node', function () {
    afterEach(function () {
        helper.unload();
    });

    it('should be loaded', function (done) {
        let flow = [{ id: "n1", type: "ml-loader", name: "test-name" }];
        helper.load(mlLoaderNode, flow, function () {
            let n1 = helper.getNode("n1");
            n1.should.have.property('name', 'test-name');
            done();
        });
    });

    it("should return a payload that contains the model output", function (done) {
        let flow = [
            {
                id: "n1",
                type: "ml-loader",
                name: "test-name",
                mtype : { value : "tensorflow" },
                msource : { value: "file", required: true},
                url : { value: "http://google.com"},
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
