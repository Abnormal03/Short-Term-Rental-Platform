import PageShell from '../../../components/layout/PageShell'
import Skeleton from '../../../components/UI/Skeleton'

export default function PropertyDetailsSkeleton() {
    return <PageShell>
        <div role="status" aria-label="Loading property details and booking options" className="mx-auto mt-20 w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <Skeleton className="mb-3 h-3 w-48" />
            <div className="grid h-[15rem] grid-cols-1 gap-1 overflow-hidden rounded-2xl sm:h-[20rem] md:grid-cols-2">
                <Skeleton className="hidden rounded-none sm:block" />
                <div className="grid grid-cols-2 grid-rows-2 gap-1"><Skeleton className="rounded-none" /><Skeleton className="rounded-none" /><Skeleton className="rounded-none" /><Skeleton className="rounded-none" /></div>
            </div>
            <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="space-y-8">
                    <section className="space-y-3"><Skeleton className="h-7 w-2/3" /><Skeleton className="h-4 w-40" /><Skeleton className="h-4 w-56" /></section>
                    <section className="space-y-3 border-t border-border pt-6"><Skeleton className="h-5 w-36" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-11/12" /><Skeleton className="h-3 w-3/4" /></section>
                    <Skeleton className="h-20 rounded-2xl" />
                    <section><Skeleton className="mb-4 h-5 w-44" /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-12" />)}</div></section>
                </div>
                <aside className="h-fit space-y-4 rounded-2xl border border-border bg-bg p-5 shadow-sm">
                    <Skeleton className="h-6 w-32" /><Skeleton className="h-20 rounded-xl" /><Skeleton className="h-11 rounded-lg" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-4/5" /><Skeleton className="h-12 rounded-lg" />
                </aside>
            </div>
        </div>
    </PageShell>
}
