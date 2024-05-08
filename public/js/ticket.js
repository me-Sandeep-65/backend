const ticketContainer = document.getElementById("ticket-content");
const moreBtn = document.getElementById("more-ticket");
const ticketLoadingIndicator = document.getElementById(
  "ticket-loading-element"
);

const statusRadioButtons = document.querySelectorAll(".status-radio");

let ticketCursor = null;
let filter = null;

statusRadioButtons.forEach((button) => {
  button.addEventListener("change", function () {
    filter = this.value === "all" ? null : this.value;

    // clear the content panel
    ticketContainer.innerHTML = "";
    ticketCursor = null;

    fetchTickets();
  });
});

async function fetchTickets() {
  try {
    showTicketLoadingIndicator();
    const response = await axios.get(
      `/ticket?cursor=${ticketCursor || ""}&filter=${filter || ""}`
    );
    const { hasNextPage, nextCursor, tickets } = response.data;
    // console.log(response.data)

    if (!ticketCursor && !tickets) {
      // console.log(response)
      ticketContainer.innerHTML = response.data.element;
    } else {
      tickets.forEach((ticket) => {
        // console.log(ticket);
        const statusColorClass =
          ticket.status === "pending" ? "text-orange-500" : "text-green-700";
        const ticketItem = document.createElement("div");
        ticketItem.classList.add("bg-gray-200", "p-4", "my-2", "rounded");
        ticketItem.innerHTML = `<div class="flex itmes-center justify-between border-b-2 border-white">
          <h5 class="text-md font-bold my-3">Ticket ID: <span class="text-gray-700">${
            ticket._id
          }</span></h5>
          <h5 class="text-md font-bold my-3 ${statusColorClass}">${
          ticket.status
        }</h5>
          </div>
          <div class="flex items-center justify-between">
          <p class="text-black text-sm my-3 font-bold">Order ID: <span class="text-gray-700">${
            ticket.orderId
          }</span></p>
          <p class="text-black text-sm my-3 font-bold">User ID: <span class="text-gray-700">${
            ticket.userId
          }</span></p>
          </div>
          <div class="border-t-2 border-white">
          <div class="text-black text-sm my-3 font-bold"> Conversation</div>
            <p class="text-black my-3">${
              ticket.conversation[ticket.conversation.length - 1].role
            }: <span class="text-gray-700">${
          ticket.conversation[ticket.conversation.length - 1].body
        }</span></p>
          </div>
          `;
        const anchorTag = document.createElement("a");
        anchorTag.href = `/ticket/${ticket._id}`;
        anchorTag.appendChild(ticketItem);

        ticketContainer.appendChild(anchorTag);
      });
    }
    ticketCursor = nextCursor;

    hideTicketLoadingIndicator();

    if (!hasNextPage) {
      moreBtn.classList.add("hidden");
    }
  } catch (error) {
    console.log("Error fetching FAQs:", error);
    ticketContainer.innerHTML = error.response.data.element;
    hideTicketLoadingIndicator();
    moreBtn.classList.add("hidden");
  }
}

function showTicketLoadingIndicator() {
  moreBtn.classList.add("hidden");
  ticketLoadingIndicator.classList.remove("hidden");
}

function hideTicketLoadingIndicator() {
  ticketLoadingIndicator.classList.add("hidden");
  moreBtn.classList.remove("hidden");
}

moreBtn.addEventListener("click", () => {
  fetchTickets();
});

fetchTickets();
