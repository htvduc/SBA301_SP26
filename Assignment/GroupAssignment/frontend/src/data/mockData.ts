export interface Branch {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  sold: number;
  revenue: number;
}

export interface DailyCustomers {
  date: string;
  customers: number;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  logo: string;
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  branches: Branch[];
  topSellers: MenuItem[];
  dailyCustomers: DailyCustomers[];
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "manager" | "waiter" | "receptionist";
  branchId: string;
  isActive: boolean;
}

export const mockStaff: StaffMember[] = [
  { id: "s1", name: "Nguyen Van A", email: "a.nguyen@phohanoi.com", phone: "0901234567", role: "manager", branchId: "b1", isActive: true },
  { id: "s2", name: "Tran Thi B", email: "b.tran@phohanoi.com", phone: "0912345678", role: "waiter", branchId: "b1", isActive: true },
  { id: "s3", name: "Le Van C", email: "c.le@phohanoi.com", phone: "0923456789", role: "receptionist", branchId: "b1", isActive: true },
  { id: "s4", name: "Pham Thi D", email: "d.pham@phohanoi.com", phone: "0934567890", role: "waiter", branchId: "b1", isActive: false },
  { id: "s5", name: "Hoang Van E", email: "e.hoang@phohanoi.com", phone: "0945678901", role: "manager", branchId: "b2", isActive: true },
  { id: "s6", name: "Vo Thi F", email: "f.vo@phohanoi.com", phone: "0956789012", role: "waiter", branchId: "b2", isActive: true },
  { id: "s7", name: "Do Van G", email: "g.do@sushisakura.com", phone: "0967890123", role: "manager", branchId: "b4", isActive: true },
  { id: "s8", name: "Bui Thi H", email: "h.bui@sushisakura.com", phone: "0978901234", role: "receptionist", branchId: "b4", isActive: true },
  { id: "s9", name: "Dang Van I", email: "i.dang@sushisakura.com", phone: "0989012345", role: "waiter", branchId: "b5", isActive: true },
  { id: "s10", name: "Ngo Thi K", email: "k.ngo@pizzaroma.com", phone: "0990123456", role: "manager", branchId: "b6", isActive: true },
  { id: "s11", name: "Ly Van L", email: "l.ly@pizzaroma.com", phone: "0901234568", role: "waiter", branchId: "b6", isActive: true },
];

export const mockRestaurants: Restaurant[] = [
  {
    id: "r1",
    name: "Pho Hanoi",
    cuisine: "Vietnamese",
    logo: "🍜",
    totalRevenue: 525000,
    monthlyRevenue: 78000,
    totalOrders: 42500,
    branches: [
      { id: "b1", name: "District 1 Branch", address: "123 Nguyen Hue, District 1, HCMC", isActive: true },
      { id: "b2", name: "District 3 Branch", address: "456 Vo Van Tan, District 3, HCMC", isActive: true },
      { id: "b3", name: "District 7 Branch", address: "789 Nguyen Thi Thap, District 7, HCMC", isActive: false },
    ],
    topSellers: [
      { id: "m1", name: "Rare Beef Pho", sold: 8500, revenue: 178500 },
      { id: "m2", name: "Chicken Pho", sold: 6200, revenue: 117800 },
      { id: "m3", name: "Spicy Beef Noodle Soup", sold: 4800, revenue: 100800 },
      { id: "m4", name: "Steamed Rice Rolls", sold: 3500, revenue: 52500 },
      { id: "m5", name: "Fresh Spring Rolls", sold: 3100, revenue: 40300 },
    ],
    dailyCustomers: [
      { date: "Mon", customers: 245 },
      { date: "Tue", customers: 312 },
      { date: "Wed", customers: 289 },
      { date: "Thu", customers: 356 },
      { date: "Fri", customers: 423 },
      { date: "Sat", customers: 512 },
      { date: "Sun", customers: 478 },
    ],
  },
  {
    id: "r2",
    name: "Sushi Sakura",
    cuisine: "Japanese",
    logo: "🍣",
    totalRevenue: 890000,
    monthlyRevenue: 135000,
    totalOrders: 28000,
    branches: [
      { id: "b4", name: "Thao Dien Branch", address: "12 Xuan Thuy, District 2, HCMC", isActive: true },
      { id: "b5", name: "Phu My Hung Branch", address: "88 Nguyen Duc Canh, District 7, HCMC", isActive: true },
    ],
    topSellers: [
      { id: "m6", name: "Sashimi Combo", sold: 5200, revenue: 328000 },
      { id: "m7", name: "Dragon Roll", sold: 4100, revenue: 155800 },
      { id: "m8", name: "Tonkotsu Ramen", sold: 3800, revenue: 114000 },
      { id: "m9", name: "Gyoza", sold: 3200, revenue: 54400 },
      { id: "m10", name: "Tempura Set", sold: 2900, revenue: 87000 },
    ],
    dailyCustomers: [
      { date: "Mon", customers: 156 },
      { date: "Tue", customers: 178 },
      { date: "Wed", customers: 198 },
      { date: "Thu", customers: 223 },
      { date: "Fri", customers: 289 },
      { date: "Sat", customers: 345 },
      { date: "Sun", customers: 312 },
    ],
  },
  {
    id: "r3",
    name: "Pizza Roma",
    cuisine: "Italian",
    logo: "🍕",
    totalRevenue: 375000,
    monthlyRevenue: 62000,
    totalOrders: 18500,
    branches: [
      { id: "b6", name: "Binh Thanh Branch", address: "321 Dien Bien Phu, Binh Thanh, HCMC", isActive: true },
    ],
    topSellers: [
      { id: "m11", name: "Margherita", sold: 4200, revenue: 105000 },
      { id: "m12", name: "Pepperoni", sold: 3600, revenue: 108000 },
      { id: "m13", name: "Pasta Carbonara", sold: 2800, revenue: 72800 },
      { id: "m14", name: "Tiramisu", sold: 2100, revenue: 35700 },
      { id: "m15", name: "Bruschetta", sold: 1800, revenue: 23400 },
    ],
    dailyCustomers: [
      { date: "Mon", customers: 98 },
      { date: "Tue", customers: 112 },
      { date: "Wed", customers: 134 },
      { date: "Thu", customers: 145 },
      { date: "Fri", customers: 189 },
      { date: "Sat", customers: 234 },
      { date: "Sun", customers: 201 },
    ],
  },
];
