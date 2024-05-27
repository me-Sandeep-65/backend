const Order = require("../models/orderModel");

const pipeline = [
  {
    $match: {
      "updateDescription.updatedFields.status": { $exists: true },
    },
  },
  {
    $project: {
      documentKey: 1,
      "updateDescription.updatedFields.status": 1,
    },
  },
];

const changeStream = Order.watch(pipeline);
console.log("Watching on orders collection.");

changeStream.on("error", (error) => {
  console.error("Change stream error:", error);
});

changeStream.on("close", () => {
  console.log("Change stream closed");
});

changeStream.on("end", () => {
  console.log("Change stream ended");
});

module.exports = changeStream;
