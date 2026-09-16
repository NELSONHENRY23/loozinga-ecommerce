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

  // Make sure the selected file contains actual data.
  if (file.size === 0) {
    throw new Error('The selected image is empty.');
  }
  
  // Optional: Enable an upload size limit if required.
  //const maxFileSize = 5 * 1024 * 1024;
  //
  //if (file.size > maxFileSize) {
  //  throw new Error('Image size must not exceed 5 MB.');
 // }
  
 // Debugging: Log the selected file's details for verification.
  // console.info('Selected image:', {
  //   name: file.name,
  //   size: file.size,
  //   type: file.type,
  // });
  
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

      // Debugging: Log the upload payload for verification.
      // const attachedFile = formData.get('file');

      // if (!(attachedFile instanceof File)) {
      //   throw new Error('No valid image was attached.');
      // }

      // console.info('Upload payload:', {
      //   name: attachedFile.name,
      //   size: attachedFile.size,
      //   type: attachedFile.type,
      // });

// if (attachedFile.size === 0) {
//   throw new Error('The upload payload contains an empty file.');
// }
      // Upload directly from browser
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,{
        method: 'POST',
        body: formData,
      },
    );

    const result = (await response.json()) as CloudinaryUploadResponse;
    
    // if (!response.ok) {
    //   console.error('Cloudinary upload failed:', {
    //     status: response.status,
    //     message: result.error?.message,
    //   });
    // }

    if(!response.ok || !result.secure_url || !result.public_id){
      throw new Error(result.error?.message ?? 'Cloudinary image upload failed.');
    }
   
    return {
      secureUrl: result.secure_url,
      publicId: result.public_id,
    }
}
