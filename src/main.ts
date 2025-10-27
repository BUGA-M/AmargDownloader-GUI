import { invoke } from "@tauri-apps/api/core";
import { customAlert } from './components/customAlert';
import { initLocalStorage } from './utils/init';
import { openStorageFolder } from "./utils/openFolder";
import { openSettingsModal } from './components/Setting';
import { setupFolderOpener } from  './utils/sendpath'; 
import { sanitizeFileName } from  './utils/validateName'; 
import { openAppSettingsModal } from  './components/appSettings'; 
import { initSystemTheme } from  './components/initSystemTheme'; 
import { BtnTheme } from  './components/toggleTheme'; 
import { Verify } from  './utils/verifHTML'; 
import { showDownloadSpinner, updateSpinnerText,stopDownloadSpinner } from  './components/SimpleProgress'; 


import { block } from './components/BlockRLclick';

import { SchedulePage,fetchTempDwl,extractInfo_to_json,delete_temp_dwl } from './components/Schedule'

import { VideoMultiDwlQueue } from  './utils/listMultiDwlVid';
 
import { support } from "./components/Support";

import { init3DViewer  } from './components/Model3d';
import {bugaPopup} from "./components/BugaPopup"

import { createDownloadProgressBar } from './components/BarreDwl';
let progressBar: HTMLElement;


initSystemTheme()
BtnTheme()

let downloadButtonEl: HTMLDivElement | null = document.querySelector(".download-btn") ;
let addBtnEl :  HTMLButtonElement | null = document.querySelector(".add-btn") ;
let scheduleButtonEl: HTMLDivElement | null = document.querySelector(".schedule-btn") as HTMLDivElement ;



// utilisation plus tard


//------------------------------- intern functions ------------------------------------//
    // @ts-ignore
    function _set_StoredFolder(folder: string): void {
        localStorage.setItem("outputFolder", folder);
    }

    function get_StoredFolder(): string | null {
        return localStorage.getItem("outputFolder");
    }

    function set_DWL_Type(folder: string): void {
        localStorage.setItem("Type", folder);
    }

    function get_DWL_Type(): string | null {
        return localStorage.getItem("Type");
    }


//------------------------------------------------------------------------------------//
const dwl_btn_text =  document.getElementById("dwl_btn_text") as HTMLSpanElement ;
dwl_btn_text.textContent =  `Start Bash Download ( ${localStorage.getItem("numberOfVideos") || 0} )`



// Types pour les paramètres de téléchargement
interface DownloadParams {
  url: string;
  videoName: string;
  noPart?: boolean;
  ignoreErrors?: boolean;
  concurrentFragments?: string ;
  format : string;
  [key: string]: unknown;
}

interface jsonResult {
  author: string;
  duration: string;
  format: string;
  id: string;
  quality: string;
  size: string;
  thumbnail: string;
  title: string;
  url: string;
  [key: string]: unknown;
}


let MultiDwlvideosList = new VideoMultiDwlQueue() ;


if (!downloadButtonEl) {
  console.error("Bouton de téléchargement introuvable (selector: .download-btn)");
  // Optionnel : sortir du script ou gérer différemment
  throw new Error("Élément requis non trouvé");
}


// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// fn pour DWL Ses list  [non finis , A COMPLETER] 
// !!! ajouter une fucntion qui gere ajout et la supp des url dans la list et meme localhost et le counteur 
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
try{
  if (!addBtnEl) {
    console.error("Bouton d'ajout de type list ou single introuvable (selector: .download-btn)");
    // Optionnel : sortir du script ou gérer différemment
    throw new Error("Élément requis non trouvé");
  }else{
    

    addBtnEl.addEventListener("click", async ()=>{
      console.log(sanitizeFileName("فيديو")); 
      let nbOFurl : number = Number(localStorage.getItem('numberOfVideos'))
      
      const urlInput = document.querySelector<HTMLInputElement>("input.url-input") as HTMLInputElement;
      const formatInput = document.querySelector<HTMLInputElement>("#Format-input");
      const videoNameInput = document.querySelector<HTMLInputElement>("input.name-input") as HTMLInputElement;

      const url = Verify(urlInput);
      if (!url) throw new Error("URL must be provided try again") ;

      if (url === 'Input URL introuvable' || url === 'URL Not Detected' || url === 'Invalid URL' ){
        console.error(url);
        return
      }

      const format = formatInput?.value ;
      let OutputName = sanitizeFileName(
        (videoNameInput?.value || "")
      );
      

      try{
        let result : jsonResult | undefined;
        if (format){
          
          console.log('extractInfo_to_json est en cours')
          // Désactiver le bouton pendant le traitement
          addBtnEl.classList.add('desabledDIV')
          downloadButtonEl.textContent ="Adding video...";
          downloadButtonEl.classList.add('desabledDIV')
          scheduleButtonEl.classList.add('desabledDIV')

          showDownloadSpinner("addProgress", {
            title: "Preparing video...",
            message: "Fetching metadata (title, author, thumbnail)...",
          });

          setTimeout(() => {
            updateSpinnerText("addProgress", {
              title: "Adding to schedule...",
              message: "Video is being integrated into the queue (50%)",
            });
          }, 2500);


          result = await extractInfo_to_json(url, formatInput?.value, OutputName) as jsonResult;
          console.log("result de then main.ts [ligne 133]", result);
        }
        if (result) {
          updateSpinnerText("addProgress",{
            title: "Video Added Successfully",
            message: "You can add more videos or start downloading.",
            stopAnimation: true,
          });
          if ( get_DWL_Type() !== "list"){
            set_DWL_Type("list") // pour savoir quelle fn en backend rust sera appler apres le click sur start dwl
          }
      
          // Incrémenter le compteur SEULEMENT après succès
          nbOFurl++;
          downloadButtonEl.textContent = `Start Bash Download ( ${nbOFurl} )`;
          localStorage.setItem('numberOfVideos', nbOFurl.toString());

          urlInput.value = "";
          videoNameInput.value = "";
          setTimeout(() => {stopDownloadSpinner("addProgress");}, 1500);

          MultiDwlvideosList.push(url, result.title, result.id,  formatInput?.value)
          console.log("video to add in list", MultiDwlvideosList)
        }
        
        
      
      }catch(err: any){
        stopDownloadSpinner("addProgress");
        if (err.includes("Requested format is not available")) {
          customAlert(
            {
              title: "Video Not Added",
              subtitle: "Format Issue Detected",
              message: `We encountered a problem: the web version dont support ${format}.

          Possible solutions:
          1️⃣ Change the format and retry .
          2️⃣ Verify the URL and try again.

          If the issue persists, please contact support.`
            },
            10000, // duration in milliseconds
            "error"
          );

        }else if (err.includes("ouTube is forcing SABR streaming for this client")){
            customAlert(
            {
              title: "Video Not Added",
              subtitle: "Format Issue Detected",
              message: `We encountered a problem: the web version only supports [SABR] formats.

            Possible solutions:
            1️⃣ Wait a few seconds and try again.
            2️⃣ Download the video with other format and use  AMARG converter. 
            3️⃣ Change the URL and try again.

            If the issue persists, please contact support.`
              },
              10000, // duration in milliseconds
              "error"
            );
        }else{
          customAlert(
          {
            title: "Video Not Added",
            subtitle: "Server Issue Detected",
            message: `We encountered a problem while adding the video to your schedule.

          Possible solutions:
          1️⃣ verify the URL and try again, maybe url expired .
          2️⃣ Wait a few seconds and try again.
          3️⃣ Verify your schedule before retrying.

          If the issue persists, please contact support.`
            },
            10000, // duration in milliseconds
            "error"
          );
        }
        
      }finally {
        // Réactiver le bouton
        addBtnEl.classList.remove('desabledDIV')
        downloadButtonEl.classList.remove('desabledDIV')
        scheduleButtonEl.classList.remove('desabledDIV')
        //stopDownloadById("addProgress");
        downloadButtonEl.textContent = `Start Bash Download ( ${nbOFurl} )`;
      }
    })
  }

}catch (error){
  console.log("err on add-btn to db")
}

try {
  downloadButtonEl.addEventListener("click", async (event: MouseEvent) => {
    event.preventDefault();

    // Récupération des éléments selon index.html
    const urlInput = document.querySelector<HTMLInputElement>("input.url-input") as HTMLInputElement;
    const videoNameInput = document.querySelector<HTMLInputElement>("input.name-input") as HTMLInputElement;
    const formatInput = document.querySelector<HTMLInputElement>("#Format-input") as HTMLInputElement;

    if ( get_DWL_Type() !== "list"){
      const url = Verify(urlInput);
      if (!url) throw new Error("MY_URL must be provided");  
      if (url === 'Input URL introuvable' || url === 'URL Not Detected' || url === 'Invalid URL' ){
        return
      }
    }


    let videoName = sanitizeFileName(videoNameInput?.value || "");
    
    // désactiver interactions
    downloadButtonEl.style.pointerEvents = "none";
    downloadButtonEl.textContent = "Start Bash Download ( 1 )";

    const nb_fragment: string | null = localStorage.getItem("Fragments") || ""
    const noPart: string | null = localStorage.getItem("noPart") || "";
    const ignorError: string | null = localStorage.getItem("ignorError") || "";

    try {
      const paramsOneVid: DownloadParams = {
        url: urlInput.value.trim(),
        videoName: videoName,
        noPart: noPart ? noPart === "true" : true, 
        ignoreErrors: ignorError ? ignorError === "true" : true,
        concurrentFragments: nb_fragment ,
        outputPath: get_StoredFolder() || "" ,
        format : formatInput?.value || "mp4"
      };
      
      const paramsmultiVid = {
        videos: MultiDwlvideosList.toArrayForRust(),
        noPart: noPart ? noPart === "true" : true, 
        ignoreErrors: ignorError ? ignorError === "true" : true,
        concurrentFragments: nb_fragment ,
        outputPath: get_StoredFolder() || "" ,
        max_concurrent: 3,
      };

      console.log("MultiDwlvideosList for Rust:", MultiDwlvideosList.toArrayForRust());

      // IMPORTANT: Créer et afficher la barre de progression AVANT d'invoquer le téléchargement
      // pour que les listeners soient attachés et puissent recevoir les événements du backend
      progressBar = getOrCreateProgressBar();
      
      if (progressBar) {
        // Réinitialiser complètement l'état pour un nouveau téléchargement
        // Cela cache le badge et affiche le spinner
        try {
          (progressBar as any).reset();
        } catch (e) {
          console.warn('Failed to reset progress bar:', e);
        }
        
        // Afficher la barre de progression
        try {
          (progressBar as any).show();
        } catch (e) {
          // Fallback: ensure it's visible
          progressBar.style.display = 'block';
          progressBar.style.opacity = '1';
        }

        console.log('🚀 Progress bar reset and shown - listeners ready - invoking Rust function');
      }

      // Attendre un court instant pour s'assurer que les listeners sont bien attachés
      await new Promise(resolve => setTimeout(resolve, 100));

      let result;
      // Choisir la fonction à appeler en fonction du type de téléchargement
      if ( get_DWL_Type() === "list"){
        console.log("Starting multi-video download with params:", paramsmultiVid);
        // Pour le multi-download, définir le nombre attendu de vidéos
        if (progressBar && typeof (progressBar as any).setExpectedTotal === 'function') {
          (progressBar as any).setExpectedTotal(MultiDwlvideosList.toArray().length);
        }
        result = await invoke<string>("multi_vd_dwl_caller", paramsmultiVid);
      }else{
        console.log("Starting single-video download with params:", paramsOneVid);
        if (progressBar && typeof (progressBar as any).setExpectedTotal === 'function') {
          (progressBar as any).setExpectedTotal("1");
        }
        result = await invoke<string>("one_vd_dwl", paramsOneVid) ;
      }
      
      


      // Vérifier si le fichier existe déjà
      if (result.startsWith("Fichier Déjà téléchargé : ")) {
        const path = result.replace("Fichier Déjà téléchargé : [download]", "").trim();
        customAlert(
          {
            title: "File Already Exists",
            message: `A file with this name already exists in the destination\n`+
            `--folder-- :  ${path}\n\n`+
            `--Please-- : \n`+
            `- Check your download folder\n`+
            `- Choose a different name to download the file`
          },
          10000,  
          "info"  
        );

      } else if (result.startsWith("server issue")) {
          if( noPart.toString().trim() === "true" ){
            customAlert(
              {
                title: "Download Stopped",
                subtitle: "Server Issue Detected",
                message: `The download was interrupted due to a server problem.\n`+
                `[1] The parts already downloaded have been kept.\n`+
                `[2] Please check your download folder before retrying.`
              },
              10000,   // durée en ms
              "info"   // type d'alerte
            );
          } else{
            customAlert(
              {
                title: "Download Stopped",
                subtitle: "Server Issue Detected",
                message: 
                  "Download stopped due to a server issue.\n" +
                  "Check your folder before retrying.\n\n" +
                  "[ 💡 Tip ] : use --no-part option to keep already downloaded parts."
              },
              10000,
              "warning"
            );
          }
      } else if( result.startsWith("url not found or expired") ){
        customAlert(
          {
            title: "Download Failed",
            message: 
              "File not found (404).\n" +
              "The link may have expired or the file was removed from the server.\n" +
              "Please generate a new download link and try again."
          },
          10000,
          "error"
        );
      } else if(result.startsWith("cnx error")) {
          customAlert(
            {
              title: "Download Failed",
              message: 
                "Network / DNS error.\n" +
                "Please check your internet connection and try again."
            },
            10000,
            "error"
          );
      }else{
        if ( get_DWL_Type() === "list"){
          await invoke("copy_temp_to_history"); 
        }else if ( get_DWL_Type() === "single"){
          await invoke("add_to_single_download_by_date", { url : paramsOneVid.url, title: paramsOneVid.videoName , format: paramsOneVid.format });
        }

        // Téléchargement réussi normalement
        const urLinput = document.querySelector(".url-input");
        const NameInput = document.querySelector(".name-input");
        if ( urLinput instanceof HTMLInputElement ){
          urLinput.value = "";
        }
        if(NameInput instanceof HTMLInputElement){
          NameInput.value = "";
        }

        //console.log(result)
        const fileName = result.split(/[/\\]/).pop();
        customAlert(
          {
            title: "Download Successful",
            subtitle: `File Saved : ${fileName}`,
            message: "Check your downloads folder to view your files"
          },
        10000,
          "success"
        );

        MultiDwlvideosList.clear(); // vider la list apres le dwl
        delete_temp_dwl();
        localStorage.setItem("Type",'single');
        localStorage.setItem("numberOfVideos",'0');
        downloadButtonEl.textContent = `Start Bash Download ( 0 )` ;
        console.log("la liste est : ",MultiDwlvideosList);
      }
      
    } catch (error: unknown) {
      console.error("Erreur lors du téléchargement:", error);
      if (progressBar) {
        progressBar.style.display = 'none';
      }

      customAlert(
        {
          title: "Download Failed",
          message: 
            "Data parsing error detected.\n\n" +
            "--Possible Causes--:\n" +
            "- The URL provided might be invalid or expired.\n" +
            "- The source website format may have changed.\n" +
            "- The file name is incorrect or invalid.\n\n" +
            "--Recommended Actions--:\n" +
            "- Verify the URL and try again.\n" +
            "- If the issue persists, generate a new download link."
        },
        10000,
        "error"
      );



      //console.log(`❌ Erreur : ${errorMessage}`);
      
    } finally {
      // Réactiver le bouton et restaurer le texte
      downloadButtonEl.style.pointerEvents = "";
      downloadButtonEl.textContent = `Start Bash Download ( ${localStorage.getItem("numberOfVideos")} )`
    }
  });
  
} catch (error) {
  customAlert(
    {
      title: "Initialization Error",
      message: 
        "An error occurred while attaching the event to the button during interface initialization.\n\n" +
        "Please restart the app and try again."
    },
    10000,
    "error"
  );


};


//------------------------------------------------------------------//

// ouvrir fichier Downloads
document.getElementById("history")?.addEventListener("click", openStorageFolder);



// Fonction pour ouvrir la fenetre de paramètres de telechargement
const settingsBtn = document.getElementById("open-settings-btn");

settingsBtn?.addEventListener("click", () => {
  openSettingsModal();
});

// Fonction pour ouvrir la fenetre de paramètres de l'applications
const appSettings = document.getElementById("open-app-setting");

appSettings?.addEventListener("click", () => {
  openAppSettingsModal();
});

//------------------------------ init functions ------------------------------------//

try {
  initLocalStorage();
  //console.log("Local storage initialized successfully.");
} catch (error) {
  console.error("Error init Local storage", error);
}



// Appeler cette fonction au démarrage de votre app
setupFolderOpener();


//------------------------------ blocage de la click droit------------------------------------//

block();

//------------------------------ Page de Schedule ------------------------------------//
//SchedulePage()
//delete_temp_dwl()



const scheduleBtn = document.querySelector('.schedule-btn');

scheduleBtn?.addEventListener("click", async () => {
    try {
        const numVideos = parseInt(localStorage.getItem('numberOfVideos') || "0", 10);
        if (numVideos === 0) {
            SchedulePage([]);
            return;
        }

        const result = await fetchTempDwl();
        if (result) {
            const videoArray = Object.values(result);
            SchedulePage(videoArray);
        }
        

    } catch (error) {
        console.error("Erreur :", error);
    }
});


//------------------------------ fn suppression du lien depuis la list  ------------------------------------//
export async function removeVideoFromList(id: string) {
  const removed = MultiDwlvideosList.remove(id);
  if (removed) {
    console.log(`Video with id ${id} removed from the list.`);
  } else {
    console.log(`Video with id ${id} not found in the list.`);
  }
  console.log("Current list:", MultiDwlvideosList.toArray());
  return removed;
}


export async function clearVideoList() {
  MultiDwlvideosList.clear();
  console.log("All videos cleared from the list.");
  console.log("la liste est : ",MultiDwlvideosList);
}

//------------------------------ Support ------------------------------------//

support();


//------------------------------ init 3D model ------------------------------------//
const container = document.getElementById('viewer')!;
//init3DViewer(container, 'tauri://utils/bird_orange_beta.glb'); //mode dev 

const modelUrl = new URL('./utils/BUGA.glb', import.meta.url).href;
init3DViewer(container, modelUrl);

bugaPopup();


//------------------------------ Barre de telechargement------------------------------------//
function getOrCreateProgressBar() {
  if (!progressBar) {     // première fois seulement
    progressBar = createDownloadProgressBar();
  }
  return progressBar;
}
