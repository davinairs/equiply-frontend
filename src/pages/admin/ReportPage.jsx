import { useEffect, useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, } from "recharts";
import { FileText, FileSpreadsheet, Calendar, ChevronLeft, ChevronRight, } from "lucide-react";
import { exportToExcel } from "../../utils/exportExcel";
import { exportToPdf } from "../../utils/exportPdf";
import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";

const monthNames = [ "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", ];

const PAGE_SIZE = 10;

const statusBadge = {
  pending: "bg-info-light text-info",
  approved: "bg-success-light text-success",
  rejected: "bg-error-light text-error",
  returned: "bg-return-light text-return",
};

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

function isWithinLastDay(dateStr) {
  if (!dateStr) return false;
  const diffDays = (new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 1;
}

function generateColor(index) {
  const primaryHue = 221;
  const primarySaturation = 97;
  const hueShift = (index % 2 === 0 ? 1 : -1) * (index * 5);
  const hue = (primaryHue + hueShift) % 360;
  const lightness = 45 + ((index * 7) % 20);
  return `hsl(${hue}, ${primarySaturation}%, ${lightness}%)`;
}

const MonthlyTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-5 py-3.5 rounded-md shadow-lg border border-slate-100">
        <p className="text-text-primary text-(length:--font-size-caption) font-medium">
          {" "}
          Borrow{" "}
        </p>
        <p className="text-primary text-(length:--font-size-h3) font-bold mt-1">
          {" "}
          {payload[0].value}{" "}
        </p>
      </div>
    );
  }
  return null;
};

const StatusTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const dataItem = payload[0].payload;
    return (
      <div className="bg-white px-5 py-3.5 rounded-md shadow-lg border border-slate-100">
        <p className="text-text-primary text-(length:--font-size-caption) font-medium capitalize">
          {dataItem.status}{" "}
        </p>
        <p className="text-primary text-(length:--font-size-h3) font-bold mt-0.5">
          {" "}
          {payload[0].value}{" "}
        </p>
      </div>
    );
  }
  return null;
};

const TopEquipmentTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const dataItem = payload[0].payload;
    return (
      <div className="bg-white px-5 py-3.5 rounded-md shadow-lg border border-slate-100">
        <p className="text-text-primary text-(length:--font-size-caption) font-medium">
          {" "}
          {dataItem.name}{" "}
        </p>
        <p className="text-primary text-(length:--font-size-h3) font-bold mt-0.5">
          {" "}
          {payload[0].value}{" "}
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
      <div className="bg-white px-5 py-3.5 rounded-md shadow-lg border border-slate-100">
        <p className="text-text-primary text-(length:--font-size-caption) font-medium">
          {" "}
          {data.name}{" "}
        </p>
        <p className="text-primary text-(length:--font-size-h3) font-bold mt-0.5">
          {" "}
          {data.value}{" "}
        </p>
      </div>
    );
  }
  return null;
};

function ReportPage() {
  const [requests, setRequests] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [tempRange, setTempRange] = useState({ start: "", end: "" });

  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([
      api.get("/borrow-requests"),
      api.get("/equipments"),
      api.get("/users"),
    ])
      .then(([reqRes, eqRes, userRes]) => {
        setRequests(reqRes.data);
        setEquipments(eqRes.data);
        setUsers(userRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

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

  const getCompanyName = (userId) =>
    users.find((u) => u.id === userId)?.companyName || "-";
  const getCategoryName = (equipmentId) =>
    equipments.find((e) => e.id === equipmentId)?.categoryName || "-";

  const filteredRequests = requests.filter((r) => {
    if (!dateRange.start || !dateRange.end) return true;
    const borrowDate = new Date(r.borrowDate);
    return (
      borrowDate >= new Date(dateRange.start) &&
      borrowDate <= new Date(dateRange.end)
    );
  });

  const applyDateRange = () => {
    setDateRange(tempRange);
    setPage(1);
    setShowDatePicker(false);
  };

  const resetDateRange = () => {
    setDateRange({ start: "", end: "" });
    setTempRange({ start: "", end: "" });
    setPage(1);
    setShowDatePicker(false);
  };

  const dateRangeLabel =
    dateRange.start && dateRange.end
      ? `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`
      : "All Time";

  const totalBorrow = filteredRequests.length;
  const totalReturned = filteredRequests.filter(
    (r) => r.borrowStatus === "returned",
  ).length;
  const overdue = filteredRequests.filter((r) => r.isOverdue).length;
  const maintenance = equipments.filter(
    (e) => e.equipmentStatus === "maintenance",
  ).length;
  const broken = equipments.filter(
    (e) => e.equipmentCondition === "broken",
  ).length;

  const totalBorrowNew = filteredRequests.filter((r) =>
    isWithinLastDay(r.createdAt),
  ).length;
  const totalReturnedNew = filteredRequests.filter(
    (r) => r.borrowStatus === "returned" && isWithinLastDay(r.returnDate),
  ).length;
  const overdueNew = filteredRequests.filter(
    (r) => r.isOverdue && isWithinLastDay(r.dueDate),
  ).length;
  const maintenanceNew = equipments.filter(
    (e) => e.equipmentStatus === "maintenance" && isWithinLastDay(e.updatedAt),
  ).length;
  const brokenNew = equipments.filter(
    (e) => e.equipmentCondition === "broken" && isWithinLastDay(e.updatedAt),
  ).length;

  const statCards = [
    {
      label: "Total Borrow",
      value: totalBorrow,
      newCount: totalBorrowNew,
      colorClass: "text-success",
    },
    {
      label: "Total Returned",
      value: totalReturned,
      newCount: totalReturnedNew,
      colorClass: "text-success",
    },
    {
      label: "Overdue",
      value: overdue,
      newCount: overdueNew,
      colorClass: "text-warning",
    },
    {
      label: "Maintenance",
      value: maintenance,
      newCount: maintenanceNew,
      colorClass: "text-info",
    },
    {
      label: "Broken",
      value: broken,
      newCount: brokenNew,
      colorClass: "text-error",
    },
  ];

  const monthlyData = monthNames.map((month, idx) => ({
    month,
    borrow: filteredRequests.filter(
      (r) => new Date(r.borrowDate).getMonth() === idx,
    ).length,
  }));

  const statusData = ["pending", "approved", "rejected", "returned"].map(
    (status) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count: filteredRequests.filter((r) => r.borrowStatus === status).length,
    }),
  );

  const equipmentCounts = {};
  filteredRequests.forEach((r) => {
    equipmentCounts[r.equipmentName] =
      (equipmentCounts[r.equipmentName] || 0) + 1;
  });
  const topEquipment = Object.entries(equipmentCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const categoryCounts = {};
  filteredRequests.forEach((r) => {
    const cat = getCategoryName(r.equipmentId);
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const top5Total = topCategories.reduce((sum, c) => sum + c.value, 0) || 1;
  const categoryData = topCategories.map((c) => ({
    ...c,
    percentage: Math.round((c.value / top5Total) * 100),
  }));

  const totalPages = Math.max(
    Math.ceil(filteredRequests.length / PAGE_SIZE),
    1,
  );
  const paginatedRequests = filteredRequests.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const handleExportExcel = () => {
    const dataToExport = filteredRequests.map((r) => ({
      User: r.fullName,
      Company: getCompanyName(r.userId),
      Equipment: r.equipmentName,
      Category: getCategoryName(r.equipmentId),
      "Borrow Date": formatDate(r.borrowDate),
      "Due Date": formatDate(r.dueDate),
      "Return Date": formatDate(r.returnDate),
      Status: r.borrowStatus,
    }));
    exportToExcel(dataToExport, "report-borrow-requests");
  };

  const handleExportPdf = () => {
    const columns = [
      "User",
      "Company",
      "Equipment",
      "Category",
      "Borrow Date",
      "Due Date",
      "Status",
    ];
    const rows = filteredRequests.map((r) => [
      r.fullName,
      getCompanyName(r.userId),
      r.equipmentName,
      getCategoryName(r.equipmentId),
      formatDate(r.borrowDate),
      formatDate(r.dueDate),
      r.borrowStatus,
    ]);
    exportToPdf(
      columns,
      rows,
      "report-borrow-requests",
      "Report Borrow Requests",
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="px-4 sm:px-0 pb-10"
    >
      <div>
        <h2 className="text-(length:--font-size-h2) font-semibold text-primary">
          Reports
        </h2>
        <p className="text-(length:--font-size-body-lg) text-text-muted mt-1">
          View and export asset management reports.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
            className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5"
          >
            <p className="text-(length:--font-size-body-sm) text-text-muted">
              {card.label}
            </p>
            <h1 className="text-(length:--font-size-h1) font-semibold mt-1 text-primary">
              {card.value}
            </h1>
            <p
              className={`text-(length:--font-size-caption) mt-1 ${card.newCount > 0 ? card.colorClass : "text-text-muted"}`}
            >
              {card.newCount > 0 ? `+${card.newCount} last day` : "No change"}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-6">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-2 relative">
            <h3 className="text-(length:--font-size-h3) font-semibold text-text-primary">
              Monthly Borrow
            </h3>
            <div className="self-start sm:self-auto">
              <button
                onClick={() => {
                  setTempRange(dateRange);
                  setShowDatePicker(!showDatePicker);
                }}
                className="flex items-center gap-2 border border-slate-200 px-3 py-1.5 rounded-xl text-(length:--font-size-caption) text-text-muted hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Calendar size={14} /> {dateRangeLabel}
              </button>
              {showDatePicker && (
                <div className="absolute right-0 top-11 z-10 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 w-64 sm:w-72 max-w-[85vw]">
                  <label className="block text-(length:--font-size-caption) font-medium text-text-muted mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    value={tempRange.start}
                    onChange={(e) =>
                      setTempRange({ ...tempRange, start: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-(length:--font-size-body-sm) text-text-primary mb-3 focus:outline-none focus:border-primary"
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
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-(length:--font-size-body-sm) text-text-primary mb-4 focus:outline-none focus:border-primary"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={applyDateRange}
                      className="flex-1 bg-primary text-white py-2 rounded-xl text-(length:--font-size-body-sm) font-medium hover:opacity-90 cursor-pointer"
                    >
                      Apply
                    </button>
                    <button
                      onClick={resetDateRange}
                      className="flex-1 border border-slate-200 text-text-muted py-2 rounded-xl text-(length:--font-size-body-sm) hover:bg-slate-50 cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250} minWidth={0}>
            <AreaChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
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
                dx={-10}
              />
              <Tooltip content={<MonthlyTooltip />} />
              <Area
                type="monotone"
                dataKey="borrow"
                stroke="#155DFC"
                strokeWidth={2.5}
                fill="url(#reportGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-4 sm:p-5">
          <h3 className="text-(length:--font-size-h3) font-semibold text-text-primary mb-2">
            Borrow Status
          </h3>
          <ResponsiveContainer width="100%" height={250} minWidth={0}>
            <BarChart
              data={statusData}
              margin={{ top: 25, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="barStatusGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#7DA6FF" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#155DFC" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F1F5F9"
              />
              <XAxis
                dataKey="status"
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                content={<StatusTooltip />}
              />
              <Bar
                dataKey="count"
                fill="url(#barStatusGradient)"
                radius={[6, 6, 0, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-6">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-4 sm:p-5">
          <h3 className="text-(length:--font-size-h3) font-semibold text-text-primary mb-2">
            Top Borrowed Equipment
          </h3>
          <ResponsiveContainer width="100%" height={230} minWidth={0}>
            <BarChart
              data={topEquipment}
              layout="vertical"
              margin={{ top: 0, right: 15, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="barHorizontalGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#7DA6FF" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#155DFC" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#F1F5F9"
              />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: "#64748B" }}
                width={90}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<TopEquipmentTooltip />} />
              <Bar
                dataKey="count"
                fill="url(#barHorizontalGradient)"
                radius={[0, 4, 4, 0]}
                barSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs flex flex-col justify-between"
        >
          <h3 className="text-(length:--font-size-h3) font-semibold text-text-primary">
            Borrow By Category
          </h3>
          <div className="my-auto flex justify-center">
            <ResponsiveContainer width="100%" height={170} minWidth={0}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={0}
                  outerRadius={70}
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
                    <Cell
                      key={idx}
                      fill={generateColor(idx, categoryData.length)}
                    />
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
                className="flex items-center gap-1.5 text-(length:--font-size-caption) text-text-muted"
              >
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{
                    backgroundColor: generateColor(idx, categoryData.length),
                  }}
                ></span>
                {cat.name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="flex flex-row items-center gap-3 mt-6">
        <button
          onClick={handleExportPdf}
          className="inline-flex items-center justify-center gap-1.5 bg-primary text-white px-3.5 py-2 rounded-xl text-(length:--font-size-body-sm) font-medium hover:opacity-90 cursor-pointer shadow-sm"
        >
          <FileText size={15} /> Export PDF
        </button>
        <button
          onClick={handleExportExcel}
          className="inline-flex items-center justify-center gap-1.5 bg-primary text-white px-3.5 py-2 rounded-xl text-(length:--font-size-body-sm) font-medium hover:opacity-90 cursor-pointer shadow-sm"
        >
          <FileSpreadsheet size={15} /> Export Excel
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 shadow-sm mt-6"
      >
        <h3 className="text-(length:--font-size-h3) font-semibold text-text-primary">
          Borrow History
        </h3>
        <p className="text-(length:--font-size-caption) text-success mt-0.5">
          {filteredRequests.length} total records
        </p>
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-225 text-left text-(length:--font-size-body-sm)">
            <thead className="text-text-muted border-b border-slate-100">
              <tr>
                <th className="pb-3 py-3 pl-3 font-medium w-[15%]">User</th>
                <th className="pb-3 py-3 font-medium w-[13%]">Company</th>
                <th className="pb-3 py-3 font-medium w-[17%]">Equipment</th>
                <th className="pb-3 py-3 font-medium w-[12%]">Category</th>
                <th className="pb-3 py-3 font-medium w-[11%]">Borrow Date</th>
                <th className="pb-3 py-3 font-medium w-[11%]">Due Date</th>
                <th className="pb-3 py-3 font-medium w-[11%]">Return Date</th>
                <th className="pb-3 py-3 pr-3 font-medium w-[10%]">Status</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {paginatedRequests.map((r, idx) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="border-b border-slate-50 text-text-primary hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 pl-3 font-medium">{r.fullName}</td>
                    <td className="py-4 font-medium">{getCompanyName(r.userId)}</td>
                    <td className="py-4 font-medium">{r.equipmentName}</td>
                    <td className="py-4 font-medium">{getCategoryName(r.equipmentId)}</td>
                    <td className="py-4 font-medium">{formatDate(r.borrowDate)}</td>
                    <td className="py-4 font-medium">{formatDate(r.dueDate)}</td>
                    <td className="py-4 font-medium">{formatDate(r.returnDate)}</td>
                    <td className="py-4 pr-3">
                      <span
                        className={`px-2.5 py-1 rounded-md text-(length:--font-size-caption) font-medium capitalize ${statusBadge[r.borrowStatus]}`}
                      >
                        {r.borrowStatus}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {paginatedRequests.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-muted">
                    Belum ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1 sm:px-5 py-4 bg-white border-t border-slate-100">
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
      </motion.div>
    </motion.div>
  );
}

export default ReportPage;
