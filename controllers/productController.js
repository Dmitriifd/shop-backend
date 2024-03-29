import path from 'path';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/productModel.js';

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = process.env.PAGINATION_LIMIT || 10;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

const getProductsByCategory = asyncHandler(async (req, res) => {
  const pageSize = process.env.PAGINATION_LIMIT || 10;
  const page = Number(req.query.pageNumber) || 1;

  const category = req.params.category;
  const keyword = category
    ? {
        category: category,
      }
    : {};

  // Находим минимальную и максимальную стоимость товаров в данной категории
  const minMaxPrice = await Product.aggregate([
    { $match: { ...keyword } },
    {
      $group: {
        _id: null,
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);

  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  if (products.length === 0) {
    res.status(404);
  }

  res.json({
    products,
    category,
    page,
    pages: Math.ceil(count / pageSize),
    minPrice: minMaxPrice.length > 0 ? minMaxPrice[0].minPrice : null,
    maxPrice: minMaxPrice.length > 0 ? minMaxPrice[0].maxPrice : null,
  });
});

/**
 * @desc    Get product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    return res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

/**
 * @desc   Create a product
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock, colors, char, year } = req.body;
  const product = new Product({
    name,
    price,
    user: req.user._id,
    image,
    brand,
    category,
    countInStock,
    numReviews: 0,
    description,
    colors,
    char,
    year,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock, colors, char, year } =
    req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.brand = brand;
    product.category = category;
    product.countInStock = countInStock;
    product.colors = colors;
    product.char = char;
    product.year = year;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    const __dirname = path.resolve();
    if (product.image.startsWith('/uploads')) {
      const filePath = path.join(__dirname, product.image);
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    }
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

/**
 * @desc    Create new review
 * @route   POST /api/products/:id/reviews
 * @access  Private
 */
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString(),
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

/**
 * @desc    Get top rated products
 * @route   GET /api/products/top
 * @access  Public
 */
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);

  res.json(products);
});

/**
 * @desc    Get all brands
 * @route   GET /api/products/brands
 * @access Public
 */
const getAllBrands = asyncHandler(async (req, res) => {
  const brands = await Product.aggregate([
    { $group: { _id: '$brand' } },
    { $project: { _id: 0, brand: '$_id' } },
  ]);

  const brandNames = brands.map((brand) => brand.brand).sort();

  res.json(brandNames);
});

/**
 * @desc    Get all colors
 * @route   GET /api/products/colors
 * @access Public
 */
const getAllColors = asyncHandler(async (req, res) => {
  const colors = await Product.aggregate([
    { $unwind: '$colors' },
    { $group: { _id: '$colors' } },
    { $project: { _id: 0, color: '$_id' } },
  ]);

  const colorNames = colors.map((color) => color.color);

  res.json(colorNames);
});

/**
 * @desc    Get all years
 * @route   GET /api/products/years
 * @access Public
 */
const getAllYears = asyncHandler(async (req, res) => {
  const years = await Product.aggregate([
    { $match: { year: { $ne: null } } },
    { $group: { _id: '$year' } },
    { $project: { _id: 0, year: '$_id' } },
  ]);

  const yearNames = years.map((year) => year.year);

  res.json(yearNames);
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getProductsByCategory,
  getAllBrands,
  getAllColors,
  getAllYears,
};
