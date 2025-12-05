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
        },
        {
          isRiskSpotlightEnabled: false,
          mainAssetName: "sock-shop-front-end",
          policyEvaluationsResult: "failed",
          resultId: "res-runtime-2",
          runningVulnTotalBySeverity: {
            critical: 1,
            high: 2,
            low: 3,
            medium: 4,
            negligible: 0
          },
          sbomId: "sbom-2",
          scope: {
            "asset.type": "container",
            "kubernetes.cluster.name": "sock-shop-cluster",
            "kubernetes.namespace.name": "sock-shop",
            "kubernetes.pod.container.name": "front-end",
            "kubernetes.workload.name": "sock-shop-front-end",
            "kubernetes.workload.type": "deployment"
          },
          vulnTotalBySeverity: {
            critical: 1,
            high: 5,
            low: 8,
            medium: 2,
            negligible: 3
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
        },
        {
          createdAt: "2023-11-01T12:00:00Z",
          imageId: "sha256:fedcba987654",
          mainAssetName: "library/ubuntu",
          resultId: "res-registry-2",
          vulnTotalBySeverity: {
            critical: 0,
            high: 1,
            low: 2,
            medium: 0,
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
        },
        {
          createdAt: "2023-11-02T09:30:00Z",
          imageId: "sha256:987654321fed",
          mainAssetName: "docker.io/library/alpine",
          policyEvaluationsResult: "failed",
          resultId: "res-pipeline-2",
          vulnTotalBySeverity: {
            critical: 0,
            high: 0,
            low: 0,
            medium: 3,
            negligible: 1
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
        },
        {
          configuration: "metadata: annotations: ...",
          id: "inv-2",
          keyValueConfigs: [
            {
              groupName: "Kubernetes",
              values: {
                key: "Kubelet --read-only-port",
                value: "0"
              }
            }
          ],
          labels: ["app.kubernetes.io/component:payment"],
          lastSeen: "1660742138",
          metadata: {
            Account: "123456789012",
            Organization: "Sysdig",
            Region: "us-east-1"
          },
          name: "sock-shop-payments",
          platform: "AWS",
          postureControlSummary: [
            {
              acceptedControls: 10,
              failedControls: 0,
              name: "CIS Amazon Web Services Foundations Benchmark",
              policyId: "15"
            }
          ],
          posturePolicySummary: {
            passPercentage: 100,
            policies: [
              {
                id: "15",
                name: "CIS Amazon Web Services Foundations Benchmark",
                pass: true
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
