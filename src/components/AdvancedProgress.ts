// Types pour la configuration de la fenêtre de téléchargement
export interface DownloadWindowConfig {
  title?: string;
  message?: string;
  progress?: number;
  fileName?: string;
  fileSize?: string;
  speed?: string;
  timeRemaining?: string;
}

export interface DownloadWindowInstance {
  id: string;
  element: HTMLDivElement;
  updateConfig: (config: DownloadWindowConfig) => void;
  updateProgress: (progress: number) => void;
  close: () => void;
}

// Couleurs définies
const COLORS = {
  primary: '#af4c0f',
  secondary: '#ff6600',
  background: '#121212',
  overlay: '#ff66003b',
  accent: '#ff6600',
  text: '#ffffff',
  progressBg: '#f55e00ff',
  progressFill: '#ff9900ff'
};

// Map pour stocker les instances actives
const activeDownloads = new Map<string, DownloadWindowInstance>();

/**
 * Crée et affiche une fenêtre de téléchargement
 * @param config Configuration initiale de la fenêtre
 * @returns Instance de la fenêtre de téléchargement
 */
export function createDownloadWindow(config: DownloadWindowConfig = {}): DownloadWindowInstance {
  const id = `download-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Création de l'overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: ${COLORS.overlay};
    backdrop-filter: blur(3px);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Création de la fenêtre principale
  const window = document.createElement('div');
  window.style.cssText = `
    background: ${COLORS.background};
    border: 2px solid ${COLORS.primary};
    border-radius: 12px;
    padding: 24px;
    min-width: 400px;
    max-width: 500px;
    box-shadow: 0 8px 32px rgba(175, 76, 15, 0.3);
    color: ${COLORS.text};
    position: relative;
  `;

  // Titre
  const title = document.createElement('h3');
  title.style.cssText = `
    margin: 0 0 16px 0;
    color: ${COLORS.secondary};
    font-size: 18px;
    font-weight: 600;
    text-align: center;
  `;
  title.textContent = config.title || 'Téléchargement en cours...';

  // Message
  const message = document.createElement('p');
  message.style.cssText = `
    margin: 0 0 20px 0;
    color: ${COLORS.text};
    font-size: 14px;
    text-align: center;
    opacity: 0.9;
  `;
  message.textContent = config.message || 'Veuillez patienter pendant le téléchargement.';

  // Conteneur du fichier
  const fileInfo = document.createElement('div');
  fileInfo.style.cssText = `
    background: rgba(255, 102, 0, 0.1);
    border: 1px solid ${COLORS.secondary};
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 20px;
  `;

  const fileName = document.createElement('div');
  fileName.style.cssText = `
    font-weight: 500;
    font-size: 14px;
    color: ${COLORS.text};
    margin-bottom: 4px;
    word-break: break-all;
  `;
  fileName.textContent = config.fileName || 'fichier_telecharge.zip';

  const fileDetails = document.createElement('div');
  fileDetails.style.cssText = `
    font-size: 12px;
    color: ${COLORS.text};
    opacity: 0.7;
    display: flex;
    justify-content: space-between;
  `;

  const fileSize = document.createElement('span');
  fileSize.textContent = config.fileSize || '0 MB / 100 MB';

  const speed = document.createElement('span');
  speed.textContent = config.speed || '0 KB/s';

  fileDetails.appendChild(fileSize);
  fileDetails.appendChild(speed);

  // Barre de progression
  const progressContainer = document.createElement('div');
  progressContainer.style.cssText = `
    width: 100%;
    height: 8px;
    background: ${COLORS.progressBg};
    border-radius: 4px;
    margin: 16px 0;
    overflow: hidden;
  `;

  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    height: 100%;
    background: linear-gradient(90deg, ${COLORS.secondary}, ${COLORS.progressFill});
    border-radius: 4px;
    width: ${config.progress || 0}%;
    transition: width 0.3s ease;
  `;

  progressContainer.appendChild(progressBar);

  // Pourcentage et temps restant
  const progressInfo = document.createElement('div');
  progressInfo.style.cssText = `
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: ${COLORS.text};
    opacity: 0.8;
    margin-bottom: 20px;
  `;

  const percentage = document.createElement('span');
  percentage.textContent = `${config.progress || 0}%`;

  const timeRemaining = document.createElement('span');
  timeRemaining.textContent = config.timeRemaining || 'Calcul en cours...';

  progressInfo.appendChild(percentage);
  progressInfo.appendChild(timeRemaining);

  // Bouton d'annulation
  const cancelButton = document.createElement('button');
  cancelButton.style.cssText = `
    width: 100%;
    padding: 10px;
    background: transparent;
    border: 1px solid ${COLORS.primary};
    border-radius: 6px;
    color: ${COLORS.secondary};
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  `;
  cancelButton.textContent = 'Annuler le téléchargement';

  // Hover effect pour le bouton
  cancelButton.addEventListener('mouseenter', () => {
    cancelButton.style.background = COLORS.primary;
    cancelButton.style.color = COLORS.text;
  });
  cancelButton.addEventListener('mouseleave', () => {
    cancelButton.style.background = 'transparent';
    cancelButton.style.color = COLORS.secondary;
  });

  // Assemblage des éléments
  fileInfo.appendChild(fileName);
  fileInfo.appendChild(fileDetails);

  window.appendChild(title);
  window.appendChild(message);
  window.appendChild(fileInfo);
  window.appendChild(progressContainer);
  window.appendChild(progressInfo);
  window.appendChild(cancelButton);

  overlay.appendChild(window);

  // Fonction de mise à jour
  const updateConfig = (newConfig: DownloadWindowConfig) => {
    if (newConfig.title) title.textContent = newConfig.title;
    if (newConfig.message) message.textContent = newConfig.message;
    if (newConfig.fileName) fileName.textContent = newConfig.fileName;
    if (newConfig.fileSize) fileSize.textContent = newConfig.fileSize;
    if (newConfig.speed) speed.textContent = newConfig.speed;
    if (newConfig.timeRemaining) timeRemaining.textContent = newConfig.timeRemaining;
    if (typeof newConfig.progress === 'number') {
      progressBar.style.width = `${Math.max(0, Math.min(100, newConfig.progress))}%`;
      percentage.textContent = `${Math.round(newConfig.progress)}%`;
    }
  };

  // Fonction de mise à jour rapide du progrès
  const updateProgress = (progress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    progressBar.style.width = `${clampedProgress}%`;
    percentage.textContent = `${Math.round(clampedProgress)}%`;
  };

  // Fonction de fermeture
  const close = () => {
    overlay.style.opacity = '0';
    overlay.style.transform = 'scale(0.95)';
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      activeDownloads.delete(id);
    }, 200);
  };

  // Event listener pour le bouton d'annulation
  cancelButton.addEventListener('click', close);

  // Event listener pour fermer avec Escape
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Animation d'entrée
  overlay.style.opacity = '0';
  window.style.transform = 'scale(0.9)';
  window.style.transition = 'transform 0.2s ease';
  
  document.body.appendChild(overlay);
  
  // Déclencher l'animation
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    window.style.transform = 'scale(1)';
  });

  // Création de l'instance
  const instance: DownloadWindowInstance = {
    id,
    element: overlay,
    updateConfig,
    updateProgress,
    close
  };

  // Stockage de l'instance
  activeDownloads.set(id, instance);

  return instance;
}

/**
 * Arrête et ferme une fenêtre de téléchargement spécifique
 * @param instance Instance de la fenêtre à fermer
 */
export function stopDownloadWindow(instance: DownloadWindowInstance): void {
  if (activeDownloads.has(instance.id)) {
    instance.close();
  }
}

/**
 * Arrête toutes les fenêtres de téléchargement actives
 */
export function stopAllDownloadWindows(): void {
  activeDownloads.forEach(instance => {
    instance.close();
  });
  activeDownloads.clear();
}

/**
 * Récupère toutes les instances actives de téléchargement
 * @returns Array des instances actives
 */
export function getActiveDownloads(): DownloadWindowInstance[] {
  return Array.from(activeDownloads.values());
}

/**
 * Récupère une instance spécifique par son ID
 * @param id ID de l'instance
 * @returns Instance trouvée ou undefined
 */
export function getDownloadById(id: string): DownloadWindowInstance | undefined {
  return activeDownloads.get(id);
}

/**
 * Arrête une fenêtre de téléchargement par son ID
 * @param id ID de l'instance à fermer
 * @returns true si l'instance a été trouvée et fermée, false sinon
 */
export function stopDownloadById(id: string): boolean {
  const instance = activeDownloads.get(id);
  if (instance) {
    instance.close();
    return true;
  }
  return false;
}

/**
 * Crée une fenêtre avec un ID personnalisé (utile pour la gestion cross-scope)
 * @param customId ID personnalisé pour l'instance
 * @param config Configuration initiale
 * @returns Instance de la fenêtre
 */
export function createDownloadWindowWithId(customId: string, config: DownloadWindowConfig = {}): DownloadWindowInstance {
  // Fermer l'instance existante si elle existe déjà
  const existing = activeDownloads.get(customId);
  if (existing) {
    existing.close();
  }

  // Créer l'overlay (même code que createDownloadWindow)
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: ${COLORS.overlay};
    backdrop-filter: blur(3px);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Création de la fenêtre principale
  const window = document.createElement('div');
  window.style.cssText = `
    background: ${COLORS.background};
    border: 2px solid ${COLORS.primary};
    border-radius: 12px;
    padding: 24px;
    min-width: 400px;
    max-width: 500px;
    box-shadow: 0 8px 32px rgba(175, 76, 15, 0.3);
    color: ${COLORS.text};
    position: relative;
  `;

  // Titre
  const title = document.createElement('h3');
  title.style.cssText = `
    margin: 0 0 16px 0;
    color: ${COLORS.secondary};
    font-size: 18px;
    font-weight: 600;
    text-align: center;
  `;
  title.textContent = config.title || 'Téléchargement en cours...';

  // Message
  const message = document.createElement('p');
  message.style.cssText = `
    margin: 0 0 20px 0;
    color: ${COLORS.text};
    font-size: 14px;
    text-align: center;
    opacity: 0.9;
  `;
  message.textContent = config.message || 'Veuillez patienter pendant le téléchargement.';

  // Conteneur du fichier
  const fileInfo = document.createElement('div');
  fileInfo.style.cssText = `
    background: rgba(255, 102, 0, 0.1);
    border: 1px solid ${COLORS.secondary};
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 20px;
  `;

  const fileName = document.createElement('div');
  fileName.style.cssText = `
    font-weight: 500;
    font-size: 14px;
    color: ${COLORS.text};
    margin-bottom: 4px;
    word-break: break-all;
  `;
  fileName.textContent = config.fileName || 'fichier_telecharge.zip';

  const fileDetails = document.createElement('div');
  fileDetails.style.cssText = `
    font-size: 12px;
    color: ${COLORS.text};
    opacity: 0.7;
    display: flex;
    justify-content: space-between;
  `;

  const fileSize = document.createElement('span');
  fileSize.textContent = config.fileSize || '0 MB / 100 MB';

  const speed = document.createElement('span');
  speed.textContent = config.speed || '0 KB/s';

  fileDetails.appendChild(fileSize);
  fileDetails.appendChild(speed);

  // Barre de progression
  const progressContainer = document.createElement('div');
  progressContainer.style.cssText = `
    width: 100%;
    height: 8px;
    background: ${COLORS.progressBg};
    border-radius: 4px;
    margin: 16px 0;
    overflow: hidden;
  `;

  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    height: 100%;
    background: linear-gradient(90deg, ${COLORS.secondary}, ${COLORS.progressFill});
    border-radius: 4px;
    width: ${config.progress || 0}%;
    transition: width 0.3s ease;
  `;

  progressContainer.appendChild(progressBar);

  // Pourcentage et temps restant
  const progressInfo = document.createElement('div');
  progressInfo.style.cssText = `
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: ${COLORS.text};
    opacity: 0.8;
    margin-bottom: 20px;
  `;

  const percentage = document.createElement('span');
  percentage.textContent = `${config.progress || 0}%`;

  const timeRemaining = document.createElement('span');
  timeRemaining.textContent = config.timeRemaining || 'Calcul en cours...';

  progressInfo.appendChild(percentage);
  progressInfo.appendChild(timeRemaining);

  // Bouton d'annulation
  const cancelButton = document.createElement('button');
  cancelButton.style.cssText = `
    width: 100%;
    padding: 10px;
    background: transparent;
    border: 1px solid ${COLORS.primary};
    border-radius: 6px;
    color: ${COLORS.secondary};
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  `;
  cancelButton.textContent = 'Annuler le téléchargement';

  // Hover effect pour le bouton
  cancelButton.addEventListener('mouseenter', () => {
    cancelButton.style.background = COLORS.primary;
    cancelButton.style.color = COLORS.text;
  });
  cancelButton.addEventListener('mouseleave', () => {
    cancelButton.style.background = 'transparent';
    cancelButton.style.color = COLORS.secondary;
  });

  // Assemblage des éléments
  fileInfo.appendChild(fileName);
  fileInfo.appendChild(fileDetails);

  window.appendChild(title);
  window.appendChild(message);
  window.appendChild(fileInfo);
  window.appendChild(progressContainer);
  window.appendChild(progressInfo);
  window.appendChild(cancelButton);

  overlay.appendChild(window);

  // Fonction de mise à jour
  const updateConfig = (newConfig: DownloadWindowConfig) => {
    if (newConfig.title) title.textContent = newConfig.title;
    if (newConfig.message) message.textContent = newConfig.message;
    if (newConfig.fileName) fileName.textContent = newConfig.fileName;
    if (newConfig.fileSize) fileSize.textContent = newConfig.fileSize;
    if (newConfig.speed) speed.textContent = newConfig.speed;
    if (newConfig.timeRemaining) timeRemaining.textContent = newConfig.timeRemaining;
    if (typeof newConfig.progress === 'number') {
      progressBar.style.width = `${Math.max(0, Math.min(100, newConfig.progress))}%`;
      percentage.textContent = `${Math.round(newConfig.progress)}%`;
    }
  };

  // Fonction de mise à jour rapide du progrès
  const updateProgress = (progress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    progressBar.style.width = `${clampedProgress}%`;
    percentage.textContent = `${Math.round(clampedProgress)}%`;
  };

  // Fonction de fermeture
  const close = () => {
    overlay.style.opacity = '0';
    overlay.style.transform = 'scale(0.95)';
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      activeDownloads.delete(customId);
    }, 200);
  };

  // Event listener pour le bouton d'annulation
  cancelButton.addEventListener('click', close);

  // Event listener pour fermer avec Escape
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Animation d'entrée
  overlay.style.opacity = '0';
  window.style.transform = 'scale(0.9)';
  window.style.transition = 'transform 0.2s ease';
  
  document.body.appendChild(overlay);
  
  // Déclencher l'animation
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    window.style.transform = 'scale(1)';
  });

  // Création de l'instance avec l'ID personnalisé
  const instance: DownloadWindowInstance = {
    id: customId,
    element: overlay,
    updateConfig,
    updateProgress,
    close
  };

  // Stockage de l'instance avec l'ID personnalisé
  activeDownloads.set(customId, instance);

  return instance;
}