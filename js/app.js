// Ohenro Connect - Main Application Controller

const OhenroApp = {
    selectedImageBase64: null,

    init() {
        this.loadUser();
        this.loadThreads();
        this.setupEventListeners();
    },

    // Load user configuration and set header UI
    loadUser() {
        const user = OhenroStorage.getUser();
        
        // Apply theme
        document.documentElement.setAttribute('data-theme', user.theme || 'light');
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.setAttribute('data-lucide', user.theme === 'dark' ? 'sun' : 'moon');
        }

        // Apply profile info in navbar
        const profileBtn = document.getElementById('user-profile-btn');
        if (profileBtn) {
            profileBtn.innerHTML = `
                <img src="${user.avatar || 'assets/default_avatar.png'}" alt="Profile" class="avatar-sm">
                <span id="current-user-name">${user.name}</span>
            `;
            profileBtn.title = `現在の位置: ${user.currentStation}番札所`;
        }

        // Render Ohenro progress map
        OhenroComponents.renderMap(user.currentStation);
        if (lucide) lucide.createIcons();
    },

    // Load and filter threads
    loadThreads() {
        const threads = OhenroStorage.getThreads();
        const grid = document.getElementById("thread-grid");
        const categoryFilter = document.getElementById("category-filter").value;
        
        if (!grid) return;
        
        grid.innerHTML = "";
        
        const filteredThreads = categoryFilter === "all" 
            ? threads 
            : threads.filter(t => t.category === categoryFilter);

        if (filteredThreads.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
                    <i data-lucide="info" style="width: 48px; height: 48px; margin-bottom: 10px;"></i>
                    <p>このカテゴリにはまだ投稿がありません</p>
                </div>
            `;
        } else {
            filteredThreads.forEach(thread => {
                const card = OhenroComponents.createThreadCard(thread);
                grid.appendChild(card);
            });
        }
        
        if (lucide) lucide.createIcons();
    },

    setupEventListeners() {
        // Theme toggler
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const user = OhenroStorage.getUser();
                user.theme = user.theme === 'dark' ? 'light' : 'dark';
                OhenroStorage.saveUser(user);
                this.loadUser();
            });
        }

        // Category Filter
        const filter = document.getElementById("category-filter");
        if (filter) {
            filter.addEventListener('change', () => this.loadThreads());
        }

        // Post Modal Show/Hide
        const openModalBtn = document.getElementById("open-post-modal");
        const closeModalBtn = document.getElementById("close-modal");
        const modal = document.getElementById("post-modal");

        if (openModalBtn && modal) {
            openModalBtn.addEventListener('click', () => {
                modal.classList.add('active');
            });
        }

        if (closeModalBtn && modal) {
            closeModalBtn.addEventListener('click', () => {
                modal.classList.remove('active');
                this.resetPostForm();
            });
        }

        // Close modal if clicked outside content
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    this.resetPostForm();
                }
            });
        }

        // Handle Image Selection and Compression
        const fileInput = document.getElementById("post-image");
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.compressImage(file);
                }
            });
        }

        // Post Form Submit
        const postForm = document.getElementById("post-form");
        if (postForm) {
            postForm.addEventListener('submit', (e) => this.handlePostSubmit(e));
        }

        // Profile clicking (opens a settings modal to edit profile details)
        const profileBtn = document.getElementById('user-profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => this.openProfileSettingsModal());
        }
    },

    // Canvas-based client-side image compression
    compressImage(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                let width = img.width;
                let height = img.height;

                // Adjust dimensions maintaining aspect ratio
                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to compressed jpeg Data URL (70% quality)
                this.selectedImageBase64 = canvas.toDataURL('image/jpeg', 0.7);
                
                // Show preview
                const previewDiv = document.getElementById("image-preview");
                const previewImg = previewDiv.querySelector("img");
                previewImg.src = this.selectedImageBase64;
                previewDiv.style.display = "block";
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    },

    resetPostForm() {
        const postForm = document.getElementById("post-form");
        if (postForm) postForm.reset();
        
        const previewDiv = document.getElementById("image-preview");
        if (previewDiv) {
            previewDiv.querySelector("img").src = "";
            previewDiv.style.display = "none";
        }
        this.selectedImageBase64 = null;
    },

    handlePostSubmit(e) {
        e.preventDefault();
        const title = document.getElementById("post-title").value.trim();
        const content = document.getElementById("post-content").value.trim();
        const category = document.getElementById("post-category").value;
        
        if (!title || !content) return;

        // Auto-detect language (Simplified: checks for CJK characters)
        const hasJapanese = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(content);
        const language = hasJapanese ? "ja" : "en"; // Default to English for western text

        OhenroStorage.addThread(title, content, category, this.selectedImageBase64, language);
        
        // Hide Modal & Refresh
        const modal = document.getElementById("post-modal");
        if (modal) modal.classList.remove('active');
        
        this.resetPostForm();
        this.loadThreads();
    },

    // Profile Settings modal so user can test translation as different lang / station
    openProfileSettingsModal() {
        // Remove existing modal if any
        const existing = document.getElementById("profile-modal");
        if (existing) existing.remove();

        const user = OhenroStorage.getUser();

        const modalHtml = `
            <div id="profile-modal" class="modal-overlay active">
                <div class="modal-content" style="max-width: 400px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3>プロフィール設定</h3>
                        <button onclick="document.getElementById('profile-modal').remove()" class="btn" style="background: none; color: var(--text-muted);"><i data-lucide="x"></i></button>
                    </div>
                    <form id="profile-form">
                        <div class="mb-20">
                            <label style="display: block; font-size: 0.85rem; margin-bottom: 5px;">お名前</label>
                            <input type="text" id="settings-name" value="${user.name}" class="glass-panel" style="width: 100%; padding: 10px; border-radius: 8px;" required>
                        </div>
                        <div class="mb-20">
                            <label style="display: block; font-size: 0.85rem; margin-bottom: 5px;">表示言語 (翻訳時のターゲット言語)</label>
                            <select id="settings-lang" class="glass-panel" style="width: 100%; padding: 10px; border-radius: 8px;">
                                <option value="ja" ${user.language === 'ja' ? 'selected' : ''}>日本語 (Japanese)</option>
                                <option value="en" ${user.language === 'en' ? 'selected' : ''}>English</option>
                                <option value="ko" ${user.language === 'ko' ? 'selected' : ''}>한국어 (Korean)</option>
                                <option value="fr" ${user.language === 'fr' ? 'selected' : ''}>Français (French)</option>
                            </select>
                        </div>
                        <div class="mb-20">
                            <label style="display: block; font-size: 0.85rem; margin-bottom: 5px;">現在札所 (1〜88番)</label>
                            <input type="number" id="settings-station" min="1" max="88" value="${user.currentStation}" class="glass-panel" style="width: 100%; padding: 10px; border-radius: 8px;" required>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">設定を保存</button>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (lucide) lucide.createIcons();

        // Submit Handler
        const form = document.getElementById("profile-form");
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById("settings-name").value.trim();
            const lang = document.getElementById("settings-lang").value;
            const station = document.getElementById("settings-station").value;

            if (name && station) {
                const user = OhenroStorage.getUser();
                user.name = name;
                user.language = lang;
                user.currentStation = parseInt(station, 10);
                OhenroStorage.saveUser(user);

                // Reload everything to apply
                document.getElementById("profile-modal").remove();
                this.loadUser();
                this.loadThreads();
            }
        });
    }
};

// Global reference
window.OhenroApp = OhenroApp;

document.addEventListener('DOMContentLoaded', () => {
    OhenroApp.init();
});
