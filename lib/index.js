'use strict';

/**
 * Module dependencies.
 */

var s3 = ;

/**
 * Export `Cacheman`.
 */

module.exports = AnyDownload;

function AnyDownload(options) {
	this.protocol = "";
};

AnyDownload.prototype.download = function(sourceFile, destinationFile) {
	this.sourceFile = sourceFile;
	this.destinationFile = destinationFile;
	this.__setProtocol(sourceFile);
	this.__download();

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

AnyDownload.prototype.__download = function() {
	if (this.protocol === 's3') {
		this.__downloadS3();
	} else if (this.protocol === 'ftp') {
		this.__downloadFtp();
	} else if (this.protocol === 'http') {
		this.__downloadHttp();
	}
};

AnyDownload.prototype.__downloadS3 = function() {

};

AnyDownload.prototype.__downloadHttp = function() {

};

AnyDownload.prototype.__downloadFtp = function() {
	
};