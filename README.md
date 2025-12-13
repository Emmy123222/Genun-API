# 🚀 Genun API Backend

Complete Node.js/Express API backend for the Genun System - a blockchain-based product authentication platform.

## ✨ Features

- 🔐 **JWT Authentication System** (Login/Register/Email Verification)
- 📦 **Product Management** with blockchain integration
- 🏷️ **Category Management System**
- 📧 **Email Verification** with Nodemailer
- 🖼️ **Image Upload** with Cloudinary integration
- 🛡️ **Security** with bcrypt password hashing
- 🌐 **CORS** configured for frontend integration
- 📊 **MongoDB** database with Mongoose ODM

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **Image Storage**: Cloudinary
- **Email**: Nodemailer (Gmail SMTP)
- **Validation**: Joi + express-validator

## 🚀 Quick Deploy

### Deploy on Render (Recommended)
1. Fork this repository
2. Connect to [Render](https://render.com)
3. Create new Web Service
4. Connect your GitHub repo
5. Set environment variables (see below)
6. Deploy!

### Deploy on Railway
1. Connect to [Railway](https://railway.app)
2. Deploy from GitHub
3. Add environment variables
4. Deploy automatically

### Deploy on Heroku
1. Install Heroku CLI
2. `heroku create your-app-name`
3. Set environment variables
4. `git push heroku main`

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database (MongoDB Atlas recommended)
MONGO_URI=enter

# JWT Secret
POos_jwtPrivateKey=your-super-secret-jwt-key

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com

# Email (Gmail SMTP)
HOST_ADDRESS=your-email@gmail.com
HOST_PASSWORD=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server
PORT=3002
NODE_ENV=production
```

## 📋 Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Emmy123222/Genun-API.git
   cd Genun-API
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔗 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `GET /api/verify-email/:token` - Email verification

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category

## 🧪 Testing

Run tests:
```bash
npm test
npm run test-product
```

## 📦 Production Deployment

The API is configured for production deployment with:
- Environment-based port configuration
- CORS setup for multiple domains
- MongoDB Atlas integration
- Cloudinary for image storage
- Email verification system

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, email emmanuelogheneovo17@gmail.com or create an issue on GitHub.