const $ = (selector) => document.querySelector(selector);

window.electronAPI.on("svg-filenames", (filenames) => {
  const iconList = $(".icon-list");

  filenames.forEach((file) => {
    const listItem = document.createElement("li");
    iconList.appendChild(listItem);
    const image = document.createElement("img"); // instead of image, import svg content
    image.src = window.electronAPI.joinPath(`../resources/svg/${file}`);
    image.width = 30;
    image.height = 30;
    listItem.appendChild(image);
  });
});
