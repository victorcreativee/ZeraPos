import { getBusinessSettings } from "./businessSettings";

function formatMoney(amount) {
  const settings = getBusinessSettings();
  const currency = settings.currency || "UGX";

  return `${currency} ${Number(amount || 0).toLocaleString()}`;
}

function formatDate(date) {
  if (!date) return new Date().toLocaleString();
  return new Date(date).toLocaleString();
}

function businessHeader(subtitle, note = "") {
  const settings = getBusinessSettings();

  return `
    <div class="center">
      <h2>${settings.business_name || "ZERA POS"}</h2>
      ${settings.address ? `<p class="tiny muted">${settings.address}</p>` : ""}
      ${
        settings.phone ? `<p class="tiny muted">Tel: ${settings.phone}</p>` : ""
      }
      ${settings.tin ? `<p class="tiny muted">TIN: ${settings.tin}</p>` : ""}
      <p class="small bold">${subtitle}</p>
      ${note ? `<p class="tiny muted">${note}</p>` : ""}
    </div>
  `;
}

function receiptFooter() {
  const settings = getBusinessSettings();

  return `
    <div class="line"></div>
    <p class="center small">
      ${settings.receipt_footer || "Thank you for dining with us."}
    </p>
  `;
}

export function buildPreparationTicket(order, ticketType) {
  const filteredItems = order.items.filter(
    (item) => item.send_to === ticketType
  );

  if (!filteredItems.length) return "";

  const title = ticketType === "kitchen" ? "KITCHEN TICKET" : "BAR TICKET";

  return `
    ${businessHeader(title)}

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
    ${businessHeader("CUSTOMER BILL", "Not a payment receipt")}

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

    ${receiptFooter()}
  `;
}

export function buildCombinedCustomerBill(bill) {
  const items = bill.items || [];
  const orders = bill.orders || [];

  return `
    ${businessHeader("COMBINED CUSTOMER BILL", "Not a payment receipt")}

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

    ${receiptFooter()}
  `;
}

export function buildPaidReceipt(order, paymentMethod = "Cash") {
  return `
    ${businessHeader("PAYMENT RECEIPT")}

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

    ${receiptFooter()}
  `;
}

export function buildCombinedPaidReceipt(payment) {
  const orders = payment.orders || [];
  const items = payment.items || [];
  const paymentMethod = payment.method
    ? payment.method.replace("_", " ").toUpperCase()
    : "CASH";

  return `
    ${businessHeader("COMBINED PAYMENT RECEIPT")}

    <div class="solid-line"></div>

    <div class="row">
      <span>Table</span>
      <span>${payment.table?.name || "Table"}</span>
    </div>

    <div class="row">
      <span>Orders</span>
      <span>${orders.map((order) => order.order_number).join(", ")}</span>
    </div>

    <div class="row">
      <span>Method</span>
      <span>${paymentMethod}</span>
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
      <span>TOTAL PAID</span>
      <span>${formatMoney(payment.amount)}</span>
    </div>

    <div class="status-paid">PAID</div>

    ${receiptFooter()}
  `;
}
