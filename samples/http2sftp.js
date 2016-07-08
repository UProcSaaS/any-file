var anyfile = require(__dirname + '/..')();
var fromFile = "http://anonymous:miemail%40gmail.com@speedtest.tele2.net/100KB.zip";
var toFile = "scp://myuser@mysshserver.com:~/100KB.zip";

try {
  anyfile.from(fromFile).to(toFile, function(err, res) {
    console.log(err);
  });
} catch (e) {
  console.log(e);
}