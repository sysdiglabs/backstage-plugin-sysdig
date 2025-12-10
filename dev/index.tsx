import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { sysdigPlugin, SysdigPage } from '../src/plugin';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { createApiFactory, configApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { sysdigApiRef, SysdigApiClient } from '../src/api';

const mockEntity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'sock-shop-carts',
    annotations: {
      // Un-comment to see different results in the UI
      //
      // 'sysdigcloud.com/kubernetes-cluster-name': 'sock-shop-cluster',
      // 'sysdigcloud.com/kubernetes-namespace-name': 'sock-shop',
      // 'sysdigcloud.com/kubernetes-workload-name': 'sock-shop-carts',
      'sysdigcloud.com/kubernetes-workload-type': 'deployment',
      'sysdigcloud.com/registry-vendor': 'dockerv2',
      // 'sysdigcloud.com/registry-name': 'registry-harbor-registry.registry.svc.cluster.local:5443',
      'sysdigcloud.com/image-freetext': 'ghcr.io',
      'sysdigcloud.com/resource-name': 'sock-shop-carts',
      'sysdigcloud.com/resource-type': 'Deployment',
    },
  },
  spec: {
    type: 'service',
    lifecycle: 'experimental',
    owner: 'team-c',
  },
};

createDevApp()
  .registerApi(
    createApiFactory({
      api: sysdigApiRef,
      deps: { configApi: configApiRef, fetchApi: fetchApiRef },
      factory: ({ configApi, fetchApi }) =>
        new SysdigApiClient({ configApi, fetchApi }),
    }),
  )
  .registerPlugin(sysdigPlugin)
  .addPage({
    element: (
      <EntityProvider entity={mockEntity}>
        <SysdigPage />
      </EntityProvider>
    ),
    title: 'Sysdig',
    path: '/sysdig',
  })
  .render();
