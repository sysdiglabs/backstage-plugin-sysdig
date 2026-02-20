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
  SYSDIG_CUSTOM_FILTER_ANNOTATION,
  SYSDIG_IMAGE_FREETEXT_ANNOTATION,

  // methods
  getStatusColorSpan,
  getTitleWithBacklink,
  getChips,
  getBacklink
} from '../../lib'
import { sysdigApiRef } from '../../api';

type PipelineScan = {
  createdAt: Date,
  imageId: string,
  pullString: string,
  policyEvaluationResult: string,
  resultId: string,
  vulnTotalBySeverity: {
    critical: number,
    high: number,
    low: number,
    medium: number,
    negligible: number
  }
};

type DenseTableProps = {
  pipelineScans: PipelineScan[];
  title: JSX.Element;
};

// Example image response from Sysdig scanning API
/*
"data": [
  {
    "createdAt": "2019-08-24T14:15:22Z",
    "imageId": "string",
    "pullString": "string",
    "policyEvaluationResult": "passed",
    "resultId": "string",
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

export const DenseTable = ({ pipelineScans, title }: DenseTableProps) => {
  const columns: TableColumn[] = [
    { title: 'Status', field: 'policyEvalStatus', width: "2%" },
    { title: 'Image ID', field: 'imageId', width: "23%" },
    { title: 'Asset Name', field: 'asset', width: "35%"  },
    { title: 'Vulnerabilities', field: 'vulns', width: "35%"  },
//    { title: 'Last Evaluated At', field: 'lastEvaluatedAt', width: "15%" },
//    { title: 'URL', field: "url", width: "10%"  },
  ];

  const data = pipelineScans.filter(scan => { return scan.policyEvaluationResult !== null && scan.policyEvaluationResult !== '' })
    .flatMap(scan => {
    return {
      policyEvalStatus: getStatusColorSpan(scan.policyEvaluationResult),
      imageId: <code>{scan.imageId}</code>,
      asset: scan.pullString,
      vulns: getChips(scan.vulnTotalBySeverity),
      // convert image.lastEvaluatedAt to a date string
//      lastEvaluatedAt: getDate(image.lastEvaluatedAt * 1000),
      // https://prodmon.app.sysdig.com/secure/#/scanning/scan-results/quay.io%2Fsysdig%2Fsysdigcloud-backend%3A5.1.0.10598-sysdig-meerkat-collector/id/497c07ec287acc1800dc84a91ac1260e910c603cabc8febd754b909f406a6e26/summaries
      // url: getUrl('https://prodmon.app.sysdig.com/api/scanning/v1/images/by_id/' + image.imageId + '?fulltag=' + image.repo + ':' + image.tag),
//      url: getUrl('https://prodmon.app.sysdig.com/secure/#/scanning/scan-results/' + urlEncode(image.repo + ':' + image.tag) +' /id/' + image.imageId + '/summaries'),
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

export const SysdigVMPipelineFetchComponent = () => {
  const { entity } = useEntity();
  const sysdigApiClient = useApi(sysdigApiRef)
  const endpoint: string | undefined = useApi(configApiRef).getOptionalString("sysdig.endpoint");
  const backlink_config: string | undefined = useApi(configApiRef).getOptionalString("sysdig.backlink");

  const annotations = entity.metadata.annotations;

  const { filter, backlink, hasSysdigAnnotations } = useMemo(() => {
    let currentFilter = '?filter=';
    let currentBacklink = getBacklink(endpoint, backlink_config, "vm-pipeline");
    let name: string | undefined;
    let hasAnnotations = false;

    if (annotations) {
      if (SYSDIG_CUSTOM_FILTER_ANNOTATION in annotations) {
        currentFilter += annotations[SYSDIG_CUSTOM_FILTER_ANNOTATION];
        hasAnnotations = true;
      } else {
        const filters: string[] = [];

        if (SYSDIG_IMAGE_FREETEXT_ANNOTATION in annotations) {
          name = annotations[SYSDIG_IMAGE_FREETEXT_ANNOTATION];
          filters.push(`freeText in ("${name}")`);
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

  const { value, loading, error } = useAsync(async (): Promise<PipelineScan[]> => {
    if (!hasSysdigAnnotations) {
      return []; // No Sysdig annotations, so no data to fetch
    }
    const data = await sysdigApiClient.fetchVulnPipeline(filter);
    return data.data;
  }, [sysdigApiClient, filter, hasSysdigAnnotations]);

  if (!hasSysdigAnnotations) {
    return (
      <MissingAnnotationEmptyState
        annotation={[
          SYSDIG_IMAGE_FREETEXT_ANNOTATION,
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

  return <DenseTable pipelineScans={value || []} title={getTitleWithBacklink("Pipeline Scan Overview", backlink) || []}/>;
};
