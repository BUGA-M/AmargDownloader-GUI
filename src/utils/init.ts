import { invoke } from "@tauri-apps/api/core";

//------------------------------------------------------------------------------------//

    // Fonction setter pour le dossier de sortie
    function set_StoredFolder(folder: string): void {
        localStorage.setItem("outputFolder", folder);
    }

    // Fonction getter pour le dossier de sortie
    function get_StoredFolder(): string | null {
        return localStorage.getItem("outputFolder");
    }

    // Function setter  fragmnet
    function set_nb_fragment(nb: string): void{
        localStorage.setItem("Fragments", nb);
    }

    // Function getter  fragmnet
    function get_nb_fragment(){
        return localStorage.getItem("Fragments");
    }


    // Function setter  fragmnet
    function set_nb_noPart(nb: string): void{
        localStorage.setItem("noPart", nb);
    }

    // Function getter  fragmnet
    function get_nb_noPart(){
        return localStorage.getItem("noPart");
    }

    // Function setter  ignorError
    function set_ignorError(nb: string): void{
        localStorage.setItem("ignorError", nb);
    }

    // Function getter  ignorError
    function get_ignorError(){  
        return localStorage.getItem("ignorError");
    }

    // Auto-start settings
    function setAutoStart(enabled: boolean): void {
        localStorage.setItem("startup", String(enabled));
    }

    function getAutoStart(){
        return localStorage.getItem("startup");
    }
    
    // Notifications settings
    // @ts-ignore
    function setNotifications(enabled: boolean): void {
        localStorage.setItem("notifications", String(enabled));
    }

    function getNotifications(){
        return localStorage.getItem("notifications"); 
    }

    // Auto-update settings
    // @ts-ignore
    function setAutoUpdate(enabled: boolean): void {
        localStorage.setItem("autoUpdate", String(enabled));
    }

    function getAutoUpdate(){
        return localStorage.getItem("autoUpdate"); 
    }


    // Minimize to tray settings
    function setMinimizeToTray(enabled: boolean): void {
        localStorage.setItem("minimizeToTray", String(enabled));
    }

    function getMinimizeToTray(){
        return localStorage.getItem("minimizeToTray") ;
    }

    // Minimize to tray settings
    function setLanguage (enabled: string) {
        localStorage.setItem("Language",enabled)
    }

    function getLanguage(){
        return localStorage.getItem("Language") ;
    }

    // Download Type settings
    function set_DWL_Type (enabled: string) {
        localStorage.setItem("Type",enabled)
    }
    function get_DWL_Type(){
        return localStorage.getItem("Type") ;
    }

    // number Of Videos
    function setnumberOfVideos (enabled: string) {
        localStorage.setItem("numberOfVideos",enabled)
    }

    function getnumberOfVideos(){
        return localStorage.getItem("numberOfVideos") ;
    }


//------------------------------------------------------------------------------------//
    // Fonction pour initialiser et garder le path de sortie correct
export async function initLocalStorage() {
  // ------- thème par défaut -------- //
  //if (!localStorage.getItem("theme")) {
  //  localStorage.setItem("theme", "dark"); 
  //}

  // ------- dossier AMARG -------- //
  if (!get_StoredFolder()) {
    try {
      const amargFolder = await invoke<string | null>("get_amarg_folder_path");
      set_StoredFolder(amargFolder || ""); 
    } catch (error) {
      console.error("Erreur lors de init dossier AMARG dans local storage :", error);
    }
  }

  // ------- nb_fragment -------- //
  if (!get_nb_fragment()) {
    set_nb_fragment("4");
  }

  // ------- noPart -------- //
  if (!(get_nb_noPart() === "true" || get_nb_noPart() === "false")) {
    set_nb_noPart("true");
  }

  // ------- ignorError -------- //
  if (!(get_ignorError() === "true" || get_ignorError() === "false")) {
    set_ignorError("true");
  }

  // ------- Language -------- //
  if (!(getLanguage() === "true" || getLanguage() === "false")) {
    setLanguage("en");
  }


  // ------- startUp -------- //
  if (!(getAutoStart() === "true" || getAutoStart() === "false")) {
    await invoke<boolean>('toggle_startup', {
            enable : true,
        });
    setAutoStart(true);
  }

  // ------- notification -------- //
  if (!(getNotifications() === "true" || getNotifications() === "false")) {
    setNotifications(false);
  }

    // ------- autoUpdate -------- //
  if (!(getAutoUpdate() === "true" || getAutoUpdate() === "false")) {
    setAutoUpdate(false);
  }

      // ------- Minimize -------- //
  if (!(getMinimizeToTray() === "true" || getMinimizeToTray() === "false")) {
    setMinimizeToTray(true);
  }

  // ------- numberOfVideos -------- //
  if (!(getnumberOfVideos() )) {
    setnumberOfVideos("0");
  }

  if (getnumberOfVideos() === "0") {
    set_DWL_Type("single");
  }
  // ------- DWL_Type -------- //
  if (!(get_DWL_Type() === "single" || get_DWL_Type() === "list" )) {
    set_DWL_Type("single");
  }



}


export async function verifieStartup () {
      try{
          const is_enabled = await invoke<boolean>("is_startup_enabled" );
          if (is_enabled === true) {
              setAutoStart(true)
          }else if (is_enabled === false){
              setAutoStart(false)
          }
          return is_enabled
      }catch(error){
          console.log("error on verifieStartup(): ",error)
      }

  };