import { invoke } from "@tauri-apps/api/core";
export function support() {
    const savedTheme = localStorage.getItem("theme");
    // Container
    const container = document.createElement('div');
    container.className = 'custom-alert-drawer';
    container.style.cssText = `
        position: fixed;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        min-width: 420px;
        max-width: 420px;
        min-height: 380px;
        max-height: 60vh;
        z-index: 1000;
        display: flex;
        background: transparent;
        border-radius: 0 12px 12px 0;
    `;
    document.body.appendChild(container);

    // Support Zone
    const supportZone = document.createElement('div');
    supportZone.className = 'support-zone';
    supportZone.style.cssText = `
        flex: 1;
        padding: 0;
        background: ${savedTheme?.trim() === "light" ? "#ffffffff" : "linear-gradient(145deg, #121212, #1a1a1a)"};
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        border-radius: 0 12px 12px 0;
        border: 1px solid ${savedTheme?.trim() === "light" ? "#af4c0f" : "#333333ff"};
    `;
    const {supportHeader, supportBody , supportFooter} = ContactSupport();
    supportZone.appendChild(supportHeader);
    supportZone.appendChild(supportBody);
    supportZone.appendChild(supportFooter);
    container.appendChild(supportZone);

    // SVG Zone
    const svgZone = document.createElement('div');
    svgZone.className = 'svg-zone';
    svgZone.style.cssText = `
        width: 30px;
        min-height: 300px;
        max-height: 60vh;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.3s;
        background: transparent;
        border: none;
    `;
    svgZone.innerHTML = `
        <svg id="rocket" xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 500 500"
            preserveAspectRatio="xMidYMid meet"
            style="width: 100%; height: 100%; display: block;">
        <defs>
            <linearGradient gradientUnits="userSpaceOnUse" x1="100.073" y1="129.974" x2="100.073" y2="246.836" id="gradient-0" gradientTransform="matrix(-0.005543, -0.999985, 0.191573, -0.001062, 64.032297, 289.189506)" spreadMethod="pad">
                <stop offset="0" style="stop-color: rgb(255, 64, 0);"></stop>
                <stop offset="1" style="stop-color: rgb(255, 128, 0);"></stop>
            </linearGradient>
        </defs>
        <g transform="matrix(0, 46.564342, -21.770121, 0, 148.670027, 51.903857)" style="transform-origin: 99.6865px 188.631px;">
            <g>
                <path style="stroke-width: 0px; fill-rule: nonzero; stroke: rgb(255, 117, 0); fill: url(#gradient-0); paint-order: stroke; transform-box: fill-box; transform-origin: 50% 50%;" d="M 88.273 130.375 C 88.219 125.337 88.224 251.186 88.225 246.987 C 88.225 246.987 91.408 240.89 94.746 239.444 C 99.238 237.498 103.816 236.963 103.78 229.917 C 103.779 229.748 103.677 212.42 103.677 212.42 C 103.677 212.42 103.656 203.92 103.721 199.891 C 103.758 197.563 104.654 196.769 105.05 196.193 C 106.699 193.796 111.148 188.724 111.148 188.724 C 111.148 188.724 105.388 182.079 105.165 181.86 C 103.861 180.577 103.597 179.865 103.606 178.346 C 103.628 174.813 103.709 166.7 103.709 166.7 C 103.709 166.7 103.779 151.22 103.788 148.022 C 103.809 141.068 98.816 140.128 94.779 138.1 C 91.569 136.487 88.272 130.375 88.273 130.375 Z" transform="matrix(0, -1, 1, 0, 0.000001, -0.00001)"></path>
                <path d="M 98.342 179.701 Q 99.811 178.417 101.28 179.701 L 105.336 183.246 Q 106.805 184.53 103.868 184.53 L 95.754 184.53 Q 92.817 184.53 94.286 183.246 Z" bx:shape="triangle 92.817 178.417 13.988 6.113 0.5 0.21 1@1cf0a48c" style="stroke-width: 0px; stroke: rgb(255, 255, 255); fill: rgb(255, 255, 255);"></path>
            </g>
        </g>
        </svg>
    `;

    // Hover Interaction
    svgZone.addEventListener('mouseenter', () => svgZone.classList.add('light'));
    svgZone.addEventListener('mouseleave', () => svgZone.classList.remove('light'));

    // Toggle Logic
    let open = false;
    const applyTransform = () => {
        const closedX = -(container.offsetWidth - svgZone.offsetWidth);
        container.style.transform = open
            ? "translateY(-50%) translateX(0)"
            : `translateY(-50%) translateX(${closedX}px)`;
        container.style.transition = "transform 0.4s ease";
    };
    svgZone.addEventListener('click', () => {
        open = !open;
        applyTransform();
    });
    window.addEventListener('resize', applyTransform);

    container.appendChild(svgZone);
    
    // Appliquer la transformation initiale pour cacher le support
    requestAnimationFrame(() => {
        applyTransform();
    });
}

function ContactSupport() {
    const savedTheme = localStorage.getItem("theme");
    // *********************** SVG *********************** //
    const iconsvg = `
        <svg xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" width="40" height="40" 
            fill="currentColor"
            aria-hidden="true">
        <path d="M8.266 12C11.685 12 14.466 9.309 14.466 6C14.466 2.691 11.685 0 8.266 0C4.847 0 2.067 2.691 2.067 6C2.067 9.309 4.847 12 8.266 12ZM23.451 19.134L22.445 18.572C22.616 18.075 22.732 17.553 22.732 17C22.732 16.447 22.617 15.925 22.445 15.428L23.451 14.866C23.945 14.59 24.115 13.978 23.829 13.5C23.543 13.021 22.912 12.857 22.418 13.134L21.412 13.696C20.684 12.902 19.714 12.321 18.599 12.102V11.001C18.599 10.449 18.136 10.001 17.566 10.001C16.995 10.001 16.532 10.449 16.532 11.001V12.102C15.417 12.322 14.447 12.903 13.719 13.696L12.713 13.134C12.216 12.857 11.587 13.021 11.302 13.5C11.017 13.979 11.186 14.59 11.68 14.866L12.687 15.428C12.515 15.925 12.399 16.447 12.399 17C12.399 17.553 12.514 18.075 12.687 18.572L11.68 19.134C11.186 19.41 11.017 20.022 11.302 20.5C11.494 20.821 11.84 21 12.198 21C12.372 21 12.55 20.957 12.713 20.866L13.719 20.304C14.447 21.098 15.417 21.679 16.532 21.898V22.999C16.532 23.551 16.995 23.999 17.566 23.999C18.136 23.999 18.599 23.551 18.599 22.999V21.898C19.714 21.678 20.684 21.097 21.412 20.304L22.418 20.866C22.581 20.957 22.759 21 22.933 21C23.291 21 23.638 20.821 23.829 20.5C24.115 20.021 23.945 19.41 23.451 19.134ZM17.566 18.5C16.711 18.5 16.016 17.827 16.016 17C16.016 16.173 16.711 15.5 17.566 15.5C18.42 15.5 19.116 16.173 19.116 17C19.116 17.827 18.42 18.5 17.566 18.5ZM8.783 17C8.783 16.451 8.84 15.894 8.953 15.342C9.021 15.009 8.91 14.666 8.659 14.43C8.408 14.194 8.05 14.098 7.708 14.173C3.314 15.149 0 18.944 0 23C0 23.552 0.463 24 1.033 24H9.958C10.356 24 10.72 23.778 10.891 23.429C11.062 23.08 11.011 22.667 10.758 22.368C9.484 20.857 8.783 18.951 8.783 17Z"/>
        </svg>`;

    const githubSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            width="24" height="24" 
            fill="currentColor" 
            aria-hidden="true">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12,0.296c-6.627,0-12,5.372-12,12c0,5.302,3.438,9.8,8.206,11.387c0.6,0.111,0.82-0.26,0.82-0.577c0-0.286-0.011-1.231-0.016-2.234c-3.338,0.726-4.043-1.416-4.043-1.416C4.421,18.069,3.635,17.7,3.635,17.7c-1.089-0.745,0.082-0.729,0.082-0.729c1.205,0.085,1.839,1.237,1.839,1.237c1.07,1.834,2.807,1.304,3.492,0.997C9.156,18.429,9.467,17.9,9.81,17.6c-2.665-0.303-5.467-1.332-5.467-5.93c0-1.31,0.469-2.381,1.237-3.221C5.455,8.146,5.044,6.926,5.696,5.273c0,0,1.008-0.322,3.301,1.23C9.954,6.237,10.98,6.104,12,6.099c1.02,0.005,2.047,0.138,3.006,0.404c2.29-1.553,3.297-1.23,3.297-1.23c0.653,1.653,0.242,2.873,0.118,3.176c0.769,0.84,1.235,1.911,1.235,3.221c0,4.609-2.807,5.624-5.479,5.921c0.43,0.372,0.814,1.103,0.814,2.222c0,1.606-0.014,2.898-0.014,3.293c0,0.319,0.216,0.694,0.824,0.576c4.766-1.589,8.2-6.085,8.2-11.385C24,5.669,18.627,0.296,12,0.296z"/>
            <path d="M4.545,17.526c-0.026,0.06-0.12,0.078-0.206,0.037c-0.087-0.039-0.136-0.121-0.108-0.18c0.026-0.061,0.12-0.078,0.207-0.037C4.525,17.384,4.575,17.466,4.545,17.526z"/>
            <path d="M5.031,18.068c-0.057,0.053-0.169,0.028-0.245-0.055c-0.079-0.084-0.093-0.196-0.035-0.249c0.059-0.053,0.167-0.028,0.246,0.056C5.076,17.903,5.091,18.014,5.031,18.068z"/>
            <path d="M5.504,18.759c-0.074,0.051-0.194,0.003-0.268-0.103c-0.074-0.107-0.074-0.235,0.002-0.286c0.074-0.051,0.193-0.005,0.268,0.101C5.579,18.579,5.579,18.707,5.504,18.759z"/>
            <path d="M6.152,19.427c-0.066,0.073-0.206,0.053-0.308-0.046c-0.105-0.097-0.134-0.234-0.068-0.307c0.067-0.073,0.208-0.052,0.311,0.046C6.191,19.217,6.222,19.355,6.152,19.427z"/>
            <path d="M7.047,19.814c-0.029,0.094-0.164,0.137-0.3,0.097c-0.136-0.041-0.225-0.151-0.197-0.246c0.028-0.095,0.164-0.139,0.301-0.096C6.986,19.609,7.075,19.719,7.047,19.814z"/>
            <path d="M8.029,19.886c0.003,0.099-0.112,0.181-0.255,0.183c-0.143,0.003-0.26-0.077-0.261-0.174c0-0.1,0.113-0.181,0.256-0.184C7.912,19.708,8.029,19.788,8.029,19.886z"/>
            <path d="M8.943,19.731c0.017,0.096-0.082,0.196-0.224,0.222c-0.139,0.026-0.268-0.034-0.286-0.13c-0.017-0.099,0.084-0.198,0.223-0.224C8.797,19.574,8.925,19.632,8.943,19.731z"/>
        </svg>
    `;

    const discordSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" >
            <path d="M20.317,4.37c-1.53-0.702-3.17-1.219-4.885-1.515c-0.031-0.006-0.062,0.009-0.079,0.037 c-0.211,0.375-0.445,0.865-0.608,1.249c-1.845-0.276-3.68-0.276-5.487,0C9.095,3.748,8.852,3.267,8.641,2.892 C8.624,2.864,8.593,2.85,8.562,2.855C6.848,3.15,5.208,3.667,3.677,4.37C3.664,4.375,3.652,4.385,3.645,4.397 c-3.111,4.648-3.964,9.182-3.546,13.66c0.002,0.022,0.014,0.043,0.031,0.056c2.053,1.508,4.041,2.423,5.993,3.029 c0.031,0.01,0.064-0.002,0.084-0.028c0.462-0.63,0.873-1.295,1.226-1.994c0.021-0.041,0.001-0.09-0.042-0.106 c-0.653-0.248-1.274-0.55-1.872-0.892c-0.047-0.028-0.051-0.095-0.008-0.128c0.126-0.094,0.252-0.192,0.372-0.291 c0.022-0.018,0.052-0.022,0.078-0.01c3.928,1.793,8.18,1.793,12.061,0c0.026-0.012,0.056-0.009,0.079,0.01 c0.12,0.099,0.246,0.198,0.373,0.292c0.044,0.032,0.041,0.1-0.007,0.128c-0.598,0.349-1.219,0.645-1.873,0.891 c-0.043,0.016-0.061,0.066-0.041,0.107c0.36,0.698,0.772,1.363,1.225,1.993c0.019,0.027,0.053,0.038,0.084,0.029 c1.961-0.607,3.95-1.522,6.002-3.029c0.018-0.013,0.029-0.033,0.031-0.055c0.5-5.177-0.838-9.674-3.548-13.66 C20.342,4.385,20.33,4.375,20.317,4.37z M8.02,15.331c-1.183,0-2.157-1.086-2.157-2.419s0.955-2.419,2.157-2.419 c1.211,0,2.176,1.095,2.157,2.419C10.177,14.246,9.221,15.331,8.02,15.331z M15.995,15.331c-1.182,0-2.157-1.086-2.157-2.419 s0.955-2.419,2.157-2.419c1.211,0,2.176,1.095,2.157,2.419C18.152,14.246,17.206,15.331,15.995,15.331z"/>
        </svg>
    `;

    const sendSvg =`
        <svg id="sendSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
            <path transform="rotate(-45, 12, 12)" fill="currentColor" d="m.172,3.708C-.216,2.646.076,1.47.917.713,1.756-.041,2.951-.211,3.965.282l18.09,8.444c.97.454,1.664,1.283,1.945,2.273H4.048L.229,3.835c-.021-.041-.04-.084-.057-.127Zm3.89,9.292L.309,20.175c-.021.04-.039.08-.054.122-.387,1.063-.092,2.237.749,2.993.521.467,1.179.708,1.841.708.409,0,.819-.092,1.201-.279l18.011-8.438c.973-.456,1.666-1.288,1.945-2.28H4.062Z"></path>
        </svg>
    `;

    // *********************** HEADER *********************** //
    const supportHeader = document.createElement("div");
    supportHeader.style.cssText = `
        display: flex;
        align-items: center;
        gap: 15px;
        justify-content: center;
        width: 90%;
        margin: 20px auto;
    `;

    const supportIcon = document.createElement('span');
    supportIcon.classList.add("supportIcon")
    supportIcon.style.cssText = `color : ${savedTheme?.trim() === "dark" ? "#dfdfdfff" : "#333333ff"}`
    supportIcon.innerHTML = iconsvg;

    const supportText = document.createElement('h1');
    supportText.classList.add("supportText")
    supportText.textContent = 'Support & Assistance';
    supportText.style.cssText = `
        color:${savedTheme?.trim() === "dark" ? "#f5f5f5ff" : "#161616ff"};
        margin: 0;
        font-size: 22px;
        font-family: "Orbitron", sans-serif;
        font-optical-sizing: auto;
        font-weight: 700;
        font-style: normal;
        font-size: larger;
    `;

    supportHeader.appendChild(supportIcon);
    supportHeader.appendChild(supportText);

    // *********************** BODY *********************** //
    const supportBody = document.createElement("div");
    supportBody.classList.add("supportBody")
    supportBody.style.cssText = `
        position:relative;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        flex-direction: column;
        border-radius: 26px;
        width: 90%;
        max-width: 390px;
        min-height: 200px;
        background: ${savedTheme?.trim() === "light" ? "#eeeeee" : "#212121"};
        border: 1px solid ${savedTheme?.trim() === "light" ? "#af4c0f" : "#636363ff"};
        overflow: hidden; 
    `;

    const messageBody = document.createElement("div");
    messageBody.classList.add("messageSupport");
    messageBody.setAttribute("contenteditable", "true");
    messageBody.style.cssText = `
    display: block;            
    align-self: stretch;       
    min-width: 0;              
    white-space: pre-wrap;    
    overflow-wrap: break-word; 
    word-break: break-word;
    border-radius: 26px 26px 0 0;
    width: 100%;
    max-width: 390px;
    min-height: 160px;
    max-height: 160px;
    background: ${savedTheme?.trim() === "light" ? "#eeeeee" : "#212121"};
    padding: 15px;
    box-sizing: border-box;
    overflow-y: auto;
    color : rgb(136, 136, 136); 

    font-family: "Space Grotesk", sans-serif;
    font-optical-sizing: auto;
    font-weight: 300;
    font-style: normal;
    font-size: 14px;
    
    line-height: 1.55;
    outline: none;
    border: none;

    scrollbar-width: none;
    -ms-overflow-style: none;
    `;
    // 
    
    const placeholderText = "Need help ? \nContact our support team via email, our Discord server.";
    messageBody.textContent = placeholderText;

    messageBody.addEventListener("focus", () => {
        const savedTheme = localStorage.getItem("theme");
    if (messageBody.textContent === placeholderText) {
        messageBody.textContent = "";
        messageBody.style.color = ` ${savedTheme?.trim() === "dark" ? "#ffffffff" : "#000000ff"}`; 
        sendBody.classList.remove("desabledDIV")
    }
    });

    messageBody.addEventListener("blur", () => {
    if (messageBody.textContent.trim() === "") {
        messageBody.textContent = placeholderText;
        messageBody.style.color = "rgb(136, 136, 136)"; 
        sendBody.classList.add("desabledDIV");
    }
    });

    const sendBody = document.createElement("div");
    sendBody.classList.add("sendSupport");
    sendBody.classList.add("desabledDIV");
    sendBody.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0 0 26px 26px  ;
        width: 100%;
        min-height: 40px;
        max-height: 40px;
        background:${savedTheme?.trim() === "light" ? "#eeeeee" : "#212121"};
        margin: 0;
        color : ${savedTheme?.trim() === "dark" ? "#dfdfdfff" : "#333333ff"};
        border-top: 1px solid ${savedTheme?.trim() === "light" ? "#af4c0f" : "#636363ff"};
    `;
    sendBody.innerHTML = `${sendSvg}`

    sendBody.addEventListener("click", () => {
        const svg = sendBody.querySelector("svg") as SVGElement;
        if (svg.classList.contains("fly")) {
            return; 
        }
        svg.classList.add("fly");
        setTimeout(() => {
            messageBody.textContent = placeholderText;
            messageBody.style.color = "#888"; 
            sendBody.classList.add("desabledDIV");
            svg.classList.remove("fly");
        }, 2500); 

    });


    supportBody.appendChild(messageBody);
    supportBody.appendChild(sendBody);

    // *********************** FOOTER *********************** //
    const supportFooter = document.createElement("div");
    supportFooter.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        width: 90%;
        margin: 20px auto;
        background: transparent; 
    `;

    // GitHub button
    const Github = document.createElement("div");
    Github.classList.add("GithubBtn");
    Github.style.cssText = `
        padding: 10px 30px;
        border-radius: 26px;
        border: 1px solid ${savedTheme?.trim() === "light" ? "#af4c0f" : "#636363ff"};
        display: flex;
        align-items: center;
        gap: 15px;
        cursor: pointer;
        font-weight: bold;
        background : ${savedTheme?.trim() === "light" ? "#dfdfdfff" : "#333333ff"};
        color : ${savedTheme?.trim() === "dark" ? "#dfdfdfff" : "#333333ff"};
        transition: all .5s ease ;
    `;
    Github.innerHTML = githubSvg + `<span id="textGithub" style = "color : ${savedTheme?.trim() === "dark" ? "#dfdfdfff" : "#333333ff"}">GitHub</span>`;
    
    // GitHub link
    Github.addEventListener("click", async () => {
        showNotification("Ouverture…", "info");
        Github.style.pointerEvents = "none";
        try {
            await invoke("open_link", { url: "https://github.com/BUGA-M/AmargDownloder-GUI" });
            showNotification("✓ Github open check your browser", "success");
        } catch (e) {
            showNotification("✗ Error check your Network", "error");
        } finally {
            setTimeout(() => (Github.style.pointerEvents = "auto"), 2000);
        }
    });

    Github.addEventListener( "mouseenter",() => {
        const savedTheme = localStorage.getItem("theme");
        Github.style.backgroundColor = `${savedTheme?.trim() === "light" ? "#fff" : "#212121"}`
        Github.style.boxShadow = `0 0 8px  ${savedTheme?.trim() === "light" ? "rgb(175, 76, 15)" : "#636363"}`;
    })
    Github.addEventListener( "mouseleave",() => {
        const savedTheme = localStorage.getItem("theme");
        Github.style.backgroundColor =`${savedTheme?.trim() === "light" ? "#dfdfdfff" : "#333333ff"}`
        Github.style.boxShadow = 'none';
    })

    // Discord button
    const Discord = document.createElement("div");
    Discord.classList.add("DiscordBtn");
    Discord.style.cssText = Github.style.cssText;
    Discord.innerHTML = discordSvg + `<span id="textDiscord"  style = "color : ${savedTheme?.trim() === "dark" ? "#dfdfdfff" : "#333333ff"}">Discord</span>`;
    
    // GitHub link
    Discord.addEventListener("click", async () => {
        Discord.style.pointerEvents = "none";
        try {
            await invoke("open_link", { url: "https://discord.gg/9Tdk89qyw5" });
            showNotification("✓ Discord open check your browser", "success");
        } catch (e) {
            showNotification("✗ Erreur check your Network", "error");
        } finally {
            setTimeout(() => (Discord.style.pointerEvents = "auto"), 2000);
        }
    });

    Discord.addEventListener( "mouseenter",() => {
        const savedTheme = localStorage.getItem("theme");
        Discord.style.backgroundColor = `${savedTheme?.trim() === "light" ? "#fff" : "#212121"}`;
        Discord.style.boxShadow = `0 0 8px  ${savedTheme?.trim() === "light" ? "rgb(175, 76, 15)" : "#636363"}`;
        
    })
    Discord.addEventListener( "mouseleave",() => {
        const savedTheme = localStorage.getItem("theme");
        Discord.style.backgroundColor =`${savedTheme?.trim() === "light" ? "#dfdfdfff" : "#333333ff"}`
        Discord.style.boxShadow = 'none'
    })

    supportFooter.appendChild(Github);
    supportFooter.appendChild(Discord);




    return { supportHeader, supportBody, supportFooter };
}

// Fonction pour afficher une notification
function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const notif = document.createElement("div");
    notif.innerText = message;

    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: bold;
        color: #fff;
        z-index: 9999;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        opacity: 0;
        transform: translateX(100%); /* départ en dehors de l'écran */
        transition: opacity 0.4s ease, transform 0.4s ease;
    `;

    // Couleur selon type
    if (type === 'success') notif.style.background = "#4caf50"; // vert
    else if (type === 'error') notif.style.background = "#f44336"; // rouge
    else notif.style.background = "#2196f3"; // bleu (info)

    document.body.appendChild(notif);

    // Déclenche l'animation (fade-in + slide-in)
    requestAnimationFrame(() => {
        notif.style.opacity = "1";
        notif.style.transform = "translateX(0)";
    });

    // Disparition après 2s
    setTimeout(() => {
        notif.style.opacity = "0";
        notif.style.transform = "translateX(100%)";
        setTimeout(() => notif.remove(), 400);
    }, 2000);
}
