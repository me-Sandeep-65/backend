const { Matrix, SVD } = require('ml-matrix');
const User = require('../models/userModel');

let predictedMatrix = null; // Variable to store the predicted matrix
const userIndexMap = new Map(); // Map to hold user ID and its index
const indexProductMap = new Map(); // Map to hold index and its Product
let userItemMatrix = null;

async function getRecommendations(userId, topN = 12) {
    if (!predictedMatrix) {
        throw new Error('Predicted matrix not computed yet.');
    }

    const userRowIndex = userIndexMap.get(userId);
    if (userRowIndex === undefined) {
        throw new Error('User not found in the index map.');
    }

    const userRow = predictedMatrix.getRow(userRowIndex);
    const recommendations = [];

    for (let i = 0; i < userRow.length; i++) {
        // Only recommend items not yet interacted with
        if (userItemMatrix[userRowIndex][i] === 0) {
            recommendations.push({ item: indexProductMap.get(i), score: userRow[i] });
        }
    }

    recommendations.sort((a, b) => b.score - a.score);
    return recommendations.slice(0, topN);
}

async function getUserItemMatrix() {
    const users = await User.find().populate({
        path: 'orders',
        select: 'products', // Only fetch the products field from orders
    });

    const productMap = new Map(); // Map to hold product ID and its index
    const interactions = []; // To hold user interactions

    // Populate user and product maps
    users.forEach((user, index) => {
        userIndexMap.set(user._id.toString(), index); // Map user ID to index

        const productQuantities = {};

        // Iterate through each order
        user.orders.forEach(order => {
            order.products.forEach(product => {
                const productId = product.product.toString();
                const quantity = product.quantity;

                // Add product to map if it doesn't exist
                if (!productMap.has(productId)) {
                    productMap.set(productId, productMap.size); // Map product ID to index
                    indexProductMap.set(indexProductMap.size, productId); // Map index to product ID
                }

                // Sum quantities for the same product
                productQuantities[productId] = (productQuantities[productId] || 0) + quantity;
            });
        });

        // Store the user's product quantities
        interactions.push({
            userId: user._id.toString(),
            quantities: productQuantities,
        });
    });

    // Create the user-item interaction matrix
    userItemMatrix = Array.from({ length: users.length }, () => 
        new Array(productMap.size).fill(0) // Initialize matrix with zeros
    );

    interactions.forEach(interaction => {
        const userIndex = userIndexMap.get(interaction.userId);
        Object.entries(interaction.quantities).forEach(([productId, quantity]) => {
            const productIndex = productMap.get(productId);
            userItemMatrix[userIndex][productIndex] = quantity; // Fill in the quantity
        });
    });

    return userItemMatrix; // Return the final user-item interaction matrix
}

// Function to compute the predicted matrix
async function computePredictedMatrix() {
    userItemMatrix = await getUserItemMatrix(); // Fetch the interaction matrix

    const svd = new SVD(userItemMatrix); // Ensure Matrix type is used
    const { U, s, V } = svd;

    // Create a diagonal matrix from s
    const SMatrix = new Matrix(s.length, s.length);
    for (let i = 0; i < s.length; i++) {
        SMatrix.set(i, i, s[i]); // Fill the diagonal with singular values
    }

    // Compute the predicted matrix
    predictedMatrix = U.mmul(SMatrix).mmul(V.transpose());
}

// Function to initialize the predicted matrix at server startup
async function initializeRecommendations() {
    await computePredictedMatrix();
}

module.exports = {
    getRecommendations,
    initializeRecommendations,
};
