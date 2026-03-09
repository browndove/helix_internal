"use client";

import { FormEvent, useState } from "react";
import { FacilityInput } from "@/lib/types";

interface FacilityFormProps {
  onAddFacility: (facilityInput: FacilityInput) => void;
}

const initialFormValues: FacilityInput = {
  name: "",
  adminEmail: "",
  city: "",
  region: "",
  address: ""
};

export function FacilityForm({ onAddFacility }: FacilityFormProps) {
  const [formValues, setFormValues] = useState<FacilityInput>(initialFormValues);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedValues: FacilityInput = {
      ...formValues,
      name: formValues.name.trim(),
      adminEmail: formValues.adminEmail.trim().toLowerCase(),
      city: formValues.city.trim(),
      region: formValues.region.trim(),
      address: formValues.address.trim()
    };

    if (
      !normalizedValues.name ||
      !normalizedValues.adminEmail ||
      !normalizedValues.city ||
      !normalizedValues.region ||
      !normalizedValues.address
    ) {
      return;
    }

    onAddFacility(normalizedValues);
    setFormValues(initialFormValues);
  };

  return (
    <form onSubmit={handleSubmit} className="stack-md">
      <label className="field">
        <span>Facility Name</span>
        <input
          value={formValues.name}
          onChange={(event) =>
            setFormValues((previousValues) => ({
              ...previousValues,
              name: event.target.value
            }))
          }
          placeholder="e.g. West Operations Clinic"
          required
        />
      </label>

      <div className="form-row">
        <label className="field">
          <span>Admin Email</span>
          <input
            type="email"
            value={formValues.adminEmail}
            onChange={(event) =>
              setFormValues((previousValues) => ({
                ...previousValues,
                adminEmail: event.target.value
              }))
            }
            placeholder="e.g. admin@hospital.org"
            required
          />
        </label>

        <label className="field">
          <span>City</span>
          <input
            value={formValues.city}
            onChange={(event) =>
              setFormValues((previousValues) => ({
                ...previousValues,
                city: event.target.value
              }))
            }
            placeholder="e.g. Cape Coast"
            required
          />
        </label>
      </div>

      <div className="form-row">
        <label className="field">
          <span>Region</span>
          <input
            value={formValues.region}
            onChange={(event) =>
              setFormValues((previousValues) => ({
                ...previousValues,
                region: event.target.value
              }))
            }
            placeholder="e.g. Central Region"
            required
          />
        </label>

        <label className="field">
          <span>Address</span>
          <input
            value={formValues.address}
            onChange={(event) =>
              setFormValues((previousValues) => ({
                ...previousValues,
                address: event.target.value
              }))
            }
            placeholder="e.g. University Avenue, Cape Coast"
            required
          />
        </label>
      </div>

      <button type="submit" className="btn btn-primary">
        Add Facility
      </button>
    </form>
  );
}
