function formatMoney(amount) {
  return `UGX ${Number(amount || 0).toLocaleString()}`;
}

function formatDate(date) {
  if (!date) return new Date().toLocaleString();
  return new Date(date).toLocaleString();
}

export function buildPreparationTicket(order, ticketType) {
  const filteredItems = order.items.filter(
    (item) => item.send_to === ticketType
  );

  if (!filteredItems.length) return "";

  const title = ticketType === "kitchen" ? "KITCHEN TICKET" : "BAR TICKET";

  return `
    <div class="center">
      <h2>DEMO BAR & RESTAURANT</h2>
      <p class="small bold">${title}</p>
    </div>

    <div class="solid-line"></div>

    <div class="row">
      <span>Table</span>
      <span>${order.table_name || "Takeaway"}</span>
    </div>

    <div class="row">
      <span>Order</span>
      <span>${order.order_number}</span>
    </div>

    <div class="row">
      <span>Server</span>
      <span>${order.server_name || "-"}</span>
    </div>

    <div class="row">
      <span>Time</span>
      <span>${formatDate(order.created_at)}</span>
    </div>

    <div class="solid-line"></div>

    ${filteredItems
      .map(
        (item) => `
        <div class="row total">
          <span>${item.product_name}</span>
          <span>x ${item.quantity}</span>
        </div>
      `
      )
      .join("")}

    <div class="solid-line"></div>

    <p class="center small bold">Prepare and hand to server</p>
  `;
}

export function buildCustomerBill(order) {
  return `
    <div class="center">
      <h2>DEMO BAR & RESTAURANT</h2>
      <p class="small bold">CUSTOMER BILL</p>
      <p class="tiny muted">Not a payment receipt</p>
    </div>

    <div class="solid-line"></div>

    <div class="row">
      <span>Table</span>
      <span>${order.table_name || "Takeaway"}</span>
    </div>

    <div class="row">
      <span>Order</span>
      <span>${order.order_number}</span>
    </div>

    <div class="row">
      <span>Server</span>
      <span>${order.server_name || "-"}</span>
    </div>

    <div class="row">
      <span>Time</span>
      <span>${formatDate(order.created_at)}</span>
    </div>

    <div class="line"></div>

    ${order.items
      .map(
        (item) => `
        <div class="row">
          <span>
            ${item.product_name}<br/>
            <span class="tiny muted">
              ${item.quantity} x ${formatMoney(item.unit_price)}
            </span>
          </span>
          <span>${formatMoney(item.total_price)}</span>
        </div>
      `
      )
      .join("")}

    <div class="solid-line"></div>

    <div class="row total">
      <span>TOTAL</span>
      <span>${formatMoney(order.total)}</span>
    </div>

    <div class="line"></div>

    <p class="small bold">Payment Options</p>
    <p class="small muted">Cash • MTN MoMo • Airtel Money • Card</p>

    <div class="line"></div>

    <p class="center small">Thank you for dining with us.</p>
  `;
}

export function buildCombinedCustomerBill(bill) {
  const items = bill.items || [];
  const orders = bill.orders || [];

  return `
    <div class="center">
      <h2>DEMO BAR & RESTAURANT</h2>
      <p class="small bold">COMBINED CUSTOMER BILL</p>
      <p class="tiny muted">Not a payment receipt</p>
    </div>

    <div class="solid-line"></div>

    <div class="row">
      <span>Table</span>
      <span>${bill.table?.name || "Table"}</span>
    </div>

    <div class="row">
      <span>Orders</span>
      <span>${orders.map((order) => order.order_number).join(", ")}</span>
    </div>

    <div class="row">
      <span>Time</span>
      <span>${formatDate()}</span>
    </div>

    <div class="line"></div>

    ${items
      .map(
        (item) => `
        <div class="row">
          <span>
            ${item.product_name}<br/>
            <span class="tiny muted">
              ${item.quantity} x ${formatMoney(item.unit_price)}
            </span>
          </span>
          <span>${formatMoney(item.total_price)}</span>
        </div>
      `
      )
      .join("")}

    <div class="solid-line"></div>

    <div class="row total">
      <span>TOTAL</span>
      <span>${formatMoney(bill.total)}</span>
    </div>

    <div class="line"></div>

    <p class="small bold">Payment Options</p>
    <p class="small muted">Cash • MTN MoMo • Airtel Money • Card</p>

    <div class="line"></div>

    <p class="center small">Thank you for dining with us.</p>
  `;
}

export function buildPaidReceipt(order, paymentMethod = "Cash") {
  return `
    <div class="center">
      <h2>DEMO BAR & RESTAURANT</h2>
      <p class="small bold">PAYMENT RECEIPT</p>
    </div>

    <div class="solid-line"></div>

    <div class="row">
      <span>Order</span>
      <span>${order.order_number}</span>
    </div>

    <div class="row">
      <span>Table</span>
      <span>${order.table_name || "Takeaway"}</span>
    </div>

    <div class="row">
      <span>Server</span>
      <span>${order.server_name || "-"}</span>
    </div>

    <div class="row">
      <span>Time</span>
      <span>${formatDate()}</span>
    </div>

    <div class="line"></div>

    ${order.items
      .map(
        (item) => `
        <div class="row">
          <span>
            ${item.product_name}<br/>
            <span class="tiny muted">
              ${item.quantity} x ${formatMoney(item.unit_price)}
            </span>
          </span>
          <span>${formatMoney(item.total_price)}</span>
        </div>
      `
      )
      .join("")}

    <div class="solid-line"></div>

    <div class="row total">
      <span>TOTAL PAID</span>
      <span>${formatMoney(order.total)}</span>
    </div>

    <div class="row">
      <span>Method</span>
      <span>${paymentMethod}</span>
    </div>

    <div class="status-paid">PAID</div>

    <div class="line"></div>

    <p class="center small">Thank you for visiting.</p>
  `;
}
