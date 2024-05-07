const faqContainer = document.getElementById('content');
const loadingIndicator = document.getElementById('loading-element');


let cursor = null;

async function fetchFaqs() {
  try {
    showLoadingIndicator();
    const response=await axios.get(`/fetch-faq-by-cursor?cursor=${cursor || ''}`);
    const { hasNextPage, nextCursor, faqs } = response.data;

    faqs.forEach(faq => {
      const faqItem = document.createElement('div');
      faqItem.classList.add('bg-gray-200', 'p-4', 'my-2', 'rounded');
      faqItem.innerHTML = `
        <h3 class="text-lg font-semibold">${faq.question}</h3>
        <p class="text-gray-700">${faq.answer}</p>
      `;     
      
      const anchorTag = document.createElement('a');
      anchorTag.href = `/admin/faq?id=${encodeURIComponent(faq._id)}&question=${encodeURIComponent(faq.question)}&answer=${encodeURIComponent(faq.answer)}`;

      anchorTag.appendChild(faqItem)

      faqContainer.appendChild(anchorTag);
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
  const lastFaq = document.querySelector('#content > a:last-child');
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


