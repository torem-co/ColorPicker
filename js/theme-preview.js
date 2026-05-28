const themeKeys = [
  ["primary", "プライマリー"],
  ["secondary", "セカンダリー"],
  ["accent", "アクセント"],
  ["background", "背景"],
  ["surface", "サーフェス"],
  ["text", "本文テキスト"],
  ["mutedText", "補助テキスト"],
  ["border", "境界線"],
  ["success", "成功"],
  ["warning", "警告"],
  ["danger", "危険"],
];

const cssVarMap = {
  primary: "--color-primary",
  secondary: "--color-secondary",
  accent: "--color-accent",
  background: "--color-background",
  surface: "--color-surface",
  text: "--color-text",
  mutedText: "--color-muted-text",
  border: "--color-border",
  success: "--color-success",
  warning: "--color-warning",
  danger: "--color-danger",
};

const presets = {
  businessBlue: {
    primary: "#2563eb",
    secondary: "#0f766e",
    accent: "#f59e0b",
    background: "#f6f8fb",
    surface: "#ffffff",
    text: "#172033",
    mutedText: "#667085",
    border: "#d9e0ea",
    success: "#16a34a",
    warning: "#d97706",
    danger: "#dc2626",
  },
  softGreen: {
    primary: "#2f855a",
    secondary: "#3b82f6",
    accent: "#d69e2e",
    background: "#f4faf6",
    surface: "#ffffff",
    text: "#1b2b24",
    mutedText: "#66746d",
    border: "#d6e5dc",
    success: "#22c55e",
    warning: "#ca8a04",
    danger: "#e11d48",
  },
  warmOrange: {
    primary: "#ea580c",
    secondary: "#7c3aed",
    accent: "#0ea5e9",
    background: "#fff8f1",
    surface: "#ffffff",
    text: "#2b2118",
    mutedText: "#776a5f",
    border: "#ead8c7",
    success: "#15803d",
    warning: "#f59e0b",
    danger: "#b91c1c",
  },
  monochrome: {
    primary: "#18181b",
    secondary: "#52525b",
    accent: "#71717a",
    background: "#f4f4f5",
    surface: "#ffffff",
    text: "#18181b",
    mutedText: "#71717a",
    border: "#d4d4d8",
    success: "#166534",
    warning: "#a16207",
    danger: "#991b1b",
  },
  modernPurple: {
    primary: "#7c3aed",
    secondary: "#0891b2",
    accent: "#f43f5e",
    background: "#f8f7ff",
    surface: "#ffffff",
    text: "#231942",
    mutedText: "#6b6680",
    border: "#ddd6fe",
    success: "#16a34a",
    warning: "#d97706",
    danger: "#dc2626",
  },
  darkMode: {
    primary: "#60a5fa",
    secondary: "#2dd4bf",
    accent: "#fbbf24",
    background: "#0f172a",
    surface: "#182235",
    text: "#f8fafc",
    mutedText: "#a6b2c5",
    border: "#334155",
    success: "#4ade80",
    warning: "#facc15",
    danger: "#fb7185",
  },
};

let activeTheme = { ...presets.businessBlue };

const colorControls = document.querySelector("#colorControls");
const cssOutput = document.querySelector("#cssOutput");
const presetSelect = document.querySelector("#presetSelect");
const copyButton = document.querySelector("#copyVariables");
const toast = document.querySelector("#copyToast");
const modal = document.querySelector("#previewModal");

function buildColorControls() {
  const fragment = document.createDocumentFragment();

  themeKeys.forEach(([key, label]) => {
    const wrapper = document.createElement("label");
    wrapper.className = "color-control";
    wrapper.innerHTML = `
      <input type="color" value="${activeTheme[key]}" data-color-key="${key}" aria-label="${label}">
      <span>
        <strong>${label}</strong>
        <span class="color-code" data-code-key="${key}">${activeTheme[key]}</span>
      </span>
    `;
    fragment.appendChild(wrapper);
  });

  colorControls.replaceChildren(fragment);
}

function cssVariablesText() {
  const lines = themeKeys.map(([key]) => `  ${cssVarMap[key]}: ${activeTheme[key]};`);
  lines.push("  --radius-sm: 6px;");
  lines.push("  --radius-md: 10px;");
  lines.push("  --radius-lg: 14px;");
  lines.push("  --space-xs: 4px;");
  lines.push("  --space-sm: 8px;");
  lines.push("  --space-md: 16px;");
  lines.push("  --space-lg: 24px;");
  lines.push("  --space-xl: 32px;");
  lines.push("  --shadow-sm: 0 1px 2px rgb(15 23 42 / 8%);");
  lines.push("  --shadow-md: 0 12px 30px rgb(15 23 42 / 12%);");
  return `:root {\n${lines.join("\n")}\n}`;
}

function applyTheme(theme) {
  activeTheme = { ...theme };
  Object.entries(cssVarMap).forEach(([key, cssVar]) => {
    document.documentElement.style.setProperty(cssVar, activeTheme[key]);
  });
  document.body.classList.toggle("is-dark", activeTheme.background.toLowerCase() === presets.darkMode.background);
  syncControls();
  cssOutput.textContent = cssVariablesText();
}

function syncControls() {
  themeKeys.forEach(([key]) => {
    const picker = document.querySelector(`[data-color-key="${key}"]`);
    const code = document.querySelector(`[data-code-key="${key}"]`);
    if (picker) picker.value = activeTheme[key];
    if (code) code.textContent = activeTheme[key];
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1600);
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.inset = "0 auto auto 0";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

colorControls.addEventListener("input", (event) => {
  const input = event.target.closest("[data-color-key]");
  if (!input) return;

  activeTheme[input.dataset.colorKey] = input.value;
  presetSelect.value = "custom";
  applyTheme(activeTheme);
});

presetSelect.addEventListener("change", (event) => {
  const selected = presets[event.target.value];
  if (selected) applyTheme(selected);
});

copyButton.addEventListener("click", async () => {
  const text = cssVariablesText();
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else if (!fallbackCopy(text)) {
      throw new Error("Copy failed");
    }
    showToast("CSS変数をコピーしました");
  } catch {
    if (fallbackCopy(text)) {
      showToast("CSS変数をコピーしました");
    } else {
      showToast("コピーできませんでした");
    }
  }
});

document.querySelectorAll("[data-open-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    modal.hidden = false;
  });
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    modal.hidden = true;
  });
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.hidden = true;
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) modal.hidden = true;
});

buildColorControls();
presetSelect.value = "businessBlue";
applyTheme(activeTheme);
