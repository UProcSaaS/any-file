'use strict';

/**
 * Module dependencies.
 */

var s3 = require('s3-download'),
		http = require('request'),
		ftp = require('jsftp');

/**
 * Export `Cacheman`.
 */

module.exports = AnyDownload;

function AnyDownload(options) {
	this.protocol = "";
};

AnyDownload.prototype.download = function(sourceFile, destinationFile, callback) {
	this.sourceFile = sourceFile;
	this.destinationFile = destinationFile;
	this.__setProtocol(sourceFile);
	this.__download(callback);
};


AnyDownload.prototype.__setProtocol = function() {
	if (this.sourceFile.indexOf("s3://") === 0) {
		this.protocol = "s3";
  } else if (this.sourceFile.indexOf("ftp://") === 0) {
		this.protocol = "ftp";
  } else if (this.sourceFile.indexOf("http://") === 0) {
		this.protocol = "http";
  }
};

AnyDownload.prototype.__download = function(callback) {
	if (this.protocol === 's3') {
		this.__downloadS3(callback);
	} else if (this.protocol === 'ftp') {
		this.__downloadFtp(callback);
	} else if (this.protocol === 'http') {
		this.__downloadHttp(callback);
	}
};

AnyDownload.prototype.__downloadS3 = function(callback) {
	callback(null, true);
};

AnyDownload.prototype.__downloadHttp = function(callback) {
	callback(null, true);
};

AnyDownload.prototype.__downloadFtp = function(callback) {
	callback(null, true);
};