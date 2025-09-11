type AlertType = "success" | "error" | "info" | "warning";

interface AlertMessage {
  title?: string;
  subtitle?: string;
  message: string;
}

export function customAlert(
  content: string | AlertMessage,
  duration = 4000,
  type: AlertType = "success"
): void {
  // Parse du contenu
  let title: string | undefined;
  let subtitle: string | undefined;
  let message: string;

  if (typeof content === "string") {
    message = content;
  } else {
    title = content.title;
    subtitle = content.subtitle;
    message = content.message;
  }

  // Fonction utilitaire pour formater les messages
  function formatMessage(text: string): string {
    // Échapper les caractères HTML dangereux d'abord
    let formattedText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    
    // Remplacer --texte-- par du texte gras souligné
    formattedText = formattedText.replace(/--([^-\n]+)--/g, '<span style="font-weight: bold; text-decoration: underline;">$1</span>');
    
    // Remplacer les \n par des <br>
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    return formattedText;
  }

  // Création du fond flou avec effet glassmorphism
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    cursor: default;
    animation: overlayFadeIn 0.3s ease-out;
  `;

  // Styles d'animation CSS
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes overlayFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes alertSlideIn {
      from { 
        opacity: 0; 
        transform: translateY(-30px) scale(0.95);
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1);
      }
    }
    
    @keyframes alertSlideOut {
      from { 
        opacity: 1; 
        transform: translateY(0) scale(1);
      }
      to { 
        opacity: 0; 
        transform: translateY(-20px) scale(0.98);
      }
    }
    
    @keyframes progressBar {
      from { width: 100%; }
      to { width: 0%; }
    }
  `;
  document.head.appendChild(styleSheet);

  // Configuration des couleurs et icônes selon le type
  const config = {
    success: {
      gradient: "linear-gradient(135deg, #10b981, #059669)",
      shadow: "rgba(16, 185, 129, 0.4)",
      icon: "✓",
      accent: "#d1fae5"
    },
    error: {
      gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
      shadow: "rgba(239, 68, 68, 0.4)",
      icon: "✕",
      accent: "#fee2e2"
    },
    info: {
      gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
      shadow: "rgba(59, 130, 246, 0.4)",
      icon: "i",
      accent: "#dbeafe"
    },
    warning: {
      gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
      shadow: "rgba(245, 158, 11, 0.4)",
      icon: "!",
      accent: "#fef3c7"
    }
  };

  const currentConfig = config[type];

  // Création de l'alerte principale
  const alertDiv = document.createElement("div");
  alertDiv.style.cssText = `
    position: relative;
    min-width: 320px;
    max-width: 500px;
    background: ${currentConfig.gradient};
    border-radius: 16px;
    box-shadow: 
      0 25px 50px -12px ${currentConfig.shadow},
      0 0 0 1px rgba(255, 255, 255, 0.1);
    color: white;
    overflow: hidden;
    animation: alertSlideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Création du contenu principal
  const contentDiv = document.createElement("div");
  contentDiv.style.cssText = `
    padding: 24px 28px;
    position: relative;
  `;

  // Header avec icône et bouton fermer
  const headerDiv = document.createElement("div");
  headerDiv.style.cssText = `
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: ${title || subtitle ? "16px" : "0"};
  `;

  // Icône principale
  const iconDiv = document.createElement("div");
  iconDiv.style.cssText = `
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    margin-right: 16px;
    flex-shrink: 0;
  `;
  iconDiv.textContent = currentConfig.icon;

  // Bouton de fermeture moderne
  const closeButton = document.createElement("button");
  closeButton.style.cssText = `
    width: 32px;
    height: 32px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-size: 16px;
  `;
  closeButton.innerHTML = "×";
  
  closeButton.addEventListener("mouseenter", () => {
    closeButton.style.background = "rgba(255, 255, 255, 0.2)";
    closeButton.style.color = "white";
  });
  
  closeButton.addEventListener("mouseleave", () => {
    closeButton.style.background = "rgba(255, 255, 255, 0.1)";
    closeButton.style.color = "rgba(255, 255, 255, 0.8)";
  });

  // Container pour le texte
  const textContainer = document.createElement("div");
  textContainer.style.cssText = `
    flex: 1;
  `;

  // Titre principal
  if (title) {
    const titleElement = document.createElement("h3");
    titleElement.style.cssText = `
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.3;
    `;
    titleElement.textContent = title;
    textContainer.appendChild(titleElement);
  }

  // Sous-titre
  if (subtitle) {
    const subtitleElement = document.createElement("p");
    subtitleElement.style.cssText = `
      margin: 0 0 12px 0;
      font-size: 14px;
      opacity: 0.9;
      font-weight: 500;
      line-height: 1.4;
    `;
    subtitleElement.textContent = subtitle;
    textContainer.appendChild(subtitleElement);
  }

  // Message principal avec formatage
  const messageElement = document.createElement("div");
  messageElement.style.cssText = `
    margin: 0;
    font-size: 15px;
    line-height: 1.5;
    opacity: 0.95;
  `;
  messageElement.innerHTML = formatMessage(message);
  textContainer.appendChild(messageElement);

  // Barre de progression
  const progressBar = document.createElement("div");
  progressBar.style.cssText = `
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: rgba(255, 255, 255, 0.3);
    animation: progressBar ${duration}ms linear;
  `;

  // Assembly
  const contentFlex = document.createElement("div");
  contentFlex.style.cssText = `
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  contentFlex.appendChild(iconDiv);
  contentFlex.appendChild(textContainer);
  
  headerDiv.appendChild(contentFlex);
  headerDiv.appendChild(closeButton);
  
  contentDiv.appendChild(headerDiv);
  alertDiv.appendChild(contentDiv);
  alertDiv.appendChild(progressBar);

  overlay.appendChild(alertDiv);
  document.body.appendChild(overlay);


  // Fonction de fermeture avec animation
  function removeAlert() {
    clearTimeout(timeoutId);
    alertDiv.style.animation = "alertSlideOut 0.3s ease-in forwards";
    overlay.style.animation = "overlayFadeIn 0.3s ease-in reverse";
    
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
        document.head.removeChild(styleSheet);
      }
    }, 300);
  }

  // Event listeners
  closeButton.addEventListener("click", removeAlert);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) removeAlert();
  });

  // Auto-fermeture
  const timeoutId = setTimeout(removeAlert, duration);

  // Support clavier
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      removeAlert();
      document.removeEventListener("keydown", handleKeydown);
    }
  };
  document.addEventListener("keydown", handleKeydown);
}

// Fonctions utilitaires pour faciliter l'usage
export const showSuccess = (content: string | AlertMessage, duration?: number) => 
  customAlert(content, duration, "success");

export const showError = (content: string | AlertMessage, duration?: number) => 
  customAlert(content, duration, "error");

export const showInfo = (content: string | AlertMessage, duration?: number) => 
  customAlert(content, duration, "info");

export const showWarning = (content: string | AlertMessage, duration?: number) => 
  customAlert(content, duration, "warning");