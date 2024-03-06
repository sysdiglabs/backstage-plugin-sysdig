/* Sysdig Endpoints */

// Proxy path to Sysdig's endpoint. Edit this if using a custom proxy ;)
export const API_PROXY_BASE_PATH = "/api/proxy/sysdig";

/*
 * API paths for Sysdig results
 */

// API Endpoint for Vulnerability Management at Runtime
export const API_VULN_RUNTIME = "/secure/vulnerability/v1beta1/runtime-results";

// API Endpoint for Vulnerability Management at Registry
export const API_VULN_REGISTRY = "/secure/vulnerability/v1beta1/registry-results";

// API Endpoint for Vulnerability Management at Pipeline
export const API_VULN_PIPELINE = "/secure/vulnerability/v1beta1/pipeline-results";

// API Endpoint for Inventory (Posture)
export const API_INVENTORY = "/api/cspm/v1/inventory/resources";

/*
 * Backlink paths to product
 */

// Backlink path to Vulnerability Management at Runtime
export const BACKLINK_VULN_RUNTIME = "#/vulnerabilities/runtime/";

// Backlink path to Vulnerability Management at Registry
export const BACKLINK_VULN_REGISTRY = "#/vulnerabilities/registry/";

// Backlink path to Vulnerability Management at Pipeline
export const BACKLINK_VULN_PIPELINE = "#/vulnerabilities/pipeline/";

// Backlink path to Inventory
export const BACKLINK_INVENTORY = "#/inventory";