import { ConfigApi, FetchApi } from "@backstage/core-plugin-api";
import { SysdigApi } from "./SysdigApi";
import {
  API_INVENTORY,
  API_PROXY_BASE_PATH,
  API_VULN_PIPELINE,
  API_VULN_REGISTRY,
  API_VULN_RUNTIME,
} from "../lib";

export class SysdigApiClient implements SysdigApi {
  private readonly fetchApi: FetchApi;
  private readonly configApi: ConfigApi;
  private readonly baseUrl: string;

  constructor(options: { configApi: ConfigApi; fetchApi: FetchApi }) {
    this.configApi = options.configApi;
    this.fetchApi = options.fetchApi;
    this.baseUrl = this.configApi.getString("backend.baseUrl");
  }

  private async fetch<T>(endpoint: string, init?: RequestInit): Promise<T> {
    const uri = `${this.baseUrl}${API_PROXY_BASE_PATH}${endpoint}`;

    const response = await this.fetchApi.fetch(uri, init);

    if (!response.ok) throw new Error(response.statusText);

    return await response.json();
  }

  async fetchVulnRuntime<T = any>(
    filters?: string,
    init?: RequestInit,
  ): Promise<T> {
    return await this.fetch<T>(`${API_VULN_RUNTIME}${filters}`, init);
  }

  async fetchVulnRegistry<T = any>(
    filters?: string,
    init?: RequestInit,
  ): Promise<T> {
    return await this.fetch<T>(`${API_VULN_REGISTRY}${filters}`, init);
  }

  async fetchVulnPipeline<T = any>(
    filters?: string,
    init?: RequestInit,
  ): Promise<T> {
    return await this.fetch<T>(`${API_VULN_PIPELINE}${filters}`, init);
  }

  async fetchInventory<T = any>(
    filters?: string,
    init?: RequestInit,
  ): Promise<T> {
    return await this.fetch<T>(`${API_INVENTORY}${filters}`, init);
  }
}
