import { useState } from "react";
import { Modal } from "../../../components/UI/Modal";
import { Smartphone, Wallet, Landmark, Banknote, Lock } from "lucide-react";
import Button from "../../../components/UI/Botton";
import { useUser } from "@clerk/clerk-react";
import { NavLink } from "react-router-dom";
import { Spinner } from "../../../components/UI/Spinner";
import useInitializeBooking from "../../booking/hooks/useInitializeBooking";
import useUserStore from "../../../store/useUser";

const PaymentMethods = ({ paymentMethods, setPaymentMethods, checkIn, checkOut, total, propertyId }) => {
    const { isSignedIn, user } = useUser();
    const { phoneNumber } = useUserStore();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('telebirr');
    const [loginError, setLoginError] = useState(false);
    const [tried, setTried] = useState(false);

    // Call the mutation hook at the top level
    const { mutate: initializeBooking, isPending: isInitializing, error: chapaError } = useInitializeBooking();

    const confirmBooking = () => {
        if (!isSignedIn) {
            setLoginError(true);
            setPaymentMethods(false);
            return;
        }
        setTried(true);
        if (!phoneNumber || !user?.primaryEmailAddress?.emailAddress) {
            setLoginError(true);
            setPaymentMethods(false);
            return;
        }

        initializeBooking(
            {
                booking: {
                    checkInDate: new Date(checkIn),
                    checkOutDate: new Date(checkOut),
                    totalPrice: Number(total),
                    paymentMethod: selectedPaymentMethod,
                },
                paymentDetails: {
                    price: Number(total),
                    email: user?.primaryEmailAddress?.emailAddress,
                    first_name: user?.firstName,
                    last_name: user?.lastName,
                    phone_number: phoneNumber,
                },
                propertyId,
            }, {
            onSuccess: (data) => {
                setPaymentMethods(false);
                const checkoutUrl = data?.checkout_url;

                if (checkoutUrl?.startsWith("https://")) {
                    window.location.href = checkoutUrl;
                } else {
                    setLoginError(false);
                }
            },
        }
        );
    };

    return (
        <>
            {loginError && (
                <Modal isOpen={loginError} onClose={() => setLoginError(false)}>
                    <div className="text-center flex flex-col gap-5">
                        <p>You Must Login and Fill Out Your Information Before Booking!</p>
                        <NavLink to={'/sign-in'}><Button size="md">Login</Button></NavLink>
                    </div>
                </Modal>
            )}

            <Modal isOpen={paymentMethods} onClose={() => { setPaymentMethods(false); setTried(false) }}>
                <div className='w-full max-w-md mx-auto'>
                    <div className='flex gap-3 items-center mb-6'>
                        <Wallet className='text-primary size-7' />
                        <h2 className='font-bold text-2xl text-gray-900'>Payment Method</h2>
                    </div>

                    <div className='flex flex-col gap-4'>
                        {/* Telebirr */}
                        <div
                            className={`w-full border p-4 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${selectedPaymentMethod === 'telebirr' ? 'border-primary bg-[#f4f7fc]' : 'border-gray-200 hover:border-primary/50'}`}
                            onClick={() => setSelectedPaymentMethod('telebirr')}
                        >
                            <div className='flex items-center gap-4'>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPaymentMethod === 'telebirr' ? 'border-primary' : 'border-gray-300'}`}>
                                    {selectedPaymentMethod === 'telebirr' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                </div>
                                <span className='font-medium text-lg text-gray-900'>Telebirr</span>
                            </div>
                            <div className='bg-[#e8ecef] p-2 rounded-lg text-primary'>
                                <Smartphone className='size-5' />
                            </div>
                        </div>

                        {/* CBE Birr */}
                        <div
                            className={`w-full border p-4 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${selectedPaymentMethod === 'cbe' ? 'border-primary bg-[#f4f7fc]' : 'border-gray-200 hover:border-primary/50'}`}
                            onClick={() => setSelectedPaymentMethod('cbe')}
                        >
                            <div className='flex items-center gap-4'>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPaymentMethod === 'cbe' ? 'border-primary' : 'border-gray-300'}`}>
                                    {selectedPaymentMethod === 'cbe' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                </div>
                                <span className='font-medium text-lg text-gray-900'>CBE Birr</span>
                            </div>
                            <div className='bg-[#e8ecef] p-2 rounded-lg text-primary'>
                                <Landmark className='size-5' />
                            </div>
                        </div>

                        {/* Bank Transfer */}
                        <div
                            className={`w-full border p-4 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${selectedPaymentMethod === 'bank_transfer' ? 'border-primary bg-[#f4f7fc]' : 'border-gray-200 hover:border-primary/50'}`}
                            onClick={() => setSelectedPaymentMethod('bank_transfer')}
                        >
                            <div className='flex items-center gap-4'>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPaymentMethod === 'bank_transfer' ? 'border-primary' : 'border-gray-300'}`}>
                                    {selectedPaymentMethod === 'bank_transfer' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                </div>
                                <span className='font-medium text-lg text-gray-900'>Bank Transfer</span>
                            </div>
                            <div className='bg-[#e8ecef] p-2 rounded-lg text-primary'>
                                <Banknote className='size-5' />
                            </div>
                        </div>
                    </div>

                    {(chapaError && tried) && (
                        <p className="text-red-500 text-sm mt-2 text-center">{chapaError?.response?.data?.message || chapaError?.message}</p>
                    )}

                    <div className='mt-8'>
                        <Button
                            className="w-full flex items-center justify-center gap-2 py-4"
                            size="xl"
                            onClick={confirmBooking}
                            disabled={isInitializing}
                        >
                            {isInitializing ? <Spinner size="sm" /> : <><Lock className="size-5" /> Pay {"&"} Confirm Booking</>}
                        </Button>
                    </div>
                </div>
                <p className="text-center text-sm font-light mt-1">This is only for demonstration purpose.</p>
            </Modal>
        </>
    );
};

export default PaymentMethods;