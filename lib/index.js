'use strict';

/**
 * Module dependencies.
 */

var url = require('url'),
		fs = require('fs'),
		AWS = require('aws-sdk'),
		s3download = require('s3-download'),
		http = require('http'),
		jsftp = require('jsftp'),
		scpClient = require('scp2'),
		EventEmitter = require('events');

class MyEmitter extends EventEmitter {}
/**
 * Export `AnyFile`.
 */

module.exports = AnyFile;

function AnyFile(opt) {
	var fromProtocol = "";
	var toProtocol = "";
	var fromFile = "";
	var toFile = "";
	var myEmitter = new MyEmitter();
	var options = opt || {};

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
		} else if (fromProtocol === 'sftp' || fromProtocol === 'scp') {
			__downloadSftp(callback);
		}
	};

	var __downloadSftp = function(callback) {
		var parsed = url.parse(fromFile);
		var host = parsed.host;
		var port = parsed.port || 22;
		var auth = parsed.auth;
		var username = auth && auth.indexOf(":") !== -1 ? auth.split(":")[0] : "";
		var password = auth && auth.indexOf(":") !== -1 ? auth.split(":")[1] : "";
		var remoteFile = parsed.path;
	 	myEmitter.emit('start');
		scpClient.scp({
		    host: host,
		    username: username,
		    password: password,
		    path: remoteFile
		}, toFile, function(err) {
		 	myEmitter.emit('end');
		 	callback(err, !err);
		});
	};

	var __downloadS3 = function(callback) {
		var parsed = url.parse(fromFile);
		var host = parsed.host;
		var port = parsed.port || 21;
		var auth = parsed.auth;
		var username = auth && auth.indexOf(":") !== -1 ? auth.split(":")[0] : "";
		if (username === '' && options && options.from && options.from.s3 && options.from.s3.username) {
			username = options.from.s3.username;
		}
		var password = auth && auth.indexOf(":") !== -1 ? auth.split(":")[1] : "";
		if (password === '' && options && options.from && options.from.s3 && options.from.s3.password) {
			password = options.from.s3.password;
		}
		var data = parsed.path.split("/");
		var bucket = data[1];
		var remoteFile = data.slice(2).join("/");

		if (username !== "" && password !== "" && bucket !== "" && remoteFile !== "") {
			var s3client = new AWS.S3({
			    accessKeyId: username, 
			    secretAccessKey: password
			});

			try {
				var params = {
				    Bucket: bucket,      
				    Key: remoteFile 
				};

				var sessionParams = {
				    maxPartSize: 20 * 1024 * 1024,//default 20MB 
				    concurrentStreams: 5,//default 5 
				    maxRetries: 3,//default 3 
				    totalObjectSize: 1024 * 1024 //TODO: get Object size
				}
				var downloader = require('s3-download')(s3client);
				
			 	myEmitter.emit('start');
				var d = downloader.download(params, sessionParams);
				d.on('error',function(err){
			  	myEmitter.emit('error', err);
					if (callback) {callback(null, false);}
				});

				d.on('part',function(dat){
					myEmitter.emit('part');
					console.log('part');
				});

				d.on('downloaded',function(dat){
					myEmitter.emit('end');
					if (callback) {callback(null, true);}
				});

				var w = fs.createWriteStream(toFile);
				d.pipe(w);
			}	catch (e) {
		  	myEmitter.emit('error', e);
				if (callback) {callback(e, !e);}
			}		
		} else {
			if (callback) {callback(null, false);}
		}
	};

	var __downloadHttp = function(callback) {
		var file = fs.createWriteStream(toFile);

  	myEmitter.emit('start');
	  var request = http.get(fromFile, function(response) {
	    response.pipe(file);
	    file.on('finish', function() {
	      file.close(function(res) {
			  	myEmitter.emit('end');
					if (callback) {callback(null, true);}
	      });
	    });
	  }).on('error', function(err) {
	    fs.unlink(dest);
	  	myEmitter.emit('error', err);
			if (callback) {callback(err, false);}
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

  	myEmitter.emit('start');
		ftp.get(remoteFile, toFile, function(err) {
	  	myEmitter.emit('end', err);
			if (callback) {callback(err, !err);}
	  });
	};

	var __uploadFtp = function(callback) {
		var parsed = url.parse(toFile);
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

  	myEmitter.emit('start');
		ftp.put(fromFile, remoteFile, function(err) {
	  	myEmitter.emit('end', err);
			if (callback) {callback(err, !err);}
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

