import { useState, useEffect, useCallback } from 'react';
import { Product, CartItem, User, Order } from './types';
import { PRODUCTS, COUPONS, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE_MAP, ADMIN_ACCOUNT, formatPrice } from './data';
import SeleniumGuide from './SeleniumGuide';

// Helper functions for localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Initialize admin account
function initAdmin() {
  const users = getFromStorage<User[]>('cocoon_users', []);
  if (!users.find(u => u.id === ADMIN_ACCOUNT.id)) {
    users.push(ADMIN_ACCOUNT);
    saveToStorage('cocoon_users', users);
  }
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'checkout' | 'order-history' | 'admin' | 'profile' | 'selenium-guide'>('home');

  // Load data on mount
  useEffect(() => {
    initAdmin();
    const savedUser = getFromStorage<User | null>('cocoon_current_user', null);
    const savedCart = getFromStorage<CartItem[]>('cocoon_cart', []);
    const savedOrders = getFromStorage<Order[]>('cocoon_orders', []);
    const savedUsers = getFromStorage<User[]>('cocoon_users', []);
    setCurrentUser(savedUser);
    setCart(savedCart);
    setOrders(savedOrders);
    setUsers(savedUsers);
  }, []);

  // Save data on change
  useEffect(() => { saveToStorage('cocoon_current_user', currentUser); }, [currentUser]);
  useEffect(() => { saveToStorage('cocoon_cart', cart); }, [cart]);
  useEffect(() => { saveToStorage('cocoon_orders', orders); }, [orders]);
  useEffect(() => { saveToStorage('cocoon_users', users); }, [users]);

  const showToast = useCallback((message: string, type: string = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Filter products
  const filteredProducts = PRODUCTS.filter(p => {
    const matchCategory = activeCategory === 'Tất cả' || p.category === activeCategory;
    const matchSearch = searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ingredients.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Auth functions
  const handleRegister = (name: string, emailPhone: string, password: string) => {
    const existingUsers = getFromStorage<User[]>('cocoon_users', []);
    const isDuplicate = existingUsers.find(u => u.email === emailPhone || u.phone === emailPhone);
    if (isDuplicate) {
      return { success: false, error: 'Email/SĐT đã được sử dụng!' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    if (!emailRegex.test(emailPhone) && !phoneRegex.test(emailPhone)) {
      return { success: false, error: 'Vui lòng nhập đúng định dạng Email hoặc SĐT!' };
    }
    const newUser: User = {
      id: 'user-' + Date.now(),
      name,
      email: emailRegex.test(emailPhone) ? emailPhone : '',
      phone: phoneRegex.test(emailPhone) ? emailPhone : '',
      password,
      role: 'user',
    };
    const updatedUsers = [...existingUsers, newUser];
    setUsers(updatedUsers);
    saveToStorage('cocoon_users', updatedUsers);
    return { success: true, error: '' };
  };

  const handleLogin = (loginId: string, password: string) => {
    const allUsers = getFromStorage<User[]>('cocoon_users', []);
    const user = allUsers.find(u =>
      (u.email === loginId || u.phone === loginId || u.name === loginId) && u.password === password
    );
    if (user) {
      setCurrentUser(user);
      return { success: true, error: '' };
    }
    return { success: false, error: 'Sai tên đăng nhập hoặc mật khẩu!' };
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCart([]);
    setCurrentPage('home');
    showToast('Đã đăng xuất thành công!', 'info');
  };

  // Cart functions
  const addToCart = (product: Product) => {
    if (!product.inStock) {
      showToast('Sản phẩm đã hết hàng!', 'error');
      return;
    }
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    showToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart(cart.filter(item => item.product.id !== productId));
    } else {
      setCart(cart.map(item =>
        item.product.id === productId ? { ...item, quantity: qty } : item
      ));
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
    showToast('Đã xóa sản phẩm khỏi giỏ hàng!', 'info');
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Order functions
  const placeOrder = (customerName: string, customerPhone: string, customerAddress: string, paymentMethod: string, couponDiscount: number) => {
    const addressLower = customerAddress.toLowerCase();
    let shippingFee = SHIPPING_FEE_MAP['default'];
    if (addressLower.includes('hcm') || addressLower.includes('hồ chí minh') || addressLower.includes('sài gòn')) {
      shippingFee = SHIPPING_FEE_MAP['hcm'];
    } else if (addressLower.includes('hà nội') || addressLower.includes('hn')) {
      shippingFee = SHIPPING_FEE_MAP['hn'];
    } else if (addressLower.includes('đà nẵng') || addressLower.includes('danang')) {
      shippingFee = SHIPPING_FEE_MAP['danang'];
    }

    if (cartTotal >= FREE_SHIPPING_THRESHOLD) {
      shippingFee = 0;
    }

    const finalTotal = cartTotal - couponDiscount + shippingFee;

    const newOrder: Order = {
      id: 'ORD-' + Date.now().toString(36).toUpperCase(),
      userId: currentUser?.id || 'guest',
      userName: currentUser?.name || customerName,
      items: [...cart],
      total: cartTotal,
      shippingFee,
      couponDiscount,
      finalTotal: Math.max(0, finalTotal),
      status: 'pending',
      customerName,
      customerPhone,
      customerAddress,
      paymentMethod,
      createdAt: new Date().toLocaleString('vi-VN'),
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveToStorage('cocoon_orders', updatedOrders);
    setCart([]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status } : o);
    setOrders(updatedOrders);
    saveToStorage('cocoon_orders', updatedOrders);
  };

  // Update user profile
  const updateProfile = (name: string, email: string, phone: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, name, email, phone };
    setCurrentUser(updated);
    const updatedUsers = users.map(u => u.id === currentUser.id ? updated : u);
    setUsers(updatedUsers);
    saveToStorage('cocoon_users', updatedUsers);
    saveToStorage('cocoon_current_user', updated);
    showToast('Cập nhật thông tin thành công!');
  };

  const changePassword = (oldPass: string, newPass: string) => {
    if (!currentUser) return false;
    if (currentUser.password !== oldPass) return false;
    const updated = { ...currentUser, password: newPass };
    setCurrentUser(updated);
    const updatedUsers = users.map(u => u.id === currentUser.id ? updated : u);
    setUsers(updatedUsers);
    saveToStorage('cocoon_users', updatedUsers);
    saveToStorage('cocoon_current_user', updated);
    return true;
  };

  // Render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="header-gradient text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setCurrentPage('home'); setShowCheckout(false); setShowOrderHistory(false); setShowAdmin(false); setShowUserProfile(false); }}>
              <span className="text-3xl">🌿</span>
              <div>
                <h1 className="text-xl font-bold font-playfair">COCOON</h1>
                <p className="text-xs text-green-200">Mỹ phẩm thuần chay Việt Nam</p>
              </div>
            </div>

            {/* Search bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
              <input
                type="text"
                id="search-input"
                placeholder="Tìm kiếm sản phẩm, thành phần..."
                className="w-full px-4 py-2 rounded-l-full text-gray-800 text-sm border-0 focus:ring-2 focus:ring-green-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                id="btn-search"
                className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-r-full transition"
                onClick={() => {}}
              >
                <i className="fas fa-search"></i>
              </button>
            </div>

            {/* Nav buttons */}
            <div className="flex items-center gap-2">
              {currentUser ? (
                <>
                  {currentUser.role === 'admin' && (
                    <button
                      id="btn-admin"
                      className="px-3 py-2 text-sm bg-yellow-600 hover:bg-yellow-700 rounded-lg transition"
                      onClick={() => { setCurrentPage('admin'); setShowAdmin(true); }}
                    >
                      <i className="fas fa-cog mr-1"></i> Admin
                    </button>
                  )}
                  <button
                    id="btn-order-history"
                    className="px-3 py-2 text-sm bg-green-700 hover:bg-green-800 rounded-lg transition"
                    onClick={() => { setCurrentPage('order-history'); setShowOrderHistory(true); }}
                  >
                    <i className="fas fa-history mr-1"></i> Đơn hàng
                  </button>
                  <button
                    id="btn-profile"
                    className="px-3 py-2 text-sm bg-green-700 hover:bg-green-800 rounded-lg transition"
                    onClick={() => { setCurrentPage('profile'); setShowUserProfile(true); }}
                  >
                    <i className="fas fa-user mr-1"></i> {currentUser.name.split(' ').pop()}
                  </button>
                  <button
                    id="btn-logout"
                    className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt"></i>
                  </button>
                </>
              ) : (
                <button
                  id="btn-open-auth"
                  className="px-4 py-2 text-sm bg-white text-green-800 font-semibold rounded-lg hover:bg-green-50 transition"
                  onClick={() => setShowAuthModal(true)}
                >
                  <i className="fas fa-sign-in-alt mr-1"></i> Đăng nhập
                </button>
              )}
              <button
                id="btn-cart"
                className="relative px-3 py-2 text-sm bg-green-700 hover:bg-green-800 rounded-lg transition"
                onClick={() => setShowCart(true)}
              >
                <i className="fas fa-shopping-cart"></i>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden mt-3 flex">
            <input
              type="text"
              id="search-input-mobile"
              placeholder="Tìm kiếm..."
              className="flex-1 px-4 py-2 rounded-l-full text-gray-800 text-sm border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              id="btn-search-mobile"
              className="bg-green-700 px-4 py-2 rounded-r-full"
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {currentPage === 'home' && (
        <main>
          {/* Hero Section */}
          <section className="hero-section py-16 px-4">
            <div className="max-w-7xl mx-auto text-center relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-green-900 font-playfair mb-4">
                Đẹp Tự Nhiên Từ Thiên Nhiên
              </h2>
              <p className="text-lg text-green-700 mb-8 max-w-2xl mx-auto">
                Cocoon - Thương hiệu mỹ phẩm thuần chay đầu tiên tại Việt Nam. 
                100% nguyên liệu từ thiên nhiên, không thử nghiệm trên động vật.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <span className="vegan-badge text-sm px-4 py-2">🌱 100% Thuần chay</span>
                <span className="bg-white/80 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">🐰 Không thử nghiệm trên động vật</span>
                <span className="bg-white/80 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">🇻🇳 Nguyên liệu Việt Nam</span>
              </div>
            </div>
          </section>

          {/* Category Filter */}
          <section className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {['Tất cả', 'Chăm sóc da', 'Chăm sóc tóc', 'Chăm sóc cơ thể', 'Chăm sóc môi'].map(cat => (
                <button
                  key={cat}
                  className={`category-filter ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card" data-product-id={product.id}>
                  {/* Product Image */}
                  <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 p-8 flex items-center justify-center h-48">
                    <span className="text-6xl">{product.image}</span>
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {product.isVegan && <span className="vegan-badge">100% Thuần chay</span>}
                      {product.isPromo && <span className="promo-badge">Khuyến mãi</span>}
                    </div>
                    {!product.inStock && (
                      <div className="absolute top-3 right-3">
                        <span className="out-of-stock-badge">Hết hàng</span>
                      </div>
                    )}
                  </div>
                  {/* Product Info */}
                  <div className="p-4">
                    <p className="text-xs text-green-600 font-semibold mb-1">{product.category}</p>
                    <h3 className="font-semibold text-gray-800 mb-1 cursor-pointer hover:text-green-700"
                      onClick={() => setShowProductDetail(product)}>
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">{product.volume}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-green-800">{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                      )}
                    </div>
                    <button
                      className={`w-full py-2 rounded-lg font-semibold text-sm transition ${
                        product.inStock
                          ? 'btn-primary'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!product.inStock}
                      onClick={() => addToCart(product)}
                      id={`btn-add-cart-${product.id}`}
                    >
                      {product.inStock ? (
                        <><i className="fas fa-cart-plus mr-1"></i> Thêm vào giỏ</>
                      ) : (
                        'Hết hàng'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <i className="fas fa-search text-4xl mb-4 block"></i>
                <p>Không tìm thấy sản phẩm phù hợp.</p>
              </div>
            )}
          </section>

          {/* Free shipping banner */}
          <section className="bg-green-50 py-8 px-4 mt-8">
            <div className="max-w-7xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-green-800 mb-2">🚚 Miễn phí vận chuyển</h3>
              <p className="text-green-600">Cho đơn hàng từ {formatPrice(FREE_SHIPPING_THRESHOLD)}</p>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-green-900 text-white py-12 px-4 mt-12">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h4 className="font-bold text-lg mb-3">🌿 COCOON</h4>
                <p className="text-green-200 text-sm">Mỹ phẩm thuần chay Việt Nam. Đẹp tự nhiên từ thiên nhiên.</p>
              </div>
              <div>
                <h4 className="font-bold mb-3">Liên hệ</h4>
                <p className="text-green-200 text-sm">📞 1900 xxxx</p>
                <p className="text-green-200 text-sm">📧 hello@cocoon.vn</p>
                <p className="text-green-200 text-sm">📍 TP. Hồ Chí Minh, Việt Nam</p>
              </div>
              <div>
                <h4 className="font-bold mb-3">Chính sách</h4>
                <p className="text-green-200 text-sm">• Chính sách đổi trả</p>
                <p className="text-green-200 text-sm">• Chính sách bảo mật</p>
                <p className="text-green-200 text-sm">• Điều khoản sử dụng</p>
              </div>
              <div>
                <h4 className="font-bold mb-3">Testing</h4>
                <button
                  id="btn-selenium-guide"
                  className="text-green-200 text-sm hover:text-white transition flex items-center gap-2 bg-green-800 hover:bg-green-700 px-4 py-2 rounded-lg"
                  onClick={() => setCurrentPage('selenium-guide')}
                >
                  <i className="fas fa-flask"></i> Hướng dẫn Selenium Test
                </button>
                <p className="text-green-300 text-xs mt-2">Xem locator & code mẫu</p>
              </div>
            </div>
            <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-green-700 text-center text-green-300 text-sm">
              © 2024 Cocoon Vietnam. All rights reserved.
            </div>
          </footer>
        </main>
      )}

      {/* Checkout Page */}
      {currentPage === 'checkout' && (
        <CheckoutPage
          cart={cart}
          cartTotal={cartTotal}
          currentUser={currentUser}
          onPlaceOrder={placeOrder}
          onBack={() => setCurrentPage('home')}
          showToast={showToast}
        />
      )}

      {/* Order History Page */}
      {currentPage === 'order-history' && (
        <OrderHistoryPage
          orders={orders.filter(o => o.userId === currentUser?.id)}
          onBack={() => setCurrentPage('home')}
        />
      )}

      {/* Admin Panel */}
      {currentPage === 'admin' && currentUser?.role === 'admin' && (
        <AdminPanel
          orders={orders}
          users={users}
          onUpdateOrderStatus={updateOrderStatus}
          onBack={() => setCurrentPage('home')}
        />
      )}

      {/* User Profile */}
      {currentPage === 'profile' && currentUser && (
        <UserProfilePage
          user={currentUser}
          onUpdateProfile={updateProfile}
          onChangePassword={changePassword}
          onBack={() => setCurrentPage('home')}
          showToast={showToast}
        />
      )}

      {/* Selenium Guide */}
      {currentPage === 'selenium-guide' && (
        <div>
          <div className="max-w-6xl mx-auto px-4 pt-6">
            <button onClick={() => setCurrentPage('home')} className="text-green-700 hover:text-green-900 mb-4 font-medium">
              <i className="fas fa-arrow-left mr-2"></i> Quay lại trang chủ
            </button>
          </div>
          <SeleniumGuide />
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          tab={authTab}
          setTab={setAuthTab}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
          showToast={showToast}
          setCurrentUser={setCurrentUser}
        />
      )}

      {/* Cart Modal */}
      {showCart && (
        <CartModal
          cart={cart}
          cartTotal={cartTotal}
          onUpdateQty={updateCartQty}
          onRemove={removeFromCart}
          onClose={() => setShowCart(false)}
          onCheckout={() => {
            if (!currentUser) {
              setShowCart(false);
              setShowAuthModal(true);
              showToast('Vui lòng đăng nhập để đặt hàng!', 'error');
              return;
            }
            if (cart.length === 0) {
              showToast('Giỏ hàng trống!', 'error');
              return;
            }
            setShowCart(false);
            setCurrentPage('checkout');
          }}
        />
      )}

      {/* Product Detail Modal */}
      {showProductDetail && (
        <ProductDetailModal
          product={showProductDetail}
          onClose={() => setShowProductDetail(null)}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
}

// ============== AUTH MODAL ==============
function AuthModal({ tab, setTab, onClose, onLogin, onRegister, showToast, setCurrentUser }: {
  tab: 'login' | 'register';
  setTab: (t: 'login' | 'register') => void;
  onClose: () => void;
  onLogin: (id: string, pass: string) => { success: boolean; error: string };
  onRegister: (name: string, emailPhone: string, pass: string) => { success: boolean; error: string };
  showToast: (msg: string, type?: string) => void;
  setCurrentUser: (u: User) => void;
}) {
  const [regName, setRegName] = useState('');
  const [regEmailPhone, setRegEmailPhone] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regError, setRegError] = useState('');
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleRegister = () => {
    if (!regName || !regEmailPhone || !regPass) {
      setRegError('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    if (regPass.length < 6) {
      setRegError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }
    const result = onRegister(regName, regEmailPhone, regPass);
    if (result.success) {
      showToast('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
      setTab('login');
      setRegError('');
    } else {
      setRegError(result.error);
    }
  };

  const handleLogin = () => {
    if (!loginId || !loginPass) {
      setLoginError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    const result = onLogin(loginId, loginPass);
    if (result.success) {
      showToast('Đăng nhập thành công!', 'success');
      onClose();
    } else {
      setLoginError(result.error);
    }
  };

  const handleForgot = () => {
    if (!forgotEmail) {
      showToast('Vui lòng nhập email/SĐT!', 'error');
      return;
    }
    showToast('Link khôi phục mật khẩu đã được gửi đến email của bạn!', 'info');
    setShowForgot(false);
  };

  return (
    <div className="modal-overlay" id="auth-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold font-playfair">🌿 COCOON</h2>
            <button onClick={onClose} className="text-white/80 hover:text-white text-xl">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="flex mt-4 gap-0">
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-t-lg transition ${tab === 'login' ? 'bg-white text-green-800' : 'bg-white/20 text-white'}`}
              onClick={() => { setTab('login'); setLoginError(''); }}
            >
              Đăng nhập
            </button>
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-t-lg transition ${tab === 'register' ? 'bg-white text-green-800' : 'bg-white/20 text-white'}`}
              onClick={() => { setTab('register'); setRegError(''); }}
            >
              Đăng ký
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {tab === 'register' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  id="reg-name"
                  placeholder="Nguyễn Văn A"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email / Số điện thoại</label>
                <input
                  type="text"
                  id="reg-email-phone"
                  placeholder="email@example.com hoặc 09xxxxxxxx"
                  value={regEmailPhone}
                  onChange={(e) => setRegEmailPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                <input
                  type="password"
                  id="reg-pass"
                  placeholder="Tối thiểu 6 ký tự"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                />
              </div>
              {regError && <p id="reg-error" className="text-red-500 text-sm font-medium">{regError}</p>}
              <button className="btn-primary w-full" onClick={handleRegister}>
                Đăng ký tài khoản
              </button>
            </div>
          )}

          {tab === 'login' && !showForgot && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập / Email / SĐT</label>
                <input
                  type="text"
                  id="login-id"
                  placeholder="Email, SĐT hoặc tên đăng nhập"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                <input
                  type="password"
                  id="login-pass"
                  placeholder="Nhập mật khẩu"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              {loginError && <p id="login-error" className="text-red-500 text-sm font-medium">{loginError}</p>}
              <button id="btn-login" className="btn-primary w-full" onClick={handleLogin}>
                Đăng nhập
              </button>
              <button
                id="btn-forgot-pass"
                className="w-full text-sm text-green-700 hover:text-green-900 font-medium"
                onClick={() => setShowForgot(true)}
              >
                Quên mật khẩu?
              </button>
              <div className="text-center text-xs text-gray-500 mt-2">
                <p>Admin demo: admin@cocoon.vn / admin123</p>
              </div>
            </div>
          )}

          {tab === 'login' && showForgot && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Khôi phục mật khẩu</h3>
              <p className="text-sm text-gray-500">Nhập email hoặc SĐT đã đăng ký để nhận link khôi phục.</p>
              <input
                type="text"
                id="forgot-email"
                placeholder="Email hoặc SĐT"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
              <button className="btn-primary w-full" onClick={handleForgot}>
                Gửi link khôi phục
              </button>
              <button
                className="w-full text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setShowForgot(false)}
              >
                ← Quay lại đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============== CART MODAL ==============
function CartModal({ cart, cartTotal, onUpdateQty, onRemove, onClose, onCheckout }: {
  cart: CartItem[];
  cartTotal: number;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
  onCheckout: () => void;
}) {
  return (
    <div className="modal-overlay" id="cart-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-green-800">
            <i className="fas fa-shopping-cart mr-2"></i> Giỏ hàng
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <i className="fas fa-shopping-basket text-5xl mb-4"></i>
              <p>Giỏ hàng trống</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-3xl">{item.product.image}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-800">{item.product.name}</h4>
                    <p className="text-green-700 font-bold text-sm">{formatPrice(item.product.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                      onClick={() => onUpdateQty(item.product.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="cart-qty-input"
                      value={item.quantity}
                      min="1"
                      onChange={(e) => onUpdateQty(item.product.id, parseInt(e.target.value) || 1)}
                    />
                    <button
                      className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                      onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="btn-delete-cart-item"
                    onClick={() => onRemove(item.product.id)}
                    title="Xóa"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 border-t bg-gray-50 rounded-b-2xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-medium">Tổng cộng:</span>
              <span id="cart-total-price" className="text-xl font-bold text-green-800">{formatPrice(cartTotal)}</span>
            </div>
            <button className="btn-primary w-full" onClick={onCheckout}>
              <i className="fas fa-credit-card mr-2"></i> Tiến hành đặt hàng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============== PRODUCT DETAIL MODAL ==============
function ProductDetailModal({ product, onClose, onAddToCart }: {
  product: Product;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
}) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-gradient-to-br from-green-50 to-emerald-50 p-12 flex items-center justify-center relative">
            <span className="text-8xl">{product.image}</span>
            <div className="absolute top-4 left-4 flex flex-col gap-1">
              {product.isVegan && <span className="vegan-badge">100% Thuần chay</span>}
              {product.isPromo && <span className="promo-badge">Khuyến mãi</span>}
            </div>
          </div>
          <div className="md:w-1/2 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-green-600 font-semibold">{product.category}</p>
                <h2 className="text-xl font-bold text-gray-800 mt-1">{product.name}</h2>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <p className="text-gray-600 text-sm mt-3">{product.description}</p>
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700">Thành phần: <span className="text-gray-500">{product.ingredients}</span></p>
              <p className="text-sm font-medium text-gray-700 mt-1">Dung tích: <span className="text-gray-500">{product.volume}</span></p>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <span className="text-2xl font-bold text-green-800">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>
            <button
              className={`w-full py-3 rounded-lg font-semibold mt-4 ${product.inStock ? 'btn-primary' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              disabled={!product.inStock}
              onClick={() => { onAddToCart(product); onClose(); }}
            >
              {product.inStock ? <><i className="fas fa-cart-plus mr-2"></i> Thêm vào giỏ hàng</> : 'Sản phẩm hết hàng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== CHECKOUT PAGE ==============
function CheckoutPage({ cart, cartTotal, currentUser, onPlaceOrder, onBack, showToast }: {
  cart: CartItem[];
  cartTotal: number;
  currentUser: User | null;
  onPlaceOrder: (name: string, phone: string, address: string, payment: string, couponDiscount: number) => Order;
  onBack: () => void;
  showToast: (msg: string, type?: string) => void;
}) {
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponInput, setCouponInput] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);

  const addressLower = address.toLowerCase();
  let shippingFee = SHIPPING_FEE_MAP['default'];
  if (addressLower.includes('hcm') || addressLower.includes('hồ chí minh') || addressLower.includes('sài gòn')) {
    shippingFee = SHIPPING_FEE_MAP['hcm'];
  } else if (addressLower.includes('hà nội') || addressLower.includes('hn')) {
    shippingFee = SHIPPING_FEE_MAP['hn'];
  } else if (addressLower.includes('đà nẵng') || addressLower.includes('danang')) {
    shippingFee = SHIPPING_FEE_MAP['danang'];
  }
  if (cartTotal >= FREE_SHIPPING_THRESHOLD) shippingFee = 0;

  const finalTotal = Math.max(0, cartTotal - couponDiscount + shippingFee);

  const handleApplyCoupon = () => {
    const coupon = COUPONS.find(c => c.code === couponInput.toUpperCase());
    if (!coupon) {
      showToast('Mã giảm giá không hợp lệ!', 'error');
      return;
    }
    if (cartTotal < coupon.minOrder) {
      showToast(`Đơn hàng tối thiểu ${formatPrice(coupon.minOrder)} để áp dụng mã này!`, 'error');
      return;
    }
    const discount = Math.round(cartTotal * coupon.discount / 100);
    setCouponDiscount(discount);
    showToast(`Áp dụng mã ${coupon.code} giảm ${coupon.discount}%!`, 'success');
  };

  const handleSubmitOrder = () => {
    if (!name || !phone || !address) {
      showToast('Vui lòng điền đầy đủ thông tin giao hàng!', 'error');
      return;
    }
    const order = onPlaceOrder(name, phone, address, paymentMethod, couponDiscount);
    setOrderSuccess(order);
  };

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Đặt hàng thành công!</h2>
          <p id="order-success-msg" className="text-gray-600 mb-4">
            Mã đơn hàng của bạn: <strong className="text-green-700">{orderSuccess.id}</strong>
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
            <p className="text-sm text-gray-600">Tổng tiền: <strong>{formatPrice(orderSuccess.finalTotal)}</strong></p>
            <p className="text-sm text-gray-600">Thanh toán: <strong>{orderSuccess.paymentMethod === 'cod' ? 'COD (Thanh toán khi nhận hàng)' : 'Online (VNPay/MoMo)'}</strong></p>
            <p className="text-sm text-gray-600">Trạng thái: <span className="status-pending">Chờ xử lý</span></p>
          </div>
          <button className="btn-primary" onClick={onBack}>
            <i className="fas fa-home mr-2"></i> Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="checkout-section" className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={onBack} className="text-green-700 hover:text-green-900 mb-6 font-medium">
        <i className="fas fa-arrow-left mr-2"></i> Quay lại
      </button>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Thanh toán & Đặt hàng</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4"><i className="fas fa-truck mr-2 text-green-600"></i> Thông tin giao hàng</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                <input type="text" id="checkout-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                <input type="tel" id="checkout-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xxxxxxxx" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng *</label>
              <textarea id="checkout-address" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..." />
            </div>
          </div>

          {/* Coupon */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4"><i className="fas fa-tag mr-2 text-green-600"></i> Mã giảm giá</h3>
            <div className="flex gap-2">
              <input
                type="text"
                id="coupon-input"
                placeholder="Nhập mã giảm giá (VD: COCOON10)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1"
              />
              <button id="btn-apply-coupon" className="btn-secondary whitespace-nowrap" onClick={handleApplyCoupon}>
                Áp dụng
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Thử: COCOON10, VEGAN20, NEWUSER</p>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4"><i className="fas fa-credit-card mr-2 text-green-600"></i> Phương thức thanh toán</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment-method" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} />
                <span className="font-medium">💵 COD - Thanh toán khi nhận hàng</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment-method" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={(e) => setPaymentMethod(e.target.value)} />
                <span className="font-medium">🏦 VNPay - Thanh toán online</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment-method" value="momo" checked={paymentMethod === 'momo'} onChange={(e) => setPaymentMethod(e.target.value)} />
                <span className="font-medium">📱 MoMo - Ví điện tử</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h3 className="font-bold text-gray-800 mb-4">Đơn hàng ({cart.length} sản phẩm)</h3>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center gap-2 text-sm">
                  <span className="text-xl">{item.product.image}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-700 text-xs">{item.product.name}</p>
                    <p className="text-gray-500 text-xs">x{item.quantity}</p>
                  </div>
                  <span className="font-semibold text-green-700 text-xs">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span id="shipping-fee">{shippingFee === 0 ? <span className="text-green-600 font-semibold">Miễn phí</span> : formatPrice(shippingFee)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Giảm giá:</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Tổng cộng:</span>
                <span className="text-green-800">{formatPrice(finalTotal)}</span>
              </div>
            </div>
            <button id="btn-submit-order" className="btn-primary w-full mt-4" onClick={handleSubmitOrder}>
              <i className="fas fa-check-circle mr-2"></i> Đặt hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== ORDER HISTORY PAGE ==============
function OrderHistoryPage({ orders, onBack }: {
  orders: Order[];
  onBack: () => void;
}) {
  return (
    <div id="order-history-section" className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={onBack} className="text-green-700 hover:text-green-900 mb-6 font-medium">
        <i className="fas fa-arrow-left mr-2"></i> Quay lại
      </button>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        <i className="fas fa-history mr-2 text-green-600"></i> Lịch sử đơn hàng
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl">
          <i className="fas fa-box-open text-5xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                <div>
                  <p className="font-bold text-gray-800">#{order.id}</p>
                  <p className="text-xs text-gray-500">{order.createdAt}</p>
                </div>
                <span className={
                  order.status === 'pending' ? 'status-pending' :
                  order.status === 'shipping' ? 'status-shipping' : 'status-completed'
                }>
                  {order.status === 'pending' ? 'Chờ xử lý' : order.status === 'shipping' ? 'Đang giao' : 'Đã hoàn thành'}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                {order.items.map(item => (
                  <p key={item.product.id}>{item.product.image} {item.product.name} x{item.quantity}</p>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t flex justify-between items-center">
                <span className="text-sm text-gray-500">Thanh toán: {order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod.toUpperCase()}</span>
                <span className="font-bold text-green-800">{formatPrice(order.finalTotal)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============== ADMIN PANEL ==============
function AdminPanel({ orders, users, onUpdateOrderStatus, onBack }: {
  orders: Order[];
  users: User[];
  onUpdateOrderStatus: (id: string, status: Order['status']) => void;
  onBack: () => void;
}) {
  const [adminTab, setAdminTab] = useState<'orders' | 'users'>('orders');

  return (
    <div id="admin-panel" className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={onBack} className="text-green-700 hover:text-green-900 mb-6 font-medium">
        <i className="fas fa-arrow-left mr-2"></i> Quay lại
      </button>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        <i className="fas fa-cog mr-2 text-yellow-600"></i> Bảng điều khiển quản trị
      </h2>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`tab-btn ${adminTab === 'orders' ? 'active' : ''}`}
          onClick={() => setAdminTab('orders')}
        >
          <i className="fas fa-box mr-1"></i> Đơn hàng ({orders.length})
        </button>
        <button
          className={`tab-btn ${adminTab === 'users' ? 'active' : ''}`}
          onClick={() => setAdminTab('users')}
        >
          <i className="fas fa-users mr-1"></i> Người dùng ({users.filter(u => u.role !== 'admin').length})
        </button>
      </div>

      {adminTab === 'orders' && (
        <div id="admin-order-list" className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-xl">
              <i className="fas fa-inbox text-4xl mb-3"></i>
              <p>Chưa có đơn hàng nào.</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                  <div>
                    <p className="font-bold text-gray-800">#{order.id}</p>
                    <p className="text-sm text-gray-500">Khách: {order.customerName} | SĐT: {order.customerPhone}</p>
                    <p className="text-xs text-gray-400">Địa chỉ: {order.customerAddress}</p>
                    <p className="text-xs text-gray-400">{order.createdAt}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-800">{formatPrice(order.finalTotal)}</p>
                    <p className="text-xs text-gray-500">{order.paymentMethod.toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {order.items.map(item => (
                    <span key={item.product.id} className="inline-block mr-3">{item.product.image} {item.product.name} x{item.quantity}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
                  <select
                    value={order.status}
                    onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                    className="text-sm border rounded-lg px-3 py-1.5"
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="shipping">Đang giao</option>
                    <option value="completed">Đã hoàn thành</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {adminTab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">Tên</th>
                <th className="text-left p-4 font-semibold text-gray-700">Email</th>
                <th className="text-left p-4 font-semibold text-gray-700">SĐT</th>
                <th className="text-left p-4 font-semibold text-gray-700">Vai trò</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">{user.email || '-'}</td>
                  <td className="p-4">{user.phone || '-'}</td>
                  <td className="p-4">
                    <span className={user.role === 'admin' ? 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold' : 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold'}>
                      {user.role === 'admin' ? 'Admin' : 'Khách hàng'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============== USER PROFILE PAGE ==============
function UserProfilePage({ user, onUpdateProfile, onChangePassword, onBack, showToast }: {
  user: User;
  onUpdateProfile: (name: string, email: string, phone: string) => void;
  onChangePassword: (oldPass: string, newPass: string) => boolean;
  onBack: () => void;
  showToast: (msg: string, type?: string) => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleUpdateProfile = () => {
    onUpdateProfile(name, email, phone);
    showToast('Cập nhật thông tin thành công!');
  };

  const handleChangePassword = () => {
    if (!oldPass || !newPass || !confirmPass) {
      showToast('Vui lòng điền đầy đủ thông tin!', 'error');
      return;
    }
    if (newPass !== confirmPass) {
      showToast('Mật khẩu mới không khớp!', 'error');
      return;
    }
    if (newPass.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
      return;
    }
    const success = onChangePassword(oldPass, newPass);
    if (success) {
      showToast('Đổi mật khẩu thành công!');
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      showToast('Mật khẩu hiện tại không đúng!', 'error');
    }
  };

  return (
    <div id="user-profile-section" className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={onBack} className="text-green-700 hover:text-green-900 mb-6 font-medium">
        <i className="fas fa-arrow-left mr-2"></i> Quay lại
      </button>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        <i className="fas fa-user-circle mr-2 text-green-600"></i> Quản lý tài khoản
      </h2>

      <div className="space-y-6">
        {/* Profile Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Thông tin cá nhân</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input type="text" id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" id="profile-email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input type="tel" id="profile-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <button className="btn-primary" onClick={handleUpdateProfile}>
              <i className="fas fa-save mr-2"></i> Lưu thay đổi
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Đổi mật khẩu</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
              <input type="password" id="old-password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
              <input type="password" id="new-password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
              <input type="password" id="confirm-password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
            </div>
            <button className="btn-primary" onClick={handleChangePassword}>
              <i className="fas fa-key mr-2"></i> Đổi mật khẩu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
