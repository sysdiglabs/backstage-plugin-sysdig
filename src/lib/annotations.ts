/* Sysdig Annotations for Components */


/********************************* Inventory *********************************/

/*
 * Inventory
 */

// The external DNS that will be included in the results. Example: "ec2-102-34-15-23.compute-1.amazonaws.com"
export const SYSDIG_EXTERNALDNS_ANNOTATION = "sysdigcloud.com/externaldns";

// The kubernetes distribution that will be included in the results. Example: "gke"
export const SYSDIG_DISTRIBUTION_ANNOTATION = "sysdigcloud.com/kubernetes-distribution";

// The resource labels that will be included in the results. Example: "app.kubernetes.io/managed-by:Helm"
export const SYSDIG_LABELS_ANNOTATION = "sysdigcloud.com/kubernetes-labels";

// The names that will be included in the results. Example: "aws-bucket1"
export const SYSDIG_RESOURCE_NAME_ANNOTATION = "sysdigcloud.com/resource-name";

// Origin of the resource. Supported values: "Code", "Deployed".
export const SYSDIG_RESOURCE_ORIGIN_ANNOTATION = "sysdigcloud.com/resource-origin";

// The resource types that will be included in the results. Example: "Account"
export const SYSDIG_RESOURCE_TYPE_ANNOTATION = "sysdigcloud.com/resource-type";

// The nodeType that will be included in the results. Example: "Worker"
export const SYSDIG_NODE_TYPE_ANNOTATION = "sysdigcloud.com/kubernetes-node-type";

// The operating system that will be included in the results. Example: "linux"
export const SYSDIG_OS_NAME_ANNOTATION = "sysdigcloud.com/os-name";

// The operating system image that will be included in the results. Example: "Ubuntu 18.04.6 LTS"
export const SYSDIG_OS_IMAGE_ANNOTATION = "sysdigcloud.com/os-image";

// The platform that will be included in the results. Example: "AWS"
export const SYSDIG_PLATFORM_ANNOTATION = "sysdigcloud.com/platform";

// The account that will be included in the results. Example: "285211435247"
export const SYSDIG_ACCOUNT_ANNOTATION = "sysdigcloud.com/account";

// The organization that will be included in the results. Example: "s-xqe92dwe61"
export const SYSDIG_ORGANIZATION_ANNOTATION = "sysdigcloud.com/organization";

// The project that will be included in the results. Example: "project1"
export const SYSDIG_PROJECT_ANNOTATION = "sysdigcloud.com/project";

// The regions that will be included in the results. Example: "europe-west1"
export const SYSDIG_REGION_ANNOTATION = "sysdigcloud.com/region";

// The Azure subscriptions that will be included in the results. Example: "Azure subscription 1"
export const SYSDIG_AZURE_SUBSCRIPTION_ANNOTATION = "sysdigcloud.com/azure-subscription";

// The version that will be included in the results. Example: "1.1"
export const SYSDIG_VERSION_ANNOTATION = "sysdigcloud.com/version";

// The zone that will be included in the results.. Example: "zone1"
export const SYSDIG_ZONE_ANNOTATION = "sysdigcloud.com/zone";

// The category that will be included in the results. Example: "IAM"
export const SYSDIG_CATEGORY_ANNOTATION = "sysdigcloud.com/category";

/*
 * IaC
 */

// The name of the integration an IaC resource belongs to. Example: "github-integration"
export const SYSDIG_INTEGRATION_NAME_ANNOTATION = "sysdigcloud.com/iac-integration-name";

// The web address of an IaC Manifest. Example: "https://bitbucket.org/organizations-workspace/teams-repository/src"
export const SYSDIG_LOCATION_ANNOTATION = "sysdigcloud.com/iac-manifest-location";

// The Repository an IaC resource belongs to. Example: "e2e-repo"
export const SYSDIG_REPOSITORY_ANNOTATION = "sysdigcloud.com/iac-repository";

// The source type of an IaC resource. Supported values: YAML, Kustomize, Terraform, Helm.
export const SYSDIG_SOURCE_TYPE_ANNOTATION = "sysdigcloud.com/source-type";


/********************************* Vuln Management *********************************/
/*
 * Runtime
 */

// Runtime annotation values also support comma separated values. Example "prod-gke,prod-eks"

// The cluster that will be included in the results. Example: "prod-gke"
export const SYSDIG_CLUSTER_NAME_ANNOTATION = "sysdigcloud.com/kubernetes-cluster-name";

// The namespace that will be included in the results. Example: "sock-shop"
export const SYSDIG_NAMESPACE_ANNOTATION = "sysdigcloud.com/kubernetes-namespace-name";

// The workload name that will be included in the results. Example: "sock-shop-carts"
export const SYSDIG_WORKLOAD_ANNOTATION = "sysdigcloud.com/kubernetes-workload-name";

// The workload type that will be included in the results. Example: "deployment"
export const SYSDIG_WORKLOAD_TYPE_ANNOTATION = "sysdigcloud.com/kubernetes-workload-type";

// The container name that will be included in the results. Example: "carts"
export const SYSDIG_CONTAINER_ANNOTATION = "sysdigcloud.com/kubernetes-container-name";

/*
 * Registry
 */

// The registry name that will be included in the results. Example: "registry-harbor-registry.registry.svc.cluster.local:5443"
export const SYSDIG_REGISTRY_NAME_ANNOTATION = "sysdigcloud.com/registry-name";

// The registry vendor that will be included in the results. Example: "harbor"
export const SYSDIG_REGISTRY_VENDOR_ANNOTATION = "sysdigcloud.com/registry-vendor";

// The registry repository that will be included in the results. Example: "library/nginx"
export const SYSDIG_REGISTRY_REPOSITORY_ANNOTATION = "sysdigcloud.com/registry-repository";

/*
 *  Pipeline
 */

// Free text search to match an image or set of images.
// Examples: "sysdig-cli-scanner:1.6.1", "ghcr.io/sysdiglabs/sysdig-cli-scanner", "ghcr.io/sysdiglabs"
export const SYSDIG_IMAGE_FREETEXT_ANNOTATION = "sysdigcloud.com/image-freetext";

/********************************* Custom *********************************/
// Free Sysdig filtering syntax. Overrides any other Sysdig annotation value!
export const SYSDIG_CUSTOM_FILTER_ANNOTATION = "sysdigcloud.com/custom-filter";