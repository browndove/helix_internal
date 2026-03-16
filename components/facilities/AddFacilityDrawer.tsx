"use client";

import { FormEvent, useState } from "react";
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      primaryContactPhone: contact.phone?.trim() || undefined,
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
                <label className="add-facility-field">
                  <span className="add-facility-label">Subscription Type</span>
                  <select
                    value={facility.subscriptionType}
                    onChange={(e) => setFacility((p) => ({ ...p, subscriptionType: e.target.value }))}
                    className="add-facility-input"
                  >
                    <option value="">Select type</option>
                    <option value="1-year">1 Year</option>
                    <option value="2-year">2 Year</option>
                    <option value="trial">Trial</option>
                  </select>
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
                <label className="add-facility-field">
                  <span className="add-facility-label">Phone Number</span>
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+233 ..."
                    className="add-facility-input"
                  />
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

          {errorMessage && <p className="add-facility-error">{errorMessage}</p>}

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
