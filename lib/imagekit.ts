import ImageKit from "imagekit"

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "public_BNYwK4yQqPrxchxhTXhDI1OKMGQ=",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/countryroofdata",
})

export async function getImageKitAuthenticationParameters() {
  try {
    if (!process.env.IMAGEKIT_PRIVATE_KEY) {
      console.warn("[v0] ImageKit private key not configured. Upload functionality will be limited.")
      return {}
    }
    return imagekit.getAuthenticationParameters()
  } catch (error) {
    console.error("[v0] Error getting ImageKit auth parameters:", error)
    return {}
  }
}

export async function uploadToImageKit(file: Buffer, fileName: string, folder = "countryroof"): Promise<string> {
  try {
    if (!process.env.IMAGEKIT_PRIVATE_KEY) {
      throw new Error("ImageKit private key not configured")
    }
    const response = await imagekit.upload({
      file,
      fileName,
      folder,
    })
    return response.url
  } catch (error) {
    console.error("[v0] ImageKit upload error:", error)
    throw error
  }
}

export { imagekit }
