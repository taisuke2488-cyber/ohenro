// Ohenro Connect - UI Rendering Components

const MAP_STATIONS = [
    { num: 1, name: "1番 霊山寺", desc: "発願" },
    { num: 12, name: "12番 焼山寺", desc: "遍路ころがし" },
    { num: 24, name: "24番 最御崎寺", desc: "修行の道場" },
    { num: 37, name: "37番 岩本寺", desc: "天井絵画" },
    { num: 51, name: "51番 石手寺", desc: "道後の古刹" },
    { num: 75, name: "75番 善通寺", desc: "大師生誕地" },
    { num: 84, name: "84番 屋島寺", desc: "源平の古戦場" },
    { num: 88, name: "88番 大窪寺", desc: "結願" }
];

const CATEGORY_LABELS = {
    report: "巡礼記録",
    question: "質問",
    lodging: "宿情報",
    general: "雑談"
};

const CATEGORY_COLORS = {
    report: "rgba(46, 204, 113, 0.15); color: #2ecc71",
    question: "rgba(231, 76, 60, 0.15); color: #e74c3c",
    lodging: "rgba(52, 152, 219, 0.15); color: #3498db",
    general: "rgba(155, 89, 182, 0.15); color: #9b59b6"
};

const OhenroComponents = {
    // Render the interactive timeline map
    renderMap(currentStation) {
        const container = document.getElementById("ohenro-map");
        if (!container) return;
        
        container.innerHTML = `<div class="map-line"></div>`;
        
        // Find the active checkpoint index
        let activeIndex = 0;
        for (let i = 0; i < MAP_STATIONS.length; i++) {
            if (currentStation >= MAP_STATIONS[i].num) {
                activeIndex = i;
            }
        }
        
        MAP_STATIONS.forEach((station, index) => {
            const isActive = index <= activeIndex;
            const isCurrent = index === activeIndex;
            
            const checkpointEl = document.createElement("div");
            checkpointEl.className = `map-checkpoint ${isActive ? 'active' : ''} ${isCurrent ? 'pulse' : ''}`;
            checkpointEl.style.cursor = "pointer";
            checkpointEl.title = `現在の札所を ${station.num}番 に設定`;
            
            // On click, update user location
            checkpointEl.addEventListener("click", () => {
                const updatedUser = OhenroStorage.updateUserProgress(station.num);
                this.renderMap(updatedUser.currentStation);
                // Update profile header
                document.querySelector(".user-profile").title = `現在の位置: ${updatedUser.currentStation}番札所`;
                // Reload threads to reflect station update in UI if needed
                if (window.OhenroApp) window.OhenroApp.loadThreads();
            });
            
            checkpointEl.innerHTML = `
                <div class="dot" style="${isCurrent ? 'background: var(--secondary-color);' : ''}"></div>
                <div class="checkpoint-label" style="font-weight: ${isCurrent ? 'bold' : 'normal'}; color: ${isActive ? 'var(--text-main)' : 'var(--text-muted)'}">
                    ${station.name}
                </div>
                <span style="font-size: 0.6rem; color: var(--text-muted); opacity: 0.8;">${station.desc}</span>
            `;
            
            container.appendChild(checkpointEl);
        });
    },

    // Render a single thread card
    createThreadCard(thread) {
        const card = document.createElement("div");
        card.className = "thread-card fade-in";
        card.id = `card-${thread.id}`;
        
        const timeFormatted = new Date(thread.createdAt).toLocaleDateString("ja-JP", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
        
        const hasImage = thread.image ? true : false;
        const imageHtml = hasImage ? `<img src="${thread.image}" class="thread-image" alt="${thread.title}">` : '';
        
        const langBadge = `<span style="font-size: 0.7rem; color: var(--text-muted); border: 1px solid var(--border-color); padding: 1px 5px; border-radius: 4px; margin-left: 8px;">${thread.language.toUpperCase()}</span>`;
        
        card.innerHTML = `
            ${imageHtml}
            <div class="thread-content" style="cursor: pointer;" onclick="OhenroComponents.openThreadDetail('${thread.id}')">
                <div class="thread-meta">
                    <span class="category-badge" style="${CATEGORY_COLORS[thread.category]}">${CATEGORY_LABELS[thread.category]}</span>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${timeFormatted}</span>
                    ${langBadge}
                </div>
                <h3 class="thread-title" id="title-${thread.id}">${thread.title}</h3>
                <p class="thread-excerpt" id="content-${thread.id}">${thread.content}</p>
                
                <div class="user-info" style="margin-top: 15px;">
                    <img src="${thread.author.avatar}" class="avatar-sm" alt="${thread.author.name}">
                    <div>
                        <span style="font-weight: 500;">${thread.author.name}</span>
                        <span style="font-size: 0.75rem; color: var(--text-muted); block; margin-left: 5px;">📍 ${thread.author.currentStation}番札所</span>
                    </div>
                </div>
            </div>
            <div class="thread-footer">
                <button class="btn translate-btn" onclick="OhenroComponents.toggleTranslation(event, '${thread.id}', 'thread')">
                    <i data-lucide="languages" style="width: 14px; height: 14px;"></i> 翻訳を表示
                </button>
                <div style="display: flex; gap: 15px; align-items: center; color: var(--text-muted); font-size: 0.9rem;">
                    <span style="cursor: pointer; display: flex; align-items: center; gap: 4px;" onclick="OhenroComponents.likeThread(event, '${thread.id}')" id="like-btn-${thread.id}">
                        <i data-lucide="heart" style="width: 16px; height: 16px; fill: ${thread.liked ? 'var(--secondary-color)' : 'none'}; stroke: ${thread.liked ? 'var(--secondary-color)' : 'currentColor'}"></i> 
                        <span id="like-count-${thread.id}">${thread.likes}</span>
                    </span>
                    <span style="display: flex; align-items: center; gap: 4px; cursor: pointer;" onclick="OhenroComponents.openThreadDetail('${thread.id}')">
                        <i data-lucide="message-square" style="width: 16px; height: 16px;"></i> ${thread.comments.length}
                    </span>
                </div>
            </div>
        `;
        
        return card;
    },

    // Interactive translation handler for thread cards
    async toggleTranslation(event, id, type, originalLang = null) {
        if (event) event.stopPropagation();
        
        const btn = event ? event.currentTarget : null;
        let titleEl, contentEl, originalText, originalTitleText;
        
        if (type === 'thread') {
            titleEl = document.getElementById(`title-${id}`);
            contentEl = document.getElementById(`content-${id}`);
        } else {
            contentEl = document.getElementById(`comment-text-${id}`);
        }
        
        const threads = OhenroStorage.getThreads();
        let targetItem;
        
        if (type === 'thread') {
            targetItem = threads.find(t => t.id === id);
        } else {
            // Find comment inside any thread
            for (let t of threads) {
                const c = t.comments.find(comm => comm.id === id);
                if (c) {
                    targetItem = c;
                    break;
                }
            }
        }
        
        if (!targetItem) return;
        
        const srcLang = targetItem.language;
        const currentUser = OhenroStorage.getUser();
        // If thread is already in user's language, default translation to Japanese or English (cross translation)
        const targetLang = currentUser.language === srcLang ? (srcLang === 'ja' ? 'en' : 'ja') : currentUser.language;
        
        // Toggle state check
        if (contentEl.dataset.translated === "true") {
            // Revert to original
            if (type === 'thread' && titleEl) titleEl.innerText = targetItem.title;
            contentEl.innerText = targetItem.content;
            contentEl.dataset.translated = "false";
            if (btn) btn.innerHTML = `<i data-lucide="languages" style="width: 14px; height: 14px;"></i> 翻訳を表示`;
            if (lucide) lucide.createIcons();
            return;
        }
        
        // Show skeleton or loading state
        if (btn) btn.innerHTML = `<span class="skeleton" style="width: 50px; height: 14px;"></span>`;
        if (type === 'thread' && titleEl) titleEl.classList.add('skeleton');
        contentEl.classList.add('skeleton');
        
        try {
            let translatedTitle = "";
            let translatedContent = "";
            
            if (type === 'thread') {
                translatedTitle = await OhenroTranslator.translate(id, targetItem.title, targetLang, true);
            }
            translatedContent = await OhenroTranslator.translate(id, targetItem.content, targetLang, false);
            
            if (type === 'thread' && titleEl) {
                titleEl.innerText = translatedTitle;
                titleEl.classList.remove('skeleton');
            }
            contentEl.innerText = translatedContent;
            contentEl.classList.remove('skeleton');
            
            contentEl.dataset.translated = "true";
            
            if (btn) {
                const targetLangLabel = OhenroTranslator.languages[targetLang] || targetLang.toUpperCase();
                btn.innerHTML = `<i data-lucide="languages" style="width: 14px; height: 14px;"></i> 原文を表示 (${targetLangLabel})`;
            }
            
            if (lucide) lucide.createIcons();
        } catch (err) {
            console.error(err);
            if (btn) btn.innerHTML = `<i data-lucide="alert-circle" style="width: 14px; height: 14px;"></i> 翻訳失敗`;
            if (lucide) lucide.createIcons();
        }
    },

    // Handle Likes
    likeThread(event, id) {
        if (event) event.stopPropagation();
        const updatedThread = OhenroStorage.likeThread(id);
        if (updatedThread) {
            // Update counts on specific elements (both index card and modal)
            const countEls = document.querySelectorAll(`#like-count-${id}`);
            const btnEls = document.querySelectorAll(`#like-btn-${id} i`);
            
            countEls.forEach(el => el.innerText = updatedThread.likes);
            btnEls.forEach(el => {
                if (updatedThread.liked) {
                    el.style.fill = "var(--secondary-color)";
                    el.style.stroke = "var(--secondary-color)";
                } else {
                    el.style.fill = "none";
                    el.style.stroke = "currentColor";
                }
            });
        }
    },

    // Open detailed thread modal
    openThreadDetail(threadId) {
        const threads = OhenroStorage.getThreads();
        const thread = threads.find(t => t.id === threadId);
        if (!thread) return;
        
        // Remove existing detail modal if open
        const existingModal = document.getElementById("detail-modal");
        if (existingModal) existingModal.remove();
        
        // Build comments list HTML
        let commentsHtml = "";
        thread.comments.forEach(c => {
            const cTime = new Date(c.createdAt).toLocaleDateString("ja-JP", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
            
            commentsHtml += `
                <div style="border-bottom: 1px solid var(--border-color); padding: 15px 0;">
                    <div class="user-info" style="justify-content: space-between; margin-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <img src="${c.author.avatar}" class="avatar-sm" alt="${c.author.name}">
                            <span style="font-weight: 500;">${c.author.name}</span>
                            <span style="font-size: 0.75rem; color: var(--text-muted);">📍 ${c.author.currentStation}番札所</span>
                        </div>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">${cTime}</span>
                    </div>
                    <p id="comment-text-${c.id}" style="font-size: 0.95rem; white-space: pre-line;">${c.content}</p>
                    <div style="margin-top: 8px; display: flex; justify-content: flex-end;">
                        <button class="btn translate-btn" onclick="OhenroComponents.toggleTranslation(event, '${c.id}', 'comment')">
                            <i data-lucide="languages" style="width: 12px; height: 12px;"></i> 翻訳を表示
                        </button>
                    </div>
                </div>
            `;
        });
        
        const hasImage = thread.image ? true : false;
        const imageHtml = hasImage ? `<img src="${thread.image}" style="width:100%; max-height: 350px; object-fit: cover; border-radius: 12px; margin-bottom: 20px;" alt="${thread.title}">` : '';
        
        const modalHtml = `
            <div id="detail-modal" class="modal-overlay active">
                <div class="modal-content" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <span class="category-badge" style="${CATEGORY_COLORS[thread.category]}">${CATEGORY_LABELS[thread.category]}</span>
                        <button onclick="document.getElementById('detail-modal').remove()" class="btn" style="background: none; color: var(--text-muted);"><i data-lucide="x"></i></button>
                    </div>
                    ${imageHtml}
                    <h2 style="font-size: 1.5rem; margin-bottom: 10px;" id="title-modal-${thread.id}">${thread.title}</h2>
                    <div class="user-info" style="margin-bottom: 20px;">
                        <img src="${thread.author.avatar}" class="avatar-sm" alt="${thread.author.name}">
                        <div>
                            <strong>${thread.author.name}</strong> 
                            <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 5px;">📍 ${thread.author.currentStation}番札所</span>
                        </div>
                    </div>
                    <p id="content-modal-${thread.id}" style="font-size: 1.1rem; line-height: 1.7; white-space: pre-line; margin-bottom: 30px; border-bottom: 1px solid var(--border-color); padding-bottom: 20px;">${thread.content}</p>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                        <button class="btn translate-btn" onclick="OhenroComponents.toggleTranslation(event, '${thread.id}', 'thread')">
                            <i data-lucide="languages" style="width: 14px; height: 14px;"></i> 翻訳を表示
                        </button>
                        <span style="cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: bold;" onclick="OhenroComponents.likeThread(event, '${thread.id}')" id="like-btn-${thread.id}">
                            <i data-lucide="heart" style="width: 20px; height: 20px; fill: ${thread.liked ? 'var(--secondary-color)' : 'none'}; stroke: ${thread.liked ? 'var(--secondary-color)' : 'currentColor'}"></i>
                            <span id="like-count-${thread.id}">${thread.likes}</span> いいね！
                        </span>
                    </div>

                    <!-- Comment Section -->
                    <div style="margin-top: 40px;">
                        <h3>コメント (${thread.comments.length})</h3>
                        <div id="comments-list-${thread.id}" style="margin-top: 15px; margin-bottom: 30px;">
                            ${thread.comments.length === 0 ? '<p style="color: var(--text-muted); font-style: italic;">まだコメントはありません</p>' : commentsHtml}
                        </div>
                        <form id="comment-form-${thread.id}" onsubmit="OhenroComponents.submitComment(event, '${thread.id}')">
                            <div style="display: flex; gap: 10px;">
                                <textarea id="comment-input-${thread.id}" placeholder="温かいコメントを書き込もう..." class="glass-panel" style="flex-grow: 1; padding: 10px; border-radius: 8px; height: 60px; resize: none;" required></textarea>
                                <button type="submit" class="btn btn-primary" style="border-radius: 8px;"><i data-lucide="send"></i></button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (lucide) lucide.createIcons();
    },

    // Submit new comment
    submitComment(event, threadId) {
        event.preventDefault();
        const input = document.getElementById(`comment-input-${threadId}`);
        if (!input || !input.value.trim()) return;
        
        // Detect language simply based on content (mostly Japanese if it has Hiragana/Katakana, else English)
        const text = input.value.trim();
        const hasJapanese = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(text);
        const language = hasJapanese ? "ja" : "en";
        
        const newComment = OhenroStorage.addComment(threadId, text, language);
        if (newComment) {
            input.value = "";
            
            // Re-render modal to display new comment and update counts
            this.openThreadDetail(threadId);
            
            // Reload grid to update comments count badge on card
            if (window.OrenroApp || window.OhenroApp) {
                window.OhenroApp.loadThreads();
            }
        }
    }
};
