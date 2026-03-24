import { describe, expect, it } from "vitest";

// Embedded CSV functions for testing (mirroring client implementation)
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

function escapeCSVField(field: string): string {
  if (field === undefined || field === null) {
    return "";
  }

  const stringField = field.toString();

  if (stringField.includes(",") || stringField.includes('"') || stringField.includes("\n")) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }

  return stringField;
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    not_started: "Não Iniciada",
    in_process: "Em Processo",
    completed: "Concluída",
  };

  return statusMap[status] || status;
}

function ordersToCSV(orders: OrderData[]): string {
  if (orders.length === 0) {
    return "ID,Tipo,Título,Status,Usuário,Email,Placa,Data de Criação\n";
  }

  const headers = ["ID", "Tipo", "Título", "Status", "Usuário", "Email", "Placa", "Data de Criação"];
  const headerRow = headers.map(escapeCSVField).join(",");

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

describe("CSV Export Utilities", () => {
  const mockOrders = [
    {
      id: 1,
      type: "OS" as const,
      title: "Manutenção Preventiva",
      status: "in_process",
      userName: "João Silva",
      userEmail: "joao@example.com",
      placa: "ABC-1234",
      createdAt: new Date("2026-03-24T10:00:00"),
    },
    {
      id: 2,
      type: "OC" as const,
      title: "Compra de Peças",
      status: "completed",
      userName: "Maria Santos",
      userEmail: "maria@example.com",
      placa: "XYZ-5678",
      createdAt: new Date("2026-03-23T15:30:00"),
    },
    {
      id: 3,
      type: "OS" as const,
      title: "Reparo de Freio",
      status: "not_started",
      userName: null,
      userEmail: null,
      placa: null,
      createdAt: new Date("2026-03-22T08:45:00"),
    },
  ];

  it("should convert orders to CSV format", () => {
    const csv = ordersToCSV(mockOrders);

    expect(csv).toContain("ID,Tipo,Título,Status,Usuário,Email,Placa,Data de Criação");
    expect(csv).toContain("1,OS,Manutenção Preventiva,Em Processo,João Silva,joao@example.com,ABC-1234");
    expect(csv).toContain("2,OC,Compra de Peças,Concluída,Maria Santos,maria@example.com,XYZ-5678");
  });

  it("should format status correctly in Portuguese", () => {
    const csv = ordersToCSV(mockOrders);

    expect(csv).toContain("Em Processo");
    expect(csv).toContain("Concluída");
    expect(csv).toContain("Não Iniciada");
  });

  it("should handle null values gracefully", () => {
    const csv = ordersToCSV(mockOrders);

    // Third order has null values
    expect(csv).toContain("3,OS,Reparo de Freio,Não Iniciada,Desconhecido,,");
  });

  it("should escape CSV fields with special characters", () => {
    const ordersWithSpecialChars = [
      {
        id: 1,
        type: "OS" as const,
        title: 'Ordem com "aspas" e, vírgula',
        status: "in_process",
        userName: "João, Silva",
        userEmail: "joao@example.com",
        placa: "ABC-1234",
        createdAt: new Date("2026-03-24T10:00:00"),
      },
    ];

    const csv = ordersToCSV(ordersWithSpecialChars);

    // Fields with commas and quotes should be wrapped in quotes
    expect(csv).toContain('"Ordem com ""aspas"" e, vírgula"');
    expect(csv).toContain('"João, Silva"');
  });

  it("should include headers even for empty orders", () => {
    const csv = ordersToCSV([]);

    expect(csv).toBe("ID,Tipo,Título,Status,Usuário,Email,Placa,Data de Criação\n");
  });

  it("should format dates correctly in Portuguese locale", () => {
    const csv = ordersToCSV(mockOrders);

    // Check that dates are formatted (exact format depends on locale)
    expect(csv).toContain("24/03/2026");
    expect(csv).toContain("23/03/2026");
    expect(csv).toContain("22/03/2026");
  });

  it("should handle orders with all fields populated", () => {
    const completeOrder = {
      id: 100,
      type: "OS" as const,
      title: "Complete Order",
      status: "completed",
      userName: "Test User",
      userEmail: "test@example.com",
      placa: "TEST-001",
      createdAt: new Date("2026-03-24T12:00:00"),
    };

    const csv = ordersToCSV([completeOrder]);

    expect(csv).toContain("100,OS,Complete Order,Concluída,Test User,test@example.com,TEST-001");
  });

  it("should maintain row order from input array", () => {
    const csv = ordersToCSV(mockOrders);
    const lines = csv.split("\n");

    // Skip header
    expect(lines[1]).toContain("1,OS");
    expect(lines[2]).toContain("2,OC");
    expect(lines[3]).toContain("3,OS");
  });

  it("should handle long titles without truncation", () => {
    const longTitle = "A".repeat(500);
    const orderWithLongTitle = {
      id: 1,
      type: "OS" as const,
      title: longTitle,
      status: "in_process",
      userName: "User",
      userEmail: "user@example.com",
      placa: "ABC-1234",
      createdAt: new Date("2026-03-24T10:00:00"),
    };

    const csv = ordersToCSV([orderWithLongTitle]);

    expect(csv).toContain(longTitle);
  });
});
