var ssi = require("ssi");

var inputDirectory = "../workspace";
var outputDirectory = "../dist";
var matcher = "/*.html";

var includes = new ssi(inputDirectory, outputDirectory, matcher);
includes.compile();