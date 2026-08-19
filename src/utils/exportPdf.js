import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportToPdf(columns, rows, filename, title = "Report") {
  if (!rows || rows.length === 0) {
    alert("There is no data to export");
    return;
  }

  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text(title, 14, 15);

  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 22,
  });

  doc.save(`${filename}.pdf`);
}
