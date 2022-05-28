const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.degvskz.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {

  try {
    await client.connect();
    const inventoryCollection = client.db('vehica_car_warehouse').collection('inventories');

    // to get all inventory items
    app.get('/inventory', async (req, res) => {
      const query = {};
      const cursor = inventoryCollection.find(query);
      const inventories = await cursor.toArray();
      res.send(inventories);
    });


    // to get a single inventory item
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
    })


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