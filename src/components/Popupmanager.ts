let isPopupOpen = false;
let clickTimeout: any = null;

export function togglePopup(action: "open" | "close" | "toggle") {
  const popup = document.querySelector(".buga-popup") as HTMLElement;
  if (!popup) return;

  if (action === "open" && !isPopupOpen) {
    popup.style.display = "flex";
    setTimeout(() => {
      popup.style.zIndex = "9999";
      popup.style.pointerEvents = "auto";
      popup.offsetHeight; // force reflow
      popup.style.opacity = "1";
      popup.style.transform = "translateY(0)";
      isPopupOpen = true;
    }, 200);
  }

  if (action === "close" && isPopupOpen) {
    popup.style.opacity = "0";
    popup.style.transform = "translateY(100px)";
    popup.style.pointerEvents = "none";
    isPopupOpen = false;
    setTimeout(() => {
      popup.style.zIndex = "-99999";
      popup.style.display = "none";
    }, 800);
  }

  if (action === "toggle") {
    togglePopup(isPopupOpen ? "close" : "open");
  }
}

export function attachPopupEvents(container: HTMLElement) {
  // Simple click (mais vérifie si pas de double-clic)
  container.addEventListener("click", () => {
    clearTimeout(clickTimeout);
    clickTimeout = setTimeout(() => {
      if (!isPopupOpen) {
        togglePopup("open");
      }
    }, 250); // petit délai pour différencier simple/double clic
  });

  // Double click (prioritaire sur le clic)
  container.addEventListener("dblclick", () => {
    clearTimeout(clickTimeout);
    togglePopup("toggle");
  });
}
