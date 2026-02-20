import { setupRequestMockHandlers, TestApiProvider } from "@backstage/test-utils";
import { ConfigReader } from "@backstage/config";
import { ConfigApi, FetchApi } from "@backstage/core-plugin-api";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { SysdigApiClient } from "./SysdigApiClient";
import { API_PROXY_BASE_PATH, API_VULN_RUNTIME, API_VULN_REGISTRY, API_VULN_PIPELINE } from "../../lib";

describe("SysdigApiClient", () => {
  const configApi: ConfigApi = new ConfigReader({
    backend: {
      baseUrl: "http://localhost:7007",
    },
  });

  const fetchApi: FetchApi = {
    fetch: jest.fn((url, init) => fetch(url, init)),
  };

  const server = setupServer();
  setupRequestMockHandlers(server);

  beforeEach(() => {
    jest.clearAllMocks();
    server.use(
      rest.get(
        `http://localhost:7007${API_PROXY_BASE_PATH}${API_VULN_RUNTIME}`,
        (req, res, ctx) => {
          if (req.url.searchParams.get("filters") === "test-filter") {
            return res(ctx.json({ data: [{ id: "1", name: "test-runtime-vuln" }] }));
          }
          return res(ctx.json({ data: [] }));
        },
      ),
    );
  });

  it("should fetch runtime vulnerabilities with filters", async () => {
    const client = new SysdigApiClient({ configApi, fetchApi });
    const filters = "?filters=test-filter";
    const result = await client.fetchVulnRuntime(filters);

    expect(result).toEqual({ data: [{ id: "1", name: "test-runtime-vuln" }] });
    expect(fetchApi.fetch).toHaveBeenCalledWith(
      `http://localhost:7007${API_PROXY_BASE_PATH}${API_VULN_RUNTIME}${filters}`,
      undefined,
    );
  });

  it("should use v1 endpoint paths (not v1beta1)", () => {
    expect(API_VULN_RUNTIME).toMatch(/\/v1\//);
    expect(API_VULN_REGISTRY).toMatch(/\/v1\//);
    expect(API_VULN_PIPELINE).toMatch(/\/v1\//);
    expect(API_VULN_RUNTIME).not.toMatch(/v1beta1/);
    expect(API_VULN_REGISTRY).not.toMatch(/v1beta1/);
    expect(API_VULN_PIPELINE).not.toMatch(/v1beta1/);
  });
});
