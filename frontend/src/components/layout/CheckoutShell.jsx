export default function CheckoutShell({ children }) {
    return <div className="flex min-h-screen flex-col bg-bg-2 text-text">
        <main className="flex-1">{children}</main>
        <footer className="w-full bg-primary px-4 py-4 text-white sm:px-8">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-sm font-bold">Betoch</span>
                <nav aria-label="Checkout footer" className="flex flex-wrap gap-x-1.5 text-white/80">
                    <a href="/">About us</a><span>·</span><a href="/">Terms</a><span>·</span><a href="/">Privacy</a><span>·</span><a href="mailto:hello@zemenrentals.com">Help centre</a><span>·</span><a href="mailto:hello@zemenrentals.com">Contact us</a>
                </nav>
                <span>© {new Date().getFullYear()} Betoch</span>
            </div>
        </footer>
    </div>
}