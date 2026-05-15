const range = document.getElementById("compare-range");
const afterWrap = document.getElementById("after-wrap");
const divider = document.getElementById("divider");
const copyCommandButton = document.getElementById("copy-command");
const copyInlineButton = document.getElementById("copy-inline");
const command = "npx agent-console@latest rmbg photo.png";

function syncCompare(value) {
  const width = `${value}%`;
  afterWrap.style.width = width;
  divider.style.left = width;
}

range.addEventListener("input", (event) => {
  syncCompare(event.target.value);
});

async function copyCommand(targetButton) {
  try {
    await navigator.clipboard.writeText(command);
    const label = targetButton.textContent;
    targetButton.textContent = "Copied";
    setTimeout(() => {
      targetButton.textContent = label;
    }, 1200);
  } catch {
    targetButton.textContent = "Copy failed";
  }
}

copyCommandButton.addEventListener("click", () => copyCommand(copyCommandButton));
copyInlineButton.addEventListener("click", () => copyCommand(copyInlineButton));

syncCompare(range.value);
