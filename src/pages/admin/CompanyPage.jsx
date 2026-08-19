import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import CompanyModal from "../../components/CompanyModal";

const PAGE_SIZE = 10;

function CompanyPage() {
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ companyName: "" });
  const [editingId, setEditingId] = useState(null);
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
      const [compRes, userRes] = await Promise.all([
        api.get("/companies"),
        api.get("/users"),
      ]);
      setCompanies(compRes.data);
      setUsers(userRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const getUserCount = (companyName) =>
    users.filter((u) => u.companyName === companyName).length;

  const openCreateForm = () => {
    setEditingId(null);
    setForm({ companyName: "" });
    setShowForm(true);
  };

  const openEditForm = (c) => {
    setEditingId(c.id);
    setForm({ companyName: c.companyName });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/companies/${editingId}`, form);
        toast.success("Company updated successfully!");
      } else {
        await api.post("/companies", form);
        toast.success("Company added successfully!");
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save data");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete company "${name}"?`)) return;
    try {
      await api.delete(`/companies/${id}`);
      toast.success("Company deleted successfully!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete company");
    }
  };
  
  const filteredCompanies = companies.filter((c) => {
    if (!searchQuery) return true;
    return c.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    const valA = a.createdAt || a.id || 0;
    const valB = b.createdAt || b.id || 0;

    if (valA < valB) return 1; 
    if (valA > valB) return -1;
    return 0;
  });

  const totalPages = Math.max(Math.ceil(sortedCompanies.length / PAGE_SIZE), 1);
  
  const paginatedCompanies = sortedCompanies.slice(
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
          <h1 className="text-(length:--font-size-h1) font-semibold text-primary">
            Companies
          </h1>
          <p className="text-(length:--font-size-body-lg) text-text-muted mt-1">
            Manage company information and assigned assets.
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
          className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-2xl text-(length:--font-size-body-sm) font-medium hover:opacity-95 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} /> Add Company
        </motion.button>
      </div>

      <CompanyModal
        show={showForm}
        editingId={editingId}
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
        className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 shadow-xs mt-6"
      >
        <h3 className="text-(length:--font-size-h3) font-semibold text-text-primary">
          Company
        </h3>
        <p className="text-(length:--font-size-caption) text-success mt-0.5">
          {filteredCompanies.length} Companies
        </p>
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-120 text-left text-(length:--font-size-body-sm)">
            <thead className="text-text-muted border-b border-slate-100">
              <tr>
                <th className="pb-3 py-3 font-medium pl-3 w-[37%]">Company Name</th>
                <th className="pb-3 py-3 font-medium w-[33%]">Users</th>
                <th className="pb-3 py-3 font-medium pr-3 w-[30%]">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {paginatedCompanies.map((c, idx) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="border-b border-slate-50 text-text-primary hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 pl-3 font-medium">{c.companyName}</td>
                    <td className="py-4 font-medium">{getUserCount(c.companyName)} users</td>
                    <td className="py-4 pr-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEditForm(c)}
                          className="text-text-muted hover:text-primary transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.companyName)}
                          className="text-text-muted hover:text-error transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {paginatedCompanies.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-text-muted">
                    No company found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1 sm:px-5 py-4 border-t border-slate-50">
            <p className="text-(length:--font-size-caption) text-text-muted">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="flex items-center gap-1 border border-slate-200 text-text-muted px-3 py-1.5 rounded-lg text-(length:--font-size-caption) hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="flex items-center gap-1 border border-slate-200 text-text-muted px-3 py-1.5 rounded-lg text-(length:--font-size-caption) hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default CompanyPage;