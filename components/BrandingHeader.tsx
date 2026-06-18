interface BrandingHeaderProps {
  state?: string;
}

export default function BrandingHeader({ state }: BrandingHeaderProps) {
  return (
    <div
      className="px-8 py-6 flex items-center justify-between"
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 60%, #3d1f6b 100%)",
        borderBottom: "2px solid #e91e8c",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-0.5 h-10 rounded-full"
          style={{ background: "linear-gradient(180deg, #e91e8c 0%, #8b3fc8 100%)" }}
        />
        <div>
          <p
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "#c084fc" }}
          >
            INFINITE &mdash; Managed by MEDELITE
          </p>
          <h1 className="text-xl font-bold tracking-wider uppercase text-white mt-0.5">
            Facility Assessment Snapshot
          </h1>
        </div>
      </div>
      {state && (
        <div className="flex flex-col items-center">
          <span
            className="text-4xl font-black tracking-widest"
            style={{
              background: "linear-gradient(135deg, #e91e8c 0%, #8b3fc8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {state}
          </span>
          <span className="text-xs tracking-widest uppercase font-medium mt-0.5" style={{ color: "#c084fc" }}>
            State
          </span>
        </div>
      )}
    </div>
  );
}
