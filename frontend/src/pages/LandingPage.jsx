import React from "react"
import Hero from "../features/landing/Hero"
import PageShell from "../components/layout/PageShell"
import Featured from "../features/landing/Featured"
import WhyChooseUs from "../features/landing/WhyChooseUs"
import PaymentPartners from "../features/landing/PaymentPartners"

const LandingPage = ({ children }) => {

    return (
        <PageShell>
            <div className="flex flex-col w-full">
                <Hero />
                <Featured />
                <WhyChooseUs />
                <PaymentPartners />
            </div>
        </PageShell>
    )
}

export default LandingPage