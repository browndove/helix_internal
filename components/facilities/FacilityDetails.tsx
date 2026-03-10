import { Facility } from "@/lib/types";

interface FacilityDetailsProps {
    facility: Facility;
    onClose: () => void;
    onGenerateCode: (id: string) => void;
    onDelete: (id: string) => void;
}

function formatFullDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function formatShortDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
    });
}

export function FacilityDetails({
    facility,
    onClose,
    onGenerateCode,
    onDelete
}: FacilityDetailsProps) {
    return (
        <section className="surface details-panel">
            {/* Header */}
            <div className="details-panel-header">
                <div className="details-panel-title">
                    <h2>{facility.name}</h2>
                    <div className="details-panel-meta">
                        <span className={`status-badge ${facility.code ? "badge-active" : "badge-pending"}`}>
                            <span className="badge-dot" />
                            {facility.code ? "Active" : "Pending Setup"}
                        </span>
                        <span className="details-location">{facility.city}, {facility.region}</span>
                    </div>
                </div>
                <button className="btn btn-secondary btn-icon" onClick={onClose} aria-label="Close">✕</button>
            </div>

            {/* Stats row */}
            <div className="details-stats-row">
                <div className="details-stat">
                    <span className="details-stat-value">{facility.userCount}</span>
                    <span className="details-stat-label">Users</span>
                </div>
                <div className="details-stat">
                    <span className="details-stat-value details-stat-code">{facility.code || "—"}</span>
                    <span className="details-stat-label">Facility Code</span>
                </div>
                <div className="details-stat">
                    <span className="details-stat-value">{formatShortDate(facility.createdAt)}</span>
                    <span className="details-stat-label">Registered</span>
                </div>
            </div>

            {/* Info grid */}
            <div className="details-info-grid">
                <div className="details-info-item">
                    <span className="details-info-label">Admin Contact</span>
                    <span className="details-info-value">{facility.adminEmail}</span>
                </div>
                <div className="details-info-item">
                    <span className="details-info-label">Address</span>
                    <span className="details-info-value">{facility.address}</span>
                </div>
                <div className="details-info-item">
                    <span className="details-info-label">Full Registration Date</span>
                    <span className="details-info-value">{formatFullDate(facility.createdAt)}</span>
                </div>
            </div>

            {/* Activity timeline */}
            <div className="details-activity">
                <h3 className="details-section-heading">Activity Timeline</h3>
                <div className="details-timeline">
                    {facility.code && (
                        <div className="timeline-item">
                            <div className="timeline-dot timeline-dot-success" />
                            <div className="timeline-content">
                                <strong>Setup completed</strong>
                                <p>Code generated and onboarding instructions sent to admin.</p>
                                <span className="timeline-time">Just now</span>
                            </div>
                        </div>
                    )}
                    <div className="timeline-item">
                        <div className="timeline-dot" />
                        <div className="timeline-content">
                            <strong>Account created</strong>
                            <p>Facility account was created in the system by the admin.</p>
                            <span className="timeline-time">{formatShortDate(facility.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
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
