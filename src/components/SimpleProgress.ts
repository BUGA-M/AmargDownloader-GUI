// Interface pour la configuration du spinner
export interface SimpleDownloadConfig {
  title?: string;
  message?: string;
  backgroundColor?: string;
  borderColor?: string;
  overlayColor?: string;
  stopAnimation?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

// Fonction pour détecter le thème
function getTheme(): 'light' | 'dark' {
  // Essayer d'abord de récupérer depuis localStorage
  const THEME = document.documentElement.getAttribute("data-theme");
  const savedTheme = THEME === "dark" ? localStorage.getItem("theme"):THEME;
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }
  
  // Sinon, détecter via les préférences système
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
}

// Couleurs dynamiques basées sur le thème
function getColors(theme: 'light' | 'dark' = getTheme()) {
  return {
  light: {
        primary:        '#FF5F1F',      // orange vif
        secondary:      '#FF7F50',      // coral
        success:        '#2ECC71',      // vert émeraude
        background:     'rgba(255, 255, 255, 0.95)',
        backgroundGlass:'rgba(255, 255, 255, 0.8)',
        overlay:        'rgba(0, 0, 0, 0.4)',
        text:           '#1F2937',
        textSecondary:  '#6B7280',
        spinner:        '#FF5F1F',
        shadow:         'rgba(0, 0, 0, 0.1)',
        border:         'rgba(229, 231, 235, 0.8)'
    },
    dark: {
        primary:        '#FF5F1F',      // orange vif
        secondary:      '#FF9F5A',      // orange plus clair
        success:        '#34D399',      // vert émeraude
        background:     '#1a1a1a',
        backgroundGlass:'#1a1a1acc',
        overlay:        'rgba(0, 0, 0, 0.6)',
        text:           '#F9FAFB',
        textSecondary:  '#D1D5DB',
        spinner:        '#FF9F5A',
        shadow:         'rgba(0, 0, 0, 0.3)',
        border:         'rgba(99, 85, 75, 0.3)'
    }
  }[theme];
}

// Map pour stocker les instances par ID
const activeSpinners = new Map<string, HTMLDivElement>();

/**
 * Affiche un spinner de téléchargement avec design moderne
 * @param id Identifiant unique pour le spinner
 * @param config Configuration complète (optionnel)
 */
export function showDownloadSpinner(id: string, config: SimpleDownloadConfig = {}): void {
  // Supprimer l'ancienne instance si elle existe
  stopDownloadSpinner(id);

  const theme = config.theme === 'auto' ? getTheme() : (config.theme || getTheme());
  const colors = getColors(theme);

  // Couleurs avec fallback
  const bgColor = config.backgroundColor || colors.backgroundGlass;
  const borderColor = config.borderColor || colors.border;
  const overlayColor = config.overlayColor || colors.overlay;

  // Création de l'overlay avec effet de flou moderne
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: ${overlayColor};
    backdrop-filter: blur(12px) saturate(1.2);
    -webkit-backdrop-filter: blur(12px) saturate(1.2);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  `;

  // Conteneur principal avec design glassmorphism
  const container = document.createElement('div');
  container.style.cssText = `
    background: ${bgColor};
    border: 1px solid ${borderColor};
    border-radius: 24px;
    padding: 48px 40px;
    text-align: center;
    box-shadow: 
      0 25px 50px -12px ${colors.shadow},
      0 0 0 1px rgba(255, 255, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transform: scale(0.85) translateY(20px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 380px;
    max-width: 420px;
    position: relative;
    overflow: hidden;
  `;

  // Ajout d'un effet de brillance subtile
  const shine = document.createElement('div');
  shine.style.cssText = `
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    animation: shine 3s ease-in-out infinite;
  `;
  container.appendChild(shine);

  // Spinner moderne avec gradient
  const spinnerContainer = document.createElement('div');
  spinnerContainer.style.cssText = `
    position: relative;
    margin: 0 auto 32px auto;
    width: 64px;
    height: 64px;
  `;

  const spinner = document.createElement('div');
  spinner.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">
    <defs>
        <path id="path-0" style="fill: none;" d="M 386.733 93.867 C 355.359 101.066 339.634 111.357 325.407 122.028 C 323.171 124.263 323.837 129.884 323.529 132.04 C 321.369 147.162 338.857 162.246 348.561 171.464 C 352.859 175.548 358.361 178.321 362.328 182.728 C 387.955 196.345 404.613 207.655 418.648 197.747 C 420.591 196.376 420.751 192.799 423.029 192.115 C 428.004 138.228 408.642 105.96 362.954 95.119 C 342.9 90.36 325.823 93.881 306.007 93.242 C 273.603 120.014 250.366 161.168 273.467 187.735 C 281.891 197.423 291.631 196.229 302.253 200.876 C 325.962 201.502 343.699 201.918 351.064 200.25 C 378.141 194.12 408.493 168.926 393.617 138.298 C 385.689 121.974 371.617 117.549 359.825 105.757 C 327.472 94.936 308.068 90.334 292.24 95.119 C 271.122 101.504 267.097 136.831 282.228 148.936"></path>
    </defs>
    <path style="stroke: rgb(0, 0, 0); fill: rgb(234, 120, 0); stroke-width: 0px;" d="M 98.838 55.516 C 98.474 43.689 100.967 34.936 106.137 29.125 C 111.308 23.315 119.155 20.447 129.501 20.395 C 129.631 20.394 188.41 20.34 247.478 20.303 C 306.545 20.267 301.338 18.991 301.181 20.315 C 300.915 22.557 325.431 61.22 399.528 102.182 C 400.214 102.561 398.713 127.257 399.07 194.289 C 399.428 261.321 399.82 327.472 399.82 327.472 C 399.82 327.472 399.781 331.429 399.738 335.486 C 399.695 339.544 399.648 343.701 399.633 344.103 C 399.164 356.968 390.959 362.54 382.871 364.893 C 374.783 367.249 366.812 366.388 366.812 366.388 L 248.116 366.004 L 129.419 365.622 C 122.334 365.393 116.021 363.487 111.047 359.935 C 106.072 356.381 102.436 351.182 100.703 344.368 C 100.357 343.006 100.1 337.527 99.93 332.391 C 99.76 327.252 99.676 322.454 99.676 322.454"></path>
    <rect x="144.945" y="282.384" width="200.875" height="16.896" style="stroke: rgb(0, 0, 0); fill: rgb(166, 71, 6); stroke-width: 0;" rx="8.448" ry="8.448"></rect>
    <rect x="144.921" y="232.549" width="178.973" height="16.896" style="stroke: rgb(0, 0, 0); fill: rgb(166, 71, 6); stroke-width: 0;" rx="8.448" ry="8.448"></rect>
    <rect x="146.73" y="183.334" width="152.065" height="16.896" style="stroke: rgb(0, 0, 0); fill: rgb(166, 71, 6); stroke-width: 0;" rx="8.448" ry="8.448"></rect>
    <g></g>
    <g transform="matrix(1, 0, 0, 1, 33.807117, 22.820999)">
        <ellipse style="stroke-width: 0; stroke: rgb(239, 166, 0); fill: rgba(255, 200, 0, 0.973);" cx="327.338" cy="292.486" rx="96.996" ry="96.683"></ellipse>
        <rect x="203.356" y="333.855" width="102.628" height="16.896" style="stroke: rgb(0, 0, 0); fill: rgb(166, 71, 6); stroke-width: 0; transform-box: fill-box; transform-origin: 50% 50%;" rx="8.448" ry="8.448" transform="matrix(0, 1, -1, 0, 72.55464, -51.998127)"></rect>
        <rect x="-377.75" y="-299.54" width="102.628" height="16.896" style="stroke: rgb(0, 0, 0); fill: rgb(166, 71, 6); stroke-width: 0; transform-origin: -326.446px -291.089px;" rx="8.448" ry="8.448" transform="matrix(-1, 0, 0, -1, 652.891113, 582.178894)"></rect>
    </g>
    <path style="stroke-width: 0px; stroke: rgb(0, 0, 0); fill: rgb(255, 165, 0);" d="M 300.321 19.952 C 300.321 19.952 299.8 68.859 300.32 75.913 C 301.53 92.341 313.221 101.015 324.266 101.511 C 334.862 101.987 400.02 102.108 400.02 102.108"></path>
    </svg>
  `;
  spinnerContainer.appendChild(spinner);

  // Titre avec animation de gradient
  const title = document.createElement('h3');
  title.style.cssText = `
    margin: 0 0 16px 0;
    background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.025em;
    line-height: 1.2;
  `;
  title.textContent = config.title || 'Téléchargement en cours';

  // Message avec meilleure typographie
  const message = document.createElement('p');
  message.style.cssText = `
    margin: 0 0 24px 0;
    color: ${colors.textSecondary};
    font-size: 16px;
    font-weight: 400;
    line-height: 1.5;
    opacity: 0.9;
  `;
  message.textContent = config.message || 'Veuillez patienter, cette opération peut prendre quelques instants.';

  // Barre de progression animée
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    width: 100%;
    height: 4px;
    background: ${colors.border};
    border-radius: 2px;
    overflow: hidden;
    margin: 24px 0 0 0;
    position: relative;
  `;

  const progressFill = document.createElement('div');
  progressFill.style.cssText = `
    width: 40%;
    height: 100%;
    background: linear-gradient(90deg, ${colors.primary}, ${colors.secondary}, ${colors.primary});
    border-radius: 2px;
    animation: progressMove 2s ease-in-out infinite;
  `;

  progressBar.appendChild(progressFill);

  // Points animés modernisés
  const dots = document.createElement('div');
  dots.style.cssText = `
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 8px;
  `;

  // Création de 3 points animés individuellement
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      width: 8px;
      height: 8px;
      background: ${colors.secondary};
      border-radius: 50%;
      animation: dotPulse 1.4s ease-in-out infinite;
      animation-delay: ${i * 0.16}s;
    `;
    dots.appendChild(dot);
  }

  // Assemblage
  container.appendChild(spinnerContainer);
  container.appendChild(title);
  container.appendChild(message);
  container.appendChild(progressBar);
  container.appendChild(dots);
  overlay.appendChild(container);

  // Ajout des animations CSS modernes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes modernSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes dotPulse {
      0%, 80%, 100% { 
        opacity: 0.3;
        transform: scale(0.8);
      }
      40% { 
        opacity: 1;
        transform: scale(1.2);
      }
    }
    
    @keyframes progressMove {
      0% { 
        transform: translateX(-100%);
        opacity: 0;
      }
      50% {
        opacity: 1;
      }
      100% { 
        transform: translateX(350%);
        opacity: 0;
      }
    }
    
    @keyframes shine {
      0% { left: -100%; }
      100% { left: 100%; }
    }
    
    @media (max-width: 640px) {
      .spinner-container {
        min-width: 320px;
        padding: 32px 24px;
        margin: 20px;
      }
    }
  `;
  document.head.appendChild(style);

  // Ajout au DOM
  document.body.appendChild(overlay);

  // Animation d'entrée fluide
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    container.style.transform = 'scale(1) translateY(0)';
  });

  // Stockage de l'instance
  activeSpinners.set(id, overlay);
}

/**
 * Met à jour le texte et les couleurs d'un spinner actif
 * @param id Identifiant du spinner
 * @param config Nouvelle configuration
 * @returns true si le spinner a été trouvé et mis à jour
 */
export function updateSpinnerText(id: string, config: SimpleDownloadConfig): boolean {
  const overlay = activeSpinners.get(id);
  
  if (!overlay) {
    return false;
  }

  const container = overlay.firstElementChild as HTMLElement;
  if (!container) return false;

  const spinnerContainer = container.children[1] as HTMLElement; // Après shine
  const title = container.children[2] as HTMLElement;
  const message = container.children[3] as HTMLElement;
  const progressBar = container.children[4] as HTMLElement;
  const dots = container.children[5] as HTMLElement;

  // Mise à jour du texte avec animation
  if (config.title && title) {
    title.style.opacity = '0';
    title.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      title.textContent = config.title!;
      title.style.opacity = '1';
      title.style.transform = 'translateY(0)';
      title.style.transition = 'all 0.3s ease';
    }, 150);
  }
  
  if (config.message && message) {
    message.style.opacity = '0';
    setTimeout(() => {
      message.textContent = config.message!;
      message.style.opacity = '0.9';
      message.style.transition = 'opacity 0.3s ease';
    }, 150);
  }

  // Mise à jour des couleurs
  if (config.backgroundColor) {
    container.style.background = config.backgroundColor;
  }
  
  if (config.borderColor) {
    container.style.borderColor = config.borderColor;
  }
  
  if (config.overlayColor) {
    overlay.style.backgroundColor = config.overlayColor;
  }

  // Contrôle des animations
  if (config.stopAnimation === true) {
    // Arrêter toutes les animations
    const spinner = spinnerContainer?.firstElementChild as HTMLElement;
    if (spinner) {
      spinner.style.animation = 'none';
    }
    
    const progressFill = progressBar?.firstElementChild as HTMLElement;
    if (progressFill) {
      progressFill.style.animation = 'none';
      progressFill.style.width = '100%';
    }
    
    // Changer les points en indicateur de succès
    if (dots) {
      dots.innerHTML = '<div style="color: #10b981; font-size: 24px;">✓</div>';
    }
  } else if (config.stopAnimation === false) {
    // Redémarrer les animations
    const spinner = spinnerContainer?.firstElementChild as HTMLElement;
    if (spinner) {
      spinner.style.animation = 'modernSpin 1.2s linear infinite';
    }
    
    const progressFill = progressBar?.firstElementChild as HTMLElement;
    if (progressFill) {
      progressFill.style.animation = 'progressMove 2s ease-in-out infinite';
      progressFill.style.width = '40%';
    }
  }

  return true;
}

/**
 * Arrête et supprime le spinner de téléchargement
 * @param id Identifiant du spinner à supprimer
 * @returns true si le spinner existait et a été supprimé
 */
export function stopDownloadSpinner(id: string): boolean {
  const overlay = activeSpinners.get(id);
  
  if (!overlay) {
    return false;
  }

  // Animation de sortie fluide
  overlay.style.opacity = '0';
  overlay.style.backdropFilter = 'blur(0px)';
  const container = overlay.firstElementChild as HTMLElement;
  if (container) {
    container.style.transform = 'scale(0.85) translateY(20px)';
  }

  // Suppression après l'animation
  setTimeout(() => {
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    activeSpinners.delete(id);
  }, 400);

  return true;
}

/**
 * Arrête tous les spinners actifs
 */
export function stopAllDownloadSpinners(): void {
  const ids = Array.from(activeSpinners.keys());
  ids.forEach(id => stopDownloadSpinner(id));
}

/**
 * Vérifie si un spinner est actif
 * @param id Identifiant à vérifier
 * @returns true si le spinner est actif
 */
export function isSpinnerActive(id: string): boolean {
  return activeSpinners.has(id);
}

/**
 * Met à jour le thème d'un spinner actif
 * @param id Identifiant du spinner
 * @param theme Nouveau thème
 * @returns true si le spinner a été trouvé et mis à jour
 */
export function updateSpinnerTheme(id: string, theme: 'light' | 'dark'): boolean {
  const overlay = activeSpinners.get(id);
  if (!overlay) return false;

  const colors = getColors(theme);
  const container = overlay.firstElementChild as HTMLElement;
  
  if (container) {
    // Mise à jour des couleurs du conteneur
    container.style.background = colors.backgroundGlass;
    container.style.borderColor = colors.border;
    
    // Mise à jour du spinner
    const spinner = container.querySelector('[style*="conic-gradient"]') as HTMLElement;
    if (spinner) {
      spinner.style.background = `conic-gradient(from 0deg, ${colors.spinner}, ${colors.secondary}, ${colors.spinner})`;
    }
    
    // Mise à jour des textes
    const message = container.children[3] as HTMLElement;
    if (message) {
      message.style.color = colors.textSecondary;
    }
  }
  
  overlay.style.backgroundColor = colors.overlay;
  return true;
}