const MENU = [
  { id: 1, name: '불고기 덮밥', price: 9500, emoji: '🍚' },
  { id: 2, name: '김치찌개', price: 8000, emoji: '🍲' },
  { id: 3, name: '치킨 가라아게', price: 11000, emoji: '🍗' },
  { id: 4, name: '새우 튀김우동', price: 9000, emoji: '🍜' },
  { id: 5, name: '치즈버거 세트', price: 8500, emoji: '🍔' },
  { id: 6, name: '아이스 아메리카노', price: 4500, emoji: '☕' },
];

const quantities = Object.fromEntries(MENU.map((item) => [item.id, 0]));

const menuGrid = document.getElementById('menu-grid');
const totalAmountEl = document.getElementById('total-amount');
const orderBtn = document.getElementById('order-btn');
const orderModal = document.getElementById('order-modal');
const modalMessage = document.getElementById('modal-message');
const modalClose = document.getElementById('modal-close');
const modalBackdrop = document.getElementById('modal-backdrop');

function formatPrice(amount) {
  return amount.toLocaleString('ko-KR') + '원';
}

function getTotal() {
  return MENU.reduce((sum, item) => sum + item.price * quantities[item.id], 0);
}

function updateUI() {
  const total = getTotal();

  totalAmountEl.textContent = formatPrice(total);
  orderBtn.disabled = total === 0;

  MENU.forEach((item) => {
    const card = document.querySelector(`[data-id="${item.id}"]`);
    const countEl = card.querySelector('.qty-control__count');
    const minusBtn = card.querySelector('[data-action="minus"]');

    countEl.textContent = quantities[item.id];
    minusBtn.disabled = quantities[item.id] === 0;
    card.classList.toggle('menu-card--active', quantities[item.id] > 0);
  });
}

function changeQty(id, delta) {
  quantities[id] = Math.max(0, quantities[id] + delta);
  updateUI();
}

function renderMenu() {
  menuGrid.innerHTML = MENU.map(
    (item) => `
      <article class="menu-card" data-id="${item.id}">
        <span class="menu-card__emoji" aria-hidden="true">${item.emoji}</span>
        <h2 class="menu-card__name">${item.name}</h2>
        <p class="menu-card__price">${formatPrice(item.price)}</p>
        <div class="qty-control">
          <div class="qty-control__slot">
            <button type="button" class="qty-control__btn qty-control__btn--minus" data-action="minus" aria-label="${item.name} 수량 줄이기">
              <span class="qty-icon qty-icon--minus" aria-hidden="true"></span>
            </button>
          </div>
          <div class="qty-control__slot">
            <span class="qty-control__count" aria-live="polite">0</span>
          </div>
          <div class="qty-control__slot">
            <button type="button" class="qty-control__btn qty-control__btn--plus" data-action="plus" aria-label="${item.name} 수량 늘리기">
              <span class="qty-icon qty-icon--plus" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </article>
    `
  ).join('');

  menuGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const card = btn.closest('.menu-card');
    const id = Number(card.dataset.id);
    const action = btn.dataset.action;

    changeQty(id, action === 'plus' ? 1 : -1);
  });
}

function getOrderSummary() {
  return MENU.filter((item) => quantities[item.id] > 0).map(
    (item) => `${item.name} x${quantities[item.id]}`
  );
}

function resetOrder() {
  MENU.forEach((item) => {
    quantities[item.id] = 0;
  });
  updateUI();
}

function showOrderComplete() {
  const total = getTotal();
  const summary = getOrderSummary().join(', ');

  modalMessage.textContent = `${summary}\n총 ${formatPrice(total)}`;
  orderModal.classList.remove('hidden');
}

function closeModal() {
  orderModal.classList.add('hidden');
  resetOrder();
}

orderBtn.addEventListener('click', showOrderComplete);
modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);

renderMenu();
updateUI();
