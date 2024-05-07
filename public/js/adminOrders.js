const orderContainer = document.getElementById("order-content");
const loadingIndicator = document.getElementById("order-loading-element");
const statusRadioButtons = document.querySelectorAll(".status-radio");

let cursor = null;
let filter = null;

statusRadioButtons.forEach((button) => {
  button.addEventListener("change", function () {
    filter = this.value === "all" ? null : this.value;

    console.log("filter: ", filter);

    console.log("value: ", this.value);
    // clear the content panel
    orderContainer.innerHTML = "";
    cursor = null;

    fetchOrders(filter);
  });
});

async function cancelOrder(orderId) {
    document.getElementById(`pending-btn-div-${orderId}`).classList.add("hidden")
        
    const response= await axios.patch(`/admin/order/${orderId}?cancel=true`)
    console.log(response)
    document.getElementById(`statusDiv-${orderId}`).value='Cancelled'
}
async function confirmOrder(orderId) {
    document.getElementById(`pending-btn-div-2-${orderId}`).classList.add("hidden")
    document.getElementById(`complete-btn-div-${orderId}`).classList.remove("hidden")
        
    const response= await axios.patch(`/admin/order/${orderId}?confirm=true`, {
        waitingTime: document.getElementById(`waiting-time-${orderId}`).value.trim()
    })

    console.log(response)
    document.getElementById(`statusDiv-${orderId}`).value='Waiting'

    
}
async function completeOrder(orderId) {
    document.getElementById(`complete-btn-div-2-${orderId}`).classList.add("hidden")
        
    const response= await axios.patch(`/admin/order/${orderId}?complete=true`, {
        otp: document.getElementById(`otp-${orderId}`).value.trim()
    })
    
    console.log(response)
    document.getElementById(`statusDiv-${orderId}`).value='Completed'

}

async function fetchOrders(filter) {
  try {
    console.log("this is the first call");
    showLoadingIndicator();
    const response = await axios.get(
      `/admin/orders-by-cursor?cursor=${cursor || ""}&filter=${filter || ""}`
    );
    console.log(response);
    const { hasNextPage, nextCursor, orders } = response.data;

    // console.log(orders);

    orders.forEach((order) => {
    //   console.log(ele);
      //   console.log(order);
      const statusColorClass =
        order.status === "pending" ? "text-orange-500" : "text-green-700";
      const orderItem = document.createElement("div");
      // <a href="/order/<%= order._id %>">
      orderItem.classList.add("bg-gray-200", "p-4", "my-2", "rounded-md");
      orderItem.innerHTML = `<div class="flex itmes-center justify-between border-b-2 border-white">
                    <h5 class="text-md font-bold my-3">Order ID: <span class="text-gray-700">${order._id}</span></h5>
                    <h5 id="statusDiv-${order._id}" class="text-md font-bold my-3 ${statusColorClass}">${order.status.status}</h5>
                </div>
                <div class="flex items-center justify-between">
                    <p class="text-black text-sm my-3 font-bold">Date: <span class="text-gray-700">${order.date}</span></p>
                    <p class="text-black text-sm my-3 font-bold">Payment ID: <span class="text-gray-700">${order.payment.paymentId}</span></p>
                </div>
                <div class="border-t-2 border-white" id="productDiv-${order._id}">
                    <div class="text-black text-sm my-3 font-bold">Products</div>

                </div>
            </div>`;
      // </a>

      orderContainer.appendChild(orderItem);
      const productDiv = document.getElementById(`productDiv-${order._id}`);
      let qty = 0;
      order.products.forEach((item) => {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("grid", "grid-cols-4", "justify-items-end");
        qty = qty + Number(item.quantity);
        itemDiv.innerHTML = `<span>${item.product.name}</span> <span>${
          item.product.type
        }</span> <span>${item.quantity}</span> <span>₹${
          item.product.price * item.quantity
        }</span>`;
        productDiv.appendChild(itemDiv);
      });

      const lastDiv = document.createElement("div");
      lastDiv.classList.add("grid", "grid-cols-4", "justify-items-end", "mt-4");
      lastDiv.innerHTML = `<span>Total number of items:</span> <span class="font-bold">${qty}</span> <span>Total Amount:</span> <span class="font-bold">₹${order.netTotal}</span>`;
      orderItem.appendChild(lastDiv);

      const pendingBtnDiv = document.createElement("div");
      pendingBtnDiv.classList.add(
        "hidden",
        "flex",
        "flex-row",
        "item-center",
        "justify-between"
      );
      pendingBtnDiv.id=`pending-btn-div-${order._id}`
      pendingBtnDiv.innerHTML = `<button
                                id="cancel-order-${order._id}"
                                  class="hollow-btn rounded-full font-bold py-2 px-4 my-2 focus:outline-none focus:shadow-outline"
                                  >
                                  Cancel Order
                                  </button>
                                  <button
                                  id="accept-order-${order._id}"
                                  class="btn rounded-full text-white font-bold py-2 px-4 my-2 focus:outline-none focus:shadow-outline"
                                  >
                                  Accept Order
                                  </button>`;

      orderItem.appendChild(pendingBtnDiv);

      const pendingBtnDiv2 = document.createElement("div");
      pendingBtnDiv2.classList.add(
        "hidden",
        "flex",
        "flex-row",
        "item-center",
        "justify-between"
      );
      pendingBtnDiv2.id=`pending-btn-div-2-${order._id}`
      pendingBtnDiv2.innerHTML = `<input name="waiting-time"
                                    class="shadow appearance-none border rounded-md w-1/3 py-1 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="waiting-time-${order._id}" type="number" placeholder="Enter the waiting time">
                                  <button
                                  id="confirm-order-${order._id}"
                                  class="btn rounded-full text-white font-bold py-2 px-4 my-2 focus:outline-none focus:shadow-outline"
                                  >
                                  Confirm Order
                                  </button>`;
                                  
      orderItem.appendChild(pendingBtnDiv2);

      const completeBtnDiv = document.createElement("div");
      completeBtnDiv.classList.add(
        "hidden",
        "flex",
        "flex-row",
        "item-center",
        "justify-end"
      );
      completeBtnDiv.id=`complete-btn-div-${order._id}`
      completeBtnDiv.innerHTML = `<button
                                  id="complete-order-${order._id}"
                                  class="btn rounded-full text-white font-bold py-2 px-4 my-2 focus:outline-none focus:shadow-outline"
                                  >
                                  Complete Order
                                  </button>`;

      orderItem.appendChild(completeBtnDiv);

      const completeBtnDiv2 = document.createElement("div");
      completeBtnDiv2.classList.add(
        "hidden",
        "flex",
        "flex-row",
        "item-center",
        "justify-between"
      );
      completeBtnDiv2.id=`complete-btn-div-2-${order._id}`
      completeBtnDiv2.innerHTML = `<input name="waiting-time"
                                    class="shadow appearance-none border rounded-md w-1/3 py-1 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="otp-${order._id}" type="number" placeholder="Enter the OTP">
                                  <button
                                  id="otp-btn-${order._id}"
                                  class="btn rounded-full text-white font-bold py-2 px-4 my-2 focus:outline-none focus:shadow-outline"
                                  >
                                  Confirm OTP
                                  </button>`;

      orderItem.appendChild(completeBtnDiv2);

      if (order.status.status === "pending") {
        pendingBtnDiv.classList.remove('hidden')
      }
      if (order.status.status === "waiting") {
        completeBtnDiv.classList.remove('hidden')
      }

      document.getElementById(`cancel-order-${order._id}`).addEventListener('click', async()=>{ await cancelOrder(order._id)})
      document.getElementById(`accept-order-${order._id}`).addEventListener('click', ()=>{
        pendingBtnDiv.classList.add('hidden')
        pendingBtnDiv2.classList.remove('hidden')
      })
      document.getElementById(`confirm-order-${order._id}`).addEventListener('click', async()=>{await confirmOrder(order._id)})


      document.getElementById(`complete-order-${order._id}`).addEventListener('click', ()=>{
        completeBtnDiv.classList.add('hidden')
        completeBtnDiv2.classList.remove('hidden')
      })
      document.getElementById(`otp-btn-${order._id}`).addEventListener('click', async ()=>{await completeOrder(order._id)})

    });

    cursor = nextCursor;

    if (hasNextPage) {
      observeLastOrder();
    }

    hideLoadingIndicator();
  } catch (error) {
    hideLoadingIndicator();
  }
}

async function loadMore() {
  if (!loading) {
    loading = true;
    await fetchOrders();
    loading = false;
  }
}

let loading = false;
async function handleIntersection(entries) {
  const lastOrder = entries[0];
  if (lastOrder.isIntersecting) {
    observer.unobserve(lastOrder.target);
    await loadMore();
  }
}

const observer = new IntersectionObserver(handleIntersection);

function observeLastOrder() {
  const lastOrder = document.querySelector("#order-content > div:last-child");
  if (lastOrder) {
    observer.observe(lastOrder);
  }
}

function showLoadingIndicator() {
  loadingIndicator.classList.remove("hidden");
}

function hideLoadingIndicator() {
  loadingIndicator.classList.add("hidden");
}

console.log("thsi is the first call");
fetchOrders(filter);
