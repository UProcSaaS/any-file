var anyfile = require('.')();

anyfile.from("s3://accesskey:secretkey@bucket:/path/to/file.csv").to("file.csv", function(res) {
	console.log("finished");
});