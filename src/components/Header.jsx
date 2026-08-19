import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, Bell, Settings, LogOut, ArrowLeft, } from "lucide-react";
import api from "../services/api";
import logo from "../assets/logo.png";

function Header({ onToggleSidebar }) {
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [profile, setProfile] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [equipments, setEquipments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);

  const [showResults, setShowResults] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  const avatarRef = useRef(null);
  const searchRef = useRef(null);

  const role = localStorage.getItem("role");

  const equipmentBasePath =
    role === "admin" ? "/admin/equipments" : "/user/equipments";

  const categoryBasePath = "/admin/categories";
  const companyBasePath = "/admin/companies";
  const userBasePath = "/admin/users";

  useEffect(() => {
    api
      .get("/notifications")
      .then((res) => {
        setUnreadCount(
          res.data.filter((notification) => !notification.isRead).length
        );
      })
      .catch(() => {});

    api
      .get("/users/me")
      .then((res) => {
        setProfile(res.data);
      })
      .catch(() => {});

    api
      .get("/equipments")
      .then((res) => {
        setEquipments(res.data);
      })
      .catch(() => {});

    api
      .get("/categories")
      .then((res) => {
        setCategories(res.data);
      })
      .catch(() => {});

    if (role === "admin") {
      api
        .get("/companies")
        .then((res) => {
          setCompanies(res.data);
        })
        .catch(() => {});

      api
        .get("/users")
        .then((res) => {
          setUsers(res.data);
        })
        .catch(() => {});
    }
  }, [role]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        avatarRef.current &&
        !avatarRef.current.contains(e.target)
      ) {
        setShowAvatarMenu(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(e.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const equipmentResults = searchQuery.trim()
    ? equipments
        .filter(
          (equipment) =>
            equipment.equipmentName
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            (equipment.category &&
              equipment.category.categoryName
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()))
        )
        .map((equipment) => ({
          type: "Equipment",
          label: equipment.equipmentName,
          path: `${equipmentBasePath}?search=${encodeURIComponent(equipment.equipmentName)}`,
        }))
    : [];

const categoryResults = searchQuery.trim()
    ? categories
        .filter((category) =>
          category.categoryName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
        .map((category) => ({
          type: "Category",
          label: category.categoryName,
          path: `${equipmentBasePath}?search=${encodeURIComponent(category.categoryName)}`,
        }))
    : [];

  const companyResults =
    role === "admin" && searchQuery.trim()
      ? companies
          .filter((company) =>
            company.companyName
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
          .map((company) => ({
            type: "Company",
            label: company.companyName,
            path: `${companyBasePath}?search=${encodeURIComponent(company.companyName)}`,
          }))
      : [];

  const userResults =
    role === "admin" && searchQuery.trim()
      ? users
          .filter((u) =>
            (u.fullName || u.username)
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
          .map((u) => ({
            type: "User",
            label: u.fullName || u.username,
            path: `${userBasePath}?search=${encodeURIComponent(u.fullName || u.username)}`,
          }))
      : [];

  const combinedResults = [
    ...equipmentResults,
    ...categoryResults,
    ...companyResults,
    ...userResults,
  ].slice(0, 6);

  const goToSearchResult = () => {
    const query = searchQuery.trim();

    if (!query) return;

    navigate(
      `${equipmentBasePath}?search=${encodeURIComponent(query)}`
    );

    setShowResults(false);
    setSearchQuery("");
    setMobileSearchOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      goToSearchResult();
    }
  };

  const handleSearchResultClick = (e, path) => {
    e.preventDefault();
    e.stopPropagation();

    if (!path) return;

    setShowResults(false);
    setSearchQuery("");
    setMobileSearchOpen(false);

    navigate(path);
  };

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
    setShowResults(false);
    setSearchQuery("");
  };

  const handleNotificationClick = async () => {
    setUnreadCount(0);

    try {
      await api.patch("/notifications/read");
    } catch (err) {
      console.error(
        "Failed to mark notifications as read:",
        err
      );
    }

    navigate("/notification");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const initial =
    profile?.fullName?.charAt(0).toUpperCase() || "?";

const renderResultsList = () => (
    <>
      {combinedResults.map((result, index) => (
        <button
          key={`${result.type}-${result.label}-${index}`}
          type="button"
          onMouseDown={(e) => handleSearchResultClick(e, result.path)}
          className="w-full flex items-center px-4 py-3 text-left hover:bg-slate-50 --font-size-sm transition-colors cursor-pointer border-b border-slate-50 last:border-none"
        >
          <span className="truncate text-text-primary text-(length:--font-size-caption) font-medium">
            {result.label}
          </span>
        </button>
      ))}

      {combinedResults.length === 0 && (
        <p className="px-4 py-3 text-text-muted text-(length:--font-size-body-sm) text-center">
          No results found
        </p>
      )}
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-3 sm:px-6">
      {!mobileSearchOpen && (
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-text-muted hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
          >
            <Menu size={20} />
          </button>

          <img
            src={logo}
            alt="Equiply"
            className="h-6 sm:h-7 md:h-8 cursor-pointer shrink-0"
            onClick={() =>
              navigate(role === "admin" ? "/admin/dashboard" : "/user/equipments")
            }
          />
        </div>
      )}

      {mobileSearchOpen && (
        <div className="sm:hidden flex items-center gap-2 flex-1 min-w-0">
          <button
            type="button"
            onClick={closeMobileSearch}
            className="shrink-0 p-2 -ml-2 rounded-lg text-text-muted hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="relative flex-1 min-w-0" ref={searchRef}>
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            />
            <input
              type="text"
              autoFocus
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onKeyDown={handleKeyDown}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-(length:--font-size-caption) text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
            {showResults && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-11 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20 text-left">
                {renderResultsList()}
              </div>
            )}
          </div>
        </div>
      )}

      <div
        className={`items-center gap-1.5 sm:gap-4 min-w-0 ${mobileSearchOpen ? "hidden sm:flex" : "flex"}`}
      >
        <button
          type="button"
          onClick={() => setMobileSearchOpen(true)}
          className="sm:hidden w-8 h-8 shrink-0 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Search size={18} className="text-text-muted" />
        </button>

        <div className="hidden sm:block relative min-w-0" ref={searchRef}>
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />

          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => {
              setShowResults(true);
            }}
            onKeyDown={handleKeyDown}
            className="bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-(length:--font-size-caption) text-text-primary w-56 md:w-64 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          {showResults && searchQuery.trim() && (
            <div className="absolute left-0 top-11 w-80 max-w-[90vw] bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20 text-left">
              {renderResultsList()}
            </div>
          )}
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNotificationClick}
          className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Bell size={18} className="text-text-muted" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
          )}
        </motion.button>

        <div className="relative shrink-0" ref={avatarRef}>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAvatarMenu((prev) => !prev)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary text-primary-light flex items-center justify-center font-semibold text-(length:--font-size-body-sm) shadow-xs cursor-pointer overflow-hidden"
          >
            {profile?.profileImage ? (
              <img
                src={profile.profileImage}
                alt={profile?.fullName || "Profile"}
                className="w-full h-full object-cover"
              />
            ) : (initial)}
          </motion.button>

          <AnimatePresence>
            {showAvatarMenu && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-48 max-w-[85vw] bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20 text-left"
              >
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-(length:--font-size-caption) font-medium text-text-primary truncate">
                    {profile?.fullName}
                  </p>
                  <p className="text-(length:--font-size-caption) text-text-muted truncate">
                    {profile?.email}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigate("/settings");
                    setShowAvatarMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-(length:--font-size-body-sm) text-text-primary hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Settings size={15} />
                  Settings
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-(length:--font-size-body-sm) text-error hover:bg-error-light transition-colors cursor-pointer"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

export default Header;