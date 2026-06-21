import { differenceInDays, addMonths, format } from "date-fns";

export const QUICK_LOAN_AMOUNTS = [
  10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000,
  150000,
];

export const REPAYMENT_ACCOUNT = {
  bank: "Zenith Bank",
  account: "1229203111",
  name: "NFVCB STAFF CO SOC LTD",
};

export const NIGERIAN_BANKS = [
  "Access Bank",
  "Citibank Nigeria",
  "Ecobank Nigeria",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "First City Monument Bank (FCMB)",
  "Globus Bank",
  "Guaranty Trust Bank (GTB)",
  "Heritage Bank",
  "Keystone Bank",
  "Polaris Bank",
  "Providus Bank",
  "Stanbic IBTC Bank",
  "Standard Chartered Bank",
  "Sterling Bank",
  "SunTrust Bank",
  "Titan Trust Bank",
  "Union Bank of Nigeria",
  "United Bank for Africa (UBA)",
  "Unity Bank",
  "Wema Bank",
  "Zenith Bank",
];

export function calcQuickLoan(principal: number) {
  const interest = principal * 0.05;
  return { principal, interest, totalRepayment: principal + interest };
}

export function calcCoreLoanDisbursement(
  principal: number,
  interestRate: number
) {
  const deduction = principal * (interestRate / 100);
  return { principal, deduction, netDisbursed: principal - deduction };
}

export function getExpiryStatus(
  expiryDate?: string
): "ok" | "warning" | "expired" {
  if (!expiryDate) return "ok";
  const daysLeft = differenceInDays(new Date(expiryDate), new Date());
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 60) return "warning";
  return "ok";
}

export function formatExpiry(expiryDate?: string): string {
  if (!expiryDate) return "Pending approval";
  const status = getExpiryStatus(expiryDate);
  const formatted = format(new Date(expiryDate), "MMM dd, yyyy");
  return status === "expired" ? `${formatted} (Expired)` : formatted;
}

export function expiryColorClass(expiryDate?: string): string {
  const status = getExpiryStatus(expiryDate);
  if (status === "expired") return "text-red-500 font-medium";
  if (status === "warning") return "text-amber-500 font-medium";
  return "";
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return format(new Date(dateStr), "MMM dd, yyyy");
}

export function formatMonthYear(dateStr?: string): string {
  if (!dateStr) return "—";
  return format(new Date(dateStr), "MMM yyyy");
}

export function getStatusColor(
  status: "awaiting-approval" | "approved" | "rejected" | "repaid"
): string {
  switch (status) {
    case "awaiting-approval":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    case "approved":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "repaid":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  }
}

export function addMonthsToDate(date: Date, months: number): Date {
  return addMonths(date, months);
}
