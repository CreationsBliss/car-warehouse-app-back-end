const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'Unauthorized Access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'Forbidden Access' });
    }
    console.log('decoded', decoded);
    req.decoded = decoded;
    next();
  })

}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.degvskz.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {

  try {
    await client.connect();
    const inventoryCollection = client.db('vehica_car_warehouse').collection('inventories');


    //  get all inventory items
    app.get('/inventory', async (req, res) => {
      const query = {};
      const cursor = inventoryCollection.find(query);
      const inventories = await cursor.toArray();
      res.send(inventories);
    });


    //  get a single inventory item
    app.get('/inventory/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const inventory = await inventoryCollection.findOne(query);
      res.send(inventory);
    });


    // delete inventory item (DELETE)
    app.delete('/inventory/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await inventoryCollection.deleteOne(query);
      res.send(result);
    });


    // add new inventory item (POST)
    app.post('/inventory', async (req, res) => {
      const newInventoryItem = req.body;
      const result = await inventoryCollection.insertOne(newInventoryItem);
      res.send(result);
    });


    // Auth
    app.post('/signIn', async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d'
      });
      // console.log({accessToken});
      res.send({ accessToken });
    });


    // get user specific inventory item
    app.get('/item', verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;


      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = inventoryCollection.find(query);
        const items = await cursor.toArray();
        res.send(items);
      }
      else{
        res.status(403).send({message: 'Forbidden Access'})
      }
    })


    // delete user specific inventory item (DELETE)
    app.delete('/item/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await inventoryCollection.deleteOne(query);
      res.send(result);
    });


  }

  finally {

  }

}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Vehica Car Warehouse is Ready')
})

app.listen(port, () => {
  console.log(`Vehica car warehouse app listening on port ${port}`)
})