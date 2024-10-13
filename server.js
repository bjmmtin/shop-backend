const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const port = 3000;

const corsOptions = {
  origin: "http://localhost:4200",
  optionsSuccessStatus: 204,
  methods: "GET, POST",
};

app.use(cors(corsOptions));
app.use(express.json());

// Route to get clothing items with pagination
app.get("/clothes", (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const perPage = parseInt(req.query.perPage) || 10;

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const jsonData = JSON.parse(data);
    const start = page * perPage;
    const end = start + perPage;
    const result = jsonData.items.slice(start, end);

    res.status(200).json({
      items: result,
      total: jsonData.items.length,
      page,
      perPage,
      totalPages: Math.ceil(jsonData.items.length / perPage),
    });
  });
});

// POST route to create a new clothing item
app.post("/clothes", (req, res) => {
  const { image, name, price, rating } = req.body;

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const jsonData = JSON.parse(data);

    const maxId = jsonData.items.reduce(
      (max, item) => Math.max(max, item.id),
      0
    );
    const newItem = {
      id: maxId + 1,
      image,
      name,
      price,
      rating,
    };
    jsonData.items.push(newItem);

    fs.writeFile("db.json", JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
        return;
      }
      res.status(201).json(newItem);
    });
  });
});

// PUT route to update a clothing item by ID
app.put("/clothes/:id", (req, res) => {
  const itemId = parseInt(req.params.id);
  const { image, name, price, rating } = req.body;

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const jsonData = JSON.parse(data);
    const itemIndex = jsonData.items.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      return res.status(404).send("Item not found");
    }

    jsonData.items[itemIndex] = {
      itemId,
      image,
      name,
      price,
      rating,
    };

    fs.writeFile("db.json", JSON.stringify(jsonData), (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
        return;
      }
      res.status(200).json(jsonData.items[itemIndex]);
    });
  });
});

// DELETE route to remove a clothing item by ID
app.delete("/clothes/:id", (req, res) => {
  const itemId = parseInt(req.params.id);

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const jsonData = JSON.parse(data);
    const itemIndex = jsonData.items.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      return res.status(404).send("Item not found");
    }

    jsonData.items.splice(itemIndex, 1);

    fs.writeFile("db.json", JSON.stringify(jsonData), (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
        return;
      }
      res.status(204).send(); // No content
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
