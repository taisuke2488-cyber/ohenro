// Ohenro Connect - Local Storage Management & Mock Data

const INITIAL_THREADS = [
    {
        id: "thread-1",
        title: "Starting my pilgrimage today! 🌸",
        category: "report",
        content: "Just started from Temple 1: Ryozenji (霊山寺). The weather is wonderful and I met two other pilgrims already. Ready for the long journey!",
        language: "en",
        author: {
            name: "John Doe",
            avatar: "assets/default_avatar.png",
            currentStation: 1
        },
        likes: 12,
        liked: false,
        createdAt: "2026-07-07T08:00:00.000Z",
        comments: [
            {
                id: "comment-1-1",
                content: "お気をつけて！素晴らしい旅になりますように。",
                language: "ja",
                author: {
                    name: "山田 太郎",
                    avatar: "assets/default_avatar.png",
                    currentStation: 12
                },
                createdAt: "2026-07-07T08:15:00.000Z"
            }
        ]
    },
    {
        id: "thread-2",
        title: "焼山寺（12番）へのルートについて質問です",
        category: "question",
        content: "明日、11番藤井寺から12番焼山寺へ登る予定です。「遍路ころがし」と呼ばれる難所だと聞きましたが、スニーカーでも大丈夫でしょうか？それとも登山靴が必要ですか？経験者の方教えてください！",
        language: "ja",
        author: {
            name: "佐藤 さくら",
            avatar: "assets/default_avatar.png",
            currentStation: 11
        },
        likes: 8,
        liked: false,
        createdAt: "2026-07-06T12:00:00.000Z",
        comments: [
            {
                id: "comment-2-1",
                content: "I recommend proper hiking shoes. When it rains, the mountain path gets very slippery, especially around the roots of trees.",
                language: "en",
                author: {
                    name: "Sarah Miller",
                    avatar: "assets/default_avatar.png",
                    currentStation: 23
                },
                createdAt: "2026-07-06T12:30:00.000Z"
            }
        ]
    },
    {
        id: "thread-3",
        title: "쿠마타니지(9번) 근처의 맛있는 라멘집 추천 🍜",
        category: "lodging",
        content: "9번 절 쿠마타니지(熊谷寺) 근처에 있는 '토쿠시마 라멘 오우카'가 진짜 맛있어요. 국물이 진하고 계란이 무료로 제공됩니다. 걸어서 10분 정도 걸립니다.",
        language: "ko",
        author: {
            name: "김 민준",
            avatar: "assets/default_avatar.png",
            currentStation: 9
        },
        likes: 15,
        liked: false,
        createdAt: "2026-07-05T09:00:00.000Z",
        comments: []
    }
];

const OhenroStorage = {
    // Keys
    THREADS_KEY: "ohenro_connect_threads",
    USER_KEY: "ohenro_connect_user",
    
    // Initialize LocalStorage with default data if empty
    init() {
        if (!localStorage.getItem(this.THREADS_KEY)) {
            localStorage.setItem(this.THREADS_KEY, JSON.stringify(INITIAL_THREADS));
        }
        
        if (!localStorage.getItem(this.USER_KEY)) {
            const defaultUser = {
                name: "お遍路ビギナー",
                avatar: "assets/default_avatar.png",
                currentStation: 1,
                theme: "light",
                language: "ja"
            };
            localStorage.setItem(this.USER_KEY, JSON.stringify(defaultUser));
        }
    },
    
    // Threads CRUD
    getThreads() {
        this.init();
        return JSON.parse(localStorage.getItem(this.THREADS_KEY));
    },
    
    saveThreads(threads) {
        localStorage.setItem(this.THREADS_KEY, JSON.stringify(threads));
    },
    
    addThread(title, content, category, imageUrl = null, language = "ja") {
        const threads = this.getThreads();
        const user = this.getUser();
        
        const newThread = {
            id: `thread-${Date.now()}`,
            title,
            category,
            content,
            image: imageUrl,
            language,
            author: {
                name: user.name,
                avatar: user.avatar,
                currentStation: user.currentStation
            },
            likes: 0,
            liked: false,
            createdAt: new Date().toISOString(),
            comments: []
        };
        
        threads.unshift(newThread);
        this.saveThreads(threads);
        return newThread;
    },
    
    likeThread(threadId) {
        const threads = this.getThreads();
        const threadIndex = threads.findIndex(t => t.id === threadId);
        
        if (threadIndex !== -1) {
            const thread = threads[threadIndex];
            if (thread.liked) {
                thread.likes -= 1;
                thread.liked = false;
            } else {
                thread.likes += 1;
                thread.liked = true;
            }
            this.saveThreads(threads);
            return thread;
        }
        return null;
    },
    
    addComment(threadId, content, language = "ja") {
        const threads = this.getThreads();
        const threadIndex = threads.findIndex(t => t.id === threadId);
        const user = this.getUser();
        
        if (threadIndex !== -1) {
            const newComment = {
                id: `comment-${Date.now()}`,
                content,
                language,
                author: {
                    name: user.name,
                    avatar: user.avatar,
                    currentStation: user.currentStation
                },
                createdAt: new Date().toISOString()
            };
            
            threads[threadIndex].comments.push(newComment);
            this.saveThreads(threads);
            return newComment;
        }
        return null;
    },
    
    // User Profile
    getUser() {
        this.init();
        return JSON.parse(localStorage.getItem(this.USER_KEY));
    },
    
    saveUser(user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        // Update user info on existing posts in active session
    },
    
    updateUserProgress(stationNumber) {
        const user = this.getUser();
        user.currentStation = parseInt(stationNumber, 10);
        this.saveUser(user);
        return user;
    }
};

OhenroStorage.init();
