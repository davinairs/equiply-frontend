import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Pencil, Trash2, Plus, ChevronDown, ChevronLeft, ChevronRight, Check } from "lucide-react";
import toast from "react-hot-toast";
import EquipmentDetailModal from "../../components/EquipmentDetailModal";
import EquipmentModal from "../../components/EquipmentModal";
import api from "../../services/api";

const PAGE_SIZE = 10;

const statusBadge = {
  available: "bg-success-light text-success",
  borrowed: "bg-info-light text-info",
  maintenance: "bg-warning-light text-warning",
};

const conditionBadge = {
  new: "bg-success-light text-success",
  good: "bg-info-light text-info",
  broken: "bg-error-light text-error",
};

function AdminEquipmentPage() {
  const [equipment, setEquipment] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailItem, setDetailItem] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({
    equipmentName: "",
    serialNumber: "",
    categoryId: "",
    location: "",
    description: "",
    equipmentCondition: "new",
    equipmentStatus: "available",
  });

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [filterCategory, setFilterCategory] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const [openCategory, setOpenCategory] = useState(false);
  const [openCondition, setOpenCondition] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);

  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eqRes, catRes] = await Promise.all([
        api.get("/equipment"),
        api.get("/categories"),
      ]);

      setEquipment(eqRes.data);
      setCategories(catRes.data);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to load equipment data";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);

    setForm({
      equipmentName: "",
      serialNumber: "",
      categoryId: "",
      location: "",
      description: "",
      equipmentCondition: "new",
      equipmentStatus: "available",
    });

    setImageFile(null);
    setShowModal(true);
  };

  const handleOpenEdit = (eq) => {
    setEditingId(eq.id);

    setForm({
      equipmentName: eq.equipmentName || "",
      serialNumber: eq.serialNumber || "",
      categoryId: eq.categoryId || "",
      location: eq.location || "",
      description: eq.description || "",
      equipmentCondition: eq.equipmentCondition || "new",
      equipmentStatus: eq.equipmentStatus || "available",
    });

    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();

      if (editingId) {
        const { serialNumber, ...editableFields } = form;

        Object.entries(editableFields).forEach(([key, value]) => {
          if (key === "equipmentStatus" && value === "borrowed") return;
          formData.append(key, value);
        });
      } else {
        Object.entries(form).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      if (imageFile) {
        formData.append("equipmentImage", imageFile);
      }

      if (editingId) {
        await api.put(`/equipment/${editingId}`, formData);

        toast.success("Equipment updated successfully!");
      } else {
        await api.post("/equipment", formData);

        toast.success("Equipment added successfully!");
      }

      setShowModal(false);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save equipment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }
    try {
      await api.delete(`/equipment/${id}`);
      toast.success(`Equipment "${name}" deleted successfully!`);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete equipment");
    }
  };

  let filteredEquipment = equipment.filter((eq) => {
    if (filterCategory && String(eq.categoryId) !== filterCategory) {
      return false;
    }

    if (filterCondition && eq.equipmentCondition !== filterCondition) {
      return false;
    }

    if (filterStatus && eq.equipmentStatus !== filterStatus) {
      return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();

      const nameMatch = eq.equipmentName?.toLowerCase().includes(q);

      const catMatch = eq.categoryName?.toLowerCase().includes(q);

      if (!nameMatch && !catMatch) {
        return false;
      }
    }

    return true;
  });

  filteredEquipment = [...filteredEquipment].sort((a, b) => {
    const field = sortBy || "createdAt";

    const valA = a[field] || 0;
    const valB = b[field] || 0;

    const direction = sortBy ? sortDir : "desc";

    if (valA < valB) {
      return direction === "asc" ? -1 : 1;
    }
    if (valA > valB) {
      return direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const totalPages = Math.max(
    Math.ceil(filteredEquipment.length / PAGE_SIZE),
    1,
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedEquipment = filteredEquipment.slice(
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

  if (error) {
    return <p className="text-error px-4 sm:px-0">{error}</p>;
  }

  const selectedCategoryName =
    categories.find((c) => String(c.id) === filterCategory)?.categoryName ||
    "All Category";

  const selectedConditionName = filterCondition
    ? filterCondition.charAt(0).toUpperCase() + filterCondition.slice(1)
    : "All Condition";

  const selectedStatusName = filterStatus
    ? filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)
    : "All Status";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pb-10 text-left px-4 sm:px-0"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-(length:--font-size-h2) font-semibold text-primary">
            Equipment
          </h2>
          <p className="text-(length:--font-size-body-lg) text-text-muted mt-1">
            Manage all equipment and their availability.
          </p>
          {searchQuery && (
            <p className="text-(length:--font-size-body-sm) text-primary mt-1">
              Filtered by "{searchQuery}"
            </p>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-primary text-primary-light px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-95 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus size={16} />
          Add Equipment
        </motion.button>
      </div>

      <EquipmentModal
        show={showModal}
        editingId={editingId}
        form={form}
        setForm={setForm}
        categories={categories}
        equipmentList={equipment}
        imageFile={imageFile}
        setImageFile={setImageFile}
        onSubmit={handleSubmit}
        onClose={() => setShowModal(false)}
        submitting={submitting}
      />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative inline-block">
          <button
            onClick={() => {
              setOpenCategory(!openCategory);
              setOpenCondition(false);
              setOpenStatus(false);
            }}
            className="flex items-center justify-between gap-6 bg-primary-light border border-stroke rounded-xl px-4 py-2.5 text-(length:--font-size-body-sm) text-text-primary hover:border-slate-300 shadow-xs cursor-pointer min-w-35"
          >
            <span>{selectedCategoryName}</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 text-text-muted ${openCategory ? "rotate-180" : ""}`}
            />
          </button>
          <AnimatePresence>
            {openCategory && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 4, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full z-30 bg-primary-light border border-stroke rounded-2xl shadow-xl py-2 min-w-30 max-w-[85vw] overflow-hidden"
              >
                <div
                  onClick={() => {
                    setFilterCategory("");
                    setPage(1);
                    setOpenCategory(false);
                  }}
                  className={`px-4 py-2 text-(length:--font-size-body-sm) flex items-center justify-between hover:bg-slate-50 cursor-pointer ${filterCategory === "" ? "text-primary font-medium bg-slate-50/80" : "text-text-primary"}`}
                >
                  All Category
                  {filterCategory === "" && (
                    <Check size={14} className="text-primary" />
                  )}
                </div>

                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setFilterCategory(String(cat.id));
                      setPage(1);
                      setOpenCategory(false);
                    }}
                    className={`px-4 py-2 text-(length:--font-size-body-sm) flex items-center justify-between hover:bg-slate-50 cursor-pointer ${filterCategory === String(cat.id) ? "text-primary font-medium bg-slate-50/80" : "text-text-primary"}`}
                  >
                    {cat.categoryName}
                    {filterCategory === String(cat.id) && (
                      <Check size={14} className="text-primary" />
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="relative inline-block">
          <button
            onClick={() => {
              setOpenCondition(!openCondition);
              setOpenCategory(false);
              setOpenStatus(false);
            }}
            className="flex items-center justify-between gap-6 bg-primary-light border border-stroke rounded-xl px-4 py-2.5 text-(length:--font-size-body-sm) text-text-primary hover:border-slate-300 shadow-xs cursor-pointer min-w-35"
          >
            <span>{selectedConditionName}</span>

            <ChevronDown
              size={14}
              className={`transition-transform duration-300 text-text-muted ${openCondition ? "rotate-180" : ""}`}
            />
          </button>
          <AnimatePresence>
            {openCondition && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 4, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full z-30 bg-primary-light border border-stroke rounded-2xl shadow-xl py-2 min-w-40 max-w-[85vw] overflow-hidden"
              >
                {[
                  { label: "All Condition", value: "" },
                  { label: "New", value: "new" },
                  { label: "Good", value: "good" },
                  { label: "Broken", value: "broken" },
                ].map((item) => (
                  <div
                    key={item.value}
                    onClick={() => {
                      setFilterCondition(item.value);
                      setPage(1);
                      setOpenCondition(false);
                    }}
                    className={`px-4 py-2 text-(length:--font-size-body-sm) flex items-center justify-between hover:bg-slate-50 cursor-pointer ${filterCondition === item.value ? "text-primary font-medium bg-slate-50/80" : "text-text-primary"}`}
                  >
                    {item.label}
                    {filterCondition === item.value && (
                      <Check size={14} className="text-primary" />
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative inline-block">
          <button
            onClick={() => {
              setOpenStatus(!openStatus);
              setOpenCategory(false);
              setOpenCondition(false);
            }}
            className="flex items-center justify-between gap-6 bg-primary-light border border-stroke rounded-xl px-4 py-2.5 text-(length:--font-size-body-sm) text-text-primary hover:border-slate-300 shadow-xs cursor-pointer min-w-35"
          >
            <span>{selectedStatusName}</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 text-text-muted ${openStatus ? "rotate-180" : ""}`}
            />
          </button>
          <AnimatePresence>
            {openStatus && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 4, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full z-30 bg-primary-light border border-stroke rounded-2xl shadow-xl py-2 min-w-40 max-w-[85vw] overflow-hidden"
              >
                {[
                  { label: "All Status", value: "" },
                  { label: "Available", value: "available" },
                  { label: "Borrowed", value: "borrowed" },
                  { label: "Maintenance", value: "maintenance" },
                ].map((item) => (
                  <div
                    key={item.value}
                    onClick={() => {
                      setFilterStatus(item.value);
                      setPage(1);
                      setOpenStatus(false);
                    }}
                    className={`px-4 py-2 text-(length:--font-size-body-sm) flex items-center justify-between hover:bg-slate-50 cursor-pointer ${filterStatus === item.value ? "text-primary font-medium bg-slate-50/80" : "text-text-primary"}`}
                  >
                    {item.label}
                    {filterStatus === item.value && (
                      <Check size={14} className="text-primary" />
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-primary-light rounded-2xl border border-stroke p-4 sm:p-6 shadow-xs mt-5"
      >
        <h3 className="text-(length:--font-size-h3) font-semibold text-text-primary mb-5">
          Equipment List
        </h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-205 text-left text-(length:--font-size-body-sm)">
            <thead className="text-text-muted border-b border-stroke">
              <tr>
                <th className="py-3 px-4 font-medium w-[12%]">Picture</th>
                <th className="py-3 px-4 font-medium w-[20%]">Equipment</th>
                <th className="py-3 px-4 font-medium w-[20%]">Category</th>
                <th className="py-3 px-4 font-medium w-[12%]">Serial</th>
                <th className="py-3 px-4 font-medium w-[13%]">Status</th>
                <th className="py-3 px-4 font-medium w-[13%]">Condition</th>
                <th className="py-3 px-4 font-medium w-[10%]">Action</th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence mode="wait">
                {paginatedEquipment.map((eq, idx) => (
                  <motion.tr
                    key={eq.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="border-b border-stroke text-text-primary hover:bg-slate-50/50 transition-colors font-medium"
                  >
                    <td className="py-4 px-4">
                      {eq.equipmentImage ? (
                        <img
                          src={eq.equipmentImage}
                          alt={eq.equipmentName}
                          className="w-16 h-16 object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-primary-light rounded-xl flex items-center justify-center text-(length:--font-size-caption) text-text-muted border border-stroke">
                          No Photo
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {eq.equipmentName}
                    </td>
                    <td className="py-4 px-4">{eq.categoryName}</td>
                    <td className="py-4 px-4">{eq.serialNumber}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-(length:--font-size-caption) lowercase inline-block ${statusBadge[eq.equipmentStatus]}`}
                      >
                        {eq.equipmentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-(length:--font-size-caption) lowercase inline-block ${conditionBadge[eq.equipmentCondition]}`}
                      >
                        {eq.equipmentCondition}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-start gap-3">
                        <button
                          onClick={() => setDetailItem(eq)}
                          className="text-primary"
                          title="View"
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(eq)}
                          className="text-success"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(eq.id, eq.equipmentName)}
                          className="text-error"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2 sm:px-6 py-4 border-t border-stroke">
            <p className="text-(length:--font-size-body-sm) text-text-muted">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="flex items-center gap-1 border border-stroke text-text-muted px-3.5 py-1.5 rounded-xl text-(length:--font-size-body-sm) hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft size={14} />
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="flex items-center gap-1 border border-stroke text-text-muted px-3.5 py-1.5 rounded-xl text-(length:--font-size-body-sm) hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <EquipmentDetailModal
        equipment={detailItem}
        onClose={() => setDetailItem(null)}
      />
    </motion.div>
  );
}

export default AdminEquipmentPage;
