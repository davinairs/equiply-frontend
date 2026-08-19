import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import api from "../services/api";

function BorrowRequestModal({ equipment, onClose, onSuccess }) {
  const [form, setForm] = useState({ borrowDate: "", reason: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/borrow-requests", {
        ...form,
        equipmentId: Number(equipment.id),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  if (!equipment) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-100 text-left max-h-[90vh] flex flex-col"
        >
          <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b border-slate-100 shrink-0">
            <h3 className="font-semibold text-primary text-(length:--font-size-h3)">
              Request Equipment Borrow
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6 space-y-4 overflow-y-auto"
          >
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="font-semibold text-text-primary text-(length:--font-size-sm) wrap-break-word">
                {equipment.equipmentName}
              </p>
              <p className="text-[12px] text-text-muted mt-0.5">
                {equipment.categoryName}{" "}
                {equipment.serialNumber ? `· ${equipment.serialNumber}` : ""}
              </p>
            </div>

            {error && (
              <div className="bg-error-light text-error px-4 py-3 rounded-xl text-(length:--font-size-body-sm) font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-(length:--font-size-body-sm) font-medium mb-1.5 text-text-primary">
                Borrow Date
              </label>
              <input
                type="date"
                value={form.borrowDate}
                onChange={(e) =>
                  setForm({ ...form, borrowDate: e.target.value })
                }
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-(length:--font-size-body-sm) text-text-primary focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-(length:--font-size-body-sm) font-medium mb-1.5 text-text-primary">
                Reason for Borrowing
              </label>
              <textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-(length:--font-size-body-sm) text-text-primary focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                rows={3}
                placeholder="Write down the reason for borrowing this equipment..."
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-(length:--font-size-body-sm) font-medium border border-slate-200 text-text-muted hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-5 py-2.5 rounded-xl text-(length:--font-size-body-sm) font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default BorrowRequestModal;
