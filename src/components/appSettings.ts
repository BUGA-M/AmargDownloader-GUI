import { invoke } from '@tauri-apps/api/core';
import {verifieStartup } from "../utils/init"

export async function openAppSettingsModal(){
    const THEME = document.documentElement.getAttribute("data-theme");
    const savedTheme = THEME === "dark" ? localStorage.getItem("theme"):THEME;
    await verifieStartup()
    //------------------------ Internal Functions ------------------------------------//


    function setLanguage (enabled: string) {
        localStorage.setItem("Language",enabled)
    }
    
    // Auto-start settings
    function setAutoStart(enabled: boolean): void {
        localStorage.setItem("startup", String(enabled));
    }
    //@ts-ignore
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
        return localStorage.getItem("minimizeToTray");
    }

    //------------------------------------------------------------//

    // Create blurred overlay with animation
    const overlay = document.createElement("div");
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background:  rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        opacity: 0;
        transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    // Create modern modal window
    const modal = document.createElement("div");
    modal.style.cssText = `
        width: 1000px;
        max-width: 90%;
        max-height: calc(100vh - 80px);
        padding: 0;
        border-radius: 24px 24px 8px 24px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6), 
                    0 0 0 1px rgba(255, 255, 255, 0.08);
        color: ${savedTheme?.trim() === "light" ? "#1a1a1a" : "#ffffff"};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
        position: relative;
        transform: scale(0.85) translateY(40px);
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        overflow: hidden;
        border: ${savedTheme?.trim() === "light" ? "1px solid rgba(0, 0, 0, 0.08)" : "1px solid rgba(255, 255, 255, 0.08)"};
    `;

    // Header with enhanced gradient
    const header = document.createElement("div");
    header.style.cssText = `
        background: linear-gradient(135deg, #af4c0f 0%, #ff6600 50%, #f55e00ff 100%);
        padding: 28px 32px;
        position: relative;
        overflow: hidden;
    `;

    // Add subtle pattern overlay to header
    const patternOverlay = document.createElement("div");
    patternOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.03"><circle cx="7" cy="7" r="1"/><circle cx="27" cy="7" r="1"/><circle cx="47" cy="7" r="1"/><circle cx="7" cy="27" r="1"/><circle cx="27" cy="27" r="1"/><circle cx="47" cy="27" r="1"/><circle cx="7" cy="47" r="1"/><circle cx="27" cy="47" r="1"/><circle cx="47" cy="47" r="1"/></g></g></svg>');
        pointer-events: none;
    `;
    header.appendChild(patternOverlay);

    // Enhanced title with icon
    const titleContainer = document.createElement("div");
    titleContainer.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        position: relative;
        z-index: 1;
    `;

    const titleIcon = document.createElement("div");
    titleIcon.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 8v6m11-7h-6m-8 0H1"/>
        </svg>
    `;
    titleIcon.style.cssText = `
        color: rgba(255, 255, 255, 0.9);
    `;

    const title = document.createElement("h2");
    title.textContent = "Application Settings";
    title.style.cssText = `
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        color: #ffffff;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        letter-spacing: -0.5px;
    `;

    titleContainer.appendChild(titleIcon);
    titleContainer.appendChild(title);

    // Enhanced close button
    const closeButton = document.createElement("button");
    closeButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="m18 6-12 12M6 6l12 12"/>
        </svg>
    `;
    closeButton.style.cssText = `
        position: absolute;
        top: 50%;
        right: 24px;
        transform: translateY(-50%);
        background: rgba(255, 255, 255, 0.1);
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 12px;
        color: #ffffff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        backdrop-filter: blur(20px);
        z-index: 2;
    `;

    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.background = 'rgba(255, 255, 255, 0.2)';
        closeButton.style.transform = 'translateY(-50%) scale(1.1) rotate(90deg)';
    });

    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.background = 'rgba(255, 255, 255, 0.1)';
        closeButton.style.transform = 'translateY(-50%) scale(1) rotate(0deg)';
    });

    header.appendChild(titleContainer);
    header.appendChild(closeButton);
    modal.appendChild(header);

    // Modal body with enhanced styling
    const body = document.createElement("div");
    body.style.cssText = `
        padding: 32px;
        display: flex;
        flex-direction: column;
        gap: 28px;
        background: ${savedTheme?.trim() === "light" ? "linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)" : "linear-gradient(180deg, #121212 0%, #1a1a1a 100%)"};
        overflow-y: auto;
        max-height: calc(100vh - 200px);
    `;

    // Enhanced field group creation function
    function createFieldGroup(
        labelText: string,
        inputElements: HTMLElement | HTMLElement[],
        description: string = "",
        icon: string = ""
    ): HTMLDivElement {
        const group = document.createElement("div");
        group.style.cssText = `
            background: ${savedTheme?.trim() === "light" ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.02)"};
            border: 1px solid ${savedTheme?.trim() === "light" ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.06)"};
            border-radius: 16px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;

        // Hover effect for groups
        group.addEventListener('mouseenter', () => {
            group.style.transform = 'translateY(-1px)';
            group.style.boxShadow = `0 8px 25px ${savedTheme?.trim() === "light" ? "rgba(0, 0, 0, 0.08)" : "rgba(0, 0, 0, 0.3)"}`;
        });

        group.addEventListener('mouseleave', () => {
            group.style.transform = 'translateY(0)';
            group.style.boxShadow = 'none';
        });

        // Label with icon
        if (labelText.trim() !== "") {
            const labelContainer = document.createElement("div");
            labelContainer.style.cssText = `
                display: flex;
                align-items: center;
                gap: 10px;
            `;

            if (icon) {
                const iconElement = document.createElement("div");
                iconElement.innerHTML = icon;
                iconElement.style.cssText = `
                    color: ${savedTheme?.trim() === "light" ? "#af4c0f" : "#ff6600"};
                    display: flex;
                    align-items: center;
                `;
                labelContainer.appendChild(iconElement);
            }

            const label = document.createElement("label");
            label.textContent = labelText;
            label.style.cssText = `
                font-size: 16px;
                font-weight: 600;
                color: ${savedTheme?.trim() === "light" ? "#2d3748" : "#f7fafc"};
                margin: 0;
                letter-spacing: -0.2px;
            `;
            labelContainer.appendChild(label);
            group.appendChild(labelContainer);
        }

        // Add input elements
        if (Array.isArray(inputElements)) {
            inputElements.forEach(el => group.appendChild(el));
        } else {
            group.appendChild(inputElements);
        }

        // Enhanced description
        if (description.trim() !== "") {
            const desc = document.createElement("div");
            desc.textContent = description;
            desc.style.cssText = `
                font-size: 13px;
                color: ${savedTheme?.trim() === "light" ? "#718096" : "#a0aec0"};
                line-height: 1.5;
                margin-top: 4px;
                padding: 8px 12px;
                background: ${savedTheme?.trim() === "light" ? "rgba(175, 76, 15, 0.02)" : "rgba(255, 102, 0, 0.02)"};
                border-radius: 8px;
                border-left: 3px solid ${savedTheme?.trim() === "light" ? "#af4c0f" : "#ff6600"};
            `;
            group.appendChild(desc);
        }

        return group;
    }


    // Create language selector
    const languageSelect = document.createElement("select");
    languageSelect.disabled = true;
    languageSelect.style.cssText = `
        background: ${savedTheme?.trim() === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.05)"};
        border: 2px solid ${savedTheme?.trim() === "light" ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)"};
        border-radius: 12px;
        padding: 12px 16px;
        color: ${savedTheme?.trim() === "light" ? "#2d3748" : "#e2e8f0"};
        font-size: 14px;
        font-family: inherit;
        transition: all 0.3s ease;
        outline: none;
        cursor: pointer;
        width: 100%;
    `;

    const languages = [
        { value: "en", label: "🇺🇸 English" },
        { value: "fr", label: "🇫🇷 Français" },
        { value: "es", label: "🇪🇸 Español" },
        { value: "de", label: "🇩🇪 Deutsch" }
    ];

    languages.forEach(lang => {
        const option = document.createElement("option");
        option.value = lang.value;
        option.textContent = lang.label;
        option.selected = lang.value === "en";
        languageSelect.appendChild(option);
    });

    // Create enhanced checkboxes
    function createModernCheckbox(id: string, checked: string | null, label: string, description: string,disabled : boolean ) {
        const container = document.createElement("div");
        container.style.cssText = `
            display: flex;
            align-items: flex-start;
            gap: 16px;
            cursor: pointer;
        `;
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = id;
        checkbox.checked = checked === "true";
        checkbox.disabled = disabled
        console.log(checkbox.checked)
        checkbox.style.cssText = `
            appearance: none;
            width: 22px;
            height: 22px;
            border: 2px solid ${savedTheme?.trim() === "light" ? "#af4c0f" : "#ff6600"};
            border-radius: 6px;
            background: ${checkbox.checked ? "linear-gradient(135deg, #f55e00ff, #ff9900ff)" : "transparent"};
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            flex-shrink: 0;
            margin-top: 2px;
        `;

        if (checked) {
            checkbox.innerHTML = `
                <svg style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 14px; height: 14px;" 
                    viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round">
                    <polyline points="20,6 9,17 4,12"/>
                </svg>
            `;
        }


        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                checkbox.style.background = 'linear-gradient(135deg, #f55e00ff, #ff9900ff)';
                checkbox.style.transform = 'scale(1.1)';
                checkbox.innerHTML = `
                    <svg style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 14px; height: 14px;" 
                        viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round">
                        <polyline points="20,6 9,17 4,12"/>
                    </svg>
                `;
            } else {
                checkbox.style.background = 'transparent';
                checkbox.style.transform = 'scale(1)';
                checkbox.innerHTML = '';
            }
        });

        const textContainer = document.createElement("div");
        textContainer.style.cssText = `
            flex: 1;
        `;

        const labelElement = document.createElement("label");
        labelElement.textContent = label;
        labelElement.htmlFor = id;
        labelElement.style.cssText = `
            font-size: 15px;
            font-weight: 500;
            color: ${savedTheme?.trim() === "light" ? "#2d3748" : "#e2e8f0"};
            cursor: pointer;
            display: block;
            margin-bottom: 4px;
        `;


        const descElement = document.createElement("div");
        descElement.textContent = description;
        descElement.style.cssText = `
            font-size: 13px;
            color: ${savedTheme?.trim() === "light" ? "#718096" : "#a0aec0"};
            line-height: 1.4;
        `;

        if (id === "notifications" || id === "autoUpdate"){
            checkbox.style.background = 'transparent';
            checkbox.style.transform = 'scale(1)';
            checkbox.innerHTML = '';
            checkbox.style.cursor = "default";
            labelElement.style.cursor = "default";
            descElement.style.cursor = "default";
            textContainer.style.cursor = "default";
            container.style.cursor = "default";
        };

        if (id === "minimizeToTray" ){
            checkbox.style.cursor = "default";
            labelElement.style.cursor = "default";
            descElement.style.cursor = "default";
            textContainer.style.cursor = "default";
            container.style.cursor = "default";
        };


        textContainer.appendChild(labelElement);
        textContainer.appendChild(descElement);
        container.appendChild(checkbox);
        container.appendChild(textContainer);

        return { container, checkbox };
    }



    const languageGroup = createFieldGroup(
        "Language",
        languageSelect,
        "Select your preferred language for the interface",
        `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/></svg>`
    );

    const autoStartCheckbox = createModernCheckbox(
        "autoStart",
        String(await verifieStartup()),
        "Launch on startup",
        "Automatically start the application when your computer boots",
        false
    );

    const notificationsCheckbox = createModernCheckbox(
        "notifications",
        getNotifications(),
        "Enable notifications",
        "Show system notifications for important events and updates",
        true
    );

    const autoUpdateCheckbox = createModernCheckbox(
        "autoUpdate",
        getAutoUpdate(),
        "Automatic updates",
        "Download and install updates automatically when available",
        true
    );

    const minimizeToTrayCheckbox = createModernCheckbox(
        "minimizeToTray",
        getMinimizeToTray(),
        "Minimize to system tray",
        "Keep the app running in the background when minimized",
        true
    );

    const behaviorGroup = createFieldGroup(
        "Behavior",
        [autoStartCheckbox.container, notificationsCheckbox.container, autoUpdateCheckbox.container, minimizeToTrayCheckbox.container],
        "",
        `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v6.5m0 7V22M5.5 5.5l4.6 4.6m7.8 7.8L22 22M2 12h6.5m7 0H22M5.5 18.5l4.6-4.6m7.8-7.8L22 2"/></svg>`
    );

    // Add all groups to body

    body.appendChild(languageGroup);
    body.appendChild(behaviorGroup);

    // Enhanced action buttons
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
        display: flex;
        gap: 16px;
        margin-top: 12px;
        padding-top: 20px;
        border-top: 1px solid ${savedTheme?.trim() === "light" ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.06)"};
    `;

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.cssText = `
        flex: 1;
        padding: 14px 20px;
        border: 2px solid ${savedTheme?.trim() === "light" ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)"};
        border-radius: 12px;
        background: transparent;
        color: ${savedTheme?.trim() === "light" ? "#4a5568" : "#a0aec0"};
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        letter-spacing: -0.2px;
    `;

    const applyBtn = document.createElement("button");
    applyBtn.textContent = "Apply Settings";
    applyBtn.style.cssText = `
        flex: 2;
        padding: 14px 24px;
        border: none;
        border-radius: 12px;
        background: linear-gradient(135deg, #f55e00ff 0%, #ff9900ff 100%);
        color: #ffffff;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 6px 20px rgba(245, 94, 0, 0.4);
        letter-spacing: -0.2px;
    `;

    // Enhanced button hover effects
    cancelBtn.addEventListener('mouseenter', () => {
        cancelBtn.style.background = savedTheme?.trim() === "light" ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.04)";
        cancelBtn.style.transform = 'translateY(-2px)';
        cancelBtn.style.borderColor = savedTheme?.trim() === "light" ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.2)";
    });

    cancelBtn.addEventListener('mouseleave', () => {
        cancelBtn.style.background = 'transparent';
        cancelBtn.style.transform = 'translateY(0)';
        cancelBtn.style.borderColor = savedTheme?.trim() === "light" ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)";
    });

    applyBtn.addEventListener('mouseenter', () => {
        applyBtn.style.transform = 'translateY(-2px) scale(1.02)';
        applyBtn.style.boxShadow = '0 8px 30px rgba(245, 94, 0, 0.6)';
    });

    applyBtn.addEventListener('mouseleave', () => {
        applyBtn.style.transform = 'translateY(0) scale(1)';
        applyBtn.style.boxShadow = '0 6px 20px rgba(245, 94, 0, 0.4)';
    });

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(applyBtn);
    body.appendChild(buttonContainer);

    modal.appendChild(body);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Enhanced entrance animation
    requestAnimationFrame(() => {
        overlay.style.opacity = "1";
        modal.style.transform = "scale(1) translateY(0)";
    });

    // Modal removal function
    function removeModal(): void {
        overlay.style.opacity = "0";
        modal.style.transform = "scale(0.85) translateY(40px)";
        
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 400);
    }

    // Event listeners
    closeButton.addEventListener("click", removeModal);
    cancelBtn.addEventListener("click", removeModal);

    overlay.addEventListener("click", (e: MouseEvent) => {
        if (e.target === overlay) removeModal();
    });

    document.addEventListener("keydown", function escapeHandler(e: KeyboardEvent): void {
        if (e.key === "Escape") {
            removeModal();
            document.removeEventListener("keydown", escapeHandler);
        }
    });

    // Apply settings handler
    applyBtn.addEventListener("click", async () => {
        
        // Save all settings
        setLanguage(languageSelect.value);
        setAutoStart(autoStartCheckbox.checkbox.checked);
         //setNotifications(notificationsCheckbox.checkbox.checked);
         //setAutoUpdate(autoUpdateCheckbox.checkbox.checked);
        setMinimizeToTray(minimizeToTrayCheckbox.checkbox.checked);

        // Success animation
        applyBtn.innerHTML = `
            <svg style="display: inline-block; margin-right: 8px;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                <polyline points="20,6 9,17 4,12"/>
            </svg>
            Settings Applied!
        `;
        applyBtn.style.background = "linear-gradient(135deg, #48bb78, #38a169)";
        applyBtn.style.boxShadow = '0 8px 30px rgba(72, 187, 120, 0.6)';
        
        // Optional: Call Tauri function to apply system-level settings
        try {
            await invoke<boolean>('toggle_startup', {
                enable : autoStartCheckbox.checkbox.checked,
            });
        } catch (error) {
            console.error("Error applying settings:", error);
        }

        setTimeout(() => {
            removeModal();
        }, 1000);
    });
}