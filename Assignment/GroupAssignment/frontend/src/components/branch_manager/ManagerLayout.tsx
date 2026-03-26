import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import ManagerSidebar from "./ManagerSidebar";

const ManagerLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <ManagerSidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ManagerLayout;
