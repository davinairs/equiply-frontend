import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="md:ml-56 pt-20 sm:pt-24 md:pt-24 px-4 sm:px-6 md:px-10 pb-4 sm:pb-6 md:pb-10 min-h-screen">
        {children}
      </main>
    </div>
  );
}

export default Layout;
