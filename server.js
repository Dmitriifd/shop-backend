import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
dotenv.config();

const port = process.env.PORT || 5000;
connectDB();
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/products', productRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
