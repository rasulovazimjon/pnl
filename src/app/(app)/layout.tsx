import { requirePage } from "@/lib/session";
import Nav from "./Nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePage();
  return (
    <div className="min-h-screen flex flex-col">
      <Nav name={session.name} role={session.role} />
      <main className="max-w-5xl w-full mx-auto px-4 py-6 flex-1">{children}</main>
    </div>
  );
}
