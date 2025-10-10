import { CheckCircle, Globe, Loader2, Lock, Save, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, UserProfile } from '../lib/supabase';

// Clean Profile component — minimal, readable, and syntactically correct
export function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState('');
  const [shareByDefault, setShareByDefault] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, public: 0, private: 0 });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user?.uid)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
      setUsername(data.username);
      setShareByDefault(Boolean(data.share_by_default));
    }
    setLoading(false);
  };

  const loadStats = async () => {
    const { data: allResources } = await supabase
      .from('resources')
      .select('is_public')
      .eq('user_id', user?.uid);

    if (allResources) {
      const publicCount = allResources.filter((r: any) => r.is_public).length;
      setStats({ total: allResources.length, public: publicCount, private: allResources.length - publicCount });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    if (!username.trim()) {
      setError('Username is required');
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ username: username.trim(), share_by_default: shareByDefault })
      .eq('id', user?.uid);

    if (updateError) {
      if ((updateError as any).code === '23505') setError('Username already taken');
      else setError('Failed to update profile');
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Profile & Settings</h2>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <StatCard icon={<User className="w-5 h-5 text-blue-600" />} value={stats.total} label="Total Resources" />
        <StatCard icon={<Globe className="w-5 h-5 text-green-600" />} value={stats.public} label="Public Resources" />
        <StatCard icon={<Lock className="w-5 h-5 text-gray-600" />} value={stats.private} label="Private Resources" />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Account Information</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input id="email" type="email" value={profile?.email ?? ''} disabled className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed" />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <label htmlFor="shareByDefault" className="font-semibold text-gray-700 block mb-1">Make resources public by default</label>
                <p className="text-sm text-gray-600">When enabled, new resources will be public by default. You can still change this per resource.</p>
              </div>

              <button type="button" onClick={() => setShareByDefault(!shareByDefault)} className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 transition-colors duration-200 ${shareByDefault ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${shareByDefault ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2"><CheckCircle className="w-5 h-5" />Profile updated successfully!</div>}

          <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" />Save Changes</>}
          </button>
        </form>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">About DumpIt</h3>
        <p className="text-gray-600 mb-4">DumpIt is your personal resource vault where you can save, organize, and share valuable links and resources.</p>
        <div className="text-sm text-gray-500">Joined {profile ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</div>
      </section>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">{icon}</div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  );
}

