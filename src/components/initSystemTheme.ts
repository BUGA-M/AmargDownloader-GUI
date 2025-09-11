import downloadLight from '../assets/download-light.png';
import downloadDark from '../assets/download-dark.png';
import historyLight from '../assets/history-light.png';
import historyDark from '../assets/history-dark.png';
import analyticsLight from '../assets/analystics-light.png';
import analyticsDark from '../assets/analystics-dark.png';
import settingsLight from '../assets/settings-light.png';
import settingsDark from '../assets/settings-dark.png';

import mobileLight from '../assets/mobile-light.png';
import mobileDark from '../assets/mobile-dark.png';
import monitorLight from '../assets/monitor-light.png';
import monitorDark from '../assets/monitor-dark.png';
import premiumLight from '../assets/premium-light.png';
import premiumDark from '../assets/premium-dark.png';
import audioLight from '../assets/audio-light.png';
import audioDark from '../assets/audio-dark.png';

import scheduleLight from '../assets/schedule-light.png';
import scheduleDark from '../assets/schedule-dark.png';

export function initSystemTheme(): void {
  try {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const themeToApply = savedTheme
      ? savedTheme
      : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

    applyTheme(themeToApply);

    // Quand l’OS change de thème
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        applyTheme(e.matches ? "dark" : "light"); // 👈 ICI on remet à jour les images aussi
      }
    });
  } catch (e) {
    console.error("Erreur dans le init thème système js :", e);
  }
}

async function applyTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);

  // 🔁 Ici tu mets TOUT ton code qui change les src des <img>
  // Nav buttons
  const navImgs = document.querySelectorAll(".nav-btn img") as NodeListOf<HTMLImageElement>;
  navImgs.forEach((img) => {
    if (img.alt.includes("Download")) img.src = theme === "dark" ? downloadDark : downloadLight;
    else if (img.alt.includes("History")) img.src = theme === "dark" ? historyDark : historyLight;
    else if (img.alt.includes("Analytics")) img.src = theme === "dark" ? analyticsDark : analyticsLight;
    else if (img.alt.includes("Setting")) img.src = theme === "dark" ? settingsDark : settingsLight;
  });

  // Preset icons
  const presetImgs = document.querySelectorAll(".preset-icon img") as NodeListOf<HTMLImageElement>;
  presetImgs.forEach((img) => {
    if (img.alt.includes("mobile")) img.src = theme === "dark" ? mobileDark : mobileLight;
    else if (img.alt.includes("monitor")) img.src = theme === "dark" ? monitorDark : monitorLight;
    else if (img.alt.includes("premium")) img.src = theme === "dark" ? premiumDark : premiumLight;
    else if (img.alt.includes("audio")) img.src = theme === "dark" ? audioDark : audioLight;
  });

  // Download button
  const downloadImg = document.querySelector(".download-btn img") as HTMLImageElement;
  if (downloadImg) downloadImg.src = theme === "dark" ? downloadDark : downloadLight;

  // Schedule button
  const scheduleImg = document.querySelector(".schedule-btn img") as HTMLImageElement;
  if (scheduleImg) scheduleImg.src = theme === "dark" ? scheduleDark : scheduleLight;
}
