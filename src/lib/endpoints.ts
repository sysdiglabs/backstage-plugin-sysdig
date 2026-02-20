/* Sysdig Endpoints */

// Proxy path to Sysdig's endpoint. Edit this if using a custom proxy ;)
export const API_PROXY_BASE_PATH = "/api/proxy/sysdig";

/*
 * API paths for Sysdig results
 */

// API Endpoint for Vulnerability Management at Runtime
export const API_VULN_RUNTIME = "/secure/vulnerability/v1/runtime-results";

// API Endpoint for Vulnerability Management at Registry
export const API_VULN_REGISTRY = "/secure/vulnerability/v1/registry-results";

// API Endpoint for Vulnerability Management at Pipeline
export const API_VULN_PIPELINE = "/secure/vulnerability/v1/pipeline-results";

// API Endpoint for Inventory (Posture)
export const API_INVENTORY = "/api/cspm/v1/inventory/resources";

/*
 * Backlink paths to product
 */
const DEFAULT_BACKLINK_BASE: string = "https://secure.sysdig.com/"

const BACKLINKS: Record<string, string> = {
    // Backlink path to Vulnerability Management at Runtime
    "vm-runtime": "#/vulnerabilities/runtime/",

    // Backlink path to Vulnerability Management at Registry
    "vm-registry": "#/vulnerabilities/registry/",

    // Backlink path to Vulnerability Management at Pipeline
    "vm-pipeline": "#/vulnerabilities/pipeline/",

    // Backlink path to Inventory
    "inventory": "#/inventory"
}

export function getBacklink(endpoint: string | undefined, backlink: string | undefined, section: string) : string {
    let backlink_base : string = DEFAULT_BACKLINK_BASE;

    if (backlink !== undefined) {
        backlink_base = backlink
    } else if (endpoint !== undefined) {
        backlink_base = endpoint
    }

    const backlink_section : string = BACKLINKS[section];

    if (backlink_section === undefined) {
        return "";
    }

    return backlink_base + backlink_section;
}
