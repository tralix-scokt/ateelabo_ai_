import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";

export default function Profile() {
  const savedUser = localStorage.getItem("ateelabo_user");
  const currentUser = savedUser ? JSON.parse(savedUser) : null;

  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [profilePicture, setProfilePicture] = useState(
  currentUser?.profilePicture || ""
);
const [showPasswordForm, setShowPasswordForm] = useState(false);

const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

const [passwordMessage, setPasswordMessage] = useState("");
const [passwordError, setPasswordError] = useState("");
const [changingPassword, setChangingPassword] = useState(false);

const [showCurrentPassword, setShowCurrentPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const fileInputRef = useRef(null);

  const handleSave = () => {
    const updatedUser = {
      ...currentUser,
      name,
      email,
      profilePicture,
    };

    localStorage.setItem(
      "ateelabo_user",
      JSON.stringify(updatedUser)
    );

    alert("Profile updated successfully! ✅");
  };

  const handleChangePassword = async () => {
  setPasswordMessage("");
  setPasswordError("");

  if (!currentPassword || !newPassword || !confirmPassword) {
    setPasswordError("Please fill in all password fields.");
    return;
  }

  if (newPassword !== confirmPassword) {
    setPasswordError("New passwords do not match.");
    return;
  }

  setChangingPassword(true);

  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/change-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: currentUser.email,
          currentPassword,
          newPassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to change password"
      );
    }

    setPasswordMessage(data.message);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  } catch (error) {
    setPasswordError(error.message);
  } finally {
    setChangingPassword(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white px-4 py-8">

      {/* Header */}
      <div className="max-w-3xl mx-auto">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-400 transition"
        >
          ← Back to Ateelabo AI
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <h1 className="text-3xl font-bold">
            Profile
          </h1>

          <p className="text-gray-400 mt-2">
            Manage your Ateelabo AI account.
          </p>
        </motion.div>

        {/* Profile Card */}
        {/* Profile Card */}
<motion.div
  initial={{ opacity: 0, y: 25 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
  className="
    mt-8
    overflow-hidden
    rounded-3xl
    border
    border-white/10
    bg-white/[0.04]
    backdrop-blur-xl
    shadow-2xl
  "
>
  {/* Profile Header */}
  <div className="
    relative
    px-6
    py-8
    sm:px-8
    sm:py-10
    text-center
  ">

    {/* Glow */}
    <div className="
      pointer-events-none
      absolute
      left-1/2
      top-0
      h-40
      w-40
      -translate-x-1/2
      rounded-full
      bg-cyan-400/10
      blur-3xl
    " />

    {/* Avatar */}
    <div className="relative mx-auto h-28 w-28">

  <motion.div
    whileHover={{ scale: 1.05 }}
    onClick={() => fileInputRef.current?.click()}
    className="
      relative
      flex
      h-28
      w-28
      cursor-pointer
      items-center
      justify-center
      overflow-hidden
      rounded-full
      border
      border-cyan-400/30
      bg-gradient-to-br
      from-cyan-400
      via-blue-500
      to-purple-600
      text-4xl
      font-bold
      text-white
      shadow-[0_0_40px_rgba(34,211,238,0.2)]
    "
  >
    {profilePicture ? (
      <img
        src={profilePicture}
        alt="Profile"
        className="h-full w-full object-cover"
      />
    ) : (
      name
        ? name.charAt(0).toUpperCase()
        : "U"
    )}
  </motion.div>

  {/* Camera button */}
  <button
    type="button"
    onClick={() => fileInputRef.current?.click()}
    className="
      absolute
      bottom-0
      right-0
      flex
      h-9
      w-9
      items-center
      justify-center
      rounded-full
      border
      border-white/20
      bg-zinc-900
      text-sm
      shadow-lg
      transition
      hover:bg-cyan-500
    "
    title="Change profile picture"
  >
    📷
  </button>

  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    className="hidden"
    onChange={(e) => {
      const file = e.target.files?.[0];

      if (!file) return;

      const reader = new FileReader();

reader.onload = () => {
  setProfilePicture(reader.result);
};

reader.readAsDataURL(file);
    }}
  />

</div>

    <h2 className="relative mt-5 text-2xl font-bold">
      {name || "User"}
    </h2>

    <p className="relative mt-1 text-sm text-gray-400">
      {email || "No email"}
    </p>

    <div className="
      relative
      mt-5
      inline-flex
      items-center
      gap-2
      rounded-full
      border
      border-cyan-400/20
      bg-cyan-400/5
      px-4
      py-2
      text-xs
      text-cyan-300
    ">
      <span className="h-2 w-2 rounded-full bg-cyan-400" />
      Ateelabo AI Account
    </div>

  </div>

  {/* Personal Information */}
  <div className="
    border-t
    border-white/10
    px-6
    py-7
    sm:px-8
  ">

    <div className="mb-6">
      <h3 className="text-lg font-semibold">
        Personal information
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        Update the information associated with your account.
      </p>
    </div>

    <div className="space-y-5">

      {/* Name */}
      <div>
        <label className="
          mb-2
          block
          text-sm
          font-medium
          text-gray-300
        ">
          Full name
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="
            w-full
            rounded-xl
            border
            border-white/10
            bg-black/30
            px-4
            py-3
            text-white
            outline-none
            transition
            placeholder:text-gray-600
            focus:border-cyan-400/50
            focus:ring-2
            focus:ring-cyan-400/10
          "
          placeholder="Enter your full name"
        />
      </div>

      {/* Email */}
      <div>
        <label className="
          mb-2
          block
          text-sm
          font-medium
          text-gray-300
        ">
          Email address
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="
            w-full
            rounded-xl
            border
            border-white/10
            bg-black/30
            px-4
            py-3
            text-white
            outline-none
            transition
            placeholder:text-gray-600
            focus:border-cyan-400/50
            focus:ring-2
            focus:ring-cyan-400/10
          "
          placeholder="Enter your email"
        />
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className="
          w-full
          rounded-xl
          bg-gradient-to-r
          from-cyan-500
          to-blue-600
          py-3
          font-semibold
          text-white
          shadow-lg
          shadow-cyan-500/10
          transition
          hover:scale-[1.01]
          hover:shadow-cyan-500/20
          active:scale-[0.99]
        "
      >
        Save Changes
      </button>

    </div>
  </div>

  {/* Security */}
  <div className="
    border-t
    border-white/10
    px-6
    py-7
    sm:px-8
  ">

    <h3 className="text-lg font-semibold">
      Security
    </h3>

    <p className="mt-1 text-sm text-gray-500">
      Keep your account secure.
    </p>

    <button
  type="button"
  onClick={() => setShowPasswordForm(!showPasswordForm)}
  className="
    mt-5
    flex
    w-full
    items-center
    justify-between
    rounded-xl
    border
    border-white/10
    bg-white/[0.03]
    px-4
    py-4
    text-left
    transition
    hover:border-cyan-400/30
    hover:bg-cyan-400/5
  "
>
  <div className="flex items-center gap-3">

    <div className="
      flex
      h-10
      w-10
      items-center
      justify-center
      rounded-xl
      bg-purple-500/10
      text-purple-300
    ">
      🔐
    </div>

    <div>
      <p className="text-sm font-medium">
        Password
      </p>

      <p className="text-xs text-gray-500">
        Change your account password
      </p>
    </div>

  </div>

  <span className="text-gray-500">
    {showPasswordForm ? "↑" : "→"}
  </span>

</button>
{showPasswordForm && (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    className="mt-4 space-y-4 overflow-hidden"
  >

    <div>
      <label className="mb-2 block text-sm text-gray-400">
        Current password
      </label>

      <input
        type={showCurrentPassword ? "text" : "password"}
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        className="
          w-full
          rounded-xl
          border
          border-white/10
          bg-black/30
          px-4
          py-3
          text-white
          outline-none
          focus:border-cyan-400/50
        "
        placeholder="Enter current password"
      />
      <button
  type="button"
  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
  className="text-xs text-gray-400 hover:text-cyan-400"
>
  {showCurrentPassword ? "Hide" : "Show"}
</button>
    </div>

    <div>
      <label className="mb-2 block text-sm text-gray-400">
        New password
      </label>

      <input
        type={showNewPassword ? "text" : "password"}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="
          w-full
          rounded-xl
          border
          border-white/10
          bg-black/30
          px-4
          py-3
          text-white
          outline-none
          focus:border-cyan-400/50
        "
        placeholder="Enter new password"
      />
      <button
  type="button"
  onClick={() => setShowNewPassword(!showNewPassword)}
  className="text-xs text-gray-400 hover:text-cyan-400"
>
  {showNewPassword ? "Hide" : "Show"}
</button>
    </div>

    <div>
      <label className="mb-2 block text-sm text-gray-400">
        Confirm new password
      </label>

      <input
        type={showConfirmPassword ? "text" : "password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="
          w-full
          rounded-xl
          border
          border-white/10
          bg-black/30
          px-4
          py-3
          text-white
          outline-none
          focus:border-cyan-400/50
        "
        placeholder="Confirm new password"
      />
      <button
  type="button"
  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
  className="text-xs text-gray-400 hover:text-cyan-400"
>
  {showConfirmPassword ? "Hide" : "Show"}
</button>
    </div>

    {passwordError && (
      <p className="text-sm text-red-400">
        {passwordError}
      </p>
    )}

    {passwordMessage && (
      <p className="text-sm text-green-400">
        {passwordMessage}
      </p>
    )}

    <button
      type="button"
      onClick={handleChangePassword}
      disabled={changingPassword}
      className="
        w-full
        rounded-xl
        bg-purple-600
        py-3
        font-semibold
        text-white
        transition
        hover:bg-purple-500
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      {changingPassword
        ? "Changing password..."
        : "Change Password"}
    </button>

  </motion.div>
)}

  </div>

</motion.div>

      </div>
    </div>
  );
}