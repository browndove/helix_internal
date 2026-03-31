"use client";

import { FormEvent, useMemo, useState } from "react";
import { PortalSelect } from "@/components/ui/PortalSelect";
import { formatGhanaPhoneInputValue, normalizeToGhanaInternationalPhone } from "@/lib/staffPhone";
import { FacilityInput } from "@/lib/types";

interface AddFacilityDrawerProps {
  onClose: () => void;
  onAdd: (input: FacilityInput) => void | Promise<boolean>;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

const initialFacility = {
  name: "",
  city: "",
  region: "",
  address: "",
  adminEmail: "",
  subscriptionType: ""
};

const initialContact = {
  firstName: "",
  lastName: "",
  phone: "",
  email: ""
};

export function AddFacilityDrawer({
  onClose,
  onAdd,
  isSubmitting = false,
  errorMessage
}: AddFacilityDrawerProps) {
  const [facility, setFacility] = useState(initialFacility);
  const [contact, setContact] = useState(initialContact);
  const [contactPhoneError, setContactPhoneError] = useState<string | null>(null);

  const subscriptionSelectOptions = useMemo(
    () => [
      { value: "", label: "Select type" },
      { value: "1-year", label: "1 Year" },
      { value: "2-year", label: "2 Year" },
      { value: "trial", label: "Trial" },
    ],
    []
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setContactPhoneError(null);

    const phoneFormatted = formatGhanaPhoneInputValue(contact.phone);
    const national = phoneFormatted.slice(4);
    if (national.length > 0 && national.length !== 9) {
      setContactPhoneError("Enter exactly 9 digits after +233, or leave the number blank.");
      return;
    }
    const primaryContactPhone =
      national.length === 9 ? normalizeToGhanaInternationalPhone(phoneFormatted) ?? phoneFormatted : undefined;

    const input: FacilityInput = {
      name: facility.name.trim(),
      adminEmail: facility.adminEmail.trim() || contact.email.trim() || "",
      city: facility.city.trim(),
      region: facility.region.trim(),
      address: facility.address.trim(),
      subscriptionType: facility.subscriptionType?.trim() || undefined,
      primaryContactEmail: contact.email?.trim() || undefined,
      primaryContactFirstName: contact.firstName?.trim() || undefined,
      primaryContactLastName: contact.lastName?.trim() || undefined,
      primaryContactPhone,
    };
    if (!input.name || !input.adminEmail || !input.city || !input.region || !input.address) return;
    const ok = await onAdd(input);
    if (ok) {
      setFacility(initialFacility);
      setContact(initialContact);
      onClose();
    }
  };

  return (
    <div className="add-facility-drawer">
      <aside className="add-facility-panel">
        <header className="add-facility-header">
          <h2 className="add-facility-title">Add Facility</h2>
          <button
            type="button"
            className="add-facility-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit} className="add-facility-form">
          <div className="add-facility-body">
            <section className="add-facility-section">
              <h3 className="add-facility-section-title">Facility Details</h3>
              <div className="add-facility-fields">
                <label className="add-facility-field">
                  <span className="add-facility-label">Facility Name</span>
                  <input
                    type="text"
                    value={facility.name}
                    onChange={(e) => setFacility((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. West Operations Clinic"
                    className="add-facility-input"
                    required
                  />
                </label>
                <label className="add-facility-field">
                  <span className="add-facility-label">City</span>
                  <input
                    type="text"
                    value={facility.city}
                    onChange={(e) => setFacility((p) => ({ ...p, city: e.target.value }))}
                    placeholder="e.g. Accra"
                    className="add-facility-input"
                    required
                  />
                </label>
                <label className="add-facility-field">
                  <span className="add-facility-label">Region</span>
                  <input
                    type="text"
                    value={facility.region}
                    onChange={(e) => setFacility((p) => ({ ...p, region: e.target.value }))}
                    placeholder="e.g. Greater Accra"
                    className="add-facility-input"
                    required
                  />
                </label>
                <label className="add-facility-field">
                  <span className="add-facility-label">Address</span>
                  <input
                    type="text"
                    value={facility.address}
                    onChange={(e) => setFacility((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Full address"
                    className="add-facility-input"
                    required
                  />
                </label>
                <label className="add-facility-field">
                  <span className="add-facility-label">Admin Email</span>
                  <input
                    type="email"
                    value={facility.adminEmail}
                    onChange={(e) => setFacility((p) => ({ ...p, adminEmail: e.target.value }))}
                    placeholder="admin@facility.org"
                    className="add-facility-input"
                    required
                  />
                </label>
                <label className="add-facility-field" htmlFor="add-facility-subscription">
                  <span className="add-facility-label">Subscription Type</span>
                  <PortalSelect
                    id="add-facility-subscription"
                    value={facility.subscriptionType}
                    onChange={(v) => setFacility((p) => ({ ...p, subscriptionType: v }))}
                    options={subscriptionSelectOptions}
                    placeholder="Select type"
                    triggerClassName="add-facility-input portal-select-trigger"
                  />
                </label>
              </div>
            </section>

            <section className="add-facility-section">
              <h3 className="add-facility-section-title">Primary Contact</h3>
              <div className="add-facility-fields">
                <label className="add-facility-field">
                  <span className="add-facility-label">First Name</span>
                  <input
                    type="text"
                    value={contact.firstName}
                    onChange={(e) => setContact((p) => ({ ...p, firstName: e.target.value }))}
                    placeholder="First name"
                    className="add-facility-input"
                  />
                </label>
                <label className="add-facility-field">
                  <span className="add-facility-label">Last Name</span>
                  <input
                    type="text"
                    value={contact.lastName}
                    onChange={(e) => setContact((p) => ({ ...p, lastName: e.target.value }))}
                    placeholder="Last name"
                    className="add-facility-input"
                  />
                </label>
                <label className="add-facility-field" htmlFor="add-facility-contact-phone">
                  <span className="add-facility-label">Phone Number</span>
                  <input
                    id="add-facility-contact-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={formatGhanaPhoneInputValue(contact.phone)}
                    onChange={(e) => {
                      setContactPhoneError(null);
                      setContact((p) => ({
                        ...p,
                        phone: formatGhanaPhoneInputValue(e.target.value),
                      }));
                    }}
                    placeholder="+233_________"
                    className="add-facility-input"
                    aria-describedby="add-facility-contact-phone-hint"
                  />
                  <p id="add-facility-contact-phone-hint" className="add-facility-field-hint">
                    +233 is fixed. Type digits only — exactly 9 after the country code, or leave blank.
                  </p>
                </label>
                <label className="add-facility-field">
                  <span className="add-facility-label">Contact Email</span>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
                    placeholder="contact@facility.org"
                    className="add-facility-input"
                  />
                </label>
              </div>
            </section>
          </div>

          {(contactPhoneError || errorMessage) && (
            <p className="add-facility-error">{contactPhoneError || errorMessage}</p>
          )}

          <footer className="add-facility-footer">
            <button type="button" className="add-facility-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="add-facility-btn-submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Add Facility"}
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
}
