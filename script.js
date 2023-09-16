const productContainer = document.getElementById('product-list');
const cartContainer = document.getElementById('block-cart');
const totalPriceString = document.getElementById('totalPrice');
const itemsPerPage = 24;
let currentPage = 1;
let totalProducts = 461;
let cartArray = [];
let totalPrice = 0;


async function getData(page) {
    try {
        const response = await fetch(`https://voodoo-sandbox.myshopify.com/products.json?limit=${itemsPerPage}&page=${page}`);
        if (!response.ok) {
            throw new Error(`Ошибка сети: ${response.status}`);
        }
        const data = await response.json();
        console.log(data.products);
        return data.products;
    } catch (error) {
        console.error('Произошла ошибка:', error);
        return [];
    }
}

function addToCart(button) {
    const product = JSON.parse(button.getAttribute('data-product'));
    updateTotalPrice(product);
    const findItem = cartArray.find(item => item.id === product.id);
    if (findItem) {
        findItem.count++;
    } else {
        const newProduct = {
            ...product,
            count: 1,
        };
        cartArray.push(newProduct);
    }
    updateCartDisplay();
}


function updateCartDisplay() {
    cartContainer.innerHTML = '';
    if(!cartArray.length){
        cartContainer.innerHTML += `<div class="mt-8 w-[355px] flex m-auto relative">
            <div class="flex justify-between items-center">
                <div class="ml-4 text-[12px]">
                    <h1 class="text-[20px]">Cart is empty:(</h1>
                </div>
            </div>
        </div>`
    }else {
        cartArray.forEach(item => {
            cartContainer.innerHTML += `<div class="mt-8 w-[355px] flex m-auto relative">
            <img src="${item.images[0].src}" class="border-[#FCF7E6] w-[75px] h-[75px]" />
            <div class="flex justify-between items-center">
                <div class="ml-4 text-[12px]">
                    <p>${item.title}</p>
                    <p>${item.variants[0].price} KR</p>
                    <div class="flex justify-between text-[17px] mt-[10px] cursor-pointer">
                        <p onclick="handleMinus(${item.id})">-</p>
                        <p>${item.count}</p>
                        <p onclick="handlePlus(${item.id})">+</p>
                    </div>
                </div>
                <div class='img-div absolute top-0 right-0'>
                    <img class="" src="icons/delete.svg" onclick="removeProduct(${item.id})" />
                </div>
            </div>
        </div>`;
        });
    }
}
function updateTotalPrice (){
    totalPrice = cartArray.reduce((sum, obj) => {
        return obj.variants[0].price * obj.count + sum;
    }, 0);
    totalPriceString.innerHTML = Math.floor(totalPrice);
}

function handlePlus(productId) {
    const findItem = cartArray.find(item => item.id === productId);

    if (findItem) {
        findItem.count++;
    }
    updateTotalPrice();
    updateCartDisplay();
}

function handleMinus(productId) {
    const findItem = cartArray.find(item => item.id === productId);

    if (findItem && findItem.count > 1) {
        findItem.count--;
    }
    updateTotalPrice()
    updateCartDisplay();
}

function removeProduct(productId) {
    cartArray = cartArray.filter(item => item.id !== productId); // Присваиваем новый массив после фильтрации
    updateCartDisplay();
    updateTotalPrice();
}



function renderProduct(product) {
    let img = '';
    if (product.images && product.images[0] && product.images[0].src) {
        img = product.images[0].src;
    }
    const productElement = document.createElement('div');
    productElement.classList.add('product');
    productElement.innerHTML =
        `<img class="w-[280px] h-[280px] border-[1px] border-black" src="${img}"/>
        <div class="mt-[15px] flex justify-between max-w-[280px] font-bold">
            <div>
                <p>${product.title}</p>
                <p>${product.variants[0].price} KR</p>
            </div>
            <div class="mr-[10px] font-normal">
                <p>Condition</p>
                <p class="text-[15px]">Slightly used</p>
            </div>
        </div>
        <div class="flex flex-col justify-between mt-4">
                <button data-product='${JSON.stringify(product)}' onclick="addToCart(this)" class=" mt-[15px] bg-black w-[280px] h-[42px] text-white text-[14px] rounded-[4px] mb-[30px]">ADD TO CART</button>
</div>`;
    productContainer.appendChild(productElement);
}


async function loadCurrentPage() {
    const data = await getData(currentPage);
    createPaginationButtons()
    data.forEach(product => {
        renderProduct(product);
    });
}

const paginationPages = document.getElementById('pagination-pages');

function createPaginationButtons() {
    paginationPages.innerHTML = '';

    const totalPages = Math.ceil(totalProducts / itemsPerPage);
    const visiblePageCount = 5; // Количество видимых кнопок пагинации

    let startPage = Math.max(currentPage - Math.floor(visiblePageCount / 2), 1);
    let endPage = Math.min(startPage + visiblePageCount - 1, totalPages);

    if (endPage - startPage + 1 < visiblePageCount) {
        startPage = Math.max(endPage - visiblePageCount + 1, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.add('pagination-button');

        if (i === currentPage) {
            pageButton.classList.add('active-button');
        }

        pageButton.addEventListener('click', () => {
            currentPage = i;
            productContainer.innerHTML = '';
            loadCurrentPage();
            createPaginationButtons();
        });

        paginationPages.appendChild(pageButton);
    }

    if (totalPages > visiblePageCount && currentPage < totalPages - Math.floor(visiblePageCount / 2)) {
        const lastPageButton = document.createElement('button');
        lastPageButton.textContent = totalPages;
        lastPageButton.classList.add('pagination-button');

        lastPageButton.addEventListener('click', () => {
            currentPage = totalPages;
            productContainer.innerHTML = '';
            loadCurrentPage();
            createPaginationButtons();
        });

        paginationPages.appendChild(lastPageButton);
    }
}




// const prevPageButton = document.getElementById('prev-page');
//
// prevPageButton.addEventListener('click', () => {
//     if (currentPage > 1) {
//         currentPage--;
//         productContainer.innerHTML = '';
//         loadCurrentPage();
//     }
// });


// const nextPageButton = document.getElementById('next-page');
// nextPageButton.addEventListener('click', () => {
//     if (totalProducts / itemsPerPage >= currentPage) {
//         currentPage++;
//         productContainer.innerHTML = '';
//         loadCurrentPage();
//     }
// });
function openCartModal() {
    const cartModal = document.getElementById('cart-modal');
    const modalOverlay = document.createElement('div');
    modalOverlay.classList.add('modal-overlay');
    document.body.appendChild(modalOverlay);
    cartModal.classList.remove('hidden');
    modalOverlay.addEventListener('click', closeCartModal);
}

function closeCartModal() {
    const cartModal = document.getElementById('cart-modal');
    const modalOverlay = document.querySelector('.modal-overlay');
    cartModal.classList.add('hidden');
    if (modalOverlay) {
        modalOverlay.remove();
    }
}

document.getElementById('open-cart-modal').addEventListener('click', openCartModal);
document.getElementById('close-cart-modal').addEventListener('click', closeCartModal);


loadCurrentPage();
createPaginationButtons();




document.querySelector('.info-block').addEventListener('click', function() {
    const infoContent = this.querySelector('.info-content');
    infoContent.classList.toggle('hidden');
});
document.addEventListener('DOMContentLoaded', function() {
    const clickableBlock = document.getElementById('clickable-block');

    clickableBlock.addEventListener('click', function() {
        const infoContent = document.querySelector('.info-content');
        const chevronIcon = document.getElementById('chevron-icon');

        clickableBlock.classList.toggle('info-expanded');
        chevronIcon.classList.toggle('rotated');
    });
});
