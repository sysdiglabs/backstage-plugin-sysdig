/*
 * Copyright 2023 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import { Table, TableColumn, Progress } from '@backstage/core-components';
import useAsync from 'react-use/lib/useAsync';
import Alert from '@material-ui/lab/Alert';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { sysdigApiRef } from '../../api';

import {
  // annotations
  SYSDIG_EXTERNALDNS_ANNOTATION, 
  SYSDIG_DISTRIBUTION_ANNOTATION, 
  SYSDIG_LABELS_ANNOTATION, 
  SYSDIG_RESOURCE_NAME_ANNOTATION, 
  SYSDIG_RESOURCE_ORIGIN_ANNOTATION, 
  SYSDIG_RESOURCE_TYPE_ANNOTATION, 
  SYSDIG_NODE_TYPE_ANNOTATION, 
  SYSDIG_OS_NAME_ANNOTATION, 
  SYSDIG_OS_IMAGE_ANNOTATION, 
  SYSDIG_PLATFORM_ANNOTATION, 
  SYSDIG_ACCOUNT_ANNOTATION, 
  SYSDIG_ORGANIZATION_ANNOTATION, 
  SYSDIG_PROJECT_ANNOTATION, 
  SYSDIG_REGION_ANNOTATION, 
  SYSDIG_AZURE_SUBSCRIPTION_ANNOTATION, 
  SYSDIG_VERSION_ANNOTATION, 
  SYSDIG_ZONE_ANNOTATION, 
  SYSDIG_CATEGORY_ANNOTATION, 
  SYSDIG_INTEGRATION_NAME_ANNOTATION, 
  SYSDIG_LOCATION_ANNOTATION, 
  SYSDIG_REPOSITORY_ANNOTATION, 
  SYSDIG_SOURCE_TYPE_ANNOTATION, 
  SYSDIG_CLUSTER_NAME_ANNOTATION, 
  SYSDIG_NAMESPACE_ANNOTATION, 
  SYSDIG_CUSTOM_FILTER_ANNOTATION,

  // methods
  getFailed,
  getPassed,
  getDetails,
  getGauge,
  getScope,
  getResourceName,
  getTitleWithBacklink,
  getBacklink
} from '../../lib'


type PostureScan = {
  configuration: string,
  id: string,
  keyValueConfigs: [
    {
      groupName: string,
      values: {
        key: string,
        value: string
      }
    }
  ],
  labels: [
    string
  ],
  lastSeen: string,
  metadata: {
    Account: string,
    Organization: string,
    Region: string
  },
  name: string,
  platform: string,
  postureControlSummary: [
    {
      acceptedControls: number,
      failedControls: number,
      name: string,
      policyId: string
    }
  ],
  posturePolicySummary: {
    passPercentage: number,
    policies: [
      {
        id: string,
        name: string,
        pass: boolean
      }
    ]
  },
  resourceOrigin: string,
  type: string,
  zones: [
    {
      id: string,
      name: string
    }
  ]
};

type DenseTableProps = {
  postureScans: PostureScan[];
  title: React.JSX.Element;
};

// Example image response from Sysdig scanning API
/*
"data": [
  {
    "configuration": "metadata: annotations: meta.helm.sh/release-name: iac-collector meta.helm.sh/release-namespace: default labels: app.kubernetes.io/managed-by: Helm skaffold.dev/run-id: 57984887-4121-4d34-aa82-c8291300205f name: secure-iac-collector-sa namespace: sysdig",
    "id": "62e348b71acd7be14a4bdfcc",
    "keyValueConfigs": [
      {
        "groupName": "Kubernetes",
        "values": {
          "key": "Kubelet --anonymous-auth",
          "value": "false"
        }
      }
    ],
    "labels": [
      "app.kubernetes.io/managed-by:Helm"
    ],
    "lastSeen": "1660742138",
    "metadata": {
      "Account": "746213592136",
      "Organization": "o-k53g78fd13e9",
      "Region": "us-east-1"
    },
    "name": "aws-bucket1",
    "platform": "AWS",
    "postureControlSummary": [
      {
        "acceptedControls": 3,
        "failedControls": 5,
        "name": "CIS Amazon Web Services Foundations Benchmark",
        "policyId": "15"
      }
    ],
    "posturePolicySummary": {
      "passPercentage": 50,
      "policies": [
        {
          "id": "15",
          "name": "CIS Amazon Web Services Foundations Benchmark",
          "pass": false
        }
      ]
    },
    "resourceOrigin": "Deployed",
    "type": "AWS_S3_BUCKET_ACL",
    "zones": [
      {
        "id": "1",
        "name": "Entire Infrastructure"
      }
    ]
  },
  ...
*/

export const DenseTable = ({ postureScans, title }: DenseTableProps) => {
  const columns: TableColumn[] = [
    { title: 'Name', field: 'name', width: "10%" },
    { title: 'Scope', field: 'scope', width: "10%"  },
    { title: 'Score', field: 'score', width: "10%"  },
    { title: 'Failed Policies', field: 'failed', width: "25%"  },
    { title: 'Passed Policies', field: 'passed', width: "25%"  },
    { title: 'Details', field: 'details', width: "2%"  }
  ];

  const data = postureScans.filter(scan => { return scan.posturePolicySummary != null })
    .flatMap(scan => {
    return {
      name: getResourceName(scan.name, scan.type, scan.platform, scan.resourceOrigin),
      scope: getScope(scan.metadata),
      score: getGauge(scan.posturePolicySummary.passPercentage),
      failed: getFailed(scan.posturePolicySummary.policies),
      passed: getPassed(scan.posturePolicySummary.policies),
      details: getDetails(scan)
    };
  });

  return (
    <Table
      title={title}
      options={{ search: true, paging: false }}
      // sortby

      columns={columns}
      data={data}
    />
  );
};

export const SysdigPostureFetchComponent = () => {
  const { entity } = useEntity();
  const backendUrl = useApi(configApiRef).getString('backend.baseUrl');
  const sysdigApiClient = useApi(sysdigApiRef);
  const endpoint: string | undefined = useApi(configApiRef).getOptionalString("sysdig.endpoint");
  const backlink_config: string | undefined = useApi(configApiRef).getOptionalString("sysdig.backlink");

  const annotations = entity.metadata.annotations;

  const { filter, backlink } = React.useMemo(() => {
    let currentFilter = '?filter=';
    let currentBacklink = getBacklink(endpoint, backlink_config, "inventory");
    let name: string | undefined;

    if (annotations) {
      if (SYSDIG_CUSTOM_FILTER_ANNOTATION in annotations) {
        currentFilter += annotations[SYSDIG_CUSTOM_FILTER_ANNOTATION];
      } else {
        const filters: string[] = [];

        if (SYSDIG_EXTERNALDNS_ANNOTATION in annotations) {
          name = annotations[SYSDIG_EXTERNALDNS_ANNOTATION];
          filters.push(`externalDNS="${name}"`);
        }
        
        if (SYSDIG_DISTRIBUTION_ANNOTATION in annotations) {
          name = annotations[SYSDIG_DISTRIBUTION_ANNOTATION];
          filters.push(`distribution="${name}"`);
        }
        
        if (SYSDIG_LABELS_ANNOTATION in annotations) {
          name = annotations[SYSDIG_LABELS_ANNOTATION];
          filters.push(`labels="${name}"`);
        }
        
        if (SYSDIG_RESOURCE_NAME_ANNOTATION in annotations) {
          name = annotations[SYSDIG_RESOURCE_NAME_ANNOTATION];
          filters.push(`name="${name}"`);
        }
        
        if (SYSDIG_RESOURCE_ORIGIN_ANNOTATION in annotations) {
          name = annotations[SYSDIG_RESOURCE_ORIGIN_ANNOTATION];
          filters.push(`resourceOrigin="${name}"`);
        }
        
        if (SYSDIG_RESOURCE_TYPE_ANNOTATION in annotations) {
          name = annotations[SYSDIG_RESOURCE_TYPE_ANNOTATION];
          filters.push(`type="${name}"`);
        }
        
        if (SYSDIG_NODE_TYPE_ANNOTATION in annotations) {
          name = annotations[SYSDIG_NODE_TYPE_ANNOTATION];
          filters.push(`nodeType="${name}"`);
        }
        
        if (SYSDIG_OS_NAME_ANNOTATION in annotations) {
          name = annotations[SYSDIG_OS_NAME_ANNOTATION];
          filters.push(`osName="${name}"`);
        }
        
        if (SYSDIG_OS_IMAGE_ANNOTATION in annotations) {
          name = annotations[SYSDIG_OS_IMAGE_ANNOTATION];
          filters.push(`osImage="${name}"`);
        }
        
        if (SYSDIG_PLATFORM_ANNOTATION in annotations) {
          name = annotations[SYSDIG_PLATFORM_ANNOTATION];
          filters.push(`platform="${name}"`);
        }
        
        if (SYSDIG_ACCOUNT_ANNOTATION in annotations) {
          name = annotations[SYSDIG_ACCOUNT_ANNOTATION];
          filters.push(`account="${name}"`);
        }
        
        if (SYSDIG_ORGANIZATION_ANNOTATION in annotations) {
          name = annotations[SYSDIG_ORGANIZATION_ANNOTATION];
          filters.push(`organization="${name}"`);
        }
        
        if (SYSDIG_PROJECT_ANNOTATION in annotations) {
          name = annotations[SYSDIG_PROJECT_ANNOTATION];
          filters.push(`project="${name}"`);
        }
        
        if (SYSDIG_REGION_ANNOTATION in annotations) {
          name = annotations[SYSDIG_REGION_ANNOTATION];
          filters.push(`region="${name}"`);
        }
        
        if (SYSDIG_AZURE_SUBSCRIPTION_ANNOTATION in annotations) {
          name = annotations[SYSDIG_AZURE_SUBSCRIPTION_ANNOTATION];
          filters.push(`subscription="${name}"`);
        }
        
        if (SYSDIG_VERSION_ANNOTATION in annotations) {
          name = annotations[SYSDIG_VERSION_ANNOTATION];
          filters.push(`version="${name}"`);
        }
        
        if (SYSDIG_ZONE_ANNOTATION in annotations) {
          name = annotations[SYSDIG_ZONE_ANNOTATION];
          filters.push(`zone="${name}"`);
        }
        
        if (SYSDIG_CATEGORY_ANNOTATION in annotations) {
          name = annotations[SYSDIG_CATEGORY_ANNOTATION];
          filters.push(`category="${name}"`);
        }
        
        if (SYSDIG_INTEGRATION_NAME_ANNOTATION in annotations) {
          name = annotations[SYSDIG_INTEGRATION_NAME_ANNOTATION];
          filters.push(`integrationName="${name}"`);
        }
        
        if (SYSDIG_LOCATION_ANNOTATION in annotations) {
          name = annotations[SYSDIG_LOCATION_ANNOTATION];
          filters.push(`location="${name}"`);
        }
        
        if (SYSDIG_REPOSITORY_ANNOTATION in annotations) {
          name = annotations[SYSDIG_REPOSITORY_ANNOTATION];
          filters.push(`repository="${name}"`);
        }
        
        if (SYSDIG_SOURCE_TYPE_ANNOTATION in annotations) {
          name = annotations[SYSDIG_SOURCE_TYPE_ANNOTATION];
          filters.push(`sourceType="${name}"`);
        }      

        if (SYSDIG_CLUSTER_NAME_ANNOTATION in annotations) {
          name = annotations[SYSDIG_CLUSTER_NAME_ANNOTATION];
          filters.push(`cluster="${name}"`);
        }
        
        if (SYSDIG_NAMESPACE_ANNOTATION in annotations) {
          name = annotations[SYSDIG_NAMESPACE_ANNOTATION];
          filters.push(`namespace="${name}"`);
        }
        
        if (filters.length === 0) {
          return { filter: '', backlink: '' }; // No annotations, no filter
        }

        currentFilter += filters.join(' and '); 
        currentBacklink += currentFilter;
      }
    }
    return { filter: currentFilter, backlink: currentBacklink };
  }, [annotations, endpoint, backlink_config]);

  const { value, loading, error } = useAsync(async (): Promise<PostureScan[]> => {
    if (!annotations) {
      return []; // No annotations, so no data to fetch
    }
    const data = await sysdigApiClient.fetchInventory(filter);
    return data.data;
  }, [sysdigApiClient, filter, annotations]); // Depend on filter and annotations

  if (!annotations) {
    return <Alert severity="warning">Please, add annotations to the entity.</Alert>;
  }

  if (loading) {
    return <Progress />;
  } 
  
  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return <DenseTable postureScans={value || []} title={getTitleWithBacklink("Posture Overview", backlink) || []} />;
};
