# Selenium Automation Test Suite - Cocoon Vietnam

## 📋 Tổng quan
Bộ test tự động cho website Cocoon sử dụng Selenium WebDriver + Python.

## 🛠️ Cài đặt môi trường

### 1. Cài đặt Python 3.8+
```bash
# Kiểm tra phiên bản Python
python --version

# Cài đặt pip (nếu chưa có)
# Windows: tải từ https://bootstrap.pypa.io/get-pip.py
# Linux/Mac:
sudo apt install python3-pip  # Ubuntu
brew install python3          # macOS
```

### 2. Cài đặt dependencies
```bash
cd selenium-tests
pip install -r requirements.txt
```

### 3. Cài đặt WebDriver
```bash
# Cài đặt ChromeDriver tự động qua webdriver-manager
# (Đã bao gồm trong requirements.txt)

# Hoặc cài thủ công:
# 1. Tải ChromeDriver phù hợp phiên bản Chrome:
#    https://chromedriver.chromium.org/downloads
# 2. Thêm vào PATH hoặc chỉ định đường dẫn trong test
```

### 4. Build và chạy website
```bash
# Từ thư mục gốc project
npm run build

# Serve website (chọn 1 trong các cách):
npx serve dist -p 3000
# hoặc
python -m http.server 3000 --directory dist
```

## 🚀 Chạy test

### Chạy tất cả test
```bash
pytest test_cocoon.py -v --html=report.html
```

### Chạy từng nhóm test
```bash
# Test đăng ký & đăng nhập
pytest test_cocoon.py -v -k "test_auth"

# Test tìm kiếm & lọc
pytest test_cocoon.py -v -k "test_search"

# Test giỏ hàng
pytest test_cocoon.py -v -k "test_cart"

# Test đặt hàng
pytest test_cocoon.py -v -k "test_checkout"

# Test admin
pytest test_cocoon.py -v -k "test_admin"
```

### Chạy với các tùy chọn
```bash
# Headless mode (không mở browser)
pytest test_cocoon.py --headless -v

# Chạy trên Firefox
pytest test_cocoon.py --browser firefox -v

# Chậm lại để quan sát (debug)
pytest test_cocoon.py --slow -v

# Xuất báo cáo HTML
pytest test_cocoon.py --html=report.html --self-contained-html
```

## 📁 Cấu trúc file
```
selenium-tests/
├── README.md              # File hướng dẫn này
├── requirements.txt       # Python dependencies
├── conftest.py           # Pytest fixtures & config
├── test_cocoon.py        # Test cases chính
├── pages/                # Page Object Model
│   ├── __init__.py
│   ├── base_page.py
│   ├── home_page.py
│   ├── auth_page.py
│   ├── cart_page.py
│   ├── checkout_page.py
│   └── admin_page.py
└── utils/
    ├── __init__.py
    └── helpers.py
```

## 📊 Báo cáo test
Sau khi chạy, báo cáo HTML sẽ được tạo tại `report.html`.
Mở file này bằng browser để xem kết quả chi tiết.

## ⚠️ Lưu ý
- Website cần được build và serve trước khi chạy test
- Đảm bảo Chrome/Firefox đã cài đặt
- URL mặc định: `http://localhost:3000`
- Tài khoản admin test: `admin@cocoon.vn` / `admin123`
