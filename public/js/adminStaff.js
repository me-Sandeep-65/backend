const staffContainer = document.getElementById('content');
const loadingIndicator = document.getElementById('loading-element');


let cursor = null;

async function fetchFaqs() {
  try {
    showLoadingIndicator();
    const response=await axios.get(`/admin/staffs-by-cursor?cursor=${cursor || ''}`);
    const { hasNextPage, nextCursor, staffs } = response.data;

    console.log(staffs)

    staffs.forEach(staff => {
      console.log(staff)
      const staffItem = document.createElement('div');
      staffItem.classList.add('bg-gray-200', 'p-4', 'my-2', 'rounded');
      staffItem.innerHTML = `
        <h4 class="text-lg font-semibold mb-3">Staff ID: ${staff.staff_id}</h4>
        <p class="text-gray-700 mb-3">Name: ${staff.name}</p>
        <p class="text-gray-700 mb-3">Age: ${staff.age}</p>
        <p class="text-gray-700 mb-3">Email: ${staff.mail}</p>
        <p class="text-gray-700 mb-3">Mobile: ${staff.mobile}</p>

      `;     
      const anchorTag= document.createElement('a')
      anchorTag.href = `/admin/staff/${staff.staff_id}`;
      anchorTag.appendChild(staffItem)

      staffContainer.appendChild(anchorTag);
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


