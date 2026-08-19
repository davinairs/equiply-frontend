import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, ChevronDown, ChevronLeft, ChevronRight, Check } from "lucide-react";
import toast from "react-hot-toast";
import BorrowRequestModal from "../../components/BorrowRequestModal";
import EquipmentDetailModal from "../../components/EquipmentDetailModal";
import api from "../../services/api";

const PAGE_SIZE = 20;

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

function UserEquipmentPage() {
  const [equipments, setEquipments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailItem, setDetailItem] = useState(null);
  const [borrowItem, setBorrowItem] = useState(null);

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [filterCategory, setFilterCategory] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

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
      setError(err.response?.data?.message || "Failed to load equipment data");
    } finally {
      setLoading(false);
    }
  };
  
  const getCategoryName = (eq) => {
    if (eq.category?.categoryName) return eq.category.categoryName;
    if (eq.categoryName) return eq.categoryName;
    const found = categories.find((c) => String(c.id) === String(eq.categoryId));
    return found ? found.categoryName : "";
  };

let filteredEquipments = equipments.filter((eq) => {
    if (filterCategory && String(eq.categoryId) !== filterCategory)
      return false;
    if (filterCondition && eq.equipmentCondition !== filterCondition)
      return false;
    if (filterStatus && eq.equipmentStatus !== filterStatus) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = eq.equipmentName?.toLowerCase().includes(query);
      const categoryMatch = getCategoryName(eq).toLowerCase().includes(query);

      if (!nameMatch && !categoryMatch) return false;
    }

    return true;
  });

  const sortedEquipments = [...filteredEquipments].sort((a, b) => {
    const valA = a.createdAt || a.id || 0;
    const valB = b.createdAt || b.id || 0;

    if (valA < valB) return 1; 
    if (valA > valB) return -1;
    return 0;
  });

  const totalPages = Math.max(
    Math.ceil(sortedEquipments.length / PAGE_SIZE),
    1,
  );
  
  const paginatedEquipments = sortedEquipments.slice(
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
  if (error) return <p className="text-error px-4 sm:px-0">{error}</p>;

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
      className="pb-10 px-4 sm:px-0"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-(length:--font-size-h2) font-semibold text-primary">
            Equipments Catalog
          </h2>
          <p className="text-(length:--font-size-body-lg) text-text-muted mt-1">
            Browse and borrow available equipment for your needs.
            {searchQuery && (
              <span className="text-primary font-medium ml-1">
                (Filtered by "{searchQuery}")
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <button
            onClick={() => {
              setOpenCategory(!openCategory);
              setOpenCondition(false);
              setOpenStatus(false);
            }}
            className="flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-(length:--font-size-body-sm) text-text-primary hover:border-slate-300 shadow-sm cursor-pointer min-w-35"
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
                className="absolute left-0 top-full z-30 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 min-w-40 max-w-[85vw] overflow-hidden"
              >
                <div
                  onClick={() => {
                    setFilterCategory("");
                    setPage(1);
                    setOpenCategory(false);
                  }}
                  className={`px-4 py-2 text-(length:--font-size-body-sm) flex items-center justify-between hover:bg-slate-50 cursor-pointer ${filterCategory === "" ? "text-primary font-medium bg-slate-50/80" : "text-text-primary"}`}
                >
                  All Category{" "}
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
                    className={`px-4 py-2 text-(length:--font-size-caption) flex items-center justify-between hover:bg-slate-50 cursor-pointer ${filterCategory === String(cat.id) ? "text-primary font-medium bg-slate-50/80" : "text-text-primary"}`}
                  >
                    {cat.categoryName}{" "}
                    {filterCategory === String(cat.id) && (
                      <Check size={14} className="text-primary" />
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setOpenCondition(!openCondition);
              setOpenCategory(false);
              setOpenStatus(false);
            }}
            className="flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-(length:--font-size-body-sm) text-text-primary hover:border-slate-300 shadow-sm cursor-pointer min-w-35"
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
                    {item.label}{" "}
                    {filterCondition === item.value && (
                      <Check size={14} className="text-primary" />
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setOpenStatus(!openStatus);
              setOpenCategory(false);
              setOpenCondition(false);
            }}
            className="flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-(length:--font-size-body-sm) text-text-primary hover:border-slate-300 shadow-sm cursor-pointer min-w-35"
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
                    {item.label}{" "}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <AnimatePresence mode="wait">
          {paginatedEquipments.map((eq, idx) => (
            <motion.div
              key={eq.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
              className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="relative w-full h-48 bg-slate-50 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                  {eq.equipmentImage ? (
                    <img
                      src={eq.equipmentImage}
                      alt={eq.equipmentName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-(length:--font-size-body-sm) text-text-muted font-medium">
                      No Photo
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center text-text-muted mb-1">
                  <span className="font-medium text-(length:--font-size-body-sm) text-primary">
                    {getCategoryName(eq)}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-text-primary line-clamp-1 mb-3">
                  {eq.equipmentName}
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-(length:--font-size-body-sm)">
                    <span className="text-text-muted">Condition:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-(length:--font-size-caption) font-medium capitalize ${conditionBadge[eq.equipmentCondition]}`}
                    >
                      {eq.equipmentCondition}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-(length:--font-size-body-sm)">
                    <span className="text-text-muted">Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-(length:--font-size-caption) font-medium capitalize ${statusBadge[eq.equipmentStatus]}`}
                    >
                      {eq.equipmentStatus}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                <button
                  onClick={() => setDetailItem(eq)}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-slate-200 text-text-primary py-2 rounded-xl text-(length:--font-size-body-sm) font-medium hover:text-primary cursor-pointer transition-colors"
                >
                  <Eye size={15} /> Detail
                </button>
                {eq.equipmentStatus === "available" ? (
                  <button
                    onClick={() => setBorrowItem(eq)}
                    className="flex-1 bg-primary text-white py-2 rounded-xl text-(length:--font-size-body-sm) font-medium hover:opacity-90 cursor-pointer transition-opacity text-center shadow-sm"
                  >
                    Borrow
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 bg-slate-100 text-slate-400 py-2 rounded-xl text-(length:--font-size-body-sm) font-medium cursor-not-allowed text-center"
                  >
                    Unavailable
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {paginatedEquipments.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 sm:p-12 text-center text-text-muted mt-4">
          No equipment found
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white rounded-2xl border border-slate-100 px-4 sm:px-6 py-4 mt-6 shadow-sm">
          <p className="text-(length:--font-size-body-sm) text-text-muted">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="flex items-center gap-1 border border-slate-200 text-text-muted px-3.5 py-1.5 rounded-xl text-(length:--font-size-body-sm) hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="flex items-center gap-1 border border-slate-200 text-text-muted px-3.5 py-1.5 rounded-xl text-(length:--font-size-body-sm) hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      <BorrowRequestModal
        equipment={borrowItem}
        onClose={() => setBorrowItem(null)}
        onSuccess={() => {
          setBorrowItem(null);
          toast.success("Borrow request submitted successfully!");
          fetchData();
        }}
      />
      <EquipmentDetailModal
        equipment={detailItem}
        onClose={() => setDetailItem(null)}
      />
    </motion.div>
  );
}

export default UserEquipmentPage;