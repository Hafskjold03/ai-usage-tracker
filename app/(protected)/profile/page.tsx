"use client";

import ProfileForm from "@/components/profile/profileform";

export default function ProfilePage() {
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <ProfileForm />
    </div>
  );
}
