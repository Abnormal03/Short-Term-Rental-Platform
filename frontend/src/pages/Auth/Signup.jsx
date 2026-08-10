import { SignUp } from '@clerk/clerk-react'
import React from 'react'
import signupImage from '../../assets/signup.jpg'

const SignUpPage = () => {
    return (
        <div className="flex min-h-screen">
            {/* Left side: Image and overlay */}
            <div className="hidden lg:flex w-1/2 relative bg-cover bg-center" style={{ backgroundImage: `url(${signupImage})` }}>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 flex flex-col justify-between p-16 w-full text-white">
                    <div>
                        <h1 className="text-2xl font-semibold mb-4">Zemen</h1>
                        <p className="text-xl max-w-md font-light leading-relaxed">
                            Experience Ethiopia's most exclusive<br/>property portfolio.
                        </p>
                    </div>
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-px w-12 bg-white/70"></div>
                            <span className="uppercase tracking-widest text-sm font-medium text-white/90">Member Exclusive</span>
                        </div>
                        <p className="text-xl max-w-md leading-relaxed">
                            "A home away from home, refined by culture and comfort."
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side: Clerk Component */}
            <div className="flex-1 flex flex-col items-center justify-center bg-white p-8">
                <SignUp 
                    appearance={{
                        elements: {
                            formButtonPrimary: 'bg-[#0f4c3a] hover:bg-[#0c3e2f] text-sm normal-case',
                            card: 'shadow-none',
                        }
                    }}
                />
                
                {/* Footer info as seen in the screenshot */}
                <div className="mt-8 flex items-center justify-center gap-8 text-xs text-gray-400 font-medium">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        CURATED LISTINGS
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        SECURE PAYMENT
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignUpPage