import React, { useState } from "react";

const ManageProfile = () => {
  const [formData, setFormData] = useState({
    companyName: "Asif and Brothers",
    email: "asifandbrothers@gmail.com",
    phone: "+92 300 1234567",
    address: "Street #4, Lahore, Pakistan",
    gstNumber: "GST-789456",
    ntnNumber: "NTN-1234567",
  });

  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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

  const handleSaveProfile = () => {
    alert("Profile updated!");
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handlePasswordSubmit = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }

    // Call backend API to change password here
    alert("Password changed successfully!");
    setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setChangingPassword(false);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow border border-blue-100 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">
        Company Profile
      </h2>

      {/* Company Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {["companyName", "email", "phone", "address", "gstNumber", "ntnNumber"].map((field, index) => (
          <div key={index}>
            <label className="block font-semibold text-blue-800 mb-1 capitalize">
              {field.replace(/([A-Z])/g, " $1")}
            </label>
            <input
              type="text"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              disabled={!editing}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        ))}
      </div>

      {/* Profile Action Buttons */}
      <div className="mt-6 flex gap-4 flex-wrap">
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-900 text-white px-4 py-2 rounded shadow hover:bg-blue-800"
          >
            Edit Profile
          </button>
        ) : (
          <>
            <button
              onClick={handleSaveProfile}
              className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-500"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-400 text-white px-4 py-2 rounded shadow hover:bg-gray-500"
            >
              Cancel
            </button>
          </>
        )}

        <button
          onClick={() => setChangingPassword(!changingPassword)}
          className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-500"
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
              <label className="block text-blue-800 font-medium mb-1">
                Old Password
              </label>
              <input
                type="password"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block text-blue-800 font-medium mb-1">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block text-blue-800 font-medium mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handlePasswordSubmit}
              className="bg-blue-800 text-white px-5 py-2 rounded shadow hover:bg-blue-700"
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
