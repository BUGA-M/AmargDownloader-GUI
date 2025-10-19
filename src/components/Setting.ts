import { invoke } from '@tauri-apps/api/core';

export function openSettingsModal(): void {
    const savedTheme = localStorage.getItem("theme");

    //------------------------ Internal Functions ------------------------------------//

    // Fragment setter
    function set_nb_fragment(nb: string): void {
        localStorage.setItem("Fragments", nb);
    }

    // Fragment getter
    function get_nb_fragment(): string {
        return localStorage.getItem("Fragments") || "4";
    }
    
    // Output folder setter
    function set_StoredFolder(folder: string): void {
        localStorage.setItem("outputFolder", folder);
    }

    // Output folder getter
    function get_StoredFolder(): string | null {
        return localStorage.getItem("outputFolder");
    }

    // No-part setter
    function set_noPart(value: boolean): void {
        localStorage.setItem("noPart", String(value));
    }

    // No-part getter
    function get_noPart(): string | null {
        return localStorage.getItem("noPart");
    }

    // Ignore errors setter
    function set_ignorError(value: boolean): void {
        localStorage.setItem("ignorError", String(value));
    }
    
    // Ignore errors getter
    function get_ignorError(): string | null {
        return localStorage.getItem("ignorError");
    }

    //------------------------------------------------------------//

    // Enhanced blurred overlay with orange tint
    const overlay = document.createElement("div");
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background:  rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(15px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        opacity: 0;
        transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    // Enhanced modern modal window
    const modal = document.createElement("div");
    modal.style.cssText = `
        width: 1000px;
        max-width: 92%;
        max-height: calc(100vh - 80px);
        padding: 0;
        border-radius: 24px 24px 8px 24px;
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), 
                    0 0 0 1px ${savedTheme?.trim() === "light" ? "rgba(175, 76, 15, 0.1)" : "rgba(255, 102, 0, 0.1)"};
        color: ${savedTheme?.trim() === "light" ? "#1a1a1a" : "#ffffff"};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
        position: relative;
        transform: scale(0.85) translateY(50px);
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        overflow: hidden;
        background: ${savedTheme?.trim() === "light" ? "linear-gradient(145deg, #fafafa, #f0f0f0)" : "linear-gradient(145deg, #121212, #1a1a1a)"};
    `;

    // Enhanced header with gradient and pattern
    const header = document.createElement("div");
    header.style.cssText = `
        background: linear-gradient(135deg, #af4c0f 0%, #ff6600 50%, #f55e00ff 100%);
        padding: 32px 36px;
        position: relative;
        overflow: hidden;
    `;

    // Subtle pattern overlay
    const patternOverlay = document.createElement("div");
    patternOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.04"><circle cx="5" cy="5" r="1"/><circle cx="20" cy="5" r="1"/><circle cx="35" cy="5" r="1"/><circle cx="5" cy="20" r="1"/><circle cx="20" cy="20" r="1"/><circle cx="35" cy="20" r="1"/><circle cx="5" cy="35" r="1"/><circle cx="20" cy="35" r="1"/><circle cx="35" cy="35" r="1"/></g></g></svg>');
        pointer-events: none;
    `;
    header.appendChild(patternOverlay);

    // Enhanced title with icon
    const titleContainer = document.createElement("div");
    titleContainer.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 14px;
        position: relative;
        z-index: 1;
    `;

    const titleIcon = document.createElement("div");
    titleIcon.innerHTML = `
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
    `;
    titleIcon.style.cssText = `
        color: rgba(255, 255, 255, 0.95);
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    `;

    const title = document.createElement("h2");
    title.textContent = "Download Settings";
    title.style.cssText = `
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        color: #ffffff;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        letter-spacing: -0.5px;
    `;

    titleContainer.appendChild(titleIcon);
    titleContainer.appendChild(title);

    // Enhanced close button
    const closeButton = document.createElement("button");
    closeButton.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="m18 6-12 12M6 6l12 12"/>
        </svg>
    `;
    closeButton.style.cssText = `
        position: absolute;
        top: 50%;
        right: 28px;
        transform: translateY(-50%);
        background: rgba(255, 255, 255, 0.12);
        border: none;
        width: 44px;
        height: 44px;
        border-radius: 14px;
        color: #ffffff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        backdrop-filter: blur(20px);
        z-index: 2;
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;

    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.background = 'rgba(255, 255, 255, 0.2)';
        closeButton.style.transform = 'translateY(-50%) scale(1.1) rotate(90deg)';
        closeButton.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.15)';
    });

    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.background = 'rgba(255, 255, 255, 0.12)';
        closeButton.style.transform = 'translateY(-50%) scale(1) rotate(0deg)';
        closeButton.style.boxShadow = 'none';
    });

    header.appendChild(titleContainer);
    header.appendChild(closeButton);
    modal.appendChild(header);

    // Enhanced modal body
    const body = document.createElement("div");
    body.style.cssText = `
        padding: 36px;
        display: flex;
        flex-direction: column;
        gap: 32px;
        overflow-y: auto;
        max-height: calc(100vh - 220px);
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
            background: ${savedTheme?.trim() === "light" ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.03)"};
            border: 1px solid ${savedTheme?.trim() === "light" ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.06)"};
            border-radius: 18px;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            position: relative;
        `;

        // Subtle gradient border effect
        const borderGradient = document.createElement("div");
        borderGradient.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 18px;
            padding: 1px;
            background: linear-gradient(135deg, ${savedTheme?.trim() === "light" ? "#af4c0f" : "#ff6600"}22, transparent, ${savedTheme?.trim() === "light" ? "#ff6600" : "#f55e00ff"}22);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: exclude;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: exclude;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;
        group.appendChild(borderGradient);

        // Hover effects
        group.addEventListener('mouseenter', () => {
            group.style.transform = 'translateY(-3px)';
            group.style.boxShadow = `0 12px 40px ${savedTheme?.trim() === "light" ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.3)"}`;
            borderGradient.style.opacity = '1';
        });

        group.addEventListener('mouseleave', () => {
            group.style.transform = 'translateY(0)';
            group.style.boxShadow = 'none';
            borderGradient.style.opacity = '0';
        });

        // Content container
        const content = document.createElement("div");
        content.style.cssText = `
            position: relative;
            z-index: 1;
        `;

        // Label with icon
        if (labelText.trim() !== "") {
            const labelContainer = document.createElement("div");
            labelContainer.style.cssText = `
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 12px;
            `;

            if (icon) {
                const iconElement = document.createElement("div");
                iconElement.innerHTML = icon;
                iconElement.style.cssText = `
                    color: ${savedTheme?.trim() === "light" ? "#af4c0f" : "#ff6600"};
                    display: flex;
                    align-items: center;
                    padding: 8px;
                    border-radius: 10px;
                    background: ${savedTheme?.trim() === "light" ? "rgba(175, 76, 15, 0.08)" : "rgba(255, 102, 0, 0.08)"};
                `;
                labelContainer.appendChild(iconElement);
            }

            const label = document.createElement("label");
            label.textContent = labelText;
            label.style.cssText = `
                font-size: 17px;
                font-weight: 600;
                color: ${savedTheme?.trim() === "light" ? "#2d3748" : "#f7fafc"};
                margin: 0;
                letter-spacing: -0.3px;
            `;
            labelContainer.appendChild(label);
            content.appendChild(labelContainer);
        }

        // Input elements container
        const inputContainer = document.createElement("div");
        inputContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 12px;
        `;

        if (Array.isArray(inputElements)) {
            inputElements.forEach(el => inputContainer.appendChild(el));
        } else {
            inputContainer.appendChild(inputElements);
        }
        content.appendChild(inputContainer);

        // Enhanced description with better parsing
        if (description.trim() !== "") {
            const desc = document.createElement("div");
            const lines = description.split('\n');
            let htmlContent = '';
            
            lines.forEach(line => {
                if (line.trim().startsWith('--')) {
                    const titleText = line.trim().substring(2);
                    htmlContent += `<div style="
                        font-weight: 700;
                        font-size: 12px;
                        color: ${savedTheme?.trim() === "light" ? "#af4c0f" : "#ff6600"};
                        margin-top: 12px;
                        margin-bottom: 6px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    "><span style="width: 3px; height: 3px; background: currentColor; border-radius: 50%;"></span>${titleText}</div>`;
                } else if (line.trim().startsWith('➕') || line.trim().startsWith('➖')) {
                    const icon = line.trim().startsWith('➕') ? '✓' : '✗';
                    const color = line.trim().startsWith('➕') ? '#22c55e' : '#ef4444';
                    const text = line.trim().substring(2);
                    htmlContent += `<div style="
                        display: flex;
                        align-items: flex-start;
                        gap: 8px;
                        margin: 4px 0;
                        font-size: 13px;
                        line-height: 1.5;
                    "><span style="
                        color: ${color};
                        font-weight: bold;
                        margin-top: 1px;
                        font-size: 11px;
                    ">${icon}</span><span style="color: ${savedTheme?.trim() === "light" ? "#4a5568" : "#a0aec0"};">${text}</span></div>`;
                } else if (line.trim() !== "") {
                    htmlContent += `<div style="
                        font-size: 13px;
                        color: ${savedTheme?.trim() === "light" ? "#718096" : "#a0aec0"};
                        line-height: 1.5;
                        margin: 2px 0;
                    ">${line}</div>`;
                }
            });
            
            desc.innerHTML = htmlContent;
            desc.style.cssText = `
                margin-top: 12px;
                padding: 16px 20px;
                background: ${savedTheme?.trim() === "light" ? "rgba(175, 76, 15, 0.03)" : "rgba(255, 102, 0, 0.03)"};
                border-radius: 12px;
                border-left: 4px solid ${savedTheme?.trim() === "light" ? "#af4c0f" : "#ff6600"};
            `;
            content.appendChild(desc);
        }

        group.appendChild(content);
        return group;
    }

    // Enhanced number input for fragments
    const concurrentFragmentsInput = document.createElement("input");
    concurrentFragmentsInput.type = "number";
    concurrentFragmentsInput.min = "1";
    concurrentFragmentsInput.max = "16";
    concurrentFragmentsInput.value = get_nb_fragment();
    concurrentFragmentsInput.style.cssText = `
        background: ${savedTheme?.trim() === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.05)"};
        border: 2px solid ${savedTheme?.trim() === "light" ? "rgba(175, 76, 15, 0.15)" : "rgba(255, 102, 0, 0.15)"};
        border-radius: 12px;
        padding: 16px 20px;
        color: ${savedTheme?.trim() === "light" ? "#2d3748" : "#f7fafc"};
        font-size: 16px;
        font-weight: 500;
        font-family: inherit;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        outline: none;
        width: 100%;
        box-sizing: border-box;
    `;

    // Enhanced focus effects
    concurrentFragmentsInput.addEventListener('focus', () => {
        concurrentFragmentsInput.style.border = `2px solid ${savedTheme?.trim() === "light" ? "#af4c0f" : "#ff6600"}`;
        concurrentFragmentsInput.style.boxShadow = `0 0 0 4px ${savedTheme?.trim() === "light" ? "#af4c0f" : "#ff6600"}33`;
        concurrentFragmentsInput.style.transform = 'scale(1.02)';
    });

    concurrentFragmentsInput.addEventListener('blur', () => {
        concurrentFragmentsInput.style.border = `2px solid ${savedTheme?.trim() === "light" ? "rgba(175, 76, 15, 0.15)" : "rgba(255, 102, 0, 0.15)"}`;
        concurrentFragmentsInput.style.boxShadow = 'none';
        concurrentFragmentsInput.style.transform = 'scale(1)';
    });

    // Enhanced modern checkbox function
    function createModernCheckbox(id: string, checked: boolean, label: string, description: string) {
        const container = document.createElement("div");
        container.style.cssText = `
            display: flex;
            align-items: flex-start;
            gap: 18px;
            cursor: pointer;
            padding: 16px;
            border-radius: 12px;
            transition: all 0.3s ease;
            background: ${savedTheme?.trim() === "light" ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.02)"};
            border: 1px solid ${savedTheme?.trim() === "light" ? "rgba(175, 76, 15, 0.06)" : "rgba(255, 102, 0, 0.06)"};
        `;

        container.addEventListener('mouseenter', () => {
            container.style.background = savedTheme?.trim() === "light" ? "rgba(175, 76, 15, 0.04)" : "rgba(255, 102, 0, 0.04)";
            container.style.transform = 'translateX(4px)';
        });

        container.addEventListener('mouseleave', () => {
            container.style.background = savedTheme?.trim() === "light" ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.02)";
            container.style.transform = 'translateX(0)';
        });

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = id;
        checkbox.checked = checked;
        checkbox.style.cssText = `
            appearance: none;
            width: 24px;
            height: 24px;
            border: 2px solid ${savedTheme?.trim() === "light" ? "#af4c0f" : "#ff6600"};
            border-radius: 8px;
            background: ${checked ? "linear-gradient(135deg, #f55e00ff, #ff9900ff)" : "transparent"};
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            flex-shrink: 0;
            margin-top: 2px;
        `;

        if (checked) {
            checkbox.innerHTML = `
                <svg style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 16px; height: 16px;" 
                    viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round">
                    <polyline points="20,6 9,17 4,12"/>
                </svg>
            `;
        }

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                checkbox.style.background = 'linear-gradient(135deg, #f55e00ff, #ff9900ff)';
                checkbox.style.transform = 'scale(1.15)';
                checkbox.innerHTML = `
                    <svg style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 16px; height: 16px;" 
                        viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round">
                        <polyline points="20,6 9,17 4,12"/>
                    </svg>
                `;
                setTimeout(() => {
                    checkbox.style.transform = 'scale(1)';
                }, 150);
            } else {
                checkbox.style.background = 'transparent';
                checkbox.style.transform = 'scale(0.95)';
                checkbox.innerHTML = '';
                setTimeout(() => {
                    checkbox.style.transform = 'scale(1)';
                }, 150);
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
            font-size: 16px;
            font-weight: 600;
            color: ${savedTheme?.trim() === "light" ? "#2d3748" : "#f7fafc"};
            cursor: pointer;
            display: block;
            margin-bottom: 6px;
            letter-spacing: -0.2px;
        `;

        const descElement = document.createElement("div");
        descElement.textContent = description;
        descElement.style.cssText = `
            font-size: 13px;
            color: ${savedTheme?.trim() === "light" ? "#718096" : "#a0aec0"};
            line-height: 1.5;
        `;

        textContainer.appendChild(labelElement);
        textContainer.appendChild(descElement);
        container.appendChild(checkbox);
        container.appendChild(textContainer);

        return { container, checkbox };
    }

    // Enhanced folder input
    const outputInput = document.createElement("input");
    outputInput.type = "text";
    outputInput.readOnly = true;
    outputInput.placeholder = get_StoredFolder() || "Click to select output folder";
    outputInput.style.cssText = `
        background: ${savedTheme?.trim() === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.05)"};
        border: 2px solid ${savedTheme?.trim() === "light" ? "rgba(175, 76, 15, 0.15)" : "rgba(255, 102, 0, 0.15)"};
        border-radius: 12px;
        padding: 16px 20px 16px 50px;
        color: ${savedTheme?.trim() === "light" ? "#2d3748" : "#f7fafc"};
        font-size: 14px;
        font-family: inherit;
        transition: all 0.3s ease;
        outline: none;
        width: 100%;
        box-sizing: border-box;
        cursor: pointer;
        position: relative;
    `;

    // Add folder icon
    const folderIcon = document.createElement("div");
    folderIcon.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
    `;
    folderIcon.style.cssText = `
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: ${savedTheme?.trim() === "light" ? "#af4c0f" : "#ff6600"};
        pointer-events: none;
        z-index: 1;
    `;

    const folderContainer = document.createElement("div");
    folderContainer.style.cssText = `
        position: relative;
        display: flex;
        align-items: center;
    `;
    folderContainer.appendChild(folderIcon);
    folderContainer.appendChild(outputInput);

    // Enhanced folder input interactions
    outputInput.addEventListener('focus', () => {
        outputInput.style.border = `2px solid ${savedTheme?.trim() === "light" ? "#af4c0f" : "#ff6600"}`;
        outputInput.style.boxShadow = `0 0 0 4px ${savedTheme?.trim() === "light" ? "#af4c0f" : "#ff6600"}33`;
    });

    outputInput.addEventListener('blur', () => {
        outputInput.style.border = `2px solid ${savedTheme?.trim() === "light" ? "rgba(175, 76, 15, 0.15)" : "rgba(255, 102, 0, 0.15)"}`;
        outputInput.style.boxShadow = 'none';
    });

    outputInput.addEventListener("click", async () => {
        try {
            const folder = await invoke<string | null>("select_output_folder");
            if (folder) {
                outputInput.placeholder = folder;
            }
        } catch (error) {
            console.error("Error selecting Downloads folder:", error);
        }
    });

    // Create checkbox components
    const noPartCheckbox = createModernCheckbox(
        "noPart",
        get_noPart() === "true",
        "--no-part",
        "Download directly without temporary .part files"
    );

    const ignoreErrorsCheckbox = createModernCheckbox(
        "ignoreErrors", 
        get_ignorError() === "true",
        "--ignore-errors",
        "Continue downloads even if some videos fail"
    );

    // Create all field groups with icons
    const fragmentsGroup = createFieldGroup(
        "Concurrent Fragments",
        concurrentFragmentsInput,
        `Number of fragments downloaded in parallel (1-16)
        --Performance Tips:
        4-8 fragments work best for most connections
        Higher values may increase speed but also CPU and memory usage
        Adjust based on your internet speed and system capabilities`,
        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`
    );

    const optionsGroup = createFieldGroup(
        "Download Options",
        [noPartCheckbox.container, ignoreErrorsCheckbox.container],
        `--no-part:
        ➕ Files are immediately usable during download
        ➕ Preserves all downloaded content if server interrupts
        ➖ Cannot resume download if interrupted on client side

        --ignore-errors:
        ➕ Downloads all available videos without stopping
        ➖ You might not notice missing videos in playlists`,
        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1"/></svg>`
    );

    const folderGroup = createFieldGroup(
        "Output Folder",
        folderContainer,
        "Choose where your downloaded files will be saved. Click the input field to browse and select a folder.",
        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`
    );

    // Add all groups to body
    body.appendChild(fragmentsGroup);
    body.appendChild(optionsGroup);
    body.appendChild(folderGroup);

    // Enhanced action buttons
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
        display: flex;
        gap: 16px;
        margin-top: 20px;
        padding-top: 24px;
        border-top: 1px solid ${savedTheme?.trim() === "light" ? "rgba(175, 76, 15, 0.1)" : "rgba(255, 102, 0, 0.1)"};
    `;

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.cssText = `
        flex: 1;
        padding: 16px 24px;
        border: 2px solid ${savedTheme?.trim() === "light" ? "rgba(175, 76, 15, 0.2)" : "rgba(255, 102, 0, 0.2)"};
        border-radius: 14px;
        background: transparent;
        color: ${savedTheme?.trim() === "light" ? "#af4c0f" : "#ff6600"};
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
        padding: 16px 28px;
        border: none;
        border-radius: 14px;
        background: linear-gradient(135deg, #f55e00ff 0%, #ff9900ff 100%);
        color: #ffffff;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 8px 25px rgba(245, 94, 0, 0.35);
        letter-spacing: -0.2px;
        position: relative;
        overflow: hidden;
    `;

    // Add subtle shine effect to apply button
    const shineEffect = document.createElement("div");
    shineEffect.style.cssText = `
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s ease;
    `;
    applyBtn.appendChild(shineEffect);

    // Enhanced button hover effects
    cancelBtn.addEventListener('mouseenter', () => {
        cancelBtn.style.background = savedTheme?.trim() === "light" ? "rgba(175, 76, 15, 0.05)" : "rgba(255, 102, 0, 0.05)";
        cancelBtn.style.transform = 'translateY(-2px)';
        cancelBtn.style.borderColor = savedTheme?.trim() === "light" ? "#af4c0f" : "#ff6600";
        cancelBtn.style.boxShadow = `0 6px 20px ${savedTheme?.trim() === "light" ? "rgba(175, 76, 15, 0.15)" : "rgba(255, 102, 0, 0.15)"}`;
    });

    cancelBtn.addEventListener('mouseleave', () => {
        cancelBtn.style.background = 'transparent';
        cancelBtn.style.transform = 'translateY(0)';
        cancelBtn.style.borderColor = savedTheme?.trim() === "light" ? "rgba(175, 76, 15, 0.2)" : "rgba(255, 102, 0, 0.2)";
        cancelBtn.style.boxShadow = 'none';
    });

    applyBtn.addEventListener('mouseenter', () => {
        applyBtn.style.transform = 'translateY(-3px) scale(1.02)';
        applyBtn.style.boxShadow = '0 12px 35px rgba(245, 94, 0, 0.5)';
        shineEffect.style.left = '100%';
    });

    applyBtn.addEventListener('mouseleave', () => {
        applyBtn.style.transform = 'translateY(0) scale(1)';
        applyBtn.style.boxShadow = '0 8px 25px rgba(245, 94, 0, 0.35)';
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

    // Modal removal function with enhanced animation
    function removeModal(): void {
        overlay.style.opacity = "0";
        modal.style.transform = "scale(0.85) translateY(50px)";
        
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

    // Enhanced apply settings handler
    applyBtn.addEventListener("click", async () => {
        // Validate inputs
        const fragmentValue = parseInt(concurrentFragmentsInput.value);
        if (fragmentValue < 1 || fragmentValue > 16) {
            concurrentFragmentsInput.style.border = '2px solid #ef4444';
            concurrentFragmentsInput.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.2)';
            concurrentFragmentsInput.focus();
            return;
        }

        // Disable button during processing
        applyBtn.style.pointerEvents = 'none';
        applyBtn.style.opacity = '0.8';

        // Show loading state
        const originalText = applyBtn.textContent;
        applyBtn.innerHTML = `
            <svg style="display: inline-block; margin-right: 8px; animation: spin 1s linear infinite;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            Applying...
        `;

        // Add spin animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        try {
            // Save settings
            set_StoredFolder(outputInput.placeholder);
            set_nb_fragment(concurrentFragmentsInput.value);
            set_noPart(noPartCheckbox.checkbox.checked);
            set_ignorError(ignoreErrorsCheckbox.checkbox.checked);

            // Optional: Call Tauri function if needed
            // await invoke("apply_download_settings", { ... });

            // Show success state
            setTimeout(() => {
                applyBtn.innerHTML = `
                    <svg style="display: inline-block; margin-right: 8px;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                        <polyline points="20,6 9,17 4,12"/>
                    </svg>
                    Settings Applied!
                `;
                applyBtn.style.background = "linear-gradient(135deg, #22c55e, #16a34a)";
                applyBtn.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.4)';

                setTimeout(() => {
                    removeModal();
                }, 1200);
            }, 800);

        } catch (error) {
            console.error("Error applying settings:", error);
            
            // Show error state
            applyBtn.innerHTML = `
                <svg style="display: inline-block; margin-right: 8px;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                Error occurred
            `;
            applyBtn.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";
            applyBtn.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';

            setTimeout(() => {
                applyBtn.textContent = originalText;
                applyBtn.style.background = "linear-gradient(135deg, #f55e00ff 0%, #ff9900ff 100%)";
                applyBtn.style.boxShadow = '0 8px 25px rgba(245, 94, 0, 0.35)';
                applyBtn.style.pointerEvents = 'auto';
                applyBtn.style.opacity = '1';
            }, 2000);
        }
    });
}