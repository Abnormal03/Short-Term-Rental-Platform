import { Link } from 'react-router-dom'
import { ClipboardCheck, Scale, UsersRound, ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import PageShell from '../components/layout/PageShell'
import RetryButton from '../components/UI/RetryButton'
import { Spinner } from '../components/UI/Spinner'
import { propertyService } from '../features/properties/services/propertyService'
import { adminService } from '../features/admin/adminService'

const cards = [
    { key: 'properties', title: 'Listing approvals', path: '/admin/properties', icon: ClipboardCheck },
    { key: 'users', title: 'User management', path: '/admin/users', icon: UsersRound },
    { key: 'disputes', title: 'Open disputes', path: '/admin/disputes', icon: Scale },
]

export default function AdminDashboardPage() {
    const properties = useQuery({ queryKey: ['admin','pending-properties-count'], queryFn: async () => (await propertyService.getPendingProperties(1, 1)).data })
    const users = useQuery({ queryKey: ['admin','users-count'], queryFn: async () => (await adminService.getUsers(1, 1)).data })
    const disputes = useQuery({ queryKey: ['admin','disputes-count'], queryFn: async () => (await adminService.getDisputes(1, 100)).data })
    const queries = { properties, users, disputes }
    const disputeCount = disputes.data?.disputes?.length
    const counts = { properties: properties.data?.count ?? '—', users: users.data?.count ?? '—', disputes: disputeCount === 100 ? '100+' : disputeCount ?? '—' }
    return <PageShell><section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8"><p className="text-sm font-semibold uppercase tracking-wide text-primary">Admin workspace</p><h1 className="mt-1 text-3xl font-bold text-text">Dashboard</h1><p className="mt-2 text-text-2">Review listing submissions, host accounts, and booking disputes.</p><div className="mt-8 grid gap-4 md:grid-cols-3">{cards.map(({ key,title,path,icon:Icon }) => {const query=queries[key];return <article key={key} className="rounded-2xl border border-border bg-surface p-5 hover:bg-bg-2"><Link to={path} className="block"><div className="flex items-center justify-between"><Icon className="text-primary"/><ArrowRight size={17} className="text-text-2"/></div><p className="mt-5 text-sm font-semibold text-text-2">{title}</p><p className="mt-1 text-3xl font-bold text-text">{query.isLoading?<Spinner/>:query.isError?'—':counts[key]}</p></Link>{query.isError&&<div className="mt-3" role="alert"><RetryButton onRetry={query.refetch} isRetrying={query.isFetching}/></div>}</article>})}</div></section></PageShell>
}
