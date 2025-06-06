// server.js - Starter Express server for Week 2 assignment

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const apiKey = process.env.API_KEY;

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class ValidatonError extends Error{
    constructor(message, details = {}) {
      super(message);
      this.name = 'ValidationError';
      this.statusCode = 400;
      this.details = details; // Optional for more detailed validationerrors
  }
}

//Resquest Logging Middleware
 
const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next(); // Pass controll to the next middleware/ route handler

};

//Authentication middleware
//For demonstration , a simple API key cache. in a real app, this eould be mpre robust.
const authenticateApiKey =((req, res, next) => {
    const requestApiKey = req.headers['x-api-key'] || req.query.api_key;
    if (requestApiKey !== apiKey) {
        return res.status(401).json({error:'Unauthorized'});
    }
    next();
});
 
app.get('/protected', authenticateApiKey, (req, res) => {
  res.json({ message: 'This is a protected route!' });
});

// Validation middleware for products creation and updates

const validateProduct = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {  
    return next(new ValidationError('Product name is required and must be a non-empty string.'));
  }
  if ( typeof price !== 'number' || price <= 0) {
    return next(new ValidationError('Product price must be a positive number.'));
  }
  if (typeof !category || typeof category !== 'string' || category.trim() === '') {
    return next(new ValidationError('Product category is required and must be a non-empty string.'));
  }
  if (typeof description && typeof description !== 'string') {
    return next(new ValidationError('Product description must be a string if provided.'));
  }
  if (typeof inStock !== undefined && typeof inStock !== 'undefined') {
    return next(new ValidationError('Product inStock must be a boolean if provided'));
  }
  next(); 
};

// Middleware setup
app.use(bodyParser.json()); // Implement middleware to parse JSON request bodies
app.use(requestLogger); //  custom Logger middleware



// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  },
  {
        id: '4',
        name: 'Desk Chair',
        description: 'Ergonomic office chair',
        price: 250,
        category: 'furniture',
        inStock: true
    },
    {
        id: '5',
        name: 'External Hard Drive',
        description: '1TB portable SSD',
        price: 100,
        category: 'electronics',
        inStock: true
    },
    {
        id: '6',
        name: 'Blender',
        description: 'High-speed blender for smoothies',
        price: 70,
        category: 'kitchen',
        inStock: true
    },
    {
        id: '7',
        name: 'Keyboard',
        description: 'Mechanical gaming keyboard',
        price: 90,
        category: 'electronics',
        inStock: false
    }
];


// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});

// TODO: Implement the following routes:
// GET /api/products - Get all products
// GET /api/products/:id - Get a specific product
// POST /api/products - Create a new product
// PUT /api/products/:id - Update a product
// DELETE /api/products/:id - Delete a product

// Example route implementation for GET /api/products
app.get('/api/products', authenticateApiKey, (req, res, next) => {
  try {
    let filteredProducts = [...products];

    // Implement query parameters for filtering by category and inStock
    const { category, page, limit } = req.query;

    if (category) {
      filteredPoroducts = this.filteredProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // Add pagination support for the product listing endpoint
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || products.length;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    res.json({
      page: pageNum,
      limit: limitNum,
      totalProducts: filteredProducts.length,
      products: paginatedProducts
    });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }

});
// GET /api/products/:id - Get a specific product
app.get('/api/products/:id', authenticateApiKey, (req, res, next) => {
  try{
       const product = product.find(p => p.id === req.params.id);
       if (!product) {
         throw new NotFoundError(`Product with ID ${req.params.id} not found.`);
       }
       res.json(product);
    } catch (error) {
      next(error);
    }
  });

  // POST /api/products - Create a new product

  app.post('/api/products', authenticateApiKey, validateProduct, (req, res, next) => {
      try{
        const { name, description, price, category, inStock } = req.body;
        const newProduct = {
          id: uuidv4(), // Generate a unique ID
          name,
          description: description || '', // Default empty string if not provided
          price,
          category,
          inStock: typeof inStock === 'boolean' ? inStock : true // Default to true if not provided
        };
        product.push(newProduct);
        res.status(201).json(newProduct); // 201 Created status

      } catch (error) {
           next(error);
        }
  });

  // DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id', authenticateApiKey, (req, res, next) => {
    try {
        const initialLength = products.length;
        products = products.filter(p => p.id !== req.params.id);

        if (products.length === initialLength) {
            throw new NotFoundError(`Product with ID ${req.params.id} not found.`);
        }
        res.status(204).send(); // 204 No Content status for successful deletion
    } catch (error) {
        next(error); // Pass any errors to the error handling middleware
    }
});

 app.get('/api/products/search', authenticateApiKey, ( req, res, next)=> {
  try{
    const searchTerm = req.query.q;
    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') {
      throw new ValidatonError('Search query (q) parameter is required.');
    }

    const matchingProducts = products.filter(p =>
      p.name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
      (p.description && p.description.toLocaleLowerCase().includes(searchTerm.toLowerCase()))
    );
    res.json(matchingProducts);
  } catch (error) {
    next(error);
  }
 }); 

 //implement route for getting product statistics (e.g .., count by category)
app.get('/api/products/stats', authenticateApiKey, (req, res, next) => {
    try {
        const stats = products.reduce((acc, product) => {
            acc[product.category] = (acc[product.category] || 0) + 1;
            return acc;
        }, {});
        res.json(stats);
    } catch (error) {
        next(error);
    }
});

// global Error Handling Middleware --
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Determine status code and  message based on error type
  if (err instanceof NotFoundError) {
    return res.status(err.statusCode).json({message:err.message});
  }
  if (err instanceof ValidationError){
    return res.status(err.statusCode).json({message: err.message, details: err.details});
  }
  // Default to 500 Internal Server Error for unhandled errors
  res.status(500).json({message:'Internal Server Error'});
});

// TODO: Implement custom middleware for:
// - Request logging
// - Authentication
// - Error handling

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API Key for testing: my-secret-api-key (use in x-api-key header)`);
});

// Export the app for testing purposes
module.exports = app; 