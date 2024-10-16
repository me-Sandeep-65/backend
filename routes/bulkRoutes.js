const express = require("express");
const router = new express.Router();
const axios = require('axios');
const Complaint = require("../models/complaintModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Staff = require("../models/staffModel");
const User = require("../models/userModel");


const binarySearchById = (array, id) => {
    let left = 0;
    let right = array.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const midId = array[mid]._id;

        if (midId === id) {
            return array[mid]; // Return the object if found
        } else if (midId < id) {
            left = mid + 1; // Search in the right half
        } else {
            right = mid - 1; // Search in the left half
        }
    }

    return null; // Return null if not found
};

// Function to get a random product from the sortedProducts array
const getRandomProduct = (products) => {
    const randomIndex = Math.floor(Math.random() * products.length);
    return products[randomIndex];
};

router.post("/products", async(req, res) => {
    try {
        // Get the body of the request
        const products = req.body;

        // Insert multiple documents into the products collection
        const result = await Product.insertMany(products);

        // Send a response back to the client
        res.status(201).json({
            message: "Products successfully added!",
            data: result,
        });
    } catch (error) {
        console.error("Error inserting products:", error);
        res.status(500).json({
            message: "Failed to add products",
            error: error.message,
        });
    }

});

// GET route to fetch product IDs and prices
router.get("/products/prices", async (req, res) => {
    try {
        // Find products and select only the _id and price fields
        const products = await Product.find({}, { _id: 1, name: 1, price: 1 });

        // Send the response back to the client
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            message: "Failed to fetch products",
            error: error.message,
        });
    }
});

router.post("/orders", async(req, res) => {
    try {
        // Get the body of the request
        let orders = req.body;
        let response = await axios.get('http://localhost:8000/bulk/products/prices');
        // Sort the products in ascending order based on _id
        response = response.data.sort((a, b) => a._id.localeCompare(b._id));

        // Use forEach to iterate over each order
        orders.forEach(order => {
            // Initialize total price for the current order
            let totalPrice = 0;

            // Use forEach to iterate over each product in the order
            order?.products.forEach(product => {
                const foundProduct = binarySearchById(response, product.product); // Search by product ID
                if (foundProduct) {
                    // If the product is found, compute its price
                    totalPrice += Number(foundProduct.price) * Number(product.quantity); // Convert quantity to number
                } else {
                    // If the product is not found, select a random product
                    const randomProduct = getRandomProduct(response);
                    totalPrice += Number(randomProduct.price) * Number(product.quantity); // Use random product price
                    // Replace the product in the order's products with the random product
                    product.product = randomProduct._id; // Replace with random product ID
                }
            });
            
            order.otp = (Math.floor(Math.random() * 900000) + 100000).toString();
            order.netTotal = (totalPrice - Number(order.discount)).toString();
            order.grossTotal = totalPrice.toString(); // Convert totalPrice to string for grossTotal
        });

        // Insert multiple documents into the products collection
        const result = await Order.insertMany(orders);

        // Send a response back to the client
        res.status(201).json({
            message: "Products successfully added!",
            data: result,
        });
    } catch (error) {
        console.error("Error inserting products:", error);
        res.status(500).json({
            message: "Failed to add products",
            error: error.message,
        });
    }

});

router.get("/orders/ids", async (req, res) => {
    try {
        // Find products and select only the _id and price fields
        // const orders = await Order.find({}, { _id: 1 });
        const count = await Order.countDocuments()

        // Send the response back to the client
        res.status(200).json(count);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            message: "Failed to fetch products",
            error: error.message,
        });
    }
});

router.post("/users", async(req, res) => {
    try {
        // Get the body of the request
        const users = req.body;

        // Insert multiple documents into the products collection
        const result = await User.insertMany(users);

        // Send a response back to the client
        res.status(201).json({
            message: "Products successfully added!",
            data: result,
        });
    } catch (error) {
        console.error("Error inserting products:", error);
        res.status(500).json({
            message: "Failed to add products",
            error: error.message,
        });
    }

});

router.get("/users/orderids", async (req, res) => {
    try {
        const ordersids = await User.find({}, { _id: 1 });

        // Send the response back to the client
        res.status(200).json(ordersids);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            message: "Failed to fetch products",
            error: error.message,
        });
    }
});

router.get("/mixuserwithorder", async (req, res) => {
    let count = 0;

    try {
        // Fetch all orders and users
        const orders = await Order.find({}, { _id: 1 });
        const users = await User.find({}, { _id: 1, orders: 1 });

        // Create a set of existing order IDs from all users
        const existingOrderIds = new Set();
        users.forEach(user => {
            user.orders.forEach(orderId => existingOrderIds.add(orderId.toString()));
        });

        // Filter out the existing orders from the available orders
        const availableOrders = orders
            .map(order => order._id.toString())
            .filter(orderId => !existingOrderIds.has(orderId));

        // Link orders to users
        while (availableOrders.length > 0) {
            const num = Math.floor(Math.random() * 6) + 1; // Random number of orders to assign (1 to 6)
            const userIdx = Math.floor(Math.random() * users.length); // Random user index

            // Randomly select order IDs
            const currOrders = [];
            for (let i = 0; i < num; i++) {
                if (availableOrders.length === 0) break; // Stop if no orders left

                const randomIndex = Math.floor(Math.random() * availableOrders.length);
                currOrders.push(availableOrders[randomIndex]);
                // Remove the selected order ID from availableOrders
                availableOrders.splice(randomIndex, 1);
            }

            // Update the user's orders
            await User.findByIdAndUpdate(
                users[userIdx]._id,
                {
                    $push: { orders: { $each: currOrders } } // Push selected order IDs into orders
                },
                { new: true }
            );

            count += currOrders.length; // Increment count by number of orders linked
        }

        res.status(200).json({ ordersLinked: `${count}` });
    } catch (error) {
        console.error("Error Linking orders:", error);
        res.status(500).json({
            ordersLinked: `${count}`,
            error: error.message,
        });
    }
});


router.post("/complaints", async(req, res) => {
    try {
        // Get the body of the request
        const complaints = req.body;

        // Insert multiple documents into the products collection
        const result = await User.insertMany(complaints);

        // Send a response back to the client
        res.status(201).json({
            message: "Products successfully added!",
            data: result,
        });
    } catch (error) {
        console.error("Error inserting products:", error);
        res.status(500).json({
            message: "Failed to add products",
            error: error.message,
        });
    }

});

module.exports = router;
