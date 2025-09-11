import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

// Écouteur d'événement pour ouvrir le dossier depuis le système tray
export async function setupFolderOpener() {
    await listen('open-downloads-folder', async () => {
        try {
            // Récupérer le chemin depuis le localStorage
            let folderPath = localStorage.getItem('outputFolder');
            
            // Si pas de chemin dans localStorage, utiliser le dossier par défaut
            if (!folderPath) {
                folderPath = await invoke('get_amarg_folder_path');
            }
            
            // Ouvrir le dossier
            await invoke('open_folder', { path: folderPath });
            
        } catch (error) {
            console.error('Erreur lors de l\'ouverture du dossier depuis système tray:', error);
        }
    });
}

