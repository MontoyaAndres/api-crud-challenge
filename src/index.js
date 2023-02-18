const express = require('express');
const cors = require('cors');

const { DATABASE_URL, PORT } = process.env;
const corsOptions = {
  origin: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const app = express();
const router = express.Router();

app.use(cors(corsOptions)).use(express.json());

router.get('/', (request, response) => response.json({ ok: true }));

app.use('/', router);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
