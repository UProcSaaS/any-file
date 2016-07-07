'use strict';

/**
 * Module dependencies.
 */

var url = require('url'),
		util = require('util'),
		path = require('path'),
		fs = require('fs'),
		AWS = require('aws-sdk'),
		s3download = require('s3-download'),
		http = require('http'),
		jsftp = require('jsftp'),
		scpClient = require('scp2'),
		EventEmitter = require('events');

class MyEmitter extends EventEmitter {}
var myEmitter = new MyEmitter();

function AnyFile(opt) {
	var self = this;

	var fromProtocol = "";
	var toProtocol = "";
	var fromFile = "";
	var toFile = "";
	var temporalFile = "";

	
	var options = opt || {};

	var __to = function(destinationFile, callback) {
		toFile = destinationFile;
		__fromGeneric(callback);
	};

	var __isSupportedProtocol = function(file) {
		var supportedProtocols = ['s3', 'ftp', 'http', 'scp', 'file'];
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

	var __fromGeneric = function(callback) {
		if (fromProtocol === 's3') {
			__fromS3(callback);
		} else if (fromProtocol === 'ftp') {
			__fromFtp(callback);
		} else if (fromProtocol === 'http') {
			__fromHttp(callback);
		} else if (fromProtocol === 'scp') {
			__fromSftp(callback);
		}
	};

	var __toGeneric = function(callback) {
		console.log(toProtocol);
		if (toProtocol === 's3') {
			__toS3(callback);
		} else if (toProtocol === 'ftp') {
			__toFtp(callback);
		} else if (toProtocol === 'http') {
			__toHttp(callback);
		} else if (toProtocol === 'scp') {
			__toSftp(callback);
		}
	};

	var __parseUrl = function(file) {
		var parsed = url.parse(file);
		var host = parsed.host;
		var port = parsed.port;
		var auth = parsed.auth;
		var username = auth && auth.indexOf(":") !== -1 ? auth.split(":")[0] : "";
		var password = auth && auth.indexOf(":") !== -1 ? auth.split(":")[1] : "";
		if (!auth) {
			if (file.indexOf("@")) {
				var data = file.split("@")[0].split("/");
				auth = data[data.length - 1];
				username = auth && auth.indexOf(":") !== -1 ? auth.split(":")[0] : "";
				password = auth && auth.indexOf(":") !== -1 ? auth.split(":")[1] : "";
			}
		}
		var remoteFile = parsed.path;
	 	
	 	return {
	 		host: host,
	 		port: port,
	 		username: username,
	 		password: password,
	 		remoteFile: remoteFile
	 	};
	};
	
	var __fromSftp = function(callback) {
		var parsed = __parseUrl(fromFile);

		myEmitter.emit('start');
		scpClient.scp({
	    host: parsed.host,
	    username: parsed.username,
	    password: parsed.password,
	    path: parsed.remoteFile
		}, temporalFile, function(err) {
			if (!err) {
				myEmitter.emit('end');
		 	} else {
				myEmitter.emit('error', err);
		 	}
			callback(err, !err);
		});
	};

	var __toSftp = function(callback) {
		var parsed = __parseUrl(toFile);
		console.log(parsed);
		myEmitter.emit('start');
		scpClient.scp(temporalFile, {
	    host: parsed.host,
	    username: parsed.username,
	    password: parsed.password,
	    path: parsed.remoteFile
		}, function(err) {
			if (!err) {
				myEmitter.emit('end');
		 	} else {
				myEmitter.emit('error', err);
		 	}
			callback(err, !err);
		});
	};

	var __initS3 = function(file) {
		var parsed = __parseUrl(file);
		var host = parsed.host;
		var port = parsed.port;
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

			return {
				downloader: require('s3-download')(s3client),
				params: params,
				sessionParams: sessionParams
			}

		} else {
			throw new Error("invalid params");
		}
	};

	var __fromS3 = function(callback) {
		try {
			var cfg = __initS3(fromFile);

			myEmitter.emit('start');
			var d = cfg.downloader.download(cfg.params, cfg.sessionParams);
			d.on('error',function(err){
		  	myEmitter.emit('error', err);
				if (callback) {callback(null, false);}
			});

			d.on('part',function(dat){
				myEmitter.emit('part');
			});

			d.on('downloaded',function(dat){
				myEmitter.emit('end');
				if (callback) {callback(null, true);}
			});

			var w = fs.createWriteStream(temporalFile);
			d.pipe(w);
		} catch (e) {
			myEmitter.emit('error', e);
			if (callback) {callback(e, false);}
		}
	};

	var __toS3 = function(callback) {
		/*
		try {
			var cfg = __initS3(toFile);

			myEmitter.emit('start');
			var d = cfg.downloader.download(cfg.params, cfg.sessionParams);
			d.on('error',function(err){
		  	myEmitter.emit('error', err);
				if (callback) {callback(null, false);}
			});

			d.on('part',function(dat){
				myEmitter.emit('part');
			});

			d.on('downloaded',function(dat){
				myEmitter.emit('end');
				if (callback) {callback(null, true);}
			});

			var w = fs.createWriteStream(temporalFile);
			d.pipe(w);
		} catch (e) {
			myEmitter.emit('error', e);
			if (callback) {callback(e, false);}
		}
		*/
		throw new Error("toS3 not implemented");
		callback("toS3 not implemented", false);
	};

	var __fromHttp = function(callback) {
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

	var __toHttp = function(callback) {
		//if (callback) {callback(err, false);}
		throw new Error("toHttp not implemented");
	};

	var __initFtp = function(file) {
		var parsed = __parseUrl(file);
		var ftp = new jsftp({
		  host: parsed.host,
		  port: parsed.port, 
		  user: parsed.username, 
		  pass: parsed.password
		});

		return {
			ftp: ftp,
			remoteFile: parsed.remoteFile
		};
	};

	var __fromFtp = function(callback) {
		var cfg = __initFtp(fromFile);

  	myEmitter.emit('start');
		cfg.ftp.get(cfg.remoteFile, temporalFile, function(err) {
	  	myEmitter.emit('end', err);
			if (callback) {callback(err, !err);}
	  });
	};

	var __toFtp = function(callback) {
		var cfg = __initFtp(toFile);

  	myEmitter.emit('start');
		cfg.ftp.put(temporalFile, cfg.remoteFile, function(err) {
	  	myEmitter.emit('end', err);
			if (callback) {callback(err, !err);}
	  });
	};

	var __from = function(sourceFile) {
		fromFile = sourceFile;
		var fromParsed = __parseUrl(fromFile);
		temporalFile = path.basename(fromParsed.remoteFile);
		__setProtocol(sourceFile);

		return {
			to: __to
		};
	};

	return {
		from: __from
	};
};

util.inherits(AnyFile, MyEmitter);


/**
 * Export `AnyFile`.
 */

module.exports = AnyFile;