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
import { useMemo } from 'react';
import { Table, TableColumn, Progress } from '@backstage/core-components';
import useAsync from 'react-use/lib/useAsync';
import Alert from '@mui/material/Alert';
import { useEntity, MissingAnnotationEmptyState } from '@backstage/plugin-catalog-react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';

import {
  // annotations
  SYSDIG_CLUSTER_NAME_ANNOTATION,
  SYSDIG_NAMESPACE_ANNOTATION,
  SYSDIG_WORKLOAD_ANNOTATION,
  SYSDIG_WORKLOAD_TYPE_ANNOTATION,
  SYSDIG_CONTAINER_ANNOTATION,
  SYSDIG_CUSTOM_FILTER_ANNOTATION,

  // methods
  getPolicyEvaluation,
  getLifecycle,
  getException,
  getChips,
  IN_USE_SEVERITIES,
  compareSeverities,
  getDetails,
  getTitleWithBacklink,
  getHeaderWithTooltip,
  getBacklink
} from '../../lib'
import { sysdigApiRef } from '../../api';


type RuntimeScan =   {
  endOfLifeDate?: string,
  isRiskSpotlightEnabled: boolean,
  mainAssetName: string,
  policyEvaluationResult: string,
  resourceId: string,
  resultId: string,
  runningVulnTotalBySeverity: {
    critical: number,
    high: number,
    low: number,
    medium: number,
    negligible: number
  },
  sbomId: string,
  scope: {
    "asset.type": string,
    "kubernetes.cluster.name"?: string,
    "kubernetes.namespace.name"?: string,
    "kubernetes.pod.container.name"?: string,
    "kubernetes.workload.name"?: string,
    "kubernetes.workload.type"?: string,
    "agent.tag.cluster"?: string,
    "cloudProvider.region"?: string
  },
  vulnTotalBySeverity: {
    critical: number,
    high: number,
    low: number,
    medium: number,
    negligible: number
  }
};

type DenseTableProps = {
  runtimeScans: RuntimeScan[];
  title: JSX.Element;
};

// Example image response from Sysdig scanning API
/*
"data": [
  {
    "isRiskSpotlightEnabled": true,
    "mainAssetName": "string",
    "policyEvaluationsResult": "passed",
    "resultId": "string",
    "runningVulnTotalBySeverity": {
      "critical": 0,
      "high": 0,
      "low": 0,
      "medium": 0,
      "negligible": 0
    },
    "sbomId": "string",
    "scope": {
      "asset.type": "string",
      "kubernetes.cluster.name": "string",
      "kubernetes.namespace.name": "string",
      "kubernetes.pod.container.name": "string",
      "kubernetes.workload.name": "string",
      "kubernetes.workload.type": "string"
    },
    "vulnTotalBySeverity": {
      "critical": 0,
      "high": 0,
      "low": 0,
      "medium": 0,
      "negligible": 0
    }
  },
  ...
*/

// Same image can run in several clusters/namespaces, each with its own in-use vulns
const getLocation = (scope: RuntimeScan['scope'] | undefined) => ({
  cluster: scope?.["kubernetes.cluster.name"] ?? scope?.["agent.tag.cluster"] ?? scope?.["cloudProvider.region"] ?? '-',
  namespace: scope?.["kubernetes.namespace.name"] ?? '-',
});

// defined once: material-table resets its sort state when column definitions change between renders.
// no defaultSort: in material-table 3.x it breaks the sort cycle of other columns, data is pre-sorted instead
const columns: TableColumn[] = [
  { title: 'Asset Name', field: 'asset', width: "23%" },
  { title: 'Cluster', field: 'cluster', width: "12%"  },
  { title: 'Namespace', field: 'namespace', width: "12%"  },
  { title: getHeaderWithTooltip('In Use', 'Only vulnerabilities in packages loaded in memory at runtime.'), field: 'inUse', width: "14%", render: (row: any) => getChips(row.inUse, IN_USE_SEVERITIES), customSort: (a: any, b: any) => compareSeverities(a.inUse, b.inUse) },
  { title: getHeaderWithTooltip('Vulnerabilities', 'All vulnerabilities found in the image.'), field: 'severity', width: "14%", render: (row: any) => getChips(row.severity), customSort: (a: any, b: any) => compareSeverities(a.severity, b.severity) },
  { title: getHeaderWithTooltip('Policy Evaluation', 'Result of the vulnerability policy evaluation. Failed = at least one policy rule was violated.'), field: 'policyEvalStatus', width: "9%", render: (row: any) => getPolicyEvaluation(row.policyEvalStatus) },
  { title: getHeaderWithTooltip('Component Lifecycle', 'Active = still supported. EOL = the image base OS or runtime is past its end-of-life date and no longer receives security fixes.'), field: 'endOfLifeDate', width: "7%", render: (row: any) => getLifecycle(row.endOfLifeDate), customSort: (a: any, b: any) => (a.endOfLifeDate ?? '9999').localeCompare(b.endOfLifeDate ?? '9999') },
  { title: 'Exceptions', field: 'exception', width: "5%", render: (row: any) => getException(row.policyEvalStatus), customSort: (a: any, b: any) => Number(a.policyEvalStatus === 'accepted') - Number(b.policyEvalStatus === 'accepted') },
  { title: 'Details', field: 'details', width: "4%", sorting: false },
//    { title: 'Last Evaluated At', field: 'lastEvaluatedAt', width: "15%" },
//    { title: 'URL', field: "url", width: "10%"  },
];

export const DenseTable = ({ runtimeScans, title }: DenseTableProps) => {

  const data = runtimeScans.filter(scan => { return scan.policyEvaluationResult !== null && scan.policyEvaluationResult !== '' })
    .flatMap(scan => {
    return {
      policyEvalStatus: scan.policyEvaluationResult,
      endOfLifeDate: scan.endOfLifeDate,
      asset: scan.mainAssetName,
      ...getLocation(scan.scope),
      severity: scan.vulnTotalBySeverity,
      inUse: scan.runningVulnTotalBySeverity,
      details: getDetails(scan)
      // convert image.lastEvaluatedAt to a date string
//      lastEvaluatedAt: getDate(image.lastEvaluatedAt * 1000),
      // https://prodmon.app.sysdig.com/secure/#/scanning/scan-results/quay.io%2Fsysdig%2Fsysdigcloud-backend%3A5.1.0.10598-sysdig-meerkat-collector/id/497c07ec287acc1800dc84a91ac1260e910c603cabc8febd754b909f406a6e26/summaries
      // url: getUrl('https://prodmon.app.sysdig.com/api/scanning/v1/images/by_id/' + image.imageId + '?fulltag=' + image.repo + ':' + image.tag),
//      url: getUrl('https://prodmon.app.sysdig.com/secure/#/scanning/scan-results/' + urlEncode(image.repo + ':' + image.tag) +' /id/' + image.imageId + '/summaries'),
    };
  })
  // same initial order as Sysdig Secure: most in-use vulnerabilities first
    .sort((a, b) => compareSeverities(b.inUse, a.inUse));

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

export const SysdigVMRuntimeFetchComponent = () => {
  const { entity } = useEntity();
  const sysdigApiClient = useApi(sysdigApiRef);
  const endpoint: string | undefined = useApi(configApiRef).getOptionalString("sysdig.endpoint");
  const backlink_config: string | undefined = useApi(configApiRef).getOptionalString("sysdig.backlink");

  const annotations = entity.metadata.annotations;

  const { filter, backlink, hasSysdigAnnotations } = useMemo(() => {
    let currentFilter = '?filter=';
    let currentBacklink = getBacklink(endpoint, backlink_config, "vm-runtime");
    let names: string | undefined;
    let hasAnnotations = false;

    if (annotations) {
      if (SYSDIG_CUSTOM_FILTER_ANNOTATION in annotations) {
        currentFilter += annotations[SYSDIG_CUSTOM_FILTER_ANNOTATION];
        hasAnnotations = true;
      } else {
        const filters: string[] = [];

        if (SYSDIG_CLUSTER_NAME_ANNOTATION in annotations) {
          names = annotations[SYSDIG_CLUSTER_NAME_ANNOTATION].split(',').map(w => `"${w.trim()}"`).join(', ');
          filters.push(`kubernetes.cluster.name in (${names})`);
        }

        if (SYSDIG_NAMESPACE_ANNOTATION in annotations) {
          names = annotations[SYSDIG_NAMESPACE_ANNOTATION].split(',').map(w => `"${w.trim()}"`).join(', ');
          filters.push(`kubernetes.namespace.name in (${names})`);
        }

        if (SYSDIG_WORKLOAD_ANNOTATION in annotations) {
          names = annotations[SYSDIG_WORKLOAD_ANNOTATION].split(',').map(w => `"${w.trim()}"`).join(', ');
          filters.push(`kubernetes.workload.name in (${names})`);
        }

        if (SYSDIG_WORKLOAD_TYPE_ANNOTATION in annotations) {
          names = annotations[SYSDIG_WORKLOAD_TYPE_ANNOTATION].split(',').map(w => `"${w.trim()}"`).join(', ');
          filters.push(`kubernetes.workload.type in (${names})`);
        }

        if (SYSDIG_CONTAINER_ANNOTATION in annotations) {
          names = annotations[SYSDIG_CONTAINER_ANNOTATION].split(',').map(w => `"${w.trim()}"`).join(', ');
          filters.push(`kubernetes.pod.container.name in (${names})`);
        }

        if (filters.length === 0) {
          return { filter: '', backlink: '', hasSysdigAnnotations: false }; // No Sysdig annotations
        }

        hasAnnotations = true;
        currentFilter += filters.join(' and ');
        currentBacklink += currentFilter;
      }
    }
    return { filter: currentFilter, backlink: currentBacklink, hasSysdigAnnotations: hasAnnotations };
  }, [annotations, endpoint, backlink_config]);

  const { value, loading, error } = useAsync(async (): Promise<RuntimeScan[]> => {
    if (!hasSysdigAnnotations) {
      return []; // No Sysdig annotations, so no data to fetch
    }
    const data = await sysdigApiClient.fetchVulnRuntime(filter);
    return data.data;
  }, [sysdigApiClient, filter, hasSysdigAnnotations]);

  if (!hasSysdigAnnotations) {
    return (
      <MissingAnnotationEmptyState
        annotation={[
          SYSDIG_CLUSTER_NAME_ANNOTATION,
          SYSDIG_NAMESPACE_ANNOTATION,
          SYSDIG_WORKLOAD_ANNOTATION,
          SYSDIG_WORKLOAD_TYPE_ANNOTATION,
          SYSDIG_CONTAINER_ANNOTATION,
          SYSDIG_CUSTOM_FILTER_ANNOTATION
        ]}
        readMoreUrl="https://github.com/sysdiglabs/backstage-plugin-sysdig#how-to-annotate-services"
      />
    );
  }

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return <DenseTable runtimeScans={value || []} title={getTitleWithBacklink("Runtime Scan Overview", backlink) || []} />;
};
