import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Eye, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

const statusColor = {
  pending: "bg-info-light text-info",
  approved: "bg-success-light text-success",
  rejected: "bg-error-light text-error",
  returned: "bg-accent-light text-accent",
};

const PAGE_SIZE = 10;

function UserBorrowRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [detailItem, setDetailItem] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/borrow-requests/me");
      setRequests(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this request?")) return;
    try {
      await api.delete(`/borrow-requests/${id}`);
      toast.success("Borrow request cancelled successfully!");
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel request");
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (activeTab === "active") return req.borrowStatus === "approved";
    if (activeTab === "pending") return req.borrowStatus === "pending";
    if (activeTab === "history")
      return req.borrowStatus === "returned" || req.borrowStatus === "rejected";
    return true;
  });

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setPage(1);
  };

  const totalPages = Math.max(
    Math.ceil(filteredRequests.length / PAGE_SIZE),
    1,
  );
  const paginatedRequests = filteredRequests.slice(
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
    <div className="max-w-6xl w-full text-left pb-10 px-4 sm:px-0">
      <div className="mb-6">
        <h2 className="text-(length:--font-size-h2) font-semibold text-primary">
          My Borrow Requests
        </h2>
        <p className="text-(length:--font-size-body-lg) text-text-muted mt-1">
          Track and manage your equipment borrowing history and status.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 pb-4 mb-3 -mx-1 px-1 overflow-x-auto">
        {[
          { key: "all", label: "All" },
          { key: "active", label: "Active" },
          { key: "pending", label: "Pending" },
          { key: "history", label: "History" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`shrink-0 px-4 py-2 rounded-xl text-(length:--font-size-body-sm) font-medium transition-all cursor-pointer ${activeTab === tab.key ? "bg-primary text-primary-light shadow-xs" : "bg-primary-light border border-stroke text-text-muted hover:bg-slate-50"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-primary-light rounded-2xl border border-stroke p-4 sm:p-6 shadow-xs"
      >
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-175 text-left text-(length:--font-size-body-sm)">
            <thead className="text-text-muted border-b border-stroke">
              <tr>
                <th className="py-3 px-4 font-medium w-[22%]">Equipment</th>
                <th className="py-3 px-4 font-medium w-[22%]">Description</th>
                <th className="py-3 px-4 font-medium w-[15%]">Borrow Date</th>
                <th className="py-3 px-4 font-medium w-[15%]">Due Date</th>
                <th className="py-3 px-4 font-medium w-[13%]">Status</th>
                <th className="py-3 px-4 font-medium w-[13%]">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {paginatedRequests.map((req, idx) => (
                  <motion.tr
                    key={req.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="border-b border-stroke text-text-primary hover:bg-slate-50/50 transition-colors font-medium"
                  >
                    <td className="py-4 px-4">
                      <p className="line-clamp-2">{req.equipmentName}</p>
                      {req.isOverdue && (
                        <span className="inline-block text-(length:--font-size-caption) text-error mt-0.5">
                          ⚠ Overdue
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <p className="line-clamp-2">{req.reason || "-"}</p>
                    </td>
                    <td className="py-4 px-4">{req.borrowDate}</td>
                    <td className="py-4 px-4">{req.dueDate || "-"}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-(length:--font-size-caption) lowercase inline-block ${statusColor[req.borrowStatus] || "bg-slate-100 text-slate-500"}`}
                      >
                        {req.borrowStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {req.borrowStatus === "pending" ? (
                        <div className="flex items-center">
                          <button
                            onClick={() => setDetailItem(req)}
                            className="text-primary hover:opacity-90 p-1.5 rounded-md text-(length:--font-size-caption) transition-opacity cursor-pointer"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleCancel(req.id)}
                            className="text-error hover:opacity-90 p-1.5 rounded-md text-(length:--font-size-caption) transition-opacity cursor-pointer"
                            title="Cancel Request"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDetailItem(req)}
                          className="bg-primary hover:opacity-90 text-primary-light px-4 py-1.5 rounded-md text-(length:--font-size-caption) transition-opacity cursor-pointer shadow-xs"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {paginatedRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    No Request Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1 sm:px-6 py-4 border-t border-stroke mt-2">
            <p className="text-(length:--font-size-caption) text-text-muted">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="flex items-center gap-1 border border-stroke text-text-muted px-3.5 py-1.5 rounded-xl text-(length:--font-size-caption) hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="flex items-center gap-1 border border-stroke text-text-muted px-3.5 py-1.5 rounded-xl text-(length:--font-size-caption) hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {detailItem && (
          <div
            onClick={() => setDetailItem(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-primary-light rounded-2xl max-w-md w-full p-6 shadow-xl border border-stroke relative"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary">
                  Borrow Request Detail
                </h3>
                <button
                  onClick={() => setDetailItem(null)}
                  className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3 text-(length:--font-size-body-sm)">
                <div>
                  <span className="text-text-muted block text-xs">
                    Equipment
                  </span>
                  <span className="font-semibold text-text-primary">
                    {detailItem.equipmentName}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block text-xs">
                    Description / Reason
                  </span>
                  <span className="text-text-primary">
                    {detailItem.reason || "-"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-text-muted block text-xs">
                      Borrow Date
                    </span>
                    <span className="text-text-primary">
                      {detailItem.borrowDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-xs">
                      Due Date
                    </span>
                    <span className="text-text-primary">
                      {detailItem.dueDate || "-"}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-text-muted block text-xs">Status</span>
                  <span
                    className={`inline-block px-2.5 py-1 rounded-md text-(length:--font-size-caption) font-medium lowercase mt-1 ${statusColor[detailItem.borrowStatus]}`}
                  >
                    {detailItem.borrowStatus}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserBorrowRequestsPage;
