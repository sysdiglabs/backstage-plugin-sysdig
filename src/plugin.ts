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
import { configApiRef, createApiFactory, createPlugin, createRoutableExtension, fetchApiRef } from '@backstage/core-plugin-api';
import { SysdigApiClient, sysdigApiRef } from './api';

import { rootRouteRef } from './routes';

export const sysdigPlugin = createPlugin({
  id: 'sysdig',
  apis: [
    createApiFactory({
      api: sysdigApiRef,
      deps: { configApi: configApiRef, fetchApi: fetchApiRef},
      factory: ({ configApi, fetchApi }) => new SysdigApiClient({ configApi, fetchApi})
    })
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const SysdigPage = sysdigPlugin.provide(
  createRoutableExtension({
    name: 'SysdigPage',
    component: () =>
      import('./components/SysdigComponent').then(m => m.SysdigComponent),
    mountPoint: rootRouteRef,
  }),
);
