import Header from "@/components/layout/header";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl p-6">{children}</main>
    </>
  );
}
