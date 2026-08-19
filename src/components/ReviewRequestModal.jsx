import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

const statusBadge = {
  pending: "bg-info-light text-info",
  approved: "bg-success-light text-success",
  rejected: "bg-error-light text-error",
  returned: "bg-slate-100 text-slate-600",
};

function ReviewRequestModal({ request, onClose, onApprove, onReject, onForceReturn }) {
  const [dueDate, setDueDate] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleApprove = async () => {
    if (!dueDate) {
      setErrorMsg("The due date must be filled in to approve the request.");
      return;
    }
    setErrorMsg("");
    try {
      setActionLoading("approve");
      await onApprove(request.id, dueDate);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    setErrorMsg("");
    try {
      setActionLoading("reject");
      await onReject(request.id);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleForceReturn = async () => {
    setErrorMsg("");
    try {
      setActionLoading("return");
      await onForceReturn(request.id);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {request && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-2xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-2xl border border-slate-100 max-w-md w-full p-4 sm:p-6 text-left shadow-xl z-10 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-(length:--font-size-h3) font-semibold text-text-primary">Review Request</h3>
              <button 
                onClick={onClose} 
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-(length:--font-size-body-sm) mb-6">
              <div className="grid grid-cols-[92px_1fr] gap-2 items-start">
                <span className="text-text-muted text-left">User</span>
                <span className="font-medium text-text-primary text-left wrap-break-word">{request.fullName}</span>
              </div>
              <div className="grid grid-cols-[92px_1fr] gap-2 items-start">
                <span className="text-text-muted text-left">Equipment</span>
                <span className="font-medium text-text-primary text-left wrap-break-word">{request.equipmentName}</span>
              </div>
              <div className="grid grid-cols-[92px_1fr] gap-2 items-start">
                <span className="text-text-muted text-left">Borrow Date</span>
                <span className="font-medium text-text-primary text-left">{formatDate(request.borrowDate)}</span>
              </div>
              {request.dueDate && (
                <div className="grid grid-cols-[92px_1fr] gap-2 items-start">
                  <span className="text-text-muted text-left">Due Date</span>
                  <span className="font-medium text-text-primary text-left">{formatDate(request.dueDate)}</span>
                </div>
              )}
              {request.returnDate && (
                <div className="grid grid-cols-[92px_1fr] gap-2 items-start">
                  <span className="text-text-muted text-left">Return Date</span>
                  <span className="font-medium text-text-primary text-left">{formatDate(request.returnDate)}</span>
                </div>
              )}
              {request.reason && (
                <div className="grid grid-cols-[92px_1fr] gap-2 items-start">
                  <span className="text-text-muted text-left">Reason</span>
                  <span className="font-medium text-text-primary text-left wrap-break-word">{request.reason}</span>
                </div>
              )}
              <div className="grid grid-cols-[92px_1fr] gap-2 items-center">
                <span className="text-text-muted text-left">Status</span>
                <div className="text-left">
                  <span className={`inline-block px-2.5 py-1 rounded-md text-(length:--font-size-caption) font-medium capitalize ${statusBadge[request.borrowStatus]}`}>
                    {request.borrowStatus}
                  </span>
                </div>
              </div>
              {request.isOverdue && (
                <p className="text-error text-(length:--font-size-sm) text-left font-medium">⚠ Terlambat dikembalikan</p>
              )}
            </div>

            {request.borrowStatus === "pending" && (
              <div className="border-t border-slate-100 pt-4 text-left">
                <label className="block text-(length:--font-size-body-sm) font-medium mb-1.5 text-text-primary text-left">Due Date (To Approve)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-(length:--font-size-body-md) text-text-primary mb-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errorMsg && <p className="text-error text-(length:--font-size-body-sm) mb-3">{errorMsg}</p>}
                
                <div className="flex gap-3 mt-3">
                  <motion.button
                    whileHover={{ scale: actionLoading === null ? 1.02 : 1 }}
                    whileTap={{ scale: actionLoading === null ? 0.98 : 1 }}
                    onClick={handleApprove}
                    disabled={actionLoading !== null}
                    className="flex-1 bg-success text-white py-2.5 rounded-lg text-(length:--font-size-body-sm) font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    {actionLoading === "approve" && <Loader2 size={16} className="animate-spin" />}
                    {actionLoading === "approve" ? "" : "Approve"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: actionLoading === null ? 1.02 : 1 }}
                    whileTap={{ scale: actionLoading === null ? 0.98 : 1 }}
                    onClick={handleReject}
                    disabled={actionLoading !== null}
                    className="flex-1 bg-error text-white py-2.5 rounded-lg text-(length:--font-size-body-sm) font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    {actionLoading === "reject" && <Loader2 size={16} className="animate-spin" />}
                    {actionLoading === "reject" ? "" : "Reject"}
                  </motion.button>
                </div>
              </div>
            )}

            {request.borrowStatus === "approved" && (
              <div className="border-t border-slate-100 pt-4">
                <motion.button
                  whileHover={{ scale: actionLoading === null ? 1.02 : 1 }}
                  whileTap={{ scale: actionLoading === null ? 0.98 : 1 }}
                  onClick={handleForceReturn}
                  disabled={actionLoading !== null}
                  className="w-full bg-primary text-white py-2.5 rounded-lg text-(length:--font-size-body-sm) font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  {actionLoading === "return" && <Loader2 size={16} className="animate-spin" />}
                  {actionLoading === "return" ? "Processing..." : "Mark as Returned"}
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ReviewRequestModal;
