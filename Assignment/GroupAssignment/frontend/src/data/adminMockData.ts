// ── Types ──

export type UserRole = "ADMIN" | "OWNER" | "STAFF" | "CUSTOMER";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  restaurants?: string[];     // restaurant ids for OWNER
  subscription?: string;      // package id
  activityHistory: { date: string; action: string }[];
}



// ── Stats mock ──

export const adminStats = {
  totalUsers: 1234,
  totalRestaurants: 89,
  activeSubscriptions: 67,
  monthlyRevenue: 12450,
};

export const userGrowthData = [
  { month: "Oct", users: 820 },
  { month: "Nov", users: 910 },
  { month: "Dec", users: 980 },
  { month: "Jan", users: 1050 },
  { month: "Feb", users: 1140 },
  { month: "Mar", users: 1234 },
];

export const packageDistribution = [
  { name: "Basic", value: 40, fill: "hsl(var(--primary))" },
  { name: "Pro", value: 35, fill: "hsl(var(--accent))" },
  { name: "Premium", value: 25, fill: "hsl(var(--violet))" },
];

// ── Users mock ──

export const mockAdminUsers: AdminUser[] = [
  {
    id: "u1", fullName: "Admin Master", email: "admin@restohub.com", role: "ADMIN",
    isActive: true, createdAt: "2024-01-15",
    activityHistory: [
      { date: "2025-03-05", action: "Updated package pricing" },
      { date: "2025-03-01", action: "Deactivated user u5" },
    ],
  },
  {
    id: "u2", fullName: "Nguyen Van A", email: "a.nguyen@phohanoi.com", role: "OWNER",
    isActive: true, createdAt: "2024-03-22", restaurants: ["r1"], subscription: "pkg2",
    activityHistory: [
      { date: "2025-03-04", action: "Created new menu item" },
      { date: "2025-02-28", action: "Added branch" },
    ],
  },
  {
    id: "u3", fullName: "Tanaka Yuki", email: "yuki@sushisakura.com", role: "OWNER",
    isActive: true, createdAt: "2024-05-10", restaurants: ["r2"], subscription: "pkg3",
    activityHistory: [
      { date: "2025-03-03", action: "Updated restaurant settings" },
    ],
  },
  {
    id: "u4", fullName: "Marco Rossi", email: "marco@pizzaroma.com", role: "OWNER",
    isActive: true, createdAt: "2024-07-01", restaurants: ["r3"], subscription: "pkg1",
    activityHistory: [
      { date: "2025-03-02", action: "Invited staff member" },
    ],
  },
  {
    id: "u5", fullName: "Tran Thi B", email: "b.tran@phohanoi.com", role: "STAFF",
    isActive: true, createdAt: "2024-08-15",
    activityHistory: [
      { date: "2025-03-01", action: "Processed 15 orders" },
    ],
  },
  {
    id: "u6", fullName: "Le Van C", email: "c.le@phohanoi.com", role: "STAFF",
    isActive: false, createdAt: "2024-09-20",
    activityHistory: [
      { date: "2025-01-15", action: "Account deactivated" },
    ],
  },
  {
    id: "u7", fullName: "Customer One", email: "customer1@gmail.com", role: "CUSTOMER",
    isActive: true, createdAt: "2025-01-05",
    activityHistory: [
      { date: "2025-03-05", action: "Placed order #1234" },
    ],
  },
  {
    id: "u8", fullName: "Customer Two", email: "customer2@gmail.com", role: "CUSTOMER",
    isActive: true, createdAt: "2025-02-14",
    activityHistory: [
      { date: "2025-03-04", action: "Left a review" },
    ],
  },
];
