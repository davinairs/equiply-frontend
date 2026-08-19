import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

const statusColor = {
  pending: "bg-info-light text-info",
  approved: "bg-success-light text-success",
  rejected: "bg-error-light text-error",
  returned: "bg-return-light text-return",
};

const PAGE_SIZE = 10;

function UserBorrowRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);

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

  const handleReturn = async (id) => {
    if (!window.confirm("Confirm that the equipment has been returned?"))
      return;
    try {
      await api.patch(`/borrow-requests/${id}/return`);
      toast.success("Equipment returned successfully!");
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to return equipment");
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
    <div className="max-w-5xl w-full text-left pb-10 px-4 sm:px-0">
      <div className="mb-6">
        <h2 className="text-(length:--font-size-h2) font-semibold text-primary">
          My Borrow Requests
        </h2>
        <p className="text-(length:--font-size-body-lg) text-text-muted mt-1">
          Track and manage your equipment borrowing history and status.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4 mb-6 -mx-1 px-1 overflow-x-auto">
        {[
          { key: "all", label: "All" },
          { key: "active", label: "Active" },
          { key: "pending", label: "Pending" },
          { key: "history", label: "History" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`shrink-0 px-4 py-2 rounded-xl text-(length:--font-size-body-sm) font-medium transition-all cursor-pointer ${activeTab === tab.key ? "bg-primary text-white shadow-sm" : "bg-white border border-slate-200 text-text-muted hover:bg-slate-50"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 shadow-sm mt-6"
      >
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-150 text-left text-(length:--font-size-body-sm)">
            <thead className="text-text-muted border-b border-slate-100">
              <tr>
                <th className="pb-3 font-medium pl-3 w-[28%]">Equipment</th>
                <th className="pb-3 font-medium w-[20%]">Borrow Date</th>
                <th className="pb-3 font-medium w-[20%]">Due Date</th>
                <th className="pb-3 font-medium w-[15%]">Status</th>
                <th className="pb-3 font-medium pr-3 w-[17%]">Actions</th>
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
                    className="border-b border-slate-50 text-text-primary hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 pl-3 font-medium">
                      <p className="font-medium">{req.equipmentName}</p>
                      {req.reason && (
                        <p className="text-(length:--font-size-caption) text-text-muted mt-0.5">
                          "{req.reason}"
                        </p>
                      )}
                      {req.isOverdue && (
                        <span className="inline-block text-(length:--font-size-caption) text-error font-medium mt-1">
                          ⚠ Overdue
                        </span>
                      )}
                    </td>
                    <td className="py-4 font-medium">{req.borrowDate}</td>
                    <td className="py-4 font-medium">{req.dueDate || "-"}</td>
                    <td className="py-4 pr-3">
                      <span
                        className={`px-2.5 py-1 rounded-md text-(length:--font-size-caption) font-medium capitalize inline-block ${statusColor[req.borrowStatus] || "bg-slate-100 text-slate-500"}`}
                      >
                        {req.borrowStatus}
                      </span>
                    </td>
                    <td className="py-4 pr-3">
                      <div className="flex items-center gap-2">
                        {req.borrowStatus === "pending" && (
                          <button
                            onClick={() => handleCancel(req.id)}
                            className="text-error hover:opacity-80 text-(length:--font-size-caption) font-medium transition-opacity cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        {req.borrowStatus === "approved" && (
                          <button
                            onClick={() => handleReturn(req.id)}
                            className="bg-primary text-white px-3 py-1.5 rounded-lg text-(length:--font-size-caption) font-medium hover:opacity-95 transition-opacity cursor-pointer shadow-xs"
                          >
                            Return
                          </button>
                        )}
                        {req.borrowStatus !== "pending" &&
                          req.borrowStatus !== "approved" && (
                            <span className="text-text-muted text-(length:--font-size-caption)">
                              -
                            </span>
                          )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {paginatedRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted">
                    No request found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1 sm:px-6 py-4 border-t border-slate-50 mt-2">
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
    </div>
  );
}

export default UserBorrowRequestsPage;