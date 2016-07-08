'use strict';

/**
 * Module dependencies.
 */

var url = require('url'),
		util = require('util'),
		path = require('path'),
		fs = require('fs'),
		s3 = require('s3'),
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
		__setToProtocol(destinationFile);
		__fromGeneric(function(err, res) {
			if (!err && res) {
				__toGeneric(callback);	
			} else {
				callback(err, false);	
			}
		});
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

	var __setFromProtocol = function(file) {
		if (__isSupportedProtocol(file)) {
			fromProtocol = __getProtocol(file);
		} else {
			fromProtocol = "file";
		}
	};

	var __setToProtocol = function(file) {
		if (__isSupportedProtocol(file)) {
			toProtocol = __getProtocol(file);
		} else {
			toProtocol = "file";
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
		} else if (fromProtocol === 'file') {
			__fromLocalFile(callback);
		}
	};

	var __toGeneric = function(callback) {
		if (toProtocol === 's3') {
			__toS3(callback);
		} else if (toProtocol === 'ftp') {
			__toFtp(callback);
		} else if (toProtocol === 'http') {
			__toHttp(callback);
		} else if (toProtocol === 'scp') {
			__toSftp(callback);
		} else if (toProtocol === 'file') {
			__toLocalFile(callback);
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

		scpClient.scp({
	    host: parsed.host,
	    username: parsed.username,
	    password: parsed.password,
	    path: parsed.remoteFile
		}, temporalFile, function(err) {
			if (!err) {
		 	} else {
		 	}
			callback(err, !err);
		});
	};

	var __toSftp = function(callback) {
		var parsed = __parseUrl(toFile);

		scpClient.scp(temporalFile, {
	    host: parsed.host,
	    username: parsed.username,
	    password: parsed.password,
	    path: parsed.remoteFile
		}, function(err) {
			if (!err) {
		 	} else {
		 	}
			callback(err, !err);
		});
	};

	var __getAuthRaw = function(file) {
		var data = file.split("@");
		data = data[0].split("/");
		return data[data.length - 1];
	};

	var __getUsernameRaw = function(file) {
		var username = "";
		var auth = __getAuthRaw(file);
		if (auth.indexOf(":") !== -1) {
			username = auth.split(":")[0];
		}

		return username;
	};

	var __getPasswordRaw = function(file) {
		var password = "";
		var auth = __getAuthRaw(file);
		if (auth.indexOf(":") !== -1) {
			password = auth.split(":")[1];
		}

		return password;
	};

	var __initS3 = function(file) {
		var parsed = __parseUrl(file);

		var host = parsed.host;
		var port = parsed.port;
		var auth = parsed.auth;
		var accessKey = auth && auth.indexOf(":") !== -1 ? auth.split(":")[0] : "";
		if (accessKey === '') {
			accessKey = __getUsernameRaw(file);
		}
		var secretKey = auth && auth.indexOf(":") !== -1 ? auth.split(":")[1] : "";
		if (secretKey === '') {
			secretKey = __getPasswordRaw(file);
		}
		var data = parsed.remoteFile.split("/");
		var bucket = data[1];
		var remoteFile = data.slice(2).join("/");

		if (accessKey !== "" && secretKey !== "" && bucket !== "" && remoteFile !== "") {
			var config = {
			  maxAsyncS3: 1,     // this is the default
			  s3RetryCount: 1,    // this is the default
			  s3RetryDelay: 2000, // this is the default
			  s3Options: {
			    accessKeyId: accessKey,
			    secretAccessKey: secretKey
			  },
			}; 

			var client = s3.createClient(config);
			var params = {
			  s3Params: {
			    Bucket: bucket,
			    Key: remoteFile,
			  },
			};

			return {
				client: client,
				params: params
			}

		} else {
			throw new Error("invalid params");
		}
	};

	var __fromS3 = function(callback) {
		try {
			var cfg = __initS3(fromFile);
			cfg.params.localFile = temporalFile;
			  
			var downloader = cfg.client.downloadFile(cfg.params);
			downloader.on('error', function(err) {
			  //console.error("unable to download:", err.stack);
			  callback(err, !err);
			});
			downloader.on('progress', function() {
			  //console.log("progress", downloader.progressAmount, downloader.progressTotal);
			});
			downloader.on('end', function() {
			  //console.log("done downloading");
			  callback(null, true);
			});
		} catch (e) {
			if (callback) {callback(e, false);}
		}
	};

	var __toS3 = function(callback) {
		try {
			var cfg = __initS3(toFile);
			cfg.params.localFile = temporalFile;

			var uploader = cfg.client.uploadFile(cfg.params);
			uploader.on('error', function(err) {
			  //console.error("unable to upload:", err.stack);
			  callback(err, !err);
			});
			uploader.on('progress', function() {
			  //console.log("progress", uploader.progressMd5Amount, uploader.progressAmount, uploader.progressTotal);
			});
			uploader.on('end', function() {
			  //console.log("done uploading");
			  callback(null, true);
			});
		} catch (e) {
			if (callback) {callback(e, false);}
		}
	};

	var __fromHttp = function(callback) {
		var file = fs.createWriteStream(temporalFile);
	  var request = http.get(fromFile, function(response) {
		  response.pipe(file);
		  file.on('finish', function() {
		  	file.close(function(res) {
					if (callback) {callback(null, true);}
	      });
	    });
  	}).on('error', function(err) {
			if (callback) {callback(err, false);}
	  });
	};

	var __toHttp = function(callback) {
		//if (callback) {callback(err, false);}
		throw new Error("toHttp not implemented");
	};

	var __copyLocalFile = function(srcFile, dstFile, callback, deleteSrcFile) {
		deleteSrcFile = deleteSrcFile || false;
		var rd = fs.createReadStream(srcFile);
	  rd.on("error", function(err) {
	    callback(err, !err);
	  });

	  if (fs.exists(dstFile)) {
			fs.unlinkSync(dstFile);	
		}
	  var wr = fs.createWriteStream(dstFile);
	  wr.on("error", function(err) {
	    callback(err, !err);
	  });
	  wr.on("close", function(ex) {
		  if (deleteSrcFile && fs.exists(srcFile)) {
		  	fs.unlinkSync(srcFile);	
		  }
	    callback(null, true);
	  });
	  rd.pipe(wr);	
	};

	var __fromLocalFile = function(callback) {
		__copyLocalFile(fromFile, temporalFile, callback);
	};

	var __toLocalFile = function(callback) {
		if (temporalFile !== toFile) {
			__copyLocalFile(temporalFile, toFile, callback, true);
		} else {
			callback(null, true);
		}
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

		cfg.ftp.get(cfg.remoteFile, temporalFile, function(err) {
			if (callback) {callback(err, !err);}
	  });
	};

	var __toFtp = function(callback) {
		var cfg = __initFtp(toFile);

		cfg.ftp.put(temporalFile, cfg.remoteFile, function(err) {
			if (callback) {callback(err, !err);}
	  });
	};

	var __from = function(sourceFile) {
		fromFile = sourceFile;
		var fromParsed = __parseUrl(fromFile);
		temporalFile = path.basename(fromParsed.remoteFile);
		if (fs.exists(temporalFile)) {
			fs.unlinkSync(temporalFile);
		}
		__setFromProtocol(sourceFile);

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