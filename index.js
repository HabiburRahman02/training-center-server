const express = require('express');
const app = express()
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.szaofvp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
console.log(uri)
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
        await client.connect();

        const serviceCollection = client.db('trainingCenterDB').collection('services')
        const reviewCollection = client.db('trainingCenterDB').collection('reviews')
        const featureCollection = client.db('trainingCenterDB').collection('features')

        // features
        app.get('/features', async (req, res) => {
            const query = featureCollection.find();
            const result = await query.toArray();
            res.send(result);
        })

        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find()
            const result = await cursor.toArray()
            // console.log(result)
            res.send(result)
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await serviceCollection.findOne(query)
            res.send(result)
        })

        // review
        app.get('/review', async (req, res) => {
            // const query = req.query.email;
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const cursor = reviewCollection.find(query);
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result)
        })

        app.patch('/review/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updatedReview = req.body;
            const updateDoc = {
                $set: {
                    status: updatedReview.status
                },
            };

            const result = await reviewCollection.updateOne(filter, updateDoc)
            res.send(result)
        })

        app.delete('/review/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await reviewCollection.deleteOne(query);
            res.send(result)
            // console.log(id,result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('training server')
})

app.listen(port, () => {
    console.log(`training server is running on port ${port}`)
})