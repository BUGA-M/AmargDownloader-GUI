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

  //----------------------- SUPPORT ------------------------------
    const supportBody = document.querySelector(".supportBody") as HTMLDivElement;
    if (supportBody) {
      supportBody.style.border = theme === "light" ? "1px solid #af4c0f" : "1px solid #636363ff";
      supportBody.style.background = theme === "light"? "#e0e0e0": "#212121";
    }

    //Support zone
    const supportZone = document.querySelector(".support-zone") as HTMLDivElement;
    const supportIcon = document.querySelector(".supportIcon") as HTMLDivElement;
    const supportText = document.querySelector(".supportText") as HTMLDivElement;

    if (supportZone) {
      supportZone.style.background = theme === "light" ? " #ffffffff": "linear-gradient(145deg, #121212, #1a1a1a)";
      supportZone.style.border = theme === "light" ? "1px solid #af4c0f" : "1px solid #333333ff";
      supportIcon.style.color = theme === "light" ? "#333333ff" : "#dfdfdfff";
      supportText.style.color = theme === "light" ? "#161616ff" : "#f5f5f5ff";
    }


    // Support message
    const messageSupport = document.querySelector(".messageSupport") as HTMLDivElement;
    if (messageSupport) {
    messageSupport.style.background = theme === "light" ? "#e0e0e0" :  "#212121";
    messageSupport.style.color = theme === "light" ? "#161616ff" : "#dfdfdfff";

      if (messageSupport?.textContent === `Need help ? \nContact our support team via email, our Discord server.`) {      
        messageSupport.style.color = "rgb(136, 136, 136)";
      }else{
        messageSupport.style.color = theme === "light" ? "#000000" : "#ffffff";
      }
    }

    // Support send
    const sendSupport = document.querySelector(".sendSupport") as HTMLDivElement; 
    if (sendSupport) {
      sendSupport.style.background = theme === "light"? "#e0e0e0": "#212121";
      sendSupport.style.color = theme === "light" ? "#000000" : "#ffffff";
      sendSupport.style.borderTop = theme === "light" ? "1px solid #af4c0f" : "1px solid #636363ff";
    }

    // github buttons
    const githubBtn = document.querySelector(".GithubBtn") as HTMLDivElement;
    const githubText = document.querySelector("#textGithub") as HTMLDivElement;
    if (githubBtn) {
      githubBtn.style.background = theme === "light"? "#e0e0e0": "#333333ff";
      githubBtn.style.color = theme === "light" ? "#0e0e0eff" : "#dfdfdfff";
      githubBtn.style.border = theme === "light" ? "1px solid #af4c0f" : "1px solid #636363ff";
      githubText.style.color = theme === "light" ? "#0e0e0eff" : "#dfdfdfff";
    }

    // Discord buttons
    const discordBtn = document.querySelector(".DiscordBtn") as HTMLDivElement;
    const discordText = document.querySelector("#textDiscord") as HTMLDivElement;
    if (discordBtn) {
      discordBtn.style.background = theme === "light"? "#e0e0e0": "#333333ff";
      discordBtn.style.color = theme === "light" ? "#0e0e0eff" : "#dfdfdfff";
      discordBtn.style.border = theme === "light" ? "1px solid #af4c0f" : "1px solid #636363ff";
      discordText.style.color = theme === "light" ? "#0e0e0eff" : "#dfdfdfff";
    }
  //----------------------- BUGA AI ------------------------------
    const leftContainer = document.querySelector(".left-container") as HTMLDivElement;
    const leftContainerhider = document.querySelector(".container-hide-svg") as HTMLDivElement;
    const svgDecoratif = document.querySelector("#svgPath") as SVGPathElement;
    const keyAvatar = document.querySelector(".key-avatar") as HTMLDivElement;
    const aiName = document.querySelector(".ai-name span") as HTMLDivElement;
    const keyBubble = document.querySelector(".key-bubble") as HTMLDivElement;
    const closeBuga = document.querySelector(".closeBuga") as HTMLDivElement;
    const keyContainer = document.querySelector(".key-container") as HTMLDivElement;
    const keyZone = document.querySelector(".key-zone") as HTMLDivElement;
    const sendKey = document.querySelector(".sendKey") as HTMLDivElement;

    //const schedulText = document.querySelector("#no-vd-fnd") as HTMLElement;

    if (leftContainer && leftContainerhider && svgDecoratif) {
      //--- leftContainer ---
      leftContainer.style.border = theme === "light" ? "1px solid #af4c0f" : "1px solid #383838";
      //--- leftContainerhider ---
      leftContainerhider.style.background = theme === "light"? "linear-gradient(145deg, #ffffffff, #ffffffff)": "linear-gradient(145deg, rgb(18, 18, 18), rgb(26, 26, 26))";
    
      //--- svgDecoratif --- 
      svgDecoratif.style.fill = theme === "light" ? " #ffffffff" : "rgb(26, 26, 26)";
      svgDecoratif.style.stroke = theme === "light" ? " #af4c0f" : "#383838";
    
      //--- keyAvatar ---
      keyAvatar.style.background = theme === "light"? "#e0e0e0 ": "rgb(26, 26, 26";

      //--- ai-name ---
      aiName.style.color = theme === "light" ? "#0e0e0eff" : "#dfdfdfff";

      //--- keyBubble ---
      keyBubble.style.background = theme === "light"? "#e0e0e0 ": "rgb(26, 26, 26";
      keyBubble.style.border = theme === "light" ? "1px solid #af4c0f" : "1px solid #383838";
      keyBubble.style.color = theme === "light" ? "#0e0e0eff" : "#dfdfdfff";

      //--- closeBuga ---
      closeBuga.style.background = theme === "light"? "#e0e0e0 ": " rgb(51, 51, 51)";
      closeBuga.style.border = theme === "light" ? "1px solid #af4c0f" : "1px solid rgb(99, 99, 99)";
      closeBuga.style.color = theme === "light" ? "#000000" : "#ffffff";

      //--- key-container ---
      keyContainer.style.background = theme === "light"? "#e0e0e0 ": " rgb(33, 33, 33)";
      keyContainer.style.border = theme === "light" ? "1px solid #af4c0f" : "1px solid #383838";

      //--- key-zone ---
      keyZone.style.background = theme === "light"? "#e0e0e0 ": " rgb(33, 33, 33)";
      keyZone.style.borderRight= theme === "light" ? "1px solid #af4c0f" : "1px solid #383838";
      
      if (keyZone?.textContent === "Enter your ai studio key") {      
        keyZone.style.color = "rgb(136, 136, 136)";
      }else{
        keyZone.style.color = theme === "light" ? "#000000ff" : "#ffffffff";
      }

      //--- sendSvg ---
      sendKey.style.color = theme === "light" ? "#000000" : "#ffffff";

      //chedulText.style.color = current === "light" ? "#000000" : "#ffffff";
      
      //----------------------- DWL Barre ------------------------------
      const dwlContainer = document.querySelector(".download-progress-container") as HTMLDivElement;

      if (dwlContainer) {
        // Update container background and border
        dwlContainer.style.background = theme === "light"
          ? "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 250, 250, 0.98) 100%)"
          : "linear-gradient(135deg, rgba(26, 26, 26, 0.98) 0%, rgba(35, 35, 35, 0.98) 100%)";
        dwlContainer.style.borderColor = theme === "light"
          ? "rgba(0, 0, 0, 0.08)"
          : "rgba(255, 255, 255, 0.1)";

        // Update header
        const headerDwlBarre = dwlContainer.querySelector(".header-dwl-barre") as HTMLDivElement;
        if (headerDwlBarre) {
          headerDwlBarre.style.borderBottomColor = theme === "light"
            ? "rgba(0, 0, 0, 0.06)"
            : "rgba(255, 255, 255, 0.08)";
        }

        // Update main title
        const mainTitle = dwlContainer.querySelector(".main-title") as HTMLDivElement;
        if (mainTitle) {
          mainTitle.style.color = theme === "light" ? "#1a1a1a" : "#ffffff";
        }

        // Update progress text
        const progressText = dwlContainer.querySelector(".progress-text") as HTMLDivElement;
        if (progressText) {
          progressText.style.color = theme === "light" ? "#666" : "#999";
        }

        // Update expand button
        const expandBtn = dwlContainer.querySelector(".flecheBas") as HTMLButtonElement;
        if (expandBtn) {
          expandBtn.style.background = theme === "light"
            ? "rgba(0, 0, 0, 0.04)"
            : "rgba(255, 255, 255, 0.05)";
          expandBtn.style.color = theme === "light" ? "#666" : "#999";
        }

        // Update close button
        const closeBtn = dwlContainer.querySelector(".closeBtn-barre-dwl") as HTMLButtonElement;
        if (closeBtn) {
          closeBtn.style.background = theme === "light"
            ? "rgba(0, 0, 0, 0.04)"
            : "rgba(255, 255, 255, 0.05)";
          closeBtn.style.color = theme === "light" ? "#666" : "#999";
        }

        const minimizeBtn = dwlContainer.querySelector(".minimizeBtn-barre-dwl") as HTMLButtonElement;
        if (minimizeBtn) {
          minimizeBtn.style.background = theme === "light"
            ? "rgba(0, 0, 0, 0.04)"
            : "rgba(255, 255, 255, 0.05)";
          minimizeBtn.style.color = theme === "light" ? "#666" : "#999";
        }


        // Update main progress bar
        const mainProgressBar = dwlContainer.querySelector(".mainProgressBar-Dwl") as HTMLDivElement;
        if (mainProgressBar) {
          mainProgressBar.style.background = theme === "light"
            ? "rgba(0, 0, 0, 0.08)"
            : "rgba(255, 255, 255, 0.08)";
        }

        // Update download list
        const downloadList = dwlContainer.querySelector(".download-list") as HTMLDivElement;
        if (downloadList) {
          downloadList.style.background = theme === "light"
            ? "rgba(0, 0, 0, 0.02)"
            : "rgba(0, 0, 0, 0.2)";
        }

        // Update download icon
        const downloadIcon = dwlContainer.querySelector(".downloadIcon") as HTMLDivElement;
        if (downloadIcon) {
          downloadIcon.style.color = theme === "light" ? "#000000" : "#ffffff";
        }

        // Update all download items
        const downloadItems = dwlContainer.querySelectorAll(".item") as NodeListOf<HTMLDivElement>;
        downloadItems.forEach((item) => {
          item.style.borderBottomColor = theme === "light"
            ? "rgba(0, 0, 0, 0.04)"
            : "rgba(255, 255, 255, 0.05)";

          // Update file name in this item
          const fileName = item.querySelector(".fileName") as HTMLDivElement;
          if (fileName) {
            fileName.style.color = theme === "light" ? "#1a1a1a" : "#ffffff";
          }

          // Update progress bar in this item
          const progressBar = item.querySelector(".progressBar-Dwl") as HTMLDivElement;
          if (progressBar) {
            progressBar.style.background = theme === "light"
              ? "rgba(0, 0, 0, 0.1)"
              : "rgba(255, 255, 255, 0.1)";
          }

          // Update percentage
          const pourcentage = item.querySelector(".pourcentage-dwl") as HTMLSpanElement;
          if (pourcentage) {
            pourcentage.style.color = theme === "light" ? "#333" : "#ffffff";
          }

          // Update size info
          const sizeInfo = item.querySelector(".size-dwl") as HTMLSpanElement;
          if (sizeInfo) {
            sizeInfo.style.color = theme === "light" ? "#666" : "#ccc";
          }

          // Update speed info
          const speedInfo = item.querySelector(".speedInfo-dwl") as HTMLSpanElement;
          if (speedInfo) {
            speedInfo.style.color = theme === "light" ? "#666" : "#ccc";
          }
        });
      }
       // Update minimized bar elements (counter, spinner, badge)
      const minimizedBar = dwlContainer.querySelector('.minimized-bar') as HTMLDivElement | null;
      if (minimizedBar) {
        minimizedBar.style.background = theme === 'light'
          ? 'linear-gradient(90deg, rgba(255,255,255,0.98), rgba(248,248,248,0.98))'
          : 'linear-gradient(90deg, rgba(36,36,36,0.95), rgba(24,24,24,0.95))';
        minimizedBar.style.border = theme === 'light' ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.06)';

          const counter = minimizedBar.querySelector('.mini-counter') as HTMLElement | null;
          const spinner = minimizedBar.querySelector('.mini-spinner') as HTMLElement | null;
          const badge = minimizedBar.querySelector('.mini-badge') as HTMLElement | null;
          const label = minimizedBar.querySelector('.mini-label') as HTMLElement | null;
          const miniState = badge?.getAttribute('data-state');

          if (counter) counter.style.color = theme === 'light' ? '#111' : '#fff';
          if (label) label.style.color = theme === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.75)';

          // If minimized bar indicates an error state, force error colors regardless of theme
          if (miniState === 'error') {
            if (spinner) {
              spinner.style.border = theme === 'light' ? '3px solid rgba(0,0,0,0.12)' : '3px solid rgba(255,255,255,0.12)';
              spinner.style.borderTopColor = '#dc2626';
            }
            if (badge) {
              badge.style.background = theme === 'light'
                ? 'linear-gradient(135deg,#fff1f2,#fee2e2)'
                : 'linear-gradient(135deg,#4c0519,#7f1d1d)';
              badge.style.color = theme === 'light' ? '#991b1b' : '#fecaca';
              badge.style.border = theme === 'light' ? '1px solid #991b1b' : '1px solid #fecaca';
            }
          } else {
            if (spinner) {
              spinner.style.border = theme === 'light' ? '3px solid rgba(0,0,0,0.12)' : '3px solid rgba(255,255,255,0.12)';
              spinner.style.borderTopColor = theme === 'light' ? '#ff6a00' : '#ffb56b';
            }
            if (badge) {
              badge.style.background = theme === 'light'
                ? 'linear-gradient(135deg,#e6fffa,#ecfccb)'
                : 'linear-gradient(135deg,#064e3b,#065f46)';
              badge.style.color = theme === 'light' ? '#065f46' : '#bbf7d0';
              badge.style.border = theme === 'light' ? '1px solid #065f46' : '1px solid #bbf7d0';
            }
          }
      }

    }

}
