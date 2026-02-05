import { Card, Input, Button, Error, Modal } from '../components/UI.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useState } from 'react';
import { api } from '../utils/api.js';
import { useNavigate } from 'react-router-dom';

export const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const handleSave = async () => {
    setSaveError('');
    setSaveSuccess('');

    if (profile.newPassword || profile.confirmNewPassword) {
      if (profile.newPassword.length < 6) {
        setSaveError('Password must be at least 6 characters');
        return;
      }
      if (profile.newPassword !== profile.confirmNewPassword) {
        setSaveError('Passwords do not match');
        return;
      }
      try {
        await api.auth.updatePassword({ newPassword: profile.newPassword });
        setProfile({ ...profile, newPassword: '', confirmNewPassword: '' });
        setSaveSuccess('Password updated');
      } catch (err) {
        setSaveError(err.error?.message || 'Failed to update password');
      }
      return;
    }

    setSaveSuccess('Nothing to update');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    try {
      await api.auth.deleteAccount();
      await logout();
      navigate('/');
    } catch (err) {
      setDeleteError(err.error?.message || 'Failed to delete account');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <Card className="mb-8">
        <h2 className="text-xl font-bold mb-6">Profile</h2>
        <Input
          label="Full Name"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        />
        <Input
          label="Email"
          type="email"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
        />
        <Input
          label="New Password"
          type="password"
          value={profile.newPassword}
          onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
        />
        <Input
          label="Confirm New Password"
          type="password"
          value={profile.confirmNewPassword}
          onChange={(e) => setProfile({ ...profile, confirmNewPassword: e.target.value })}
        />
        {saveError && <Error message={saveError} />}
        {saveSuccess && <div className="text-green-600 text-sm mb-4">{saveSuccess}</div>}
        <Button onClick={handleSave} className="w-full">Save Profile</Button>
        <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center items-center">
          <Button variant="ghost" onClick={handleLogout} className="border border-slate-300">
            Logout
          </Button>
          <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
            Delete Account
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setDeleteError(''); }}
        title="Delete Account?"
      >
        <div className="mb-4">
          This will permanently delete your account and all associated data. This action cannot be undone.
        </div>
        {deleteError && <Error message={deleteError} />}
        <div className="flex gap-2">
          <Button variant="danger" onClick={handleDeleteAccount}>
            Yes, Delete
          </Button>
          <Button variant="secondary" onClick={() => { setIsDeleteOpen(false); setDeleteError(''); }}>
            Cancel
          </Button>
        </div>
      </Modal>

    </div>
  );
};
