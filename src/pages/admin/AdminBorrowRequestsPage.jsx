import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, Check } from "lucide-react";
import ReviewRequestModal from "../../components/ReviewRequestModal";
import api from "../../services/api";

const PAGE_SIZE = 10;

const statusBadge = {
  pending: "bg-info-light text-info",
  approved: "bg-success-light text-success",
  rejected: "bg-error-light text-error",
  returned: "bg-return-light text-return",
};

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

function isWithinLastDay(dateStr) {
  if (!dateStr) return false;
  const diffDays = (new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 1;
}

const colorTextClass = {
  info: "text-info",
  warning: "text-warning",
  success: "text-success",
  error: "text-error",
};

function AdminBorrowRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [reviewTarget, setReviewTarget] = useState(null);
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/borrow-requests");
      setRequests(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, dueDate) => {
    try {
      await api.patch(`/borrow-requests/${id}/approve`, { dueDate });
      setReviewTarget(null);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve request");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/borrow-requests/${id}/reject`);
      setReviewTarget(null);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject request");
    }
  };

  const handleForceReturn = async (id) => {
    try {
      await api.patch(`/borrow-requests/${id}/force-return`);
      setReviewTarget(null);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to process force return");
    }
  };

const filteredRequests = filterStatus
    ? requests.filter((r) => r.borrowStatus === filterStatus)
    : requests;

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const valA = a.createdAt || a.id || 0;
    const valB = b.createdAt || b.id || 0;

    if (valA < valB) return 1;
    if (valA > valB) return -1;
    return 0;
  });

  const totalPages = Math.max(
    Math.ceil(sortedRequests.length / PAGE_SIZE),
    1,
  );

  const paginatedRequests = sortedRequests.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const statCards = [
    {
      label: "Total Requests",
      value: requests.length,
      newCount: requests.filter((r) => isWithinLastDay(r.createdAt)).length,
      color: "info",
    },
    {
      label: "Pending",
      value: requests.filter((r) => r.borrowStatus === "pending").length,
      newCount: requests.filter(
        (r) => r.borrowStatus === "pending" && isWithinLastDay(r.createdAt),
      ).length,
      color: "warning",
    },
    {
      label: "Approved",
      value: requests.filter((r) => r.borrowStatus === "approved").length,
      newCount: requests.filter(
        (r) => r.borrowStatus === "approved" && isWithinLastDay(r.updatedAt),
      ).length,
      color: "success",
    },
    {
      label: "Rejected",
      value: requests.filter((r) => r.borrowStatus === "rejected").length,
      newCount: requests.filter(
        (r) => r.borrowStatus === "rejected" && isWithinLastDay(r.updatedAt),
      ).length,
      color: "error",
    },
    {
      label: "Overdue",
      value: requests.filter((r) => r.isOverdue).length,
      newCount: requests.filter(
        (r) => r.isOverdue && isWithinLastDay(r.dueDate),
      ).length,
      color: "error",
    },
  ];

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

  const selectedStatusLabel = filterStatus
    ? filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)
    : "All Status";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pb-10 text-left px-4 sm:px-0"
    >
      <div className="mb-6">
        <h2 className="text-(length:--font-size-h2) font-semibold text-primary">
          Borrow Requests
        </h2>
        <p className="text-(length:--font-size-body-lg) text-text-muted mt-1">
          Manage all borrow requests.
        </p>
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
              className={`text-(length:--font-size-caption) mt-1 ${card.newCount > 0 ? colorTextClass[card.color] : "text-text-muted"}`}
            >
              {card.newCount > 0 ? `+${card.newCount} last day` : "No change"}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mb-4">
        <div className="relative inline-block">
          <button
            onClick={() => setOpenStatusDropdown(!openStatusDropdown)}
            className="flex items-center justify-between gap-6 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-(length:--font-size-body-sm) text-text-primary hover:border-slate-300 shadow-sm cursor-pointer min-w-35"
          >
            <span>{selectedStatusLabel}</span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 text-text-muted ${openStatusDropdown ? "rotate-180" : "rotate-0"}`}
            />
          </button>
          <AnimatePresence>
            {openStatusDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 4, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full z-30 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 min-w-40 max-w-[85vw] overflow-hidden"
              >
                {[
                  { label: "All Status", value: "" },
                  { label: "Pending", value: "pending" },
                  { label: "Approved", value: "approved" },
                  { label: "Rejected", value: "rejected" },
                  { label: "Returned", value: "returned" },
                ].map((item) => (
                  <div
                    key={item.value}
                    onClick={() => {
                      setFilterStatus(item.value);
                      setPage(1);
                      setOpenStatusDropdown(false);
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

      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 shadow-sm mt-5"
      >
        <h3 className="text-[length:(--font-size-h3)] font-semibold text-text-primary mb-5">
          Borrow Requests
        </h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-170 text-left text-(length:--font-size-body-sm)">
            <thead className="text-text-muted border-b border-slate-100">
              <tr>
                <th className="pb-3 pl-3 font-medium w-[18%]">User</th>
                <th className="pb-3 font-medium w-[22%]">Equipment</th>
                <th className="pb-3 font-medium w-[18%]">Borrow Date</th>
                <th className="pb-3 font-medium w-[18%]">Due Date</th>
                <th className="pb-3 font-medium w-[12%]">Status</th>
                <th className="pb-3 pr-3 font-medium w-[12%]">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {paginatedRequests.map((r, idx) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="border-b border-slate-50 text-text-primary hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 pl-3 font-medium">{r.fullName}</td>
                    <td className="py-4 font-medium">{r.equipmentName}</td>
                    <td className="py-4 font-medium">{formatDate(r.borrowDate)}</td>
                    <td className="py-4 font-medium">
                      {formatDate(r.dueDate)}
                      {r.isOverdue && (
                        <span className="text-error text-(length:--font-size-caption) ml-1">
                          (Late)
                        </span>
                      )}
                    </td>
                    <td className="py-4 font-medium">
                      <span
                        className={`px-2.5 py-1 rounded-md text-(length:--font-size-caption) font-medium capitalize inline-block ${statusBadge[r.borrowStatus]}`}
                      >
                        {r.borrowStatus}
                      </span>
                    </td>
                    <td className="py-4 pr-3">
                      <button
                        type="button"
                        onClick={() => setReviewTarget(r)}
                        className="text-primary font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        Review
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {paginatedRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    No requests found
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

      {reviewTarget && (
        <ReviewRequestModal
          request={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onForceReturn={handleForceReturn}
        />
      )}
    </motion.div>
  );
}

export default AdminBorrowRequestsPage;
