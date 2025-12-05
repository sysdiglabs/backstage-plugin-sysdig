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
import {
  // annotations
  SYSDIG_REGISTRY_NAME_ANNOTATION,
  SYSDIG_REGISTRY_VENDOR_ANNOTATION,
  SYSDIG_REGISTRY_REPOSITORY_ANNOTATION,
  SYSDIG_CUSTOM_FILTER_ANNOTATION,

  // methods
  getChips,
  getTitleWithBacklink,
  getBacklink
} from '../../lib';
import { sysdigApiRef } from '../../api';

type RegistryScan =   {
  mainAssetName: string,
  imageId: string,
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
  registryScans: RegistryScan[];
  title: React.JSX.Element;
};

// Example image response from Sysdig scanning API
/*
"data": [
  {
    "createdAt": "2019-08-24T14:15:22Z",
    "imageId": "string",
    "mainAssetName": "string",
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

export const DenseTable = ({ registryScans, title }: DenseTableProps) => {
  const columns: TableColumn[] = [
    { title: 'Image ID', field: 'imageId', width: "20%" },
    { title: 'Asset Name', field: 'asset', width: "35%"  },
    { title: 'Severity', field: 'severity', width: "30%"  },
  ];

  const data = registryScans.filter(scan => { return scan.imageId !== '' })
    .flatMap(scan => {
    return {
      imageId: <code>{scan.imageId}</code>,
      asset: scan.mainAssetName,
      severity: getChips(scan.vulnTotalBySeverity)
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

export const SysdigVMRegistryFetchComponent = () => {
  const { entity } = useEntity();
  const sysdigApiClient = useApi(sysdigApiRef)
  const endpoint: string | undefined = useApi(configApiRef).getOptionalString("sysdig.endpoint");
  const backlink_config: string | undefined = useApi(configApiRef).getOptionalString("sysdig.backlink");

  const annotations = entity.metadata.annotations;

  const { filter, backlink } = React.useMemo(() => {
    let currentFilter = '?filter=';
    let currentBacklink = getBacklink(endpoint, backlink_config, "vm-registry");
    let name: string | undefined;

    if (annotations) {
      if (SYSDIG_CUSTOM_FILTER_ANNOTATION in annotations) {
        currentFilter += annotations[SYSDIG_CUSTOM_FILTER_ANNOTATION];
      } else {
        const filters: string[] = [];

        if (SYSDIG_REGISTRY_NAME_ANNOTATION in annotations) {
          name = annotations[SYSDIG_REGISTRY_NAME_ANNOTATION];
          filters.push(`registry.name="${name}"`);
        }

        if (SYSDIG_REGISTRY_VENDOR_ANNOTATION in annotations) {
          name = annotations[SYSDIG_REGISTRY_VENDOR_ANNOTATION];
          filters.push(`registry.vendor="${name}"`);
        }

        if (SYSDIG_REGISTRY_REPOSITORY_ANNOTATION in annotations) {
          name = annotations[SYSDIG_REGISTRY_REPOSITORY_ANNOTATION];
          filters.push(`repository.name="${name}"`);
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

  const { value, loading, error } = useAsync(async (): Promise<RegistryScan[]> => {
    if (!annotations) {
      return []; // No annotations, so no data to fetch
    }
    const data = await sysdigApiClient.fetchVulnRegistry(filter);
    return data.data;
  }, [sysdigApiClient, filter, annotations]);

  if (!annotations) {
    return <Alert severity="warning">Please, add annotations to the entity.</Alert>;
  }

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return <DenseTable registryScans={value || []} title={getTitleWithBacklink("Registry Scan Overview", backlink) || []} />;
};
