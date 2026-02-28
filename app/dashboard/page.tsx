import { LogoutButton } from "@/components/auth/logoutbutton";

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2">You are logged in.</p>

      <LogoutButton />
    </div>
  );
}
