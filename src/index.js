const express = require('express');
const cors = require('cors');

const {
  CustomerController,
  ProductController,
  OrderController
} = require('./controllers');

const { PORT } = process.env;
const corsOptions = {
  origin: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const app = express();
const router = express.Router();

app.use(cors(corsOptions)).use(express.json());

router
  .get('/customers/:id', CustomerController.getCustomer)
  .post('/customers/create', CustomerController.createCustomer)
  .put('/customers/update', CustomerController.updateCustomer)
  .delete('/customers/:id', CustomerController.deleteCustomer)

  .get('/products/:id', ProductController.getProduct)
  .post('/products/create', ProductController.createProduct)
  .put('/products/update', ProductController.updateProduct)
  .delete('/products/:id', ProductController.deleteProduct)

  .get('/orders/:id', OrderController.getOrder)
  .post('/orders/create', OrderController.createOrder)
  .delete('/orders/:id', OrderController.deleteOrder);

app.use('/', router);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
