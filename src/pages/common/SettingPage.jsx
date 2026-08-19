import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

const inputClass =
  "w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-(length:--font-size-body-sm) focus:outline-none focus:ring-2 focus:ring-primary";
const labelClass =
  "block text-(length:--font-size-body-sm) font-medium text-text-primary mb-1.5";

function PasswordField({
  label,
  value,
  onChange,
  fieldKey,
  showPassword,
  setShowPassword,
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="relative">
        <input
          type={showPassword[fieldKey] ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={`${inputClass} ${value.length > 0 ? "pr-10" : ""}`}
          required
          minLength={8}
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={() =>
              setShowPassword({
                ...showPassword,
                [fieldKey]: !showPassword[fieldKey],
              })
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
          >
            {showPassword[fieldKey] ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

function SettingPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [originalForm, setOriginalForm] = useState({
    username: "",
    fullName: "",
    email: "",
  });
  const [form, setForm] = useState({ username: "", fullName: "", email: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    repeatPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    repeat: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isProfileChanged || isPasswordFormFilled) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/me");
      setProfile(res.data);
      const initialForm = {
        username: res.data.username,
        fullName: res.data.fullName,
        email: res.data.email,
      };
      setForm(initialForm);
      setOriginalForm(initialForm);
    } catch (err) {
      console.error("Gagal memuat profil:", err);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const isProfileChanged =
    form.username !== originalForm.username ||
    form.fullName !== originalForm.fullName ||
    form.email !== originalForm.email ||
    imageFile !== null;

  const isPasswordFormFilled =
    passwordForm.oldPassword.trim() !== "" &&
    passwordForm.newPassword.trim() !== "" &&
    passwordForm.repeatPassword.trim() !== "";

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) =>
        formData.append(key, value),
      );
      if (imageFile) formData.append("profileImage", imageFile);

      const res = await api.put("/users/me", formData);
      setProfile(res.data);
      setOriginalForm(form);
      setImageFile(null);
      setImagePreview(null);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.repeatPassword) {
      toast.error("New password and repeat password do not match");
      return;
    }

    setSavingPassword(true);
    try {
      await api.patch("/users/me/change-password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswordForm({ oldPassword: "", newPassword: "", repeatPassword: "" });
    } catch (err) {
      const status = err.response?.status;
      const backendMessage = err.response?.data?.message;
      // Backend biasanya balas 400/401 kalau old password tidak cocok.
      // Kalau backend tidak kirim pesan spesifik, tetap kasih tahu
      // penyebab paling umum daripada pesan generik.
      const fallbackMessage =
        status === 400 || status === 401
          ? "Old password is incorrect"
          : "Failed to change password";
      toast.error(backendMessage || fallbackMessage);
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-(length:--font-size-body-sm) text-text-muted font-medium">
          Loading data...
        </p>
      </div>
    );
  }

  const initial =
    profile?.fullName?.charAt(0).toUpperCase() || "?";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pb-10 px-4 sm:px-0"
    >
      <h2 className="text-(length:--font-size-h2) font-semibold text-primary">
        Settings
      </h2>
      <p className="text-(length:--font-size-body-lg) text-text-muted mt-1">
        Configure system preferences and account settings.
      </p>

      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 mt-6 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
          <h3 className="text-(length:--font-size-h3) font-semibold text-text-primary">
            Account Information
          </h3>
          <AnimatePresence>
            {isProfileChanged && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex self-start sm:self-auto items-center gap-1.5 text-(length:--font-size-caption) text-warning bg-warning-light px-2.5 py-1 rounded-full"
              >
                <AlertTriangle size={12} /> Unsaved changes
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSaveProfile} className="mt-5">
          <div className="flex items-center gap-3 mb-6">
            {imagePreview || profile?.profileImage ? (
              <img
                src={imagePreview || profile.profileImage}
                alt={profile?.fullName}
                className="w-14 h-14 rounded-full object-cover shadow-sm shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary text-primary-light flex items-center justify-center font-semibold text-(length:--font-size-h3) shrink-0">
                {initial}
              </div>
            )}
            <label className="border border-slate-200 text-text-muted px-3 py-1.5 rounded-lg text-(length:--font-size-caption) font-medium cursor-pointer hover:bg-slate-50 transition-colors">
              Change Profile
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Name</label>
              <input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Username</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <motion.button
              whileHover={{
                scale: !savingProfile && isProfileChanged ? 1.02 : 1,
              }}
              whileTap={{
                scale: !savingProfile && isProfileChanged ? 0.98 : 1,
              }}
              type="submit"
              disabled={savingProfile || !isProfileChanged}
              className="w-full sm:w-auto bg-primary text-white px-5 py-2.5 rounded-lg text-(length:--font-size-body-sm) font-medium hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer transition-all"
            >
              {savingProfile ? "Saving..." : "Save Change"}
            </motion.button>
          </div>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 mt-6 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
          <h3 className="text-(length:--font-size-h3) font-semibold text-text-primary">
            Change Password
          </h3>
          <AnimatePresence>
            {isPasswordFormFilled && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex self-start sm:self-auto items-center gap-1.5 text-(length:--font-size-caption) text-yellow-700 bg-warning-light px-2.5 py-1 rounded-full"
              >
                <AlertTriangle size={12} /> Unsaved changes
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSavePassword} className="mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <PasswordField
              label="Old Password"
              value={passwordForm.oldPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  oldPassword: e.target.value,
                })
              }
              fieldKey="old"
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
            <PasswordField
              label="New Password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
              fieldKey="new"
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
            <PasswordField
              label="Repeat Password"
              value={passwordForm.repeatPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  repeatPassword: e.target.value,
                })
              }
              fieldKey="repeat"
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          </div>

          <div className="flex justify-end mt-5">
            <motion.button
              whileHover={{
                scale: !savingPassword && isPasswordFormFilled ? 1.02 : 1,
              }}
              whileTap={{
                scale: !savingPassword && isPasswordFormFilled ? 0.98 : 1,
              }}
              type="submit"
              disabled={savingPassword || !isPasswordFormFilled}
              className="w-full sm:w-auto bg-primary text-white px-5 py-2.5 rounded-lg text-(length:--font-size-body-sm) font-medium hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer transition-all"
            >
              {savingPassword ? "Saving..." : "Save Change"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default SettingPage;
