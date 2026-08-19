import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../services/api";

const PAGE_SIZE = 10;

function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (err) {
      console.error("Failed to mark as read");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete notification");
    }
  };

  const handleClick = (notif) => {
    if (!notif.isRead) {
      handleMarkAsRead(notif.id);
    }
    if (notif.borrowRequestId) {
      const basePath =
        role === "admin"
          ? "/admin/borrow-requests"
          : "/user/my-borrow-requests";

      navigate(`${basePath}?highlight=${notif.borrowRequestId}`);
    }
  };

  const totalPages = Math.max(Math.ceil(notifications.length / PAGE_SIZE), 1);
  const paginatedNotifications = notifications.slice(
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
    <div className="max-w-4xl text-left pb-10 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-(length:--font-size-h2) font-semibold text-primary">
            Notifications
          </h2>
          <p className="text-(length:--font-size-body-lg) text-text-muted mt-1">
            Stay updated with your latest alerts and requests.
          </p>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {notifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 p-8 sm:p-12 text-center text-(length:--font-size-body-sm) text-text-muted shadow-xs"
          >
            No notifications available
          </motion.div>
        )}

        <AnimatePresence>
          {paginatedNotifications.map((notif, index) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              onClick={() => handleClick(notif)}
              className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all shadow-xs ${notif.isRead ? "bg-white border-slate-100 hover:border-slate-200" : "bg-info-light/40 border-info/30 hover:border-info/50"}`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-(length:--font-size-body-md) text-text-primary">
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="w-2.5 h-2.5 bg-primary rounded-full shrink-0"></span>
                    )}
                  </div>
                  <p className="text-(length:--font-size-body-sm) text-text-muted">
                    {notif.message}
                  </p>
                  {role === "admin" && notif.fullName && (
                    <p className="text-(length:--font-size-caption) text-text-muted pt-0.5">
                      For:{" "}
                      <span className="text-text-primary font-medium">
                        {notif.fullName}
                      </span>
                    </p>
                  )}
                  <p className="text-(length:--font-size-caption) text-text-muted pt-1">
                    {new Date(notif.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notif.id);
                  }}
                  className="text-error hover:opacity-80 text-(length:--font-size-body-sm) font-medium transition-opacity shrink-0 cursor-pointer p-1 self-start sm:self-auto"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-xs mt-6">
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
      </div>
    </div>
  );
}

export default NotificationPage;
