var fs = require('fs'),
    assert = require('assert')
  , AnyFile = require('../')
  , anyfile;

describe('anyfile', function () {

  beforeEach(function(done){
    if (fs.exists('100KB.zip')) {
      fs.unlinkSync('100KB.zip');
    }
    anyfile = new AnyFile();
    done();
  });

  afterEach(function(done){
    done();
  });

  it('should have main methods', function () {
    assert.ok(anyfile.from);
  });

  it('s3 download', function (done) {
    anyfile.from("s3://accesskey:secretkey@bucket:/path/to/file.csv").to("file.csv", function(err, res) {
      assert.ok(res);
      done();
    });
  });

  it('ftp download', function (done) {
    anyfile.from("ftp://anonymous:miemail%40gmail.com@speedtest.tele2.net/100KB.zip").to("100KB.zip", function(err, res) {
      assert.ok(res);
      done();
    });
  });

  it('http download', function (done) {
    anyfile.from("http://speedtest.tele2.net/100KB.zip").to("100KB.zip", function(err, res) {
      assert.ok(res);
      done();
    });
  });

  it('http auth download', function (done) {
    anyfile.from("http://anonymous:miemail%40gmail.com@speedtest.tele2.net/100KB.zip").to("100KB.zip", function(err, res) {
      assert.ok(res);
      done();
    });
  });
});
