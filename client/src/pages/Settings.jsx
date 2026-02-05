import { Card, Input, Button } from '../components/UI.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useState } from 'react';

export const Settings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    organization: user?.organization || '',
    timezone: user?.timezone || 'UTC',
  });

  const handleSave = async () => {
    // TODO: Implement profile update
    alert('Settings saved (not fully implemented)');
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
          label="Organization"
          value={profile.organization}
          onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
        />
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Timezone</label>
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            value={profile.timezone}
            onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
          >
            <option value="UTC">UTC</option>
            <option value="EST">EST</option>
            <option value="CST">CST</option>
            <option value="MST">MST</option>
            <option value="PST">PST</option>
          </select>
        </div>
        <Button onClick={handleSave}>Save Profile</Button>
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-6">Preferences</h2>
        <div className="space-y-4">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" defaultChecked />
            <span>Email notifications for new invoices</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" defaultChecked />
            <span>Daily digest of upcoming tasks</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>Marketing emails</span>
          </label>
        </div>
      </Card>
    </div>
  );
};
