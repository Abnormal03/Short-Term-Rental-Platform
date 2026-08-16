import { Modal } from "../../../components/UI/Modal"
import { Badge } from "../../../components/UI/Badge"
import { Verified } from "lucide-react"
import Button from "../../../components/UI/Botton"
import { useUser } from "@clerk/clerk-react"

const Contact = ({ showUserInfo, setShowUserInfo, property }) => {
    const { isSignedIn } = useUser();
    return (
        <Modal isOpen={showUserInfo} onClose={() => { setShowUserInfo(false) }} key={"md"}>
            <div className='w-full flex flex-col items-center gap-2'>
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 shrink-0 border">
                    <img src={property?.host?.profile_url || "https://thumbs.dreamstime.com/b/user-profile-avatar-icon-134114292.jpg"} alt={property?.host?.name || "Host"} className="w-full h-full object-cover" />
                </div>
                <Badge variant='verified' className={"text-primary"}> <Verified className='size-5' /> <p className='text-sm'>Verified</p></Badge>
                <div className='flex flex-col items-center'>
                    <p className='font-bold text-xl'>{property?.host?.name}</p>
                    {isSignedIn && <p>{property?.host?.email}</p>}
                </div>
                <div className='flex justify-evenly w-full gap-2'>
                    {isSignedIn && (
                        <>
                            <Button size='xl' onClick={() => { window.location.href = `tel:${property?.host?.phone_number}` }}>Call</Button>
                            <Button size='xl' variant='secondary' onClick={() => { window.location.href = `mailto:${property?.host?.email}` }}>Email</Button>
                        </>
                    )}                    </div>
                <p className='text-sm font-light text-center text-red-400'> <span className='font-bold'>Safety Alert:</span> Please Avoid Making Deals Aside.</p>
            </div>
        </Modal>
    )
}

export default Contact