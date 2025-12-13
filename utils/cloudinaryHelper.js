const cloudinary = require('cloudinary').v2;

/**
 * Upload file to Cloudinary with retry logic and better error handling
 * @param {string} filePath - Path to the file to upload
 * @param {object} options - Cloudinary upload options
 * @returns {Promise} - Cloudinary upload result
 */
const uploadWithRetry = async (filePath, options = {}) => {
  const defaultOptions = {
    resource_type: 'image',
    timeout: 120000, // 2 minutes
    chunk_size: 6000000, // 6MB chunks
    eager: [
      { width: 400, height: 400, crop: "pad" },
      { width: 260, height: 200, crop: "crop", gravity: "north" }
    ],
    eager_async: true,
    transformation: [
      { quality: "auto", fetch_format: "auto" }
    ],
    ...options
  };

  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Cloudinary upload attempt ${attempt}/${maxRetries} for file: ${filePath}`);
      
      const result = await cloudinary.uploader.upload(filePath, defaultOptions);
      
      console.log(`Cloudinary upload successful on attempt ${attempt}:`, result.secure_url);
      return result;
      
    } catch (error) {
      lastError = error;
      console.error(`Cloudinary upload attempt ${attempt} failed:`, error.message);
      
      // Don't retry on certain errors
      if (error.http_code === 400 || error.http_code === 401 || error.http_code === 403) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  throw lastError;
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @returns {Promise} - Cloudinary deletion result
 */
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Cloudinary file deleted:', publicId);
    return result;
  } catch (error) {
    console.error('Failed to delete file from Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  uploadWithRetry,
  deleteFile
};