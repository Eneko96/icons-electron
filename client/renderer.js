const $ = (selector) => document.querySelector(selector);
let count = 60;
let gFilenames = [];

const addIcon = (file) => {
  const iconList = $(".icon-list");

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
};

const search = (input, iconList) => {
  let ezFind = false;
  if (!input.value) {
    const icons = iconList.querySelectorAll(".icon-list-item");
    for (let icon of icons) {
      iconList.removeChild(icon);
    }
    gFilenames.slice(0, 60).forEach((file) => {
      addIcon(file);
    });
    return;
  }
  const query = input.value.toLowerCase();
  const icons = iconList.querySelectorAll(".icon-list-item");
  for (let icon of icons) {
    const text = icon.querySelector(".icon-text").textContent.toLowerCase();
    if (text.indexOf(query) === -1) {
      icon.style.display = "none";
    } else {
      icon.style.display = "flex";
    }
  }
  if (!ezFind) {
    gFilenames.forEach((file) => {
      if (file.name.toLowerCase().indexOf(query) !== -1) {
        addIcon(file);
        ezFind = true;
      }
    });
  }
};

window.electronAPI.on("svg-filenames", (filenames) => {
  gFilenames = filenames;
  filenames.slice(0, 60).forEach((file) => {
    addIcon(file);
  });
});

window.addEventListener("DOMContentLoaded", () => {
  const iconList = document.querySelector(".icon-list");

  const searchInput = document.querySelector(".search-input");
  let debounce;
  searchInput.addEventListener("input", () => {
    if (debounce) {
      clearTimeout(debounce);
    }
    debounce = setTimeout(() => {
      search(searchInput, iconList);
    }, 250);
  });

  if (!iconList) {
    console.error("Icon list not found");
    return;
  }

  const handleIntersection = (lastElement) => {
    const intersectionObserver = new IntersectionObserver((entries) => {
      for (let entry of entries) {
        if (entry.isIntersecting) {
          console.log("Last element is now visible!");
          count = count + 60;
          gFilenames.slice(count, count + 60).forEach((file) => addIcon(file));
          intersectionObserver.disconnect();
          handleIntersection(iconList.lastElementChild);
          break;
        }
      }
    });

    intersectionObserver.observe(lastElement);
  };

  const mutationObserver = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      if (mutation.addedNodes.length) {
        const lastElement = iconList.lastElementChild;
        if (lastElement) {
          handleIntersection(lastElement);
          break;
        }
      }
    }
  });

  mutationObserver.observe(iconList, { childList: true });
});
