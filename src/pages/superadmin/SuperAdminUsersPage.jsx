import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Power, Eye } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import AddAdminModal from "../../components/AddAdminModal";
import UserDetailModal from "../../components/UserDetailModal";

const PAGE_SIZE = 10;

function SuperAdminUsersPage() {
  const [admins, setAdmins] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailItem, setDetailItem] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    companyId: "",
  });
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
      const [adminRes, companyRes] = await Promise.all([
        api.get("/admins"),
        api.get("/companies"),
      ]);
      setAdmins(adminRes.data);
      setCompanies(companyRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setForm({
      username: "",
      fullName: "",
      email: "",
      password: "",
      companyId: "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { companyId, ...adminData } = form;
      await api.post(`/companies/${companyId}/admins`, adminData);
      toast.success("Admin added successfully!");
      setShowForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add admin");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (admin) => {
    const action = admin.status === "active" ? "deactivate" : "activate";
    if (
      !window.confirm(
        `Are you sure you want to ${action} "${admin.fullName}"?`,
      )
    )
      return;

    try {
      await api.patch(`/users/${admin.id}/${action}`);
      toast.success(
        admin.status === "active"
          ? "Admin deactivated successfully!"
          : "Admin activated successfully!",
      );
      fetchData();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update admin status",
      );
    }
  };

  const filteredAdmins = admins.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.username?.toLowerCase().includes(q) ||
      a.fullName?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.companyName?.toLowerCase().includes(q)
    );
  });

  const sortedAdmins = [...filteredAdmins].sort((a, b) => {
    const valA = a.createdAt || a.id || 0;
    const valB = b.createdAt || b.id || 0;

    if (valA < valB) return 1;
    if (valA > valB) return -1;
    return 0;
  });

  const totalPages = Math.max(Math.ceil(sortedAdmins.length / PAGE_SIZE), 1);

  const paginatedAdmins = sortedAdmins.slice(
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
      className="pb-10 text-left px-4 sm:px-0"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-(length:--font-size-h2) font-semibold text-primary flex items-center gap-2">
            {" "}
            Users
          </h2>
          <p className="text-(length:--font-size-body-lg) text-text-muted mt-1">
            View all admin accounts across companies.
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
          className="flex items-center justify-center gap-2 bg-primary text-primary-light px-4 py-2.5 rounded-xl text-(length:--font-size-body-sm) font-medium hover:opacity-95 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} /> Add Admin
        </motion.button>
      </div>

      <AddAdminModal
        show={showForm}
        companies={companies}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        onClose={() => setShowForm(false)}
        submitting={submitting}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-primary-light rounded-2xl border border-stroke p-4 sm:p-6 shadow-xs mt-2"
      >
        <h3 className="text-(length:--font-size-h3) font-semibold text-text-primary">
          Admin List
        </h3>
        <p className="text-(length:--font-size-caption) text-success mt-0.5">
          {filteredAdmins.length} Admins Total
        </p>
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-190 text-left text-(length:--font-size-body-sm)">
            <thead className="text-text-muted border-b border-stroke">
              <tr>
                <th className="py-3 px-4 font-medium w-[16%]">Username</th>
                <th className="py-3 px-4 font-medium w-[18%]">Full Name</th>
                <th className="py-3 px-4 font-medium w-[22%]">Company</th>
                <th className="py-3 px-4 font-medium w-[22%]">Email</th>
                <th className="py-3 px-4 font-medium w-[12%]">Status</th>
                <th className="py-3 px-4 font-medium w-[10%]">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {paginatedAdmins.map((a, idx) => (
                  <motion.tr
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="border-b border-stroke text-text-primary hover:bg-slate-50/50 transition-colors font-medium"
                  >
                    <td className="py-4 px-4">{a.username}</td>
                    <td className="py-4 px-4">{a.fullName}</td>
                    <td className="py-4 px-4">{a.companyName}</td>
                    <td className="py-4 px-4">{a.email}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-(length:--font-size-caption) lowercase inline-block ${a.status === "active" ? "bg-success-light text-success" : "bg-error-light text-error"}`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-start gap-4">
                        <button
                          onClick={() => setDetailItem(a)}
                          className="text-primary"
                          title="View"
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(a)}
                          className={`${a.status === "active" ? "text-error" : "text-success"}`}
                          title={
                            a.status === "active" ? "Deactivate" : "Activate"
                          }
                        >
                          <Power size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {paginatedAdmins.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-text-muted">
                    No Admin Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1 sm:px-5 py-4 border-t border-stroke">
            <p className="text-(length:--font-size-caption) text-text-muted">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="flex items-center gap-1 border border-stroke text-text-muted px-3 py-1.5 rounded-lg text-(length:--font-size-caption) hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="flex items-center gap-1 border border-stroke text-text-muted px-3 py-1.5 rounded-lg text-(length:--font-size-caption) hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <UserDetailModal
        user={detailItem}
        onClose={() => setDetailItem(null)}
        groupLabel="Company"
        groupValue={detailItem?.companyName}
      />
    </motion.div>
  );
}

export default SuperAdminUsersPage;
