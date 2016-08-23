var AnyFile = require('../'),
    anyfile;

anyfile = new AnyFile();

anyfile.from("scp://demo:password@test.rebex.net/readme.txt").to("readme_local.txt", function(err, res) {
	console.log('done!');
});