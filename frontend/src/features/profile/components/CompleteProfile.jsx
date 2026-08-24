import { useEffect, useState } from 'react'
import { ArrowRight, LockKeyhole, Phone, Search, School } from 'lucide-react'
import Button from '../../../components/UI/Botton'
import useProfileUpdate from '../hooks/useProfileUpdate';
import { useNavigate } from 'react-router-dom';

export function CompleteProfileForm() {
    const [role, setRole] = useState('GUEST');
    const [phoneNumber, setPhoneNumber] = useState("");
    const [numberError, setNumberError] = useState("");
    const navigate = useNavigate()

    const [redirecting, setRedirecting] = useState(false);

    const { mutate: updateProfile, isPending: updating, error: updateError } = useProfileUpdate();
    const handleSubmit = () => {
        if (!phoneNumber) {
            setNumberError("Legit and Working Phone Number is needed for contact!");
            return;
        }
        updateProfile(
            {
                phoneNumber,
                role
            }
            , {
                onSuccess: () => {
                    setRedirecting(true);
                    navigate('/');
                }
            })

    }

    return (
        <section className="mx-auto mt-10 sm:mt-20 mb-18 w-[min(calc(100%-2rem),40rem)] rounded-[1.55rem]  bg-bg px-5 py-9 shadow-[0_1.25rem_2.5rem_var(--bg-2)] sm:px-13 sm:py-13" aria-labelledby="profile-title">
            <div className="text-center">
                <h1 id="profile-title" className="text-balance text-[clamp(2rem,4vw,2.35rem)] font-bold leading-[1.15] tracking-[-0.04em] text-text">Complete Your Profile</h1>
                <p className="mt-3.5 mb-9 text-pretty text-[1.06rem] leading-relaxed text-app-text/50">Just a few more details to get you started on Zemen.</p>
            </div>

            <form className="grid gap-8.5" onSubmit={(event) => event.preventDefault()}>
                <div>
                    <div className="mb-2.5 flex items-center justify-between text-[0.95rem] font-bold text-app-text/80">
                        <label htmlFor="phone">Phone Number</label>
                        <span className="font-normal text-red-400">*Required</span>
                    </div>
                    <div className="flex h-[3.7rem] items-center border gap-3 rounded-[0.8rem] bg-bg-2 px-4 text-app-text/50">
                        <Phone size={22} strokeWidth={2} aria-hidden="true" />
                        <input id="phone" name="phone" type="tel" placeholder="09 / 07 00 000 000" aria-required="true" className="w-full bg-transparent text-[1.05rem] text-app-text outline-none placeholder:text-app-text/50" onFocus={() => { setNumberError("") }} value={phoneNumber} onChange={(e) => { setPhoneNumber(e.target.value) }} />
                    </div>
                </div>

                <fieldset className="min-w-0 border-0 p-0">
                    <legend className="mb-4 text-[0.95rem] font-bold text-app-text">Primary Role</legend>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <RoleCard selected={role === 'GUEST'} onSelect={() => setRole('GUEST')} icon={<Search size={24} strokeWidth={2} />} title="Guest" description="I want to find and book properties" iconClass="bg-secondary text-primary" />
                        <RoleCard selected={role === 'HOST'} onSelect={() => setRole('HOST')} icon={<School size={24} strokeWidth={2} />} title="Host" description="I want to list and manage my properties" iconClass="bg-primary text-secondary" />
                    </div>
                </fieldset>

                {numberError && <p className='text-sm sm:-mb-10 text-center text-red-400'>{numberError}</p>}
                {updateError && <p className='text-sm sm:-mb-10 text-center text-red-400'>{updateError.response?.data?.message || updateError.cause}</p>}
                <Button className={"flex gap-5 justify-center shadow-2xl"} size='wide' onClick={handleSubmit}>Finish Setup <ArrowRight size={24} strokeWidth={2.2} aria-hidden="true" /></Button>
                <p className="mt-0 flex items-center justify-center gap-2.5 text-center text-[0.9rem] text-app-text/50"><LockKeyhole size={16} strokeWidth={1.8} aria-hidden="true" /> Your information is secure and encrypted.</p>
            </form>
        </section>
    )
}

function RoleCard({ selected, onSelect, icon, title, description, iconClass }) {
    return (
        <button className={`flex min-h-50 flex-col items-start gap-1.5 rounded-2xl border-2 p-6.5 text-left transition-colors ${selected ? 'border-primary bg-bg-2' : 'border-app-text/10 bg-bg'}`} type="button" onClick={onSelect} aria-pressed={selected}>
            <span className="mb-2.5 flex w-full items-center justify-between">
                <span className={`grid size-11 place-items-center rounded-full ${iconClass}`} aria-hidden="true">{icon}</span>
                <span className={`grid size-6.5 place-items-center rounded-full border-2 ${selected ? 'border-primary bg-primaborder-primary shadow-[inset_0_0_0_4px_var(--profile-card)]' : 'border-app-text/50'}`} aria-hidden="true" />
            </span>
            <span className="text-[1.7rem] font-bold tracking-[-0.03em] text-app-text">{title}</span>
            <span className="max-w-52 text-[1.05rem] leading-[1.35] text-app-text/50">{description}</span>
        </button>
    )
}

export default CompleteProfileForm
