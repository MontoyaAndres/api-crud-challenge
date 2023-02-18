const { prisma } = require('../../prisma');

const getProduct = async (request, response) => {
  try {
    const id = Number(request.params?.id);

    if (!id) throw new Error('ID not valid');

    const getResponse = await prisma.product.findUnique({
      where: { id }
    });

    if (!getResponse) throw new Error('Product not found');

    response.json(getResponse);
  } catch (error) {
    console.error(error);
    response.status(400).json({ error: error.message });
  }
};

const createProduct = async (request, response) => {
  try {
    if (!request.body) {
      throw new Error('Not body defined');
    }

    const { title, description, price, weight, idNumber = null } = request.body;

    const createResponse = await prisma.product.create({
      data: {
        title,
        description,
        price,
        weight,
        idNumber
      }
    });

    if (!createResponse?.id) throw new Error('Product not created');

    response.json({
      id: createResponse?.id,
      title,
      description,
      price,
      weight,
      idNumber
    });
  } catch (error) {
    console.error(error);
    response.status(400).json({ error: error.message });
  }
};

const updateProduct = async (request, response) => {
  try {
    if (!request.body) {
      throw new Error('Not body defined');
    }

    const { title, description, price, weight } = request.body;
    const productId = Number(request.body?.id);

    if (!productId) throw new Error('ID not valid');

    const updateProduct = await prisma.product.update({
      data: {
        title,
        description,
        price,
        weight
      },
      where: { id: productId }
    });

    if (!updateProduct) throw new Error('Not product updated');

    response.json({ title, description, price, weight });
  } catch (error) {
    console.error(error);
    response.status(400).json({ error: error.message });
  }
};

const deleteProduct = async (request, response) => {
  try {
    const id = Number(request.params?.id);

    if (!id) throw new Error('ID not valid');

    await prisma.product.delete({
      where: { id }
    });

    return response.json({ id });
  } catch (error) {
    console.error(error);
    response.status(400).json({ error: error.message });
  }
};

const ProductController = {
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};

module.exports = { ProductController };
