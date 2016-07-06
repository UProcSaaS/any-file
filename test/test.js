var fs = require('fs'),
    assert = require('assert')
  , AnyDownload = require('../')
  , anydownload;

describe('anydownload', function () {

  beforeEach(function(done){
    anydownload = new AnyDownload();
    done();
  });

  afterEach(function(done){
    done();
  });

  it('should have main methods', function () {
    assert.ok(anydownload.download);
  });

  it('s3 download', function (done) {
    anydownload.download("s3://accesskey:secretkey@bucket:/path/to/file.csv", "file.csv", function(err, res) {
      assert.ok(res);
      done();
    });
  });

  it('ftp download', function (done) {
    anydownload.download("ftp://anonymous:miemail%40gmail.com@speedtest.tele2.net/100KB.zip", "100KB.zip", function(err, res) {
      assert.ok(res);
      fs.unlinkSync('100KB.zip');
      done();
    });
  });

  it('http download', function (done) {
    anydownload.download("http://mydomain.com/path/to/file.csv", "file.csv", function(err, res) {
      assert.ok(res);
      done();
    });
  });

  it('http auth download', function (done) {
    anydownload.download("http://username:password@mydomain.com/path/to/file.csv", "file.csv", function(err, res) {
      assert.ok(res);
      done();
    });
  });
});
