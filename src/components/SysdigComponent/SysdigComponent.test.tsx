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
import { SysdigComponent } from './SysdigComponent';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { screen } from '@testing-library/react';
import {
  setupRequestMockHandlers,
  renderInTestApp,
  TestApiProvider,
} from "@backstage/test-utils";
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { sysdigApiRef } from '../../api';
import { configApiRef } from '@backstage/core-plugin-api';
import { ConfigReader } from '@backstage/config';

const mockEntity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'test-component',
    annotations: {},
  },
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

describe('SysdigComponent', () => {
  const server = setupServer();
  // Enable sane handlers for network requests
  setupRequestMockHandlers(server);

  // setup mock response
  beforeEach(() => {
    server.use(
      rest.get('/*', (_, res, ctx) => res(ctx.status(200), ctx.json({}))),
    );
  });

  it('should render', async () => {
    await renderInTestApp(
      <TestApiProvider apis={[
        [sysdigApiRef, mockSysdigApi],
        [configApiRef, mockConfig],
      ]}>
        <EntityProvider entity={mockEntity}>
          <SysdigComponent />
        </EntityProvider>
      </TestApiProvider>
    );
    expect(screen.getByText('Sysdig Security Report')).toBeInTheDocument();
  });
});
