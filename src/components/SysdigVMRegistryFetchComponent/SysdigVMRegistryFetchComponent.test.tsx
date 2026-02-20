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
import { SysdigVMRegistryFetchComponent } from './SysdigVMRegistryFetchComponent';
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
      'sysdigcloud.com/registry-name': 'test-registry',
      'sysdigcloud.com/registry-vendor': 'harbor',
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

const mockRegistryScanV1 = {
  resultId: 'result-registry-456',
  imageId: 'sha256:abc123def456',
  pullString: 'harbor.example.com/library/nginx:1.25',
  vulnTotalBySeverity: { critical: 0, high: 2, medium: 5, low: 1, negligible: 3 },
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

describe('SysdigVMRegistryFetchComponent', () => {
  it('renders the registry table with annotations', async () => {
    await renderInTestApp(
      <TestApiProvider apis={[
        [sysdigApiRef, mockSysdigApi],
        [configApiRef, mockConfig],
      ]}>
        <EntityProvider entity={mockEntity}>
          <SysdigVMRegistryFetchComponent />
        </EntityProvider>
      </TestApiProvider>
    );

    // Wait for the table to render
    const table = await screen.findByText('Registry Scan Overview');
    expect(table).toBeInTheDocument();
  });

  it('renders missing annotation state when annotations are missing', async () => {
    await renderInTestApp(
      <TestApiProvider apis={[
        [sysdigApiRef, mockSysdigApi],
        [configApiRef, mockConfig],
      ]}>
        <EntityProvider entity={mockEntityWithoutAnnotations}>
          <SysdigVMRegistryFetchComponent />
        </EntityProvider>
      </TestApiProvider>
    );

    // Wait for the missing annotation message to render
    const message = await screen.findByText(/missing annotation/i);
    expect(message).toBeInTheDocument();
  });

  it('renders rows using v1 pullString field (not mainAssetName)', async () => {
    const apiWithData = {
      ...mockSysdigApi,
      fetchVulnRegistry: jest.fn().mockResolvedValue({ data: [mockRegistryScanV1] }),
    };

    await renderInTestApp(
      <TestApiProvider apis={[
        [sysdigApiRef, apiWithData],
        [configApiRef, mockConfig],
      ]}>
        <EntityProvider entity={mockEntity}>
          <SysdigVMRegistryFetchComponent />
        </EntityProvider>
      </TestApiProvider>
    );

    expect(await screen.findByText('harbor.example.com/library/nginx:1.25')).toBeInTheDocument();
  });
});
