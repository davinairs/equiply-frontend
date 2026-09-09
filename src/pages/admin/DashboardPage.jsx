import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie,  Cell } from "recharts";
import { Calendar } from "lucide-react";
import ReviewRequestModal from "../../components/ReviewRequestModal";
import EquipmentDetailModal from "../../components/EquipmentDetailModal";
import api from "../../services/api";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Good Morning!";
  if (hour < 15) return "Good Afternoon!";
  if (hour < 18) return "Good Evening!";
  return "Good Night!";
}

const monthNames = 
[ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

const statusBadge = {
  pending: "bg-info-light text-info",
  approved: "bg-success-light text-success",
  rejected: "bg-error-light text-error",
  returned: "bg-accent-light text-accent",
  available: "bg-success-light text-success",
  borrowed: "bg-info-light text-info",
  maintenance: "bg-warning-light text-warning",
};

const colorTextClass = {
  info: "text-info",
  warning: "text-warning",
  success: "text-success",
  error: "text-error",
};

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

const MonthlyTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-primary-light px-5 py-3.5 rounded-xl shadow-xl border border-stroke">
        <p className="text-text-primary text-(length:--font-size-caption) font-medium">
          Borrow
        </p>
        <p className="text-primary text-(length:--font-size-h3) font-bold mt-0.5">
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const CategoryTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-primary-light px-5 py-3.5 rounded-xl shadow-xl border border-stroke">
        <p className="text-text-primary text-(length:--font-size-caption) font-medium">
          {data.name}
        </p>
        <p className="text-primary text-(length:--font-size-h3) font-bold mt-0.5">
          {data.value}
        </p>
      </div>
    );
  }
  return null;
};

function isWithinLastDay(dateStr) {
  if (!dateStr) return false;
  const diffDays = (new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 1;
}

function generateColor(index) {
  const colorPalette = ["#155DFC", "#5B93FF", "#3B82F6", "#1E40AF", "#64748B"];
  if (index < colorPalette.length) return colorPalette[index];
  const primaryHue = 221;
  const lightness = 40 + ((index * 8) % 30);
  const saturation = 60 + ((index * 5) % 30);
  return `hsl(${primaryHue}, ${saturation}%, ${lightness}%)`;
}

function toLocalMidnight(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function DashboardPage() {
  const [equipment, setEquipment] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [equipmentDetailTarget, setEquipmentDetailTarget] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [tempRange, setTempRange] = useState({ start: "", end: "" });

  const loadDashboard = async () => {
    try {
      const [eqRes, reqRes] = await Promise.all([
        api.get("/equipment"),
        api.get("/borrow-requests"),
      ]);
      setEquipment(eqRes.data);
      setRequests(reqRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleApproveRequest = async (requestId, dueDate) => {
    await api.patch(`/borrow-requests/${requestId}/approve`, { dueDate });
    setReviewTarget(null);
    await loadDashboard();
  };

  const handleRejectRequest = async (requestId) => {
    await api.patch(`/borrow-requests/${requestId}/reject`);
    setReviewTarget(null);
    await loadDashboard();
  };

  const handleForceReturnRequest = async (requestId) => {
    await api.patch(`/borrow-requests/${requestId}/return`);
    setReviewTarget(null);
    await loadDashboard();
  };

  const filteredRequests = useMemo(() => {
    if (!dateRange.start || !dateRange.end) return requests;
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    return requests.filter((r) => {
      const borrowDate = new Date(r.borrowDate);
      return borrowDate >= start && borrowDate <= end;
    });
  }, [requests, dateRange]);

  const applyDateRange = () => {
    setDateRange(tempRange);
    setShowDatePicker(false);
  };

  const resetDateRange = () => {
    setDateRange({ start: "", end: "" });
    setTempRange({ start: "", end: "" });
    setShowDatePicker(false);
  };

  const dateRangeLabel =
    dateRange.start && dateRange.end
      ? `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`
      : "All Time";

  const totalEquipment = equipment.length;
  const available = equipment.filter(
    (e) => e.equipmentStatus === "available",
  ).length;
  const borrowed = equipment.filter(
    (e) => e.equipmentStatus === "borrowed",
  ).length;
  const maintenance = equipment.filter(
    (e) => e.equipmentStatus === "maintenance",
  ).length;
  const overdue = filteredRequests.filter((r) => r.isOverdue).length;

  const statCards = useMemo(
    () => [
      {
        label: "Total Equipment",
        value: totalEquipment,
        newCount: equipment.filter((e) => isWithinLastDay(e.createdAt)).length,
        color: "info",
      },
      {
        label: "Available",
        value: available,
        newCount: equipment.filter(
          (e) =>
            e.equipmentStatus === "available" && isWithinLastDay(e.updatedAt),
        ).length,
        color: "success",
      },
      {
        label: "Borrowed",
        value: borrowed,
        newCount: equipment.filter(
          (e) =>
            e.equipmentStatus === "borrowed" && isWithinLastDay(e.updatedAt),
        ).length,
        color: "info",
      },
      {
        label: "Maintenance",
        value: maintenance,
        newCount: equipment.filter(
          (e) =>
            e.equipmentStatus === "maintenance" && isWithinLastDay(e.updatedAt),
        ).length,
        color: "warning",
      },
      {
        label: "Overdue",
        value: overdue,
        newCount: filteredRequests.filter(
          (r) => r.isOverdue && isWithinLastDay(r.dueDate),
        ).length,
        color: "error",
      },
    ],
    [
      equipment,
      filteredRequests,
      totalEquipment,
      available,
      borrowed,
      maintenance,
      overdue,
    ],
  );

  const monthlyData = useMemo(() => {
    return monthNames.map((month, idx) => ({
      month,
      borrow: filteredRequests.filter(
        (r) => new Date(r.borrowDate).getMonth() === idx,
      ).length,
    }));
  }, [filteredRequests]);

  const equipmentMap = useMemo(() => {
    return new Map(equipment.map((e) => [e.id, e]));
  }, [equipment]);

  const categoryData = useMemo(() => {
    const categoryCounts = {};
    filteredRequests.forEach((r) => {
      const eq = equipmentMap.get(r.equipmentId);
      const cat = eq?.categoryName || "Others";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const sortedCategories = Object.entries(categoryCounts).sort(
      (a, b) => b[1] - a[1],
    );
    const topCategories = sortedCategories.slice(0, 5);
    const otherCount = sortedCategories
      .slice(5)
      .reduce((sum, [, count]) => sum + count, 0);

    const categoryEntries =
      otherCount > 0
        ? [...topCategories, ["Others", otherCount]]
        : topCategories;
    const totalCategoryCount =
      categoryEntries.reduce((sum, [, count]) => sum + count, 0) || 1;

    return categoryEntries.map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / totalCategoryCount) * 100),
    }));
  }, [filteredRequests, equipmentMap]);

  const recentRequests = useMemo(() => {
    return [...filteredRequests]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [filteredRequests]);

  const lateReturns = useMemo(() => {
    const todayMidnight = toLocalMidnight(new Date());
    return filteredRequests
      .filter((r) => r.isOverdue)
      .slice(0, 5)
      .map((r) => {
        const due = toLocalMidnight(r.dueDate);
        const daysLate = Math.round(
          (todayMidnight - due) / (1000 * 60 * 60 * 24),
        );
        return { ...r, daysLate: daysLate > 0 ? daysLate : 0 };
      });
  }, [filteredRequests]);

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pb-10 text-left px-4 sm:px-0"
    >
      <div>
        <h2 className="text-(length:--font-size-h2) font-semibold text-primary">
          {getGreeting()}
        </h2>
        <p className="text-(length:--font-size-body-lg) text-text-muted mt-1">
          Monitor asset activity and system overview.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="bg-primary-light rounded-2xl border border-stroke p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200"
          >
            <p className="text-(length:--font-size-body-sm) text-text-muted">
              {card.label}
            </p>
            <p className="text-(length:--font-size-h1) font-semibold text-primary mt-1">
              {card.value}
            </p>
            <p
              className={`text-(length:--font-size-caption) mt-1 ${card.newCount > 0 ? colorTextClass[card.color] : "text-text-muted"}`}
            >
              {card.newCount > 0 ? `+${card.newCount} last day` : "No change"}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-3 bg-primary-light rounded-2xl border border-stroke p-4 sm:p-5 shadow-xs"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-2 relative">
            <h3 className="text-(length:--font-size-h3) font-semibold">
              Monthly Borrow
            </h3>
            <div className="self-start sm:self-auto">
              <button
                onClick={() => {
                  setTempRange(dateRange);
                  setShowDatePicker(!showDatePicker);
                }}
                className="flex items-center gap-2 border border-stroke px-3 py-1.5 rounded-xl text-(length:--font-size-caption) text-text-muted hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Calendar size={14} /> {dateRangeLabel}
              </button>

              <AnimatePresence>
                {showDatePicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-10 z-20 bg-primary-light border border-stroke rounded-2xl shadow-xl p-4 w-64 sm:w-72 max-w-[85vw]"
                  >
                    <label className="block text-(length:--font-size-caption) font-medium text-text-muted mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      value={tempRange.start}
                      onChange={(e) =>
                        setTempRange({ ...tempRange, start: e.target.value })
                      }
                      className="w-full border border-stroke rounded-xl px-3 py-2 text-(length:--font-size-body-sm) mb-3 focus:outline-none focus:border-primary"
                    />
                    <label className="block text-(length:--font-size-caption) font-medium text-text-muted mb-1">
                      To
                    </label>
                    <input
                      type="date"
                      value={tempRange.end}
                      onChange={(e) =>
                        setTempRange({ ...tempRange, end: e.target.value })
                      }
                      className="w-full border border-stroke rounded-xl px-3 py-2 text-(length:--font-size-body-sm) mb-4 focus:outline-none focus:border-primary"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={applyDateRange}
                        className="flex-1 bg-primary text-primary-light py-2 rounded-xl text-(length:--font-size-body-sm) font-medium hover:opacity-95 transition-opacity cursor-pointer"
                      >
                        Apply
                      </button>
                      <button
                        onClick={resetDateRange}
                        className="flex-1 border border-stroke text-text-muted py-2 rounded-xl text-(length:--font-size-body-sm) hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={250} minWidth={0}>
            <AreaChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="dashboardGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#155DFC" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#155DFC" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F1F5F9"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
                dy={5}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<MonthlyTooltip />} />
              <Area
                type="monotone"
                dataKey="borrow"
                stroke="#155DFC"
                strokeWidth={2.5}
                fill="url(#dashboardGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="lg:col-span-2 bg-primary-light rounded-2xl border border-stroke p-4 sm:p-5 shadow-xs flex flex-col justify-between"
        >
          <h3 className="text-(length:--font-size-h3) font-semibold text-text-primary">
            Borrow By Category
          </h3>
          <div className="my-auto flex justify-center">
            <ResponsiveContainer width="100%" height={210} minWidth={0}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={0}
                  outerRadius={85}
                  labelLine={false}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percentage,
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius =
                      innerRadius + (outerRadius - innerRadius) * 0.55;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="white"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-(length:--font-size-caption) font-semibold"
                      >
                        {percentage}%
                      </text>
                    );
                  }}
                >
                  {categoryData.map((_, idx) => (
                    <Cell key={idx} fill={generateColor(idx)} />
                  ))}
                </Pie>
                <Tooltip content={<CategoryTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 sm:gap-4 mt-2 justify-center">
            {categoryData.map((cat, idx) => (
              <div
                key={cat.name}
                title={cat.name}
                className="flex items-center gap-1.5 text-(length:--font-size-caption) text-text-muted max-w-32"
              >
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: generateColor(idx) }}
                ></span>
                <span className="truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-primary-light rounded-2xl border border-stroke p-4 sm:p-6 shadow-xs mt-6"
      >
        <h3 className="text-(length:--font-size-h3) font-semibold text-text-primary mb-4">
          Recent Requests
        </h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-190 text-left text-(length:--font-size-body-sm)">
            <thead className="text-text-muted border-b border-stroke">
              <tr>
                <th className="py-3 px-4 font-medium w-[18%]">User</th>
                <th className="py-3 px-4 font-medium w-[22%]">Equipment</th>
                <th className="py-3 px-4 font-medium w-[16%]">Request Date</th>
                <th className="py-3 px-4 font-medium w-[16%]">Due Date</th>
                <th className="py-3 px-4 font-medium w-[16%]">Status</th>
                <th className="py-3 px-4 font-medium w-[12%]">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-stroke text-text-primary hover:bg-slate-50/50 transition-colors font-medium"
                >
                  <td className="py-4 px-4">
                    <p className="line-clamp-1">{r.fullName}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="line-clamp-1">{r.equipmentName}</p>
                  </td>
                  <td className="py-4 px-4">{formatDate(r.borrowDate)}</td>
                  <td className="py-4 px-4">{formatDate(r.dueDate)}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-(length:--font-size-caption) inline-block ${statusBadge[r.borrowStatus]}`}
                    >
                      {r.borrowStatus}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      type="button"
                      onClick={() => setReviewTarget(r)}
                      className="text-primary font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
              {recentRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-text-muted text-center">
                    No Requests Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
        className="bg-primary-light rounded-2xl border border-stroke p-4 sm:p-6 shadow-xs mt-6"
      >
        <h2 className="text-(length:--font-size-h3) font-semibold text-text-primary mb-4">
          Late Return
        </h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-160 text-left text-(length:--font-size-body-sm)">
            <thead className="text-text-muted border-b border-stroke">
              <tr>
                <th className="py-3 px-4 font-medium w-[22%]">User</th>
                <th className="py-3 px-4 font-medium w-[28%]">Equipment</th>
                <th className="py-3 px-4 font-medium w-[22%]">Due Date</th>
                <th className="py-3 px-4 font-medium w-[18%]">Days Late</th>
                <th className="py-3 px-4 font-medium w-[10%]">Action</th>
              </tr>
            </thead>
            <tbody>
              {lateReturns.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-stroke text-text-primary hover:bg-slate-50/50 transition-colors font-medium"
                >
                  <td className="py-4 px-4">
                    <p className="line-clamp-1">{r.fullName}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="line-clamp-1">{r.equipmentName}</p>
                  </td>
                  <td className="py-4 px-4">{formatDate(r.dueDate)}</td>
                  <td className="py-4 px-4 font-bold text-error">
                    {r.daysLate} Days
                  </td>
                  <td className="py-4 px-4">
                    <button
                      type="button"
                      onClick={() => setReviewTarget(r)}
                      className="text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {lateReturns.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-text-muted text-center">
                    No Overdue Requests
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {reviewTarget && (
        <ReviewRequestModal
          request={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onApprove={handleApproveRequest}
          onReject={handleRejectRequest}
          onForceReturn={handleForceReturnRequest}
        />
      )}

      {equipmentDetailTarget && (
        <EquipmentDetailModal
          equipment={equipmentDetailTarget}
          onClose={() => setEquipmentDetailTarget(null)}
        />
      )}
    </motion.div>
  );
}

export default DashboardPage;
