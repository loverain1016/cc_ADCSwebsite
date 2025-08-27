/**
 * MDVTA 會員系統 JavaScript
 * 處理登入、註冊、表單驗證和 Supabase 整合
 * 
 * 設定說明：
 * 1. 註冊 Supabase 帳號：https://supabase.com
 * 2. 建立新專案並取得 URL 和 API Key
 * 3. 執行 database-schema.sql 建立資料表
 * 4. 在下方 SUPABASE_CONFIG 填入您的設定
 */

// ================================
// Supabase 設定（請替換為您的設定）
// ================================
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL',           // 替換為您的 Supabase URL
    anonKey: 'YOUR_SUPABASE_ANON_KEY'   // 替換為您的 Supabase anon key
};

// 初始化 Supabase（如果設定正確）
let supabase = null;
if (typeof window !== 'undefined' && window.supabase && SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL') {
    supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}

// ================================
// DOM 元素和全域變數
// ================================
let currentAuthMode = 'login';

// DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('DOM 載入完成，開始初始化');
        initializeAuthPage();
        initializeFormValidation();
        initializeEventListeners();
        checkAuthStatus();
        console.log('初始化完成');
    } catch (error) {
        console.error('初始化錯誤:', error);
        showMessage('頁面初始化失敗，請重新整理頁面', 'error');
    }
});

// ================================
// 頁面初始化
// ================================
function initializeAuthPage() {
    // 檢查 URL 參數決定顯示登入或註冊
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    
    if (mode === 'register') {
        showRegister();
    } else {
        showLogin();
    }
}

function initializeEventListeners() {
    try {
        console.log('開始設定事件監聽器');
        
        // 表單切換
        document.querySelectorAll('.auth-switch').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = this.dataset.target;
                if (target === 'register') {
                    showRegister();
                } else {
                    showLogin();
                }
            });
        });

    // 導覽列切換按鈕
    const authToggle = document.querySelector('.auth-toggle');
    if (authToggle) {
        authToggle.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentAuthMode === 'login') {
                showRegister();
            } else {
                showLogin();
            }
        });
    }

    // 密碼顯示/隱藏
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const input = document.getElementById(targetId);
            
            if (input.type === 'password') {
                input.type = 'text';
                this.textContent = '🙈';
            } else {
                input.type = 'password';
                this.textContent = '👁️';
            }
        });
    });

    // 表單提交
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);

    // 密碼強度檢查
    const registerPassword = document.getElementById('registerPassword');
    if (registerPassword) {
        registerPassword.addEventListener('input', checkPasswordStrength);
    }

    // 確認密碼檢查
    const confirmPassword = document.getElementById('confirmPassword');
    if (confirmPassword) {
        confirmPassword.addEventListener('input', checkPasswordMatch);
    }

    // 服務條款模態框
    initializeModal();
    
    console.log('事件監聽器設定完成');
    } catch (error) {
        console.error('設定事件監聽器時發生錯誤:', error);
        showMessage('功能初始化失敗，請重新整理頁面', 'error');
    }
}

// ================================
// 頁面切換功能
// ================================
function showLogin() {
    document.getElementById('login-form').classList.add('active');
    document.getElementById('register-form').classList.remove('active');
    document.getElementById('success-message').classList.remove('active');
    
    const authToggle = document.querySelector('.auth-toggle');
    if (authToggle) {
        authToggle.textContent = '註冊';
    }
    
    currentAuthMode = 'login';
    window.history.replaceState({}, '', 'auth.html');
}

function showRegister() {
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('register-form').classList.add('active');
    document.getElementById('success-message').classList.remove('active');
    
    const authToggle = document.querySelector('.auth-toggle');
    if (authToggle) {
        authToggle.textContent = '登入';
    }
    
    currentAuthMode = 'register';
    window.history.replaceState({}, '', 'auth.html?mode=register');
}

function showSuccessMessage() {
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('register-form').classList.remove('active');
    document.getElementById('success-message').classList.add('active');
}

// ================================
// 表單驗證
// ================================
function initializeFormValidation() {
    // 即時驗證
    const inputs = document.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearError(this);
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    // 清除之前的錯誤
    clearError(field);

    // 基本必填檢查
    if (field.required && !value) {
        errorMessage = '此欄位為必填';
        isValid = false;
    } 
    // Email 格式檢查
    else if (fieldName === 'email' && value) {
        if (!isValidEmail(value)) {
            errorMessage = '請輸入有效的電子郵件格式';
            isValid = false;
        }
    }
    // 密碼強度檢查
    else if (fieldName === 'password' && value) {
        const strength = getPasswordStrength(value);
        if (strength.score < 2) {
            errorMessage = '密碼強度太弱，請包含字母、數字和特殊字元';
            isValid = false;
        }
    }
    // 電話格式檢查
    else if (fieldName === 'phone' && value) {
        if (!isValidPhone(value)) {
            errorMessage = '請輸入有效的電話號碼';
            isValid = false;
        }
    }
    // 姓名格式檢查
    else if (fieldName === 'name' && value) {
        if (value.length < 2) {
            errorMessage = '姓名至少需要 2 個字元';
            isValid = false;
        }
    }

    if (!isValid) {
        showError(field, errorMessage);
    } else {
        showSuccess(field);
    }

    return isValid;
}

function validateForm(formId) {
    const form = document.getElementById(formId);
    const requiredFields = form.querySelectorAll('input[required]');
    let isFormValid = true;

    // 檢查所有必填欄位
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isFormValid = false;
        }
    });

    // 特殊檢查：確認密碼
    if (formId === 'registerForm') {
        const password = document.getElementById('registerPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        const agreeTerms = document.getElementById('agreeTerms');

        if (password.value !== confirmPassword.value) {
            showError(confirmPassword, '密碼不一致');
            isFormValid = false;
        }

        if (!agreeTerms.checked) {
            showError(agreeTerms, '請同意服務條款');
            isFormValid = false;
        }
    }

    return isFormValid;
}

function showError(field, message) {
    const formGroup = field.closest('.form-group') || field.closest('.checkbox-container').parentNode;
    const errorElement = formGroup.querySelector('.error-message');
    
    formGroup.classList.add('error');
    formGroup.classList.remove('success');
    
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearError(field) {
    const formGroup = field.closest('.form-group') || field.closest('.checkbox-container').parentNode;
    const errorElement = formGroup.querySelector('.error-message');
    
    formGroup.classList.remove('error');
    
    if (errorElement) {
        errorElement.textContent = '';
    }
}

function showSuccess(field) {
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        formGroup.classList.add('success');
        formGroup.classList.remove('error');
    }
}

// ================================
// 密碼功能
// ================================
function checkPasswordStrength() {
    const password = document.getElementById('registerPassword').value;
    const strengthElement = document.getElementById('passwordStrength');
    const strength = getPasswordStrength(password);
    
    if (!password) {
        strengthElement.className = 'password-strength';
        strengthElement.textContent = '';
        return;
    }
    
    strengthElement.className = `password-strength ${strength.level}`;
    strengthElement.textContent = strength.text;
}

function getPasswordStrength(password) {
    let score = 0;
    let text = '';
    let level = '';

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    switch (score) {
        case 0:
        case 1:
        case 2:
            text = '弱';
            level = 'weak';
            break;
        case 3:
        case 4:
            text = '中等';
            level = 'medium';
            break;
        case 5:
            text = '強';
            level = 'strong';
            break;
    }

    return { score, text, level };
}

function checkPasswordMatch() {
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (confirmPassword && password !== confirmPassword) {
        showError(document.getElementById('confirmPassword'), '密碼不一致');
    } else if (confirmPassword) {
        clearError(document.getElementById('confirmPassword'));
    }
}

// ================================
// 登入功能
// ================================
async function handleLogin(e) {
    e.preventDefault();
    
    if (!validateForm('loginForm')) {
        return;
    }

    const form = e.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    const remember = formData.get('remember');

    setButtonLoading('loginForm', true);

    try {
        if (supabase) {
            // 使用 Supabase 登入
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                throw new Error(error.message);
            }

            // 登入成功
            showMessage('登入成功！', 'success');
            
            // 記住登入狀態
            if (remember) {
                localStorage.setItem('rememberLogin', 'true');
            }

            // 記錄活動
            await logMemberActivity('login', '會員登入');

            // 重導向
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);

        } else {
            // 模擬登入（開發模式）
            await simulateLogin(email, password);
        }

    } catch (error) {
        console.error('Login error:', error);
        showMessage(error.message || '登入失敗，請檢查您的帳號密碼', 'error');
    } finally {
        setButtonLoading('loginForm', false);
    }
}

async function simulateLogin(email, password) {
    // 模擬 API 呼叫延遲
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 簡單的演示邏輯
    if (email === 'demo@mdvta.org.tw' && password === 'demo123') {
        showMessage('登入成功！（演示模式）', 'success');
        localStorage.setItem('authUser', JSON.stringify({ email, name: '演示用戶' }));
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        throw new Error('帳號或密碼錯誤（請嘗試 demo@mdvta.org.tw / demo123）');
    }
}

// ================================
// 註冊功能
// ================================
async function handleRegister(e) {
    e.preventDefault();
    
    console.log('註冊表單提交開始');
    
    if (!validateForm('registerForm')) {
        console.log('表單驗證失敗');
        return;
    }

    const form = e.target;
    const formData = new FormData(form);
    
    const userData = {
        email: formData.get('email'),
        password: formData.get('password'),
        name: formData.get('name'),
        phone: formData.get('phone') || '',
        occupation: formData.get('occupation') || '',
        company: formData.get('company') || '',
        subscribeNewsletter: formData.get('subscribeNewsletter') === 'on'
    };

    console.log('使用者資料:', userData);

    setButtonLoading('registerForm', true);

    try {
        if (supabase) {
            console.log('使用 Supabase 註冊');
            // 使用 Supabase 註冊
            const { data, error } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        full_name: userData.name,
                        phone: userData.phone,
                        occupation: userData.occupation,
                        company: userData.company
                    }
                }
            });

            if (error) {
                throw new Error(error.message);
            }

            // 儲存會員詳細資料
            await saveMemberDetails(data.user.id, userData);
            
            // 處理電子報訂閱
            if (userData.subscribeNewsletter) {
                await subscribeNewsletter(userData.email, data.user.id);
            }

        } else {
            console.log('使用演示模式註冊');
            // 模擬註冊（開發模式）
            await simulateRegister(userData);
        }

        // 註冊成功
        console.log('註冊成功，顯示成功訊息');
        showSuccessMessage();
        
    } catch (error) {
        console.error('Registration error:', error);
        showMessage(error.message || '註冊失敗，請稍後再試', 'error');
    } finally {
        setButtonLoading('registerForm', false);
    }
}

async function simulateRegister(userData) {
    // 模擬 API 呼叫延遲
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 簡單檢查 email 是否已存在
    const existingUsers = JSON.parse(localStorage.getItem('demoUsers') || '[]');
    if (existingUsers.some(user => user.email === userData.email)) {
        throw new Error('此電子郵件已被註冊');
    }
    
    // 儲存到 localStorage（演示用）
    existingUsers.push({
        ...userData,
        id: Date.now(),
        created_at: new Date().toISOString()
    });
    localStorage.setItem('demoUsers', JSON.stringify(existingUsers));
}

async function saveMemberDetails(userId, userData) {
    const { error } = await supabase
        .from('members')
        .upsert({
            id: userId,
            email: userData.email,
            full_name: userData.name,
            phone: userData.phone,
            occupation: userData.occupation,
            company: userData.company
        });

    if (error) {
        console.error('Error saving member details:', error);
    }
}

async function subscribeNewsletter(email, memberId = null) {
    if (supabase) {
        const { error } = await supabase
            .from('newsletter_subscriptions')
            .insert({
                email,
                member_id: memberId
            });

        if (error) {
            console.error('Error subscribing to newsletter:', error);
        }
    }
}

// ================================
// 工具函數
// ================================
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]{8,15}$/;
    return phoneRegex.test(phone);
}

function setButtonLoading(formId, loading) {
    const form = document.getElementById(formId);
    const button = form.querySelector('button[type="submit"]');
    const btnText = button.querySelector('.btn-text');
    const btnLoading = button.querySelector('.btn-loading');
    
    if (loading) {
        button.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'block';
        showLoadingOverlay(true);
    } else {
        button.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
        showLoadingOverlay(false);
    }
}

function showLoadingOverlay(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

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
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease;
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
    
    document.body.appendChild(messageDiv);
    
    // 3秒後自動移除
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// ================================
// 模態框功能
// ================================
function initializeModal() {
    const modal = document.getElementById('termsModal');
    const termsLinks = document.querySelectorAll('.terms-link, .privacy-link');
    const closeButtons = document.querySelectorAll('.modal-close');

    termsLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.add('active');
        });
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            modal.classList.remove('active');
        });
    });

    // 點擊背景關閉
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// ================================
// 會員狀態檢查
// ================================
async function checkAuthStatus() {
    if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // 已登入用戶，可以重導向或顯示不同內容
            console.log('User is logged in:', user);
        }
    } else {
        // 檢查演示模式的登入狀態
        const authUser = localStorage.getItem('authUser');
        if (authUser) {
            console.log('Demo user logged in:', JSON.parse(authUser));
        }
    }
}

async function logMemberActivity(activityType, description) {
    if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { error } = await supabase
                .from('member_activities')
                .insert({
                    member_id: user.id,
                    activity_type: activityType,
                    description: description,
                    ip_address: await getUserIP(),
                    user_agent: navigator.userAgent
                });

            if (error) {
                console.error('Error logging activity:', error);
            }
        }
    }
}

async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return null;
    }
}

// ================================
// 全域錯誤處理
// ================================
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled Promise Rejection:', e.reason);
});

/**
 * 使用說明：
 * 
 * 1. 設定 Supabase：
 *    - 註冊 https://supabase.com
 *    - 建立專案並取得 URL 和 API Key
 *    - 執行 database-schema.sql
 *    - 更新上方的 SUPABASE_CONFIG
 * 
 * 2. 演示模式：
 *    - 如果未設定 Supabase，將使用本地演示模式
 *    - 演示帳號：demo@mdvta.org.tw / demo123
 * 
 * 3. 自訂功能：
 *    - 修改驗證規則：updateValidator functions
 *    - 新增欄位：更新表單和 handleRegister function
 *    - 整合第三方服務：修改相關 API 呼叫
 */