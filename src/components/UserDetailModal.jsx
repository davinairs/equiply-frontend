import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

function UserDetailModal({ user, onClose }) {
  return (
    <AnimatePresence>
      {user && (
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
              <h3 className="text-(length:--font-size-h3) font-semibold text-text-primary">
                User Detail
              </h3>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.fullName}
                  className="w-14 h-14 rounded-full object-cover shadow-xs shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-(length:--font-size-h3) shadow-xs shrink-0">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-text-primary truncate">
                  {user.fullName}
                </p>
                <p className="text-(length:--font-size-body-sm) text-text-muted truncate">
                  @{user.username}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-(length:--font-size-body-sm)">
              <div className="grid grid-cols-[80px_1fr] gap-2">
                <span className="text-text-muted text-left">
                  Email
                </span>
                <span className="font-medium text-text-primary text-left truncate">
                  {user.email}
                </span>
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-2">
                <span className="text-text-muted text-left">
                  Company
                </span>
                <span className="font-medium text-text-primary text-left wrap-break-word">
                  {user.companyName || "-"}
                </span>
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-2">
                <span className="text-text-muted text-left">
                  Role
                </span>
                <span className="font-medium text-text-primary text-left capitalize">
                  {user.role}
                </span>
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                <span className="text-text-muted text-left">
                  Status
                </span>
                <div className="text-left">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-md text-(length:--font-size-caption) font-medium capitalize ${
                      user.status === "active"
                        ? "bg-success-light text-success"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-2">
                <span className="text-text-muted text-left">
                  Joined Date
                </span>
                <span className="font-medium text-text-primary text-left">
                  {formatDate(user.createdAt || user.joinedDate)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default UserDetailModal;
