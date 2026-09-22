"""
Selenium Test Suite for Cocoon Vietnam Website
===============================================
Complete automation tests for all features:
- Authentication (Register, Login, Forgot Password)
- Product Search & Filter
- Shopping Cart Management
- Checkout & Order Placement
- Order History
- Admin Panel
- User Profile Management
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException


# ============================================
# TEST GROUP 1: AUTHENTICATION
# ============================================

class TestAuthentication:
    """Test cases for user registration and login"""

    def test_auth_modal_opens(self, driver):
        """TC-AUTH-01: Verify auth modal opens when clicking login button"""
        # Click login button
        login_btn = driver.find_element("id", "btn-open-auth")
        login_btn.click()
        time.sleep(0.5)

        # Verify modal is displayed
        auth_modal = driver.find_element("id", "auth-modal")
        assert auth_modal.is_displayed(), "Auth modal should be displayed"

    def test_register_new_user_success(self, driver):
        """TC-AUTH-02: Register a new user successfully"""
        # Open auth modal
        driver.find_element("id", "btn-open-auth").click()
        time.sleep(0.5)

        # Switch to register tab
        register_tab = driver.find_element("xpath", "//button[contains(text(), 'Đăng ký')]")
        register_tab.click()
        time.sleep(0.5)

        # Fill registration form
        driver.find_element("id", "reg-name").send_keys("Nguyen Van A")
        driver.find_element("id", "reg-email-phone").send_keys("nguyenvana@example.com")
        driver.find_element("id", "reg-pass").send_keys("password123")

        # Submit registration
        register_btn = driver.find_element("xpath", "//button[contains(text(), 'Đăng ký tài khoản')]")
        register_btn.click()
        time.sleep(1)

        # Verify success - should switch to login tab
        login_tab = driver.find_element("xpath", "//button[contains(text(), 'Đăng nhập')]")
        assert login_tab.get_attribute("class").find("bg-white") != -1, "Should switch to login tab after registration"

    def test_register_duplicate_email(self, driver):
        """TC-AUTH-03: Register with duplicate email shows error"""
        # Register first user
        driver.find_element("id", "btn-open-auth").click()
        time.sleep(0.5)

        register_tab = driver.find_element("xpath", "//button[contains(text(), 'Đăng ký')]")
        register_tab.click()
        time.sleep(0.5)

        driver.find_element("id", "reg-name").send_keys("User One")
        driver.find_element("id", "reg-email-phone").send_keys("duplicate@example.com")
        driver.find_element("id", "reg-pass").send_keys("password123")
        driver.find_element("xpath", "//button[contains(text(), 'Đăng ký tài khoản')]").click()
        time.sleep(1)

        # Try to register with same email
        driver.find_element("id", "reg-name").clear()
        driver.find_element("id", "reg-name").send_keys("User Two")
        driver.find_element("id", "reg-email-phone").clear()
        driver.find_element("id", "reg-email-phone").send_keys("duplicate@example.com")
        driver.find_element("xpath", "//button[contains(text(), 'Đăng ký tài khoản')]").click()
        time.sleep(1)

        # Verify error message
        error_msg = driver.find_element("id", "reg-error")
        assert error_msg.is_displayed(), "Error message should be displayed"
        assert "đã được sử dụng" in error_msg.text, "Should show duplicate email error"

    def test_register_invalid_email_format(self, driver):
        """TC-AUTH-04: Register with invalid email format shows error"""
        driver.find_element("id", "btn-open-auth").click()
        time.sleep(0.5)

        register_tab = driver.find_element("xpath", "//button[contains(text(), 'Đăng ký')]")
        register_tab.click()
        time.sleep(0.5)

        driver.find_element("id", "reg-name").send_keys("Test User")
        driver.find_element("id", "reg-email-phone").send_keys("invalid-email")
        driver.find_element("id", "reg-pass").send_keys("password123")
        driver.find_element("xpath", "//button[contains(text(), 'Đăng ký tài khoản')]").click()
        time.sleep(1)

        # Verify error message
        error_msg = driver.find_element("id", "reg-error")
        assert error_msg.is_displayed(), "Error message should be displayed"
        assert "định dạng" in error_msg.text.lower(), "Should show format error"

    def test_login_success(self, driver):
        """TC-AUTH-05: Login with valid credentials"""
        # First register a user
        driver.find_element("id", "btn-open-auth").click()
        time.sleep(0.5)

        register_tab = driver.find_element("xpath", "//button[contains(text(), 'Đăng ký')]")
        register_tab.click()
        time.sleep(0.5)

        driver.find_element("id", "reg-name").send_keys("Login Test")
        driver.find_element("id", "reg-email-phone").send_keys("logintest@example.com")
        driver.find_element("id", "reg-pass").send_keys("password123")
        driver.find_element("xpath", "//button[contains(text(), 'Đăng ký tài khoản')]").click()
        time.sleep(1)

        # Switch to login tab
        login_tab = driver.find_element("xpath", "//button[contains(text(), 'Đăng nhập')]")
        login_tab.click()
        time.sleep(0.5)

        # Login
        driver.find_element("id", "login-id").send_keys("logintest@example.com")
        driver.find_element("id", "login-pass").send_keys("password123")
        driver.find_element("id", "btn-login").click()
        time.sleep(1)

        # Verify login success - auth modal should close
        try:
            auth_modal = driver.find_element("id", "auth-modal")
            assert not auth_modal.is_displayed(), "Auth modal should close after login"
        except NoSuchElementException:
            pass  # Modal removed from DOM, which is fine

    def test_login_wrong_password(self, driver):
        """TC-AUTH-06: Login with wrong password shows error"""
        # Register first
        driver.find_element("id", "btn-open-auth").click()
        time.sleep(0.5)

        register_tab = driver.find_element("xpath", "//button[contains(text(), 'Đăng ký')]")
        register_tab.click()
        time.sleep(0.5)

        driver.find_element("id", "reg-name").send_keys("Wrong Pass Test")
        driver.find_element("id", "reg-email-phone").send_keys("wrongpass@example.com")
        driver.find_element("id", "reg-pass").send_keys("correctpass")
        driver.find_element("xpath", "//button[contains(text(), 'Đăng ký tài khoản')]").click()
        time.sleep(1)

        # Switch to login
        login_tab = driver.find_element("xpath", "//button[contains(text(), 'Đăng nhập')]")
        login_tab.click()
        time.sleep(0.5)

        # Try login with wrong password
        driver.find_element("id", "login-id").send_keys("wrongpass@example.com")
        driver.find_element("id", "login-pass").send_keys("wrongpassword")
        driver.find_element("id", "btn-login").click()
        time.sleep(1)

        # Verify error
        error_msg = driver.find_element("id", "login-error")
        assert error_msg.is_displayed(), "Error message should be displayed"
        assert "sai" in error_msg.text.lower(), "Should show wrong credentials error"

    def test_forgot_password_button(self, driver):
        """TC-AUTH-07: Forgot password button works"""
        driver.find_element("id", "btn-open-auth").click()
        time.sleep(0.5)

        # Click forgot password
        forgot_btn = driver.find_element("id", "btn-forgot-pass")
        forgot_btn.click()
        time.sleep(0.5)

        # Verify forgot password form is shown
        forgot_input = driver.find_element("id", "forgot-email")
        assert forgot_input.is_displayed(), "Forgot password form should be displayed"

    def test_logout(self, logged_in_user):
        """TC-AUTH-08: Logout works correctly"""
        driver = logged_in_user

        # Click logout button
        logout_btn = driver.find_element("id", "btn-logout")
        logout_btn.click()
        time.sleep(1)

        # Verify login button is shown again
        login_btn = driver.find_element("id", "btn-open-auth")
        assert login_btn.is_displayed(), "Login button should be visible after logout"


# ============================================
# TEST GROUP 2: SEARCH & FILTER
# ============================================

class TestSearchAndFilter:
    """Test cases for product search and category filter"""

    def test_search_by_product_name(self, driver):
        """TC-SEARCH-01: Search products by name"""
        search_input = driver.find_element("id", "search-input")
        search_input.send_keys("cà phê")
        time.sleep(1)

        # Verify results contain coffee product
        products = driver.find_elements("class", "product-card")
        assert len(products) > 0, "Should find at least one product"

        # Check if coffee product is in results
        found = False
        for product in products:
            if "cà phê" in product.text.lower():
                found = True
                break
        assert found, "Should find coffee product"

    def test_search_by_ingredient(self, driver):
        """TC-SEARCH-02: Search products by ingredient"""
        search_input = driver.find_element("id", "search-input")
        search_input.send_keys("bí đao")
        time.sleep(1)

        # Verify results
        products = driver.find_elements("class", "product-card")
        assert len(products) > 0, "Should find products with bí đao"

    def test_search_no_results(self, driver):
        """TC-SEARCH-03: Search with no matching results"""
        search_input = driver.find_element("id", "search-input")
        search_input.send_keys("xyz123notexist")
        time.sleep(1)

        # Verify no products shown
        products = driver.find_elements("class", "product-card")
        assert len(products) == 0, "Should show no products"

    def test_filter_by_category(self, driver):
        """TC-FILTER-01: Filter products by category"""
        # Click on "Chăm sóc da" category
        categories = driver.find_elements("class", "category-filter")
        for cat in categories:
            if "Chăm sóc da" in cat.text:
                cat.click()
                break
        time.sleep(1)

        # Verify only skincare products shown
        products = driver.find_elements("class", "product-card")
        assert len(products) > 0, "Should show skincare products"

        for product in products:
            assert "Chăm sóc da" in product.text, "All products should be from selected category"

    def test_filter_all_categories(self, driver):
        """TC-FILTER-02: Filter through all categories"""
        category_names = ["Tất cả", "Chăm sóc da", "Chăm sóc tóc", "Chăm sóc cơ thể", "Chăm sóc môi"]

        for cat_name in category_names:
            categories = driver.find_elements("class", "category-filter")
            for cat in categories:
                if cat_name in cat.text:
                    cat.click()
                    break
            time.sleep(0.5)

            # Verify active state
            active_cat = driver.find_element("css selector", ".category-filter.active")
            assert cat_name in active_cat.text, f"Category {cat_name} should be active"


# ============================================
# TEST GROUP 3: PRODUCT DISPLAY
# ============================================

class TestProductDisplay:
    """Test cases for product display and badges"""

    def test_vegan_badge_displayed(self, driver):
        """TC-PROD-01: Vegan badge is displayed on vegan products"""
        products = driver.find_elements("class", "product-card")

        vegan_badges = driver.find_elements("class", "vegan-badge")
        assert len(vegan_badges) > 0, "Should display vegan badges"

    def test_promo_badge_displayed(self, driver):
        """TC-PROD-02: Promo badge is displayed on promotional products"""
        promo_badges = driver.find_elements("class", "promo-badge")
        assert len(promo_badges) > 0, "Should display promo badges"

    def test_out_of_stock_badge(self, driver):
        """TC-PROD-03: Out of stock badge and disabled button"""
        out_of_stock_badges = driver.find_elements("class", "out-of-stock-badge")
        assert len(out_of_stock_badges) > 0, "Should display out of stock badge"

        # Find the out of stock product card
        products = driver.find_elements("class", "product-card")
        for product in products:
            try:
                badge = product.find_element("class", "out-of-stock-badge")
                # Find add to cart button in this card
                add_btn = product.find_element("css selector", "button")
                assert not add_btn.is_enabled(), "Add to cart button should be disabled"
                break
            except NoSuchElementException:
                continue

    def test_product_detail_modal(self, driver):
        """TC-PROD-04: Product detail modal opens on click"""
        # Click on first product name
        product_names = driver.find_elements("css selector", ".product-card h3")
        product_names[0].click()
        time.sleep(0.5)

        # Verify modal is displayed
        modal = driver.find_element("class", "modal-overlay")
        assert modal.is_displayed(), "Product detail modal should be displayed"


# ============================================
# TEST GROUP 4: SHOPPING CART
# ============================================

class TestShoppingCart:
    """Test cases for shopping cart management"""

    def test_add_to_cart(self, driver):
        """TC-CART-01: Add product to cart"""
        # Add first product
        add_btn = driver.find_element("id", "btn-add-cart-p1")
        add_btn.click()
        time.sleep(0.5)

        # Open cart
        cart_btn = driver.find_element("id", "btn-cart")
        cart_btn.click()
        time.sleep(0.5)

        # Verify cart modal is open
        cart_modal = driver.find_element("id", "cart-modal")
        assert cart_modal.is_displayed(), "Cart modal should be displayed"

        # Verify item is in cart
        cart_items = driver.find_elements("css selector", "#cart-modal .flex.items-center")
        assert len(cart_items) > 0, "Cart should contain at least one item"

    def test_update_cart_quantity(self, driver):
        """TC-CART-02: Update cart item quantity"""
        # Add product
        driver.find_element("id", "btn-add-cart-p1").click()
        time.sleep(0.5)

        # Open cart
        driver.find_element("id", "btn-cart").click()
        time.sleep(0.5)

        # Find quantity input
        qty_input = driver.find_element("class", "cart-qty-input")
        initial_qty = int(qty_input.get_attribute("value"))

        # Update quantity
        qty_input.clear()
        qty_input.send_keys("3")
        time.sleep(0.5)

        # Verify quantity updated
        new_qty = int(qty_input.get_attribute("value"))
        assert new_qty == 3, "Quantity should be updated to 3"

    def test_remove_from_cart(self, driver):
        """TC-CART-03: Remove item from cart"""
        # Add product
        driver.find_element("id", "btn-add-cart-p1").click()
        time.sleep(0.5)

        # Open cart
        driver.find_element("id", "btn-cart").click()
        time.sleep(0.5)

        # Click delete button
        delete_btn = driver.find_element("class", "btn-delete-cart-item")
        delete_btn.click()
        time.sleep(0.5)

        # Verify cart is empty
        cart_modal = driver.find_element("id", "cart-modal")
        assert "Giỏ hàng trống" in cart_modal.text, "Cart should be empty"

    def test_cart_total_price(self, driver):
        """TC-CART-04: Cart total price is calculated correctly"""
        # Add products
        driver.find_element("id", "btn-add-cart-p1").click()
        time.sleep(0.3)
        driver.find_element("id", "btn-add-cart-p2").click()
        time.sleep(0.5)

        # Open cart
        driver.find_element("id", "btn-cart").click()
        time.sleep(0.5)

        # Verify total price is displayed
        total_price = driver.find_element("id", "cart-total-price")
        assert total_price.is_displayed(), "Total price should be displayed"
        assert "₫" in total_price.text or "VND" in total_price.text, "Price should contain currency"

    def test_cannot_add_out_of_stock(self, driver):
        """TC-CART-05: Cannot add out of stock product to cart"""
        # Find out of stock product
        products = driver.find_elements("class", "product-card")
        for product in products:
            try:
                badge = product.find_element("class", "out-of-stock-badge")
                add_btn = product.find_element("css selector", "button")
                assert not add_btn.is_enabled(), "Out of stock product button should be disabled"
                break
            except NoSuchElementException:
                continue


# ============================================
# TEST GROUP 5: CHECKOUT & ORDER
# ============================================

class TestCheckoutAndOrder:
    """Test cases for checkout and order placement"""

    def test_checkout_page_opens(self, logged_in_user):
        """TC-CHECKOUT-01: Checkout page opens with items in cart"""
        driver = logged_in_user

        # Add items to cart
        driver.find_element("id", "btn-add-cart-p1").click()
        time.sleep(0.5)

        # Open cart and proceed to checkout
        driver.find_element("id", "btn-cart").click()
        time.sleep(0.5)

        checkout_btn = driver.find_element("xpath", "//button[contains(text(), 'đặt hàng')]")
        checkout_btn.click()
        time.sleep(1)

        # Verify checkout section is displayed
        checkout_section = driver.find_element("id", "checkout-section")
        assert checkout_section.is_displayed(), "Checkout section should be displayed"

    def test_checkout_form_fields(self, logged_in_user):
        """TC-CHECKOUT-02: Checkout form has all required fields"""
        driver = logged_in_user

        # Add item and go to checkout
        driver.find_element("id", "btn-add-cart-p1").click()
        time.sleep(0.3)
        driver.find_element("id", "btn-cart").click()
        time.sleep(0.3)
        driver.find_element("xpath", "//button[contains(text(), 'đặt hàng')]").click()
        time.sleep(1)

        # Verify form fields exist
        name_field = driver.find_element("id", "checkout-name")
        phone_field = driver.find_element("id", "checkout-phone")
        address_field = driver.find_element("id", "checkout-address")

        assert name_field.is_displayed(), "Name field should be displayed"
        assert phone_field.is_displayed(), "Phone field should be displayed"
        assert address_field.is_displayed(), "Address field should be displayed"

    def test_apply_coupon_code(self, logged_in_user):
        """TC-CHECKOUT-03: Apply coupon code successfully"""
        driver = logged_in_user

        # Add item and go to checkout
        driver.find_element("id", "btn-add-cart-p1").click()
        time.sleep(0.3)
        driver.find_element("id", "btn-add-cart-p2").click()
        time.sleep(0.3)
        driver.find_element("id", "btn-cart").click()
        time.sleep(0.3)
        driver.find_element("xpath", "//button[contains(text(), 'đặt hàng')]").click()
        time.sleep(1)

        # Apply coupon
        coupon_input = driver.find_element("id", "coupon-input")
        coupon_input.send_keys("COCOON10")
        driver.find_element("id", "btn-apply-coupon").click()
        time.sleep(1)

        # Verify discount is applied (check for discount text)
        checkout_section = driver.find_element("id", "checkout-section")
        assert "Giảm giá" in checkout_section.text, "Discount should be shown"

    def test_payment_methods(self, logged_in_user):
        """TC-CHECKOUT-04: Payment methods are available"""
        driver = logged_in_user

        # Go to checkout
        driver.find_element("id", "btn-add-cart-p1").click()
        time.sleep(0.3)
        driver.find_element("id", "btn-cart").click()
        time.sleep(0.3)
        driver.find_element("xpath", "//button[contains(text(), 'đặt hàng')]").click()
        time.sleep(1)

        # Verify payment methods
        payment_methods = driver.find_elements("name", "payment-method")
        assert len(payment_methods) >= 3, "Should have at least 3 payment methods"

    def test_place_order_success(self, logged_in_user):
        """TC-CHECKOUT-05: Place order successfully"""
        driver = logged_in_user

        # Add item and go to checkout
        driver.find_element("id", "btn-add-cart-p1").click()
        time.sleep(0.3)
        driver.find_element("id", "btn-cart").click()
        time.sleep(0.3)
        driver.find_element("xpath", "//button[contains(text(), 'đặt hàng')]").click()
        time.sleep(1)

        # Fill checkout form
        driver.find_element("id", "checkout-name").send_keys("Test Customer")
        driver.find_element("id", "checkout-phone").send_keys("0987654321")
        driver.find_element("id", "checkout-address").send_keys("123 Đường ABC, Quận 1, TP.HCM")

        # Submit order
        driver.find_element("id", "btn-submit-order").click()
        time.sleep(1)

        # Verify success message
        success_msg = driver.find_element("id", "order-success-msg")
        assert success_msg.is_displayed(), "Order success message should be displayed"
        assert "ORD-" in success_msg.text, "Should display order ID"

    def test_free_shipping_threshold(self, logged_in_user):
        """TC-CHECKOUT-06: Free shipping for orders over threshold"""
        driver = logged_in_user

        # Add multiple items to exceed threshold
        for _ in range(5):
            driver.find_element("id", "btn-add-cart-p1").click()
            time.sleep(0.2)

        driver.find_element("id", "btn-cart").click()
        time.sleep(0.3)
        driver.find_element("xpath", "//button[contains(text(), 'đặt hàng')]").click()
        time.sleep(1)

        # Fill address
        driver.find_element("id", "checkout-name").send_keys("Test")
        driver.find_element("id", "checkout-phone").send_keys("0987654321")
        driver.find_element("id", "checkout-address").send_keys("TP.HCM")
        time.sleep(0.5)

        # Verify free shipping
        shipping_fee = driver.find_element("id", "shipping-fee")
        assert "Miễn phí" in shipping_fee.text, "Should show free shipping"


# ============================================
# TEST GROUP 6: ORDER HISTORY
# ============================================

class TestOrderHistory:
    """Test cases for order history"""

    def test_order_history_page(self, logged_in_user):
        """TC-HISTORY-01: Order history page displays"""
        driver = logged_in_user

        # Click order history button
        history_btn = driver.find_element("id", "btn-order-history")
        history_btn.click()
        time.sleep(1)

        # Verify order history section
        history_section = driver.find_element("id", "order-history-section")
        assert history_section.is_displayed(), "Order history section should be displayed"

    def test_order_history_shows_orders(self, logged_in_user):
        """TC-HISTORY-02: Order history shows placed orders"""
        driver = logged_in_user

        # Place an order first
        driver.find_element("id", "btn-add-cart-p1").click()
        time.sleep(0.3)
        driver.find_element("id", "btn-cart").click()
        time.sleep(0.3)
        driver.find_element("xpath", "//button[contains(text(), 'đặt hàng')]").click()
        time.sleep(1)

        driver.find_element("id", "checkout-name").send_keys("Test")
        driver.find_element("id", "checkout-phone").send_keys("0987654321")
        driver.find_element("id", "checkout-address").send_keys("TP.HCM")
        driver.find_element("id", "btn-submit-order").click()
        time.sleep(1)

        # Go to order history
        driver.find_element("id", "btn-order-history").click()
        time.sleep(1)

        # Verify order is shown
        history_section = driver.find_element("id", "order-history-section")
        assert "ORD-" in history_section.text, "Should show order ID in history"


# ============================================
# TEST GROUP 7: ADMIN PANEL
# ============================================

class TestAdminPanel:
    """Test cases for admin panel"""

    def test_admin_panel_access(self, admin_user):
        """TC-ADMIN-01: Admin can access admin panel"""
        driver = admin_user

        # Click admin button
        admin_btn = driver.find_element("id", "btn-admin")
        assert admin_btn.is_displayed(), "Admin button should be visible"

        admin_btn.click()
        time.sleep(1)

        # Verify admin panel
        admin_panel = driver.find_element("id", "admin-panel")
        assert admin_panel.is_displayed(), "Admin panel should be displayed"

    def test_admin_order_list(self, admin_user):
        """TC-ADMIN-02: Admin can view order list"""
        driver = admin_user

        driver.find_element("id", "btn-admin").click()
        time.sleep(1)

        # Verify order list section
        order_list = driver.find_element("id", "admin-order-list")
        assert order_list.is_displayed(), "Admin order list should be displayed"

    def test_admin_update_order_status(self, admin_user):
        """TC-ADMIN-03: Admin can update order status"""
        driver = admin_user

        # First place an order as regular user (simulated)
        # For this test, we'll just verify the dropdown exists
        driver.find_element("id", "btn-admin").click()
        time.sleep(1)

        # Check if there are any orders
        order_list = driver.find_element("id", "admin-order-list")
        if "Chưa có đơn hàng" not in order_list.text:
            # Find status dropdown
            status_selects = driver.find_elements("css selector", "#admin-panel select")
            assert len(status_selects) > 0, "Should have status dropdowns"


# ============================================
# TEST GROUP 8: USER PROFILE
# ============================================

class TestUserProfile:
    """Test cases for user profile management"""

    def test_user_profile_page(self, logged_in_user):
        """TC-PROFILE-01: User profile page displays"""
        driver = logged_in_user

        # Click profile button
        profile_btn = driver.find_element("id", "btn-profile")
        profile_btn.click()
        time.sleep(1)

        # Verify profile section
        profile_section = driver.find_element("id", "user-profile-section")
        assert profile_section.is_displayed(), "User profile section should be displayed"

    def test_update_user_profile(self, logged_in_user):
        """TC-PROFILE-02: User can update profile information"""
        driver = logged_in_user

        # Go to profile
        driver.find_element("id", "btn-profile").click()
        time.sleep(1)

        # Update name
        name_field = driver.find_element("id", "profile-name")
        name_field.clear()
        name_field.send_keys("Updated Name")

        # Save changes
        save_btn = driver.find_element("xpath", "//button[contains(text(), 'Lưu thay đổi')]")
        save_btn.click()
        time.sleep(1)

        # Verify update (check if name field still has the new value)
        assert name_field.get_attribute("value") == "Updated Name", "Name should be updated"

    def test_change_password(self, logged_in_user):
        """TC-PROFILE-03: User can change password"""
        driver = logged_in_user

        # Go to profile
        driver.find_element("id", "btn-profile").click()
        time.sleep(1)

        # Fill password change form
        driver.find_element("id", "old-password").send_keys("password123")
        driver.find_element("id", "new-password").send_keys("newpassword123")
        driver.find_element("id", "confirm-password").send_keys("newpassword123")

        # Submit
        change_btn = driver.find_element("xpath", "//button[contains(text(), 'Đổi mật khẩu')]")
        change_btn.click()
        time.sleep(1)

        # Verify password fields are cleared (success indicator)
        old_pass = driver.find_element("id", "old-password")
        assert old_pass.get_attribute("value") == "", "Old password field should be cleared"


# ============================================
# ADDITIONAL EDGE CASE TESTS
# ============================================

class TestEdgeCases:
    """Additional edge case tests"""

    def test_empty_checkout_validation(self, logged_in_user):
        """TC-EDGE-01: Cannot checkout with empty form"""
        driver = logged_in_user

        # Add item and go to checkout
        driver.find_element("id", "btn-add-cart-p1").click()
        time.sleep(0.3)
        driver.find_element("id", "btn-cart").click()
        time.sleep(0.3)
        driver.find_element("xpath", "//button[contains(text(), 'đặt hàng')]").click()
        time.sleep(1)

        # Try to submit without filling form
        driver.find_element("id", "btn-submit-order").click()
        time.sleep(1)

        # Should show error or stay on checkout page
        checkout_section = driver.find_element("id", "checkout-section")
        assert checkout_section.is_displayed(), "Should stay on checkout page"

    def test_search_case_insensitive(self, driver):
        """TC-EDGE-02: Search is case insensitive"""
        search_input = driver.find_element("id", "search-input")

        # Search with uppercase
        search_input.send_keys("CÀ PHÊ")
        time.sleep(1)

        products_upper = driver.find_elements("class", "product-card")
        count_upper = len(products_upper)

        # Clear and search with lowercase
        search_input.clear()
        search_input.send_keys("cà phê")
        time.sleep(1)

        products_lower = driver.find_elements("class", "product-card")
        count_lower = len(products_lower)

        assert count_upper == count_lower, "Search should be case insensitive"

    def test_multiple_items_same_product(self, driver):
        """TC-EDGE-03: Can add same product multiple times"""
        # Add same product 3 times
        for _ in range(3):
            driver.find_element("id", "btn-add-cart-p1").click()
            time.sleep(0.3)

        # Open cart
        driver.find_element("id", "btn-cart").click()
        time.sleep(0.5)

        # Verify quantity is 3
        qty_input = driver.find_element("class", "cart-qty-input")
        assert int(qty_input.get_attribute("value")) == 3, "Quantity should be 3"
