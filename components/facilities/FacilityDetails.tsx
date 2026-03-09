import { Facility } from "@/lib/types";

interface FacilityDetailsProps {
    facility: Facility;
    onClose: () => void;
    onGenerateCode: (id: string) => void;
    onDelete: (id: string) => void;
}

export function FacilityDetails({
    facility,
    onClose,
    onGenerateCode,
    onDelete
}: FacilityDetailsProps) {
    return (
        <section className="surface section-block">
            <div className="details-header">
                <div>
                    <h2>{facility.name}</h2>
                    <p className="meta-text">{facility.city}, {facility.region}</p>
                </div>
                <button className="btn btn-secondary btn-icon" onClick={onClose} aria-label="Close">✕</button>
            </div>

            <div className="details-content">
                <div className="detail-group">
                    <label>Status</label>
                    <div>
                        <span className={`status-badge ${facility.code ? 'badge-active' : 'badge-pending'}`}>
                            {facility.code ? "Active" : "Pending Setup"}
                        </span>
                    </div>
                </div>

                <div className="detail-group">
                    <label>Facility Code</label>
                    <p>{facility.code || "—"}</p>
                </div>

                <div className="detail-group">
                    <label>Admin Contact</label>
                    <p>{facility.adminEmail}</p>
                </div>

                <div className="detail-group">
                    <label>Location Address</label>
                    <p>{facility.address}</p>
                </div>

                <div className="detail-group">
                    <label>Registered Date</label>
                    <p>
                        {new Date(facility.createdAt).toLocaleDateString("en-US", {
                            year: 'numeric', month: 'long', day: 'numeric'
                        })}
                    </p>
                </div>
            </div>

            <div className="activity-feed">
                <h2 style={{ fontSize: "0.92rem", marginBottom: "8px", marginTop: "8px" }}>Recent activity</h2>
                {facility.code && (
                    <div className="activity-item">
                        <strong>Setup completed</strong>
                        <p>Code generated and onboarding instructions sent to admin.</p>
                        <span className="activity-time">Just now</span>
                    </div>
                )}
                <div className="activity-item">
                    <strong>Account created</strong>
                    <p>The facility account was created in the system by the admin.</p>
                    <span className="activity-time">
                        {new Date(facility.createdAt).toLocaleDateString("en-US", {
                            month: 'short', day: 'numeric'
                        })}
                    </span>
                </div>
            </div>

            <div className="details-actions">
                {!facility.code && (
                    <button
                        className="btn btn-primary w-full"
                        onClick={() => onGenerateCode(facility.id)}
                    >
                        Approve & Generate Code
                    </button>
                )}
                <button className="btn btn-secondary w-full">
                    Edit Details
                </button>
                <button className="btn btn-danger w-full" onClick={() => onDelete(facility.id)}>
                    Delete Facility
                </button>
            </div>
        </section>
    );
}
