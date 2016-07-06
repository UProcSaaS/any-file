# Any-File

This module allows operate with files between several kind of storage sources, like s3, sftp/scp, http - direct, auth -, local files, ftp ...

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisities

You need to install nodejs >= 5.8.0 on your machine.

```
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

You can copy ftp file to local file
```
var af = new AnyFile();
anyfile.from("ftp://anonymous:miemail%40gmail.com@speedtest.tele2.net/100KB.zip").to("100KB.zip", function(err, res) {
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
anyfile.from("http://anonymous:miemail%40gmail.com@speedtest.tele2.net/100KB.zip").to("100KB.zip", function(err, res) {
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

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

