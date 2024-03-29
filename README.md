Hi Parrolabs engineer 👋

It's a pleasure to meet you! This is my technical challenge, hope you like it :)

## How to start the project

First, you have to take the `.env.example` file and rename it to `.env`. You will find these variables:

```
PORT=8080
DATABASE_URL=
```

To get the variable `DATABASE_URL` please send me an email to andresmontoyafcb@gmail.com to get this value, this is because I'm using a production database for this challenge, so, this value is private :)

Then you have to install the depedencies:

```
yarn install
```

Then generate the types of prisma to build the database:

```
yarn generate
```

Then you can now run the api!

```
yarn dev
```

You can access to the api in the endpoint `http://localhost:8080/docs` or you can use the production-ready instance of the challenge, which is: `https://api-crud-challenge.fly.dev/docs`

To run the tests, you can do it by running:

Running customer tests:

```
yarn test -- test/customer.test.js
```

Running product tests:

```
yarn test -- test/product.test.js
```

Running order tests:

```
yarn test -- test/order.test.js
```

## Thank you :)

If you have any problem running this api or anything like this, please contact me. I'm really interested to be part of the team! Thank you :). This is my email: andresmontoyafcb@gmail.com.

---

https://www.apimatic.io/dashboard?modal=transform
