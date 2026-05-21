function formatMoney(amount) {
  return `UGX ${Number(amount || 0).toLocaleString()}`;
}

export function buildKitchenBarTicket(order) {
  const kitchenItems = order.items.filter((item) => item.send_to === "kitchen");
  const barItems = order.items.filter((item) => item.send_to === "bar");
  const otherItems = order.items.filter((item) => item.send_to === "none");

  function renderItems(title, items) {
    if (!items.length) return "";

    return `
        <div class="line"></div>
        <h3>${title}</h3>
        ${items
          .map(
            (item) => `
            <div class="row">
              <span>${item.product_name} x ${item.quantity}</span>
              <span>${item.send_to}</span>
            </div>
          `
          )
          .join("")}
      `;
  }

  return `
      <div class="center">
        <h2>ZERA POS</h2>
        <p class="small">KITCHEN / BAR ORDER TICKET</p>
      </div>
  
      <div class="line"></div>
  
      <p><strong>Order:</strong> ${order.order_number}</p>
      <p><strong>Table:</strong> ${order.table_name || "Takeaway"}</p>
      <p><strong>Server:</strong> ${order.server_name || "-"}</p>
      <p><strong>Time:</strong> ${order.created_at}</p>
  
      ${renderItems("KITCHEN ITEMS", kitchenItems)}
      ${renderItems("BAR ITEMS", barItems)}
      ${renderItems("COUNTER ITEMS", otherItems)}
  
      <div class="line"></div>
      <p class="center small">Prepare items and hand to server.</p>
    `;
}

export function buildCustomerBill(order) {
  return `
    <div class="center">
      <h2>ZERA POS</h2>
      <p class="small muted">Customer Bill</p>
      <p class="tiny muted">Demo Bar & Restaurant</p>
    </div>

    <div class="solid-line"></div>

    <div class="row">
      <span class="bold">Bill No</span>
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
      <span>Date</span>
      <span>${new Date(order.created_at).toLocaleString()}</span>
    </div>

    <div class="line"></div>

    <div class="row bold small">
      <span>ITEM</span>
      <span>TOTAL</span>
    </div>

    <div class="line"></div>

    ${order.items
      .map(
        (item) => `
        <div class="row">
          <span>
            ${item.product_name}<br/>
            <span class="tiny muted">
              ${formatMoney(item.price)} x ${item.quantity}
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

    <p class="small bold">Payment Methods</p>

    <p class="small muted">
      Cash • MTN MoMo • Airtel Money • Card
    </p>

    <div class="line"></div>

    <p class="center small">
      Thank you for dining with us.
    </p>
  `;
}
export function buildPaidReceipt(order, paymentMethod = "Cash") {
  return `
    <div class="center">
      <h2>ZERA POS</h2>
      <p class="small muted">Official Payment Receipt</p>
      <p class="tiny muted">Demo Bar & Restaurant</p>
    </div>

    <div class="solid-line"></div>

    <div class="row">
      <span class="bold">Receipt No</span>
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
      <span>Date</span>
      <span>${new Date().toLocaleString()}</span>
    </div>

    <div class="line"></div>

    <div class="row bold small">
      <span>ITEM</span>
      <span>TOTAL</span>
    </div>

    <div class="line"></div>

    ${order.items
      .map(
        (item) => `
        <div class="row">
          <span>
            ${item.product_name}<br/>
            <span class="tiny muted">
              ${formatMoney(item.price)} x ${item.quantity}
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
      <span>Payment</span>
      <span>${paymentMethod}</span>
    </div>

    <div class="status-paid">
      PAID
    </div>

    <div class="line"></div>

    <p class="center small">
      Thank you for visiting.
    </p>
  `;
}

export function buildPreparationTicket(order, ticketType) {
  const filteredItems = order.items.filter(
    (item) => item.send_to === ticketType
  );

  if (!filteredItems.length) {
    return "";
  }

  const title = ticketType === "kitchen" ? "KITCHEN TICKET" : "BAR TICKET";

  return `
     <div class="center">
        <h2>ZERA POS</h2>
        <p class="small bold">${title}</p>
        <p class="tiny muted">Preparation Department</p>
      </div>
  
      <div class="line"></div>
  
      <p><strong>Order:</strong> ${order.order_number}</p>
      <p><strong>Table:</strong> ${order.table_name || "Takeaway"}</p>
      <p><strong>Server:</strong> ${order.server_name || "-"}</p>
      <p><strong>Time:</strong> ${order.created_at}</p>
  
      <div class="line"></div>
  
      ${filteredItems
        .map(
          (item) => `
          <div class="row">
            <span>${item.product_name}</span>
            <span>x ${item.quantity}</span>
          </div>
        `
        )
        .join("")}
  
      <div class="line"></div>
      <p class="center small">Prepare and hand to server.</p>
    `;
}
