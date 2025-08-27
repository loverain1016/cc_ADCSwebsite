-- MDVTA 會員系統資料庫架構
-- 這個檔案包含所有需要的資料表結構

-- 1. 會員資料表
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(10),
    occupation VARCHAR(100),
    company VARCHAR(100),
    address TEXT,
    
    -- 會員狀態
    member_level VARCHAR(20) DEFAULT 'basic', -- basic, premium, vip
    email_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- 時間戳記
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- 2. 電子報訂閱表
CREATE TABLE newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- 3. 聯絡表單提交記錄
CREATE TABLE contact_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    
    -- 基本資訊
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(100),
    
    -- 表單內容
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    form_type VARCHAR(50) DEFAULT 'general', -- general, course_inquiry, partnership
    
    -- 狀態追蹤
    status VARCHAR(20) DEFAULT 'new', -- new, in_progress, resolved, closed
    priority VARCHAR(10) DEFAULT 'normal', -- low, normal, high, urgent
    
    -- 時間戳記
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 課程資料表
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- health, sustainability, ai_application
    instructor VARCHAR(100),
    duration_hours INTEGER,
    max_participants INTEGER,
    price DECIMAL(10, 2),
    
    -- 課程時間
    start_date DATE,
    end_date DATE,
    schedule_info TEXT,
    location VARCHAR(200),
    
    -- 狀態
    status VARCHAR(20) DEFAULT 'draft', -- draft, published, full, cancelled, completed
    is_online BOOLEAN DEFAULT false,
    meeting_link VARCHAR(500),
    
    -- 時間戳記
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 課程報名記錄
CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    
    -- 報名資訊
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'registered', -- registered, attended, cancelled, completed
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, refunded
    
    -- 課程相關
    completion_rate DECIMAL(5, 2) DEFAULT 0,
    certificate_issued BOOLEAN DEFAULT false,
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    feedback_comment TEXT,
    
    -- 時間戳記
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 確保同一會員不能重複報名同一課程
    UNIQUE(member_id, course_id)
);

-- 6. 會員活動日誌
CREATE TABLE member_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    
    -- 活動資訊
    activity_type VARCHAR(50) NOT NULL, -- login, logout, profile_update, course_enroll, form_submit
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    
    -- 時間戳記
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 系統設定表
CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引提升查詢效能
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_created_at ON members(created_at);
CREATE INDEX idx_contact_forms_status ON contact_forms(status);
CREATE INDEX idx_contact_forms_submitted_at ON contact_forms(submitted_at);
CREATE INDEX idx_course_enrollments_member ON course_enrollments(member_id);
CREATE INDEX idx_course_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_member_activities_member ON member_activities(member_id);
CREATE INDEX idx_member_activities_type ON member_activities(activity_type);

-- 新增一些預設資料
INSERT INTO system_settings (key, value, description) VALUES
('site_name', 'MDVTA 中華多元職能交流發展協會', '網站名稱'),
('admin_email', 'admin@mdvta.org.tw', '管理員信箱'),
('newsletter_enabled', 'true', '是否啟用電子報功能'),
('registration_enabled', 'true', '是否開放新會員註冊'),
('max_course_enrollments', '50', '每門課程最大報名人數');

-- 建立觸發器：自動更新 updated_at 欄位
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 為需要的表格建立觸發器
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_enrollments_updated_at BEFORE UPDATE ON course_enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();