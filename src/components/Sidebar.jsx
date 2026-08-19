import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, FileText, Package, Users, FolderOpen, Building2, FileChartColumn, Settings, } from "lucide-react";

const adminMenu = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Borrow Requests", path: "/admin/borrow-requests", icon: FileText },
  { label: "Equipments", path: "/admin/equipments", icon: Package },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Categories", path: "/admin/categories", icon: FolderOpen },
  { label: "Companies", path: "/admin/companies", icon: Building2 },
  { label: "Reports", path: "/admin/reports", icon: FileChartColumn },
  { label: "Settings", path: "/settings", icon: Settings },
];

const userMenu = [
  { label: "Equipments", path: "/user/equipments", icon: Package },
  { label: "Borrow Requests", path: "/user/my-borrow-requests", icon: FileText, },
  { label: "Settings", path: "/settings", icon: Settings },
];

function Sidebar({ isOpen, onClose }) {
  const role = localStorage.getItem("role");
  const location = useLocation();
  const menu = role === "admin" ? adminMenu : userMenu;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 top-16 bg-black z-20 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-16 left-0 z-30 w-64 sm:w-56 max-w-[80vw] h-[calc(100vh-4rem)] bg-white border-r border-slate-100 overflow-y-auto shadow-sm transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <nav className="p-3 sm:p-4 space-y-1">
          {menu.map((item, idx) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
              >
                <Link
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-(length:--font-size-body-md) font-medium transition-colors touch-manipulation ${isActive ? "bg-sidebar-active text-primary border-l-4 border-primary -ml-1 pl-3.5 shadow-xs" : "text-text-muted hover:bg-slate-50 hover:text-primary"}`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
