import { NavLink } from "@/shared/components/nav-link";

const NAV_ITEMS = [
  { href: "/clientes", label: "Clientes" },
  { href: "/tipos-transporte", label: "Tipos de Transporte" },
  { href: "/itens", label: "Itens" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-6">
          <span className="font-heading text-sm font-semibold">OVGS</span>
          <nav className="flex items-center gap-4">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
