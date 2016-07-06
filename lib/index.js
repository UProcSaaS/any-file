'use strict';

/**
 * Module dependencies.
 */

var url = require('url'),
		fs = require('fs'),
		AWS = require('aws-sdk'),
		s3download = require('s3-download'),
		http = require('http'),
		jsftp = require('jsftp');

/**
 * Export `AnyFile`.
 */

module.exports = AnyFile;

function AnyFile(options) {
  var fromProtocol = "";
	var toProtocol = "";
	var fromFile = "";
	var toFile = "";

	var __to = function(destinationFile, callback) {
		toFile = destinationFile;
		__download(callback);
	};

	var __isSupportedProtocol = function(file) {
		var supportedProtocols = ['s3', 'ftp', 'http', 'sftp', 'scp', 'file'];
		var protocol = __getProtocol(file);
		return supportedProtocols.indexOf(protocol) !== -1;
	};

	var __getProtocol = function(file) {
		var data = file.split(":");
		return data.length > 1 ? data[0] : "";
	};

	var __setProtocol = function(file) {
		if (__isSupportedProtocol(file)) {
			fromProtocol = __getProtocol(file);
		} else {
			fromProtocol = null;
		}
	};

	var __download = function(callback) {
		if (fromProtocol === 's3') {
			__downloadS3(callback);
		} else if (fromProtocol === 'ftp') {
			__downloadFtp(callback);
		} else if (fromProtocol === 'http') {
			__downloadHttp(callback);
		}
	};

	var __downloadS3 = function(callback) {
		var parsed = url.parse(fromFile);
		var host = parsed.host;
		var port = parsed.port || 21;
		var auth = parsed.auth;
		var username = auth.indexOf(":") !== -1 ? auth.split(":")[0] : "";
		var password = auth.indexOf(":") !== -1 ? auth.split(":")[1] : "";
		var remoteFile = parsed.path;
		
		var s3client = new AWS.S3({
		    accessKeyId: username,    //required 
		    secretAccessKey: password //required 
		});
		 
		var params = {
		    Bucket: host,        //required 
		    Key: remoteFile            //required 
		}
		var sessionParams = {
		    maxPartSize: 20,//default 20MB 
		    concurrentStreams: 5,//default 5 
		    maxRetries: 3,//default 3 
		    totalObjectSize: 100 //required size of object being downloaded 
		}
		var downloader = require('s3-download')(s3client);
		 
		var d = downloader.download(params, sessionParams);
		d.on('error',function(err){
			callback(null, false);
		});

		// dat = size_of_part_downloaded 
		d.on('part',function(dat){
		});

		d.on('downloaded',function(dat){
			callback(null, true);
		});

		var w = fs.createWriteStream(toFile);
		d.pipe(w);
		
		callback(null, true);
	};

	var __downloadHttp = function(callback) {
		var file = fs.createWriteStream(toFile);
	  var request = http.get(fromFile, function(response) {
	    response.pipe(file);
	    file.on('finish', function() {
	      file.close(function(res) {
			    callback(null, true);
	      });
	    });
	  }).on('error', function(err) {
	    fs.unlink(dest);
	    callback(null, false);
	  });
	};

	var __downloadFtp = function(callback) {
		var parsed = url.parse(fromFile);
		var host = parsed.host;
		var port = parsed.port || 21;
		var auth = parsed.auth;
		var username = auth.indexOf(":") !== -1 ? auth.split(":")[0] : "";
		var password = auth.indexOf(":") !== -1 ? auth.split(":")[1] : "";
		var remoteFile = parsed.path;

		var ftp = new jsftp({
		  host: host,
		  port: port, 
		  user: username, 
		  pass: password
		});

		ftp.get(remoteFile, toFile, function(err) {
			callback(err, !err);
	  });
	};



	var __from = function(sourceFile) {
		fromFile = sourceFile;
		__setProtocol(sourceFile);

		return {
			to: __to
		}
	};

	return {
		from: __from
	}
};

