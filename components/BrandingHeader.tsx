interface BrandingHeaderProps {
  state?: string;
}

export default function BrandingHeader({ state }: BrandingHeaderProps) {
  return (
    <div
      className="px-8 py-5 flex items-center justify-between"
      style={{ background: "#0a3d62" }}
    >
      <div>
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "#7fb3d3" }}
        >
          INFINITE &mdash; Managed by MEDELITE
        </p>
        <h1 className="text-xl font-bold tracking-wider uppercase text-white mt-1">
          Facility Assessment Snapshot
        </h1>
      </div>
      {state && (
        <span
          className="text-4xl font-extrabold tracking-widest"
          style={{ color: "#41b3a3" }}
        >
          {state}
        </span>
      )}
    </div>
  );
}
