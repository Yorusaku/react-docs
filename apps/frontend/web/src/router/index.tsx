import { createBrowserRouter, Navigate } from 'react-router-dom'

import { Layout } from '@/layout'
import { AuditPage } from '@/pages/Audit'
import { DocAclPage } from '@/pages/DocAcl'
import { GovernancePage } from '@/pages/Governance'
import { NotificationsPage } from '@/pages/Notifications'
import { ObservabilityPage } from '@/pages/Observability'
import { SearchPage } from '@/pages/Search'
import { SsoLabPage } from '@/pages/SsoLab'
import { TrashPage } from '@/pages/Trash'
import { DocList } from '@/views/Doc'
import { Doc } from '@/views/Doc/[id]'
import { DocGraph } from '@/views/Doc/Graph'
import { Login } from '@/views/Login'

import AuthRoute from './AuthRoute'

type PickRouter<T> = T extends (...args: any[]) => infer R ? R : never
type A = typeof createBrowserRouter

export const router: PickRouter<A> = createBrowserRouter([
    {
        path: '/',
        element: (
            <AuthRoute>
                <Layout />
            </AuthRoute>
        ),
        children: [
            {
                path: 'doc',
                element: <DocList />,
            },
            {
                path: 'doc/:id',
                element: <Doc />,
            },
            {
                path: 'doc/:id/acl',
                element: <DocAclPage />,
            },
            {
                path: 'doc/graph',
                element: <DocGraph />,
            },
            {
                path: 'search',
                element: <SearchPage />,
            },
            {
                path: 'notifications',
                element: <NotificationsPage />,
            },
            {
                path: 'trash',
                element: <TrashPage />,
            },
            {
                path: 'audit',
                element: <AuditPage />,
            },
            {
                path: 'governance',
                element: <GovernancePage />,
            },
            {
                path: 'observability',
                element: <ObservabilityPage />,
            },
            {
                path: 'sso-lab',
                element: <SsoLabPage />,
            },
            {
                path: '/',
                element: <Navigate to="/doc" replace />,
            },
        ],
    },
    {
        path: '/account/login',
        element: <Login />,
    },
])
