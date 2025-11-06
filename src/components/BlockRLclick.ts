export function block(): void {
  // ==================== BLOCAGE DU RAFRAÎCHISSEMENT ====================
  window.addEventListener('keydown', (e: KeyboardEvent) => {
      // Bloquer la combinaison de touches Ctrl+R et la touche F5
      if ((e.ctrlKey && e.key.toLowerCase() === 'r') || e.key === 'F5') {
          e.preventDefault();
          // Vous pouvez laisser un log pour le débogage si vous le souhaitez
           console.info("{8.BlockRLclick.ts} Action de rafraîchissement bloquée.");
      }
  });

  // ==================== GESTION DU CLIC DROIT (MENU CONTEXTUEL) ====================
  window.addEventListener('contextmenu', (e: MouseEvent) => {
    e.preventDefault();
    const THEME = document.documentElement.getAttribute("data-theme");
    const currenTTheme = THEME === "dark" ? localStorage.getItem("theme"):THEME;
    // Récupérer les données vidéo depuis l'élément cliqué
    const clickedElement = e.target as HTMLElement;
    const videoCard = clickedElement.closest('.allow-right-click') as HTMLElement;
    
    // Essayer de récupérer l'URL depuis les données de la carte vidéo
    let videoUrl: string = "URL not detected";
    
    if (videoCard && (videoCard as any).videoData) {
      videoUrl = (videoCard as any).videoData.url || "URL non disponible";
    }
    
    // Supprimer le menu existant s'il y en a un
    const existingMenu = document.querySelector('.custom-context-menu');
    if (existingMenu) {
      existingMenu.remove();
    }

    const customMenu = document.createElement('div');
    customMenu.className = 'custom-context-menu';
    
    // Styles modernes et élégants
    Object.assign(customMenu.style, {
      position: 'absolute',
      background: `${currenTTheme?.trim() === "light" ? "#ffffff" : "#1a1a1a"}`,
      color: `${currenTTheme?.trim() === "light" ? "#1a1a1a" : "#ffffff"}`,
      padding: '12px 18px',
      borderRadius: '12px',
      display: 'none',
      zIndex: '10000',
      cursor: 'pointer',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2), 0 6px 12px rgba(0, 0, 0, 0.15)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: 'scale(0.95)',
      opacity: '0',
      userSelect: 'none',
      minWidth: '160px',
      textAlign: 'center'
    });

    // Icône et texte
    customMenu.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; justify-content: center; font-size: 14px;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-14.957 -22.436 500 500" width="30" height="30" style="flex-shrink: 0; vertical-align: middle;">
            <defs>
            <linearGradient gradientUnits="userSpaceOnUse" x1="229.701" y1="68.376" x2="229.701" y2="344.017" id="gradient-1" gradientTransform="matrix(1.14433,0,0,1.100775,-4.306338,-26.121364)">
                <stop offset="0" style="stop-color: rgb(100% 58.431% 0%)"></stop>
                <stop offset="1" style="stop-color: rgb(64.317% 29.827% 0%)"></stop>
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" x1="229.701" y1="68.376" x2="229.701" y2="344.017" id="gradient-2" gradientTransform="matrix(1.14433,0,0,1.100775,-4.306338,-26.121364)">
                <stop offset="0" style="stop-color: rgb(0% 0% 0%)"></stop>
                <stop offset="1" style="stop-color: rgb(0% 0% 0%)"></stop>
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" x1="229.701" y1="68.376" x2="229.701" y2="344.017" id="gradient-3" gradientTransform="matrix(1.248215,0,0,1.084013,-61.205963,18.93837)">
                <stop offset="0" style="stop-color: rgb(100% 58.431% 0%)"></stop>
                <stop offset="1" style="stop-color: rgb(64.317% 29.827% 0%)"></stop>
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" x1="229.701" y1="68.376" x2="229.701" y2="344.017" id="gradient-4" gradientTransform="matrix(1.248215,0,0,1.084013,-61.205963,18.93837)">
                <stop offset="0" style="stop-color: rgb(0% 0% 0%)"></stop>
                <stop offset="1" style="stop-color: rgb(0% 0% 0%)"></stop>
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" x1="229.701" y1="68.376" x2="229.701" y2="344.017" id="gradient-6" gradientTransform="matrix(0.948453,0,0,0.953489,41.221901,4.248937)">
                <stop offset="0" style="stop-color: rgb(0% 0% 0%)"></stop>
                <stop offset="1" style="stop-color: rgb(0% 0% 0%)"></stop>
            </linearGradient>
            <linearGradient id="gradient-0" bx:pinned="true"></linearGradient>
            <linearGradient bx:pinned="true" id="color-0">
                <stop style="stop-color: #f12711;" offset="0"></stop>
                <stop style="stop-color: #f5af19;" offset="1"></stop>
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" x1="259.081" y1="69.445" x2="259.081" y2="332.266" id="gradient-5">
                <stop offset="0" style="stop-color: rgb(100% 100% 100%)"></stop>
                <stop offset="1" style="stop-color: rgb(56.687% 56.687% 56.687%)"></stop>
            </linearGradient>
            </defs>
            <g transform="matrix(1.269964,0,0,1.227572,-97.004318,-44.719189)">
            <rect x="139.956" y="49.145" width="237.179" height="303.419" style="fill-rule:nonzero;paint-order:fill;fill:url(#gradient-1);stroke:url(#gradient-2);stroke-linecap:round;stroke-miterlimit:1;stroke-width:0px;" rx="26.709" ry="26.709"></rect>
            <path d="M118.294 124.769 L118.8 357.763 C119.694 360.512 118.948 369.036 133.221 369.934 L320.192 371.183 C341.56 371.147 336.492 390.789 321.527 391.857 L129.493 391.857 C111.08 391.857 96.154 378.894 96.154 362.904 L96.419 125.486 C94.282 109.496 118.566 109.011 118.294 124.769 Z" style="fill-rule:nonzero;paint-order:fill;stroke-linecap:round;stroke-miterlimit:1;stroke-width:0;fill:url(#gradient-3);stroke:url(#gradient-4);"></path>
            <g>
                <rect x="160.791" y="69.445" width="196.58" height="262.821" style="fill-rule:nonzero;paint-order:fill;stroke-linecap:round;stroke-miterlimit:1;stroke-width:0;stroke:url(#gradient-6);fill:${currenTTheme?.trim() === "light" ? "#ffffff" : "#1a1a1a"};" rx="14.957" ry="14.957"></rect>
            </g>
            </g>
        </svg>
        <span>Copier l'URL</span>
        </div>
    `;

    document.body.appendChild(customMenu);

    function copyText(text: string): void {
      navigator.clipboard.writeText(text).then(() => {
        // Toast notification moderne
        showToast('URL copiée avec succès !', 'success');
      }).catch(() => {
        showToast('Erreur lors de la copie', 'error');
      });
    }

    function showToast(message: string, type: 'success' | 'error' = 'success'): void {
      const toast = document.createElement('div');
      const bgColor = type === 'success' 
        ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)' 
        : 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
      
      Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: bgColor,
        color: '#ffffff',
        padding: '12px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: '10001',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: 'none'
      });
      
      toast.textContent = message;
      document.body.appendChild(toast);
      
      // Animation d'entrée
      setTimeout(() => {
        toast.style.transform = 'translateX(0)';
      }, 10);
      
      // Animation de sortie et suppression
      setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    // Si l'élément cliqué a la classe "allow-right-click", afficher le menu
    if (clickedElement.closest('.allow-right-click')) {
      // Position du menu avec vérification des bords de l'écran
      let x = e.pageX;
      let y = e.pageY;
      
      // Vérifier si le menu sort de l'écran
      setTimeout(() => {
        const menuRect = customMenu.getBoundingClientRect();
        if (x + menuRect.width > window.innerWidth) {
          x = window.innerWidth - menuRect.width - 10;
        }
        if (y + menuRect.height > window.innerHeight) {
          y = y - menuRect.height - 10;
        }
        
        customMenu.style.left = x + 'px';
        customMenu.style.top = y + 'px';
      }, 0);

      customMenu.style.display = 'block';
      
      // Animation d'apparition
      setTimeout(() => {
        customMenu.style.transform = 'scale(1)';
        customMenu.style.opacity = '1';
      }, 10);

      // Effet hover
      customMenu.addEventListener('mouseenter', () => {
        customMenu.style.transform = 'scale(1.02)';
        customMenu.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.25), 0 8px 16px rgba(0, 0, 0, 0.2)';
      });

      customMenu.addEventListener('mouseleave', () => {
        customMenu.style.transform = 'scale(1)';
        customMenu.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2), 0 6px 12px rgba(0, 0, 0, 0.15)';
      });

      customMenu.onclick = (event: MouseEvent) => {
        event.stopPropagation();
        copyText(videoUrl);
        
        // Animation de fermeture
        customMenu.style.transform = 'scale(0.95)';
        customMenu.style.opacity = '0';
        setTimeout(() => customMenu.remove(), 200);
      };
    }

    // Fonction pour cacher le menu
    function hideMenu(): void {
      if (customMenu && customMenu.parentNode) {
        customMenu.style.transform = 'scale(0.95)';
        customMenu.style.opacity = '0';
        setTimeout(() => {
          if (customMenu.parentNode) {
            customMenu.remove();
          }
        }, 200);
      }
    }

    // Cacher le menu si clic ailleurs (délégation d'événement)
    const hideMenuHandler = (event: Event) => {
      if (!customMenu.contains(event.target as Node)) {
        hideMenu();
        window.removeEventListener('click', hideMenuHandler);
      }
    };

    // Ajouter l'écouteur avec un petit délai pour éviter la fermeture immédiate
    setTimeout(() => {
      window.addEventListener('click', hideMenuHandler);
    }, 10);

    document.addEventListener('DOMContentLoaded', () => {
        const customAlert = document.querySelector('.customAlert') as HTMLDivElement | null;
        if (customAlert) {
            customAlert.addEventListener('scroll', hideMenu, { once: true });
        }
    });

  });
}