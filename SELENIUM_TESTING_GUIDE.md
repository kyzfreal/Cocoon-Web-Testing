# 🧪 Hướng dẫn Kiểm thử Selenium cho Website Cocoon

## Mục lục
1. [Tổng quan](#tổng-quan)
2. [Chuẩn bị môi trường](#chuẩn-bị-môi-trường)
3. [Cấu trúc bộ test](#cấu-trúc-bộ-test)
4. [Các Locator quan trọng](#các-locator-quan-trọng)
5. [Chạy test](#chạy-test)
6. [Giải thích chi tiết từng test case](#giải-thích-chi-tiết-từng-test-case)

---

## Tổng quan

Website Cocoon đã được thiết kế **tối ưu cho automation testing** với:
- ✅ Tất cả phần tử tương tác đều có `id` hoặc `class` cố định
- ✅ Dữ liệu lưu bằng `localStorage` (giữ trạng thái giữa các lần tải trang)
- ✅ Có sẵn tài khoản Admin: `admin@cocoon.vn` / `admin123`
- ✅ 8 sản phẩm mẫu với đầy đủ trạng thái (còn hàng, hết hàng, khuyến mãi)
- ✅ Hơn 40 test cases đã viết sẵn

---

## Chuẩn bị môi trường

### Bước 1: Build website

```bash
# Từ thư mục gốc project
npm run build
```

### Bước 2: Serve website trên localhost

```bash
# Cách 1: Dùng npx serve
npx serve dist -p 3000

# Cách 2: Dùng Python
cd dist && python -m http.server 3000

# Cách 3: Dùng http-server
npx http-server dist -p 3000
```

Website sẽ chạy tại: `http://localhost:3000`

### Bước 3: Cài đặt Python dependencies

```bash
cd selenium-tests
pip install -r requirements.txt
```

### Bước 4: Kiểm tra Chrome đã cài

Đảm bảo Google Chrome đã được cài trên máy. `webdriver-manager` sẽ tự động tải ChromeDriver phù hợp.

---

## Cấu trúc bộ test

```
selenium-tests/
├── README.md              # Hướng dẫn chi tiết (tiếng Anh)
├── requirements.txt       # Dependencies
├── conftest.py           # Fixtures (driver, user login, etc.)
└── test_cocoon.py        # 40+ test cases
```

### Các nhóm test:

| Nhóm | Số TC | Mô tả |
|------|-------|-------|
| Authentication | 8 | Đăng ký, đăng nhập, quên mật khẩu, đăng xuất |
| Search & Filter | 5 | Tìm kiếm, lọc danh mục |
| Product Display | 4 | Hiển thị badge, modal chi tiết |
| Shopping Cart | 5 | Thêm/xóa/cập nhật giỏ hàng |
| Checkout & Order | 6 | Đặt hàng, voucher, phí ship |
| Order History | 2 | Xem lịch sử đơn hàng |
| Admin Panel | 3 | Quản trị đơn hàng, user |
| User Profile | 3 | Cập nhật thông tin, đổi mật khẩu |
| Edge Cases | 3 | Kiểm tra biên |

---

## Các Locator quan trọng

### 🔐 Authentication
| Element | Locator Strategy | Selenium Code |
|---------|-----------------|---------------|
| Modal Auth | ID | `By.id("auth-modal")` |
| Input Họ tên (Đăng ký) | ID | `By.id("reg-name")` |
| Input Email/SĐT (Đăng ký) | ID | `By.id("reg-email-phone")` |
| Input Mật khẩu (Đăng ký) | ID | `By.id("reg-pass")` |
| Lỗi đăng ký | ID | `By.id("reg-error")` |
| Input Đăng nhập | ID | `By.id("login-id")` |
| Input Mật khẩu (Login) | ID | `By.id("login-pass")` |
| Nút Đăng nhập | ID | `By.id("btn-login")` |
| Lỗi đăng nhập | ID | `By.id("login-error")` |
| Nút Quên MK | ID | `By.id("btn-forgot-pass")` |
| Nút Đăng xuất | ID | `By.id("btn-logout")` |

### 🔍 Search & Filter
| Element | Locator Strategy | Selenium Code |
|---------|-----------------|---------------|
| Ô tìm kiếm | ID | `By.id("search-input")` |
| Nút Tìm | ID | `By.id("btn-search")` |
| Nút danh mục | Class | `By.className("category-filter")` |

### 🛒 Giỏ hàng
| Element | Locator Strategy | Selenium Code |
|---------|-----------------|---------------|
| Nút Thêm SP (p1) | ID | `By.id("btn-add-cart-p1")` |
| Nút giỏ hàng | ID | `By.id("btn-cart")` |
| Modal giỏ | ID | `By.id("cart-modal")` |
| Input số lượng | Class | `By.className("cart-qty-input")` |
| Nút xóa | Class | `By.className("btn-delete-cart-item")` |
| Tổng tiền | ID | `By.id("cart-total-price")` |

### 💳 Thanh toán
| Element | Locator Strategy | Selenium Code |
|---------|-----------------|---------------|
| Section checkout | ID | `By.id("checkout-section")` |
| Input Họ tên | ID | `By.id("checkout-name")` |
| Input SĐT | ID | `By.id("checkout-phone")` |
| Input Địa chỉ | ID | `By.id("checkout-address")` |
| Input Voucher | ID | `By.id("coupon-input")` |
| Nút Áp dụng | ID | `By.id("btn-apply-coupon")` |
| Phí vận chuyển | ID | `By.id("shipping-fee")` |
| PT Thanh toán | Name | `By.name("payment-method")` |
| Nút Đặt hàng | ID | `By.id("btn-submit-order")` |
| TB Thành công | ID | `By.id("order-success-msg")` |

### 👤 Quản lý
| Element | Locator Strategy | Selenium Code |
|---------|-----------------|---------------|
| Lịch sử đơn | ID | `By.id("order-history-section")` |
| Admin Panel | ID | `By.id("admin-panel")` |
| DS đơn (Admin) | ID | `By.id("admin-order-list")` |
| Profile | ID | `By.id("user-profile-section")` |

---

## Chạy test

### Chạy tất cả test
```bash
cd selenium-tests
pytest test_cocoon.py -v
```

### Chạy với báo cáo HTML
```bash
pytest test_cocoon.py -v --html=report.html --self-contained-html
```
Mở `report.html` bằng browser để xem kết quả.

### Chạy headless (CI/CD)
```bash
pytest test_cocoon.py -v --headless
```

### Chạy từng nhóm
```bash
# Chỉ test Authentication
pytest test_cocoon.py -v -k "TestAuthentication"

# Chỉ test Cart
pytest test_cocoon.py -v -k "TestShoppingCart"

# Chỉ test Checkout
pytest test_cocoon.py -v -k "TestCheckoutAndOrder"
```

### Debug mode (chạy chậm)
```bash
pytest test_cocoon.py -v --slow
```

---

## Giải thích chi tiết từng test case

### 1. Test Đăng ký (TC-AUTH-02)
```python
def test_register_new_user_success(self, driver):
    # 1. Mở modal
    driver.find_element(By.ID, "btn-open-auth").click()
    
    # 2. Chuyển tab Đăng ký
    driver.find_element(By.XPATH, "//button[contains(text(), 'Đăng ký')]").click()
    
    # 3. Điền form
    driver.find_element(By.ID, "reg-name").send_keys("Nguyen Van A")
    driver.find_element(By.ID, "reg-email-phone").send_keys("test@example.com")
    driver.find_element(By.ID, "reg-pass").send_keys("password123")
    
    # 4. Submit
    driver.find_element(By.XPATH, "//button[contains(text(), 'Đăng ký')]").click()
    
    # 5. Assert: chuyển sang tab đăng nhập
    time.sleep(1)
```

### 2. Test Tìm kiếm (TC-SEARCH-01)
```python
def test_search_by_product_name(self, driver):
    # 1. Nhập từ khóa
    driver.find_element(By.ID, "search-input").send_keys("cà phê")
    time.sleep(1)
    
    # 2. Kiểm tra kết quả
    products = driver.find_elements(By.CLASS_NAME, "product-card")
    assert len(products) > 0
```

### 3. Test Thêm giỏ hàng (TC-CART-01)
```python
def test_add_to_cart(self, driver):
    # 1. Thêm SP
    driver.find_element(By.ID, "btn-add-cart-p1").click()
    time.sleep(0.5)
    
    # 2. Mở giỏ
    driver.find_element(By.ID, "btn-cart").click()
    time.sleep(0.5)
    
    # 3. Kiểm tra
    cart = driver.find_element(By.ID, "cart-modal")
    assert cart.is_displayed()
```

### 4. Test Đặt hàng (TC-CHECKOUT-05)
```python
def test_place_order_success(self, driver):
    # ... (login, add to cart, open checkout)
    
    # Điền thông tin
    driver.find_element(By.ID, "checkout-name").send_keys("Test Customer")
    driver.find_element(By.ID, "checkout-phone").send_keys("0987654321")
    driver.find_element(By.ID, "checkout-address").send_keys("123 ABC, TP.HCM")
    
    # Đặt hàng
    driver.find_element(By.ID, "btn-submit-order").click()
    time.sleep(1)
    
    # Kiểm tra thành công
    msg = driver.find_element(By.ID, "order-success-msg")
    assert "ORD-" in msg.text
```

### 5. Test Admin cập nhật trạng thái (TC-ADMIN-03)
```python
def test_admin_update_order_status(self, driver):
    # Login admin
    # ...
    
    # Mở admin panel
    driver.find_element(By.ID, "btn-admin").click()
    time.sleep(1)
    
    # Tìm dropdown trạng thái
    selects = driver.find_elements(By.CSS_SELECTOR, "#admin-panel select")
    
    # Cập nhật trạng thái
    from selenium.webdriver.support.ui import Select
    select = Select(selects[0])
    select.select_by_value("shipping")  # Đang giao
```

---

## Mẹo viết Selenium test cho website này

### ✅ Nên làm:
1. **Dùng `By.ID`** khi có thể - nhanh và chính xác nhất
2. **Dùng `WebDriverWait`** cho các phần tử dynamic:
   ```python
   from selenium.webdriver.support.ui import WebDriverWait
   from selenium.webdriver.support import expected_conditions as EC
   
   element = WebDriverWait(driver, 10).until(
       EC.presence_of_element_located((By.ID, "order-success-msg"))
   )
   ```
3. **Dùng `time.sleep()`** sau các action có animation/modal
4. **Clear input trước khi send_keys**:
   ```python
   input_field.clear()
   input_field.send_keys("new value")
   ```

### ❌ Tránh:
1. Không dùng XPath phức tạp khi đã có ID
2. Không hard-code thời gian chờ quá dài
3. Không quên teardown driver (dùng fixture)

---

## Tài khoản test

| Vai trò | Email/SĐT | Mật khẩu |
|---------|-----------|----------|
| Admin | admin@cocoon.vn | admin123 |
| User | (tự đăng ký) | (tự đặt) |

---

## Troubleshooting

### Lỗi: "Element not found"
- Kiểm tra website đã chạy tại `http://localhost:3000`
- Tăng `implicitly_wait` hoặc dùng `WebDriverWait`
- Kiểm tra đúng ID/class

### Lỗi: "Element not interactable"
- Thêm `time.sleep(0.5)` để đợi animation
- Scroll đến element: `driver.execute_script("arguments[0].scrollIntoView();", element)`

### Lỗi: ChromeDriver version mismatch
- Cập nhật ChromeDriver: `pip install --upgrade webdriver-manager`
- Hoặc chỉ định version cụ thể

---

## Liên hệ hỗ trợ

Nếu cần hỗ trợ thêm về automation testing, vui lòng tham khảo:
- [Selenium Python Docs](https://selenium-python.readthedocs.io/)
- [Pytest Documentation](https://docs.pytest.org/)
- Trang hướng dẫn Selenium trong website (nút "Hướng dẫn Selenium Test" ở footer)
