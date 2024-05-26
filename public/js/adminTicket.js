const ticketContainer = document.getElementById("content");
const loadingIndicator = document.getElementById("loading-element");
const statusRadioButtons = document.querySelectorAll('.status-radio');

let cursor = null;
let filter = "pending";
  
statusRadioButtons.forEach(button => {
  button.addEventListener('change', function() {
    filter = this.value === "all" ? null : this.value;
    console.log("filter: ", filter)

    console.log("value: ", this.value)
    // clear the content panel
    ticketContainer.innerHTML = "";
    cursor=null;
    
    fetchTickets();
  });
});

async function fetchTickets() {
  try {
    showLoadingIndicator();
    const response = await axios.get(
      `/admin/tickets-by-cursor?cursor=${cursor || ""}&filter=${filter || ""}`
    );
    const { hasNextPage, nextCursor, tickets} = response.data;

    // console.log(tickets);

    tickets.forEach((ticket) => {
    //   console.log(ticket);
      const statusColorClass = ticket.status === "pending" ? "text-orange-500" : "text-green-700";
      const ticketItem = document.createElement("div");
      ticketItem.classList.add("bg-gray-200", "p-4", "my-2", "rounded");
      ticketItem.innerHTML = `<div class="flex itmes-center justify-between border-b-2 border-white">
        <h5 class="text-md font-bold my-3">Ticket ID: <span class="text-gray-700">${ticket._id}</span></h5>
        <h5 class="text-md font-bold my-3 ${statusColorClass}">${ticket.status.charAt(0).toUpperCase()+ticket.status.slice(1)}</h5>
        </div>
        <div class="flex items-center justify-between">
        <p class="text-black text-sm my-3 font-bold">Order ID: <span class="text-gray-700">${ticket.orderId}</span></p>
        <p class="text-black text-sm my-3 font-bold">User ID: <span class="text-gray-700">${ticket.userId}</span></p>
        </div>
        <div class="border-t-2 border-white">
        <div class="text-black text-sm my-3 font-bold"> Conversation</div>
          <p class="text-black my-3">${ticket.lastConversation.role}: <span class="text-gray-700">${ticket.lastConversation.body}</span></p>
        </div>
        `;
      const anchorTag = document.createElement("a");
      anchorTag.href = `/admin/ticket/${ticket._id}`;
      anchorTag.appendChild(ticketItem);

      ticketContainer.appendChild(anchorTag);
    });

    cursor = nextCursor;

    if (hasNextPage) {
      observeLastTicket();
    }

    hideLoadingIndicator();
  } catch (error) {
    hideLoadingIndicator();
  }
}

async function loadMore() {
  if (!loading) {
    loading = true;
    await fetchTickets();
    loading = false;
  }
}

let loading = false;
async function handleIntersection(entries) {
  const lastTicket = entries[0];
  if (lastTicket.isIntersecting) {
    observer.unobserve(lastTicket.target);
    await loadMore();
  }
}

const observer = new IntersectionObserver(handleIntersection);

function observeLastTicket() {
  const lastTicket = document.querySelector("#content > div:last-child");
  if (lastTicket) {
    observer.observe(lastTicket);
  }
}

function showLoadingIndicator() {
  loadingIndicator.classList.remove("hidden");
}

function hideLoadingIndicator() {
  loadingIndicator.classList.add("hidden");
}

fetchTickets();
