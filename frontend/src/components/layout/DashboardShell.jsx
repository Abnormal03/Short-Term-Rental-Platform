import Footer from "./Footer";
import Navbar from "./Navbar";

export default function DashboardShell({ children }) {

    return (
        <div className="sm:grid grid-cols-5 md:gap-50 lg:gap-5 bg-bg-2">
            <Navbar />
            <div className="col-span-4 relative min-h-screen bg-bg-2">
                {children}
                <Footer />
            </div>
        </div>
    )
}
