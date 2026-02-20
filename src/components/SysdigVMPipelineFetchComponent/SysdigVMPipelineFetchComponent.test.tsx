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
import { SysdigVMPipelineFetchComponent } from './SysdigVMPipelineFetchComponent';
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
      'sysdigcloud.com/image-freetext': 'ghcr.io/sysdiglabs',
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

const mockPipelineScanV1 = {
  resultId: 'result-pipeline-123',
  imageId: 'sha256:deadbeef1234',
  pullString: 'ghcr.io/sysdiglabs/sample-app:latest',
  policyEvaluationResult: 'failed',
  createdAt: new Date('2024-01-22T08:51:46Z'),
  vulnTotalBySeverity: { critical: 1, high: 3, medium: 7, low: 2, negligible: 0 },
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

describe('SysdigVMPipelineFetchComponent', () => {
  it('renders the pipeline table with annotations', async () => {
    await renderInTestApp(
      <TestApiProvider apis={[
        [sysdigApiRef, mockSysdigApi],
        [configApiRef, mockConfig],
      ]}>
        <EntityProvider entity={mockEntity}>
          <SysdigVMPipelineFetchComponent />
        </EntityProvider>
      </TestApiProvider>
    );

    // Wait for the table to render
    const table = await screen.findByText('Pipeline Scan Overview');
    expect(table).toBeInTheDocument();
  });

  it('renders missing annotation state when annotations are missing', async () => {
    await renderInTestApp(
      <TestApiProvider apis={[
        [sysdigApiRef, mockSysdigApi],
        [configApiRef, mockConfig],
      ]}>
        <EntityProvider entity={mockEntityWithoutAnnotations}>
          <SysdigVMPipelineFetchComponent />
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
      fetchVulnPipeline: jest.fn().mockResolvedValue({ data: [mockPipelineScanV1] }),
    };

    await renderInTestApp(
      <TestApiProvider apis={[
        [sysdigApiRef, apiWithData],
        [configApiRef, mockConfig],
      ]}>
        <EntityProvider entity={mockEntity}>
          <SysdigVMPipelineFetchComponent />
        </EntityProvider>
      </TestApiProvider>
    );

    expect(await screen.findByText('ghcr.io/sysdiglabs/sample-app:latest')).toBeInTheDocument();
    expect(screen.getByText('failed')).toBeInTheDocument();
  });

  it('filters out rows with null policyEvaluationResult', async () => {
    const scanWithNullPolicy = { ...mockPipelineScanV1, policyEvaluationResult: null as any };
    const apiWithData = {
      ...mockSysdigApi,
      fetchVulnPipeline: jest.fn().mockResolvedValue({ data: [scanWithNullPolicy, mockPipelineScanV1] }),
    };

    await renderInTestApp(
      <TestApiProvider apis={[
        [sysdigApiRef, apiWithData],
        [configApiRef, mockConfig],
      ]}>
        <EntityProvider entity={mockEntity}>
          <SysdigVMPipelineFetchComponent />
        </EntityProvider>
      </TestApiProvider>
    );

    // Only the scan with a non-null policyEvaluationResult should appear
    const rows = await screen.findAllByText('ghcr.io/sysdiglabs/sample-app:latest');
    expect(rows).toHaveLength(1);
  });
});
