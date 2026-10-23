export function getPaymentRetryDetails(booking, clerkUser, profilePhone) {
    let savedDetails = {}
    try {
        const raw = window.sessionStorage.getItem(`betoch:payment-retry:${booking.booking_id}`)
        if (raw) savedDetails = JSON.parse(raw)
    } catch {
        // Browser storage may be unavailable; fall back to the guest profile.
    }

    const storedName = String(booking.user?.name || [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || '').trim().split(/\s+/)
    return {
        email: savedDetails.email || booking.user?.email || clerkUser?.primaryEmailAddress?.emailAddress || '',
        first_name: savedDetails.first_name || storedName[0] || '',
        last_name: savedDetails.last_name || storedName.slice(1).join(' '),
        phone_number: savedDetails.phone_number || booking.user?.phone_number || clerkUser?.primaryPhoneNumber?.phoneNumber || profilePhone || '',
    }}