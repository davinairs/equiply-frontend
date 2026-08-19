import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

function CategoryModal({ show, editingId, form, setForm, onSubmit, onClose, submitting }) {
  return (
    <AnimatePresence>
      {show && (
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
            className="relative bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 w-full max-w-md shadow-xl z-10 text-left max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-(length:--font-size-h3) font-semibold text-text-primary">
                {editingId ? "Edit Category" : "New Category"}
              </h3>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-(length:--font-size-body-sm) font-medium text-text-primary mb-1.5">
                  Category Name
                </label>
                <input
                  value={form.categoryName}
                  onChange={(e) =>
                    setForm({ ...form, categoryName: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-(length:--font-size-body-md) text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-(length:--font-size-body-sm) font-medium mb-1.5 text-text-primary">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-(length:--font-size-body-md) text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={2}
                />
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg text-(length:--font-size-body-sm) font-medium border border-slate-200 text-text-muted hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: !submitting ? 1.02 : 1 }}
                  whileTap={{ scale: !submitting ? 0.98 : 1 }}
                  type="submit"
                  disabled={submitting}
                  className="bg-primary text-white px-6 py-2.5 rounded-lg text-(length:--font-size-body-sm) font-medium hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer transition-all"
                >
                  {submitting ? "Saving..." : "Save"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default CategoryModal;
