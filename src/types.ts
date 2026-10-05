export interface Course {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  prevPrice?: number;
  discount?: number;
  status: 'published' | 'draft';
  image: string;
  features: string[];
  learnings: string[];
  duration: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  prevPrice?: number;
  discount?: number;
  status: 'published' | 'draft';
  image: string;
  features: string[];
  learnings: string[];
  duration: string;
}

export interface Offer {
  id: string;
  name: string;
  description: string;
  productOrCourse: string;
  price: number;
  prevPrice?: number;
  discount?: number;
  image: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  productName: string;
  amount: number;
  paymentMethod: 'bKash' | 'Nagad';
  transactionId: string;
  date: string;
  status: 'Pending' | 'Verified' | 'Rejected' | 'Completed';
}

export interface HeroSettings {
  heading: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  badge: string;
  promoText: string;
  image: string;
}

export interface PaymentProvider {
  enabled: boolean;
  number: string;
  instructions: string;
}

export interface PaymentSettings {
  bkash: PaymentProvider;
  nagad: PaymentProvider;
}

export interface AppSettings {
  promoBar: {
    text: string;
    enabled: boolean;
  };
  payment: PaymentSettings;
  adminPassword?: string;
}

export interface PublicDB {
  hero: HeroSettings;
  settings: {
    promoBar: {
      text: string;
      enabled: boolean;
    };
    payment: PaymentSettings;
  };
  courses: Course[];
  products: Product[];
  offers: Offer[];
}
