const { prisma } = require('../../prisma');

const getOrder = async (request, response) => {
  try {
    const id = Number(request.params?.id);

    if (!id) throw new Error('ID not valid');

    const getResponse = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        shippingAddress: true,
        products: {
          include: {
            product: true
          }
        }
      }
    });

    if (!getResponse) throw new Error('Order not found');

    response.json(getResponse);
  } catch (error) {
    console.error(error);
    response.status(400).json({ error: error.message });
  }
};

const createOrder = async (request, response) => {
  try {
    if (!request.body) {
      throw new Error('Not body defined');
    }

    const {
      customerId,
      shippingAddressId,
      products,
      date,
      paymentType,
      total = null,
      idNumber = null
    } = request.body;

    if (!products || products?.length === 0)
      throw new Error('You have to add products');

    const customerExists = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customerExists) throw new Error('Customer not found');

    const shippingAddressExists =
      await prisma.shippingAddressesOnCustomers.findUnique({
        where: {
          customerId_shippingAddressId: {
            customerId,
            shippingAddressId
          }
        }
      });

    if (!shippingAddressExists) throw new Error('Shipping address not found');

    const productsIds = products
      .map(product => product?.id)
      .filter(product => product !== undefined);

    if (!productsIds?.length === 0) return;

    const productsExists = await prisma.product.findMany({
      where: {
        id: { in: productsIds }
      }
    });

    if (productsExists?.length !== productsIds?.length)
      throw new Error('Products not found');

    const productsCreate = products.map(product => ({
      productId: Number(product.id),
      quantity: Number(product.quantity)
    }));
    await prisma.order.create({
      data: {
        date: new Date(date),
        paymentType,
        total,
        idNumber,
        customerId,
        shippingAddressId,
        products: {
          create: productsCreate
        }
      }
    });

    response.json({
      customerId,
      shippingAddressId,
      products,
      date,
      paymentType,
      total,
      idNumber
    });
  } catch (error) {
    console.error(error);
    response.status(400).json({ error: error.message });
  }
};

const deleteOrder = async (request, response) => {
  try {
    const id = Number(request.params?.id);

    if (!id) throw new Error('ID not valid');

    const productsFromOrder = await prisma.productsOnOrders.findMany({
      where: {
        orderId: id
      }
    });

    if (productsFromOrder?.length > 0) {
      await Promise.all(
        productsFromOrder.map(async values => {
          return await prisma.productsOnOrders.delete({
            where: {
              orderId_productId: {
                orderId: id,
                productId: values.productId
              }
            }
          });
        })
      );
    }

    await prisma.order.delete({
      where: { id }
    });

    return response.json({ id });
  } catch (error) {
    console.error(error);
    response.status(400).json({ error: error.message });
  }
};

const OrderController = {
  createOrder,
  getOrder,
  deleteOrder
};

module.exports = { OrderController };
