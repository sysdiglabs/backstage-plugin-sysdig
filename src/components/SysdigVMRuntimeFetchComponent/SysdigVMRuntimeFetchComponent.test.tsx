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
import { screen } from '@testing-library/react';
import { SysdigVMRuntimeFetchComponent } from './SysdigVMRuntimeFetchComponent';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { sysdigApiRef } from '../../api';
import { configApiRef } from '@backstage/core-plugin-api';
import { ConfigReader } from '@backstage/config';

const mockEntity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'test-component',
    annotations: {
      'sysdigcloud.com/kubernetes-cluster-name': 'test-cluster',
      'sysdigcloud.com/kubernetes-namespace-name': 'test-namespace',
    },
  },
};

const mockEntityWithoutAnnotations = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'test-component',
    annotations: {},
  },
};

const mockRuntimeScanV1 = {
  resultId: 'result-abc123',
  resourceId: 'sha256:a1b2c3d4e5f6',
  mainAssetName: 'nginx:latest',
  policyEvaluationResult: 'failed',
  isRiskSpotlightEnabled: true,
  sbomId: 'sbom-xyz',
  scope: {
    'asset.type': 'workload',
    'kubernetes.cluster.name': 'test-cluster',
    'kubernetes.namespace.name': 'test-namespace',
    'kubernetes.workload.name': 'nginx',
    'kubernetes.workload.type': 'deployment',
    'kubernetes.pod.container.name': 'nginx',
  },
  vulnTotalBySeverity: { critical: 2, high: 5, medium: 10, low: 3, negligible: 1 },
  runningVulnTotalBySeverity: { critical: 1, high: 2, medium: 4, low: 1, negligible: 0 },
};

const mockSysdigApi = {
  fetchVulnRuntime: jest.fn().mockResolvedValue({ data: [] }),
  fetchVulnRegistry: jest.fn().mockResolvedValue({ data: [] }),
  fetchVulnPipeline: jest.fn().mockResolvedValue({ data: [] }),
  fetchInventory: jest.fn().mockResolvedValue({ data: [] }),
};

const mockConfig = new ConfigReader({
  sysdig: {
    endpoint: 'https://sysdig.com',
    backlink: 'https://sysdig.com/backlink',
  },
  backend: {
    baseUrl: 'http://localhost:7007',
  },
});

describe('SysdigVMRuntimeFetchComponent', () => {
  it('renders the runtime table with annotations', async () => {
    await renderInTestApp(
      <TestApiProvider apis={[
        [sysdigApiRef, mockSysdigApi],
        [configApiRef, mockConfig],
      ]}>
        <EntityProvider entity={mockEntity}>
          <SysdigVMRuntimeFetchComponent />
        </EntityProvider>
      </TestApiProvider>
    );

    // Wait for the table to render
    const table = await screen.findByText('Runtime Scan Overview');
    expect(table).toBeInTheDocument();
  });

  it('renders missing annotation state when annotations are missing', async () => {
    await renderInTestApp(
      <TestApiProvider apis={[
        [sysdigApiRef, mockSysdigApi],
        [configApiRef, mockConfig],
      ]}>
        <EntityProvider entity={mockEntityWithoutAnnotations}>
          <SysdigVMRuntimeFetchComponent />
        </EntityProvider>
      </TestApiProvider>
    );

    // Wait for the missing annotation message to render
    const message = await screen.findByText(/missing annotation/i);
    expect(message).toBeInTheDocument();
  });

  it('renders rows using v1 policyEvaluationResult field (without s)', async () => {
    const apiWithData = {
      ...mockSysdigApi,
      fetchVulnRuntime: jest.fn().mockResolvedValue({ data: [mockRuntimeScanV1] }),
    };

    await renderInTestApp(
      <TestApiProvider apis={[
        [sysdigApiRef, apiWithData],
        [configApiRef, mockConfig],
      ]}>
        <EntityProvider entity={mockEntity}>
          <SysdigVMRuntimeFetchComponent />
        </EntityProvider>
      </TestApiProvider>
    );

    expect(await screen.findByText('nginx:latest')).toBeInTheDocument();
    expect(screen.getByText('failed')).toBeInTheDocument();
  });

  it('filters out rows with null policyEvaluationResult', async () => {
    const scanWithNullPolicy = { ...mockRuntimeScanV1, policyEvaluationResult: null as any };
    const apiWithData = {
      ...mockSysdigApi,
      fetchVulnRuntime: jest.fn().mockResolvedValue({ data: [scanWithNullPolicy, mockRuntimeScanV1] }),
    };

    await renderInTestApp(
      <TestApiProvider apis={[
        [sysdigApiRef, apiWithData],
        [configApiRef, mockConfig],
      ]}>
        <EntityProvider entity={mockEntity}>
          <SysdigVMRuntimeFetchComponent />
        </EntityProvider>
      </TestApiProvider>
    );

    // Only the scan with a non-null policyEvaluationResult should appear (1 row = 1 asset name)
    const rows = await screen.findAllByText('nginx:latest');
    expect(rows).toHaveLength(1);
  });
});
