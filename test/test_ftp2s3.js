var assert = require('assert'),
    AnyFile = require('../'),
    anyfile;

anyfile = new AnyFile();

anyfile.from("scp://demo:password@test.rebex.net/readme.txt").to("s3://AKIAIZHM3T2QFIRSVQ5A:gxxxYv+PuyihUrg0EqJ8U1C0pxBwxZGPO0U2DuhX@s3.amazon.com/any-file-us/readme.txt", function(err, res) {
	console.log('done!');
});