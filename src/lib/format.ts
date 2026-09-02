export const formatNaira = (value: number | string | null | undefined) => {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(n);
};

export const formatDate = (value: string | Date) =>
  new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(typeof value === "string" ? new Date(value) : value);

export const formatNumber = (n: number) => new Intl.NumberFormat("en-NG").format(n);

export const maskPhone = (phone?: string | null) =>
  phone ? phone.replace(/(\d{4})\d{4}(\d{3})/, "$1****$2") : "—";

export const statusTone = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return "success";
    case "FAILED":
      return "destructive";
    case "PENDING":
    case "PROCESSING":
    case "INITIATED":
      return "warning";
    case "REVERSED":
    case "REFUNDED":
      return "info";
    default:
      return "muted";
  }
};
