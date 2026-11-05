"use client";

import { ImagePlus } from "lucide-react";
import { useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { useToast } from "@/components/ToastProvider";
import { authClient } from "@/lib/auth-client";
import { uploadProfileImage } from "@/lib/images";

function ProfileSettings({
  user,
}: {
  user: { id: string; name: string; email: string; image?: string | null };
}) {
  const { notify } = useToast();
  const [name, setName] = useState(user.name);
  const [image, setImage] = useState(user.image || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleImageUpload(file: File | undefined) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setProfileError("Choose a JPG, PNG, or WebP image for your profile photo.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileError("Choose a profile photo smaller than 5 MB.");
      return;
    }

    setProfileError("");
    setUploading(true);
    try {
      setImage(await uploadProfileImage(file));
    } catch (cause) {
      setProfileError(cause instanceof Error ? cause.message : "The profile photo could not be uploaded.");
    } finally {
      setUploading(false);
    }
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileError("");
    if (!name.trim()) {
      setProfileError("Enter your name before saving your profile.");
      return;
    }
    setSavingProfile(true);
    try {
      const { error } = await authClient.updateUser({
        name: name.trim(),
        image: image.trim() || null,
      });
      if (error) {
        setProfileError(error.message || "Your profile could not be updated.");
        return;
      }
      notify("Your profile has been updated.");
    } catch {
      setProfileError("We could not reach the account service. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    if (newPassword.length < 8) {
      setPasswordError("Use at least 8 characters for your new password.");
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });
      if (error) {
        setPasswordError(error.message || "Your password could not be changed.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      notify("Your password has been changed.");
    } catch {
      setPasswordError("We could not reach the account service. Please try again.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <>
      <form className="form-card profile-settings-card" onSubmit={saveProfile}>
        <div className="profile-large-avatar" aria-hidden="true">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" src={image} />
          ) : name.trim().slice(0, 1).toUpperCase()}
        </div>
        <h2>Profile details</h2>
        <p className="form-card-intro">{user.email}</p>
        <div className="form-stack">
          <label className="form-field">
            Your name
            <input
              autoComplete="name"
              maxLength={100}
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
          </label>
          <div className="form-field">
            <span>Profile photo</span>
            <label className="image-upload-row">
              <input
                accept="image/jpeg,image/png,image/webp"
                aria-label="Upload a profile photo from your device"
                disabled={uploading}
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  event.currentTarget.value = "";
                  void handleImageUpload(file);
                }}
                type="file"
              />
              <span className="image-upload-status" aria-live="polite">
                <ImagePlus size={16} aria-hidden="true" />
                {uploading ? "Uploading photo..." : image ? "Choose another photo" : "Choose from device"}
              </span>
            </label>
            <input
              aria-label="Profile photo URL"
              autoComplete="url"
              onChange={(event) => setImage(event.target.value)}
              placeholder="Or paste a photo URL"
              type="url"
              value={image}
            />
            {image && (
              <button
                className="profile-remove-image"
                onClick={() => setImage("")}
                type="button"
              >
                Remove profile photo
              </button>
            )}
            <span className="form-hint">Use an image smaller than 5 MB, or provide an image URL.</span>
          </div>
          {profileError && <p className="form-error" role="alert">{profileError}</p>}
          <button className="button" disabled={savingProfile || uploading} type="submit">
            {savingProfile ? "Saving profile..." : "Save profile"}
          </button>
        </div>
      </form>

      <form className="form-card profile-password-card" onSubmit={changePassword}>
        <h2>Change password</h2>
        <p className="form-card-intro">
          Available for email and password accounts. Enter your current password to choose a new one.
        </p>
        <div className="form-stack">
          <label className="form-field">
            Current password
            <input
              autoComplete="current-password"
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              type="password"
              value={currentPassword}
            />
          </label>
          <label className="form-field">
            New password
            <input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              type="password"
              value={newPassword}
            />
            <span className="form-hint">Use at least 8 characters.</span>
          </label>
          {passwordError && <p className="form-error" role="alert">{passwordError}</p>}
          <button className="button button-outline" disabled={savingPassword} type="submit">
            {savingPassword ? "Changing password..." : "Change password"}
          </button>
        </div>
      </form>
    </>
  );
}

export default function ProfileContent() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  return (
    <RequireAuth>
      <header className="page-header">
        <p className="eyebrow">Your BookNook account</p>
        <h1>My profile</h1>
        <p>Update your reader details and password.</p>
      </header>
      <section className="content-narrow profile-settings">
        {user && <ProfileSettings key={user.id} user={user} />}
      </section>
    </RequireAuth>
  );
}
