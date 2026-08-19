import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const statusBadge = {
  available: "bg-success-light text-success",
  borrowed: "bg-info-light text-info",
  maintenance: "bg-warning-light text-warning",
};

const conditionBadge = {
  new: "bg-success-light text-success",
  good: "bg-info-light text-info",
  broken: "bg-error-light text-error",
};

function EquipmentDetailModal({ equipment, onClose }) {
  return (
    <AnimatePresence>
      {equipment && (
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
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-(length:--font-size-h4) font-semibold text-text-primary">
                Equipment Detail
              </h2>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {equipment.equipmentImage ? (
              <img
                src={equipment.equipmentImage}
                alt={equipment.equipmentName}
                className="w-full h-40 sm:h-48 object-contain bg-slate-50 rounded-xl mb-4 border border-slate-100"
              />
            ) : (
              <div className="w-full h-40 sm:h-48 bg-slate-50 rounded-xl mb-4 flex items-center justify-center text-text-muted text-(length:--font-size-body-sm) border border-slate-100">
                No Photo
              </div>
            )}

            <div className="space-y-3 text-(length:--font-size-body-sm)">
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-text-muted">Name</span>
                <span className="font-medium text-text-primary text-left wrap-break-word">{equipment.equipmentName}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-text-muted">Serial Number</span>
                <span className="font-medium text-text-primary text-left wrap-break-word">{equipment.serialNumber}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-text-muted">Category</span>
                <span className="font-medium text-text-primary text-left wrap-break-word">{equipment.categoryName}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-text-muted">Location</span>
                <span className="font-medium text-text-primary text-left wrap-break-word">{equipment.location || "-"}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                <span className="text-text-muted">Condition</span>
                <div className="text-left">
                  <span className={`inline-block px-2.5 py-1 rounded-md text-(length:--font-size-caption) font-medium capitalize ${conditionBadge[equipment.equipmentCondition]}`}>
                    {equipment.equipmentCondition}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                <span className="text-text-muted">Status</span>
                <div className="text-left">
                  <span className={`inline-block px-2.5 py-1 rounded-md text-(length:--font-size-caption) font-medium capitalize ${statusBadge[equipment.equipmentStatus]}`}>
                    {equipment.equipmentStatus}
                  </span>
                </div>
              </div>
              {equipment.description && (
                <div className="grid grid-cols-[100px_1fr] gap-2 pt-1">
                  <span className="text-text-muted">Description</span>
                  <p className="text-text-primary text-left wrap-break-word">{equipment.description}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default EquipmentDetailModal;
