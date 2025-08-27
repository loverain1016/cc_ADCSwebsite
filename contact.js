/**
 * MDVTA 聯絡表單 JavaScript
 * 處理表單提交、驗證和資料儲存
 * 
 * 功能：
 * - 即時表單驗證
 * - 字數統計
 * - 表單提交處理
 * - 成功訊息顯示
 * - Supabase 資料儲存
 */

// ================================
// Supabase 設定（與 auth.js 同步）
// ================================
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL',           // 替換為您的 Supabase URL
    anonKey: 'YOUR_SUPABASE_ANON_KEY'   // 替換為您的 Supabase anon key
};

// 初始化 Supabase
let supabase = null;
if (SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL') {
    supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}

// ================================
// DOM 載入完成後初始化
// ================================
document.addEventListener('DOMContentLoaded', function() {
    initializeContactForm();
    initializeFormValidation();
    initializeCharacterCount();
    initializeEventListeners();
    prefillFromSession();
});

// ================================
// 表單初始化
// ================================
function initializeContactForm() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
        form.addEventListener('reset', handleFormReset);
    }
}

function initializeFormValidation() {
    const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
    
    requiredFields.forEach(field => {
        // 失去焦點時驗證
        field.addEventListener('blur', function() {
            validateField(this);
        });
        
        // 輸入時清除錯誤
        field.addEventListener('input', function() {
            clearFieldError(this);
            
            // 即時驗證某些特殊欄位
            if (this.type === 'email' && this.value) {
                setTimeout(() => validateField(this), 500);
            }
        });
    });
    
    // 電話欄位格式化
    const phoneField = document.getElementById('contactPhone');
    if (phoneField) {
        phoneField.addEventListener('input', formatPhoneNumber);
    }
}

function initializeCharacterCount() {
    const messageField = document.getElementById('contactMessage');
    const charCountElement = document.getElementById('charCount');
    
    if (messageField && charCountElement) {
        messageField.addEventListener('input', function() {
            const length = this.value.length;
            const maxLength = 1000;
            
            charCountElement.textContent = length;
            
            // 更新樣式
            const parent = charCountElement.parentElement;
            parent.classList.remove('warning', 'error');
            
            if (length > maxLength * 0.8) {
                parent.classList.add('warning');
            }
            if (length >= maxLength) {
                parent.classList.add('error');
            }
        });
    }
}

function initializeEventListeners() {
    // 隱私政策連結
    const privacyLinks = document.querySelectorAll('.privacy-link');
    privacyLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showPrivacyModal();
        });
    });
    
    // 詢問類型變更時的自動建議
    const inquiryType = document.getElementById('inquiryType');
    if (inquiryType) {
        inquiryType.addEventListener('change', handleInquiryTypeChange);
    }
    
    // 重置按鈕確認
    const resetBtn = document.querySelector('button[type="reset"]');
    if (resetBtn) {
        resetBtn.addEventListener('click', function(e) {
            if (!confirm('確定要清空所有內容嗎？')) {
                e.preventDefault();
            }
        });
    }
}

// ================================
// 表單驗證功能
// ================================
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    // 清除之前的錯誤
    clearFieldError(field);

    // 必填欄位檢查
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
    // 電話格式檢查
    else if (fieldName === 'phone' && value) {
        if (!isValidPhone(value)) {
            errorMessage = '請輸入有效的電話號碼';
            isValid = false;
        }
    }
    // 姓名長度檢查
    else if (fieldName === 'name' && value) {
        if (value.length < 2) {
            errorMessage = '姓名至少需要 2 個字元';
            isValid = false;
        } else if (value.length > 50) {
            errorMessage = '姓名不能超過 50 個字元';
            isValid = false;
        }
    }
    // 主旨長度檢查
    else if (fieldName === 'subject' && value) {
        if (value.length < 5) {
            errorMessage = '主旨至少需要 5 個字元';
            isValid = false;
        } else if (value.length > 200) {
            errorMessage = '主旨不能超過 200 個字元';
            isValid = false;
        }
    }
    // 訊息長度檢查
    else if (fieldName === 'message' && value) {
        if (value.length < 10) {
            errorMessage = '訊息內容至少需要 10 個字元';
            isValid = false;
        } else if (value.length > 1000) {
            errorMessage = '訊息內容不能超過 1000 個字元';
            isValid = false;
        }
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        showFieldSuccess(field);
    }

    return isValid;
}

function validateForm() {
    const form = document.getElementById('contactForm');
    const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isFormValid = true;
    let firstInvalidField = null;

    // 檢查所有必填欄位
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isFormValid = false;
            if (!firstInvalidField) {
                firstInvalidField = field;
            }
        }
    });

    // 檢查隱私政策同意
    const agreePrivacy = document.getElementById('agreePrivacy');
    if (!agreePrivacy.checked) {
        showFieldError(agreePrivacy, '請同意隱私政策');
        isFormValid = false;
        if (!firstInvalidField) {
            firstInvalidField = agreePrivacy;
        }
    }

    // 檢查至少選擇一種聯絡方式
    const contactMethods = document.querySelectorAll('input[name="contactMethod"]:checked');
    if (contactMethods.length === 0) {
        showMessage('請至少選擇一種偏好聯絡方式', 'warning');
        isFormValid = false;
    }

    // 捲動到第一個錯誤欄位
    if (!isFormValid && firstInvalidField) {
        firstInvalidField.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        firstInvalidField.focus();
    }

    return isFormValid;
}

function showFieldError(field, message) {
    const formGroup = field.closest('.form-group') || field.closest('.checkbox-container').parentNode;
    const errorElement = formGroup.querySelector('.error-message');
    
    formGroup.classList.add('error');
    formGroup.classList.remove('success');
    
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearFieldError(field) {
    const formGroup = field.closest('.form-group') || field.closest('.checkbox-container').parentNode;
    const errorElement = formGroup.querySelector('.error-message');
    
    formGroup.classList.remove('error');
    
    if (errorElement) {
        errorElement.textContent = '';
    }
}

function showFieldSuccess(field) {
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        formGroup.classList.add('success');
        formGroup.classList.remove('error');
    }
}

// ================================
// 表單提交處理
// ================================
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }

    const formData = new FormData(e.target);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        company: formData.get('company'),
        inquiryType: formData.get('inquiryType'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        contactMethods: formData.getAll('contactMethod'),
        subscribeUpdates: formData.get('subscribeUpdates') === 'on'
    };

    setFormLoading(true);

    try {
        if (supabase) {
            // 使用 Supabase 儲存資料
            await saveToSupabase(contactData);
        } else {
            // 使用演示模式
            await simulateFormSubmit(contactData);
        }

        // 顯示成功訊息
        showSuccessMessage();
        
        // 儲存到 sessionStorage 供後續使用
        sessionStorage.setItem('lastContactForm', JSON.stringify(contactData));
        
        // 如果同意訂閱，處理電子報訂閱
        if (contactData.subscribeUpdates) {
            await handleNewsletterSubscription(contactData.email);
        }

    } catch (error) {
        console.error('Form submission error:', error);
        showMessage(error.message || '訊息傳送失敗，請稍後再試', 'error');
    } finally {
        setFormLoading(false);
    }
}

async function saveToSupabase(contactData) {
    // 檢查是否為會員
    let memberId = null;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        memberId = user.id;
    }

    // 儲存聯絡表單資料
    const { error } = await supabase
        .from('contact_forms')
        .insert({
            member_id: memberId,
            name: contactData.name,
            email: contactData.email,
            phone: contactData.phone,
            company: contactData.company,
            subject: contactData.subject,
            message: contactData.message,
            form_type: contactData.inquiryType,
            status: 'new',
            priority: getPriority(contactData.inquiryType)
        });

    if (error) {
        throw new Error('資料儲存失敗：' + error.message);
    }

    // 發送通知郵件（可選）
    await sendNotificationEmail(contactData);
}

async function simulateFormSubmit(contactData) {
    // 模擬 API 呼叫延遲
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 儲存到 localStorage（演示用）
    const existingSubmissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
    const submission = {
        ...contactData,
        id: Date.now(),
        submittedAt: new Date().toISOString(),
        status: 'new'
    };
    
    existingSubmissions.push(submission);
    localStorage.setItem('contactSubmissions', JSON.stringify(existingSubmissions));
    
    console.log('演示模式 - 表單已儲存:', submission);
}

function getPriority(inquiryType) {
    const priorityMap = {
        'technical': 'high',
        'partnership': 'high',
        'course': 'normal',
        'membership': 'normal',
        'event': 'normal',
        'feedback': 'low',
        'other': 'normal'
    };
    
    return priorityMap[inquiryType] || 'normal';
}

async function sendNotificationEmail(contactData) {
    // 這裡可以整合 Email 服務（如 Resend, SendGrid 等）
    // 暫時只記錄到 console
    console.log('通知郵件已發送給管理員:', {
        to: 'admin@mdvta.org.tw',
        subject: `新的聯絡表單：${contactData.subject}`,
        from: contactData.email,
        type: contactData.inquiryType
    });
}

async function handleNewsletterSubscription(email) {
    if (supabase) {
        try {
            const { error } = await supabase
                .from('newsletter_subscriptions')
                .upsert({
                    email: email,
                    is_active: true
                });

            if (error) {
                console.error('Newsletter subscription error:', error);
            }
        } catch (error) {
            console.error('Newsletter subscription failed:', error);
        }
    }
}

// ================================
// UI 控制功能
// ================================
function setFormLoading(loading) {
    const form = document.getElementById('contactForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    if (loading) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        loadingOverlay.classList.add('active');
        
        // 禁用所有表單欄位
        const fields = form.querySelectorAll('input, select, textarea, button');
        fields.forEach(field => field.disabled = true);
    } else {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        loadingOverlay.classList.remove('active');
        
        // 恢復所有表單欄位
        const fields = form.querySelectorAll('input, select, textarea, button');
        fields.forEach(field => field.disabled = false);
    }
}

function showSuccessMessage() {
    const form = document.getElementById('contactForm');
    const successPanel = document.getElementById('submitSuccess');
    
    form.style.display = 'none';
    successPanel.classList.add('active');
    
    // 捲動到成功訊息
    successPanel.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
}

function resetForm() {
    const form = document.getElementById('contactForm');
    const successPanel = document.getElementById('submitSuccess');
    
    // 重置表單
    form.reset();
    
    // 清除所有錯誤和成功狀態
    const formGroups = form.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.classList.remove('error', 'success');
        const errorElement = group.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
        }
    });
    
    // 重置字數統計
    const charCount = document.getElementById('charCount');
    if (charCount) {
        charCount.textContent = '0';
        charCount.parentElement.classList.remove('warning', 'error');
    }
    
    // 顯示表單，隱藏成功訊息
    form.style.display = 'flex';
    successPanel.classList.remove('active');
    
    // 捲動到表單頂部
    form.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

// ================================
// 輔助功能
// ================================
function handleFormReset(e) {
    // 延遲重置以確保表單已清空
    setTimeout(() => {
        // 重置字數統計
        const charCount = document.getElementById('charCount');
        if (charCount) {
            charCount.textContent = '0';
            charCount.parentElement.classList.remove('warning', 'error');
        }
        
        // 清除所有狀態
        const formGroups = document.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error', 'success');
            const errorElement = group.querySelector('.error-message');
            if (errorElement) {
                errorElement.textContent = '';
            }
        });
    }, 100);
}

function handleInquiryTypeChange(e) {
    const selectedType = e.target.value;
    const subjectField = document.getElementById('contactSubject');
    
    // 根據詢問類型提供建議主旨
    const suggestions = {
        'course': '課程相關諮詢',
        'membership': '會員權益問題',
        'partnership': '合作提案',
        'event': '活動報名諮詢',
        'technical': '技術問題反映',
        'feedback': '意見回饋',
        'other': ''
    };
    
    if (suggestions[selectedType] && !subjectField.value) {
        subjectField.placeholder = `例如：${suggestions[selectedType]}`;
    }
}

function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, ''); // 移除非數字字符
    
    // 台灣手機號碼格式化 (09XX-XXX-XXX)
    if (value.startsWith('09')) {
        if (value.length > 4 && value.length <= 7) {
            value = value.replace(/(\d{4})(\d+)/, '$1-$2');
        } else if (value.length > 7) {
            value = value.replace(/(\d{4})(\d{3})(\d+)/, '$1-$2-$3');
        }
    }
    // 市話格式化 (0X-XXXX-XXXX)
    else if (value.startsWith('0') && value.length > 1) {
        if (value.length > 2 && value.length <= 6) {
            value = value.replace(/(\d{2})(\d+)/, '$1-$2');
        } else if (value.length > 6) {
            value = value.replace(/(\d{2})(\d{4})(\d+)/, '$1-$2-$3');
        }
    }
    
    e.target.value = value;
}

function prefillFromSession() {
    // 如果用戶已登入，預填一些資料
    const authUser = localStorage.getItem('authUser');
    if (authUser) {
        try {
            const user = JSON.parse(authUser);
            const nameField = document.getElementById('contactName');
            const emailField = document.getElementById('contactEmail');
            
            if (nameField && user.name) {
                nameField.value = user.name;
            }
            if (emailField && user.email) {
                emailField.value = user.email;
            }
        } catch (error) {
            console.error('Error prefilling form:', error);
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
    // 移除格式字符後檢查
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^[\d]{8,11}$/;
    return phoneRegex.test(cleanPhone);
}

function showMessage(message, type = 'info') {
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
    
    switch(type) {
        case 'success':
            messageDiv.style.backgroundColor = '#10B981';
            break;
        case 'error':
            messageDiv.style.backgroundColor = '#EF4444';
            break;
        case 'warning':
            messageDiv.style.backgroundColor = '#F59E0B';
            break;
        default:
            messageDiv.style.backgroundColor = '#3B82F6';
    }
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        }, 300);
    }, 4000);
}

function showPrivacyModal() {
    // 簡化的隱私政策顯示
    const modalContent = `
        <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 600px; max-height: 80vh; overflow-y: auto;">
            <h3 style="color: var(--primary-color); margin-bottom: 1rem;">隱私政策</h3>
            <div style="line-height: 1.6; color: var(--text-secondary);">
                <h4>資料蒐集與使用</h4>
                <p>我們蒐集您提供的個人資料，用於回覆您的詢問、提供相關服務及改善我們的服務品質。</p>
                
                <h4>資料保護</h4>
                <p>我們採用適當的技術與管理措施保護您的個人資料安全。</p>
                
                <h4>資料分享</h4>
                <p>除法律要求外，我們不會將您的個人資料分享給第三方。</p>
                
                <h4>您的權利</h4>
                <p>您可以要求查閱、修改或删除您的個人資料。</p>
            </div>
            <div style="text-align: right; margin-top: 2rem;">
                <button onclick="closePrivacyModal()" style="background: var(--primary-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">我了解</button>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.id = 'privacyModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 1rem;
    `;
    modal.innerHTML = modalContent;
    
    // 點擊背景關閉
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closePrivacyModal();
        }
    });
    
    document.body.appendChild(modal);
}

function closePrivacyModal() {
    const modal = document.getElementById('privacyModal');
    if (modal) {
        document.body.removeChild(modal);
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

// 讓 resetForm 和 closePrivacyModal 成為全域函數
window.resetForm = resetForm;
window.closePrivacyModal = closePrivacyModal;

/**
 * 使用說明：
 * 
 * 1. 設定 Supabase：
 *    - 更新上方的 SUPABASE_CONFIG
 *    - 確保已執行 database-schema.sql
 * 
 * 2. 自訂功能：
 *    - 修改驗證規則：更新 validateField 函數
 *    - 新增欄位：更新表單和提交處理
 *    - 整合 Email 服務：修改 sendNotificationEmail 函數
 * 
 * 3. 演示模式：
 *    - 未設定 Supabase 時會使用本地儲存
 *    - 可在瀏覽器 Console 查看提交的資料
 */