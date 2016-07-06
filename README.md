# Any-File

This module allows operate with files between several kind of storage sources, like s3, sftp/scp, http - direct, auth -, local files, ftp ...

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

Next protocols are accepted by the system: ftp, http, scp, sftp, s3.

Additionally, if no protocol schema is defined, local system is assumed.

Next are sources accepted by the library:

* ftp://username:password@ftpserver.com/path/to/file.csv
* s3://accesskey:secretkey@s3.amazonaws.com/bucket/to/file.csv (by default, us east zone)
* s3://accesskey:secretkey@s3-eu-west.amazonaws.com/bucket/path/to/file.csv (specific amazon region: eu-west)
* http://webserver.com/path/to/file.csv
* http://username:password@webserver.com/path/to/file.csv
* sftp://username:password@sshserver.com/path/to/file.csv
* scp://username:password@sshserver.com/path/to/file.csv



You can copy ftp file to local file
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

Or http file with needed auth to local file
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

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Miquel Colomer** - *Initial work* - [mcolomer](https://github.com/mcolomer)

See also the list of [contributors](https://github.com/mcolomer/any-file/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

