import { listen } from '@tauri-apps/api/event';

// ==================== INTERFACES ====================

interface ProgressData {
    url: string;
    progress: number;
    speed: string;
    eta: string;
    downloaded_bytes: number;
    total_bytes: number;
    video_name: string;
}

interface CompletionPayload {
    url: string;
    status: string;
    video_name: string;
    final_path?: string;
    error_message?: string;
}

interface MultiDownloadCompletePayload {
    download_id: string;
    status: string;
    completed: number;
    total: number;
    error?: number;
}

interface DownloadItem {
    id: string;
    url: string;
    video_name: string;
    progress: number;
    speed: string;
    eta: string;
    downloaded_bytes: number;
    total_bytes: number;
    status: 'downloading' | 'completed' | 'error' | 'queued';
    // whether this download has already been counted in the global total
    counted?: boolean;
}

interface Position {
    x: number;
    y: number;
}

// ==================== UTILITAIRES ====================

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatETA(eta: string): string {
    return eta === 'NA' ? 'Calcul...' : eta;
}

function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

// ==================== STYLES ====================

function getStatusText(status: DownloadItem['status']): string {
    const statusMap = {
        downloading: '📥',
        completed: '✅',
        error: '❌',
        queued: '⏳'
    };
    return statusMap[status] || '';
}

function getStatusColor(status: DownloadItem['status'], isDark: boolean): string {
    const colorMap = {
        downloading: '#ff4000',
        completed: isDark ? '#4ade80' : '#16a34a',
        error: isDark ? '#f87171' : '#dc2626',
        queued: isDark ? '#94a3b8' : '#64748b'
    };
    return colorMap[status] || (isDark ? '#999' : '#666');
}

function getProgressColor(status: DownloadItem['status'], isDark: boolean): string {
    const colorMap = {
        downloading: 'linear-gradient(90deg, #ff4000, #ff8000)',
        completed: isDark ? '#4ade80' : '#16a34a',
        error: isDark ? '#f87171' : '#dc2626',
        queued: isDark ? '#94a3b8' : '#64748b'
    };
    return colorMap[status] || (isDark ? '#999' : '#666');
}

// ==================== FONCTION PRINCIPALE ====================

export function createDownloadProgressBar() {
    const THEME = document.documentElement.getAttribute("data-theme");
    const savedTheme = THEME === "dark" ? localStorage.getItem("theme"):THEME;
    const isDark = savedTheme?.trim() !== "light";

    // No persistent global total: we only use session counters and optional expectedTotal
    const savedGlobalTotal = (() => {
        try {
            const v = window.localStorage.getItem('totalDWL');
            return v ? parseInt(v, 10) || 0 : 0;
        } catch (e) {
            return 0;
        }
    })();

    const state = {
        downloads: new Map<string, DownloadItem>(),
        currentDownloadId: null as string | null,
        isExpanded: false,
        isMinimized: false,
        isDragging: false,
        dragOffsetX: 0,
        dragOffsetY: 0,
        lastX: 0,
        lastY: 0,
        velocityX: 0,
        velocityY: 0,
        animationFrame: null as number | null,
        unnamedCounter: 0,
        expectedTotal: 0, 
        totalDWL: savedGlobalTotal,
    };

    // ========== CRÉATION DU CONTAINER ===========
    const container = createContainer(isDark);
    const { header, mainProgressFill, progressText, mainTitle, downloadList, expandBtn, closeBtn, minimizeBtn, minimizedBar } = 
        createUIElements(container, isDark);

    // ========== FONCTIONS DE MISE À JOUR ===========

    const updateOverallProgress = () => {
        const total = state.downloads.size;
        const completed = Array.from(state.downloads.values())
            .filter(d => d.status === 'completed' || d.status === 'error').length;
        
        const progress = total > 0 ? (completed / total) * 100 : 0;
        mainProgressFill.style.width = `${progress}%`;
        
        if (total === 0) {
            progressText.textContent = 'No downloads';
            progressText.style.color = isDark ? "#ffffff" : "#1a1a1a";
            mainTitle.textContent = 'Waiting...';
            mainTitle.style.color = isDark ? "#ffffff" : "#1a1a1a";
            // update minimized box: spinner hidden, counter 0/0
            const spinnerEl = container.querySelector('.mini-spinner') as HTMLElement | null;
            const counterEl = container.querySelector('.mini-counter') as HTMLElement | null;
            if (spinnerEl) spinnerEl.style.display = 'none';
            if (counterEl) counterEl.textContent = '0/0';
        } else {
            progressText.textContent = `${completed}/${total} completed`;
            
             const downloadingCount = Array.from(state.downloads.values())
            .filter(d => d.status === 'downloading').length;
            const queuedCount = Array.from(state.downloads.values())
                .filter(d => d.status === 'queued').length;

            if (downloadingCount > 0) {
                mainTitle.textContent = `Downloading...`;
                mainTitle.style.color = isDark ? "#ffffff" : "#1a1a1a";
            } else if (queuedCount > 0) {
                mainTitle.textContent = `${queuedCount} waiting`;
                mainTitle.style.color = isDark ? "#94a3b8" : "#64748b";
            }

            // Mettre à jour le nom du fichier
        const fileNameEl = container.querySelector('.itemHeader');
    const currentDownload = Array.from(state.downloads.values()).find(d => d.status === 'downloading');
    if (fileNameEl) fileNameEl.textContent = currentDownload ? currentDownload.video_name : 'Waiting...';
    const counterElA = container.querySelector('.mini-counter') as HTMLElement | null;
    const spinnerElA = container.querySelector('.mini-spinner') as HTMLElement | null;
    const completedA = Array.from(state.downloads.values()).filter(d => d.status === 'completed').length;
    const totalA = state.downloads.size;
    if (counterElA) counterElA.textContent = `${completedA}/${totalA}`;
    if (spinnerElA) spinnerElA.style.display = Array.from(state.downloads.values()).some(d => d.status === 'downloading') ? 'block' : 'none';

            // Update minimized box: counter shows completed/total
            const counterEl2 = container.querySelector('.mini-counter') as HTMLElement | null;
            const downloading = Array.from(state.downloads.values()).some(d => d.status === 'downloading');
            const anyError = Array.from(state.downloads.values()).some(d => d.status === 'error');
            if (counterEl2) counterEl2.textContent = `${completed}/${total}`;

            // Priority: any error -> show error X immediately. Otherwise if downloading -> spinner. If all completed -> success. Else hide.
            if (anyError) {
                setMinimizedState(container, 'error', isDark);
            } else if (downloading) {
                setMinimizedState(container, 'spinner', isDark);
            } else if (completed === total && total > 0) {
                setMinimizedState(container, 'success', isDark);
            } else {
                setMinimizedState(container, 'hidden', isDark);
            }

        }
    };

    const updateDownloadList = () => {
        downloadList.innerHTML = '';
        const sortedDownloads = Array.from(state.downloads.values()).sort((a, b) => {
            const priority = { downloading: 0, queued: 1, completed: 2, error: 3 };
            return priority[a.status] - priority[b.status];
        });

        sortedDownloads.forEach(download => {
            downloadList.appendChild(createDownloadItem(download, isDark));
        });
    };

    // ========== LISTENERS D'ÉVÉNEMENTS ===========

    // 1. Progression du téléchargement
    listen<ProgressData>('download-progress', (event) => {
        const payload = event.payload;
        const id = `download-${hashCode(payload.url)}`;

        // Ensure we have a sensible name (fallback to "Video N")
        let name = payload.video_name && payload.video_name.trim().length > 0 ? payload.video_name.trim() : '';

        if (!state.downloads.has(id)) {
            // Only create a new fallback name when a new download item is created
            if (!name) {
                state.unnamedCounter += 1;
                if (state.expectedTotal && state.expectedTotal > 0) {
                    name = `Video ${state.unnamedCounter}/${state.expectedTotal}`;
                } else {
                    name = `Video ${state.unnamedCounter}`;
                }
            }
            state.downloads.set(id, {
                id,
                url: payload.url,
                video_name: name,
                progress: 0,
                speed: 'N/A',
                eta: 'N/A',
                downloaded_bytes: 0,
                total_bytes: 0,
                status: 'downloading',
                counted: false,
            });
        }

        const item = state.downloads.get(id)!;
        item.progress = payload.progress;
        item.speed = payload.speed;
        item.eta = payload.eta;
        item.downloaded_bytes = payload.downloaded_bytes;
        item.total_bytes = payload.total_bytes;
        item.status = 'downloading';
        // Update name only when non-empty to preserve fallback
        if (payload.video_name && payload.video_name.trim().length > 0) {
            item.video_name = payload.video_name.trim();
        }

        show();
        // New download started: show spinner in minimized bar
        setMinimizedState(container, 'spinner', isDark);
        updateOverallProgress();
        updateDownloadList();
    });

    // 2. Complétion d'un téléchargement individuel
    listen<CompletionPayload>('download-complete-single', (event) => {
        const payload = event.payload;
        const id = `download-${hashCode(payload.url)}`;
        
        console.log('📦 Single download complete:', payload);
        
        if (state.downloads.has(id)) {
            const download = state.downloads.get(id)!;
            
            // Mapper les statuts Rust vers nos statuts
            const statusMap: Record<string, DownloadItem['status']> = {
                'success': 'completed',
                'error': 'error',
                'server_error': 'error',
                'not_found': 'error',
                'connection_error': 'error',
                'already_downloaded': 'completed'
            };
            
            download.status = statusMap[payload.status] || 'error';
            download.progress = download.status === 'completed' ? 100 : download.progress;
            // If completion payload gives a non-empty name, update it
            if (payload.video_name && payload.video_name.trim().length > 0) {
                download.video_name = payload.video_name.trim();
            }
            
            

            const successCount = Array.from(state.downloads.values())
            .filter(d => d.status === 'completed').length;
            const errorCount = Array.from(state.downloads.values())
                .filter(d => d.status === 'error').length;
            
            // Mise à jour du texte selon les résultats
            if (errorCount === 0) {
                progressText.textContent = `✅ ${successCount}/${state.downloads.size} succeeded`;
                //progressText.style.color = isDark ? "#4ade80" : "#16a34a";
                mainTitle.textContent = "All downloads completed!";
                //mainTitle.style.color = isDark ? "#4ade80" : "#16a34a";
            } else if (successCount === 0) {
                progressText.textContent = `❌ ${errorCount}/${state.downloads.size} failed`;
                progressText.style.color = isDark ? "#f87171" : "#dc2626";
                mainTitle.textContent = "Downloads failed";
                //mainTitle.style.color = isDark ? "#f87171" : "#dc2626";
            } else {
                progressText.textContent = `⚠️ ${successCount} succeeded, ${errorCount} failed`;
                progressText.style.color = isDark ? "#fbbf24" : "#f59e0b";
                mainTitle.textContent = "Downloads completed with errors";
                //mainTitle.style.color = isDark ? "#fbbf24" : "#f59e0b";
            }

            // update minimized box: counter and show appropriate badge/spinner
            const counterEl = container.querySelector('.mini-counter') as HTMLElement | null;
            const completedNow = Array.from(state.downloads.values()).filter(d => d.status === 'completed').length;
            const totalNow = state.downloads.size;
            if (counterEl) counterEl.textContent = `${completedNow}/${totalNow}`;
            const allDone = Array.from(state.downloads.values()).every(d => d.status === 'completed' || d.status === 'error');
            const anyErrorNow = Array.from(state.downloads.values()).some(d => d.status === 'error');
            const downloadingNow = Array.from(state.downloads.values()).some(d => d.status === 'downloading');

            // If any error occurs, show error immediately. When all done, show success if no errors.
            if (anyErrorNow) {
                setMinimizedState(container, 'error', isDark);
            } else if (downloadingNow) {
                setMinimizedState(container, 'spinner', isDark);
            } else if (allDone) {
                setMinimizedState(container, 'success', isDark);
            } else {
                setMinimizedState(container, 'hidden', isDark);
            }

            // If success and not yet counted, mark as counted (no global persistence)
            if (download.status === 'completed' && !download.counted) {
                download.counted = true;
                try {
                    // increment persisted total and save
                    state.totalDWL = (Number(state.totalDWL) || 0) + 1;
                    window.localStorage.setItem('totalDWL', String(state.totalDWL));
                } catch (e) {
                    console.warn('Could not persist totalDWL', e);
                }
            }
        }
        
        updateOverallProgress();
        updateDownloadList();
    });

    // 3. Complétion de tous les téléchargements (multi)
    listen<MultiDownloadCompletePayload>('download-complete', (event) => {
        const payload = event.payload;
        console.log('🎉 All downloads complete:', payload);
        
        const successCount = Array.from(state.downloads.values())
            .filter(d => d.status === 'completed').length;
        const errorCount = Array.from(state.downloads.values())
            .filter(d => d.status === 'error').length;
        
        // Mise à jour du texte selon les résultats
        if (errorCount === 0) {
            progressText.textContent = `✅ ${successCount}/${state.downloads.size} succeeded`;
            //progressText.style.color = isDark ? "#4ade80" : "#16a34a";
            mainTitle.textContent = "All downloads completed!";
            //mainTitle.style.color = isDark ? "#4ade80" : "#16a34a";
        } else if (successCount === 0) {
            progressText.textContent = `❌ ${errorCount}/${state.downloads.size} failed`;
            progressText.style.color = isDark ? "#f87171" : "#dc2626";
            mainTitle.textContent = "Downloads failed";
            //mainTitle.style.color = isDark ? "#f87171" : "#dc2626";
        } else {
            progressText.textContent = `⚠️ ${successCount} succeeded, ${errorCount} failed`;
            progressText.style.color = isDark ? "#fbbf24" : "#f59e0b";
            mainTitle.textContent = "Downloads completed with errors";
            //mainTitle.style.color = isDark ? "#fbbf24" : "#f59e0b";
        }
        
        mainProgressFill.style.width = '100%';
        // update minimized box: final counter and show badge (success or error)
        const counterEl2 = container.querySelector('.mini-counter') as HTMLElement | null;
        const completed2 = Array.from(state.downloads.values()).filter(d => d.status === 'completed').length;
        const total2 = state.downloads.size;
        if (counterEl2) counterEl2.textContent = `${completed2}/${total2}`;
        const anyError = Array.from(state.downloads.values()).some(d => d.status === 'error');
        if (anyError) setMinimizedState(container, 'error', isDark);
        else setMinimizedState(container, 'success', isDark);
        updateDownloadList();
        
        // Auto-fermeture après 8 secondes si tout est terminé
        setTimeout(() => {
            const allDone = Array.from(state.downloads.values())
                .every(d => d.status === 'completed' || d.status === 'error');
            if (allDone) {
                console.log('Auto-closing progress bar');
                // Décommenter pour activer la fermeture automatique
                // hide();
            }
        }, 8000);
    });

    // ========== GESTION DES INTERACTIONS ===========

    expandBtn.addEventListener('click', (e: MouseEvent) => {
        e.stopPropagation();
        state.isExpanded = !state.isExpanded;
        
        downloadList.style.maxHeight = state.isExpanded ? '400px' : '0';
        expandBtn.style.transform = state.isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
    });

    // Minimize to a small bar
    minimizeBtn.addEventListener('click', (e: MouseEvent) => {
        e.stopPropagation();
        state.isMinimized = true;
        // hide the detailed header/list and show minimized bar
        header.style.display = 'none';
        downloadList.style.display = 'none';
        minimizedBar.style.display = 'flex';
        // ensure container keeps same position/size behavior
        container.style.width = '260px';
        container.style.borderRadius = '12px';
    });

    // Double-clicking minimized bar restores full UI
    minimizedBar.addEventListener('dblclick', (e: MouseEvent) => {
        e.stopPropagation();
        state.isMinimized = false;
        header.style.display = '';
        downloadList.style.display = '';
        minimizedBar.style.display = 'none';
        container.style.width = '420px';
        // keep expanded state as before
        ensureInViewport();
    });

    closeBtn.addEventListener('click', (e: MouseEvent) => {
        e.stopPropagation();
        hide();
    });

    // Styles au survol
    [expandBtn, minimizeBtn, closeBtn].forEach((btn: HTMLElement) => {
        const THEME = document.documentElement.getAttribute("data-theme");
        const savedTheme = THEME === "dark" ? localStorage.getItem("theme"):THEME;
        const isDark = savedTheme?.trim() !== "light";

        btn.onmouseenter = () => {
            btn.style.background = isDark ? "rgba(255, 64, 0, 0.15)" : "rgba(255, 64, 0, 0.1)";
            btn.style.color = "#ff4000";
            btn.style.transform = btn === expandBtn && state.isExpanded ? 
                'rotate(180deg) scale(1.1)' : 'scale(1.1)';
        };
        
        btn.onmouseleave = () => {
            const THEME = document.documentElement.getAttribute("data-theme");
            const savedTheme = THEME === "dark" ? localStorage.getItem("theme"):THEME;
            const isDark = savedTheme?.trim() !== "light";
            
            btn.style.background = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)";
            btn.style.color = isDark ? "#999" : "#666";
            btn.style.transform = btn === expandBtn && state.isExpanded ? 
                'rotate(180deg)' : 'scale(1)';
        };
    });

    // ========== DRAG & DROP ===========
    const _cleanupDrag = setupDragAndDrop(container, [header, minimizedBar], state, isDark);

    // ========== FONCTIONS SHOW/HIDE ===========

    const show = () => {
        container.style.display = 'block';
        restorePosition();
        
        // Réinitialiser le badge et afficher le spinner pour un nouveau téléchargement
    // show spinner when showing UI (assume new or ongoing downloads)
    setMinimizedState(container, 'spinner', isDark);
        
        // ensure it's visible after layout settles
        setTimeout(() => {
            container.style.opacity = '1';
            container.style.transform = 'translateY(0) scale(1)';
            // if minimized, show compact bar instead
            if (state.isMinimized) {
                const headerEl = container.querySelector('.header-dwl-barre') as HTMLElement | null;
                const downloadListEl = container.querySelector('.download-list') as HTMLElement | null;
                const minimizedEl = container.querySelector('.minimized-bar') as HTMLElement | null;
                if (headerEl) headerEl.style.display = 'none';
                if (downloadListEl) downloadListEl.style.display = 'none';
                if (minimizedEl) minimizedEl.style.display = 'flex';
            }
            ensureInViewport();
        }, 10);
    };

    const hide = () => {
        container.style.opacity = '0';
        container.style.transform = 'translateY(30px) scale(0.95)';
        setTimeout(() => {
            container.style.display = 'none';
            state.downloads.clear();
            // also reset minimized state
            state.isMinimized = false;
            updateOverallProgress();
        }, 400);
    };

    const resetPosition = () => {
        container.style.left = 'auto';
        container.style.top = 'auto';
        container.style.right = '20px';
        container.style.bottom = '20px';
        container.style.transform = 'translateY(0) scale(1)';
        container.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        window.localStorage.removeItem('progressBarPosition');
    };

    const restorePosition = () => {
        const saved = window.localStorage.getItem('progressBarPosition');
        if (saved) {
            try {
                const position = JSON.parse(saved);
                const constrained = constrainToViewport(position.x, position.y, container);
                container.style.left = `${constrained.x}px`;
                container.style.top = `${constrained.y}px`;
                container.style.right = 'auto';
                container.style.bottom = 'auto';
                container.style.transform = 'none';
            } catch (e) {
                console.warn('Failed to restore progress bar position:', e);
            }
        }
    };

    // Ensure the container stays inside the viewport. Useful after fullscreen toggles or window resize.
    function ensureInViewport() {
        try {
            const rect = container.getBoundingClientRect();
            const margin = 10;
            const maxX = window.innerWidth - rect.width - margin;
            const maxY = window.innerHeight - rect.height - margin;

            let left = rect.left;
            let top = rect.top;

            // If container was positioned using right/bottom or autos, try to read saved position
            if (isNaN(left) || isNaN(top)) {
                const saved = window.localStorage.getItem('progressBarPosition');
                if (saved) {
                    const position = JSON.parse(saved);
                    left = position.x || left;
                    top = position.y || top;
                }
            }

            const constrainedX = Math.max(margin, Math.min(left, maxX));
            const constrainedY = Math.max(margin, Math.min(top, maxY));

            // Apply constrained values only if they differ to avoid unnecessary style changes
            if (rect.left !== constrainedX || rect.top !== constrainedY) {
                container.style.left = `${constrainedX}px`;
                container.style.top = `${constrainedY}px`;
                container.style.right = 'auto';
                container.style.bottom = 'auto';
                // Save new position
                savePosition(container);
            }
        } catch (e) {
            console.warn('ensureInViewport error', e);
        }
    }

    // Re-apply constraint on window resize and orientation change
    const _resizeHandler = () => {
        // Delay slightly to allow layout to settle (e.g., after exiting fullscreen)
        setTimeout(ensureInViewport, 80);
    };
    window.addEventListener('resize', _resizeHandler);
    window.addEventListener('orientationchange', _resizeHandler as any);

    // Expose a destroy method to remove listeners and cleanup drag handlers
    (container as any).destroy = () => {
        try {
            window.removeEventListener('resize', _resizeHandler);
            window.removeEventListener('orientationchange', _resizeHandler as any);
        } catch (e) {
            console.warn('Error removing window listeners', e);
        }
        try {
            if (typeof _cleanupDrag === 'function') {
                _cleanupDrag();
            }
        } catch (e) {
            console.warn('Error cleaning up drag listeners', e);
        }
    };

    // ========== MISE À JOUR DU THÈME ===========
    window.addEventListener('storage', (e) => {
        if (e.key === 'theme') {
            updateTheme(container, mainTitle, progressText, expandBtn, closeBtn, isDark);
            updateDownloadList();
        }
    });

    document.body.appendChild(container);
    
    // Méthode pour réinitialiser complètement l'état pour un nouveau téléchargement
    const reset = () => {
        // Vider la liste des téléchargements
        state.downloads.clear();
        state.unnamedCounter = 0;
        state.expectedTotal = 0;
        
        // Réinitialiser les éléments visuels
        mainProgressFill.style.width = '0%';
        progressText.textContent = 'No downloads';
        progressText.style.color = isDark ? "#ffffff" : "#1a1a1a";
        mainTitle.textContent = 'Waiting...';
        mainTitle.style.color = isDark ? "#ffffff" : "#1a1a1a";
        
    // Réinitialiser le spinner et le badge
    setMinimizedState(container, 'spinner', isDark);
    const counterEl = container.querySelector('.mini-counter') as HTMLElement | null;
    if (counterEl) counterEl.textContent = '0/0';
        
        // Vider la liste des téléchargements
        downloadList.innerHTML = '';
        
        console.log('🔄 Progress bar reset for new download session');
    };

    // Exposer les méthodes publiques
    (container as any).show = show;
    (container as any).hide = hide;
    (container as any).reset = reset;
    (container as any).resetPosition = resetPosition;
    // Allow caller to set expected total videos so fallback names show X/Y
    (container as any).setExpectedTotal = (n: number) => {
        state.expectedTotal = Math.max(0, Math.floor(n) || 0);
    };

    // Expose persisted total downloads
    (container as any).getTotalDWL = () => {
        return Number(state.totalDWL || 0);
    };

    console.log('✅ Download progress bar created and listeners attached');
    return container;
}

// ==================== FONCTIONS DE CRÉATION UI ====================

function createContainer(isDark: boolean): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'download-progress-container';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        width: 420px;
        background: ${isDark 
            ? "linear-gradient(135deg, rgba(26, 26, 26, 0.98) 0%, rgba(35, 35, 35, 0.98) 100%)" 
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 250, 250, 0.98) 100%)"};
        backdrop-filter: blur(16px);
        border: 1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"};
        border-radius: 16px;
        box-shadow: ${isDark 
            ? "0 12px 40px rgba(0, 0, 0, 0.6)" 
            : "0 12px 40px rgba(0, 0, 0, 0.15)"};
        z-index: 10000;
        display: none;
        opacity: 0;
        transform: translateY(30px) scale(0.95);
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        cursor: grab;
        user-select: none;
        overflow: hidden;
    `;
    return container;
}

function createUIElements(container: HTMLDivElement, isDark: boolean) {
    const header = document.createElement('div');
    header.classList.add("header-dwl-barre")
    header.style.cssText = `
        padding: 18px;
        border-bottom: 1px solid ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"};
        cursor: grab;
    `;

    const headerContent = document.createElement('div');
    headerContent.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    `;

    // Titre et icône
    const titleSection = document.createElement('div');
    titleSection.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;
    `;

    const downloadIcon = document.createElement('div');
    downloadIcon.classList.add('downloadIcon');
    downloadIcon.innerHTML = `
        <svg stroke="currentColor" width="800" height="800" viewBox="0 0 24 24"
            fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 16.158 15.859 L 16.166 15.859 M 16.49 13.584 L 16.989 13.584 C 17.764 13.584 18.152 13.584 18.458 13.699 C 18.865 13.853 19.189 14.149 19.358 14.52 C 19.484 14.799 19.484 15.152 19.484 15.859 C 19.484 16.565 19.484 16.918 19.358 17.197 C 19.189 17.568 18.865 17.864 18.458 18.018 C 18.152 18.133 17.764 18.133 16.989 18.133 L 7.01 18.133 C 6.235 18.133 5.847 18.133 5.542 18.018 C 5.134 17.864 4.81 17.568 4.642 17.197 C 4.515 16.918 4.515 16.565 4.515 15.859 C 4.515 15.152 4.515 14.799 4.642 14.52 C 4.81 14.149 5.134 13.853 5.542 13.699 C 5.847 13.584 6.235 13.584 7.01 13.584 L 7.509 13.584 M 12 14.342 L 12 6.003 M 12 14.342 L 9.505 12.068 M 12 14.342 L 14.495 12.068"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;

    Object.assign(downloadIcon.style, {
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg,#ff4000,#ff8000)',
        borderRadius: '10px',
        fontSize: '18px',
        flexShrink: 0,
        color: `${isDark ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 0, 1)"}`   // <- couleur héritée par l’icône
    });

    const titleInfo = document.createElement('div');
    titleInfo.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        min-width: 0;
    `;

    const mainTitle = document.createElement('div');
    mainTitle.className = 'main-title';
    mainTitle.textContent = 'Waiting...';
    mainTitle.style.cssText = `
        color: ${isDark ? "#ffffff" : "#1a1a1a"};
        font-size: 16px;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    `;

    const progressText = document.createElement('div');
    progressText.className = 'progress-text';
    progressText.textContent = 'No downloads';
    progressText.style.cssText = `
        color: ${isDark ? "#999" : "#666"};
        font-size: 12px;
        font-weight: 500;
    `;

    titleInfo.appendChild(mainTitle);
    titleInfo.appendChild(progressText);
    titleSection.appendChild(downloadIcon);
    titleSection.appendChild(titleInfo);

    // Boutons de contrôle
    const controls = document.createElement('div');
    controls.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
    `;

    const expandBtn = document.createElement('button');
    expandBtn.classList.add("flecheBas")
    expandBtn.innerHTML = '▼';
    expandBtn.style.cssText = `
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)"};
        border: none;
        border-radius: 8px;
        color: ${isDark ? "#999" : "#666"};
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.classList.add("closeBtn-barre-dwl")
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)"};
        border: none;
        border-radius: 8px;
        color: ${isDark ? "#999" : "#666"};
        font-size: 20px;
        cursor: pointer;
        transition: all 0.2s ease;
    `;

    controls.appendChild(expandBtn);
    // Minimize button
    const minimizeBtn = document.createElement('button');
    minimizeBtn.classList.add('minimizeBtn-barre-dwl');
    minimizeBtn.innerHTML = '▁';
    minimizeBtn.style.cssText = `
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)"};
        border: none;
        border-radius: 8px;
        color: ${isDark ? "#999" : "#666"};
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
    `;
    controls.appendChild(minimizeBtn);
    controls.appendChild(closeBtn);
    headerContent.appendChild(titleSection);
    headerContent.appendChild(controls);

    // Barre de progression
    const mainProgressBar = document.createElement('div');
    mainProgressBar.classList.add("mainProgressBar-Dwl")
    mainProgressBar.style.cssText = `
        width: 100%;
        height: 6px;
        background: ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"};
        border-radius: 3px;
        overflow: hidden;
        margin-top: 8px;
    `;

    const mainProgressFill = document.createElement('div');
    mainProgressFill.style.cssText = `
        width: 0%;
        height: 100%;
        background: linear-gradient(90deg, #ff4000, #ff8000);
        transition: width 0.3s ease;
        border-radius: 3px;
    `;

    mainProgressBar.appendChild(mainProgressFill);
    header.appendChild(headerContent);
    header.appendChild(mainProgressBar);

    // Liste des téléchargements
    const downloadList = document.createElement('div');
    downloadList.className = 'download-list';
    downloadList.style.cssText = `
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        background: ${isDark ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.02)"};
    `;

    container.appendChild(header);
    container.appendChild(downloadList);

    // Minimized compact bar (hidden by default) - improved styling
    const minimizedBar = document.createElement('div');
    minimizedBar.setAttribute("title","Double-click to restor")
    minimizedBar.classList.add('minimized-bar');
    minimizedBar.style.cssText = `
        display: none;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        height: 52px;
        background: ${isDark
            ? 'linear-gradient(90deg, rgba(36,36,36,0.95), rgba(24,24,24,0.95))'
            : 'linear-gradient(90deg, rgba(255,255,255,0.98), rgba(248,248,248,0.98))'};
        border: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'};
        border-radius: 12px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.12);
        cursor: grab;
        user-select: none;
        overflow: hidden;
    `;

    // Modern compact box: spinner + counter (downloaded/total)
    const box = document.createElement('div');
    box.style.cssText = `display:flex; align-items:center; gap:12px; padding:6px 10px; width:100%;`;

    // spinner
    const spinner = document.createElement('div');
    spinner.classList.add('mini-spinner');
    spinner.style.cssText = `
        width:20px; height:20px; border-radius:50%;
        border:3px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'};
        border-top-color: ${isDark ? '#ffb56b' : '#ff6a00'};
        animation: spin 1s linear infinite;
        flex:0 0 auto;
    `;

    // completed badge (hidden by default) - modern check circle
    const badge = document.createElement('div');
    badge.classList.add('mini-badge');
    badge.style.cssText = `
        width:28px; height:28px; border-radius:8px; display:none; align-items:center; justify-content:center;
        background: ${isDark ? 'linear-gradient(135deg,#064e3b,#065f46)' : 'linear-gradient(135deg,#e6fffa,#ecfccb)'};
        color: ${isDark ? '#bbf7d0' : '#065f46'}; flex:0 0 auto;
        border:  ${isDark ? '1px solid #bbf7d0' : '1px solid #065f46 '}
    `;
    badge.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;

    // counter (success/total)
    const counter = document.createElement('div');
    counter.classList.add('mini-counter');
    counter.textContent = '0/0';
    counter.style.cssText = `font-weight:700; color: ${isDark ? '#fff' : '#111'}; font-size:13px;`;

    // small label
    const label = document.createElement('div');
    label.classList.add('mini-label');
    label.textContent = 'downloads';
    label.style.cssText = `font-size:11px; color: ${isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.6)'};`;

    const rightWrap = document.createElement('div');
    rightWrap.style.cssText = 'margin-left:auto; display:flex; flex-direction:column; align-items:flex-end; gap:2px;';
    rightWrap.appendChild(counter);
    rightWrap.appendChild(label);

    box.appendChild(spinner);
    box.appendChild(badge);
    box.appendChild(rightWrap);
    minimizedBar.appendChild(box);

    // spinner keyframes (inlined using style tag fallback)
    const styleTag = document.createElement('style');
    styleTag.textContent = `@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`;
    minimizedBar.appendChild(styleTag);
    container.appendChild(minimizedBar);

    return { header, mainProgressFill, progressText, mainTitle, downloadList, expandBtn, closeBtn, minimizeBtn, minimizedBar };
}

// Helper to control minimized bar state: 'spinner' | 'success' | 'error' | 'hidden'
function setMinimizedState(container: HTMLElement, state: 'spinner' | 'success' | 'error' | 'hidden', isDark: boolean) {
    const spinnerEl = container.querySelector('.mini-spinner') as HTMLElement | null;
    const badgeEl = container.querySelector('.mini-badge') as HTMLElement | null;
    const counterEl = container.querySelector('.mini-counter') as HTMLElement | null;

    if (!spinnerEl || !badgeEl) return;

    switch (state) {
        case 'spinner':
            spinnerEl.style.display = 'block';
            badgeEl.style.display = 'none';
            // reset badge colors just in case
            badgeEl.style.background = isDark ? 'linear-gradient(135deg,#064e3b,#065f46)' : 'linear-gradient(135deg,#e6fffa,#ecfccb)';
            badgeEl.style.color = isDark ? '#bbf7d0' : '#065f46';
            badgeEl.style.border = isDark ? '1px solid #bbf7d0' : '1px solid #065f46';
            break;
        case 'success':
            spinnerEl.style.display = 'none';
            badgeEl.style.display = 'flex';
            // success coloring
            badgeEl.style.background = isDark ? 'linear-gradient(135deg,#064e3b,#065f46)' : 'linear-gradient(135deg,#e6fffa,#ecfccb)';
            badgeEl.style.color = isDark ? '#bbf7d0' : '#065f46';
            badgeEl.style.border = isDark ? '1px solid #bbf7d0' : '1px solid #065f46';
            // set check icon
            badgeEl.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            break;
        case 'error':
            spinnerEl.style.display = 'none';
            badgeEl.style.display = 'flex';
            // error coloring and X icon
            badgeEl.style.background = isDark ? 'linear-gradient(135deg,#4c0519,#7f1d1d)' : 'linear-gradient(135deg,#fff1f2,#fee2e2)';
            badgeEl.style.color = isDark ? '#fecaca' : '#991b1b';
            badgeEl.style.border = isDark ? '1px solid #fecaca' : '1px solid #991b1b';
            // replace inner SVG with an X if not already
            badgeEl.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            break;
    case 'hidden':
        default:
            spinnerEl.style.display = 'none';
            badgeEl.style.display = 'none';
            break;
    }

    // keep counter untouched
    if (counterEl && counterEl.textContent == null) counterEl.textContent = '0/0';
    // expose current mini state to external theme/updater code
    try {
        if (badgeEl) badgeEl.setAttribute('data-state', state);
    } catch (e) {
        /* ignore */
    }
}

function createDownloadItem(download: DownloadItem, isDark: boolean): HTMLElement {
    const item = document.createElement('div');
    item.classList.add("item")
    item.style.cssText = `
        padding: 12px 18px;
        border-bottom: 1px solid ${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)"};
        display: flex;
        flex-direction: column;
        gap: 8px;
    `;

    // En-tête de l'item
    const itemHeader = document.createElement('div');
    itemHeader.classList.add("itemHeader")
    itemHeader.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 8px;
    `;

    const fileName = document.createElement('div');
    fileName.classList.add("fileName")
    fileName.textContent = download.video_name;
    fileName.style.cssText = `
        color: ${isDark ? "#fff" : "#1a1a1a"};
        font-size: 13px;
        font-weight: 500;
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    `;

    const status = document.createElement('div');
    status.classList.add("status")
    status.textContent = getStatusText(download.status);
    status.style.cssText = `
        color: ${getStatusColor(download.status, isDark)};
        font-size: 16px;
        flex-shrink: 0;
    `;

    itemHeader.appendChild(fileName);
    itemHeader.appendChild(status);
    item.appendChild(itemHeader);

    const progressBar = document.createElement('div');
    progressBar.classList.add("progressBar-Dwl")
    // Barre de progression (si en cours ou en attente)
    if (download.status === 'downloading' || download.status === 'queued') {
        //const progressBar = document.createElement('div');
        //progressBar.classList.add("progressBar-Dwl")
        progressBar.style.cssText = `
            width: 100%;
            height: 4px;
            background: ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
            border-radius: 2px;
            overflow: hidden;
        `;

        const progressFill = document.createElement('div');
        progressFill.classList.add("progressFill-Dwl")
        progressFill.style.cssText = `
            width: ${download.progress}%;
            height: 100%;
            background: ${getProgressColor(download.status, isDark)};
            transition: width 0.3s ease;
            border-radius: 2px;
        `;

        progressBar.appendChild(progressFill);
        item.appendChild(progressBar);
    }

    // Détails
    const details = document.createElement('div');
    details.classList.add("details-Dwl")
    details.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        color: ${isDark ? "#999" : "#666"};
        gap: 15px;
    `;

    const leftInfo = document.createElement('div');
    leftInfo.style.cssText = `display: flex; align-items: center; gap: 8px; flex: 1;`;

    const percentage = document.createElement('span');
    percentage.classList.add('pourcentage-dwl')
    percentage.style.cssText = `font-weight: 600; color: ${isDark ? "#fff" : "#333"}; min-width: 30px;`;

    const sizeInfo = document.createElement('span');
    sizeInfo.classList.add('size-dwl')
    sizeInfo.style.cssText = `color: ${isDark ? "#ccc" : "#666"};`;

    const rightInfo = document.createElement('div');
    rightInfo.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: flex-end;
        min-width: 120px;
    `;

    const speedInfo = document.createElement('span');
    speedInfo.classList.add('speedInfo-dwl')
    speedInfo.style.cssText = `color: ${isDark ? "#ccc" : "#666"}; font-style: italic;`;

    const etaInfo = document.createElement('span');
    etaInfo.style.cssText = `
        font-weight: 500;
        color: ${isDark ? "#ff8000" : "#ff4000"};
        min-width: 40px;
        text-align: right;
    `;

    // Remplir selon le statut
    switch (download.status) {
        case 'downloading':
            percentage.textContent = `${Math.round(download.progress)}%`;
            sizeInfo.textContent = `${formatBytes(download.downloaded_bytes)}/${formatBytes(download.total_bytes)}`;
            speedInfo.textContent = `${download.speed}/s`;
            etaInfo.textContent = formatETA(download.eta);
            break;
        case 'completed':
            percentage.textContent = '100%';
            sizeInfo.textContent = formatBytes(download.total_bytes);
            etaInfo.textContent = 'Done';
            etaInfo.style.color = isDark ? '#4ade80' : '#16a34a';
            break;
        case 'error':
            percentage.textContent = 'Failed';
            sizeInfo.textContent = formatBytes(download.downloaded_bytes);
            etaInfo.textContent = 'Error';
            etaInfo.style.color = isDark ? '#f87171' : '#dc2626';
            break;
        case 'queued':
            percentage.textContent = '0%';
            sizeInfo.textContent = 'Pending';
            etaInfo.textContent = 'Queued';
            etaInfo.style.color = isDark ? '#94a3b8' : '#64748b';
            break;
    }

    leftInfo.appendChild(percentage);
    leftInfo.appendChild(sizeInfo);
    rightInfo.appendChild(speedInfo);
    rightInfo.appendChild(etaInfo);
    details.appendChild(leftInfo);
    details.appendChild(rightInfo);
    item.appendChild(details);

    return item;
}

// ==================== DRAG & DROP ====================

function constrainToViewport(x: number, y: number, container: HTMLElement): Position {
    const rect = container.getBoundingClientRect();
    const margin = 10;
    const maxX = window.innerWidth - rect.width - margin;
    const maxY = window.innerHeight - rect.height - margin;
    
    return {
        x: Math.max(margin, Math.min(x, maxX)),
        y: Math.max(margin, Math.min(y, maxY))
    };
}

function setupDragAndDrop(
    container: HTMLElement,
    handles: HTMLElement | HTMLElement[],
    state: any,
    _isDark: boolean
) {
    let startPosition = { x: 0, y: 0 };

    const startDrag = (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) return;

        state.isDragging = true;
        
        // Sauvegarder la position initiale
        const rect = container.getBoundingClientRect();
        startPosition.x = rect.left;
        startPosition.y = rect.top;
        
        state.dragOffsetX = e.clientX - rect.left;
        state.dragOffsetY = e.clientY - rect.top;
        
    // Désactiver les transitions pendant le drag
    container.style.transition = 'none';
    container.style.cursor = 'grabbing';
    // update handles cursor if present
    handleList.forEach(h => h.style.cursor = 'grabbing');
        
        e.preventDefault();
    };

    const onDrag = (e: MouseEvent) => {
        if (!state.isDragging) return;
        
        const x = e.clientX - state.dragOffsetX;
        const y = e.clientY - state.dragOffsetY;
        const constrained = constrainToViewport(x, y, container);
        
        // Appliquer directement les positions
        container.style.left = `${constrained.x}px`;
        container.style.top = `${constrained.y}px`;
        container.style.right = 'auto';
        container.style.bottom = 'auto';
    };

    const stopDrag = () => {
        if (!state.isDragging) return;
        
        state.isDragging = false;
        container.style.cursor = 'grab';
        handleList.forEach(h => h.style.cursor = 'grab');
        
        // Réactiver les transitions
        container.style.transition = 'all 0.3s ease';
        
        // Sauvegarder la nouvelle position
        savePosition(container);
    };

    const handleList = Array.isArray(handles) ? handles : [handles];
    handleList.forEach(h => h.addEventListener('mousedown', startDrag));
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);

    return () => {
        handleList.forEach(h => h.removeEventListener('mousedown', startDrag));
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', stopDrag);
    };
}

function savePosition(container: HTMLElement) {
    const rect = container.getBoundingClientRect();
    const position = { x: rect.left, y: rect.top };
    window.localStorage.setItem('progressBarPosition', JSON.stringify(position));
}

// ==================== MISE À JOUR DU THÈME ====================

function updateTheme(
    container: HTMLElement,
    mainTitle: HTMLElement,
    progressText: HTMLElement,
    expandBtn: HTMLElement,
    closeBtn: HTMLElement,
    _isDark: boolean
) {
    const THEME = document.documentElement.getAttribute("data-theme");
    const currentTheme = THEME === "dark" ? localStorage.getItem("theme"):THEME;
    const isDarkMode = currentTheme?.trim() !== "light";
    
    container.style.background = isDarkMode
        ? "linear-gradient(135deg, rgba(26, 26, 26, 0.98) 0%, rgba(35, 35, 35, 0.98) 100%)"
        : "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 250, 250, 0.98) 100%)";
    container.style.borderColor = isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";
    
    mainTitle.style.color = isDarkMode ? "#ffffff" : "#1a1a1a";
    progressText.style.color = isDarkMode ? "#999" : "#666";
    
    [expandBtn, closeBtn].forEach(btn => {
        btn.style.background = isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)";
        btn.style.color = isDarkMode ? "#999" : "#666";
    });
}