"""
Pytest configuration and fixtures for Selenium tests
"""
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time


def pytest_addoption(parser):
    """Add custom command line options"""
    parser.addoption(
        "--base-url",
        action="store",
        default="http://localhost:3000",
        help="Base URL for the application"
    )
    parser.addoption(
        "--headless",
        action="store_true",
        default=False,
        help="Run tests in headless mode"
    )
    parser.addoption(
        "--slow",
        action="store_true",
        default=False,
        help="Add delays for debugging"
    )


@pytest.fixture(scope="session")
def base_url(request):
    """Get base URL from command line"""
    return request.config.getoption("--base-url")


@pytest.fixture
def driver(request, base_url):
    """Setup and teardown WebDriver"""
    # Configure Chrome options
    chrome_options = Options()
    
    if request.config.getoption("--headless"):
        chrome_options.add_argument("--headless")
    
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--start-maximized")
    
    # Initialize WebDriver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    # Set implicit wait
    driver.implicitly_wait(10)
    
    # Navigate to base URL
    driver.get(base_url)
    
    # Wait for page to load
    time.sleep(2)
    
    yield driver
    
    # Teardown
    driver.quit()


@pytest.fixture
def slow_mode(request):
    """Add delays if slow mode is enabled"""
    if request.config.getoption("--slow"):
        time.sleep(1)


@pytest.fixture
def logged_in_user(driver, base_url):
    """Fixture to login as regular user"""
    # Register a test user first
    driver.get(base_url)
    
    # Click login button
    login_btn = driver.find_element("id", "btn-open-auth")
    login_btn.click()
    time.sleep(1)
    
    # Switch to register tab
    register_tab = driver.find_element("xpath", "//button[contains(text(), 'Đăng ký')]")
    register_tab.click()
    time.sleep(0.5)
    
    # Fill registration form
    driver.find_element("id", "reg-name").send_keys("Test User")
    driver.find_element("id", "reg-email-phone").send_keys("test@example.com")
    driver.find_element("id", "reg-pass").send_keys("password123")
    
    # Submit registration
    register_btn = driver.find_element("xpath", "//button[contains(text(), 'Đăng ký tài khoản')]")
    register_btn.click()
    time.sleep(1)
    
    # Switch to login tab
    login_tab = driver.find_element("xpath", "//button[contains(text(), 'Đăng nhập')]")
    login_tab.click()
    time.sleep(0.5)
    
    # Login
    driver.find_element("id", "login-id").send_keys("test@example.com")
    driver.find_element("id", "login-pass").send_keys("password123")
    driver.find_element("id", "btn-login").click()
    time.sleep(1)
    
    return driver


@pytest.fixture
def admin_user(driver, base_url):
    """Fixture to login as admin"""
    driver.get(base_url)
    
    # Click login button
    login_btn = driver.find_element("id", "btn-open-auth")
    login_btn.click()
    time.sleep(1)
    
    # Login as admin
    driver.find_element("id", "login-id").send_keys("admin@cocoon.vn")
    driver.find_element("id", "login-pass").send_keys("admin123")
    driver.find_element("id", "btn-login").click()
    time.sleep(1)
    
    return driver


@pytest.fixture
def cart_with_items(driver, base_url):
    """Fixture with items in cart"""
    driver.get(base_url)
    
    # Add first product to cart
    add_btn = driver.find_element("id", "btn-add-cart-p1")
    add_btn.click()
    time.sleep(0.5)
    
    # Add second product to cart
    add_btn2 = driver.find_element("id", "btn-add-cart-p2")
    add_btn2.click()
    time.sleep(0.5)
    
    return driver
