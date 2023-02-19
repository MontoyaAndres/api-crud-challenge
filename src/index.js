const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const swaggerDocumentationDev = require('./documentation_dev.json');
const swaggerDocumentationProd = require('./documentation_prod.json');
const {
  CustomerController,
  ProductController,
  OrderController
} = require('./controllers');

const { PORT, NODE_ENV } = process.env;
const corsOptions = {
  origin: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
const swaggerDocumentation =
  NODE_ENV === 'production'
    ? swaggerDocumentationProd
    : swaggerDocumentationDev;

const app = express();
const router = express.Router();

app.use(cors(corsOptions)).use(express.json());

router
  .get('/customers', CustomerController.getCustomer)
  .post('/customers/create', CustomerController.createCustomer)
  .put('/customers/update', CustomerController.updateCustomer)
  .delete('/customers', CustomerController.deleteCustomer)

  .get('/products', ProductController.getProduct)
  .post('/products/create', ProductController.createProduct)
  .put('/products/update', ProductController.updateProduct)
  .delete('/products', ProductController.deleteProduct)

  .get('/orders', OrderController.getOrder)
  .post('/orders/create', OrderController.createOrder)
  .delete('/orders', OrderController.deleteOrder);

app
  .use('/', router)
  .use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocumentation));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
