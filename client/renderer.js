const $ = (selector) => document.querySelector(selector);

window.electronAPI.on("svg-filenames", (filenames) => {
  const iconList = $(".icon-list");

  // create a function for this and an Observer for loading more icons
  // and then call it on the filenames event

  filenames.slice(0, 60).forEach((file) => {
    console.log(file);
    const listItem = document.createElement("div");
    listItem.className = "icon-list-item";
    iconList.appendChild(listItem);

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = file.content;
    const svg = tempContainer.querySelector("svg");
    svg.className = "svg-icon";
    const text = document.createElement("span");
    text.className = "icon-text";
    text.textContent = file.name;
    listItem.appendChild(svg);
    listItem.appendChild(text);

    listItem.addEventListener("click", () => {
      const dialog = document.createElement("dialog");
      const title = document.createElement("h5");
      const content = document.createElement("pre");
      const code = document.createElement("code");
      const copyButton = document.createElement("button");

      copyButton.textContent = "Copy";
      copyButton.className = "copy-button";

      const tooltip = document.createElement("span");
      tooltip.textContent = "Copied!";
      tooltip.className = "tooltip";

      copyButton.addEventListener("click", () => {
        navigator.clipboard.writeText(file.content);
        copyButton.appendChild(tooltip);
        tooltip.classList.add("show");
        const tooltipPosition = copyButton.getBoundingClientRect();
        if (document.body.clientWidth - tooltipPosition.left < 100) {
          tooltip.style.right = "0";
        }
        setTimeout(() => {
          copyButton.removeChild(tooltip);
        }, 1000);
      });

      dialog.appendChild(copyButton);
      title.textContent = file.name;
      title.className = "dialog-title";

      dialog.appendChild(title);
      dialog.className = "dialog";

      content.className = "dialog-content";
      code.textContent = file.content;
      content.appendChild(code);
      dialog.appendChild(content);

      document.body.appendChild(dialog);
      dialog.showModal();

      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) {
          dialog.close();
        }
      });
    });
  });
});
