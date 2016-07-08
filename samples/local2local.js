var anyfile = require(__dirname + '/..')();
var fromFile = "/etc/hosts";
var toFile = "hosts.new";

try {
  anyfile.from(fromFile).to(toFile, function(err, res) {
    console.log(err +"-" + res);
  });
} catch (err) {
  console.log(err);
}
