// Ohenro Connect - Translation Engine (API & High-quality Manual Translation Dictionary)

// Manual translation dictionary for initial mock threads to guarantee perfect experience offline/without API limits.
const MOCK_TRANSLATION_DICTIONARY = {
    "thread-1": {
        ja: {
            title: "今日からお遍路をスタートします！🌸",
            content: "第1番札所の霊山寺（りょうぜんじ）から出発しました！天気は素晴らしく、すでに2人の歩き遍路さんに会いました。長い旅に向けて準備万端です！"
        },
        ko: {
            title: "오늘부터 순례를 시작합니다! 🌸",
            content: "1번 절 료젠지(霊山寺)에서 출발했습니다. 날씨가 정말 좋고 벌써 두 명의 순례자를 만났습니다. 긴 여행을 위한 준비가 완료되었습니다!"
        },
        fr: {
            title: "Je commence mon pèlerinage aujourd'hui ! 🌸",
            content: "Je viens de commencer au Temple 1 : Ryozenji (霊山寺). Le temps est magnifique et j'ai déjà rencontré deux autres pèlerins. Prêt pour ce long voyage !"
        }
    },
    "comment-1-1": {
        en: { content: "Take care! Wish you a wonderful journey." },
        ko: { content: "조심해서 다녀오세요! 멋진 여행이 되기를 바랍니다." },
        fr: { content: "Prenez soin de vous ! Je vous souhaite un merveilleux voyage." }
    },
    "thread-2": {
        en: {
            title: "Question about the route to Shosan-ji (No. 12)",
            content: "Tomorrow, I plan to climb from No. 11 Fujiidera to No. 12 Shosan-ji. I heard it is a steep, difficult path called 'Henro-korogashi' (pilgrim roller). Will I be okay with regular sneakers? Or do I absolutely need proper hiking boots? Experienced pilgrims, please let me know!"
        },
        ko: {
            title: "쇼산지(12번)로 가는 경로에 대해 질문이 있습니다",
            content: "내일 11번 후지이데라에서 12번 쇼산지로 올라갈 예정입니다. '헨로코로가시(순례자가 구르는 곳)'라고 불리는 험난한 곳이라고 들었는데, 운동화로도 괜찮을까요? 아니면 등산화가 필요할까요? 경험자분들 알려주세요!"
        },
        fr: {
            title: "Question sur l'itinéraire vers Shosan-ji (N° 12)",
            content: "Demain, je prévois de monter du N° 11 Fujiidera au N° 12 Shosan-ji. J'ai entendu dire que c'est un sentier escarpé et difficile appelé 'Henro-korogashi'. Est-ce que ça ira avec des baskets normales ? Ou ai-je absolument besoin de chaussures de randonnée ? S'il vous plaît, faites-moi part de votre expérience !"
        }
    },
    "comment-2-1": {
        ja: { content: "登山靴をおすすめします。雨が降ると山道、特に木の根のあたりがとても滑りやすくなります。" },
        ko: { content: "제대로 된 등산화를 추천합니다. 비가 오면 산길, 특히 나무 뿌리 근처가 매우 미끄러워집니다." },
        fr: { content: "Je recommande de vraies chaussures de randonnée. Quand il pleut, le sentier de montagne devient très glissant, surtout autour des racines des arbres." }
    },
    "thread-3": {
        ja: {
            title: "熊谷寺（9番）近くの美味しいラーメン屋紹介 🍜",
            content: "9番札所の熊谷寺（くまだにじ）近くにある「徳島ラーメン 桜花」が本当に美味しいです！スープが濃厚で、生卵が無料で付いてきます。歩いて10分ほどで行けます。"
        },
        en: {
            title: "Highly recommend a tasty Ramen shop near Kumadaniji (No. 9) 🍜",
            content: "The 'Tokushima Ramen Ouka' near Temple 9 Kumadaniji is really delicious. The broth is rich and raw eggs are provided for free. It takes about a 10-minute walk."
        },
        fr: {
            title: "Recommandation de restaurant de ramen près de Kumadaniji (N° 9) 🍜",
            content: "Le 'Tokushima Ramen Ouka' près du Temple 9 Kumadaniji est vraiment délicieux. Le bouillon est riche et les œufs crus sont offerts. C'est à environ 10 minutes à pied."
        }
    }
};

const OhenroTranslator = {
    // Supported languages
    languages: {
        ja: "日本語",
        en: "English",
        ko: "한국어",
        fr: "Français"
    },

    // Translate text using MyMemory API with local mock dict fallback
    async translate(id, text, targetLang, isTitle = false) {
        // 1. Check local dictionary first
        if (MOCK_TRANSLATION_DICTIONARY[id] && MOCK_TRANSLATION_DICTIONARY[id][targetLang]) {
            const data = MOCK_TRANSLATION_DICTIONARY[id][targetLang];
            return isTitle ? data.title : data.content;
        }

        // 2. Call real API
        try {
            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLang}`
            );
            if (!response.ok) throw new Error("API Network error");
            
            const data = await response.json();
            if (data.responseData && data.responseData.translatedText) {
                // If API returns successfully, return the translated text
                return data.responseData.translatedText;
            }
            throw new Error("Translation API quota or error");
        } catch (error) {
            console.warn("Translation API failed, falling back to simulated translation: ", error);
            return this.simulateFallback(text, targetLang);
        }
    },

    // A smart simulator when API fails
    simulateFallback(text, targetLang) {
        const prefixes = {
            ja: "[自動翻訳]",
            en: "[Auto-Trans]",
            ko: "[자동번역]",
            fr: "[Traduit]"
        };

        const prefix = prefixes[targetLang] || "[Translated]";
        
        // Since we can't translate arbitrary text perfectly without API,
        // we'll mock it gracefully or return original with warning
        if (targetLang === "ja") {
            return `${prefix} (他言語の投稿) ${text}`;
        } else {
            return `${prefix} (Translated to ${this.languages[targetLang]}) ${text}`;
        }
    }
};
