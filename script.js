document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Toggle ---
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    
    mobileToggle.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
        const spans = mobileToggle.querySelectorAll('span');
        if (mobileNav.classList.contains('open')) {
            spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Close mobile nav when clicking a link
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('open');
            const spans = mobileToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });

    // --- Active Link Highlight on Scroll ---
    const sections = document.querySelectorAll('section[id], header');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 120)) {
                current = section.getAttribute('id') || '';
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // --- DX Contact Form & Tracking Handler ---
    const dxContactForm = document.getElementById('dx-contact-form');
    const dxFormContainer = document.getElementById('dx-form-container');
    const dxFormSuccess = document.getElementById('dx-form-success');
    const resetDxFormBtn = document.getElementById('reset-dx-form');

    if (dxContactForm) {
        dxContactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = dxContactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '送信中...';
            submitBtn.disabled = true;

            const payload = {
                name: document.getElementById('dx-name').value,
                email: document.getElementById('dx-email').value,
                message: document.getElementById('dx-message').value,
                timestamp: new Date().toISOString(),
                source: 'cafe-cozy-dx-portfolio'
            };

            // GA4 Custom Event
            if (typeof gtag === 'function') {
                gtag('event', 'generate_lead', {
                    event_category: 'DX_Form',
                    event_label: 'Contact_Submit',
                    value: 1
                });
            }
            // Meta Pixel Lead Event
            if (typeof fbq === 'function') {
                fbq('track', 'Lead', { content_name: 'Cafe Contact Form' });
            }

            console.log('[DX] Webhook送信ペイロード:', payload);

            // Simulate API request delay
            setTimeout(() => {
                dxFormContainer.style.display = 'none';
                dxFormSuccess.style.display = 'flex';
                
                // Show DX Toast
                showDxToast(`${payload.name}様、ありがとうございます。送信が完了しました。`);
                
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1000);
        });
    }

    if (resetDxFormBtn) {
        resetDxFormBtn.addEventListener('click', () => {
            dxContactForm.reset();
            dxFormSuccess.style.display = 'none';
            dxFormContainer.style.display = 'block';
        });
    }

    // LINE Button Click Tracking
    const lineBtn = document.getElementById('line-dx-btn');
    if (lineBtn) {
        lineBtn.addEventListener('click', (e) => {
            e.preventDefault(); // 404エラーページへの遷移を防ぐ
            if (typeof gtag === 'function') {
                gtag('event', 'click_line_reserve', {
                    event_category: 'DX_LINE',
                    event_label: 'LINE_Add_Friend'
                });
            }
            if (typeof fbq === 'function') {
                fbq('track', 'Contact', { method: 'LINE' });
            }
            console.log('[DX] LINE予約ボタンクリックイベント計測');
            showDxToast('【デモ機能】本番環境では、ここから店舗のLINE公式アカウント（友だち追加・予約画面）へ遷移します。');
        });
    }

    // DX Toast Function
    function showDxToast(msg) {
        const existingToast = document.querySelector('.dx-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'dx-toast';
        toast.textContent = msg;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 50);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }

    // --- AI Concierge Handler ---
    const aiTrigger = document.getElementById('ai-concierge-trigger');
    const aiChatWindow = document.getElementById('ai-chat-window');
    const aiChatClose = document.getElementById('ai-chat-close');
    const aiChatSend = document.getElementById('ai-chat-send');
    const aiChatInput = document.getElementById('ai-chat-input');
    const aiChatBody = document.getElementById('ai-chat-body');

    if (aiTrigger && aiChatWindow) {
        aiTrigger.addEventListener('click', () => {
            if (aiChatWindow.style.display === 'none') {
                aiChatWindow.style.display = 'flex';
                setTimeout(() => aiChatInput.focus(), 100);
            } else {
                aiChatWindow.style.display = 'none';
            }
        });
    }

    if (aiChatClose) {
        aiChatClose.addEventListener('click', () => {
            aiChatWindow.style.display = 'none';
        });
    }

    function sendAiMessage() {
        const query = aiChatInput.value.trim();
        if (!query) return;

        const userMsg = document.createElement('div');
        userMsg.className = 'ai-message ai-message-user';
        userMsg.textContent = query;
        aiChatBody.appendChild(userMsg);

        aiChatInput.value = '';
        aiChatBody.scrollTop = aiChatBody.scrollHeight;

        const loadingId = 'ai-loading-' + Date.now();
        const loading = document.createElement('div');
        loading.className = 'ai-loading';
        loading.id = loadingId;
        loading.textContent = 'AIが店舗情報を確認中...';
        aiChatBody.appendChild(loading);
        aiChatBody.scrollTop = aiChatBody.scrollHeight;

        setTimeout(() => {
            const currentLoading = document.getElementById(loadingId);
            if (currentLoading) currentLoading.remove();

            let reply = "申し訳ありません。その件については店舗（03-0000-0000）へ直接お問い合わせいただくか、LINE公式アカウントにてスタッフへお尋ねください。";

            if (query.match(/wifi|インターネット|電源|コンセント/i)) {
                reply = "当店は【無料高速Wi-Fi】および【全ての席に電源コンセント】を完備しております。リモートワークや読書にぜひご利用ください。";
            } else if (query.match(/予約|席/i)) {
                reply = "お席のご予約は、左側の『LINEで即時予約する』ボタン、またはSquare予約システムより24時間いつでもリアルタイムに確保可能です。";
            } else if (query.match(/おすすめ|メニュー|コーヒー/i)) {
                reply = "本日のイチオシは『ハンドドリップコーヒー（エチオピア）』です。ベリーのような華やかな香りと爽やかな酸味が特徴で、毎日店内で自家焙煎しております。";
            } else if (query.match(/アクセス|場所|駅/i)) {
                reply = "当店は押上駅 B3出口より徒歩3分、東京スカイツリーのすぐ近くの隠れ家的な路地にございます。アクセスセクションのGoogleマップをご参照ください。";
            }

            const botMsg = document.createElement('div');
            botMsg.className = 'ai-message ai-message-bot';
            botMsg.textContent = reply;
            aiChatBody.appendChild(botMsg);
            aiChatBody.scrollTop = aiChatBody.scrollHeight;
        }, 1000);
    }

    if (aiChatSend) {
        aiChatSend.addEventListener('click', sendAiMessage);
    }

    if (aiChatInput) {
        aiChatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendAiMessage();
            }
        });
    }

    // --- Headless CMS & Instagram Integration Sync Mock ---
    const MICROCMS_CONFIG = {
        serviceId: 'cafe-cozy-sample',
        apiKey: 'MICROCMS_API_KEY_PLACEHOLDER',
        endpoint: 'menu'
    };

    async function fetchLatestMenu() {
        try {
            console.log('[DX] microCMS自動同期チェック開始...');
            console.log('[DX] microCMS未接続（本番環境にてAPIキーを設定して動作します）');
        } catch (err) {
            console.warn('[DX] microCMS未接続:', err.message);
        }
    }

    function loadInstagramFeed() {
        console.log('[DX] Instagram Graph APIから最新の店舗投稿をバックグラウンドで同期中...');
    }

    fetchLatestMenu();
    loadInstagramFeed();


    // --- Scroll Triggered Fade-In Animations ---
    const fadeElements = document.querySelectorAll('.fade-in');

    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => {
        scrollObserver.observe(el);
    });
});
