/* src/api.ts */
import { createApiRef } from "@backstage/core-plugin-api";

export interface SysdigApi {
  fetchVulnRuntime: <T = any>(filters?: string, init?: RequestInit) => Promise<T>;
  fetchVulnRegistry: <T = any>(
    filters?: string,
    init?: RequestInit,
  ) => Promise<T>;
  fetchVulnPipeline: <T = any>(
    fitlers?: string,
    init?: RequestInit,
  ) => Promise<T>;
  fetchInventory: <T = any>(filters?: string, init?: RequestInit) => Promise<T>;
}

export const sysdigApiRef = createApiRef<SysdigApi>({
  id: "plugin.sysdig.service",
});
