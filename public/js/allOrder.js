const orderContainer = document.getElementById("order-content");
const moreBtn = document.getElementById("more-order");
const orderLoadingIndicator = document.getElementById(
  "order-loading-element"
);

let orderCursor = null;

async function fetchOrders() {
  try {
    showTicketLoadingIndicator();
    const response = await axios.get(`/order?cursor=${orderCursor || ""}&filter=${filter || ""}`);
    const { hasNextPage, nextCursor, orders } = response.data;

    orders.forEach((order) => {
        const orderItem = document.createElement("div");
      orderItem.classList.add("bg-gray-200", "p-4", "my-2", "rounded");
      orderItem.innerHTML = `<div class="flex itmes-center justify-between border-b-2 border-white">
        <h5 class="text-md font-bold my-3">Order ID: <span class="text-gray-700">${order._id}</span></h5>
        <h5 class="text-md font-bold my-3 ${statusColorClass}">${order.status}</h5>
        </div>
        <div class="flex items-center justify-between">
        <p class="text-black text-sm my-3 font-bold">Date: <span class="text-gray-700">${order.date}</span></p>
        <p class="text-black text-sm my-3 font-bold">Payment ID: <span class="text-gray-700">${order.payment.paymentId}</span></p>
        </div>
        <div class="border-t-2 border-white">
        <div id="productDiv" class="text-black text-sm my-3 font-bold"> Products</div>
          <p class="text-black my-3">${order.poducts.product[0].name}: <span class="text-gray-700">${order.poducts.quantity}</span></p>
        </div>
        `;
      orderContainer.appendChild(orderItem);
    });

    orderCursor = nextCursor;

    hideOrderLoadingIndicator();

    if (!hasNextPage) {
      moreBtn.classList.add("hidden");
    }
  } catch (error) {
    console.error("Error fetching Orders:", error);
    hideOrderLoadingIndicator();
    moreBtn.classList.add("hidden");

  }
}

function showOrderLoadingIndicator() {
  moreBtn.classList.add("hidden");
  orderLoadingIndicator.classList.remove("hidden");
}

function hideOrderLoadingIndicator() {
  orderLoadingIndicator.classList.add("hidden");
  moreBtn.classList.remove("hidden");
}

moreBtn.addEventListener("click", () => {
  fetchOrders();
});

fetchOrders();
