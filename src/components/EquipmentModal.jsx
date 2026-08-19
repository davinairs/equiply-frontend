import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, ChevronDown, Check } from "lucide-react";

function EquipmentModal({
  show,
  editingId,
  form,
  setForm,
  categories,
  equipmentsList,
  imageFile,
  setImageFile,
  onSubmit,
  onClose,
  submitting,
}) {
  const [openCatDropdown, setOpenCatDropdown] = useState(false);
  const [openCondDropdown, setOpenCondDropdown] = useState(false);
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);

  function generateNextSerialNumber(equipments) {
    const numbers = equipments
      .map((eq) => {
        const match = eq.serialNumber?.match(/^SN-(\d+)$/);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((n) => n !== null);

    if (numbers.length === 0) return "SN-001";
    const maxNumber = Math.max(...numbers);
    const digitLength = String(maxNumber).length;
    return `SN-${String(maxNumber + 1).padStart(Math.max(digitLength, 3), "0")}`;
  }

  useEffect(() => {
    if (show && !editingId && equipmentsList) {
      const suggestedSN = generateNextSerialNumber(equipmentsList);
      setForm((prev) => ({ ...prev, serialNumber: suggestedSN }));
    }
  }, [show, editingId]);

  if (!show) return null;

  const selectedCatName = categories.find((c) => String(c.id) === String(form.categoryId))?.categoryName || "-- Select Category --";
  const selectedCondName = form.equipmentCondition ? form.equipmentCondition.charAt(0).toUpperCase() + form.equipmentCondition.slice(1) : "-- Select Condition --";
  const selectedStatusName = form.equipmentStatus ? form.equipmentStatus.charAt(0).toUpperCase() + form.equipmentStatus.slice(1) : "Available";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
      >

        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className=" font-semibold text-text-primary">
            {editingId ? "Edit Equipment" : "Add Equipment"}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-(length:--font-size-body-sm) font-medium text-text-primary mb-1.5">
              Equipment Name
            </label>
            <input
              type="text"
              value={form.equipmentName}
              onChange={(e) => setForm({ ...form, equipmentName: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-(length:--font-size-body-sm) text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-(length:--font-size-body-sm) font-medium text-text-primary mb-1.5">
              Serial Number
            </label>
            <input
              type="text"
              value={form.serialNumber}
              disabled
              className="w-full border border-slate-200 bg-slate-50 text-text-muted rounded-xl px-3.5 py-2.5 text-(length:--font-size-body-sm) cursor-not-allowed"
            />
          </div>
          <div className="relative">
            <label className="block text-(length:--font-size-body-sm) font-medium text-text-primary mb-1.5">
              Category
            </label>
            <div
              onClick={() => {
                setOpenCatDropdown(!openCatDropdown);
                setOpenCondDropdown(false);
                setOpenStatusDropdown(false);
              }}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-(length:--font-size-body-sm) text-text-primary bg-white flex items-center justify-between cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
            >
              <span>{selectedCatName}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 text-text-muted ${openCatDropdown ? "rotate-180" : ""}`} />
            </div>

            <AnimatePresence>
              {openCatDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 4, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full z-50 w-full bg-white border border-slate-100 rounded-2xl shadow-xl py-2 max-h-52 overflow-y-auto"
                >
                  {categories.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setForm({ ...form, categoryId: c.id });
                        setOpenCatDropdown(false);
                      }}
                      className={`px-4 py-2 text-(length:--font-size-body-sm) flex items-center justify-between hover:bg-slate-50 cursor-pointer ${String(form.categoryId) === String(c.id) ? "text-primary font-medium bg-slate-50/80" : "text-text-primary"}`}
                    >
                      <span>{c.categoryName}</span>
                      {String(form.categoryId) === String(c.id) && <Check size={14} className="text-primary" />}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div>
            <label className="block text-(length:--font-size-body-sm) font-medium text-text-primary mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-(length:--font-size-body-sm) text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="relative">
            <label className="block text-(length:--font-size-body-sm) font-medium text-text-primary mb-1.5">
              Condition
            </label>
            <div
              onClick={() => {
                setOpenCondDropdown(!openCondDropdown);
                setOpenCatDropdown(false);
                setOpenStatusDropdown(false);
              }}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-(length:--font-size-body-sm) text-text-primary bg-white flex items-center justify-between cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
            >
              <span className="capitalize">{selectedCondName}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 text-text-muted ${openCondDropdown ? "rotate-180" : ""}`} />
            </div>

            <AnimatePresence>
              {openCondDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 4, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full z-50 w-full bg-white border border-slate-100 rounded-2xl shadow-xl py-2 overflow-hidden"
                >
                  {[
                    { label: "New", value: "new" },
                    { label: "Good", value: "good" },
                    { label: "Broken", value: "broken" },
                  ].map((cond) => (
                    <div
                      key={cond.value}
                      onClick={() => {
                        setForm({ ...form, equipmentCondition: cond.value });
                        setOpenCondDropdown(false);
                      }}
                      className={`px-4 py-2 text-(length:--font-size-body-sm) flex items-center justify-between hover:bg-slate-50 cursor-pointer ${form.equipmentCondition === cond.value ? "text-primary font-medium bg-slate-50/80" : "text-text-primary"}`}
                    >
                      <span className="capitalize">{cond.label}</span>
                      {form.equipmentCondition === cond.value && <Check size={14} className="text-primary" />}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {editingId && (
            <div className="relative">
              <label className="block text-(length:--font-size-body-sm) font-medium text-text-primary mb-1.5">
                Status
              </label>
              <div
                onClick={() => {
                  if (form.equipmentStatus === "borrowed") return; 
                  setOpenStatusDropdown(!openStatusDropdown);
                  setOpenCatDropdown(false);
                  setOpenCondDropdown(false);
                }}
                className={`w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-(length:--font-size-body-sm) flex items-center justify-between shadow-sm transition-colors ${form.equipmentStatus === "borrowed" ? "text-text-muted bg-slate-100 cursor-not-allowed" : "text-text-primary bg-white cursor-pointer hover:border-slate-300"}`}
              >
                <span className="capitalize">{selectedStatusName}</span>
                {form.equipmentStatus !== "borrowed" && (
                  <ChevronDown size={14} className={`transition-transform duration-300 text-text-muted ${openStatusDropdown ? "rotate-180" : ""}`} />
                )}
              </div>

              {form.equipmentStatus === "borrowed" && (
                <p className="text-(length:--font-size-body-caption) text-text-muted mt-1">
                  This status updates automatically when the equipment is returned.
                </p>
              )}

              <AnimatePresence>
                {openStatusDropdown && form.equipmentStatus !== "borrowed" && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 4, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full z-50 w-full bg-white border border-slate-100 rounded-2xl shadow-xl py-2 overflow-hidden"
                  >
                    {[
                      { label: "Available", value: "available" },
                      { label: "Maintenance", value: "maintenance" },
                    ].map((st) => (
                      <div
                        key={st.value}
                        onClick={() => {
                          setForm({ ...form, equipmentStatus: st.value });
                          setOpenStatusDropdown(false);
                        }}
                        className={`px-4 py-2 text-(length:--font-size-body-sm) flex items-center justify-between hover:bg-slate-50 cursor-pointer ${form.equipmentStatus === st.value ? "text-primary font-medium bg-slate-50/80" : "text-text-primary"}`}
                      >
                        <span className="capitalize">{st.label}</span>
                        {form.equipmentStatus === st.value && <Check size={14} className="text-primary"/>}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          <div>
            <label className="block text-(length:--font-size-body-sm) font-medium text-text-primary mb-1.5">
              Equipment Photo
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2 text-(length:--font-size-body-sm) font-medium text-text-primary hover:bg-slate-50 cursor-pointer transition-colors shadow-sm shrink-0">
                <Upload size={14} className="text-text-muted"/>
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

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="border border-slate-200 text-text-primary px-4 py-2 rounded-xl text-(length:--font-size-body-sm) font-medium hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-white px-5 py-2 rounded-xl text-(length:--font-size-body-sm) font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer transition-opacity shadow-sm"
            >
              {submitting ? "Saving..." : "Save Equipment"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default EquipmentModal;
