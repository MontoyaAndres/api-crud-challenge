const fetch = require('isomorphic-unfetch');

const ENDPOINT = 'http://localhost:8080';
let customer1 = {
  name: 'Andrés',
  email: 'andres_test@test.com',
  phone: '3218032132',
  shippingAddress: {
    status: 'PRIMARY',
    city: 'bogota',
    country: 'colombia',
    state: 'bogota',
    street: 'xxxx',
    zipCode: 'xxxx'
  }
};
let product1 = {
  title: 'Hanes',
  description:
    'Sudadera de cuello redondo con forro polar EcoSmart de mezcla de algodón',
  price: 10,
  weight: 2
};
let orderDate = '2022-10-10';
let orderPaymentType = 'CASH';

jest.useRealTimers();

describe('Order actions', () => {
  let customer1Id;
  let product1Id;
  let order1Id;

  test('Create new order', async () => {
    // create new customer
    const createCustomerResponse = await fetch(`${ENDPOINT}/customers/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customer1)
    }).then(response => response.json());
    customer1Id = createCustomerResponse.id;

    const customerInformation = await fetch(
      `${ENDPOINT}/customers/?id=${customer1Id}`
    ).then(response => response.json());

    // create new product
    const createProductResponse = await fetch(`${ENDPOINT}/products/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product1)
    }).then(response => response.json());
    product1Id = createProductResponse.id;

    // create new order
    const createOrderResponse = await fetch(`${ENDPOINT}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerId: createCustomerResponse.id,
        shippingAddressId:
          customerInformation.shippingAddresses[0].shippingAddress.id,
        products: [{ id: createProductResponse.id, quantity: 1 }],
        date: orderDate,
        paymentType: orderPaymentType
      })
    }).then(response => response.json());
    order1Id = createOrderResponse.id;

    expect(createOrderResponse.id).toBe(order1Id);
    expect(createOrderResponse.customerId).toBe(createCustomerResponse.id);
    expect(createOrderResponse.shippingAddressId).toBe(
      customerInformation.shippingAddresses[0].shippingAddress.id
    );
    expect(createOrderResponse.date).toBe(orderDate);
    expect(createOrderResponse.paymentType).toBe(orderPaymentType);

    console.log({
      customer1Id,
      product1Id,
      order1Id
    });
  });

  test('Get or search order', async () => {
    // Search by id
    const responseById = await fetch(`${ENDPOINT}/orders/?id=${order1Id}`).then(
      response => response.json()
    );

    expect(responseById.date).toBe(
      new Date(orderDate).toISOString().toString()
    );
    expect(responseById.paymentType).toBe(orderPaymentType);

    // Search by value
    const responseByValue = await fetch(
      `${ENDPOINT}/orders/?value=${responseById.paymentType}`
    ).then(response => response.json());

    expect(responseByValue[0].paymentType).toBe(orderPaymentType);
  });

  test('Delete order, product and customer', async () => {
    const deleteOrderResponse = await fetch(
      `${ENDPOINT}/orders/?id=${order1Id}`,
      {
        method: 'DELETE'
      }
    ).then(response => response.json());

    expect(deleteOrderResponse.id).toBe(order1Id);

    const deleteProductResponse = await fetch(
      `${ENDPOINT}/products/?id=${product1Id}`,
      {
        method: 'DELETE'
      }
    ).then(response => response.json());

    expect(deleteProductResponse.id).toBe(product1Id);

    const deleteCustomerResponse = await fetch(
      `${ENDPOINT}/customers/?id=${customer1Id}`,
      {
        method: 'DELETE'
      }
    ).then(response => response.json());

    expect(deleteCustomerResponse.id).toBe(customer1Id);
  });
});
