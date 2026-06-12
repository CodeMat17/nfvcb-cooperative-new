import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { Doc } from "@/convex/_generated/dataModel";

type User = Doc<"users"> | undefined;

export function generateCoreLoanPDF(loan: Doc<"coreLoans">, user: User) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const margin = 18;
  const mid = pageW / 2;

  // ── Watermark ──────────────────────────────────────────────────────────────
  doc.setFontSize(42);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(220, 235, 230);
  const watermarks = [
    { x: 38, y: 130 },
    { x: 65, y: 240 },
  ];
  for (const { x, y } of watermarks) {
    doc.text("NFVCB COOPERATIVE", x, y, { angle: 45 });
  }
  doc.setTextColor(0, 0, 0);

  // ── Header ─────────────────────────────────────────────────────────────────
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("NFVCB Staff Cooperative Society", mid, 18, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Core Loan Application Form", mid, 25, { align: "center" });
  doc.setLineWidth(0.5);
  doc.line(margin, 29, pageW - margin, 29);

  let y = 35;

  // ── Section A — 2-column grid ──────────────────────────────────────────────
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("SECTION A — APPLICATION DETAILS", margin, y);
  y += 5;

  // 4-column layout: [label, value, label, value]
  const col0 = 32, col1 = 50, col2 = 32, col3 = 50; // widths (total = 164 ≈ 170)
  const sectionARows = [
    ["Member Name",      user?.name ?? "N/A",                          "IPPIS Number",    user?.ippis ?? "N/A"],
    ["Date Applied",     format(new Date(loan.dateApplied), "MMM dd, yyyy"), "Mobile Number", loan.mobileNumber],
    ["Amount Requested", `₦${loan.amountRequested.toLocaleString()}`,  "Account Number",  loan.accountNumber],
    ["Account Name",     loan.accountName,                              "Bank",            loan.bank],
    ["Existing Loan",    loan.existingLoan,                            "Guarantor 1",     `${loan.guarantor1Name} (${loan.guarantor1Phone})`],
    ["Guarantor 2",      `${loan.guarantor2Name} (${loan.guarantor2Phone})`, "",            ""],
  ];

  autoTable(doc, {
    startY: y,
    head: [],
    body: sectionARows,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2.2 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: col0, fillColor: [245, 245, 245] },
      1: { cellWidth: col1 },
      2: { fontStyle: "bold", cellWidth: col2, fillColor: [245, 245, 245] },
      3: { cellWidth: col3 },
    },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 7;

  // ── Section B divider ──────────────────────────────────────────────────────
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageW - margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("SECTION B — FOR OFFICIAL USE ONLY", margin, y);
  y += 5;

  const contrib = user?.totalContribution ?? 0;
  const memberInfoRows = [
    ["Member's Contribution", `₦${contrib.toLocaleString()}`, "As at", format(new Date(), "MMM dd, yyyy")],
  ];

  autoTable(doc, {
    startY: y,
    head: [],
    body: memberInfoRows,
    theme: "plain",
    styles: { fontSize: 8, cellPadding: 1.8 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: col0 },
      1: { cellWidth: col1 },
      2: { fontStyle: "bold", cellWidth: col2 },
      3: { cellWidth: col3 },
    },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 5;

  // ── Side-by-side tables ────────────────────────────────────────────────────
  // Left half (NEW LOAN) | Right half (OLD LOAN + LOAN DEDUCTION DETAILS)
  const halfRight = margin + (pageW - 2 * margin) / 2 + 3;
  const halfL = margin;

  const newLoanRows = [
    ["NEW LOAN", ""],
    ["Loan amount approved", "___________________"],
    ["Interest charged",     "8%( )  10%( )  22%( )"],
    ["Amount approved",      "___________________"],
    ["Balance",              "___________________"],
    ["Less old loan balance","___________________"],
    ["Grand Total Paid",     "___________________"],
  ];

  const oldAndDeductRows = [
    ["OLD LOAN", ""],
    ["Last loan amount",     "___________________"],
    ["Duration/Start month", "___________________"],
    ["Monthly deduction/Duration paid", "___________________"],
    ["Total amount paid",    "___________________"],
    ["Balance loan amount",  "___________________"],
    ["LOAN DEDUCTION DETAILS", ""],
    ["Add/Less old balance", "___________________"],
    ["New loan deduction",   "___________________"],
    ["Duration",             "___________________"],
    ["Monthly deduction",    "___________________"],
    ["Start date",           "___________________"],
    ["End date",             "___________________"],
    ["Remark",               "___________________"],
  ];

  const sectionHeaders = new Set(["NEW LOAN", "OLD LOAN", "LOAN DEDUCTION DETAILS"]);

  const sharedTableOpts = {
    head: [],
    theme: "plain" as const,
    styles: { fontSize: 7.5, cellPadding: 1.6 },
    didParseCell: (data: any) => {
      const label = data.cell.raw as string;
      if (data.column.index === 0 && sectionHeaders.has(label)) {
        data.cell.styles.fillColor = [225, 225, 225];
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fontSize = 7.5;
      } else if (data.column.index === 0) {
        data.cell.styles.fontStyle = "bold";
      }
    },
  };

  autoTable(doc, {
    ...sharedTableOpts,
    startY: y,
    body: newLoanRows,
    columnStyles: {
      0: { cellWidth: 42 },
      1: { cellWidth: 38 },
    },
    margin: { left: halfL, right: halfRight },
  });

  autoTable(doc, {
    ...sharedTableOpts,
    startY: y,
    body: oldAndDeductRows,
    columnStyles: {
      0: { cellWidth: 42 },
      1: { cellWidth: 38 },
    },
    margin: { left: halfRight, right: margin },
  });

  const finalY = Math.max(
    (doc as any).lastAutoTable.finalY,
    y + newLoanRows.length * 6
  );

  // ── Signatures ─────────────────────────────────────────────────────────────
  const sigY = Math.min(finalY + 10, pageH - 25);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const thirdW = (pageW - 2 * margin) / 2;
  ["President", "Fin. Secretary"].forEach((label, i) => {
    const x = margin + i * thirdW;
    doc.line(x, sigY, x + thirdW - 8, sigY);
    doc.text(label, x, sigY + 4);
  });

  doc.save(
    `core-loan-${user?.name?.replace(/\s+/g, "-") ?? "application"}-${format(new Date(), "yyyy-MM-dd")}.pdf`
  );
}
