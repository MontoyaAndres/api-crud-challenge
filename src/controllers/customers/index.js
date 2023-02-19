const { prisma } = require('../../prisma');

const getCustomer = async (request, response) => {
  try {
    const id = Number(request.query?.id);

    if (!id) {
      const { value } = request.query;

      const searchResponse = await prisma.customer.findMany({
        where: {
          OR: [
            {
              name: {
                search: value.replace(/[\s\n\t]/g, ' & ')
              }
            },
            {
              phone: {
                search: value.replace(/[\s\n\t]/g, ' & ')
              }
            },
            {
              email: {
                search: value.replace(/[\s\n\t]/g, ' & ')
              }
            }
          ]
        }
      });

      return response.json(searchResponse);
    }

    const getResponse = await prisma.customer.findUnique({
      where: { id },
      include: {
        shippingAddresses: {
          include: {
            shippingAddress: true
          }
        }
      }
    });

    if (!getResponse) throw new Error('User not found');

    response.json(getResponse);
  } catch (error) {
    console.error(error);
    response.status(400).json({ error: error.message });
  }
};

const createCustomer = async (request, response) => {
  try {
    if (!request.body) {
      throw new Error('Not body defined');
    }

    const { name, phone, email, shippingAddress } = request.body;

    const createResponse = await prisma.customer.create({
      data: {
        name,
        phone,
        email,
        shippingAddresses: {
          create: [
            {
              status: shippingAddress?.status,
              shippingAddress: {
                create: {
                  city: shippingAddress.city,
                  country: shippingAddress.country,
                  state: shippingAddress.state,
                  street: shippingAddress.street,
                  zipCode: shippingAddress?.zipCode
                }
              }
            }
          ]
        }
      }
    });

    if (!createResponse?.id) throw new Error('Customer not created');

    response.json({
      id: createResponse?.id,
      name,
      phone,
      email,
      shippingAddress
    });
  } catch (error) {
    console.error(error);
    response.status(400).json({ error: error.message });
  }
};

const updateCustomer = async (request, response) => {
  try {
    if (!request.body) {
      throw new Error('Not body defined');
    }

    const { name, phone, email, shippingAddresses } = request.body;
    const customerId = Number(request.body?.id);

    if (!customerId) throw new Error('ID not valid');

    const updateResponse = await prisma.customer.update({
      data: {
        name,
        phone,
        email
      },
      where: { id: customerId }
    });

    if (!updateResponse) throw new Error('Not customer updated');

    if (shippingAddresses?.length > 0) {
      await Promise.all(
        shippingAddresses.map(async shippingAddress => {
          if (shippingAddress?.id) {
            let id = Number(shippingAddress?.id);

            if (!id) return;

            await prisma.shippingAddressesOnCustomers.update({
              where: {
                customerId_shippingAddressId: {
                  customerId,
                  shippingAddressId: id
                }
              },
              data: {
                status: shippingAddress?.status || null,
                shippingAddress: {
                  update: {
                    street: shippingAddress.street,
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    country: shippingAddress.country,
                    zipCode: shippingAddress?.zipCode
                  }
                }
              }
            });
          } else {
            await prisma.shippingAddressesOnCustomers.create({
              data: {
                status: shippingAddress?.status || null,
                customer: {
                  connect: {
                    id: customerId
                  }
                },
                shippingAddress: {
                  create: {
                    street: shippingAddress.street,
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    country: shippingAddress.country,
                    zipCode: shippingAddress?.zipCode
                  }
                }
              }
            });
          }
        })
      );
    }

    return response.json({ name, phone, email, shippingAddresses });
  } catch (error) {
    console.error(error);
    response.status(400).json({ error: error.message });
  }
};

const deleteCustomer = async (request, response) => {
  try {
    const id = Number(request.query?.id);

    if (!id) throw new Error('ID not valid');

    const customer = await prisma.customer.findFirst({
      where: {
        id
      },
      include: {
        orders: true
      }
    });

    if (customer?.orders?.length > 0) throw new Error('Customer has orders');

    const addressesFromCustomer =
      await prisma.shippingAddressesOnCustomers.findMany({
        where: {
          customerId: id
        }
      });

    if (addressesFromCustomer?.length > 0) {
      await Promise.all(
        addressesFromCustomer.map(async values => {
          return await prisma.shippingAddress.delete({
            where: {
              id: values.shippingAddressId
            }
          });
        })
      );
    }

    await prisma.customer.delete({
      where: {
        id
      }
    });

    return response.json({ id });
  } catch (error) {
    console.error(error);
    response.status(400).json({ error: error.message });
  }
};

const CustomerController = {
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer
};

module.exports = { CustomerController };
