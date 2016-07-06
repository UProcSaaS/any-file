var options = {
	from: {
		s3: {
			username: "aws_access_key",
			password: "aws_secret_key"
		}
	}
};
var anyfile = require('.')(options);

anyfile.from("s3://s3.amazonaws.com/bucket/path/to/file.gz").to("file.gz", function(res) {
	console.log("finished");
});