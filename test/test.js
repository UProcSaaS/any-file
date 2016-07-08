var fs = require('fs'),
    assert = require('assert'),
    AnyFile = require('../'),
    anyfile;

describe('anyfile', function () {
  this.timeout(10000);//10 seconds
  
  beforeEach(function(done){
    anyfile = new AnyFile();
    done();
  });

  afterEach(function(done){
    done();
  });

  it('should have main methods', function () {
    assert.ok(anyfile.from);
  });

  it('ftp copy to local', function (done) {
    anyfile.from("ftp://anonymous:miemail%40gmail.com@speedtest.tele2.net/100KB.zip").to("100KB.zip", function(err, res) {
      if (fs.exists('100KB.zip')) {
        fs.unlinkSync('100KB.zip');
      }
      assert.ok(res);
      done();
    });
  });

  it('http copy to local', function (done) {
    anyfile.from("http://speedtest.tele2.net/100KB.zip").to("100KB.zip", function(err, res) {
      if (fs.exists('100KB.zip')) {
        fs.unlinkSync('100KB.zip');
      }
      assert.ok(res);
      done();
    });
  });

  it('http auth copy to local', function (done) {
    anyfile.from("http://anonymous:miemail%40gmail.com@speedtest.tele2.net/100KB.zip").to("100KB.zip", function(err, res) {
      if (fs.exists('100KB.zip')) {
        fs.unlinkSync('100KB.zip');
      }
      assert.ok(res);
      done();
    });
  });

  it('sftp copy to local', function (done) {
    anyfile.from("scp://demo:password@test.rebex.net:/readme.txt").to("readme.txt", function(err, res) {
      if (fs.exists('readme.txt')) {
        fs.unlinkSync('readme.txt');
      }
      assert.ok(res);
      done();
    });
  });

  it('sftp copy to s3', function (done) {
    anyfile.from("scp://demo:password@test.rebex.net/readme.txt").to("s3://AKIAIZHM3T2QFIRSVQ5A:gxxxYv+PuyihUrg0EqJ8U1C0pxBwxZGPO0U2DuhX@s3.amazon.com/any-file-us/readme.txt", function(err, res) {
      if (fs.exists('readme.txt')) {
        fs.unlinkSync('readme.txt');
      }
      assert.ok(res);
      done();
    });
  });

  it('s3 copy to s3', function (done) {
    anyfile.from("s3://AKIAIZHM3T2QFIRSVQ5A:gxxxYv+PuyihUrg0EqJ8U1C0pxBwxZGPO0U2DuhX@s3.amazon.com/any-file-us/readme.txt").to("s3://AKIAIZHM3T2QFIRSVQ5A:gxxxYv+PuyihUrg0EqJ8U1C0pxBwxZGPO0U2DuhX@s3.amazon.com/any-file-us/readme-final.txt", function(err, res) {
      if (fs.exists('readme.txt')) {
        fs.unlinkSync('readme.txt');
      }
      assert.ok(res);
      done();
    });
  });
});
