const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// This is your test secret API key.
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ikmm0oq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // COLLECTIONS OF DATA

    const userCollection = client.db("bistroDB").collection("users");
    const menuCollection = client.db("bistroDB").collection("menu");
    const reviewCollection = client.db("bistroDB").collection("reviews");
    const cartCollection = client.db("bistroDB").collection("carts");


    // READ DATA

    // USERS

    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.findOne(query)
      res.send(result);
  });


    // MENU

    app.get("/menu", async (req, res) => {
        const cursor = menuCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      });

    // REVIEWS

    app.get("/reviews", async (req, res) => {
        const cursor = reviewCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      });

      // CARTS

      app.get("/carts", async (req, res) => {
        const email = req.query.email;
        const query = { email : email};
        const cursor = cartCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      });

      app.get('/carts/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await cartCollection.findOne(query)
        res.send(result);
    });


      // POST DATA

      // USERS

      app.post("/users", async(req, res) => {
        const userInfo = req.body;
        const result = await userCollection.insertOne(userInfo);
        res.send(result);
      });

      // CARTS

      app.post("/carts", async(req, res) => {
        const cartItem = req.body;
        const result = await cartCollection.insertOne(cartItem);
        res.send(result);
      });

      // Payment intent

      app.post("/create-payment-intent", async (req, res) => {
        const { price } = req.body;
        const amount = parseInt(price * 100);
        console.log(amount, 'amount inside intent')
      
        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "usd",
          payment_method_types : ['card'],
          // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
         
        });
      
        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      });

      
      // DELETE 

      // USERS

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });


  


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get("/", (req, res) => {
    res.send("Bistro Boss server is running");
  });
  
  app.listen(port, () => {
    console.log(`Bistro Boss is running on port ${port}`);
  });