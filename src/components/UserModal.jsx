import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Check } from "lucide-react";

function UserModal({
  show,
  form,
  setForm,
  units,
  onSubmit,
  onClose,
  submitting,
}) {
  const [openUnitDropdown, setOpenUnitDropdown] = useState(false);
  const unitDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        unitDropdownRef.current &&
        !unitDropdownRef.current.contains(e.target)
      ) {
        setOpenUnitDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedUnitName =
    units.find((c) => String(c.id) === String(form.unitId))?.unitName ||
    "Select unit";

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 ">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-primary-light text-text-primary rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-stroke flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-stroke shrink-0">
              <h3 className="text-primary text-(length:--font-size-h3) font-semibold">
                New User
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-text-muted hover:text-text-primary p-1 rounded-xl hover:bg-primary/5 cursor-pointer transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={onSubmit}
              className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1"
              autoComplete="off"
            >
              <div>
                <label className="block text-(length:--font-size-body-sm) font-medium text-text-primary mb-1.5">
                  Username
                </label>
                <input
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  autoComplete="off"
                  name="new_username_field"
                  className="w-full border border-stroke bg-primary-light rounded-xl px-3.5 py-2.5 text-(length:--font-size-body-sm) text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-(length:--font-size-body-sm) font-medium text-text-primary mb-1.5">
                  Full Name
                </label>
                <input
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  autoComplete="off"
                  className="w-full border border-stroke bg-primary-light rounded-xl px-3.5 py-2.5 text-(length:--font-size-body-sm) text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-(length:--font-size-body-sm) font-medium text-text-primary mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoComplete="off"
                  className="w-full border border-stroke bg-primary-light rounded-xl px-3.5 py-2.5 text-(length:--font-size-body-sm) text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-(length:--font-size-body-sm) font-medium text-text-primary mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  autoComplete="new-password"
                  className="w-full border border-stroke bg-primary-light rounded-xl px-3.5 py-2.5 text-(length:--font-size-body-sm) text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  minLength={8}
                />
              </div>

              <div className="relative" ref={unitDropdownRef}>
                <label className="block text-(length:--font-size-body-sm) font-medium text-text-primary mb-1.5">
                  Unit
                </label>
                <div
                  onClick={() => setOpenUnitDropdown(!openUnitDropdown)}
                  className="w-full border border-stroke rounded-xl px-3.5 py-2.5 text-(length:--font-size-body-sm) text-text-primary bg-primary-light flex items-center justify-between cursor-pointer hover:border-text-muted transition-colors"
                >
                  <span
                    className={
                      !form.unitId ? "text-text-muted" : "text-text-primary"
                    }
                  >
                    {selectedUnitName}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 text-text-muted ${openUnitDropdown ? "rotate-180" : ""}`}
                  />
                </div>

                <AnimatePresence>
                  {openUnitDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 4, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full z-50 w-full bg-primary-light border border-stroke rounded-2xl shadow-xl py-2 max-h-52 overflow-y-auto"
                    >
                      {units.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setForm({ ...form, unitId: c.id });
                            setOpenUnitDropdown(false);
                          }}
                          className={`px-4 py-2 text-(length:--font-size-body-sm) flex items-center justify-between hover:bg-primary/5 cursor-pointer ${String(form.unitId) === String(c.id) ? "text-primary font-medium bg-primary/10" : "text-text-primary"}`}
                        >
                          <span>{c.unitName}</span>
                          {String(form.unitId) === String(c.id) && (
                            <Check size={14} className="text-primary" />
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-row items-center justify-end gap-3 pt-4 border-t border-stroke">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-error hover:opacity-90 text-white px-4 py-2 rounded-lg text-(length:--font-size-body-sm) font-medium cursor-pointer transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary hover:opacity-90 text-white px-5 py-2 rounded-lg text-(length:--font-size-body-sm) font-medium disabled:opacity-50 cursor-pointer transition-opacity shadow-sm"
                >
                  {submitting ? "Saving..." : "Save User"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default UserModal;
