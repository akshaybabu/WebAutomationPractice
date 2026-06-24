import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse body payload
  app.use(express.json());

  // CORS headers so that external clients like Postman or custom scrapers/scripts can invoke it
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Server-side database state
  let serverPets = [
    { id: 101, name: "Buster", category: "Canine", status: "available" },
    { id: 102, name: "Mittens", category: "Feline", status: "pending" },
    { id: 103, name: "Bubbles", category: "Fish", status: "available" },
    { id: 104, name: "Pip", category: "Rodent", status: "sold" }
  ];

  // E-commerce Server-side state
  const initialProducts = [
    { id: 1, name: "Premium Mechanical Keyboard", price: 129.99, category: "Electronics", image: "⌨️", inventory: 15 },
    { id: 2, name: "Ergonomic Wireless Mouse", price: 79.99, category: "Electronics", image: "🖱️", inventory: 25 },
    { id: 3, name: "Noise Cancelling Headphones", price: 249.99, category: "Electronics", image: "🎧", inventory: 8 },
    { id: 4, name: "Minimalist Leather Journal", price: 24.50, category: "Stationery", image: "📓", inventory: 50 },
    { id: 5, name: "Stainless Steel Water Bottle", price: 34.95, category: "Lifestyle", image: "🧉", inventory: 30 }
  ];

  let serverProducts = JSON.parse(JSON.stringify(initialProducts));
  let serverCart = [
    { id: 1, productId: 1, name: "Premium Mechanical Keyboard", price: 129.99, quantity: 1, image: "⌨️" }
  ];
  let serverOrders = [
    {
      orderId: "ORD-9842",
      customerName: "Alex Tester",
      shippingAddress: "123 Automation Lane, Dev City",
      items: [
        { productId: 2, name: "Ergonomic Wireless Mouse", price: 79.99, quantity: 1 }
      ],
      totalAmount: 79.99,
      status: "Processing",
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  // API Endpoints
  // GET Open API Schema Spec
  app.get("/api/v1/openapi.json", (req, res) => {
    const hostOrigin = `${req.protocol}://${req.get("host")}`;
    res.json({
      openapi: "3.0.0",
      info: {
        title: "Swagger OpenAPI Interactive Practice Simulator",
        description: "Fully functional live server-side REST API for testing and learning API Automation, E-commerce flows, and integration assertions. Perfect for Postman, Playwright, Cypress, and custom HTTP clients.",
        version: "1.0.0"
      },
      servers: [
        {
          url: hostOrigin,
          description: "Live Practice Server"
        }
      ],
      paths: {
        "/api/v1/pets": {
          "get": {
            "summary": "Retrieve all pets",
            "description": "Fetches all active pet objects currently registered in the database.",
            "responses": {
              "200": {
                "description": "Successful operation"
              }
            }
          },
          "post": {
            "summary": "Create a new pet",
            "description": "Submit a JSON payload body to construct and append a pet into memory.",
            "responses": {
              "201": {
                "description": "Created"
              }
            }
          },
          "put": {
            "summary": "Update an existing pet",
            "description": "Updates properties of an existing pet record inside memory storage.",
            "responses": {
              "200": {
                "description": "Updated successfully"
              }
            }
          }
        },
        "/api/v1/pets/{petId}": {
          "get": {
            "summary": "Retrieve individual pet by ID",
            "description": "Pass a pet ID parameter to look up a single record.",
            "parameters": [
              {
                "name": "petId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer"
                }
              }
            ],
            "responses": {
              "200": { "description": "Successful" }
            }
          },
          "delete": {
            "summary": "Discard a specific pet by ID",
            "description": "Pass an ID in the path to wipe a pet permanently from memory.",
            "parameters": [
              {
                "name": "petId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer"
                }
              }
            ],
            "responses": {
              "200": { "description": "Successful" }
            }
          }
        },
        "/api/v1/products": {
          "get": {
            "summary": "Retrieve E-commerce products",
            "description": "Gets the live catalog of products, prices, images, and inventory quantities.",
            "responses": {
              "200": { "description": "List of products returned" }
            }
          }
        },
        "/api/v1/cart": {
          "get": {
            "summary": "Retrieve shopping cart contents",
            "description": "Fetches active items inside the customer's shopping cart.",
            "responses": {
              "200": { "description": "Cart items returned" }
            }
          },
          "post": {
            "summary": "Add item to shopping cart",
            "description": "Appends or increments an item in the live shopping cart database. Requires payload body.",
            "requestBody": {
              "required": true,
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "required": ["productId"],
                    "properties": {
                      "productId": { "type": "integer" },
                      "quantity": { "type": "integer", "default": 1 }
                    }
                  }
                }
              }
            },
            "responses": {
              "200": { "description": "Item added to cart successfully" },
              "404": { "description": "Product ID not found in catalog" }
            }
          }
        },
        "/api/v1/cart/{productId}": {
          "delete": {
            "summary": "Remove item from shopping cart",
            "description": "Deletes a specific product line completely from the shopping cart database.",
            "parameters": [
              {
                "name": "productId",
                "in": "path",
                "required": true,
                "schema": { "type": "integer" }
              }
            ],
            "responses": {
              "200": { "description": "Item removed from cart" },
              "404": { "description": "Item not present in current cart" }
            }
          }
        },
        "/api/v1/orders": {
          "get": {
            "summary": "Retrieve order placement history",
            "description": "Fetches lists of all checked out orders from the server memory log.",
            "responses": {
              "200": { "description": "Successful order logs array" }
            }
          },
          "post": {
            "summary": "Checkout and place E-commerce order",
            "description": "Converts all current cart contents into a new order record, depletes appropriate product inventories, empties the cart, and appends the order logs.",
            "requestBody": {
              "required": true,
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "required": ["customerName"],
                    "properties": {
                      "customerName": { "type": "string" },
                      "shippingAddress": { "type": "string" }
                    }
                  }
                }
              }
            },
            "responses": {
              "201": { "description": "Order submitted successfully" },
              "400": { "description": "Order rejected (e.g. cart is empty)" }
            }
          }
        }
      }
    });
  });

  // GET ALL PETS
  app.get("/api/v1/pets", (req, res) => {
    res.json(serverPets);
  });

  // GET PET BY ID
  app.get("/api/v1/pets/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format. Expected integer." });
    }
    const pet = serverPets.find(p => p.id === id);
    if (!pet) {
      return res.status(404).json({ error: "Pet not found", requestedId: id });
    }
    res.json(pet);
  });

  // CREATE PET
  app.post("/api/v1/pets", (req, res) => {
    const { name, category, status } = req.body;
    if (!name) {
      return res.status(422).json({ error: "Required validation property 'name' is missing in post payload." });
    }
    const newId = serverPets.length > 0 ? Math.max(...serverPets.map(p => p.id)) + 1 : 101;
    const newPet = {
      id: newId,
      name,
      category: category || "General",
      status: status || "available"
    };
    serverPets.push(newPet);
    res.status(201).json(newPet);
  });

  // UPDATE PET
  app.put("/api/v1/pets", (req, res) => {
    const { id, name, category, status } = req.body;
    const targetId = parseInt(id, 10);
    if (isNaN(targetId)) {
      return res.status(400).json({ error: "Missing or invalid 'id' parameter inside payload body." });
    }
    const petIndex = serverPets.findIndex(p => p.id === targetId);
    if (petIndex === -1) {
      return res.status(404).json({ error: "Pet update rejected. ID not found in database.", targetId });
    }
    const updatedPet = {
      id: targetId,
      name: name || serverPets[petIndex].name,
      category: category || serverPets[petIndex].category,
      status: status || serverPets[petIndex].status
    };
    serverPets[petIndex] = updatedPet;
    res.json(updatedPet);
  });

  // DELETE PET BY ID
  app.delete("/api/v1/pets/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format supplied." });
    }
    const exists = serverPets.some(p => p.id === id);
    if (!exists) {
      return res.status(404).json({ error: "Target pet not found. Deletion ignored.", targetId: id });
    }
    serverPets = serverPets.filter(p => p.id !== id);
    res.json({ message: "Pet successfully deleted from the store database.", id });
  });

  // ==================== E-COMMERCE ENDPOINTS ====================

  // GET ALL PRODUCTS
  app.get("/api/v1/products", (req, res) => {
    res.json(serverProducts);
  });

  // GET CART
  app.get("/api/v1/cart", (req, res) => {
    res.json(serverCart);
  });

  // ADD ITEM TO CART
  app.post("/api/v1/cart", (req, res) => {
    const { productId, quantity } = req.body;
    const pId = parseInt(productId, 10);
    const qty = parseInt(quantity, 10) || 1;

    if (isNaN(pId)) {
      return res.status(400).json({ error: "Required integer parameter 'productId' is missing or invalid in request body." });
    }

    const product = serverProducts.find(p => p.id === pId);
    if (!product) {
      return res.status(404).json({ error: `Product ID ${pId} not found in store catalog.` });
    }

    // Check inventory availability
    if (product.inventory < qty) {
      return res.status(400).json({ error: `Insufficient inventory. Only ${product.inventory} items remaining.`, available: product.inventory });
    }

    // Add to cart state
    const cartIndex = serverCart.findIndex(item => item.productId === pId);
    if (cartIndex !== -1) {
      serverCart[cartIndex].quantity += qty;
    } else {
      const nextId = serverCart.length > 0 ? Math.max(...serverCart.map(i => i.id)) + 1 : 1;
      serverCart.push({
        id: nextId,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: qty,
        image: product.image
      });
    }

    res.json({ message: "Product successfully added to active shopping cart.", currentCart: serverCart });
  });

  // DELETE ITEM FROM CART BY PRODUCT ID
  app.delete("/api/v1/cart/:productId", (req, res) => {
    const pId = parseInt(req.params.productId, 10);
    if (isNaN(pId)) {
      return res.status(400).json({ error: "Invalid product ID specified." });
    }

    const itemExists = serverCart.some(i => i.productId === pId);
    if (!itemExists) {
      return res.status(404).json({ error: "Product is not present in active cart." });
    }

    serverCart = serverCart.filter(i => i.productId !== pId);
    res.json({ message: "Product completely cleared from active shopping cart.", currentCart: serverCart });
  });

  // GET ORDERS
  app.get("/api/v1/orders", (req, res) => {
    res.json(serverOrders);
  });

  // POST CHECKOUT / SUBMIT ORDER
  app.post("/api/v1/orders", (req, res) => {
    const { customerName, shippingAddress } = req.body;
    if (!customerName) {
      return res.status(400).json({ error: "Validation failure. Property 'customerName' is mandatory for placement." });
    }

    if (serverCart.length === 0) {
      return res.status(400).json({ error: "Cannot submit order. Shopping cart is currently empty. Add products first!" });
    }

    // Verify inventory and subtract
    for (const item of serverCart) {
      const prod = serverProducts.find(p => p.id === item.productId);
      if (!prod || prod.inventory < item.quantity) {
        return res.status(400).json({ 
          error: `Checkout transaction aborted. Insufficient inventory for product '${item.name}'. Only ${prod ? prod.inventory : 0} left.`,
          productId: item.productId 
        });
      }
    }

    // Deduct stock
    for (const item of serverCart) {
      const prod = serverProducts.find(p => p.id === item.productId);
      if (prod) {
        prod.inventory -= item.quantity;
      }
    }

    // Calculate sum
    const total = parseFloat(serverCart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2));
    const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      orderId: newOrderId,
      customerName,
      shippingAddress: shippingAddress || "Customer Store Pickup (Instant)",
      items: [...serverCart],
      totalAmount: total,
      status: "Confirmed",
      createdAt: new Date().toISOString()
    };

    serverOrders.unshift(newOrder); // Add to beginning of records
    serverCart = []; // Flush active cart contents

    res.status(201).json({
      message: "Congratulations! Your practice checkout order was simulated and saved successfully.",
      orderSummary: newOrder
    });
  });

  // ADMIN ENDPOINT TO RESET BOTH PETS & E-COMMERCE DB TO DEFAULT
  app.post("/api/v1/reset", (req, res) => {
    serverPets = [
      { id: 101, name: "Buster", category: "Canine", status: "available" },
      { id: 102, name: "Mittens", category: "Feline", status: "pending" },
      { id: 103, name: "Bubbles", category: "Fish", status: "available" },
      { id: 104, name: "Pip", category: "Rodent", status: "sold" }
    ];
    serverProducts = JSON.parse(JSON.stringify(initialProducts));
    serverCart = [
      { id: 1, productId: 1, name: "Premium Mechanical Keyboard", price: 129.99, quantity: 1, image: "⌨️" }
    ];
    serverOrders = [
      {
        orderId: "ORD-9842",
        customerName: "Alex Tester",
        shippingAddress: "123 Automation Lane, Dev City",
        items: [
          { productId: 2, name: "Ergonomic Wireless Mouse", price: 79.99, quantity: 1 }
        ],
        totalAmount: 79.99,
        status: "Processing",
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    res.json({ message: "All Practice Arena database registries reset successfully.", petCount: serverPets.length, productCount: serverProducts.length, cartCount: serverCart.length });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
