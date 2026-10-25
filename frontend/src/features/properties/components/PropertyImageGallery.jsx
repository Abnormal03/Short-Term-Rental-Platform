import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop'

export default function PropertyImageGallery({ images = [], title }) {
    const galleryImages = images.length ? images.map((image) => image.image_url).filter(Boolean) : [FALLBACK_IMAGE]
    const mobileTrack = useRef(null)
    const touchStart = useRef(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const [lightboxIndex, setLightboxIndex] = useState(null)
    const isLightboxOpen = lightboxIndex !== null

    const moveMobileTo = (index) => {
        const nextIndex = wrapIndex(index, galleryImages.length)
        setActiveIndex(nextIndex)
        mobileTrack.current?.scrollTo({ left: nextIndex * mobileTrack.current.clientWidth, behavior: 'smooth' })
    }

    const moveLightbox = useCallback((direction) => setLightboxIndex((index) => wrapIndex(index + direction, galleryImages.length)), [galleryImages.length])

    useEffect(() => {
        if (!isLightboxOpen) return undefined
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        const onKeyDown = (event) => {
            if (event.key === 'Escape') setLightboxIndex(null)
            if (event.key === 'ArrowLeft') moveLightbox(-1)
            if (event.key === 'ArrowRight') moveLightbox(1)
        }
        window.addEventListener('keydown', onKeyDown)
        return () => {
            document.body.style.overflow = previousOverflow
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [isLightboxOpen, moveLightbox])

    const openAt = (index) => setLightboxIndex(index)

    return <>
        <section aria-label="Property photos" className="isolate overflow-hidden rounded-2xl">
            <div ref={mobileTrack} onScroll={(event) => {
                const track = event.currentTarget
                setActiveIndex(Math.round(track.scrollLeft / Math.max(track.clientWidth, 1)))
            }} className="flex snap-x snap-mandatory rounded-2xl overflow-hidden overscroll-x-contain md:hidden scrollbar-none [&::-webkit-scrollbar]:hidden">
                {galleryImages.map((src, index) => <button type="button" key={`${src}-${index}`} onClick={() => openAt(index)} aria-label={`Open photo ${index + 1} of ${galleryImages.length}`} className="relative h-76 w-full shrink-0 snap-center overflow-hidden rounded-2xl bg-linear-to-br from-primary/20 via-bg-2 to-secondary/35">
                    <img src={src} alt={`${title} photo ${index + 1}`} className="h-full w-full rounded-2xl object-cover" />
                    <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">{index + 1} / {galleryImages.length}</span>
                </button>)}
            </div>
            {galleryImages.length > 1 && <div className="flex items-center justify-center gap-3 bg-bg py-2 md:hidden">
                <button type="button" onClick={() => moveMobileTo(activeIndex - 1)} aria-label="Previous photo" className="grid size-8 place-items-center rounded-full border border-border text-text hover:bg-bg-2"><ChevronLeft size={17} /></button>
                <div className="flex items-center gap-1.5" aria-label={`Photo ${activeIndex + 1} of ${galleryImages.length}`}>
                    {galleryImages.map((_, index) => <button key={index} type="button" onClick={() => moveMobileTo(index)} aria-label={`Go to photo ${index + 1}`} aria-current={activeIndex === index ? 'true' : undefined} className={`size-2 rounded-full transition ${activeIndex === index ? 'bg-primary' : 'bg-border'}`} />)}
                </div>
                <button type="button" onClick={() => moveMobileTo(activeIndex + 1)} aria-label="Next photo" className="grid size-8 place-items-center rounded-full border border-border text-text hover:bg-bg-2"><ChevronRight size={17} /></button>
            </div>}

            <div className="relative hidden h-104 grid-cols-[1.2fr_1fr] gap-2 md:grid">
                <PhotoButton src={galleryImages[0]} title={title} index={0} onOpen={openAt} className="h-full" />
                <div className="grid grid-cols-2 grid-rows-2 gap-2">
                    {Array.from({ length: 4 }, (_, offset) => {
                        const index = offset + 1
                        const src = galleryImages[index]
                        return src
                            ? <PhotoButton key={index} src={src} title={title} index={index} onOpen={openAt} className="h-full" />
                            : <div key={index} aria-hidden="true" className="h-full rounded-xl bg-linear-to-br from-primary/10 via-bg-2 to-secondary/20" />
                    })}
                </div>
                {galleryImages.length > 1 && <button type="button" onClick={() => openAt(0)} className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg bg-bg px-3 py-2 text-xs font-semibold text-text shadow hover:bg-bg-2"><Images size={15} /> Show all {galleryImages.length} photos</button>}
            </div>
        </section>

        {isLightboxOpen && <div role="dialog" aria-modal="true" aria-label={`${title} photos`} className="fixed inset-0 z-70 flex flex-col bg-black/95 text-white" onTouchStart={(event) => { touchStart.current = event.touches[0].clientX }} onTouchEnd={(event) => {
            if (touchStart.current === null) return
            const distance = event.changedTouches[0].clientX - touchStart.current
            if (Math.abs(distance) > 45) moveLightbox(distance > 0 ? -1 : 1)
            touchStart.current = null
        }}>
            <header className="flex items-center justify-between px-4 py-4 sm:px-8">
                <p className="max-w-[70vw] truncate text-sm font-medium">{title} <span className="ml-2 text-white/60">{lightboxIndex + 1} / {galleryImages.length}</span></p>
                <button type="button" onClick={() => setLightboxIndex(null)} aria-label="Close photo viewer" className="grid size-10 place-items-center rounded-full bg-white/10 hover:bg-white/20"><X size={21} /></button>
            </header>
            <div className="flex min-h-0 flex-1 items-center justify-center gap-3 px-2 pb-6 sm:gap-8 sm:px-8">
                {galleryImages.length > 1 && <button type="button" onClick={() => moveLightbox(-1)} aria-label="Previous photo" className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:size-12"><ChevronLeft size={25} /></button>}
                <img src={galleryImages[lightboxIndex]} alt={`${title} photo ${lightboxIndex + 1}`} className="max-h-full max-w-full select-none object-contain" draggable="false" />
                {galleryImages.length > 1 && <button type="button" onClick={() => moveLightbox(1)} aria-label="Next photo" className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:size-12"><ChevronRight size={25} /></button>}
            </div>
        </div>}
    </>
}

function PhotoButton({ src, title, index, onOpen, className = '' }) {
    return <button type="button" onClick={() => onOpen(index)} aria-label={`Open photo ${index + 1}`} className={`relative block w-full overflow-hidden rounded-xl bg-linear-to-br from-primary/20 via-bg-2 to-secondary/35 ${className}`}>
        <img src={src} alt={`${title} photo ${index + 1}`} className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]" />
    </button>
}

function wrapIndex(index, length) {
    return ((index % length) + length) % length
}
