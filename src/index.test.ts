import { describe, it, expect, afterAll } from "bun:test";

const BASE_URL = "http://localhost:3001";

// Start the server on a test port
process.env.PORT = "3001";
const server = await import("./index");

describe("Server", () => {
  afterAll(() => {
    process.exit(0);
  });

  it("should return greeting on /", async () => {
    const response = await fetch(`${BASE_URL}/`);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe("Hello from Assignment 3!");
  });

  it("should return health status on /health", async () => {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("ok");
    expect(data.timestamp).toBeDefined();
  });

  it("should return version info on /version", async () => {
    const response = await fetch(`${BASE_URL}/version`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.version).toBe("1.0.0");
    expect(data.runtime).toBe("bun");
  });

  it("should return 404 for unknown routes", async () => {
    const response = await fetch(`${BASE_URL}/unknown`);

    expect(response.status).toBe(404);
  });
});
