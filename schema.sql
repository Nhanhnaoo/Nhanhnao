-- 1. Tạo bảng cấu hình hệ thống
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- 2. Tạo bảng chuyên mục bài viết (Đã sửa lỗi NOT NULL ở đây)
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color_code TEXT
);

-- 3. Tạo bảng bài viết chi tiết
CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    title TEXT,
    slug TEXT UNIQUE,
    sapo TEXT,
    content TEXT,
    image_url TEXT,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 4. Chèn dữ liệu mẫu ban đầu để tránh trống dữ liệu
INSERT OR IGNORE INTO settings (key, value) VALUES ('home_limit', '5');
INSERT OR IGNORE INTO settings (key, value) VALUES ('category_limit', '10');
INSERT OR IGNORE INTO categories (id, name, color_code) VALUES (1, 'Khoa học', '#dc2626');