import { SignUp } from '@clerk/clerk-react'
import { ArrowUpRight, CheckCircle2, LockKeyhole, Moon, Sun } from 'lucide-react'
import { Link } from 'react-router-dom'
import signupImage from '../../assets/signup.jpg'
import { useTheme } from '../../store/useTheme'

const SignUpPage = () => {
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <main
            className="min-h-screen text-text lg:grid lg:grid-cols-2"
            style={{ backgroundColor: isDark ? '#071a14' : '#f8faf8' }}
        >
            <section
                aria-label="Betoch stays"
                className="relative hidden min-h-screen overflow-hidden bg-cover bg-center lg:flex"
                style={{ backgroundImage: `url(${signupImage})` }}
            >
                <div className={`absolute inset-0 ${isDark
                    ? 'bg-[linear-gradient(180deg,rgba(4,27,19,0.72)_0%,rgba(4,27,19,0.16)_48%,rgba(10,15,9,0.9)_100%)]'
                    : 'bg-[linear-gradient(180deg,rgba(13,54,87,0.62)_0%,rgba(35,91,130,0.06)_48%,rgba(44,37,18,0.58)_100%)]'}`} />
                <div className="relative z-10 flex w-full flex-col justify-between p-10 text-white xl:p-14">
                    <div>
                        <Link to="/" className="text-xl font-semibold tracking-tight text-white">Betoch</Link>
                        <p className="mt-8 max-w-md text-[clamp(1.6rem,3vw,2.5rem)] font-semibold leading-[1.08] tracking-tight">
                            Experience Ethiopia&apos;s most exclusive properties.
                        </p>
                    </div>
                    <div className="max-w-md">
                        <div className="mb-3 flex items-center gap-3">
                            <span className="h-px w-10 bg-white/60" />
                            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/85">Member exclusive</span>
                        </div>
                        <p className="text-base font-medium leading-relaxed xl:text-lg">
                            “A home away from home, refined by culture and comfort.”
                        </p>
                    </div>
                </div>
            </section>

            <section className="relative flex min-h-screen flex-col items-center justify-center px-5 py-20 sm:px-8">
                <header className="absolute inset-x-5 top-5 flex items-center justify-between sm:inset-x-8 lg:top-7">
                    <Link to="/" className="font-semibold tracking-tight text-text lg:hidden">Betoch</Link>
                    <Link to="/explore" className="ml-auto mr-3 inline-flex items-center gap-1 text-xs font-medium text-text-2 transition-colors hover:text-primary">
                        Explore <ArrowUpRight size={13} aria-hidden="true" />
                    </Link>
                    <span
                        className="mr-3 rounded-full border px-3 py-2 text-[0.68rem] font-medium text-text-2"
                        style={{ backgroundColor: isDark ? '#0b2119' : '#ffffff', borderColor: isDark ? '#234136' : '#dce4df' }}
                        aria-label="Language: English"
                    >
                        EN
                    </span>
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                        className="flex size-9 items-center justify-center rounded-full border text-text transition-colors"
                        style={{ backgroundColor: isDark ? '#0b2119' : '#ffffff', borderColor: isDark ? '#234136' : '#dce4df' }}
                    >
                        {isDark ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
                    </button>
                </header>

                <div className="w-full max-w-104">
                    <div className="mb-7 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-[1.75rem]">Create your account</h1>
                        <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-text-2 sm:text-sm">
                            Join Betoch to discover stays and book with confidence.
                        </p>
                    </div>

                    <div
                        className="rounded-2xl border p-2"
                        style={{
                            backgroundColor: isDark ? '#0b2119' : '#ffffff',
                            borderColor: isDark ? '#234136' : '#dce4df',
                            boxShadow: isDark ? '0 16px 50px rgba(0,0,0,0.2)' : '0 16px 50px rgba(15,23,42,0.08)',
                        }}
                    >
                        <SignUp
                            routing="path"
                            path="/sign-up"
                            signInUrl="/sign-in"
                            appearance={{
                                variables: {
                                    colorPrimary: isDark ? '#2d9e61' : '#1b6b45',
                                    colorBackground: isDark ? '#0b2119' : '#ffffff',
                                    colorInputBackground: isDark ? '#0b2119' : '#ffffff',
                                    colorInputText: isDark ? '#f0f4ef' : '#334155',
                                    colorText: isDark ? '#f0f4ef' : '#334155',
                                    colorTextSecondary: isDark ? '#a6b8ac' : '#64748b',
                                    colorNeutral: isDark ? '#234136' : '#e5e7eb',
                                    borderRadius: '0.75rem',
                                },
                                elements: {
                                    rootBox: 'w-full',
                                    card: 'w-full !border-0 !bg-transparent !shadow-none',
                                    headerTitle: 'hidden',
                                    headerSubtitle: 'hidden',
                                    socialButtonsBlockButton: isDark
                                        ? '!border-[#234136] !bg-[#123326] !text-[#f0f4ef] hover:!bg-[#194330]'
                                        : '!border-[#dce4df] !bg-white !text-[#26352d] hover:!bg-[#f3f6f4]',
                                    socialButtonsBlockButtonText: isDark ? '!text-[#f0f4ef]' : '!text-[#26352d]',
                                    socialButtonsProviderIcon: isDark ? '!text-[#f0f4ef]' : '!text-[#26352d]',
                                    formFieldLabel: 'text-text',
                                    formFieldInput: 'border-border bg-surface text-text',
                                    dividerLine: 'bg-border',
                                    dividerText: 'text-text-2',
                                    formButtonPrimary: 'bg-primary text-button-text hover:bg-primary/90 normal-case',
                                    footerActionText: 'text-text-2',
                                    footerActionLink: 'text-primary hover:text-primary/80',
                                    identityPreviewText: 'text-text',
                                    formResendCodeLink: 'text-primary',
                                },
                            }}
                        />
                    </div>

                    <p className="mx-auto mt-5 max-w-md text-center text-xs leading-5 text-text-2">
                        By creating an account, you agree to our <Link className="text-primary underline" to="/terms">Terms of Service</Link> and <Link className="text-primary underline" to="/privacy">Privacy Policy</Link>.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[0.58rem] font-semibold uppercase tracking-[0.11em] text-text-2 sm:gap-x-7">
                        <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={12} aria-hidden="true" /> Verified listings</span>
                        <span className="inline-flex items-center gap-1.5"><LockKeyhole size={12} aria-hidden="true" /> Secure payment</span>
                    </div>
                </div>

                <footer className="absolute bottom-5 text-center text-[0.62rem] text-text-2">
                    © {new Date().getFullYear()} Betoch
                </footer>
            </section>
        </main>
    )
}

export default SignUpPage
