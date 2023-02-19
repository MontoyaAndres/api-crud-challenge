const { prisma } = require('../../prisma');

const getOrder = async (request, response) => {
  try {
    const id = Number(request.query?.id);
    let res;

    if (!id) {
      const { value } = request.query;

      res = await prisma.order.findMany({
        where: {
          OR: [
            {
              date: {
                lte:
                  new Date(value).toString() !== 'Invalid Date'
                    ? new Date(value)
                    : undefined
              }
            },
            {
              paymentType: {
                equals:
                  new Date(value).toString() === 'Invalid Date'
                    ? value
                    : undefined
              }
            }
          ]
        },
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
    } else {
      res = await prisma.order.findFirst({
        where: {
          OR: [{ id }, { idNumber: id }]
        },
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
    }

    if (!res) throw new Error('Order not found');

    if (!res?.total && res?.products) {
      const total = res.products
        .map(values => values?.quantity * values?.product?.price || 0)
        .reduce((a, b) => a + b, 0);

      res = {
        ...res,
        total
      };
    } else if (Array.isArray(res)) {
      res = res.map(values => {
        const total = values.products
          .map(values => values?.quantity * values?.product?.price || 0)
          .reduce((a, b) => a + b, 0);

        return {
          ...values,
          total
        };
      });
    }

    response.json(res || {});
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
    const orderResponse = await prisma.order.create({
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
      id: orderResponse.id,
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
    const id = Number(request.query?.id);

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
