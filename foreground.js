// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.

const umlautMap = {
  "\u00dc": "UE",
  "\u00c4": "AE",
  "\u00d6": "OE",
  "\u00fc": "ue",
  "\u00e4": "ae",
  "\u00f6": "oe",
  "\u00df": "ss",
};

function replaceUmlaute(str) {
  return str
    .replace(/[\u00dc|\u00c4|\u00d6][a-z]/g, (a) => {
      const big = umlautMap[a.slice(0, 1)];
      return big.charAt(0) + big.charAt(1).toLowerCase() + a.slice(1);
    })
    .replace(
      new RegExp("[" + Object.keys(umlautMap).join("|") + "]", "g"),
      (a) => umlautMap[a]
    );
}

const snakeCase = (string) => {
  return string
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((x) => x.toLowerCase())
    .join("_");
};

function addButton() {
  const items = document.querySelectorAll(".js-detailview");
  if(!items) return;
  items.forEach((item) => {
    const buttonId = "ak-extension-copy-button";
    if(item.querySelector(buttonId)) return;
    const titleSelector = item.querySelector(".ghx-key");
    const tub = titleSelector.textContent;
    const title = item.querySelector(".ghx-summary").textContent;
    const titleUmlaute = replaceUmlaute(title);
    const branchName = `${tub}_${snakeCase(titleUmlaute)}`; //.slice(0,35)
    const checkoutCommand = `git checkout -B feature/${branchName}`;

    const copyBtn = document.createElement("button");
    copyBtn.setAttribute("id", buttonId);

    copyBtn.innerHTML = `<svg height="18px" width="18px" fill="#5e6c84" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" /></svg>`;

    copyBtn.onclick = function (e) {
      e.preventDefault();
      navigator.clipboard.writeText(checkoutCommand);
    };

    titleSelector.style.display = "flex";
    titleSelector.style.marginBottom = "4px";
    titleSelector.appendChild(copyBtn);
  });
}

function startExtension() {
  const target = document.querySelector("#ghx-work");
  new MutationObserver(function (mutations) {
    addButton();
  }).observe(target, {
    subtree: true,
    childList: true,
  });
}

startExtension();
