import { Product, Coupon } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Tẩy da chết cà phê Đắk Lắk',
    category: 'Chăm sóc cơ thể',
    price: 185000,
    originalPrice: 220000,
    image: '☕',
    description: 'Tẩy tế bào chết toàn thân từ hạt cà phê Đắk Lắk nguyên chất, giúp loại bỏ tế bào chết, làm sáng da và kích thích tuần hoàn máu.',
    ingredients: 'Hạt cà phê Đắk Lắk, đường nâu, dầu dừa, vitamin E',
    volume: '200ml',
    inStock: true,
    isVegan: true,
    isPromo: true,
  },
  {
    id: 'p2',
    name: 'Gel rửa mặt bí đao',
    category: 'Chăm sóc da',
    price: 145000,
    image: '🥒',
    description: 'Gel rửa mặt dịu nhẹ chiết xuất từ bí đao, giúp làm sạch sâu, kiểm soát dầu và se khít lỗ chân lông.',
    ingredients: 'Bí đao, trà xanh, rau má, nha đam',
    volume: '150ml',
    inStock: true,
    isVegan: true,
    isPromo: false,
  },
  {
    id: 'p3',
    name: 'Nước tẩy trang hoa hồng',
    category: 'Chăm sóc da',
    price: 165000,
    image: '🌹',
    description: 'Nước tẩy trang nhẹ nhàng từ hoa hồng Bulgari, loại bỏ lớp trang điểm và bụi bẩn mà không gây khô da.',
    ingredients: 'Nước hoa hồng, glycerin thực vật, chiết xuất cúc La Mã',
    volume: '200ml',
    inStock: true,
    isVegan: true,
    isPromo: false,
  },
  {
    id: 'p4',
    name: 'Tinh dầu bưởi kích thích mọc tóc',
    category: 'Chăm sóc tóc',
    price: 195000,
    originalPrice: 250000,
    image: '🍊',
    description: 'Tinh dầu bưởi nguyên chất giúp kích thích mọc tóc, giảm rụng tóc và nuôi dưỡng da đầu khỏe mạnh.',
    ingredients: 'Tinh dầu bưởi, vitamin B5, hà thủ ô, bồ kết',
    volume: '140ml',
    inStock: true,
    isVegan: true,
    isPromo: true,
  },
  {
    id: 'p5',
    name: 'Son dưỡng dừa',
    category: 'Chăm sóc môi',
    price: 125000,
    image: '💋',
    description: 'Son dưỡng môi từ dầu dừa nguyên chất, cung cấp độ ẩm sâu, giúp môi mềm mại và căng mọng tự nhiên.',
    ingredients: 'Dầu dừa, sáp ong, vitamin E, dầu hạnh nhân',
    volume: '15g',
    inStock: true,
    isVegan: false,
    isPromo: false,
  },
  {
    id: 'p6',
    name: 'Sữa tắm nghệ & sữa chua',
    category: 'Chăm sóc cơ thể',
    price: 175000,
    image: '🧴',
    description: 'Sữa tắm từ nghệ tươi và sữa chua giúp làm sáng da, mờ thâm và nuôi dưỡng làn da mịn màng.',
    ingredients: 'Nghệ tươi, sữa chua, dầu olive, mật ong',
    volume: '250ml',
    inStock: true,
    isVegan: true,
    isPromo: false,
  },
  {
    id: 'p7',
    name: 'Dầu gội vỏ bưởi',
    category: 'Chăm sóc tóc',
    price: 165000,
    image: '🧴',
    description: 'Dầu gội từ vỏ bưởi và bồ kết giúp làm sạch da đầu, giảm gàu và kích thích tóc mọc nhanh.',
    ingredients: 'Vỏ bưởi, bồ kết, hương nhu, sả',
    volume: '250ml',
    inStock: false,
    isVegan: true,
    isPromo: false,
  },
  {
    id: 'p8',
    name: 'Kem dưỡng da hoa cúc',
    category: 'Chăm sóc da',
    price: 225000,
    originalPrice: 280000,
    image: '🌼',
    description: 'Kem dưỡng ẩm từ hoa cúc và nha đam, giúp làm dịu da kích ứng, cấp ẩm và phục hồi hàng rào bảo vệ da.',
    ingredients: 'Hoa cúc, nha đam, dầu jojoba, vitamin B5',
    volume: '50ml',
    inStock: true,
    isVegan: true,
    isPromo: true,
  },
];

export const COUPONS: Coupon[] = [
  { code: 'COCOON10', discount: 10, minOrder: 300000 },
  { code: 'VEGAN20', discount: 20, minOrder: 500000 },
  { code: 'NEWUSER', discount: 15, minOrder: 200000 },
];

export const FREE_SHIPPING_THRESHOLD = 500000;

export const SHIPPING_FEE_MAP: Record<string, number> = {
  'hcm': 25000,
  'hn': 30000,
  'danang': 35000,
  'default': 40000,
};

export const ADMIN_ACCOUNT = {
  id: 'admin-001',
  name: 'Admin Cocoon',
  email: 'admin@cocoon.vn',
  phone: '0909000001',
  password: 'admin123',
  role: 'admin' as const,
};

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}
