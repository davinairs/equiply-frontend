import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Check, Upload } from "lucide-react"; 

function UserModal({
  show,
  form,
  setForm,
  companies,
  imageFile,
  setImageFile,
  onSubmit,
  onClose,
  submitting,
}) {
  const [openCompanyDropdown, setOpenCompanyDropdown] = useState(false);
  const [openRoleDropdown, setOpenRoleDropdown] = useState(false);

  const companyDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(e.target)) {
        setOpenCompanyDropdown(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setOpenRoleDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCompanyName = companies.find((c) => String(c.id) === String(form.companyId))?.companyName || "Select company";
  const selectedRoleName = form.role ? form.role.charAt(0).toUpperCase() + form.role.slice(1) : "User";

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
            className="relative bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 w-full max-w-md shadow-xl z-10 max-h-[90vh] overflow-y-auto text-left"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-(length:--font-size-h3) font-semibold text-text-primary">
                New User
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-(length:--font-size-body-sm) font-medium mb-1.5 text-text-primary">
                  Username
                </label>
                <input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  autoComplete="off"
                  name="new_username_field"
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-(length:--font-size-body-sm) text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-(length:--font-size-body-sm) font-medium mb-1.5 text-text-primary">
                  Full Name
                </label>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  autoComplete="off"
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-(length:--font-size-body-md) text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-(length:--font-size-body-sm) font-medium mb-1.5 text-text-primary">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoComplete="off"
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-(length:--font-size-body-md) text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-(length:--font-size-body-sm) font-medium mb-1.5 text-text-primary">
                  Password
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="new-password"
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-(length:--font-size-body-md) text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  minLength={8}
                />
              </div>

              <div className="relative" ref={companyDropdownRef}>
                <label className="block text-(length:--font-size-body-sm) font-medium mb-1.5 text-text-primary">
                  Company
                </label>
                <div
                  onClick={() => {
                    setOpenCompanyDropdown(!openCompanyDropdown);
                    setOpenRoleDropdown(false);
                  }}
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-(length:--font-size-body-sm) text-text-primary bg-white flex items-center justify-between cursor-pointer shadow-xs hover:border-slate-300 transition-colors"
                >
                  <span className={!form.companyId ? "text-text-muted" : "text-text-primary"}>
                    {selectedCompanyName}
                  </span>
                  <ChevronDown size={14} className={`transition-transform duration-300 text-text-muted ${openCompanyDropdown ? "rotate-180" : ""}`} />
                </div>

                <AnimatePresence>
                  {openCompanyDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 4, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full z-50 w-full bg-white border border-slate-100 rounded-2xl shadow-xl py-2 max-h-52 overflow-y-auto"
                    >
                      {companies.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setForm({ ...form, companyId: c.id });
                            setOpenCompanyDropdown(false);
                          }}
                          className={`px-4 py-2 text-(length:--font-size-body-sm) flex items-center justify-between hover:bg-slate-50 cursor-pointer ${String(form.companyId) === String(c.id) ? "text-primary font-medium bg-slate-50/80" : "text-text-primary"}`}
                        >
                          <span>{c.companyName}</span>
                          {String(form.companyId) === String(c.id) && <Check size={14} className="text-primary" />}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative" ref={roleDropdownRef}>
                <label className="block text-(length:--font-size-body-sm) font-medium mb-1.5 text-text-primary">
                  Role
                </label>
                <div
                  onClick={() => {
                    setOpenRoleDropdown(!openRoleDropdown);
                    setOpenCompanyDropdown(false);
                  }}
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-(length:--font-size-body-sm) text-text-primary bg-white flex items-center justify-between cursor-pointer shadow-xs hover:border-slate-300 transition-colors"
                >
                  <span className="capitalize">{selectedRoleName}</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 text-text-muted ${openRoleDropdown ? "rotate-180" : ""}`} />
                </div>

                <AnimatePresence>
                  {openRoleDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 4, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full z-50 w-full bg-white border border-slate-100 rounded-2xl shadow-xl py-2 overflow-hidden"
                    >
                      {[
                        { label: "User", value: "user" },
                        { label: "Admin", value: "admin" },
                      ].map((r) => (
                        <div
                          key={r.value}
                          onClick={() => {
                            setForm({ ...form, role: r.value });
                            setOpenRoleDropdown(false);
                          }}
                          className={`px-4 py-2 text-(length:--font-size-body-sm) flex items-center justify-between hover:bg-slate-50 cursor-pointer ${form.role === r.value ? "text-primary font-medium bg-slate-50/80" : "text-text-primary"}`}
                        >
                          <span className="capitalize">{r.label}</span>
                          {form.role === r.value && <Check size={14} className="text-primary" />}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="block text-(length:--font-size-body-sm) font-medium text-text-primary mb-1.5">
                  Profile Picture
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2 text-(length:--font-size-body-sm) font-medium text-text-primary hover:bg-slate-50 cursor-pointer transition-colors shadow-xs shrink-0">
                    <Upload size={14} className="text-text-muted" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  <span className="text-(length:--font-size-body-sm) text-text-muted truncate max-w-full sm:max-w-50">
                    {imageFile ? imageFile.name : "No file chosen"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg text-(length:--font-size-body-sm) font-medium border border-slate-200 text-text-muted hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: !submitting ? 1.02 : 1 }}
                  whileTap={{ scale: !submitting ? 0.98 : 1 }}
                  disabled={submitting}
                  className="bg-primary text-white px-6 py-2.5 rounded-lg text-(length:--font-size-body-sm) font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer transition-all"
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

export default UserModal;
