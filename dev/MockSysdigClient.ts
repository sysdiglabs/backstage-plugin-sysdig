import { SysdigApi } from '../src/api';

export class MockSysdigClient implements SysdigApi {
  async fetchVulnRuntime<T = any>(filters?: string): Promise<T> {
    console.log('Mock fetchVulnRuntime', filters);
    return {
      data: [
        {
          isRiskSpotlightEnabled: true,
          mainAssetName: "sock-shop-carts",
          policyEvaluationsResult: "passed",
          resultId: "res-runtime-1",
          runningVulnTotalBySeverity: {
            critical: 0,
            high: 0,
            low: 0,
            medium: 0,
            negligible: 0
          },
          sbomId: "sbom-1",
          scope: {
            "asset.type": "container",
            "kubernetes.cluster.name": "sock-shop-cluster",
            "kubernetes.namespace.name": "sock-shop",
            "kubernetes.pod.container.name": "carts",
            "kubernetes.workload.name": "sock-shop-carts",
            "kubernetes.workload.type": "deployment"
          },
          vulnTotalBySeverity: {
            critical: 0,
            high: 2,
            low: 5,
            medium: 1,
            negligible: 10
          }
        }
      ]
    } as any;
  }

  async fetchVulnRegistry<T = any>(filters?: string): Promise<T> {
    console.log('Mock fetchVulnRegistry', filters);
    return {
      data: [
        {
          createdAt: "2023-10-24T14:15:22Z",
          imageId: "sha256:123456789abc",
          mainAssetName: "library/nginx",
          resultId: "res-registry-1",
          vulnTotalBySeverity: {
            critical: 1,
            high: 3,
            low: 0,
            medium: 2,
            negligible: 0
          }
        }
      ]
    } as any;
  }

  async fetchVulnPipeline<T = any>(filters?: string): Promise<T> {
    console.log('Mock fetchVulnPipeline', filters);
    return {
      data: [
        {
          createdAt: "2023-10-25T10:00:00Z",
          imageId: "sha256:abcdef123456",
          mainAssetName: "ghcr.io/sysdiglabs/sysdig-cli-scanner",
          policyEvaluationsResult: "passed",
          resultId: "res-pipeline-1",
          vulnTotalBySeverity: {
            critical: 0,
            high: 0,
            low: 1,
            medium: 0,
            negligible: 5
          }
        }
      ]
    } as any;
  }

  async fetchInventory<T = any>(filters?: string): Promise<T> {
    console.log('Mock fetchInventory', filters);
    return {
      data: [
        {
          configuration: "metadata: annotations: ...",
          id: "inv-1",
          keyValueConfigs: [
            {
              groupName: "Kubernetes",
              values: {
                key: "Kubelet --anonymous-auth",
                value: "false"
              }
            }
          ],
          labels: ["app.kubernetes.io/managed-by:Helm"],
          lastSeen: "1660742138",
          metadata: {
            Account: "123456789012",
            Organization: "Sysdig",
            Region: "us-east-1"
          },
          name: "sock-shop-carts",
          platform: "AWS",
          postureControlSummary: [
            {
              acceptedControls: 8,
              failedControls: 2,
              name: "CIS Amazon Web Services Foundations Benchmark",
              policyId: "15"
            }
          ],
          posturePolicySummary: {
            passPercentage: 80,
            policies: [
              {
                id: "15",
                name: "CIS Amazon Web Services Foundations Benchmark",
                pass: false
              }
            ]
          },
          resourceOrigin: "Deployed",
          type: "Deployment",
          zones: [
            {
              id: "1",
              name: "Entire Infrastructure"
            }
          ]
        }
      ]
    } as any;
  }
}
