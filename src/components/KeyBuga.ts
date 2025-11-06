

export function renderKeyBody(){
    const THEME = document.documentElement.getAttribute("data-theme");
    const savedTheme = THEME === "dark" ? localStorage.getItem("theme"):THEME;
    const container = document.createElement('div');
    container.className = 'msg-key-ai';
    container.style.cssText = `
        display: flex;
        align-items: center;  
        justify-content: center;
        flex-direction: column;
        width: 100%;
        gap: 10px;
        padding-top :70px;
        
    `;

    const avatar = document.createElement('div');
    avatar.className = 'key-avatar';
    avatar.style.cssText = `
        flex-shrink: 0;
        width: 130px;
        height: 130px;
        border-radius: 50%;
        background: ${savedTheme?.trim() === "light" ? "rgb(224, 224, 224)" : "rgb(33, 33, 33)"};
        border: 1px solid #af4c0f;
        color:rgb(255, 123, 0);
        display: grid;
        place-content: center;
    `;
    // bordure possible a utiliser border: 1px solid rgb(255, 123, 0)
    avatar.innerHTML = `
        <svg viewBox="0 0 500 500" width="100" height="100">
            <defs>
                <bx:grid x="-0.005" y="-0.007" width="17.799" height="17.799"></bx:grid>
                <radialGradient id="bodyGradient" cx="0.3" cy="0.3">
                    <stop offset="0" stop-color="rgba(255,255,255,0.2)"></stop>
                    <stop offset="0.7" stop-color="rgba(255,255,255,0)"></stop>
                    <stop offset="1" stop-color="rgba(0,0,0,0.1)"></stop>
                </radialGradient>
            </defs>
            <g transform="matrix(5.561072, 0, 0, 5.436045, -1134.191146, -691.766897)">
                <path style="stroke-width: 0; stroke: rgb(0, 0, 0); fill: rgb(243, 208, 0); transform-origin: 262.823px 214.595px;" d="M 270.98 209.416 L 272.655 212.089 C 272.655 212.089 273.505 214.183 272.527 215.628 C 271.376 217.327 265.864 216.084 265.864 216.084 L 260.525 214.956 C 260.525 214.956 261.099 218.886 258.98 219.345 C 256.917 219.794 254.903 217.133 254.903 217.133 L 252.648 213.377 L 270.98 209.416 Z"></path>
                <path style="stroke-width: 0; stroke: rgb(0, 0, 0); fill: rgb(243, 208, 0); transform-origin: 234.706px 214.61px;" d="M 242.863 219.789 L 244.538 217.116 C 244.538 217.116 245.388 215.022 244.41 213.577 C 243.259 211.878 237.747 213.121 237.747 213.121 L 232.408 214.249 C 232.408 214.249 232.982 210.319 230.863 209.86 C 228.8 209.411 226.786 212.072 226.786 212.072 L 224.531 215.828 L 242.863 219.789 Z" transform="matrix(-1, 0, 0, -1, 0.000025, -0.000001)"></path>
                <path style="stroke: rgb(0, 0, 0); stroke-width: 0px; fill: rgb(255, 89, 0);" d="M 214.795 183.334 C 214.795 183.334 210.422 187.083 208.628 189.316 C 207.053 191.276 205.035 194.897 204.316 197.306 C 203.7 199.37 204.554 202.496 207.111 203.418 C 209.558 204.301 211.119 199.475 213.224 198.005 C 216.565 195.672 222.829 190.494 222.829 190.494 L 214.795 183.334 Z"></path>
                <path style="stroke: rgb(0, 0, 0); stroke-width: 0; fill: rgb(255, 89, 0); transform-box: fill-box; transform-origin: 50% 50%;" d="M 286.147 203.559 C 286.147 203.559 281.774 199.81 279.98 197.577 C 278.405 195.617 276.387 191.996 275.668 189.587 C 275.052 187.523 275.906 184.397 278.463 183.475 C 280.91 182.592 282.471 187.418 284.576 188.888 C 287.917 191.221 294.181 196.399 294.181 196.399 L 286.147 203.559 Z" transform="matrix(-1, 0, 0, -1, 0.00003, 0)"></path>
                <path style="stroke: rgb(0, 0, 0); stroke-width: 0px; fill: rgb(255, 89, 0); transform-box: fill-box; transform-origin: 50% 50%;" d="M 248.886 145.334 C 248.886 145.334 243.528 145.721 238.104 144.848 C 236.968 144.666 235.159 143.093 235.141 141.742 C 235.118 140.089 236.04 138.628 237.28 137.858 C 239.208 136.661 242.796 137.082 242.796 137.082 L 249.792 139.606 C 249.792 139.606 243.886 136.374 243.371 133.199 C 243.053 131.237 243.787 129.807 245.265 128.831 C 247.09 127.625 249.599 129.115 251.602 129.996 C 253.3 130.742 254.932 131.638 255.718 133.49 C 256.228 134.693 256.073 136.906 256.073 136.906 C 256.073 136.906 255.4 141.227 255.553 142.81 C 255.669 144.01 256.624 145.042 256.624 145.042 L 248.886 145.334 Z" transform="matrix(0.99514, 0.098475, -0.098474, 0.99514, 0, 0.000001)"></path>
                <path style="stroke: rgb(0, 0, 0); fill: rgb(255, 89, 0); stroke-width: 0px;" d="M 221.952 208.756 C 215.297 203.953 209.852 181.324 215.614 166.206 C 220.963 152.172 237.326 145.408 237.326 145.408 C 237.326 145.408 245.017 142.757 249.004 142.761 C 253.373 142.765 261.794 145.687 261.794 145.687 C 261.794 145.687 278.149 152.67 283.166 167.184 C 288.662 183.082 282.645 206.735 277.108 209.183 C 270.014 212.321 258.79 214.911 249.688 214.84 C 240.828 214.771 229.057 213.883 221.952 208.756 Z"></path>
                <ellipse cx="248.719" cy="179.475" rx="36.658" ry="35.77" fill="url(#bodyGradient)" style="stroke-width: 1;"></ellipse>
                <circle cx="375.587" cy="210.725" r="28" fill="white" style="stroke-width: 1;" transform="matrix(0.395086, 0, 0, 0.437781, 117.046858, 82.125792)"></circle>
                <circle cx="375.587" cy="210.725" r="28" fill="white" style="stroke-width: 1;" transform="matrix(0.395086, 0, 0, 0.437781, 84.573279, 82.233588)"></circle>
                <circle cx="359.471" cy="205.192" r="16" fill="black" style="stroke-width: 1;" transform="matrix(0.465724, 0, 0, 0.569927, 67.650283, 56.82685)"></circle>
                <circle cx="360.326" cy="202.358" r="2.488" opacity="0.8" style="stroke-width: 0px; fill: rgb(255, 255, 255); paint-order: stroke markers;" transform="matrix(1.0062, 0, 0, 1.028435, -129.367079, -38.368335)"></circle>
                <circle cx="359.471" cy="205.192" r="16" fill="black" style="stroke-width: 1;" transform="matrix(0.465724, 0, 0, 0.569927, 96.264388, 56.688857)"></circle>
                <circle cx="360.326" cy="202.358" r="2.488" opacity="0.8" style="stroke-width: 0; fill: rgb(255, 255, 255); paint-order: stroke markers;" transform="matrix(1.0062, 0, 0, 1.028435, -101.795027, -38.007167)"></circle>
                <path style="stroke: rgb(0, 0, 0); stroke-width: 0px;" d="M 222.425 157.657 C 222.425 157.657 240.948 159.398 244.527 161.335 C 245.405 161.81 245.156 163.657 245.182 164.864 C 245.203 165.803 245.106 167.773 244.304 167.774 C 239.589 167.778 221.346 165.277 221.346 165.277 L 222.425 157.657 Z"></path>
                <path style="stroke: rgb(0, 0, 0); stroke-width: 0; transform-box: fill-box; transform-origin: 50% 50%;" d="M 254.515 166.549 C 254.515 166.549 271.2 165.075 274.424 163.434 C 275.217 163.031 274.991 161.466 275.014 160.444 C 275.033 159.649 274.946 157.98 274.224 157.979 C 269.976 157.975 253.544 160.094 253.544 160.094 L 254.515 166.549 Z" transform="matrix(-1, 0, 0, -1, 0.000025, -0.000011)"></path>
                <path style="stroke: rgb(0, 0, 0); fill: rgb(243, 208, 0); stroke-width: 0px;" d="M 244.02 184.261 C 243.8 183.287 245.153 182.729 245.71 182.624 C 247.361 182.312 250.451 182.188 252.424 182.547 C 253.302 182.707 254.585 183.304 254.329 184.295 C 254.173 184.898 253.261 185.447 252.667 185.943 C 251.122 187.235 249.192 188.428 249.192 188.428 L 245.308 185.821 C 245.308 185.821 244.201 185.067 244.02 184.261 Z"></path>
            </g>
        </svg>
    `;

    const name = document.createElement('div');
    name.className = 'ai-name';
    name.style.cssText = `
        width: 100%;
        text-align: center;
        padding: 15px 0  ;
    `;

    const spanName = document.createElement("span")
    spanName.textContent = "BUGA Assistant"
    spanName.style.cssText = `
        color: azure;
        font-family: "Orbitron", sans-serif;
        font-optical-sizing: auto;
        font-weight: 700;
        font-style: normal;
        font-size: larger;
    `;

   name.appendChild(spanName);

    const bubble = document.createElement('div');
    bubble.className = 'key-bubble';
    bubble.textContent = 'Enter your AI Studio API key to start an intelligent conversation with Buga, your advanced AI assistant';
    bubble.style.cssText = `
        max-width: 80%;
        padding: 10px 14px;
        background: ${savedTheme?.trim() === "light" ? "rgb(224, 224, 224)" : "rgb(33, 33, 33)"} ;
        color: ${savedTheme?.trim() === "light" ? "rgba(48, 48, 48, 1)" : " #eee"} ;
        font-size: 14px;
        line-height: 1.45;
        word-break: break-word;
        margin-bottom: 20px;
        font-family: "Space Grotesk", sans-serif;
        font-optical-sizing: auto;
        font-weight: 300;
        font-style: normal;
        font-size: 14px;
        border-radius: 8px ;
        border: 1px solid ${savedTheme?.trim() === "light" ? "#af4c0f" : " #3a3a3a"} ;
    `;

    container.appendChild(avatar);
    container.appendChild(name);
    container.appendChild(bubble);

    return container;
}
export function renderKeyInput() {
    const THEME = document.documentElement.getAttribute("data-theme");
    const savedTheme = THEME === "dark" ? localStorage.getItem("theme"):THEME;

    const keyContainer = document.createElement('div');
    keyContainer.className = 'key-container';
    keyContainer.style.cssText = `
        position: absolute;
        bottom: 15px;
        left : 18px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        border-radius: 18px;
        width: 91%;
        max-width: 390px;
        min-height: 40px;
        max-height: 430px;
        background: ${savedTheme?.trim() === "light" ? "#dfdfdf" : "rgb(33, 33, 33)"};
        border: 1px solid ${savedTheme?.trim() === "light" ? "#af4c0f" : "#3a3a3a"} ;
        overflow: hidden;
        
    `;

    const keyZone = document.createElement('div');
    keyZone.className = 'key-zone';
    keyZone.setAttribute("contenteditable", "true");
    keyZone.style.cssText = `
        cursor: text ;
        display: block;
        align-self: stretch;
        min-width: 0px;
        white-space: pre-wrap;
        overflow-wrap: break-word;
        word-break: break-word;
        min-height: 70px;
        max-height: 430px;
        background: ${savedTheme?.trim() === "light" ? "#dfdfdf" : "rgb(33, 33, 33)"};
        border: none;
        padding: 15px;
        box-sizing: border-box;
        overflow-y: auto;
        color: rgb(136, 136, 136);
        font-size: 14px;
        line-height: 1.55;
        outline: none;

        font-family: "Space Grotesk", sans-serif;
        font-optical-sizing: auto;
        font-weight: 300;
        font-style: normal;
        font-size: 14px;

        min-height: 40px;
        max-height: 420px;
        width: 340px;
        border-right: 1px solid ${savedTheme?.trim() === "light" ? "#af4c0f" : "#383838"} ;

        scrollbar-width: none;
        -ms-overflow-style: none;
        
    `;

    const placeholderText = 'Enter your ai studio key';
    keyZone.textContent = placeholderText ;

    keyZone.addEventListener("focus", () => {
        const savedTheme = localStorage.getItem("theme") || document.documentElement.getAttribute("data-theme");
        //const savedTheme = localStorage.getItem("theme");
        if (keyZone.textContent === placeholderText) {
            keyZone.textContent = "";
            keyZone.style.color = ` ${savedTheme?.trim() === "dark" ? "#ffffffff" : "#000000ff"}`; 
            sendKey.classList.remove("desabledDIV")
            }
    });

    keyZone.addEventListener("blur", () => {
    if ((keyZone.textContent ?? "").trim() === "") {
        keyZone.textContent = placeholderText;
        keyZone.style.color = "rgb(136, 136, 136)"; 
        sendKey.classList.add("desabledDIV");
    }
    });
    
    const sendKey = document.createElement('div');
    sendKey.className = 'sendKey desabledDIV';
    sendKey.innerHTML = `
        <svg id="sendSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path transform="rotate(-45, 12, 12)" fill="currentColor" d="m.172,3.708C-.216,2.646.076,1.47.917.713,1.756-.041,2.951-.211,3.965.282l18.09,8.444c.97.454,1.664,1.283,1.945,2.273H4.048L.229,3.835c-.021-.041-.04-.084-.057-.127Zm3.89,9.292L.309,20.175c-.021.04-.039.08-.054.122-.387,1.063-.092,2.237.749,2.993.521.467,1.179.708,1.841.708.409,0,.819-.092,1.201-.279l18.011-8.438c.973-.456,1.666-1.288,1.945-2.28H4.062Z"></path>
        </svg>
    `;
    sendKey.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0px 0px 18px 18px;
        min-height: 40px;
        color: ${savedTheme?.trim() === "light" ? "#000000" : "rgb(255, 255, 255)"};
        margin: 0;
        width: 50px;
        max-height: 430px;
        cursor: pointer;
    `;



    sendKey.addEventListener("click", () => {
        const svg = sendKey.querySelector("svg") as SVGElement;
        if (svg.classList.contains("fly")) {
            return; 
        }
        svg.classList.add("fly");
        setTimeout(() => {
            keyZone.textContent = placeholderText;
            keyZone.style.color = "#888"; 
            sendKey.classList.add("desabledDIV");
            svg.classList.remove("fly");
        }, 1000); 

    });


    keyContainer.appendChild(keyZone);
    keyContainer.appendChild(sendKey);

    

    return keyContainer;
}

export function renderSvgDecoratif(){
    const THEME = document.documentElement.getAttribute("data-theme");
    const savedTheme = THEME === "dark" ? localStorage.getItem("theme"):THEME;
    // creation du svg décoratif
    const svgWrapper = document.createElement("div");
    svgWrapper.classList.add("svg-popup");
    svgWrapper.style.cssText = `
        position: absolute !important;
        bottom: 10px !important;
        right: 0 !important;
        z-index: -2;
        pointer-events: none;
    `;
    svgWrapper.innerHTML = `
        <svg class ="svgDecoratif" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" height="100" width="100">
            <path id="svgPath"style="fill: ${savedTheme?.trim() === "light" ? " #ffffffff" : "rgb(26, 26, 26)"}; stroke-linejoin: round; stroke: ${savedTheme?.trim() === "light" ? " #af4c0f" : "#383838"}; stroke-width: 5px;" 
                d="M 395.459 47.761 C 395.5 51.656 396.117 118.826 395.599 125.041 C 393.443 150.924 494.525 247.588 494.72 250.427 C 494.936 253.581 390.678 331.998 395.52 376.216 C 395.779 378.581 395.707 444.573 395.654 446.804 C 394.936 477.075 305.155 500.765 305.155 500.765 L 305.462 0.001 C 305.462 0.001 395.128 16.411 395.459 47.761 Z">
            </path>
        </svg>
    `;
    

    return svgWrapper
}