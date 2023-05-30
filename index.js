const express = require("express");
const app = express();
const server = require("http").createServer(app);
const PORT = 5000;
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const io = require("socket.io")(server);

mongoose
  .connect(
    "mongodb+srv://musfiqurofficial1999:ncreynxPEgYdqnia@cluster0.4zjwycc.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

app.post("/api/sign-up", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    // Return a success response
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    // Return an error response
    res.status(500).json({ message: "Internal server error" });
  }
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("message", (message) => {
    // Change the event name to 'message'
    console.log("Received message:", message);
    io.emit("message", message); // Change the event name to 'message'
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Get all items
app.get("/", async (req, res) => {
  try {
    res.send("Welcome");
  } catch (error) {
    console.error("Error retrieving items:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Start the server
server.listen(PORT, () => {
  // Use the server variable to start the server
  console.log(`Server is listening on port ${PORT}`);
});
