var ssi = require("ssi");

var inputDirectory = "../workspace/js/";
var outputDirectory = "../dist/js/";
var matcher = "/main.js";

var includes = new ssi(inputDirectory, outputDirectory, matcher);
includes.compile();