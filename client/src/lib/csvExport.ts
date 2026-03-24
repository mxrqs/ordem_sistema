/**
 * Utility functions for exporting data to CSV format
 */

interface OrderData {
  id: number;
  type: "OS" | "OC";
  title: string;
  status: string;
  userName: string | null;
  userEmail: string | null;
  placa?: string | null;
  createdAt: Date;
}

/**
 * Convert array of orders to CSV format
 */
export function ordersToCSV(orders: OrderData[]): string {
  if (orders.length === 0) {
    return "ID,Tipo,Título,Status,Usuário,Email,Placa,Data de Criação\n";
  }

  // CSV header
  const headers = ["ID", "Tipo", "Título", "Status", "Usuário", "Email", "Placa", "Data de Criação"];
  const headerRow = headers.map(escapeCSVField).join(",");

  // CSV rows
  const dataRows = orders.map((order) => {
    const createdAt = new Date(order.createdAt);
    const formattedDate = createdAt.toLocaleDateString("pt-BR") + " " + createdAt.toLocaleTimeString("pt-BR");

    return [
      order.id.toString(),
      order.type,
      order.title || "",
      formatStatus(order.status),
      order.userName || "Desconhecido",
      order.userEmail || "",
      order.placa || "",
      formattedDate,
    ]
      .map(escapeCSVField)
      .join(",");
  });

  return [headerRow, ...dataRows].join("\n");
}

/**
 * Escape CSV field to handle commas, quotes, and newlines
 */
function escapeCSVField(field: string): string {
  if (field === undefined || field === null) {
    return "";
  }

  const stringField = field.toString();

  // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (stringField.includes(",") || stringField.includes('"') || stringField.includes("\n")) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }

  return stringField;
}

/**
 * Format order status to human-readable text in Portuguese
 */
function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    not_started: "Não Iniciada",
    in_process: "Em Processo",
    completed: "Concluída",
  };

  return statusMap[status] || status;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Export orders to CSV file with automatic download
 */
export function exportOrdersToCSV(orders: OrderData[], filenameSuffix: string = ""): void {
  const csvContent = ordersToCSV(orders);
  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  const filename = `ordens_${timestamp}${filenameSuffix ? "_" + filenameSuffix : ""}.csv`;

  downloadCSV(csvContent, filename);
}
