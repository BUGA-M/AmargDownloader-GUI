// @ts-ignore
import { invoke } from "@tauri-apps/api/core";
import { readTextFile } from '@tauri-apps/plugin-fs';
import { appDataDir } from '@tauri-apps/api/path';
import { join } from '@tauri-apps/api/path';
import { showDownloadSpinner, updateSpinnerText,stopDownloadSpinner } from  './SimpleProgress'; 
import { customAlert } from './customAlert';
import { removeVideoFromList,clearVideoList } from '../main';


interface VideoData {
    id: string;
    title: string;
    author: string;
    duration: string;
    size: string;
    quality: string;
    format:string;
    url: string;
    thumbnail: string;
}

let manuallySelectedCards: HTMLElement[] = [];
let autoSelectedCards: HTMLElement[] = [];
let selectedCards: HTMLElement[] = [];
//let nbSelected = 0;

function createCustomVideoAlert(videos: VideoData[], title: string = "Downloads Schedule"): HTMLDivElement {
    let currenTTheme = localStorage.getItem("theme")

    const overlay = document.createElement("div");
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(18, 18, 18, 0.85);
        backdrop-filter: blur(8px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        animation: fadeIn 0.4s ease forwards;
        padding: 20px;
        box-sizing: border-box;
    `;

    // Animation CSS
    const style = document.createElement("style");
    style.textContent = `
        @keyframes fadeIn {
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
    `;
    document.head.appendChild(style);

    const alertContainer = document.createElement("div");
    alertContainer.style.cssText = `
        background: linear-gradient(135deg, #ff0000ff 0%, #1a1a1a 100%);
        border: 1px solid #2c2c2cff;
        border-radius: 24px 24px 8px 24px;
        max-width: 95vw;
        max-height: 90vh;
        width: 1200px;
        overflow: hidden;
        animation: slideUp 0.5s ease forwards;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6), 
                    0 0 0 1px rgba(255, 255, 255, 0.08);
    `;

    // Header de l'alert
    // Header redesigné avec bouton "Supprimer tout" et couleurs originales
    const header = document.createElement("div");
    header.style.cssText = `
        background: linear-gradient(135deg, #af4c0f 0%, #ff6600 100%);
        padding: 24px 32px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255, 102, 0, 0.2);
        position: relative;
    `;

    // Container gauche avec titre
    const leftContainer = document.createElement("div");
    leftContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 20px;
    `;

    const headerTitle = document.createElement("h2");
    headerTitle.textContent = title;
    headerTitle.style.cssText = `
        color: white;
        font-size: 24px;
        font-weight: 700;
        margin: 0;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        letter-spacing: -0.5px;
    `;

    const headerStats = document.createElement("div");
    headerStats.classList.add("header-stats");
    headerStats.textContent = `${videos.length} vidéo${videos.length > 1 ? 's' : ''}`;
    headerStats.style.cssText = `
        background: rgba(255,255,255,0.2);
        padding: 8px 18px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;
        backdrop-filter: blur(10px);
        color: white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;

    leftContainer.appendChild(headerTitle);
    leftContainer.appendChild(headerStats);

    // Container droite avec boutons
    const rightContainer = document.createElement("div");
    rightContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
    `;

    

    const closeButton = document.createElement("button");
    closeButton.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
    `;
    closeButton.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: none;
        border-radius: 12px;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;

    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.background = 'rgba(255, 255, 255, 0.3)';
        closeButton.style.transform = 'scale(1.1) rotate(90deg)';
    });

    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.background = 'rgba(255, 255, 255, 0.1)';
        closeButton.style.transform = 'scale(1) rotate(0deg)';
    });

    closeButton.addEventListener('click', () => {
        overlay.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => overlay.remove(), 300);
    });

    rightContainer.appendChild(closeButton);

    header.appendChild(leftContainer);
    header.appendChild(rightContainer);



    // Content area
    const content = document.createElement("div");
    content.classList.add("customAlert")
    content.style.cssText = `
        padding: 32px;
        max-height: calc(90vh - 120px);
        overflow-y: auto;
        background: ${currenTTheme?.trim() === "light" ? "#ffffff" : "#1a1a1a"};
        position : relative;
    `;

    // Grid pour les cartes
    const cardsGrid = document.createElement("div");
    cardsGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 24px;
        justify-items: stretch;
        transform : translateY(0);

        @media (max-width: 768px) {
            grid-template-columns: 1fr;
        }

        @media (min-width: 769px) and (max-width: 1024px) {
            grid-template-columns: repeat(2, 1fr);
        }

        @media (min-width: 1025px) {
            grid-template-columns: repeat(3, 1fr);
        }

    `;

            
    // check box tous selectioner
    const { checkbox, textContainer } = createModernCheckbox(
        "Select",
        false,
        "Select All",
        ""
    )

    // Fonction pour mettre à jour l'apparence du checkbox
    const updateCheckboxAppearance = () => {
        if (checkbox.checked) {
            checkbox.style.background = "linear-gradient(135deg, #f55e00ff, #ff9900ff)";
            checkbox.innerHTML = `
                <svg style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 16px; height: 16px;" 
                    viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round">
                    <polyline points="20,6 9,17 4,12"/>
                </svg>
            `;
        } else {
            checkbox.style.background = "transparent";
            checkbox.innerHTML = "";
        }
    };

    
    const updateSelectionAllDisplay = () => {
        selectedCards = [...manuallySelectedCards, ...autoSelectedCards];

        const hasRealSelection = selectedCards.length > 0;

        if (!hasRealSelection && checkbox.checked) {
            checkbox.checked = false;
            updateCheckboxAppearance();
        }   

        // Modifier les styles avec transition
        cardsGrid.style.transform = hasRealSelection ? "translateY(70px)" : "translateY(0)";
        cardsGrid.style.transition = "all 0.6s ease-out";
        cardsGrid.style.padding = hasRealSelection ? "0 0 35px 0" : "0";
        
        // Ajouter une transition pour l'opacité
        selectionnerALL.style.transition = "all 0.6s ease-out";
        selectionnerALL.style.visibility = hasRealSelection ? "visible" : "hidden"; // Ajouter visibility
        selectionnerALL.style.opacity = hasRealSelection ? "1" : "0";
        selectionnerALL.style.transform = hasRealSelection ? "scale(1)" : "scale(0.8)";

        const deleteAllBtn = deleteAllButton as HTMLButtonElement;
        deleteAllBtn.disabled = checkbox.checked ? false : hasRealSelection;
        if (checkbox.checked === true) {
            deleteAllBtn.classList.remove("desabledDIV");
        }else {
            deleteAllBtn.classList.add("desabledDIV");
        }

         //------------------------------------------------------------//
        //--- Test d'affichage des cartes choisis en cas de Delete ---//
       //------------------------------------------------------------//
        
        //const lesCartes = selectedCards as any[];
        //lesCartes.forEach((carte, index) => {
        //if (carte.videoData) {
        //    console.log("id : ", carte.videoData.id);
        //} else {
        //    console.warn(`videoData manquant pour la carte à l'index ${index}`);
        //}
        //});


    };




    // Création des cartes avec bouton suppression
    videos.forEach((video, index) => {
        const card = createVideoCardWithDelete(video, index,updateSelectionAllDisplay);
        
        cardsGrid.appendChild(card);
    });




    // Div pour selectionner tous
    const selectionnerALL = document.createElement("div");
    selectionnerALL.style.cssText = `
        position : absolute;
        top : 30px;
        left: 30px;
        margin:0 0 32px 0;
        border: ${currenTTheme?.trim() === "light" ? "1px solid rgba(0, 0, 0, 0.2)" : "1px solid rgba(255, 255, 255, 0.2)"};
        border-radius: 20px;
        padding : 8px 10px ;
        min-width : 300px;
        max-height: 120px;
        background: ${currenTTheme?.trim() === "light" ? "#ffffff" : "#1a1a1a"};
        display : flex;
        justify-content: space-between ; 
        align-items : center;
        opacity : 0;
        transform: scale(0.8);
    `;

    selectionnerALL.appendChild(checkbox)
    selectionnerALL.appendChild(textContainer)




    // Bouton "Supprimer tout" (seulement si des vidéos existent)
    let deleteAllButton : HTMLButtonElement;
    if (videos.length > 0) {
        deleteAllButton = document.createElement("button");
        deleteAllButton.classList.add("Delete-All-btn-red")
        deleteAllButton.disabled = true; 
        deleteAllButton.title = "Delete All Selected Videos";
        deleteAllButton.classList.add("desabledDIV");
        deleteAllButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 6px;">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" 
                      stroke="currentColor" stroke-width="2"/>
                <path d="M10 11v6M14 11v6" 
                      stroke="currentColor" stroke-width="2"/>
            </svg>
            Delete All
        `;
        deleteAllButton.style.cssText = `
            background: rgba(255, 69, 58, 0.9);
            color: white;
            border: none;
            border-radius: 12px;
            padding: 10px 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 13px;
            font-weight: 600;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 12px rgba(255, 69, 58, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;

        deleteAllButton.addEventListener("mouseenter", () => {
            deleteAllButton.style.background = "rgba(255, 69, 58, 1)";
            deleteAllButton.style.transform = "translateY(-2px)";
            deleteAllButton.style.boxShadow = "0 6px 18px rgba(255, 69, 58, 0.5)";
        });

        deleteAllButton.addEventListener("mouseleave", () => {
            deleteAllButton.style.background = "rgba(255, 69, 58, 0.9)";
            deleteAllButton.style.transform = "translateY(0)";
            deleteAllButton.style.boxShadow = "0 4px 12px rgba(255, 69, 58, 0.4)";
        });

        // Événement de clic pour supprimer toutes les vidéos
        deleteAllButton.addEventListener("click", () => {
            // Créer une confirmation personnalisée
            const confirmOverlay = document.createElement("div");
            confirmOverlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100;
                border-radius: 24px 24px 8px 24px;
            `;

            const confirmBox = document.createElement("div");
            confirmBox.style.cssText = `
                background: ${currenTTheme?.trim() === "light" ? "#ffffff" : "#1a1a1a"};
                padding: 24px;
                border-radius: 16px;
                border: 1px solid ${currenTTheme?.trim() === "light" ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)"};
                text-align: center;
                max-width: 320px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            `;

            confirmBox.innerHTML = `
                <h3 style="margin: 0 0 12px 0; color:${currenTTheme?.trim() === "light" ? "#000000ff" : "#ffffffff"}; font-size: 18px;">Confirmation</h3>
                <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">Are you sure you want to delete all videos?</p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button id="cancelBtn" style="
                        background: #f0f0f0;
                        color: #333;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                    ">Cancel</button>
                    <button id="confirmBtn" style="
                        background: #ff3b30;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                    ">Delete</button>
                </div>
            `;

            confirmOverlay.appendChild(confirmBox);
            alertContainer.appendChild(confirmOverlay);


            // Événements des boutons de confirmation
            const cancelBtn = confirmBox.querySelector("#cancelBtn") as HTMLButtonElement;
            const confirmBtn = confirmBox.querySelector("#confirmBtn") as HTMLButtonElement;

            if (cancelBtn) {
                cancelBtn.addEventListener("click", () => {
                    confirmOverlay.remove();
                });
            }

            if (confirmBtn) {
                confirmBtn.addEventListener("click", () => {
                    // Ici vous pouvez ajouter la logique pour supprimer toutes les vidéos
                    delete_temp_dwl();
                    clearVideoList();
                    localStorage.setItem("numberOfVideos",'0');
                    localStorage.setItem("Type",'single');
                    const btnDwlAll = document.getElementById("download-btn") as HTMLDivElement
                    btnDwlAll.textContent =  `Start Bash Download ( ${localStorage.getItem("numberOfVideos")} )`
                    
                    confirmOverlay.remove();
                    // Optionnel : fermer la modal après suppression
                    closeButton.click();
                });
            }
        });
    selectionnerALL.appendChild(deleteAllButton);    
    }

    content.appendChild(selectionnerALL)


    checkbox.addEventListener("change", () => {
        const cards = document.querySelectorAll<HTMLElement>('.allow-right-click');
        const trashBtns = document.querySelectorAll<HTMLElement>('.Delete-btn-red');

        if (checkbox.checked) {
            // "Select All" → toutes les cartes qui ne sont pas déjà sélectionnées manuellement
            autoSelectedCards = Array.from(cards).filter(
                card => !manuallySelectedCards.includes(card)
            );
        } else {
            // décocher la case → vider uniquement la sélection auto
            autoSelectedCards = [];
        }

        // Recomposer la sélection globale
        selectedCards = [...manuallySelectedCards, ...autoSelectedCards];

        // Mettre à jour l’affichage de toutes les cartes
        cards.forEach((card, index) => {
            const isSelected = selectedCards.includes(card);

            card.style.border = isSelected
                ? '2px solid #00ffbf'
                : '1px solid rgba(255, 102, 0, 0.2)';

            card.style.boxShadow = isSelected
                ? `
                    0 20px 40px rgba(0,0,0,0.4),
                    0 0 0 2px #00ffbf50,
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `
                : `
                    0 8px 32px rgba(0,0,0,0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `;

            trashBtns[index].style.opacity = isSelected ? "1" : "0";
            trashBtns[index].style.transform = isSelected ? "scale(1)" : "scale(0.8)";
        });

        updateSelectionAllDisplay?.();
    });


    

    // Message si aucune vidéo
    if (videos.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.style.cssText = `
            text-align: center;
            padding: 60px 20px;
            font-family: "Orbitron", sans-serif;
            font-optical-sizing: auto;
            font-weight: 700;
            font-style: normal;
            font-size: larger;
        `;
        emptyState.innerHTML = `
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style="color: #ff6600; margin-bottom: 16px;">
            <path d="M23 7l-7 5 7 5V7z" stroke="currentColor" stroke-width="2"/>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
            </svg>
            <h3 id="no-vd-fnd" style="font-size: 18px; margin: 0 0 6px 0;">No videos found</h3>
            <p id="no-vd-fnd" style="margin: 0; font-size: 14px; opacity: .8;">Add some videos to get started</p>
        `;
        content.appendChild(emptyState);
    } else {
        content.appendChild(cardsGrid);
    }


    alertContainer.appendChild(header);
    alertContainer.appendChild(content);
    overlay.appendChild(alertContainer);

    // Fermer en cliquant sur l'overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeButton.click();
        }
    });

    return overlay;
}

function createVideoCardWithDelete(videoData: VideoData, index: number, updateSelectionAllDisplay: () => void): HTMLDivElement {
  let currenTTheme = localStorage.getItem('theme')
  const card = document.createElement("div");
  card.style.cssText = `
      background: ${currenTTheme?.trim() === "light" ? "#ffffff" : "#1a1a1a"};
      border: 1px solid rgba(255, 102, 0, 0.2);
      border-radius: 20px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      height: 420px;
      min-width: 280px;
      flex: 1;
      animation: slideUp 0.6s ease forwards;
      animation-delay: ${index * 0.1}s;
      opacity: 0;
      box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
  `;
  card.title = "Double-click a card to select it"
  card.classList.add('allow-right-click');
  
  // 🚀 AJOUT IMPORTANT : Stocker les données vidéo dans l'élément
  (card as any).videoData = videoData;

  // Bouton de suppression en haut à droite
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("Delete-btn-red")

  deleteButton.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke="currentColor" stroke-width="2"/>
          <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2"/>
      </svg>
  `;
  deleteButton.style.cssText = `
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(255, 69, 58, 0.9);
      color: white;
      border: none;
      border-radius: 10px;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      z-index: 10;
      opacity: 0;
      transform: scale(0.8);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 12px rgba(255, 69, 58, 0.4);
  `;

  // Animation au hover de la carte
  card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px) scale(1.02)';
      card.style.cursor = "pointer";
  });

  card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
      card.style.cursor = "default";
  });


  //------------------------------------------------ Selection toogle -------------------------------------------------------

    // -----------------------------
    // Double-click pour sélectionner
    // -----------------------------

    //let isSelected = false;

    card.addEventListener("dblclick", () => {
        const inManual = manuallySelectedCards.includes(card);
        const inAuto = autoSelectedCards.includes(card);
        let isSelected = false;

        if (inManual) {
            manuallySelectedCards = manuallySelectedCards.filter(c => c !== card);
        } else if (inAuto) {
            autoSelectedCards = autoSelectedCards.filter(c => c !== card);
        } else {
            manuallySelectedCards.push(card);
            isSelected = true;
        }

        // recomposer la sélection globale
        selectedCards = [...manuallySelectedCards, ...autoSelectedCards];

        isSelected = selectedCards.includes(card);

        // styles
        card.style.border = isSelected
            ? '2px solid #00ffbf'
            : '1px solid rgba(255, 102, 0, 0.2)';

        card.style.boxShadow = isSelected
            ? `
                0 20px 40px rgba(0, 0, 0, 0.4),
                0 0 0 2px #00ffbf50,
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `
            : `
                0 8px 32px rgba(0, 0, 0, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `;

        deleteButton.style.opacity = isSelected ? "1" : "0";
        deleteButton.style.transform = isSelected ? "scale(1)" : "scale(0.8)";

        updateSelectionAllDisplay?.();
    });




    //------------------ Animation du bouton de suppression -------------------
    deleteButton.addEventListener('mouseenter', () => {
        deleteButton.style.background = 'rgba(255, 69, 58, 1)';
        deleteButton.style.transform = 'scale(1.1)';
        deleteButton.style.animation = 'pulse 1s infinite';
    });

    deleteButton.addEventListener('mouseleave', () => {
        deleteButton.style.background = 'rgba(255, 69, 58, 0.9)';
        deleteButton.style.transform = 'scale(1)';
        deleteButton.style.animation = 'none';
    });

    // Événement de clic pour supprimer la vidéo
    deleteButton.addEventListener("click", async (e) => {
        e.stopPropagation(); // Empêche la propagation du clic à la carte
        showDownloadSpinner("deleteProgress", {
            title: "Deleting from schedule...",
            message: "Removing video from the queue...",
        });
        
        try {
            updateSpinnerText("deleteProgress", {
                title: "Cleaning up...",
                message: "Video is being deleted from the queue (60%)",
            });

            const headerStats = document.querySelector(".header-stats") as HTMLDivElement;
            const result: string = await invoke("delete_video_by_id", { id: videoData.id });

            if (result.includes("success") ) {
                updateSpinnerText("deleteProgress",{
                    title: "Video deleted Successfully",
                    message: "You can add, delete more videos or start downloading.",
                    stopAnimation: true,
                });
                // Récupérer et décrémenter le nombre de vidéos
                const currentCount = parseInt(localStorage.getItem("numberOfVideos") || "0", 10);
                const newCount = Math.max(0, currentCount - 1); 
                localStorage.setItem("numberOfVideos", newCount.toString());

                headerStats.textContent = `${newCount} vidéo${newCount !== 1 ? 's' : ''}`;

                // Mettre à jour le bouton "Download All"
                const btnDwlAll = document.getElementById("download-btn");
                if (btnDwlAll) {
                    btnDwlAll.textContent = `Start Bash Download (${newCount})`;
                }

                // Supprimer la carte de l'interface
                card.remove();
                // Si aucune vidéo restante, afficher le message d'état vide
                if (newCount === 0) {
                    
                    console.log("Aucune vidéo restante dans le planning.");
                    const content = document.querySelector(".customAlert") as HTMLDivElement;
                    const emptyState = document.createElement("div");
                    emptyState.style.cssText = `
                        text-align: center;
                        padding: 60px 20px;
                        color: rgba(255, 255, 255, 0.6);
                    `;
                    emptyState.innerHTML = `
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" style="color: #ff6600; margin-bottom: 20px;">
                            <path d="M23 7l-7 5 7 5V7z" stroke="currentColor" stroke-width="2"/>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <h3 style="color: ${currenTTheme?.trim() === "light" ? "#000000" : "rgb(255, 255, 255)"}; font-size: 20px; margin: 0 0 8px 0;">Aucune vidéo trouvée</h3>
                        <p style="color: ${currenTTheme?.trim() === "light" ? "#00000099" : "#ffffff99"};margin: 0; font-size: 16px;">Ajoutez des vidéos pour commencer</p>
                    `;
                    content.appendChild(emptyState);
                    
                    headerStats.textContent = `0 vidéo}`;
                    
                    localStorage.setItem("Type",'single');
                }

                // Nettoyer les sélections
                manuallySelectedCards = manuallySelectedCards.filter(c => c !== card);
                autoSelectedCards = autoSelectedCards.filter(c => c !== card);
                selectedCards = selectedCards.filter(c => c !== card);

                updateSelectionAllDisplay?.();
                stopDownloadSpinner("deleteProgress");
                
                const delresult = await removeVideoFromList(videoData.id);
                if (delresult) {
                    console.log(`Vidéo avec ID ${videoData.id} supprimée du planning.`);
                }
            }
        } catch (err) {
            stopDownloadSpinner("deleteProgress");
            customAlert(
                {
                    title: "Video Not Deleted",
                    subtitle: "Server Issue Detected",
                    message: `We encountered a problem while deleting the video from your schedule.

                    Possible solutions:
                    1️⃣ Wait a few seconds and retry.
                    2️⃣ Refresh your schedule to confirm the video is still there.

                    If the issue persists, please contact support.`
                },
                10000,
                "error"
            );

            console.error("Erreur lors de la suppression :", err);
        }
    });


    // Container du thumbnail
    const thumbnailContainer = document.createElement("div");
    thumbnailContainer.style.cssText = `
        position: relative;
        width: 100%;
        height: 200px;
        overflow: hidden;
        background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
    `;

    // Image thumbnail
    const thumbnail = document.createElement("img");
    thumbnail.src = videoData.thumbnail;
    thumbnail.alt = videoData.title;
    thumbnail.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.4s ease;
    `;

    // Overlay pour la durée
    const durationOverlay = document.createElement("div");
    durationOverlay.textContent = videoData.duration;
    durationOverlay.style.cssText = `
        position: absolute;
        bottom: 8px;
        left: 8px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        backdrop-filter: blur(8px);
    `;

    // Badge qualité
    const qualityBadge = document.createElement("div");
    qualityBadge.textContent = videoData.quality;
    qualityBadge.style.cssText = `
        position: absolute;
        bottom: 8px;
        right: 8px;
        background: linear-gradient(135deg, #f55e00, #ff9900);
        color: white;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 8px rgba(245, 94, 0, 0.4);
    `;

    thumbnailContainer.appendChild(thumbnail);
    thumbnailContainer.appendChild(durationOverlay);
    thumbnailContainer.appendChild(qualityBadge);
    thumbnailContainer.appendChild(deleteButton);

    // Container du contenu
    const contentContainer = document.createElement("div");
    contentContainer.style.cssText = `
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex: 1;
        background: ${currenTTheme?.trim() === "light"
    ? `linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(240, 240, 240, 0.95));
        backdrop-filter: blur(10px);
        border-radius: 24px 8px 24px 8px;`
    : `linear-gradient(145deg, rgba(30, 30, 30, 0.85), rgba(15, 15, 15, 0.95));
        backdrop-filter: blur(12px);
        border-radius: 24px 8px 24px 8px;`};
    `;

    // Titre
    const title = document.createElement("h3");
    title.textContent = videoData.title;
    title.style.cssText = `
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: ${currenTTheme?.trim() === "light" ? "#000000ff" : "#ffffff"};
        line-height: 1.4;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        text-overflow: ellipsis;
        min-height: 44px;
    `;

    // Auteur
    const author = document.createElement("div");
    author.innerHTML = `
        <span style="display: inline-flex; align-items: center; gap: 6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="color: #ff6600;">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            </svg>
            ${videoData.author}
        </span>
    `;
    author.style.cssText = `
        font-size: 14px;
        font-weight: 500;
        color: ${currenTTheme?.trim() === "light" ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.7)"};
    `;

    // Container pour les métadonnées
    const metaContainer = document.createElement("div");
    metaContainer.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 102, 0, 0.2);
    `;

    // Taille du fichier
    const size = document.createElement("span");
    size.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="color: #af4c0f; margin-right: 4px; vertical-align: middle;">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" stroke="currentColor" stroke-width="2"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
        </svg>
        ${videoData.size}
    `;
    size.style.cssText = `
        font-size: 12px;
        font-weight: 600;
        color: ${currenTTheme?.trim() === "light" ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.6)"} ;
        display: flex;
        align-items: center;
    `;

    // format du fichier
    const formatBadge = document.createElement("span");
    formatBadge.textContent = videoData.format.toUpperCase(); // "MP3" ou "MP4"
    formatBadge.style.cssText = `
        background: linear-gradient(
        135deg, 
        #af4c0f 0%,      /* ton orange foncé */
        #ff6600 30%,     /* orange vif */
        #ff9900 60%,     /* orange clair */
        #f55e00 80%,     /* rouge-orangé */
        #ff3333cc 100%   /* rouge saturé avec un peu de transparence */
        );
        color: white;
        padding: 10px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 800;
        margin-left: 8px;
        text-transform: uppercase;
        letter-spacing: 1px;
        position: absolute;
        right:70px;
        display: inline-block;
        box-shadow: 
            0 4px 12px rgba(255, 102, 0, 0.3),
            0 2px 4px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.2);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        transform: translateY(0);
        backdrop-filter: blur(8px);
    `;

    // Bouton de téléchargement
    const downloadBtn = document.createElement("button");
    downloadBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2"/>
            <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
        </svg>
    `;
    downloadBtn.style.cssText = `
        background: linear-gradient(135deg, #af4c0f, #ff6600);
        color: white;
        border: none;
        border-radius: 10px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(175, 76, 15, 0.3);
    `;

    downloadBtn.addEventListener('mouseenter', () => {
        downloadBtn.style.transform = 'scale(1.1)';
        downloadBtn.style.background = 'linear-gradient(135deg, #8b3a0f, #e55a00)';
        downloadBtn.style.boxShadow = '0 6px 16px rgba(175, 76, 15, 0.5)';
    });

    downloadBtn.addEventListener('mouseleave', () => {
        downloadBtn.style.transform = 'scale(1)';
        downloadBtn.style.background = 'linear-gradient(135deg, #af4c0f, #ff6600)';
        downloadBtn.style.boxShadow = '0 4px 12px rgba(175, 76, 15, 0.3)';
    });

    downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Ici tu pourras ajouter la logique de téléchargement
        console.log('Téléchargement de:', videoData.title);
    });

    // Assemblage de la carte
    metaContainer.appendChild(size);
    metaContainer.appendChild(downloadBtn);
    metaContainer.insertBefore(formatBadge, downloadBtn);

    contentContainer.appendChild(title);
    contentContainer.appendChild(author);
    contentContainer.appendChild(metaContainer);

    card.appendChild(thumbnailContainer);
    card.appendChild(contentContainer);

    return card;
}

// --------------- fn creat check box ---------------

function createModernCheckbox(id: string, checked: boolean, label: string, description?: string) {
  let savedTheme = localStorage.getItem("theme");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = id;
  checkbox.checked = checked;
  checkbox.style.cssText = `
      appearance: none;
      width: 24px;
      height: 24px;
      border: 2px solid ${savedTheme?.trim() === "light" ? "#af4c0f" : "#ff6600"};
      border-radius: 8px;
      background: "transparent";
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      flex-shrink: 0;
      margin-top: 2px;
      margin-right: 12px;
  `;

  if (checked) {
    checkbox.innerHTML = `
      <svg style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 16px; height: 16px;" 
          viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round">
          <polyline points="20,6 9,17 4,12"/>
      </svg>
    `;
  }

  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      checkbox.style.background = "linear-gradient(135deg, #f55e00ff, #ff9900ff)";
      checkbox.style.transform = "scale(1.15)";
      checkbox.innerHTML = `
        <svg style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 16px; height: 16px;" 
            viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round">
            <polyline points="20,6 9,17 4,12"/>
        </svg>
      `;
      setTimeout(() => {
        checkbox.style.transform = "scale(1)";
      }, 150);
    } else {
      checkbox.style.background = "transparent";
      checkbox.style.transform = "scale(0.95)";
      checkbox.innerHTML = "";
      setTimeout(() => {
        checkbox.style.transform = "scale(1)";
      }, 150);
    }
  });

  const textContainer = document.createElement("div");
  textContainer.style.cssText = `flex: 1;`;

  const labelElement = document.createElement("label");
  labelElement.textContent = label;
  labelElement.htmlFor = id;
  labelElement.style.cssText = `
      font-size: 16px;
      font-weight: 600;
      color: ${savedTheme?.trim() === "light" ? "#2d3748" : "#f7fafc"};
      cursor: pointer;
      display: block;
      margin-bottom: ${description && description.trim() ? "6px" : "0"};
      letter-spacing: -0.2px;
  `;

  textContainer.appendChild(labelElement);

  if (description && description.trim()) {
    const descElement = document.createElement("div");
    descElement.textContent = description;
    descElement.style.cssText = `
        font-size: 13px;
        color: ${savedTheme?.trim() === "light" ? "#718096" : "#a0aec0"};
        line-height: 1.5;
    `;
    textContainer.appendChild(descElement);
  }

  return { checkbox, textContainer };
}


export async function fetchTempDwl(): Promise<Record<string, VideoData>> {
  try {
    const dir  = await appDataDir();
    const path = await join(dir, 'temp_DWL.json');
    const text = await readTextFile(path);
    return JSON.parse(text) as Record<string, VideoData>;
  } catch (err: any) {
    // Normaliser l'erreur en string (sécurisé)
    const errStr = String(err?.message ?? err ?? '').toLowerCase();

    // Détecter les cas "fichier introuvable"
    const isNotFound =
      err?.rawOsError === 2 ||            // certaines implémentations (Tauri) exposent rawOsError
      err?.code === 'ENOENT' ||          // Node-like error code
      errStr.includes('no such file') ||
      errStr.includes('cannot find the file') ||
      errStr.includes('os error 2') ||
      errStr.includes('not found') ||
      errStr.includes('failed to open file');

    if (!isNotFound) {
      // Logguer seulement les erreurs réelles
      console.error('Erreur lecture temp_DWL.json :', err);
    } else {
      // Optionnel : debug léger sans polluer la console d'erreur
      console.debug('temp_DWL.json introuvable — retour d’un objet vide.');
    }

    return {};
  }
}



export async function extractInfo_to_json(url: string | 'https://www.youtube.com/watch?v=ybaXWSghqG4', format: string, OutputName: string) {
  try {
    console.log(OutputName);
    const data_ajouter = await invoke('get_video_info', {
      url, 
      format, 
      outputname: OutputName
    });
    console.log(data_ajouter);
    
    // ⚠️ RETOURNER les données
    return data_ajouter;
    
  } catch (err) {
    console.error("erreur dans la fonction extractInfo_to_json : ", err);
    throw err; // Re-lancer l'erreur pour que l'appelant puisse la gérer
  }
}


//son appel est apres le telechhargement | OU | btn delete all + selecta all checked
export async function delete_temp_dwl() {
    try{
        const msg: string = await invoke('delete_temp_dwl');
        console.log(msg);
    }catch (err){
        console.error('Impossible de supprimer temp_DWL.json : ', err);
    }
}


//  [ TACHE ] affichage TOUS CEQUI est  dans la consol en creant une bonne page ,et aussi cree la fonctionne qui boucle le telechargemment dans backend
//son appel est dans le click sur le button Schedule

export async function SchedulePage(videos: VideoData[]){

  const alert = createCustomVideoAlert(videos, "Downloads Schedule");
  document.body.appendChild(alert);
  
  // Ajouter l'animation CSS de fadeOut
  const fadeOutStyle = document.createElement("style");
  fadeOutStyle.textContent = `
      @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
      }
  `;
  document.head.appendChild(fadeOutStyle);

  //const data = await fetchTempDwl();
  //console.log(data);
}


