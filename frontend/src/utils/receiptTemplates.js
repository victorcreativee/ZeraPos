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
        <p class="small">CUSTOMER BILL</p>
      </div>
  
      <div class="line"></div>
  
      <p><strong>Order:</strong> ${order.order_number}</p>
      <p><strong>Table:</strong> ${order.table_name || "Takeaway"}</p>
      <p><strong>Server:</strong> ${order.server_name || "-"}</p>
  
      <div class="line"></div>
  
      ${order.items
        .map(
          (item) => `
          <div class="row">
            <span>${item.product_name} x ${item.quantity}</span>
            <span>${formatMoney(item.total_price)}</span>
          </div>
        `
        )
        .join("")}
  
      <div class="line"></div>
  
      <div class="row total">
        <span>Total</span>
        <span>${formatMoney(order.total)}</span>
      </div>
  
      <div class="line"></div>
  
      <p class="small"><strong>Payment Options:</strong></p>
      <p class="small">Cash | MTN MoMo | Airtel Money | Card</p>
      <p class="center small">Thank you for choosing us.</p>
    `;
}
export function buildPaidReceipt(order, paymentMethod = "Cash") {
  return `
      <div class="center">
        <h2>ZERA POS</h2>
        <p class="small">PAID RECEIPT</p>
      </div>
  
      <div class="line"></div>
  
      <p><strong>Order:</strong> ${order.order_number}</p>
      <p><strong>Table:</strong> ${order.table_name || "Takeaway"}</p>
      <p><strong>Server:</strong> ${order.server_name || "-"}</p>
  
      <div class="line"></div>
  
      ${order.items
        .map(
          (item) => `
          <div class="row">
            <span>${item.product_name} x ${item.quantity}</span>
            <span>${formatMoney(item.total_price)}</span>
          </div>
        `
        )
        .join("")}
  
      <div class="line"></div>
  
      <div class="row total">
        <span>Total Paid</span>
        <span>${formatMoney(order.total)}</span>
      </div>
  
      <div class="row">
        <span>Payment Method</span>
        <span>${paymentMethod}</span>
      </div>
  
      <div class="row">
        <span>Status</span>
        <span>PAID</span>
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
        <p class="small">${title}</p>
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
