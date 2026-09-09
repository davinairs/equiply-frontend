import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

function AddAdminModal({
  show,
  companies = [],
  form,
  setForm,
  onSubmit,
  onClose,
  submitting,
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-(length:--font-size-h3) font-semibold text-text-primary">
                Add Admin
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-text-muted hover:text-text-primary cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-(length:--font-size-body-sm) text-text-muted mb-5">
              Create a new admin account and assign them to a company.
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-(length:--font-size-body-sm) font-medium text-text-primary mb-1">
                  Company
                </label>
                <select
                  required
                  value={form.companyId}
                  onChange={(e) =>
                    setForm({ ...form, companyId: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-(length:--font-size-body-sm) text-text-primary focus:outline-none focus:border-primary bg-white"
                >
                  <option value="" disabled>
                    Select a company
                  </option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-(length:--font-size-body-sm) font-medium text-text-primary mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-(length:--font-size-body-sm) focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-(length:--font-size-body-sm) font-medium text-text-primary mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-(length:--font-size-body-sm) focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-(length:--font-size-body-sm) font-medium text-text-primary mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-(length:--font-size-body-sm) focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-(length:--font-size-body-sm) font-medium text-text-primary mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-(length:--font-size-body-sm) focus:outline-none focus:border-primary"
                />
                <p className="text-(length:--font-size-caption) text-text-muted mt-1">
                  Minimum 8 characters.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-slate-200 text-text-muted py-2.5 rounded-xl text-(length:--font-size-body-sm) hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary text-white py-2.5 rounded-xl text-(length:--font-size-body-sm) font-medium hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity cursor-pointer"
                >
                  {submitting ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AddAdminModal;
