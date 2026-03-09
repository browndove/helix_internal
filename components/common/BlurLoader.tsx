interface BlurLoaderProps {
  label?: string;
}

export function BlurLoader({ label = "Loading..." }: BlurLoaderProps) {
  return (
    <div className="blur-loader-wrap" role="status" aria-live="polite">
      <div className="blur-loader" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

