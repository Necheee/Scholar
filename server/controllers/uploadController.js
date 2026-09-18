import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

// @desc    Upload document to Cloudinary
// @route   POST /api/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }

    // Determine the folder based on the student's ID for better organization
    const folder = `scholar/students/${req.user._id}`;
    
    // We must use a stream to upload buffer from memory storage to Cloudinary
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: 'auto', // Allows both PDFs and Images
          },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req);

    res.status(201).json({
      message: 'File uploaded successfully',
      url: result.secure_url,
      cloudinaryId: result.public_id,
      format: result.format,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document from Cloudinary (e.g. when replacing a file in a draft)
// @route   DELETE /api/upload/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
  try {
    const publicId = req.params.id; // Cloudinary public_id
    // Security check: Only the uploader (student) or admin should theoretically do this.
    // In a full implementation, you would verify ownership.
    
    // We have to specify resource_type if it's a PDF ('raw' or 'image' depending on upload)
    // By default cloudinary stores PDFs as 'image' unless specified otherwise.
    await cloudinary.uploader.destroy(publicId, { invalidate: true });
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    next(error);
  }
};

