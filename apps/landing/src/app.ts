const range = document.getElementById("compare-range") as HTMLInputElement | null;
const afterWrap = document.getElementById("after-wrap") as HTMLDivElement | null;
const divider = document.getElementById("divider") as HTMLDivElement | null;
const copyCommandButton = document.getElementById("copy-command") as HTMLButtonElement | null;
const copyInlineButton = document.getElementById("copy-inline") as HTMLButtonElement | null;
const command = "npx agent-console@latest rmbg photo.png";

function syncCompare(value: string): void {
  if (!afterWrap || !divider) return;
  const width = `${value}%`;
  afterWrap.style.width = width;
  divider.style.left = width;
}

range?.addEventListener("input", (event) => {
  const target = event.currentTarget as HTMLInputElement;
  syncCompare(target.value);
});

async function copyCommand(targetButton: HTMLButtonElement): Promise<void> {
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

copyCommandButton?.addEventListener("click", () => copyCommand(copyCommandButton));
copyInlineButton?.addEventListener("click", () => copyCommand(copyInlineButton));

if (range) {
  syncCompare(range.value);
}
