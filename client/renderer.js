const $ = (selector) => document.querySelector(selector);
let count = 60;
let gFilenames = [];
let isWindows = false;

if (/Windows/.test(navigator.userAgent)) {
  document.body.classList.add("windows-os");
  isWindows = true;
}

const scrollbarWindows = () => {
  let scrollbarTimeout;

  document.body.classList.add("windows-os");
  clearTimeout(scrollbarTimeout);

  document.body.style.setProperty(
    "--scrollbar-thumb-color",
    "var(--scroll-color)",
  );

  scrollbarTimeout = setTimeout(() => {
    document.body.style.setProperty("--scrollbar-thumb-color", "transparent");
  }, 1000);
};

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
  text.textContent = file.name.replaceAll("-", " ");
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
    title.textContent = file.name.replaceAll("-", " ");
    title.className = "dialog-title";

    dialog.appendChild(title);
    dialog.className = "dialog";

    content.className = "dialog-content";
    code.textContent = file.content;
    content.appendChild(code);
    dialog.appendChild(content);

    document.body.appendChild(dialog);
    dialog.showModal();
    requestAnimationFrame(() => {
      dialog.classList.add("show");
    });

    dialog.addEventListener("click", (event) => {
      if (event.target === event.currentTarget) {
        dialog.close();
        dialog.classList.remove("show");
        dialog.remove();
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
      if (file.name.toLowerCase().indexOf(query.replaceAll(" ", "-")) !== -1) {
        addIcon(file);
        ezFind = true;
      }
    });
  }
};

const goUpConstruct = () => {
  const goBackUp = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const canGoBackUp = () => {
    if (window.scrollY > 100) {
      return true;
    }
  };

  const goBackUpButton = $(".go-back-up");

  window.addEventListener("scroll", () => {
    if (isWindows) scrollbarWindows();
    if (canGoBackUp()) {
      goBackUpButton.classList.add("show");
      goBackUpButton.addEventListener("click", goBackUp);
    } else {
      goBackUpButton.classList.remove("show");
      goBackUpButton.removeEventListener("click", goBackUp);
    }
  });
};

window.electronAPI.on("svg-filenames", (filenames) => {
  gFilenames = filenames;
  filenames.slice(0, 60).forEach((file) => {
    addIcon(file);
  });
});

window.addEventListener("DOMContentLoaded", () => {
  goUpConstruct();
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
    Toastify({
      text: "Icon list not found",
      duration: 3000,
      gravity: "bottom",
      position: "right",
      style: {
        background: "linear-gradient(to right, #212029, #35343D)",
      },
    });
    console.error("Icon list not found");
    return;
  }

  const handleIntersection = (lastElement) => {
    const intersectionObserver = new IntersectionObserver((entries) => {
      for (let entry of entries) {
        if (entry.isIntersecting) {
          count = count + 60;
          intersectionObserver.disconnect();
          gFilenames.slice(count, count + 60).forEach((file) => addIcon(file));
          break;
        }
      }
    });

    intersectionObserver.observe(lastElement);
  };

  const mutationObserver = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      if (mutation.addedNodes.length) {
        lastElement = mutation.addedNodes[mutation.addedNodes.length - 1];
      }
    }
    if (lastElement) {
      handleIntersection(lastElement);
    }
  });
  mutationObserver.observe(iconList, { childList: true });
});
