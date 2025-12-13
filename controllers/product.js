const multer = require('multer');
const fs = require('fs');
const path = require('path');

const cloudinary = require('cloudinary').v2;
const { uploadWithRetry } = require('../utils/cloudinaryHelper');

// Import models directly to ensure they are available
const Product = require('../models/productSchema');
const Authenticated = require('../models/authenticated');
const Category = require('../models/category');
const Manufacturer = require('../models/manufacturer');

const _ = require('lodash');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Enhanced multer configuration with file size limits and type validation
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
}).single('imageUrl');



exports.createProduct = async (req, res, next) => {
  try {
    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('Created uploads directory:', uploadsDir);
    }
    upload(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        
        // Handle specific multer errors
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            message: 'File too large. Maximum size is 10MB.',
            error: 'FILE_TOO_LARGE'
          });
        }
        
        if (err.message === 'Only image files are allowed!') {
          return res.status(400).json({ 
            message: 'Only image files are allowed.',
            error: 'INVALID_FILE_TYPE'
          });
        }
        
        return res.status(500).json({ 
          message: 'Error uploading file',
          error: err.message || 'UPLOAD_ERROR'
        });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Manufacturer will be taken from JWT token, not request body

      console.log('Uploading file to Cloudinary:', req.file.path);
      
      // Upload to Cloudinary with enhanced retry logic
      let result;
      try {
        result = await uploadWithRetry(req.file.path);
        console.log('Cloudinary upload successful:', result.secure_url);
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed:', cloudinaryError);
        
        // Clean up temporary file on error
        try {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log('Temporary file cleaned up after error:', req.file.path);
          }
        } catch (cleanupError) {
          console.warn('Failed to clean up temporary file after error:', cleanupError.message);
        }

        // Handle specific timeout errors
        if (cloudinaryError.name === 'TimeoutError' || cloudinaryError.http_code === 499) {
          return res.status(408).json({ 
            message: 'File upload timeout. Please try again with a smaller file or check your internet connection.',
            error: 'UPLOAD_TIMEOUT'
          });
        }
        
        // Handle other Cloudinary errors
        return res.status(500).json({ 
          message: 'Failed to upload image. Please try again.',
          error: cloudinaryError.message || 'CLOUDINARY_ERROR'
        });
      }

      const timestamp = new Date().getTime();
      const randomNumber = Math.floor(Math.random() * 9000) + 1000;
      const numericId = parseInt(timestamp.toString() + randomNumber.toString());

      // Use manufacturer ID from JWT token instead of request body
      console.log('JWT user object:', req.user);
      const manufacturerId = req.user?.userId;
      if (!manufacturerId) {
        console.log('No manufacturer ID found in JWT token');
        return res.status(401).json({ message: 'Authentication required - no user ID in token' });
      }

      console.log('Creating product with manufacturer from JWT:', manufacturerId);

      const product = new Product({
        productId: numericId, 
        name: req.body.name,
        description: req.body.description,
        nafdacId: req.body.nafdacId,
        quantity: req.body.quantity,
        expiryDate: req.body.expiryDate,
        barcode: req.body.barcode,
        category: req.body.category,
        manufacturer: manufacturerId, // Use JWT user ID
        imageUrl: result.secure_url
      });

      await product.save();

      const { _id, category, ...productWithoutIdAndCategory } = product.toObject();

      await Category.findOneAndUpdate(
        { _id: category },
        { $push: { products: product.productId} },
        { new: true }
      );

      // Clean up temporary file after successful upload
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
          console.log('Temporary file cleaned up:', req.file.path);
        }
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file:', cleanupError.message);
      }

      res.status(201).json({ message: 'Product created successfully', product: productWithoutIdAndCategory });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const userAgent = req.headers['user-agent'];

    console.log(`🔍 Looking for product with ID: ${productId}`);

    // Find product with manufacturer population
    const product = await Product.findOne({ productId: productId }).populate({
      path: 'manufacturer',
      select: 'name contractAddress'
    });

    if (!product) {
      // Log failed authentication attempt
      const authenticatedProduct = new Authenticated({
        product: 'Unknown Product',
        productId: productId,
        requester: userAgent,
        status: 'failed',
        manufacturer: null // No manufacturer for non-existent product
      });

      try {
        await authenticatedProduct.save();
      } catch (authError) {
        console.error('Failed to log authentication attempt:', authError);
      }

      return res.status(404).json({ message: 'Product not found' });
    }

    // Ensure manufacturer is populated
    if (!product.manufacturer) {
      console.error('Product found but manufacturer not populated:', productId);
      return res.status(500).json({ message: 'Product data incomplete - manufacturer not found' });
    }

    const manufacturerId = product.manufacturer._id;
    const productName = product.name;

    // Log successful authentication
    const authenticatedProduct = new Authenticated({
      product: productName,
      productId: productId,
      requester: userAgent,
      status: 'passed',
      manufacturer: manufacturerId 
    });

    try {
      await authenticatedProduct.save();
    } catch (authError) {
      console.error('Failed to log authentication attempt:', authError);
      // Continue with response even if logging fails
    }

    res.status(200).json({
      message: 'Product found',
      product: product,
    });
  } catch (error) {
    console.error('Error in getProduct:', error);
    
    // Handle specific Mongoose errors
    if (error.name === 'MissingSchemaError') {
      console.error('Model registration error - ensure all models are imported in app.js');
      return res.status(500).json({ 
        message: 'Database configuration error',
        error: 'MODEL_REGISTRATION_ERROR'
      });
    }
    
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'SERVER_ERROR'
    });
  }
};



exports.getCategories = async (req, res, next) => {
  try {
    const manufacturerId = req.user.userId; 

    const categories = await Category.find({ manufacturer:manufacturerId });

    res.status(200).json({ message: 'Categories retrieved', categories: categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getCategoriesFromProduct = async (req, res, next) => {
  try {
    const manufacturerId = req.user.userId;

    const products = await Product.find({ manufacturer: manufacturerId }).select('category');

    const categoryIds = [...new Set(products.map(product => product.category))];

    const categories = await Category.find({ _id: { $in: categoryIds } });

    for (let category of categories) {
      category.products = await Product.find({ category: category._id });
    }

    res.status(200).json({ message: 'Categories retrieved', categories: categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.createCategory = async (req, res, next) => {
  try {
    // Check authentication
    const manufacturerId = req.user?.userId;
    if (!manufacturerId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log('Creating category for manufacturer:', manufacturerId);
    console.log('Request body:', req.body);

    // Validate required fields
    if (!req.body.name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const categoryName = req.body.name;
    
    // Check if category already exists for this manufacturer
    const existingCategory = await Category.findOne({ 
      name: categoryName,
      manufacturer: manufacturerId 
    });

    if (existingCategory) {
      return res.status(422).json({ message: 'Category already exists for this manufacturer' });
    }

    // Create new category
    const newCategory = new Category({
      name: req.body.name,
      description: req.body.description || '',
      manufacturer: manufacturerId
    });

    const result = await newCategory.save();
    console.log('Category created successfully:', result);

    const pickedCategory = _.pick(result, ['_id', 'name', 'description']);
    res.status(201).json({ 
        message: "Category created successfully",
        category: pickedCategory
    });

  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ 
      message: 'Internal server error',
      error: err.message 
    });
  }
}


exports.getAuthenticatedProducts = async (req, res, next) => {
  try {
    const manufacturerId = req.user.userId; 

    const authenticatedProducts = await Authenticated.find({ manufacturer: manufacturerId })
    
    res.status(200).json({ message: 'Authenticated products retrieved', products: authenticatedProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getManufacturerStats = async (req, res, next) => {
  try {
    const manufacturerId = req.user.userId;

    const productCount = await Product.countDocuments({ manufacturer: manufacturerId });
    const categoryCount = await Category.countDocuments({ manufacturer: manufacturerId });
    const authCount = await Authenticated.countDocuments({ manufacturer: manufacturerId });

    res.status(200).json({
      message: 'Manufacturer statistics retrieved',
      productCount: productCount,
      categoryCount: categoryCount,
      authCount: authCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getManufacturerProducts = async (req, res, next) => {
  try {
    const manufacturerId = req.user.userId; 

    const products = await Product.find({ manufacturer: manufacturerId });

    res.status(200).json({ message: 'Manufacturer products retrieved', products: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
