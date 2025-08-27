/**
 * MDVTA Landing Page JavaScript
 * 實現平滑滾動與進場動畫功能
 * 
 * 如何客製化：
 * 1. 替換圖片：修改 HTML 中的 img src 屬性，或 CSS 中的 background-image
 * 2. 修改文案：直接編輯 HTML 中的文字內容
 * 3. 更換連結：修改 HTML 中的 href 屬性
 * 4. 調整顏色：修改 styles.css 中的 CSS 變數（:root 區塊）
 * 5. Google 表單：取消註解 HTML 中的 iframe 區塊並填入您的表單連結
 */

// DOM 載入完成後執行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有功能
    initSmoothScrolling();
    initRevealAnimation();
    initNavbarScrollEffect();
    initThemeCarousel();
    initNewsletterForm();
    initServiceButtons();
});

/**
 * 平滑滾動功能
 * 點擊導覽連結時平滑滾動到對應區塊
 */
function initSmoothScrolling() {
    // 取得所有導覽連結
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * 進場動畫功能
 * 使用 Intersection Observer 實現滾動時的淡入效果
 */
function initRevealAnimation() {
    // 檢查瀏覽器是否支援 Intersection Observer
    if (!('IntersectionObserver' in window)) {
        // 如果不支援，直接顯示所有元素
        const revealElements = document.querySelectorAll('.reveal');
        revealElements.forEach(el => el.classList.add('visible'));
        return;
    }
    
    // 建立 Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // 一旦元素出現就停止觀察，提升效能
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // 觀察所有需要進場動畫的元素
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));
}

/**
 * 導覽列滾動效果
 * 滾動時改變導覽列的透明度
 */
function initNavbarScrollEffect() {
    const navbar = document.querySelector('.navbar');
    let ticking = false;
    
    function updateNavbar() {
        const scrolled = window.scrollY;
        const opacity = Math.min(0.95, 0.8 + (scrolled / 500) * 0.15);
        
        navbar.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
        ticking = false;
    }
    
    function requestNavbarUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestNavbarUpdate, { passive: true });
}

/**
 * 主題輪播功能
 * 點擊圓點切換主題卡片顯示（可擴展為自動輪播）
 */
function initThemeCarousel() {
    const dots = document.querySelectorAll('.theme-dots .dot');
    const themeCards = document.querySelectorAll('.theme-card');
    
    // 為每個圓點添加點擊事件
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            // 移除所有 active 類別
            dots.forEach(d => d.classList.remove('active'));
            
            // 添加 active 到被點擊的圓點
            dot.classList.add('active');
            
            // 這裡可以添加卡片切換邏輯
            // 例如高亮顯示對應的卡片
            themeCards.forEach((card, cardIndex) => {
                if (cardIndex === index) {
                    card.style.transform = 'scale(1.02)';
                    card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                } else {
                    card.style.transform = 'scale(1)';
                    card.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                }
            });
        });
    });
}

/**
 * 電子報訂閱表單
 * 處理表單提交（可連接到實際的 API）
 */
function initNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    const emailInput = document.querySelector('.newsletter-input');
    const submitBtn = newsletterForm?.querySelector('.btn-primary');
    
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        // 簡單的 email 驗證
        if (!isValidEmail(email)) {
            showMessage('請輸入有效的電子郵件地址', 'error');
            return;
        }
        
        // 模擬 API 調用
        submitBtn.textContent = '訂閱中...';
        submitBtn.disabled = true;
        
        // 這裡可以替換為實際的 API 調用
        setTimeout(() => {
            showMessage('訂閱成功！感謝您的加入', 'success');
            emailInput.value = '';
            submitBtn.textContent = '訂閱電子報';
            submitBtn.disabled = false;
        }, 1500);
    });
}

/**
 * 服務按鈕互動效果
 * 為服務區塊的按鈕添加點擊效果
 */
function initServiceButtons() {
    const serviceButtons = document.querySelectorAll('.service-btn');
    
    serviceButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有按鈕的 active 狀態
            serviceButtons.forEach(b => b.classList.remove('active'));
            
            // 添加 active 到被點擊的按鈕
            this.classList.add('active');
            
            // 這裡可以添加更多邏輯，例如顯示對應的課程內容
            const serviceName = this.textContent;
            console.log(`點擊了服務: ${serviceName}`);
            
            // 可以在這裡添加跳轉到課程詳情頁或彈出視窗的邏輯
            // 例如：window.open(`/courses/${serviceName}`, '_blank');
        });
        
        // 添加 CSS 樣式給 active 按鈕
        const style = document.createElement('style');
        style.textContent = `
            .service-btn.active {
                background: rgba(255, 255, 255, 0.3) !important;
                border-color: #fff !important;
                transform: scale(1.05);
            }
        `;
        document.head.appendChild(style);
    });
}

/**
 * 工具函數：驗證 email 格式
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * 工具函數：顯示訊息
 * 可用於顯示成功或錯誤訊息
 */
function showMessage(message, type = 'info') {
    // 創建訊息元素
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    // 根據類型設置顏色
    switch(type) {
        case 'success':
            messageDiv.style.backgroundColor = '#10B981';
            break;
        case 'error':
            messageDiv.style.backgroundColor = '#EF4444';
            break;
        default:
            messageDiv.style.backgroundColor = '#3B82F6';
    }
    
    // 添加動畫樣式
    if (!document.querySelector('#message-animations')) {
        const animationStyle = document.createElement('style');
        animationStyle.id = 'message-animations';
        animationStyle.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(animationStyle);
    }
    
    document.body.appendChild(messageDiv);
    
    // 3秒後自動移除
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

/**
 * 錯誤處理
 * 全域錯誤捕獲，避免 JavaScript 錯誤影響頁面運作
 */
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    // 在開發環境中可以顯示錯誤訊息
    // showMessage('發生了一個小錯誤，但不影響網站使用', 'error');
});

/**
 * 效能優化：防抖函數
 * 用於限制函數執行頻率，提升滾動效能
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 滾動到頂部按鈕（可選功能）
 * 取消註解以啟用回到頂部功能
 */
/*
function initScrollToTop() {
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '↑';
    scrollToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border: none;
        border-radius: 50%;
        background: var(--primary-color);
        color: white;
        font-size: 18px;
        cursor: pointer;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(scrollToTopBtn);
    
    const toggleScrollBtn = debounce(() => {
        if (window.scrollY > 300) {
            scrollToTopBtn.style.opacity = '1';
            scrollToTopBtn.style.visibility = 'visible';
        } else {
            scrollToTopBtn.style.opacity = '0';
            scrollToTopBtn.style.visibility = 'hidden';
        }
    }, 100);
    
    window.addEventListener('scroll', toggleScrollBtn, { passive: true });
    
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
// initScrollToTop(); // 取消註解以啟用
*/