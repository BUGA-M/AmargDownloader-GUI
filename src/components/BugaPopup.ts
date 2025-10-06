import {renderKeyInput} from "./KeyBuga"
import {renderKeyBody} from "./KeyBuga"
import {renderSvgDecoratif} from "./KeyBuga"
import { togglePopup } from "./Popupmanager";

function loadGoogleFonts() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&family=Space+Grotesk:wght@300..700&display=swap";
  document.head.appendChild(link);
}


export function bugaPopup() {
    // LOADING DES FONT FAMILY
    loadGoogleFonts();
    const savedTheme = localStorage.getItem("theme");

    // creation du container principal
    const container = document.createElement("div");
    //container.classList.add("container");
    container.classList.add("buga-popup");
    container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 115px;
        min-width: 400px;
        max-width: 400px;
        min-height: 500px;
        max-height: 500px;
        display: flex;
        transform: translateY(100px);
        transition: opacity 1s ease, transform 1s ease;
        opacity:0;
        z-index: -99999;
        pointerEvents : "none";
        display = "none";
    `;

    // creation du left-container
    const leftContainer = document.createElement("div");
    leftContainer.classList.add("left-container");
    leftContainer.style.cssText = `
        width: 95%;
        min-height: 500px;
        max-height: 500px;
        border-radius: 15px;
        border: 1px solid ${savedTheme?.trim() === "light" ? "#af4c0f" : "#383838"};
        z-index: -2;
    `;

    // creation du right-container
    const rightContainer = document.createElement("div");
    rightContainer.classList.add("right-container");
    rightContainer.style.cssText = `
        width: 5%;
        min-height: 500px;
        max-height: 500px;
        background: transparent;
    `;

    
    //---------------------------------- supprimable -----------------------------------------
    // creation du left-container
    const leftContainerhider = document.createElement("div");
    leftContainerhider.classList.add("container-hide-svg");
    leftContainerhider.style.cssText = `
        position:relative;
        width: 100%;
        min-height: 498px;
        max-height: 498px;
        background: ${savedTheme?.trim() === "light" ? "linear-gradient(145deg, #ffffffff, #ffffffff)" : "linear-gradient(145deg, rgb(18, 18, 18), rgb(26, 26, 26))"};
        border-radius: 15px;
        
    `;
    leftContainer.appendChild(leftContainerhider);
    //---------------------------------------------------------------------------------------

    
    //--------------------------------------- assemblage------------------------------------------------

    
    
    // on assemble les containers
    container.appendChild(leftContainer);
    container.appendChild(rightContainer);

     // ajoute du svg decoratif
    const SvgDecoratif = renderSvgDecoratif()
    leftContainer.appendChild(SvgDecoratif)
    // on ajoute tout au body
    document.body.appendChild(container);

    //const header = chatPopup()
    //leftContainerhider.appendChild(header);

    const closeBtn = closeButton()
    leftContainerhider.appendChild(closeBtn)

    const keyComponent =  renderKeyBody();
    const inputKey = renderKeyInput()
    

    leftContainerhider.appendChild(keyComponent)
    leftContainerhider.appendChild(inputKey)
    
    
}

function closeButton(){
    const savedTheme = localStorage.getItem("theme");
    // Enhanced close button
    const closeButton = document.createElement("button");
    closeButton.classList.add("closeBuga")
    // closeButton.setAttribute("data-theme","")
    closeButton.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="m18 6-12 12M6 6l12 12"/>
        </svg>
    `;
    closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: ${savedTheme?.trim() === "light" ? "#e0e0e0" : "rgb(51, 51, 51)"} ;
        border: none;
        width: 33px;
        height: 33px;
        border-radius: 10px;
        color: ${savedTheme?.trim() === "light" ? "#000000ff" : "rgba(255, 255, 255, 1)"};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        backdrop-filter: blur(20px);
        z-index: 2;
        border: 1px solid rgb(99, 99, 99);
    `;


    closeButton.addEventListener('mouseenter', () => {
        const savedTheme = localStorage.getItem("theme");
        closeButton.style.background = `${savedTheme?.trim() === "light" ? "#af4c0f" : "rgb(99, 99, 99)"} `;
        closeButton.style.transform = 'scale(1.1) rotate(90deg)';
        closeButton.style.boxShadow = ` 0 4px 20px ${savedTheme?.trim() === "light" ? "#c9c9c9ff" : "rgba(255, 255, 255, 0.15)"} `;
    });

    closeButton.addEventListener('mouseleave', () => {
        const savedTheme = localStorage.getItem("theme");
        closeButton.style.background =  `${savedTheme?.trim() === "light" ? "#e0e0e0" : "rgb(51, 51, 51)"} `;
        closeButton.style.transform = 'scale(1) rotate(0deg)';
        closeButton.style.boxShadow = 'none';
    });

    closeButton.addEventListener("click", () => togglePopup("close"));

    return closeButton
}