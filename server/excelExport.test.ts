import { describe, it, expect, beforeEach } from "vitest";
import * as XLSX from "xlsx";

// Mock functions for testing (since we can't import from client in vitest server tests)
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

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    not_started: "Não Iniciada",
    in_process: "Em Processo",
    completed: "Concluída",
  };
  return statusMap[status] || status;
}

function ordersToExcel(orders: OrderData[]): XLSX.WorkBook {
  if (orders.length === 0) {
    return XLSX.utils.book_new();
  }

  const excelData = orders.map((order) => {
    const createdAt = new Date(order.createdAt);
    const formattedDate = createdAt.toLocaleDateString("pt-BR") + " " + createdAt.toLocaleTimeString("pt-BR");

    return {
      "ID": order.id,
      "Tipo": order.type,
      "Título": order.title || "",
      "Status": formatStatus(order.status),
      "Usuário": order.userName || "Desconhecido",
      "Email": order.userEmail || "",
      "Placa": order.placa || "",
      "Data de Criação": formattedDate,
    };
  });

  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ordens");

  const colWidths = [
    { wch: 8 },
    { wch: 6 },
    { wch: 25 },
    { wch: 15 },
    { wch: 20 },
    { wch: 25 },
    { wch: 12 },
    { wch: 20 },
  ];
  ws["!cols"] = colWidths;

  return wb;
}

describe("Excel Export Functions", () => {
  let mockOrders: OrderData[];

  beforeEach(() => {
    mockOrders = [
      {
        id: 1,
        type: "OS",
        title: "Manutenção do Veículo",
        status: "in_process",
        userName: "João Silva",
        userEmail: "joao@example.com",
        placa: "ABC-1234",
        createdAt: new Date("2026-03-20"),
      },
      {
        id: 2,
        type: "OC",
        title: "Compra de Peças",
        status: "not_started",
        userName: "Maria Santos",
        userEmail: "maria@example.com",
        placa: "XYZ-5678",
        createdAt: new Date("2026-03-21"),
      },
    ];
  });

  it("should create a workbook with correct structure", () => {
    const wb = ordersToExcel(mockOrders);
    expect(wb.SheetNames).toContain("Ordens");
    expect(wb.Sheets["Ordens"]).toBeDefined();
  });

  it("should convert orders to Excel data with correct columns", () => {
    const wb = ordersToExcel(mockOrders);
    const ws = wb.Sheets["Ordens"];
    
    // Check headers
    expect(ws["A1"]?.v).toBe("ID");
    expect(ws["B1"]?.v).toBe("Tipo");
    expect(ws["C1"]?.v).toBe("Título");
    expect(ws["D1"]?.v).toBe("Status");
    expect(ws["E1"]?.v).toBe("Usuário");
    expect(ws["F1"]?.v).toBe("Email");
    expect(ws["G1"]?.v).toBe("Placa");
    expect(ws["H1"]?.v).toBe("Data de Criação");
  });

  it("should include order data in Excel sheet", () => {
    const wb = ordersToExcel(mockOrders);
    const ws = wb.Sheets["Ordens"];
    
    // Check first order data
    expect(ws["A2"]?.v).toBe(1);
    expect(ws["B2"]?.v).toBe("OS");
    expect(ws["C2"]?.v).toBe("Manutenção do Veículo");
    expect(ws["D2"]?.v).toBe("Em Processo");
    expect(ws["E2"]?.v).toBe("João Silva");
    expect(ws["F2"]?.v).toBe("joao@example.com");
    expect(ws["G2"]?.v).toBe("ABC-1234");
  });

  it("should format status correctly", () => {
    expect(formatStatus("not_started")).toBe("Não Iniciada");
    expect(formatStatus("in_process")).toBe("Em Processo");
    expect(formatStatus("completed")).toBe("Concluída");
    expect(formatStatus("unknown")).toBe("unknown");
  });

  it("should handle empty orders array", () => {
    const wb = ordersToExcel([]);
    expect(wb.SheetNames.length).toBe(0);
  });

  it("should handle null userName and userEmail", () => {
    const orderWithNull: OrderData = {
      id: 3,
      type: "OS",
      title: "Test",
      status: "completed",
      userName: null,
      userEmail: null,
      placa: "TEST-123",
      createdAt: new Date(),
    };

    const wb = ordersToExcel([orderWithNull]);
    const ws = wb.Sheets["Ordens"];
    
    expect(ws["E2"]?.v).toBe("Desconhecido");
    expect(ws["F2"]?.v).toBe("");
  });

  it("should set column widths correctly", () => {
    const wb = ordersToExcel(mockOrders);
    const ws = wb.Sheets["Ordens"];
    
    expect(ws["!cols"]).toBeDefined();
    expect(ws["!cols"]?.length).toBe(8);
    expect(ws["!cols"]?.[0].wch).toBe(8); // ID column
    expect(ws["!cols"]?.[2].wch).toBe(25); // Título column
  });

  it("should handle special characters in order data", () => {
    const orderWithSpecialChars: OrderData = {
      id: 4,
      type: "OS",
      title: "Manutenção & Limpeza, Revisão",
      status: "completed",
      userName: "José da Silva",
      userEmail: "jose@example.com",
      placa: "ABC-1234",
      createdAt: new Date(),
    };

    const wb = ordersToExcel([orderWithSpecialChars]);
    const ws = wb.Sheets["Ordens"];
    
    expect(ws["C2"]?.v).toBe("Manutenção & Limpeza, Revisão");
  });
});
