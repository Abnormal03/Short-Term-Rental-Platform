const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export async function uploadPropertyImage(file) {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error('Image uploads are not configured. Set the Cloudinary cloud name and unsigned upload preset in the frontend environment.')
    }

    const body = new FormData()
    body.append('file', file)
    body.append('upload_preset', UPLOAD_PRESET)
    body.append('folder', 'properties')

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body,
    })
    const result = await response.json()

    if (!response.ok) {
        throw new Error(result.error?.message || 'Cloudinary could not upload this image.')
    }

    return result.secure_url
}
