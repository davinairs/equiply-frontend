import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Power, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import UserDetailModal from "../../components/UserDetailModal";
import UserModal from "../../components/UserModal";
import api from "../../services/api";

const PAGE_SIZE = 10;

function isWithinLastDay(dateStr) {
  if (!dateStr) return false;
  const diffDays = (new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 1;
}

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailItem, setDetailItem] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    companyId: "",
    username: "",
    fullName: "",
    email: "",
    password: "",
    role: "user",
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const fetchData = async () => {
    try {
      const [userRes, companyRes] = await Promise.all([
        api.get("/users"),
        api.get("/companies"),
      ]);

      setUsers(userRes.data);
      setCompanies(companyRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setForm({
      companyId: "",
      username: "",
      fullName: "",
      email: "",
      password: "",
      role: "user",
    });
    setImageFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (imageFile) {
        formData.append("profileImage", imageFile);
      }

      await api.post("/users", formData);

      toast.success("User added successfully!");

      setShowForm(false);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const action = user.status === "active" ? "deactivate" : "activate";

    const confirmMsg =
      user.status === "active"
        ? `Deactivate "${user.fullName}"?`
        : `Activate "${user.fullName}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.patch(`/users/${user.id}/${action}`);

      toast.success(
        user.status === "active"
          ? "User deactivated successfully!"
          : "User activated successfully!",
      );

      await fetchData();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update user status",
      );
    }
  };

  const totalUser = users.length;
  const activeCount = users.filter((u) => u.status === "active").length;
  const inactiveCount = users.filter((u) => u.status === "inactive").length;
  const userCount = users.filter((u) => u.role === "user").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  const totalUserNew = users.filter((u) => isWithinLastDay(u.createdAt)).length;
  const activeCountNew = users.filter(
    (u) => u.status === "active" && isWithinLastDay(u.updatedAt),
  ).length;
  const inactiveCountNew = users.filter(
    (u) => u.status === "inactive" && isWithinLastDay(u.updatedAt),
  ).length;
  const userCountNew = users.filter(
    (u) => u.role === "user" && isWithinLastDay(u.createdAt),
  ).length;
  const adminCountNew = users.filter(
    (u) => u.role === "admin" && isWithinLastDay(u.createdAt),
  ).length;

  const statCards = [
    {
      label: "Total User",
      value: totalUser,
      newCount: totalUserNew,
      colorClass: "text-success",
    },
    {
      label: "Active",
      value: activeCount,
      newCount: activeCountNew,
      colorClass: "text-success",
    },
    {
      label: "Inactive",
      value: inactiveCount,
      newCount: inactiveCountNew,
      colorClass: "text-slate-600",
    },
    {
      label: "User",
      value: userCount,
      newCount: userCountNew,
      colorClass: "text-success",
    },
    {
      label: "Admin",
      value: adminCount,
      newCount: adminCountNew,
      colorClass: "text-success",
    },
  ];

const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.username?.toLowerCase().includes(q) ||
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.companyName?.toLowerCase().includes(q)
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const valA = a.createdAt || a.id || 0;
    const valB = b.createdAt || b.id || 0;

    if (valA < valB) return 1;
    if (valA > valB) return -1;
    return 0;
  });

  const totalPages = Math.max(Math.ceil(sortedUsers.length / PAGE_SIZE), 1);
  const paginatedUsers = sortedUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-(length:--font-size-body-sm) text-text-muted font-medium">
          Loading data...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pb-10 px-4 sm:px-0"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-(length:--font-size-h2) font-semibold text-primary">
            Users
          </h2>
          <p className="text-(length:--font-size-body-lg) text-text-muted mt-1">
            Manage user accounts and access permissions.
            {searchQuery && (
              <span className="text-primary font-medium ml-1">
                (Filtered by "{searchQuery}")
              </span>
            )}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-2xl text-(length:--font-size-body-sm) font-medium hover:opacity-95 shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} /> Add User
        </motion.button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <p className="text-(length:--font-size-body-sm) text-text-muted">
              {card.label}
            </p>
            <p className="text-(length:--font-size-h1) font-semibold text-primary mt-1">
              {card.value}
            </p>
            <p
              className={`text-(length:--font-size-caption) mt-1 ${card.newCount > 0 ? card.colorClass : "text-text-muted"}`}
            >
              {card.newCount > 0 ? `+${card.newCount} last day` : "No change"}
            </p>
          </motion.div>
        ))}
      </div>

      <UserModal
        show={showForm}
        editingId={null}
        form={form}
        setForm={setForm}
        companies={companies}
        imageFile={imageFile}
        setImageFile={setImageFile}
        onSubmit={handleSubmit}
        onClose={() => setShowForm(false)}
        submitting={submitting}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 shadow-sm mt-6"
      >
        <h3 className="text-(length:--font-size-h3) font-semibold text-text-primary mb-4">
          User List
        </h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-190 text-left text-(length:--font-size-body-sm)">
            <thead className="text-text-muted border-b border-slate-100">
              <tr>
                <th className="pb-3 font-medium pl-3 w-[14%]">Username</th>
                <th className="pb-3 font-medium w-[14%]">Full Name</th>
                <th className="pb-3 font-medium w-[18%]">Company</th>
                <th className="pb-3 font-medium w-[20%]">Email</th>
                <th className="pb-3 font-medium w-[10%]">Role</th>
                <th className="pb-3 font-medium w-[12%]">Status</th>
                <th className="pb-3 font-medium pr-3 w-[12%]">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {paginatedUsers.map((u, idx) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="border-b border-slate-50 text-text-primary hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 pl-3 font-medium">{u.username}</td>
                    <td className="py-4 font-medium">{u.fullName}</td>
                    <td className="py-4 font-medium">{u.companyName}</td>
                    <td className="py-4 font-medium">{u.email}</td>
                    <td className="py-4 font-medium">{u.role}</td>
                    <td className="py-4 pr-3">
                      <span
                        className={`px-2.5 py-1 rounded-md text-(length:--font-size-caption) font-medium capitalize inline-block ${u.status === "active" ? "bg-success-light text-success" : "bg-slate-100 text-slate-500"}`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4 pr-3">
                      <div className="flex items-center justify-start gap-3">
                        <button
                          onClick={() => setDetailItem(u)}
                          className="text-text-muted hover:text-primary transition-colors cursor-pointer"
                          title="View"
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`transition-colors cursor-pointer ${u.status === "active" ? "text-text-muted hover:text-error" : "text-text-muted hover:text-success"}`}
                          title={ u.status === "active" ? "Deactivate" : "Activate"}
                        >
                          <Power size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted">
                    No User Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2 sm:px-6 py-4 border-t border-slate-50">
            <p className="text-(length:--font-size-caption) text-text-muted">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="flex items-center gap-1 border border-slate-200 text-text-muted px-3.5 py-1.5 rounded-xl text-(length:--font-size-caption) hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="flex items-center gap-1 border border-slate-200 text-text-muted px-3.5 py-1.5 rounded-xl text-(length:--font-size-caption) hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <UserDetailModal user={detailItem} onClose={() => setDetailItem(null)} />
    </motion.div>
  );
}

export default UserManagementPage;
