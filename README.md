# E-Commerce Shopping App

A Node.js REST API for e-commerce with a Handlebars.js frontend.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/zachhallare/ecommerce-shopping-app.git
cd ecommerce-shopping-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your configuration:
```env
MONGO_URL=your_mongodb_connection_string
PORT=5000
JWT_SEC=your_jwt_secret
PASS_SEC=your_password_encryption_secret
```

4. Start the server:
```bash
npm start
```

5. Open your browser and navigate to `http://localhost:5000`

## Features

### Backend API
- **Authentication**: Register and login with JWT tokens
- **Products**: Full CRUD operations (admin only for create/update/delete)
- **Users**: User management (admin only)
- **Carts**: Shopping cart functionality
- **Orders**: Order management

### Frontend (Handlebars.js)
- **Product Listing**: View all products in a responsive grid
- **Product Details**: Click to view detailed product information
- **Admin Dashboard**: Login to access CRUD operations
- **Modern UI**: Dark mode support, smooth animations, responsive design

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | Admin | Get all products |
| GET | `/api/products/find/:id` | None | Get single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |

## Frontend Structure

```
public/
├── index.html      # Main HTML with Handlebars templates
├── css/
│   └── styles.css  # Modern CSS styling
└── js/
    └── app.js      # API integration & Handlebars rendering
```

## Usage

1. **View Products**: The homepage displays all products (requires admin login to load list)
2. **Login**: Click "Login" and enter admin credentials
3. **Add Product**: After login, click "Add Product" button
4. **Edit Product**: Click "Edit" on any product card
5. **Delete Product**: Click "Delete" and confirm
6. **View Details**: Click "View" to see full product details

## License

ISC