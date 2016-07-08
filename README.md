# Any-File

Node.js library to copy files between several storage sources (ftp, http, s3, ssh, local, ...)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisities

You need to install nodejs >= 5.8.0 on your machine.

```
sudo apt-get install nodejs
```

### Installing

Please, execute next command to install package

```
npm install any-file
```

## Running the tests

To run tests, please execute

```
make test
```

All test use public files shared on internet. So, you have to find no problems when testing.
Please

### Samples

This module allow to copy files between different storage systems.

All queries begin with calling function *from* to define source file to copy

```
from("protocol://username:password@server/path/to/file")
```

and define destination with method *to*

```
to("protocol://username:password@server/path/to/file", callback)
```

Next protocols are accepted by the library:
* ftp
* http (only download)
* scp
* s3 
* local file system

Additionally, if no protocol schema is defined, local system is assumed. 

No file format is considered when transmiting. No file contents modification is applied when copying file from source to destination.
Compression transformations will be applied on the future.

Next are sources accepted by the library:

* ftp://username:password@ftpserver.com/file.zip (ftp)
* http://webserver.com/path/to/file.csv (direct)
* http://username:password@webserver.com/path/to/file.csv (auth)
* scp://username:password@sshserver.com/path/to/file.csv (auth)
* scp://username@sshserver.com/path/to/file.csv (authorized)
* s3://accesskey:secretkey@s3.amazon.com/bucket/file.csv (us east zone only)

You can copy ftp file to local file system
```
var af = new AnyFile();
af.from("ftp://anonymous:miemail%40gmail.com@speedtest.tele2.net/100KB.zip").to("100KB.zip", function(err, res) {
	if (res) {
		console.log("File copied!");
	} else {
		console.log("File not copied!");
	}
});
```

Or http file with needed auth to local file system
```
var af = new AnyFile();
af.from("http://anonymous:miemail%40gmail.com@speedtest.tele2.net/100KB.zip").to("100KB.zip", function(err, res) {
	if (res) {
		console.log("File copied!");
	} else {
		console.log("File not copied!");
	}
});
```

Or copy from sftp to s3 
```
var af = new AnyFile();
var fromFile = "sftp://demo:password@test.rebex.net:/readme.txt";
var toFile = "s3://AKIAIZHM3T2QFIRSVQ5A:gxxxYv+PuyihUrg0EqJ8U1C0pxBwxZGPO0U2DuhX@s3.amazon.com/any-file-us/readme.txt";
af.from(fromFile).to("100KB.zip", function(err, res) {
	if (res) {
		console.log("File copied!");
	} else {
		console.log("File not copied!");
	}
});
```

You can find more code samples on samples folder using accepted protocols (http, ftp, s3, scp and local). Please, check it out.

## Todo

On future releases, these features will be added:
- compress/uncompress files (locally) if source and destination extensions differ. Samples: 
	- from: .log extension => to: .log.gz extension (apply compression to destination file)
	- from .log.bz2 extension => to: .log extension (apply uncompression to destination file)
- events (start, progress, end, error) instead of callbacks

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Miquel Colomer** - *Initial work* - [mcolomer](https://github.com/mcolomer)

See also the list of [contributors](https://github.com/mcolomer/any-file/contributors) who participated in this project.

## License

This project is licensed under the Apache License - see the [LICENSE](LICENSE) file for details

