export const uploadImageToCloudinary = async (imageUri: string) => {
  const cloudName = 'dy22vaz5n';
  const uploadPreset = 'vanguard_preset';
  
  const formData = new FormData();
  // En React Native, el archivo se manda como un objeto con uri, type y name
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  } as any);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    return data.secure_url; // Esta es la URL que guardaremos en la API de Azure
  } catch (error) {
    console.error("Error subiendo a Cloudinary:", error);
    throw error;
  }
};