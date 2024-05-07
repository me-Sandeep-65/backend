const contactContainer = document.getElementById('content');
const loadingIndicator = document.getElementById('loading-element');


let cursor = null;

async function fetchFaqs() {
  try {
    showLoadingIndicator();
    const response=await axios.get(`/admin/contacts-by-cursor?cursor=${cursor || ''}`);
    const { hasNextPage, nextCursor, contacts } = response.data;

    console.log(contacts)

    contacts.forEach(contact => {
      const contactItem = document.createElement('div');
      contactItem.classList.add('bg-gray-200', 'p-4', 'my-2', 'rounded');
      contactItem.innerHTML = `
        <h4 class="text-lg font-semibold mb-3">Name: ${contact.name}</h4>
        <p class="text-gray-700 mb-3">Email: ${contact.mail}</p>
        <p class="text-gray-700 mb-3">Mobile: ${contact.mobile}</p>
        <p class="text-gray-700 mb-3">Message: ${contact.message}</p>
        <p class="text-gray-700 mb-3">Date: ${contact.date}</p>
      `;     

      console.log(contactItem)

      contactContainer.appendChild(contactItem);
    });

    cursor = nextCursor;

    if (hasNextPage) {
      observeLastFaq();
    }

    hideLoadingIndicator();
  } catch (error) {
    hideLoadingIndicator();
  }
}

async function loadMore() {
  if (!loading) {
    loading = true;
    await fetchFaqs();
    loading = false;
  }
}

let loading = false;
async function handleIntersection(entries) {
  const lastFaq = entries[0];
  if (lastFaq.isIntersecting) {
    observer.unobserve(lastFaq.target);
    await loadMore();
  }
}

const observer = new IntersectionObserver(handleIntersection);


function observeLastFaq() {
  const lastFaq = document.querySelector('#content > div:last-child');
  if (lastFaq) {
    observer.observe(lastFaq);
  }
}

function showLoadingIndicator() {
  loadingIndicator.classList.remove('hidden');
}

function hideLoadingIndicator() {
  loadingIndicator.classList.add('hidden');
}

fetchFaqs();


