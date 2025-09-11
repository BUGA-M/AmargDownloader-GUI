import { invoke } from '@tauri-apps/api/core';

export async function openStorageFolder() {
  try {
    // Récupère le chemin du dossier AMARG
    const folderPath: string = localStorage.getItem('outputFolder') || '';
    
    // Ouvre le dossier
    await invoke("open_folder", { path: folderPath });

  } catch (err) {
    console.error("Erreur ouverture de dowloads folder :", err);
  }
}

// Exemple avec un bouton
//document.getElementById("history")?.addEventListener("click", openAMARGFolder);
