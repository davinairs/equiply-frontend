import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Pencil, Trash2, Plus, ChevronDown, ChevronLeft, ChevronRight, Check, } from "lucide-react";
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
  const [equipments, setEquipments] = useState([]);
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
        api.get("/equipments"),
        api.get("/categories"),
      ]);

      setEquipments(eqRes.data);
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

    const generatedSerial = `SN-${Math.floor(100000 + Math.random() * 900000)}`;

    setForm({
      equipmentName: "",
      serialNumber: generatedSerial,
      categoryId: "",
      location: "",
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
        await api.put(`/equipments/${editingId}`, formData);

        toast.success("Equipment updated successfully!");
      } else {
        await api.post("/equipments", formData);

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
      await api.delete(`/equipments/${id}`);
      toast.success(`Equipment "${name}" deleted successfully!`);

      await fetchData();

      setPage((currentPage) => {
        const remainingItems = filteredEquipments.length - 1;
        const newTotalPages = Math.max(
          Math.ceil(remainingItems / PAGE_SIZE),
          1,
        );

        return Math.min(currentPage, newTotalPages);
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete equipment");
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }

    setPage(1);
  };

  let filteredEquipments = equipments.filter((eq) => {
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

    filteredEquipments = [...filteredEquipments].sort((a, b) => {
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
    Math.ceil(filteredEquipments.length / PAGE_SIZE),
    1,
  );

  const paginatedEquipments = filteredEquipments.slice(
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
            Equipments
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
          className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-2xl text-sm font-medium hover:opacity-95 cursor-pointer shadow-xs self-start sm:self-auto"
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
        equipmentsList={equipments}
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
            className="flex items-center justify-between gap-6 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-(length:--font-size-body-sm) text-text-primary hover:border-slate-300 shadow-xs cursor-pointer min-w-35"
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
                initial={{ opacity: 0, y: -5, scale: 0.95, }}
                animate={{ opacity: 1, y: 4, scale: 1, }}
                exit={{ opacity: 0, y: -5, scale: 0.95, }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full z-30 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 min-w-30 max-w-[85vw] overflow-hidden"
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
            className="flex items-center justify-between gap-6 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-(length:--font-size-body-sm) text-text-primary hover:border-slate-300 shadow-xs cursor-pointer min-w-35"
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
                initial={{ opacity: 0, y: -5, scale: 0.95, }}
                animate={{ opacity: 1,  y: 4, scale: 1, }}
                exit={{ opacity: 0, y: -5, scale: 0.95, }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full z-30 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 min-w-40 max-w-[85vw] overflow-hidden"
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
            className="flex items-center justify-between gap-6 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-(length:--font-size-body-sm) text-text-primary hover:border-slate-300 shadow-xs cursor-pointer min-w-35"
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
                initial={{ opacity: 0, y: -5, scale: 0.95, }}
                animate={{ opacity: 1, y: 4, scale: 1, }}
                exit={{ opacity: 0, y: -5, scale: 0.95, }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full z-30 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 min-w-40 max-w-[85vw] overflow-hidden"
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
        initial={{ opacity: 0, scale: 0.99, }}
        animate={{ opacity: 1, scale: 1, }}
        transition={{ duration: 0.3, delay: 0.1, }}
        className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 shadow-xs mt-5"
      >
        <h3 className="text-[length:(--font-size-h3)] font-semibold text-text-primary mb-5">
          Equipment List
        </h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-205 text-left text-(length:--font-size-body-sm)">
            <thead className="text-text-muted border-b border-slate-100">
              <tr>
                <th className="pb-3 font-medium pl-3 w-[12%]">Picture</th>
                <th className="pb-3 font-medium w-[18%]">Equipment</th>
                <th className="pb-3 font-medium w-[15%]">Category</th>
                <th className="pb-3 font-medium w-[15%]">Serial</th>
                <th className="pb-3 font-medium w-[12%]">Status</th>
                <th className="pb-3 font-medium w-[13%]">Condition</th>
                <th className="pb-3 font-medium pr-3 w-[15%]">Action</th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence mode="wait">
                {paginatedEquipments.map((eq, idx) => (
                  <motion.tr
                    key={eq.id}
                    initial={{ opacity: 0, y: 10, }}
                    animate={{ opacity: 1, y: 0, }}
                    exit={{ opacity: 0, y: -10, }}
                    transition={{ duration: 0.2, delay: idx * 0.03, }}
                    className="border-b border-slate-50 text-text-primary hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 pl-3">
                      {eq.equipmentImage ? (
                        <img
                          src={eq.equipmentImage}
                          alt={eq.equipmentName}
                          className="w-16 h-16 object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-[10px] text-text-muted border border-slate-200">
                          No Photo
                        </div>
                      )}
                    </td>
                    <td className="py-4 font-medium">{eq.equipmentName}</td>
                    <td className="py-4 font-medium">{eq.categoryName}</td>
                    <td className="py-4 font-medium">{eq.serialNumber}</td>
                    <td className="py-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-(length:--font-size-caption) font-medium capitalize inline-block ${statusBadge[eq.equipmentStatus]}`}
                      >
                        {eq.equipmentStatus}
                      </span>
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-(length:--font-size-caption) font-medium capitalize inline-block ${conditionBadge[eq.equipmentCondition]}`}
                      >
                        {eq.equipmentCondition}
                      </span>
                    </td>
                    <td className="py-4 pr-3">
                      <div className="flex items-center justify-start gap-3">
                        <button
                          onClick={() => setDetailItem(eq)}
                          className="text-text-muted hover:text-primary cursor-pointer transition-colors"
                          title="View"
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(eq)}
                          className="text-text-muted hover:text-success cursor-pointer transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(eq.id, eq.equipmentName)}
                          className="text-text-muted hover:text-error cursor-pointer transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {paginatedEquipments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted">
                    No equipment found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2 sm:px-6 py-4 border-t border-slate-50">
            <p className="text-(length:--font-size-body-sm) text-text-muted">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="flex items-center gap-1 border border-slate-200 text-text-muted px-3.5 py-1.5 rounded-xl text-(length:--font-size-body-sm) hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft size={14} />
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="flex items-center gap-1 border border-slate-200 text-text-muted px-3.5 py-1.5 rounded-xl text-(length:--font-size-body-sm) hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
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
