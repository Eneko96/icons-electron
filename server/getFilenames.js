const fs = require("fs");
const path = require("path");

const paths = {
  svg: "../resources/svg",
  png: "../resources/png",
};

const dir = (type) => path.join(__dirname, paths[type]);

exports.fileNames = (type) => {
  console.log("on filenames");
  const fileNames = fs.readdirSync(dir(type));
  return fileNames.map((file) => {
    const data = fs.readFileSync(path.join(dir(type), file), "utf8");
    return {
      name: file.replace(".svg", ""),
      content: data,
    };
  });
};
