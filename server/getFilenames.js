const fs = require("fs");
const path = require("path");

const paths = {
  svg: "../resources/svg",
  png: "../resources/png",
};

const dir = (type) => path.join(__dirname, paths[type]);

exports.fileNames = (type) => fs.readdirSync(dir(type));
