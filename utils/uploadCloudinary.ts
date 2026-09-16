type CloudinarySignatureResponse = {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  uploadPreset: string;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  error?: {
    message?: string;
  };
};

export type UploadedCloudinaryImage = {
  secureUrl: string;

  publicId: string;
};


const allowedImageTypes = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
]

export async function uploadCloudinaryImage(
  file: File,
  productId: string,
): Promise<UploadedCloudinaryImage> {
 
  if(!allowedImageTypes.includes(file.type)){
    throw new Error(
      'Only JPG, JPEG, PNG, WEBP images are allowed.',
    )
  }

  
  // Request signed upload parameters
  const signatureResponse = await
    fetch(
      '/api/cloudinary/sign',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          productId,
        }),
      },
    );

      const signatureData =
        (await signatureResponse.json()) as |  CloudinarySignatureResponse | {message?: string};

      if (
        !signatureResponse.ok
      ) {
        throw new Error(
          'message' in signatureData
          ? signatureData.message
          : 'Could not create Cloudinary upload signature.',
        );
      }

      const {
        signature,
        timestamp,
        cloudName,
        apiKey,
        folder,
        uploadPreset,
      } = signatureData as CloudinarySignatureResponse;

      // Build Cloudinary upload request
      const formData = new FormData();

      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', String(timestamp),);
      formData.append('signature', signature,);
      formData.append('folder', folder);
      formData.append('upload_preset', uploadPreset);

      // Upload directly from browser
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,{
        method: 'POST',
        body: formData,
      },
    );

    const result = (await response.json()) as CloudinaryUploadResponse;
    
    if(!response.ok || !result.secure_url || !result.public_id){
      throw new Error(result.error?.message ?? 'Cloudinary image upload failed.');
    }
   
    return {
      secureUrl: result.secure_url,
      publicId: result.public_id,
    }
}
