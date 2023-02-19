const fetch = require('isomorphic-unfetch');

const ENDPOINT = 'http://localhost:8080';
let product1 = {
  title: 'Hanes',
  description:
    'Sudadera de cuello redondo con forro polar EcoSmart de mezcla de algodón',
  price: 10,
  weight: 2
};

describe('Product actions', () => {
  let product1Id;

  test('Create new product', async () => {
    const response = await fetch(`${ENDPOINT}/products/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product1)
    }).then(response => response.json());

    product1Id = response.id;

    expect(response.title).toBe(product1.title);
    expect(response.description).toBe(product1.description);
    expect(response.price).toBe(product1.price);
    expect(response.weight).toBe(product1.weight);
  });

  test('Get or search product', async () => {
    // Search by id
    const responseById = await fetch(
      `${ENDPOINT}/products/?id=${product1Id}`
    ).then(response => response.json());

    expect(responseById.title).toBe(product1.title);
    expect(responseById.description).toBe(product1.description);
    expect(responseById.price).toBe(product1.price);
    expect(responseById.weight).toBe(product1.weight);

    // Search by value
    const responseByValue = await fetch(
      `${ENDPOINT}/products/?value=${product1.title}`
    ).then(response => response.json());

    expect(responseByValue[0].title).toBe(product1.title);
    expect(responseByValue[0].description).toBe(product1.description);
    expect(responseByValue[0].price).toBe(product1.price);
    expect(responseByValue[0].weight).toBe(product1.weight);
  });

  test('Update product', async () => {
    let productNewTitle = 'Hanes Sudadera';

    const response = await fetch(`${ENDPOINT}/products/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...product1,
        id: product1Id,
        title: productNewTitle
      })
    }).then(response => response.json());

    expect(response.title).toBe(productNewTitle);
    expect(response.description).toBe(product1.description);
    expect(response.price).toBe(product1.price);
    expect(response.weight).toBe(product1.weight);
  });

  test('Delete customer', async () => {
    const response = await fetch(`${ENDPOINT}/products/?id=${product1Id}`, {
      method: 'DELETE'
    }).then(response => response.json());

    expect(response.id).toBe(product1Id);
  });
});
