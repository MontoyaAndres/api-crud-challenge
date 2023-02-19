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

describe('Customer actions', () => {
  let customer1Id;

  test('Create new customer', async () => {
    const response = await fetch(`${ENDPOINT}/customers/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customer1)
    }).then(response => response.json());

    customer1Id = response.id;

    expect(response?.name).toBe(customer1.name);
    expect(response?.phone).toBe(customer1.phone);
    expect(response?.email).toBe(customer1.email);
    expect(response?.shippingAddress?.status).toBe(
      customer1.shippingAddress?.status
    );
    expect(response?.shippingAddress?.city).toBe(
      customer1.shippingAddress?.city
    );
    expect(response?.shippingAddress?.country).toBe(
      customer1.shippingAddress?.country
    );
    expect(response?.shippingAddress?.state).toBe(
      customer1.shippingAddress?.state
    );
    expect(response?.shippingAddress?.street).toBe(
      customer1.shippingAddress?.street
    );
    expect(response?.shippingAddress?.zipCode).toBe(
      customer1.shippingAddress?.zipCode
    );
  });

  test('Get or search customer', async () => {
    // Search by id
    const responseById = await fetch(
      `${ENDPOINT}/customers/?id=${customer1Id}`
    ).then(response => response.json());

    expect(responseById?.name).toBe(customer1.name);
    expect(responseById?.phone).toBe(customer1.phone);
    expect(responseById?.email).toBe(customer1.email);

    // Search by value
    const responseByValue = await fetch(
      `${ENDPOINT}/customers/?value=${customer1.name}`
    ).then(response => response.json());

    expect(responseByValue[0]?.name).toBe(customer1.name);
    expect(responseByValue[0]?.phone).toBe(customer1.phone);
    expect(responseByValue[0]?.email).toBe(customer1.email);
  });

  test('Update customer', async () => {
    let customer1NewName = 'Andrés Montoya';

    const response = await fetch(`${ENDPOINT}/customers/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...customer1,
        id: customer1Id,
        name: customer1NewName
      })
    }).then(response => response.json());

    expect(response?.name).toBe(customer1NewName);
    expect(response?.phone).toBe(customer1.phone);
    expect(response?.email).toBe(customer1.email);
  });

  test('Delete customer', async () => {
    const response = await fetch(`${ENDPOINT}/customers/?id=${customer1Id}`, {
      method: 'DELETE'
    }).then(response => response.json());

    expect(response.id).toBe(customer1Id);
  });
});
