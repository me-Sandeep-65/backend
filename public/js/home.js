const productContainer = document.getElementById("content");
const loadingIndicator = document.getElementById("loading-element");
const cartCounter = document.getElementById("cartCounter");

let cursor = null;

async function fetchProducts() {
  try {
    showLoadingIndicator();
    const response = await axios.get(
      `/products-by-cursor?cursor=${cursor || ""}`
    );
    // console.log(response.data);
    const { hasNextPage, nextCursor, products } = response.data;

    products.forEach((product) => {
      const productItem = document.createElement("div");
      productItem.classList.add(
        "bg-white",
        "rounded-lg",
        "shadow-md",
        "p-6",
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "hover:bg-gray-200",
        "transition",
        "duration-300",
        "my-4"
      );
      productItem.innerHTML = `
      <div class="flex flex-col items-center justify-center mb-4">
      <img src="/images/products/${product.image}" class="filter-drop-shadow h-24" alt="${product.name} image">
      </div>
    <div class="flex flex-row justify-between w-full">
    <h3 class="text-xl font-bold mb-2">${product.name}</h3>
    <h3 class="text-xl font-bold mb-2">₹${product.price}</h3>
    </div>
    <div class="flex flex-row items-center justify-between w-full">
    <div class="flex mb-10">
    <span class="text-black font-bold">Category:</span>
    <span class="text-gray-600">${product.category}</span>
    </div>
    <div class="mb-10">
    <span class="text-black font-bold">Type:</span>
    <span class="text-gray-600">${product.type}</span>
    </div>
    </div>
    <div class="text-md font-bold flex flex-row items-start w-full">Descreption: <span><p class="text-base text-gray-600 mb-4 font-normal">${product.description}</p></span></div>

    <div class="text-center">
        <button
        data-item='{"id": "${product._id.toString()}","image": "${product.image}", "name": "${product.name}", "type": "${product.type}", "price": ${product.price}}'
    class="hollow-btn rounded-full font-bold py-2 px-4 my-2 rounded focus:outline-none focus:shadow-outline"
    >
    Add to cart
    </button>
    </div>
        `;

      productContainer.appendChild(productItem);

      const addToCartBtn = productItem.querySelector(".hollow-btn");

      addToCartBtn.addEventListener("click", function () {
        const productData = JSON.parse(addToCartBtn.dataset.item);

        axios
          .post("/mycart", productData)
          .then((res) => {
            // console.log(res.data.counter)
            cartCounter.classList.remove("text-xl")
            cartCounter.classList.add("text-2xl")
            cartCounter.innerText = res.data.counter;
          })
          .catch((err) => {
            console.log(err);
          });
      });
    });

    cursor = nextCursor;

    if (hasNextPage) {
      observeLastProduct();
    }

    hideLoadingIndicator();
  } catch (error) {
    hideLoadingIndicator();
  }
}

async function loadMore() {
  if (!loading) {
    loading = true;
    // console.log("calling the fetch fuction");
    await fetchProducts();
    loading = false;
  }
}

let loading = false;
async function handleIntersection(entries) {
//   console.log("handling the event");
  const lastProduct = entries[0];
  if (lastProduct.isIntersecting) {
    observer.unobserve(lastProduct.target);
    // console.log("calling the load more function");
    await loadMore();
  }
}

const observer = new IntersectionObserver(handleIntersection);

function observeLastProduct() {
//   console.log("here in observe function");
  const lastProduct = document.querySelector("#content > div:last-child");
//   console.log(lastProduct);
  if (lastProduct) {
    // console.log("calling the last observer.");
    observer.observe(lastProduct);
  }
}

function showLoadingIndicator() {
//   console.log("showing the indicator");
  loadingIndicator.classList.remove("hidden");
}

function hideLoadingIndicator() {
//   console.log("hiding the indicator");
  loadingIndicator.classList.add("hidden");
}

fetchProducts();
