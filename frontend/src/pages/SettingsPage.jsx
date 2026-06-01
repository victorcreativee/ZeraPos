import { useEffect, useState } from "react";
import AppHeader from "../components/layout/AppHeader";
import { getSettings, updateSettings } from "../api/settingsApi";

function SettingsPage() {
  const [activeTab, setActiveTab] = useState("business");
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  async function loadSettings() {
    try {
      const response = await getSettings();
      setSettings(response.data);
      localStorage.setItem("zera_settings", JSON.stringify(response.data));
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function handleSave() {
    try {
      setSaving(true);

      const response = await updateSettings(settings);

      setSettings(response.data);
      localStorage.setItem("zera_settings", JSON.stringify(response.data));

      setSuccess("Settings saved successfully");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.log(error);
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-slate-100">
        <AppHeader title="Settings" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <AppHeader
        title="System Settings"
        subtitle="Configure business and POS behaviour"
        showBackToDashboard
      />

      <main className="p-6">
        <div className="grid xl:grid-cols-[220px_1fr] gap-6">
          <aside className="rounded-3xl bg-white border border-slate-200 p-3">
            {[
              ["business", "Business"],
              ["receipts", "Receipts"],
              ["operations", "Operations"],
              ["payments", "Payments"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full text-left rounded-2xl px-4 py-3 font-black mb-2 ${
                  activeTab === key
                    ? "bg-slate-950 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {label}
              </button>
            ))}
          </aside>

          <section className="rounded-3xl bg-white border border-slate-200 p-6">
            {activeTab === "business" && (
              <>
                <h2 className="text-2xl font-black">Business Profile</h2>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <Field
                    label="Business Name"
                    value={settings.business_name}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        business_name: value,
                      })
                    }
                  />

                  <Field
                    label="Phone"
                    value={settings.phone}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        phone: value,
                      })
                    }
                  />

                  <Field
                    label="Address"
                    value={settings.address}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        address: value,
                      })
                    }
                  />

                  <Field
                    label="TIN"
                    value={settings.tin}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        tin: value,
                      })
                    }
                  />
                </div>
              </>
            )}

            {activeTab === "receipts" && (
              <>
                <h2 className="text-2xl font-black">Receipt Settings</h2>

                <div className="mt-6">
                  <Field
                    label="Receipt Footer"
                    value={settings.receipt_footer}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        receipt_footer: value,
                      })
                    }
                  />
                </div>
              </>
            )}

            {activeTab === "operations" && (
              <>
                <h2 className="text-2xl font-black">Operations</h2>

                <div className="space-y-4 mt-6">
                  <Toggle
                    label="Kitchen Screen"
                    value={settings.enable_kitchen_screen}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        enable_kitchen_screen: value,
                      })
                    }
                  />

                  <Toggle
                    label="Bar Screen"
                    value={settings.enable_bar_screen}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        enable_bar_screen: value,
                      })
                    }
                  />
                </div>
              </>
            )}

            {activeTab === "payments" && (
              <>
                <h2 className="text-2xl font-black">Payment Methods</h2>

                <div className="space-y-4 mt-6">
                  <Toggle
                    label="Cash"
                    value={settings.enable_cash}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        enable_cash: value,
                      })
                    }
                  />

                  <Toggle
                    label="Mobile Money"
                    value={settings.enable_mobile_money}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        enable_mobile_money: value,
                      })
                    }
                  />

                  <Toggle
                    label="Card"
                    value={settings.enable_card}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        enable_card: value,
                      })
                    }
                  />
                </div>
              </>
            )}

            <div className="mt-8 flex justify-end gap-3">
              {success && (
                <span className="text-emerald-600 font-black">{success}</span>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-2xl bg-slate-950 px-6 py-3 font-black text-white"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-black mb-2">{label}</label>

      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 rounded-2xl border border-slate-200 px-4"
      />
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between border border-slate-200 rounded-2xl px-4 py-3">
      <span className="font-black">{label}</span>

      <button
        onClick={() => onChange(value ? 0 : 1)}
        className={`rounded-full px-4 py-2 text-sm font-black ${
          value ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
        }`}
      >
        {value ? "Enabled" : "Disabled"}
      </button>
    </div>
  );
}

export default SettingsPage;
