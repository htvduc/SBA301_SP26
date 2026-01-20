import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useState } from "react";

function MainLayout({ isAuthenticated, onLogout }) {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isAuthenticated) {
    return <Outlet context={{ searchTerm: "" }} />;
  }

  return (
    <>
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onLogout={onLogout}
      />

      <main style={{ minHeight: "70vh" }} className="mt-4">

        <Outlet context={{ searchTerm }} />
      </main>

      <Footer
        avatar="/images/avatar.jpg"
        name="DucHTV"
        email="hoangtongvietduc@gmail.com"
      />
    </>
  );
}

export default MainLayout;
