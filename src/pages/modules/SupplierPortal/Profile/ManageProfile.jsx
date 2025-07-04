import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageProfile = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    address: "",
    gstNumber: "",
    ntnNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://back-7-9sog.onrender.com/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData(res.data);
      } catch (err) {
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Update profile info
  const handleSaveProfile = async () => {
    setMessage(null);
    setError(null);

    // Basic validation
    if (!formData.companyName.trim() || !formData.email.trim()) {
      setError("Company Name and Email are required.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "https://back-7-9sog.onrender.com/api/profile",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update profile. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing profile
  const handleCancel = () => {
    setEditing(false);
    setMessage(null);
    setError(null);
    // Refetch profile data to reset any changes
    // Optional: you can add a refetch here if you want
  };

  // Change password API call
  const handlePasswordSubmit = async () => {
    setMessage(null);
    setError(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (!passwordData.oldPassword) {
      setError("Old password is required.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "https://back-7-9sog.onrender.com/api/profile/password",
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Password changed successfully!");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setChangingPassword(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to change password. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow border border-blue-100 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Company Profile</h2>

      {loading && <p className="mb-4 text-blue-600 font-semibold">Loading...</p>}
      {message && <p className="mb-4 text-green-600 font-semibold">{message}</p>}
      {error && <p className="mb-4 text-red-600 font-semibold">{error}</p>}

      {/* Company Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          "companyName",
          "email",
          "phone",
          "address",
          "gstNumber",
          "ntnNumber",
        ].map((field, index) => (
          <div key={index}>
            <label
              className="block font-semibold text-blue-800 mb-1 capitalize"
              htmlFor={field}
            >
              {field.replace(/([A-Z])/g, " $1")}
            </label>
            <input
              type="text"
              id={field}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              disabled={!editing || loading}
              className="w-full border px-3 py-2 rounded disabled:opacity-70"
            />
          </div>
        ))}
      </div>

      {/* Profile Action Buttons */}
      <div className="mt-6 flex gap-4 flex-wrap">
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            disabled={loading}
            className="bg-blue-900 text-white px-4 py-2 rounded shadow hover:bg-blue-800 disabled:opacity-50"
          >
            Edit Profile
          </button>
        ) : (
          <>
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-500 disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="bg-gray-400 text-white px-4 py-2 rounded shadow hover:bg-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        )}

        <button
          onClick={() => {
            if (loading) return;
            setChangingPassword(!changingPassword);
            setMessage(null);
            setError(null);
            setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
          }}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-500 disabled:opacity-50"
        >
          {changingPassword ? "Cancel Password Change" : "Change Password"}
        </button>
      </div>

      {/* Change Password Section */}
      {changingPassword && (
        <div className="mt-6 border-t pt-6">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">
            Change Password
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-blue-800 font-medium mb-1"
                htmlFor="oldPassword"
              >
                Old Password
              </label>
              <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                disabled={loading}
                className="w-full border px-3 py-2 rounded disabled:opacity-70"
              />
            </div>
            <div>
              <label
                className="block text-blue-800 font-medium mb-1"
                htmlFor="newPassword"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                disabled={loading}
                className="w-full border px-3 py-2 rounded disabled:opacity-70"
              />
            </div>
            <div>
              <label
                className="block text-blue-800 font-medium mb-1"
                htmlFor="confirmPassword"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                disabled={loading}
                className="w-full border px-3 py-2 rounded disabled:opacity-70"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handlePasswordSubmit}
              disabled={loading}
              className="bg-blue-800 text-white px-5 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50"
            >
              Save Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProfile;
