import { PackageOpen, TrendingDown, LayoutDashboard, ShieldCheck, Users, Package } from 'lucide-react'

const features = [
  {
    icon: LayoutDashboard,
    title: 'Live dashboard',
    desc: 'Summary cards and low-stock alerts at a glance',
  },
  {
    icon: TrendingDown,
    title: 'Stock alerts',
    desc: 'Know before you run out — per-product thresholds',
  },
  {
    icon: ShieldCheck,
    title: 'Tenant isolation',
    desc: 'Your inventory data is strictly scoped to your org',
  },
]

const stats = [
  { icon: Users, value: '2,400+', label: 'Teams onboarded' },
  { icon: Package, value: '1.2M', label: 'Products tracked' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden flex">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-[44%] bg-[#111827] flex-col justify-between p-12 relative overflow-hidden">
        {/* Dot grid background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
        />
        {/* Teal glow blob — top right */}
        <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        {/* Teal glow blob — bottom left */}
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
            <PackageOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">StockFlow</span>
        </div>

        {/* Hero + features */}
        <div className="relative space-y-10">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Inventory control,<br />
              <span className="text-primary">without the chaos.</span>
            </h1>
            <p className="text-gray-400 text-base leading-relaxed">
              Track stock levels, catch shortages early, and keep your business running — all from one clean dashboard.
            </p>
          </div>

          {/* Stat chips */}
          <div className="flex gap-4">
            {stats.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/5 px-4 py-3 backdrop-blur-sm"
              >
                <Icon className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white leading-none">{value}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/25">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-xs text-gray-700">
          © {new Date().getFullYear()} StockFlow · Built for modern inventory teams
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col bg-gray-50/60 relative overflow-y-auto">
        {/* Thin teal accent bar at top */}
        <div className="h-[3px] w-full bg-gradient-to-r from-primary/80 via-primary to-primary/40" />

        <div className="flex flex-1 items-center justify-center px-8 py-6">
          {/* Form card with subtle shadow */}
          <div className="w-full max-w-[400px] rounded-2xl bg-white px-8 py-6 shadow-sm ring-1 ring-gray-100">
            {children}
          </div>
        </div>

        {/* Trust signal footer */}
        <p className="pb-6 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          SOC 2 ready · AES-256 encryption · Your data never leaves your org
        </p>
      </div>
    </div>
  )
}
