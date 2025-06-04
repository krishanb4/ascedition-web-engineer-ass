import { GET } from "../../app/api/transaction-history/route";

describe("/api/transaction-history", () => {
  test("returns transaction data", async () => {
    const mockRequest = {};

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.transactions).toBeDefined();
    expect(Array.isArray(data.transactions)).toBe(true);
    expect(data.transactions.length).toBeGreaterThan(0);
  });

  test("transaction objects have required fields", async () => {
    const mockRequest = {};

    const response = await GET(mockRequest);
    const data = await response.json();

    const transaction = data.transactions[0];
    expect(transaction).toHaveProperty("date");
    expect(transaction).toHaveProperty("referenceId");
    expect(transaction).toHaveProperty("to");
    expect(transaction).toHaveProperty("type");
    expect(transaction).toHaveProperty("amount");
    expect(typeof transaction.amount).toBe("number");
  });
});
