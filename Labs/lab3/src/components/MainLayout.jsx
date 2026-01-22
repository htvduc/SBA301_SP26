import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useState } from "react";
import { useContext } from "react";
import AuthContext from "../stores/AuthContext";

function MainLayout() {
  const [searchTerm, setSearchTerm] = useState("");
  const authContext = useContext(AuthContext);
  const { logout } = authContext;

  return (
    <>
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onLogout={logout}
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