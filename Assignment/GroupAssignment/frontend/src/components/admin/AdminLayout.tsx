import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutProps {}

const AdminLayout = ({}: AdminLayoutProps) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full">
      <AdminSidebar />
      <main className="flex-1 bg-background overflow-auto">
        <Outlet />
      </main>
    </div>
  </SidebarProvider>
);

export default AdminLayout;
