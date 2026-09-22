export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  ingredients: string;
  volume: string;
  inStock: boolean;
  isVegan: boolean;
  isPromo: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'admin';
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: CartItem[];
  total: number;
  shippingFee: number;
  couponDiscount: number;
  finalTotal: number;
  status: 'pending' | 'shipping' | 'completed';
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discount: number; // percentage
  minOrder: number;
}
