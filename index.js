var child_process = require("child_process");
var deepmerge     = require("deepmerge");
var fs            = require("fs");
var path          = require("path");
var readline      = require('readline');
var shell         = require("shelljs");

var cwd = process.cwd();

var dirname = path.normalize(path.join(cwd, process.argv[2] || "."));

var sampleDir = path.normalize(path.join(__dirname, "sample"));

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var editJson = function (file, payload) {
  var json = JSON.parse(fs.readFileSync(file));
  json = deepmerge(payload,json);
  fs.writeFileSync(file,JSON.stringify(json, null, 2) + "\n");
};

var createProject = function (dirname) {
  if (fs.existsSync(dirname)) {
    console.error("Directory " + dirname + " already exists!");
    process.exit(1);
  }

  console.log("Creating directory..");
  shell.mkdir("-p", path.dirname(dirname));

  console.log("Copying files..");
  shell.cp("-rf", sampleDir, dirname);

  console.log("Editing package.json..");
  editJson(path.join(dirname,"package.json"),{name: path.basename(dirname)}); 

  console.log("Editing bsconfig.json..");
  editJson(path.join(dirname,"bsconfig.json"),{name: path.basename(dirname)});

  console.log("All set!");
};

var isYes = function (response) {
  switch (response) {
    case "Y":
    case "y":
    case "":
      return;
    case "n":
    case "N":
      console.log("Aborting..");
      process.exit(0);
    default:
      console.error("Invalid response: " + response);
      process.exit(1);
  }
}

rl.question("Create a new draco project at " + dirname + " ? (Y/n).. ", function (response) {
  isYes(response);
  createProject(dirname);

  rl.question("Run npm install in " + dirname + " ? (Y/n).. ", function (response) {
    isYes(response);
    var npm = child_process.spawn("cd " + dirname + " && npm install",{
      shell: true,
      stdio: "inherit"
    });

    npm.on("close", function (code) {
      rl.close();
      process.exit(code);
    });
  });
});

