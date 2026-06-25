const MENU = [
  {
    id: 1,
    name: '불고기 덮밥',
    price: 9500,
    image: 'https://images.unsplash.com/photo-1718777791239-c473e9ce7376?q=80&w=930&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 2,
    name: '김치찌개',
    price: 8000,
    image: 'https://images.unsplash.com/photo-1777113310299-c3e41dec4e0f?q=80&w=874&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 3,
    name: '치킨 가라아게',
    price: 11000,
    image: 'https://images.unsplash.com/photo-1727867168767-c67974f68508?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 4,
    name: '새우 튀김우동',
    price: 9000,
    image: 'https://images.unsplash.com/photo-1734529300659-e7c6cdc34efe?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 5,
    name: '치즈버거 세트',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1697642448516-e7901b86a425?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 6,
    name: '아이스 아메리카노',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1581996323441-538096e854b9?q=80&w=872&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];

const ORDER_TYPES = {
  'dine-in': { label: '먹고 가기', sub: 'For here' },
  takeout: { label: '포장하기', sub: 'To go' },
};

const PAYMENT_METHODS = {
  card: { label: '신용·체크카드', sub: 'Credit · Debit card' },
  mobile: { label: '모바일 결제', sub: 'Mobile pay' },
};

const RECEIPT_OPTIONS = {
  print: { label: '영수증 출력', sub: 'Print receipt' },
  number: { label: '주문 번호만 받기', sub: 'Order number only' },
};

const quantities = Object.fromEntries(MENU.map((item) => [item.id, 0]));
const MODAL_AUTO_CLOSE_SEC = 5;
const ORDER_IDLE_SEC = 100;
const IDLE_RING_RADIUS = 42;
const IDLE_RING_CIRCUMFERENCE = 2 * Math.PI * IDLE_RING_RADIUS;

let orderType = null;
let paymentMethod = null;
let receiptOption = null;
let nextOrderNumber = 1;
let modalCountdownInterval = null;
let orderIdleInterval = null;
let orderIdleSecondsLeft = ORDER_IDLE_SEC;

const welcomeScreen = document.getElementById('welcome-screen');
const paymentScreen = document.getElementById('payment-screen');
const receiptScreen = document.getElementById('receipt-screen');
const app = document.getElementById('app');
const orderTypeBadge = document.getElementById('order-type-badge');
const menuGrid = document.getElementById('menu-grid');
const orderSummary = document.getElementById('order-summary');
const orderList = document.getElementById('order-list');
const totalAmountEl = document.getElementById('total-amount');
const orderBtn = document.getElementById('order-btn');
const homeBtn = document.getElementById('home-btn');
const orderBar = document.querySelector('.order-bar');
const paymentBack = document.getElementById('payment-back');
const receiptBack = document.getElementById('receipt-back');
const orderModal = document.getElementById('order-modal');
const modalOrderNumber = document.getElementById('modal-order-number');
const modalMessage = document.getElementById('modal-message');
const modalClose = document.getElementById('modal-close');
const modalCountdown = document.getElementById('modal-countdown');
const modalBackdrop = document.getElementById('modal-backdrop');
const idleTimer = document.getElementById('idle-timer');
const idleTimerValue = document.getElementById('idle-timer-value');
const idleTimerProgress = document.getElementById('idle-timer-progress');

idleTimerProgress.style.strokeDasharray = String(IDLE_RING_CIRCUMFERENCE);

function clearModalAutoClose() {
  if (modalCountdownInterval) {
    clearInterval(modalCountdownInterval);
    modalCountdownInterval = null;
  }
  modalCountdown.textContent = String(MODAL_AUTO_CLOSE_SEC);
}

function hideIdleTimer() {
  idleTimer.hidden = true;
}

function updateIdleTimerDisplay() {
  idleTimerValue.textContent = String(orderIdleSecondsLeft);
  const progress = orderIdleSecondsLeft / ORDER_IDLE_SEC;
  idleTimerProgress.style.strokeDashoffset = String(
    IDLE_RING_CIRCUMFERENCE * (1 - progress)
  );
}

function clearOrderIdle() {
  if (orderIdleInterval) {
    clearInterval(orderIdleInterval);
    orderIdleInterval = null;
  }
  hideIdleTimer();
}

function startOrderIdleTimer() {
  clearOrderIdle();
  if (app.hidden) return;

  orderIdleSecondsLeft = ORDER_IDLE_SEC;
  idleTimer.hidden = false;
  updateIdleTimerDisplay();

  orderIdleInterval = setInterval(() => {
    orderIdleSecondsLeft -= 1;

    if (orderIdleSecondsLeft <= 0) {
      backToWelcome();
      return;
    }

    updateIdleTimerDisplay();
  }, 1000);
}

function resetOrderIdleTimer() {
  if (!app.hidden) {
    startOrderIdleTimer();
  }
}

function updateModalCountdown(secondsLeft) {
  modalCountdown.textContent = String(secondsLeft);
}

function startModalAutoClose() {
  clearModalAutoClose();

  let secondsLeft = MODAL_AUTO_CLOSE_SEC;
  updateModalCountdown(secondsLeft);

  modalCountdownInterval = setInterval(() => {
    secondsLeft -= 1;

    if (secondsLeft <= 0) {
      closeModal();
      return;
    }

    updateModalCountdown(secondsLeft);
  }, 1000);
}

function formatPrice(amount) {
  return amount.toLocaleString('ko-KR') + '원';
}

function formatOrderNumber(number) {
  return String(number).padStart(3, '0');
}

function getTotal() {
  return MENU.reduce((sum, item) => sum + item.price * quantities[item.id], 0);
}

function updatePageBottom() {
  const height = orderBar.offsetHeight;
  document.documentElement.style.setProperty(
    '--page-bottom',
    `calc(${height + 32}px + env(safe-area-inset-bottom, 0px))`
  );
}

function updateOrderSummary() {
  const selected = MENU.filter((item) => quantities[item.id] > 0);

  orderSummary.classList.toggle('is-empty', selected.length === 0);
  orderList.innerHTML = selected
    .map(
      (item) => `
        <li class="order-bar__item">
          <span class="order-bar__item-name">${item.name}</span>
          <span class="order-bar__item-qty">x${quantities[item.id]}</span>
        </li>
      `
    )
    .join('');

  requestAnimationFrame(updatePageBottom);
}

function updateUI() {
  const total = getTotal();

  totalAmountEl.textContent = formatPrice(total);
  orderBtn.disabled = total === 0;
  updateOrderSummary();

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
        <img class="menu-card__image" src="${item.image}" alt="${item.name}" loading="lazy" width="120" height="120">
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
  paymentMethod = null;
  receiptOption = null;
  updateUI();
}

function startOrdering(type) {
  orderType = type;
  const info = ORDER_TYPES[type];
  orderTypeBadge.textContent = `${info.label} · ${info.sub}`;
  welcomeScreen.hidden = true;
  app.hidden = false;
  requestAnimationFrame(updatePageBottom);
  startOrderIdleTimer();
}

function backToWelcome() {
  clearModalAutoClose();
  clearOrderIdle();
  orderModal.classList.add('hidden');
  orderType = null;
  resetOrder();
  paymentScreen.hidden = true;
  receiptScreen.hidden = true;
  welcomeScreen.hidden = false;
  app.hidden = true;
}

function openPaymentScreen() {
  clearOrderIdle();
  app.hidden = true;
  paymentScreen.hidden = false;
}

function openReceiptScreen() {
  paymentScreen.hidden = true;
  receiptScreen.hidden = false;
}

function backToMenu() {
  paymentScreen.hidden = true;
  app.hidden = false;
  requestAnimationFrame(updatePageBottom);
  startOrderIdleTimer();
}

function backToPayment() {
  receiptScreen.hidden = true;
  paymentScreen.hidden = false;
}

function completeOrder() {
  const orderNumber = formatOrderNumber(nextOrderNumber);
  nextOrderNumber += 1;

  const total = getTotal();
  const summary = getOrderSummary().join(', ');
  const typeInfo = ORDER_TYPES[orderType];

  modalOrderNumber.textContent = orderNumber;
  modalMessage.textContent = [
    `${typeInfo.label} · ${typeInfo.sub}`,
    summary,
    `Total ${formatPrice(total)}`,
  ].join('\n');

  receiptScreen.hidden = true;
  clearOrderIdle();
  orderModal.classList.remove('hidden');
  startModalAutoClose();
}

function closeModal() {
  clearModalAutoClose();
  orderModal.classList.add('hidden');
  backToWelcome();
}

welcomeScreen.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-type]');
  if (!btn) return;
  startOrdering(btn.dataset.type);
});

paymentScreen.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-payment]');
  if (!btn) return;
  paymentMethod = btn.dataset.payment;
  openReceiptScreen();
});

receiptScreen.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-receipt]');
  if (!btn) return;
  receiptOption = btn.dataset.receipt;
  completeOrder();
});

orderBtn.addEventListener('click', openPaymentScreen);
homeBtn.addEventListener('click', backToWelcome);
paymentBack.addEventListener('click', backToMenu);
receiptBack.addEventListener('click', backToPayment);
modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);

app.addEventListener('click', resetOrderIdleTimer);
app.addEventListener('touchstart', resetOrderIdleTimer, { passive: true });

const orderBarObserver = new ResizeObserver(updatePageBottom);
orderBarObserver.observe(orderBar);

renderMenu();
updateUI();
updatePageBottom();
