export function getBusinessSettings() {
  try {
    const raw = localStorage.getItem("zera_settings");

    if (!raw) {
      return getFallbackSettings();
    }

    return {
      ...getFallbackSettings(),
      ...JSON.parse(raw),
    };
  } catch {
    return getFallbackSettings();
  }
}

export function getEnabledPaymentMethods() {
  const settings = getBusinessSettings();

  return [
    settings.enable_cash ? "cash" : null,
    settings.enable_mobile_money ? "mobile_money" : null,
    settings.enable_card ? "card" : null,
  ].filter(Boolean);
}

export function getDefaultPaymentMethod() {
  const methods = getEnabledPaymentMethods();
  return methods[0] || "";
}

export function isKitchenTicketPrintingEnabled() {
  return Boolean(Number(getBusinessSettings().enable_kitchen_ticket_printing));
}

export function isBarTicketPrintingEnabled() {
  return Boolean(Number(getBusinessSettings().enable_bar_ticket_printing));
}

export function isKitchenScreenEnabled() {
  return Boolean(Number(getBusinessSettings().enable_kitchen_screen));
}

export function isBarScreenEnabled() {
  return Boolean(Number(getBusinessSettings().enable_bar_screen));
}

function getFallbackSettings() {
  return {
    business_name: "ZERA POS",
    phone: "",
    address: "",
    tin: "",
    currency: "UGX",
    receipt_footer: "Thank you for dining with us.",

    enable_kitchen_screen: 1,
    enable_bar_screen: 1,
    enable_kitchen_ticket_printing: 1,
    enable_bar_ticket_printing: 1,

    enable_cash: 1,
    enable_mobile_money: 1,
    enable_card: 1,
  };
}
