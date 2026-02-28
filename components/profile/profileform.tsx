"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type User = {
  name: string;
  email: string;
};

export default function ProfileForm() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then(setUser);
  }, []);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/user/update", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    setLoading(false);
    if (!res.ok) {
      setError("Failed to update profile");
      setUpdateSuccess(false);
    } else {
      setError("");
      setUpdateSuccess(true);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    const res = await fetch("/api/user/change-password", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!res.ok) {
      const data = await res.json();
      setPasswordError(data.error ?? "Failed to change password");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setPasswordSuccess(true);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  }

  async function handleDelete() {
    if (!confirm("This will permanently delete your account. Continue?"))
      return;

    await fetch("/api/user/delete", {
      method: "DELETE",
      credentials: "include",
    });

    router.push("/login");
  }

  if (!user) return <p>Loading...</p>;

  return (
    <div className="space-y-8">
      {/* Profile update */}
      <form onSubmit={handleUpdate} className="space-y-4">
        <h2 className="font-semibold">Profile Information</h2>

        <div>
          <Label>Name</Label>
          <Input
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
          />
        </div>

        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {updateSuccess && (
          <p className="text-sm text-green-600">Profile updated successfully</p>
        )}

        <Button type="submit" disabled={loading}>
          Save changes
        </Button>
      </form>

      {/* Password change */}
      <form onSubmit={handlePasswordChange} className="space-y-4 border-t pt-6">
        <h2 className="font-semibold">Change Password</h2>

        <div>
          <Label>Current Password</Label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div>
          <Label>New Password</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        {passwordError && (
          <p className="text-sm text-red-600">{passwordError}</p>
        )}

        {passwordSuccess && (
          <p className="text-sm text-green-600">
            Password updated successfully
          </p>
        )}

        <Button type="submit">Update password</Button>
      </form>

      {/* Danger zone */}
      <div className="border-t pt-6 flex justify-between">
        <Button onClick={handleLogout}>Logout</Button>

        <Button variant="destructive" onClick={handleDelete}>
          Delete account
        </Button>
      </div>
    </div>
  );
}
