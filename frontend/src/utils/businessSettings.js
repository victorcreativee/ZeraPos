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

function getFallbackSettings() {
  return {
    business_name: "ZERA POS",
    phone: "",
    address: "",
    tin: "",
    currency: "UGX",
    receipt_footer: "Thank you for dining with us.",
  };
}
