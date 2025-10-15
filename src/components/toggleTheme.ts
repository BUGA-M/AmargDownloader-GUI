// !!!!! ancienne version dans chatgpt { erreur pares build tauri }
// Import des images utilisées dans le HTML
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

export function BtnTheme(): void {
  const btnTheme = document.querySelector(".control-btn");

  btnTheme?.addEventListener('click', () => {
    toggleTheme();
    const current = document.documentElement.getAttribute("data-theme") || "light";
    localStorage.setItem("theme", current);

    // Nav buttons
    const navImgs = document.querySelectorAll(".nav-btn img") as NodeListOf<HTMLImageElement>;
    navImgs.forEach((img) => {
      if (img.alt.includes("Download")) img.src = current === "dark" ? downloadDark : downloadLight;
      else if (img.alt.includes("History")) img.src = current === "dark" ? historyDark : historyLight;
      else if (img.alt.includes("Analytics")) img.src = current === "dark" ? analyticsDark : analyticsLight;
      else if (img.alt.includes("Setting")) img.src = current === "dark" ? settingsDark : settingsLight;
    });

    // Preset icons
    const presetImgs = document.querySelectorAll(".preset-icon img") as NodeListOf<HTMLImageElement>;
    presetImgs.forEach((img) => {
      if (img.alt.includes("mobile")) img.src = current === "dark" ? mobileDark : mobileLight;
      else if (img.alt.includes("monitor")) img.src = current === "dark" ? monitorDark : monitorLight;
      else if (img.alt.includes("premium")) img.src = current === "dark" ? premiumDark : premiumLight;
      else if (img.alt.includes("audio")) img.src = current === "dark" ? audioDark : audioLight;
    });

    // Download button
    const downloadImg = document.querySelector(".download-btn img") as HTMLImageElement;
    if (downloadImg) downloadImg.src = current === "dark" ? downloadDark : downloadLight;

    // Schedule button
    const scheduleImg = document.querySelector(".schedule-btn img") as HTMLImageElement;
    if (scheduleImg) scheduleImg.src = current === "dark" ? scheduleDark : scheduleLight;

    //----------------------- SUPPORT ------------------------------
    const supportBody = document.querySelector(".supportBody") as HTMLDivElement;
    if (supportBody) {
      supportBody.style.border = current === "light" ? "1px solid #af4c0f" : "1px solid #636363ff";
      supportBody.style.background = current === "light"? "#e0e0e0": "#212121";
    }

    //Support zone
    const supportZone = document.querySelector(".support-zone") as HTMLDivElement;
    const supportIcon = document.querySelector(".supportIcon") as HTMLDivElement;
    const supportText = document.querySelector(".supportText") as HTMLDivElement;

    if (supportZone) {
      supportZone.style.background = current === "light" ? " #ffffffff": "linear-gradient(145deg, #121212, #1a1a1a)";
      supportZone.style.border = current === "light" ? "1px solid #af4c0f" : "1px solid #333333ff";
      supportIcon.style.color = current === "light" ? "#333333ff" : "#dfdfdfff";
      supportText.style.color = current === "light" ? "#161616ff" : "#f5f5f5ff";
    }


    // Support message
    const messageSupport = document.querySelector(".messageSupport") as HTMLDivElement;
    if (messageSupport) {
    messageSupport.style.background = current === "light" ? "#e0e0e0" :  "#212121";
    messageSupport.style.color = current === "light" ? "#161616ff" : "#dfdfdfff";

      if (messageSupport?.textContent === `Need help ? \nContact our support team via email, our Discord server.`) {      
        messageSupport.style.color = "rgb(136, 136, 136)";
      }else{
        messageSupport.style.color = current === "light" ? "#000000" : "#ffffff";
      }
    }

    // Support send
    const sendSupport = document.querySelector(".sendSupport") as HTMLDivElement; 
    if (sendSupport) {
      sendSupport.style.background = current === "light"? "#e0e0e0": "#212121";
      sendSupport.style.color = current === "light" ? "#000000" : "#ffffff";
      sendSupport.style.borderTop = current === "light" ? "1px solid #af4c0f" : "1px solid #636363ff";
    }

    // github buttons
    const githubBtn = document.querySelector(".GithubBtn") as HTMLDivElement;
    const githubText = document.querySelector("#textGithub") as HTMLDivElement;
    if (githubBtn) {
      githubBtn.style.background = current === "light"? "#e0e0e0": "#333333ff";
      githubBtn.style.color = current === "light" ? "#0e0e0eff" : "#dfdfdfff";
      githubBtn.style.border = current === "light" ? "1px solid #af4c0f" : "1px solid #636363ff";
      githubText.style.color = current === "light" ? "#0e0e0eff" : "#dfdfdfff";
    }

    // Discord buttons
    const discordBtn = document.querySelector(".DiscordBtn") as HTMLDivElement;
    const discordText = document.querySelector("#textDiscord") as HTMLDivElement;
    if (discordBtn) {
      discordBtn.style.background = current === "light"? "#e0e0e0": "#333333ff";
      discordBtn.style.color = current === "light" ? "#0e0e0eff" : "#dfdfdfff";
      discordBtn.style.border = current === "light" ? "1px solid #af4c0f" : "1px solid #636363ff";
      discordText.style.color = current === "light" ? "#0e0e0eff" : "#dfdfdfff";
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

    const schedulText = document.querySelector("#no-vd-fnd") as HTMLElement;

    if (leftContainer && leftContainerhider && svgDecoratif) {
      //--- leftContainer ---
      leftContainer.style.border = current === "light" ? "1px solid #af4c0f" : "1px solid #383838";
      //--- leftContainerhider ---
      leftContainerhider.style.background = current === "light"? "linear-gradient(145deg, #ffffffff, #ffffffff)": "linear-gradient(145deg, rgb(18, 18, 18), rgb(26, 26, 26))";
    
      //--- svgDecoratif --- 
      svgDecoratif.style.fill = current === "light" ? " #ffffffff" : "rgb(26, 26, 26)";
      svgDecoratif.style.stroke = current === "light" ? " #af4c0f" : "#383838";
    
      //--- keyAvatar ---
      keyAvatar.style.background = current === "light"? "#e0e0e0 ": "rgb(26, 26, 26";

      //--- ai-name ---
      aiName.style.color = current === "light" ? "#0e0e0eff" : "#dfdfdfff";

      //--- keyBubble ---
      keyBubble.style.background = current === "light"? "#e0e0e0 ": "rgb(26, 26, 26";
      keyBubble.style.border = current === "light" ? "1px solid #af4c0f" : "1px solid #383838";
      keyBubble.style.color = current === "light" ? "#0e0e0eff" : "#dfdfdfff";

      //--- closeBuga ---
      closeBuga.style.background = current === "light"? "#e0e0e0 ": " rgb(51, 51, 51)";
      closeBuga.style.border = current === "light" ? "1px solid #af4c0f" : "1px solid rgb(99, 99, 99)";
      closeBuga.style.color = current === "light" ? "#000000" : "#ffffff";

      //--- key-container ---
      keyContainer.style.background = current === "light"? "#e0e0e0 ": " rgb(33, 33, 33)";
      keyContainer.style.border = current === "light" ? "1px solid #af4c0f" : "1px solid #383838";

      //--- key-zone ---
      keyZone.style.background = current === "light"? "#e0e0e0 ": " rgb(33, 33, 33)";
      keyZone.style.borderRight= current === "light" ? "1px solid #af4c0f" : "1px solid #383838";
      
      if (keyZone?.textContent === "Enter your ai studio key") {      
        keyZone.style.color = "rgb(136, 136, 136)";
      }else{
        keyZone.style.color = current === "light" ? "#000000ff" : "#ffffffff";
      }

      //--- sendSvg ---
      sendKey.style.color = current === "light" ? "#000000" : "#ffffff";

      schedulText.style.color = current === "light" ? "#000000" : "#ffffff";


    }

  });
}

function applyTheme(theme: string): void {
  document.documentElement.setAttribute("data-theme", theme);
}

function toggleTheme(): void {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
}
