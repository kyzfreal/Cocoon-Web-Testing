import { useState } from 'react';

interface LocatorInfo {
  id: string;
  element: string;
  element_type: string;
  locator: string;
  description: string;
}

const LOCATORS: Record<string, LocatorInfo[]> = {
  'Authentication': [
    { id: 'auth-modal', element: 'Modal', element_type: 'id="auth-modal"', locator: 'By.id("auth-modal")', description: 'Modal đăng nhập/đăng ký' },
    { id: 'reg-name', element: 'Input', element_type: 'id="reg-name"', locator: 'By.id("reg-name")', description: 'Ô nhập họ tên đăng ký' },
    { id: 'reg-email-phone', element: 'Input', element_type: 'id="reg-email-phone"', locator: 'By.id("reg-email-phone")', description: 'Ô nhập Email/SĐT đăng ký' },
    { id: 'reg-pass', element: 'Input', element_type: 'id="reg-pass"', locator: 'By.id("reg-pass")', description: 'Ô nhập mật khẩu đăng ký' },
    { id: 'reg-error', element: 'Text', element_type: 'id="reg-error"', locator: 'By.id("reg-error")', description: 'Thông báo lỗi đăng ký' },
    { id: 'login-id', element: 'Input', element_type: 'id="login-id"', locator: 'By.id("login-id")', description: 'Ô nhập tên đăng nhập' },
    { id: 'login-pass', element: 'Input', element_type: 'id="login-pass"', locator: 'By.id("login-pass")', description: 'Ô nhập mật khẩu đăng nhập' },
    { id: 'btn-login', element: 'Button', element_type: 'id="btn-login"', locator: 'By.id("btn-login")', description: 'Nút đăng nhập' },
    { id: 'login-error', element: 'Text', element_type: 'id="login-error"', locator: 'By.id("login-error")', description: 'Thông báo lỗi đăng nhập' },
    { id: 'btn-forgot-pass', element: 'Button', element_type: 'id="btn-forgot-pass"', locator: 'By.id("btn-forgot-pass")', description: 'Nút quên mật khẩu' },
    { id: 'btn-logout', element: 'Button', element_type: 'id="btn-logout"', locator: 'By.id("btn-logout")', description: 'Nút đăng xuất' },
  ],
  'Search & Filter': [
    { id: 'search-input', element: 'Input', element_type: 'id="search-input"', locator: 'By.id("search-input")', description: 'Ô tìm kiếm sản phẩm' },
    { id: 'btn-search', element: 'Button', element_type: 'id="btn-search"', locator: 'By.id("btn-search")', description: 'Nút tìm kiếm' },
    { id: 'category-filter', element: 'Button', element_type: 'class="category-filter"', locator: 'By.className("category-filter")', description: 'Nút lọc danh mục' },
  ],
  'Product & Cart': [
    { id: 'btn-add-cart-{id}', element: 'Button', element_type: 'id="btn-add-cart-p1"', locator: 'By.id("btn-add-cart-p1")', description: 'Nút thêm vào giỏ (p1-p8)' },
    { id: 'btn-cart', element: 'Button', element_type: 'id="btn-cart"', locator: 'By.id("btn-cart")', description: 'Nút mở giỏ hàng' },
    { id: 'cart-modal', element: 'Modal', element_type: 'id="cart-modal"', locator: 'By.id("cart-modal")', description: 'Modal giỏ hàng' },
    { id: 'cart-qty-input', element: 'Input', element_type: 'class="cart-qty-input"', locator: 'By.className("cart-qty-input")', description: 'Ô nhập số lượng' },
    { id: 'btn-delete-cart-item', element: 'Button', element_type: 'class="btn-delete-cart-item"', locator: 'By.className("btn-delete-cart-item")', description: 'Nút xóa sản phẩm' },
    { id: 'cart-total-price', element: 'Text', element_type: 'id="cart-total-price"', locator: 'By.id("cart-total-price")', description: 'Tổng tiền giỏ hàng' },
    { id: 'out-of-stock-badge', element: 'Badge', element_type: 'class="out-of-stock-badge"', locator: 'By.className("out-of-stock-badge")', description: 'Nhãn hết hàng' },
  ],
  'Checkout & Order': [
    { id: 'checkout-section', element: 'Section', element_type: 'id="checkout-section"', locator: 'By.id("checkout-section")', description: 'Trang thanh toán' },
    { id: 'checkout-name', element: 'Input', element_type: 'id="checkout-name"', locator: 'By.id("checkout-name")', description: 'Ô nhập họ tên giao hàng' },
    { id: 'checkout-phone', element: 'Input', element_type: 'id="checkout-phone"', locator: 'By.id("checkout-phone")', description: 'Ô nhập SĐT giao hàng' },
    { id: 'checkout-address', element: 'Textarea', element_type: 'id="checkout-address"', locator: 'By.id("checkout-address")', description: 'Ô nhập địa chỉ' },
    { id: 'coupon-input', element: 'Input', element_type: 'id="coupon-input"', locator: 'By.id("coupon-input")', description: 'Ô nhập mã giảm giá' },
    { id: 'btn-apply-coupon', element: 'Button', element_type: 'id="btn-apply-coupon"', locator: 'By.id("btn-apply-coupon")', description: 'Nút áp dụng mã' },
    { id: 'shipping-fee', element: 'Text', element_type: 'id="shipping-fee"', locator: 'By.id("shipping-fee")', description: 'Phí vận chuyển' },
    { id: 'payment-method', element: 'Radio', element_type: 'name="payment-method"', locator: 'By.name("payment-method")', description: 'Phương thức thanh toán' },
    { id: 'btn-submit-order', element: 'Button', element_type: 'id="btn-submit-order"', locator: 'By.id("btn-submit-order")', description: 'Nút đặt hàng' },
    { id: 'order-success-msg', element: 'Text', element_type: 'id="order-success-msg"', locator: 'By.id("order-success-msg")', description: 'Thông báo đặt hàng thành công' },
  ],
  'Order History & Admin': [
    { id: 'order-history-section', element: 'Section', element_type: 'id="order-history-section"', locator: 'By.id("order-history-section")', description: 'Lịch sử đơn hàng' },
    { id: 'admin-panel', element: 'Panel', element_type: 'id="admin-panel"', locator: 'By.id("admin-panel")', description: 'Bảng điều khiển admin' },
    { id: 'admin-order-list', element: 'List', element_type: 'id="admin-order-list"', locator: 'By.id("admin-order-list")', description: 'Danh sách đơn hàng admin' },
    { id: 'user-profile-section', element: 'Section', element_type: 'id="user-profile-section"', locator: 'By.id("user-profile-section")', description: 'Trang quản lý tài khoản' },
  ],
};

const PYTHON_CODE_SAMPLE = `"""
Mẫu test Selenium cho Cocoon Website
"""
import pytest
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By


@pytest.fixture
def driver():
    options = Options()
    options.add_argument("--start-maximized")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.implicitly_wait(10)
    driver.get("http://localhost:3000")
    yield driver
    driver.quit()


class TestCocoonAuth:
    def test_register_and_login(self, driver):
        # Mở modal đăng ký
        driver.find_element(By.ID, "btn-open-auth").click()
        time.sleep(0.5)
        
        # Chuyển sang tab đăng ký
        driver.find_element(
            By.XPATH, "//button[contains(text(), 'Đăng ký')]"
        ).click()
        time.sleep(0.5)
        
        # Điền form đăng ký
        driver.find_element(By.ID, "reg-name").send_keys("Test User")
        driver.find_element(By.ID, "reg-email-phone").send_keys("test@example.com")
        driver.find_element(By.ID, "reg-pass").send_keys("password123")
        
        # Submit
        driver.find_element(
            By.XPATH, "//button[contains(text(), 'Đăng ký')]"
        ).click()
        time.sleep(1)
        
        # Đăng nhập
        driver.find_element(
            By.XPATH, "//button[contains(text(), 'Đăng nhập')]"
        ).click()
        time.sleep(0.5)
        driver.find_element(By.ID, "login-id").send_keys("test@example.com")
        driver.find_element(By.ID, "login-pass").send_keys("password123")
        driver.find_element(By.ID, "btn-login").click()
        time.sleep(1)
        
        # Kiểm tra đăng nhập thành công
        assert driver.find_element(By.ID, "btn-logout").is_displayed()

    def test_search_product(self, driver):
        # Tìm kiếm sản phẩm
        search = driver.find_element(By.ID, "search-input")
        search.send_keys("cà phê")
        time.sleep(1)
        
        products = driver.find_elements(By.CLASS_NAME, "product-card")
        assert len(products) > 0

    def test_add_to_cart(self, driver):
        # Thêm sản phẩm vào giỏ
        driver.find_element(By.ID, "btn-add-cart-p1").click()
        time.sleep(0.5)
        
        # Mở giỏ hàng
        driver.find_element(By.ID, "btn-cart").click()
        time.sleep(0.5)
        
        # Kiểm tra giỏ hàng
        cart = driver.find_element(By.ID, "cart-modal")
        assert cart.is_displayed()
        
        total = driver.find_element(By.ID, "cart-total-price")
        assert "₫" in total.text`;

const JAVA_CODE_SAMPLE = `// Mẫu test Selenium Java cho Cocoon Website
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;

public class CocoonTest {
    WebDriver driver;
    
    @BeforeMethod
    public void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--start-maximized");
        driver = new ChromeDriver(options);
        driver.manage().timeouts().implicitlyWait(
            Duration.ofSeconds(10)
        );
        driver.get("http://localhost:3000");
    }
    
    @Test
    public void testLogin() {
        // Mở modal đăng nhập
        driver.findElement(By.id("btn-open-auth")).click();
        
        // Đăng nhập
        driver.findElement(By.id("login-id"))
              .sendKeys("admin@cocoon.vn");
        driver.findElement(By.id("login-pass"))
              .sendKeys("admin123");
        driver.findElement(By.id("btn-login")).click();
        
        // Kiểm tra
        assertTrue(
            driver.findElement(By.id("btn-logout"))
                  .isDisplayed()
        );
    }
    
    @Test
    public void testSearchProduct() {
        driver.findElement(By.id("search-input"))
              .sendKeys("bí đao");
        
        var products = driver.findElements(
            By.className("product-card")
        );
        assertTrue(products.size() > 0);
    }
    
    @AfterMethod
    public void tearDown() {
        driver.quit();
    }
}`;

export default function SeleniumGuide() {
  const [activeTab, setActiveTab] = useState('locators');
  const [activeGroup, setActiveGroup] = useState('Authentication');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-green-800 font-playfair mb-2">
          🧪 Hướng dẫn Selenium Testing
        </h2>
        <p className="text-gray-600">
          Tài liệu đầy đủ để viết automation test cho website Cocoon
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6 overflow-x-auto">
        <button
          className={`tab-btn whitespace-nowrap ${activeTab === 'locators' ? 'active' : ''}`}
          onClick={() => setActiveTab('locators')}
        >
          📋 Bảng Locator
        </button>
        <button
          className={`tab-btn whitespace-nowrap ${activeTab === 'python' ? 'active' : ''}`}
          onClick={() => setActiveTab('python')}
        >
          🐍 Python Code
        </button>
        <button
          className={`tab-btn whitespace-nowrap ${activeTab === 'java' ? 'active' : ''}`}
          onClick={() => setActiveTab('java')}
        >
          ☕ Java Code
        </button>
        <button
          className={`tab-btn whitespace-nowrap ${activeTab === 'setup' ? 'active' : ''}`}
          onClick={() => setActiveTab('setup')}
        >
          ⚙️ Setup
        </button>
        <button
          className={`tab-btn whitespace-nowrap ${activeTab === 'testcases' ? 'active' : ''}`}
          onClick={() => setActiveTab('testcases')}
        >
          ✅ Test Cases
        </button>
      </div>

      {/* Locator Table */}
      {activeTab === 'locators' && (
        <div>
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.keys(LOCATORS).map(group => (
              <button
                key={group}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeGroup === group
                    ? 'bg-green-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveGroup(group)}
              >
                {group}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-green-50">
                <tr>
                  <th className="text-left p-4 font-semibold text-green-800">ID/Class</th>
                  <th className="text-left p-4 font-semibold text-green-800">Loại</th>
                  <th className="text-left p-4 font-semibold text-green-800">HTML Attribute</th>
                  <th className="text-left p-4 font-semibold text-green-800">Selenium Locator</th>
                  <th className="text-left p-4 font-semibold text-green-800">Mô tả</th>
                </tr>
              </thead>
              <tbody>
                {LOCATORS[activeGroup].map((item, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-mono text-xs bg-green-50 text-green-800">{item.id}</td>
                    <td className="p-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{item.element}</span>
                    </td>
                    <td className="p-4 font-mono text-xs">{item.element_type}</td>
                    <td className="p-4 font-mono text-xs text-purple-700">{item.locator}</td>
                    <td className="p-4 text-gray-600">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Python Code */}
      {activeTab === 'python' && (
        <div>
          <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-yellow-400">🐍</span>
              <span className="text-gray-300 text-sm">test_cocoon.py</span>
            </div>
            <pre className="text-green-400 text-sm leading-relaxed whitespace-pre-wrap">
              {PYTHON_CODE_SAMPLE}
            </pre>
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-800 text-sm">
              <strong>💡 Tip:</strong> File test Python đầy đủ ({`>`}40 test cases) có sẵn tại thư mục 
              <code className="bg-blue-100 px-2 py-0.5 rounded mx-1">selenium-tests/test_cocoon.py</code>
            </p>
          </div>
        </div>
      )}

      {/* Java Code */}
      {activeTab === 'java' && (
        <div>
          <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-orange-400">☕</span>
              <span className="text-gray-300 text-sm">CocoonTest.java</span>
            </div>
            <pre className="text-green-400 text-sm leading-relaxed whitespace-pre-wrap">
              {JAVA_CODE_SAMPLE}
            </pre>
          </div>
        </div>
      )}

      {/* Setup Guide */}
      {activeTab === 'setup' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📦 Bước 1: Cài đặt Python & Dependencies</h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm whitespace-pre-wrap">{`# Cài đặt Python 3.8+
# Sau đó cài đặt các package:

cd selenium-tests
pip install -r requirements.txt

# Hoặc cài thủ công:
pip install selenium pytest pytest-html webdriver-manager`}</pre>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🌐 Bước 2: Build & Serve Website</h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm whitespace-pre-wrap">{`# Build website
npm run build

# Serve trên port 3000
npx serve dist -p 3000

# Hoặc dùng Python:
python -m http.server 3000 --directory dist`}</pre>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🚀 Bước 3: Chạy Test</h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm whitespace-pre-wrap">{`# Chạy tất cả test
cd selenium-tests
pytest test_cocoon.py -v

# Chạy với báo cáo HTML
pytest test_cocoon.py -v --html=report.html --self-contained-html

# Chạy headless (không mở browser)
pytest test_cocoon.py -v --headless

# Chạy nhóm test cụ thể
pytest test_cocoon.py -v -k "test_auth"
pytest test_cocoon.py -v -k "test_cart"
pytest test_cocoon.py -v -k "test_checkout"`}</pre>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🔑 Tài khoản Test</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Tài khoản</th>
                    <th className="text-left p-3">Email/SĐT</th>
                    <th className="text-left p-3">Mật khẩu</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3 font-medium">Admin</td>
                    <td className="p-3 font-mono text-sm">admin@cocoon.vn</td>
                    <td className="p-3 font-mono text-sm">admin123</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3 font-medium">User (tự đăng ký)</td>
                    <td className="p-3 text-gray-500 text-sm">Bất kỳ email hợp lệ</td>
                    <td className="p-3 text-gray-500 text-sm">Tối thiểu 6 ký tự</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Test Cases */}
      {activeTab === 'testcases' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Danh sách Test Cases ({`>`}40 TCs)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { group: 'Authentication', cases: ['TC-AUTH-01: Mở modal đăng nhập', 'TC-AUTH-02: Đăng ký thành công', 'TC-AUTH-03: Đăng ký trùng email', 'TC-AUTH-04: Email sai định dạng', 'TC-AUTH-05: Đăng nhập thành công', 'TC-AUTH-06: Sai mật khẩu', 'TC-AUTH-07: Quên mật khẩu', 'TC-AUTH-08: Đăng xuất'], color: 'green' },
                { group: 'Search & Filter', cases: ['TC-SEARCH-01: Tìm theo tên', 'TC-SEARCH-02: Tìm theo thành phần', 'TC-SEARCH-03: Không có kết quả', 'TC-FILTER-01: Lọc theo danh mục', 'TC-FILTER-02: Duyệt tất cả danh mục'], color: 'blue' },
                { group: 'Product Display', cases: ['TC-PROD-01: Nhãn Thuần chay', 'TC-PROD-02: Nhãn Khuyến mãi', 'TC-PROD-03: Nhãn Hết hàng', 'TC-PROD-04: Modal chi tiết SP'], color: 'purple' },
                { group: 'Shopping Cart', cases: ['TC-CART-01: Thêm vào giỏ', 'TC-CART-02: Cập nhật số lượng', 'TC-CART-03: Xóa khỏi giỏ', 'TC-CART-04: Tính tổng tiền', 'TC-CART-05: SP hết hàng'], color: 'orange' },
                { group: 'Checkout & Order', cases: ['TC-CHECKOUT-01: Mở trang TT', 'TC-CHECKOUT-02: Form đầy đủ', 'TC-CHECKOUT-03: Áp dụng voucher', 'TC-CHECKOUT-04: PT thanh toán', 'TC-CHECKOUT-05: Đặt hàng', 'TC-CHECKOUT-06: Free shipping'], color: 'red' },
                { group: 'Order History', cases: ['TC-HISTORY-01: Hiển thị trang', 'TC-HISTORY-02: Hiển thị đơn hàng'], color: 'teal' },
                { group: 'Admin Panel', cases: ['TC-ADMIN-01: Truy cập admin', 'TC-ADMIN-02: Xem đơn hàng', 'TC-ADMIN-03: Cập nhật trạng thái'], color: 'yellow' },
                { group: 'User Profile', cases: ['TC-PROFILE-01: Hiển thị trang', 'TC-PROFILE-02: Cập nhật TT', 'TC-PROFILE-03: Đổi mật khẩu'], color: 'pink' },
              ].map(({ group, cases, color }) => (
                <div key={group} className={`border-l-4 border-${color}-500 bg-${color}-50 rounded-r-lg p-4`}>
                  <h4 className={`font-bold text-${color}-800 mb-2`}>{group}</h4>
                  <ul className="space-y-1">
                    {cases.map((tc, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>{tc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-yellow-800 text-sm">
              <strong>⚡ Lưu ý:</strong> Tất cả test cases trên đã được implement đầy đủ trong file 
              <code className="bg-yellow-100 px-2 py-0.5 rounded mx-1">selenium-tests/test_cocoon.py</code>. 
              Bạn có thể chạy ngay sau khi setup môi trường.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
