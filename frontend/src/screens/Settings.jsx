import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { Card, Button, Toggle, StatusChip, Avatar } from '../components/ui'
import Icon from '../components/Icon'
import {
  getUserSettings, updateUserSettings, changePassword,
  getTenantSettings, updateTenantSettings,
  uploadTenantLogo, removeTenantLogo, fetchTenantLogoUrl,
  listTeamMembers, listInvitations, inviteTeamMember, revokeInvitation, updateMemberRole, removeTeamMember,
} from '../lib/api'

const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
const MAX_LOGO_BYTES = 2 * 1024 * 1024

const ROLE_LABELS = { admin: 'Admin', manager: 'Manager', agent: 'Agent' }

const TABS = [
  { id: 'account', label: 'Account', icon: 'User' },
  { id: 'organization', label: 'Organization', icon: 'Building2' },
  { id: 'branding', label: 'Branding', icon: 'Palette' },
  { id: 'team', label: 'Team & roles', icon: 'Users' },
  { id: 'integrations', label: 'Integrations', icon: 'Plug' },
  { id: 'api', label: 'API keys', icon: 'KeyRound' },
  { id: 'data', label: 'Data & retention', icon: 'Database' },
]

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Los_Angeles', 'America/Chicago',
  'Europe/London', 'Europe/Berlin', 'Asia/Dhaka', 'Asia/Kolkata',
  'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney',
]

function Banner({ status }) {
  if (!status) return null
  const isError = status.type === 'error'
  return (
    <div className={`rounded-md px-3 py-2 text-[13px] font-medium ${isError ? 'text-error bg-error/10' : 'text-success bg-success/10'}`}>
      {status.message}
    </div>
  )
}

function AccountTab() {
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({ name: '', notify_email: true, notify_in_app: true })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwStatus, setPwStatus] = useState(null)

  useEffect(() => {
    getUserSettings()
      .then(data => { setUser(data); setForm({ name: data.name || '', notify_email: data.notify_email, notify_in_app: data.notify_in_app }) })
      .catch(() => setUser(false))
  }, [])

  async function saveProfile(e) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      const updated = await updateUserSettings({ name: form.name.trim() || null, notify_email: form.notify_email, notify_in_app: form.notify_in_app })
      setUser(updated)
      setStatus({ type: 'success', message: 'Profile saved.' })
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Could not save profile.' })
    } finally {
      setSaving(false)
    }
  }

  async function submitPassword(e) {
    e.preventDefault()
    setPwStatus(null)
    if (pwForm.new_password.length < 8) {
      setPwStatus({ type: 'error', message: 'New password must be at least 8 characters.' })
      return
    }
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwStatus({ type: 'error', message: 'New password and confirmation do not match.' })
      return
    }
    setPwSaving(true)
    try {
      await changePassword(pwForm.current_password, pwForm.new_password)
      setPwForm({ current_password: '', new_password: '', confirm_password: '' })
      setPwStatus({ type: 'success', message: 'Password updated.' })
    } catch (err) {
      setPwStatus({ type: 'error', message: err.message || 'Could not update password.' })
    } finally {
      setPwSaving(false)
    }
  }

  if (user === null) return <Card className="p-6 text-[14px] text-muted">Loading…</Card>
  if (user === false) return <Card className="p-6 text-[14px] text-error">Couldn&rsquo;t load your account settings.</Card>

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <h3 className="text-[16px] font-semibold text-ink mb-1">Profile</h3>
        <p className="text-[13px] text-muted mb-5">{user.email}</p>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-ink mb-2" htmlFor="account-name">Display name</label>
            <input
              id="account-name"
              className="h-10 w-full max-w-sm rounded-md border border-hairline bg-surface px-3 text-[14px] text-ink"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Your name"
            />
          </div>
          <div className="flex items-center justify-between max-w-sm">
            <span className="text-[14px] text-ink">Email notifications</span>
            <Toggle on={form.notify_email} onChange={v => setForm(f => ({ ...f, notify_email: v }))} />
          </div>
          <div className="flex items-center justify-between max-w-sm">
            <span className="text-[14px] text-ink">In-app notifications</span>
            <Toggle on={form.notify_in_app} onChange={v => setForm(f => ({ ...f, notify_in_app: v }))} />
          </div>
          <Banner status={status} />
          <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</Button>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="text-[16px] font-semibold text-ink mb-1">Password</h3>
        <p className="text-[13px] text-muted mb-5">Choose a password with at least 8 characters.</p>
        <form onSubmit={submitPassword} className="space-y-4 max-w-sm">
          <div>
            <label className="block text-[13px] font-medium text-ink mb-2" htmlFor="pw-current">Current password</label>
            <input id="pw-current" type="password" required
              className="h-10 w-full rounded-md border border-hairline bg-surface px-3 text-[14px] text-ink"
              value={pwForm.current_password}
              onChange={e => setPwForm(f => ({ ...f, current_password: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink mb-2" htmlFor="pw-new">New password</label>
            <input id="pw-new" type="password" required minLength={8}
              className="h-10 w-full rounded-md border border-hairline bg-surface px-3 text-[14px] text-ink"
              value={pwForm.new_password}
              onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink mb-2" htmlFor="pw-confirm">Confirm new password</label>
            <input id="pw-confirm" type="password" required minLength={8}
              className="h-10 w-full rounded-md border border-hairline bg-surface px-3 text-[14px] text-ink"
              value={pwForm.confirm_password}
              onChange={e => setPwForm(f => ({ ...f, confirm_password: e.target.value }))}
            />
          </div>
          <Banner status={pwStatus} />
          <Button type="submit" size="sm" disabled={pwSaving}>{pwSaving ? 'Updating…' : 'Update password'}</Button>
        </form>
      </Card>
    </div>
  )
}

function OrganizationTab() {
  const [tenant, setTenant] = useState(null)
  const [form, setForm] = useState({ name: '', timezone: 'UTC', qa_rules_path: '' })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    getTenantSettings()
      .then(data => { setTenant(data); setForm({ name: data.name, timezone: data.timezone, qa_rules_path: data.qa_rules_path || '' }) })
      .catch(() => setTenant(false))
  }, [])

  async function save(e) {
    e.preventDefault()
    setStatus(null)
    if (!form.name.trim()) {
      setStatus({ type: 'error', message: 'Organization name is required.' })
      return
    }
    setSaving(true)
    try {
      const updated = await updateTenantSettings({
        name: form.name.trim(),
        timezone: form.timezone,
        qa_rules_path: form.qa_rules_path.trim() || null,
      })
      setTenant(updated)
      setStatus({ type: 'success', message: 'Organization settings saved.' })
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Could not save organization settings.' })
    } finally {
      setSaving(false)
    }
  }

  if (tenant === null) return <Card className="p-6 text-[14px] text-muted">Loading…</Card>
  if (tenant === false) return <Card className="p-6 text-[14px] text-error">Couldn&rsquo;t load organization settings.</Card>

  return (
    <Card className="p-6">
      <h3 className="text-[16px] font-semibold text-ink mb-1">Organization</h3>
      <p className="text-[13px] text-muted mb-5">Only admins can change these settings.</p>
      <form onSubmit={save} className="space-y-4 max-w-sm">
        <div>
          <label className="block text-[13px] font-medium text-ink mb-2" htmlFor="org-name">Organization name</label>
          <input id="org-name" required
            className="h-10 w-full rounded-md border border-hairline bg-surface px-3 text-[14px] text-ink"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-ink mb-2" htmlFor="org-timezone">Timezone</label>
          <select id="org-timezone"
            className="h-10 w-full rounded-md border border-hairline bg-surface px-3 text-[14px] text-ink"
            value={form.timezone}
            onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}
          >
            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-ink mb-2" htmlFor="org-qa-rules">QA rules file (optional override)</label>
          <input id="org-qa-rules" placeholder="rules/qa_rules.yaml"
            className="h-10 w-full rounded-md border border-hairline bg-surface px-3 text-[14px] font-mono text-ink"
            value={form.qa_rules_path}
            onChange={e => setForm(f => ({ ...f, qa_rules_path: e.target.value }))}
          />
          <p className="text-[12px] text-muted mt-1.5">Leave blank to use the platform default rule set.</p>
        </div>
        <Banner status={status} />
        <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving…' : 'Save organization settings'}</Button>
      </form>
    </Card>
  )
}

function TeamTab() {
  const { user } = useAuth()
  const [members, setMembers] = useState(null)
  const [invitations, setInvitations] = useState([])
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'agent' })
  const [inviting, setInviting] = useState(false)
  const [status, setStatus] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [inviteLink, setInviteLink] = useState(null)

  function load() {
    Promise.all([listTeamMembers(), listInvitations()])
      .then(([m, i]) => { setMembers(m); setInvitations(i) })
      .catch(() => setMembers(false))
  }

  useEffect(load, [])

  async function submitInvite(e) {
    e.preventDefault()
    setStatus(null)
    setInviteLink(null)
    if (!inviteForm.email.trim()) return
    setInviting(true)
    try {
      const invitation = await inviteTeamMember(inviteForm.email.trim(), inviteForm.role)
      setInviteForm({ email: '', role: 'agent' })
      // No email provider is wired up yet, so the accept link is handed to the
      // admin to share directly instead of being emailed to the invitee.
      setInviteLink(`${window.location.origin}/accept-invite?token=${invitation.token}`)
      load()
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Could not send invitation.' })
    } finally {
      setInviting(false)
    }
  }

  async function changeRole(id, role) {
    setBusyId(id)
    setStatus(null)
    try {
      await updateMemberRole(id, role)
      load()
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Could not update role.' })
    } finally {
      setBusyId(null)
    }
  }

  async function remove(id) {
    setBusyId(id)
    setStatus(null)
    try {
      await removeTeamMember(id)
      load()
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Could not remove member.' })
    } finally {
      setBusyId(null)
    }
  }

  async function revoke(id) {
    setBusyId(id)
    setStatus(null)
    try {
      await revokeInvitation(id)
      load()
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Could not revoke invitation.' })
    } finally {
      setBusyId(null)
    }
  }

  if (members === null) return <Card className="p-6 text-[14px] text-muted">Loading…</Card>
  if (members === false) return <Card className="p-6 text-[14px] text-error">Couldn&rsquo;t load the team.</Card>

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <h3 className="text-[16px] font-semibold text-ink mb-1">Invite a team member</h3>
        <p className="text-[13px] text-muted mb-5">They&rsquo;ll get an accept link to set their own password.</p>
        <form onSubmit={submitInvite} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[13px] font-medium text-ink mb-2" htmlFor="invite-email">Email</label>
            <input id="invite-email" type="email" required placeholder="teammate@company.com"
              className="h-10 w-full rounded-md border border-hairline bg-surface px-3 text-[14px] text-ink"
              value={inviteForm.email}
              onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink mb-2" htmlFor="invite-role">Role</label>
            <select id="invite-role"
              className="h-10 rounded-md border border-hairline bg-surface px-3 text-[14px] text-ink"
              value={inviteForm.role}
              onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))}
            >
              {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <Button type="submit" size="sm" disabled={inviting}>
            <Icon name="UserPlus" size={15} /> {inviting ? 'Sending…' : 'Invite'}
          </Button>
        </form>
        <div className="mt-4 space-y-3">
          <Banner status={status} />
          {inviteLink && (
            <div className="rounded-md border border-hairline p-3 flex items-center gap-2">
              <code className="flex-1 font-mono text-[12px] text-body truncate">{inviteLink}</code>
              <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(inviteLink)}>
                <Icon name="Copy" size={14} /> Copy link
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-[16px] font-semibold text-ink mb-4">Team members</h3>
        <div className="divide-y divide-hairline">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-3 py-3">
              <Avatar name={m.name || m.email} size={34} />
              <span className="flex-1">
                <span className="block text-[14px] font-medium text-ink">{m.name || m.email}</span>
                <span className="block text-[12px] text-muted">{m.email}</span>
              </span>
              <select
                className="h-9 rounded-md border border-hairline bg-surface px-2 text-[13px] text-ink disabled:opacity-50"
                value={m.role}
                disabled={busyId === m.id}
                onChange={e => changeRole(m.id, e.target.value)}
              >
                {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <Button variant="ghost" size="sm" disabled={busyId === m.id || m.id === user?.id}
                onClick={() => remove(m.id)} title={m.id === user?.id ? "You can't remove yourself" : 'Remove'}>
                <Icon name="Trash2" size={16} />
              </Button>
            </div>
          ))}
          {members.length === 0 && <p className="text-[13px] text-muted py-3">No team members yet.</p>}
        </div>
      </Card>

      {invitations.length > 0 && (
        <Card className="p-6">
          <h3 className="text-[16px] font-semibold text-ink mb-4">Pending invitations</h3>
          <div className="divide-y divide-hairline">
            {invitations.map(inv => (
              <div key={inv.id} className="flex items-center gap-3 py-3">
                <Avatar name={inv.email} size={34} />
                <span className="flex-1">
                  <span className="block text-[14px] font-medium text-ink">{inv.email}</span>
                  <span className="block text-[12px] text-muted">{ROLE_LABELS[inv.role] || inv.role}</span>
                </span>
                <StatusChip status="review">Pending</StatusChip>
                <Button variant="ghost" size="sm" disabled={busyId === inv.id} onClick={() => revoke(inv.id)}>
                  <Icon name="X" size={16} />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function BrandingTab() {
  const { tenantName } = useAuth()
  const tenantInitials = (tenantName || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  const [tenant, setTenant] = useState(null)
  const [logoUrl, setLogoUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState(null)
  const fileInputRef = useRef(null)

  function load() {
    getTenantSettings()
      .then(setTenant)
      .catch(() => setTenant(false))
  }

  useEffect(load, [])

  useEffect(() => {
    if (!tenant || !tenant.has_logo) { setLogoUrl(null); return }
    let cancelled = false
    let objectUrl = null
    fetchTenantLogoUrl().then(url => {
      if (cancelled) return
      objectUrl = url
      setLogoUrl(url)
    })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [tenant?.has_logo])

  async function handleFileChosen(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-choosing the same file later
    if (!file) return
    setStatus(null)
    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      setStatus({ type: 'error', message: 'Use PNG, JPEG, SVG, or WebP.' })
      return
    }
    if (file.size > MAX_LOGO_BYTES) {
      setStatus({ type: 'error', message: 'Logo must be under 2MB.' })
      return
    }
    setUploading(true)
    try {
      const updated = await uploadTenantLogo(file)
      setTenant(updated)
      setStatus({ type: 'success', message: 'Logo uploaded.' })
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Could not upload logo.' })
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    setUploading(true)
    setStatus(null)
    try {
      const updated = await removeTenantLogo()
      setTenant(updated)
      setStatus({ type: 'success', message: 'Logo removed.' })
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Could not remove logo.' })
    } finally {
      setUploading(false)
    }
  }

  if (tenant === false) return <Card className="p-6 text-[14px] text-error">Couldn&rsquo;t load branding settings.</Card>

  return (
    <Card className="p-6">
      <h3 className="text-[16px] font-semibold text-ink mb-1">White-label branding</h3>
      <p className="text-[13px] text-muted mb-5">Per-tenant brand colour and custom domain aren&rsquo;t stored yet — the palette below is the product default.</p>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[13px] font-medium text-ink mb-2">Logo</label>
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Organization logo" className="w-14 h-14 rounded-xl object-cover border border-hairline" />
            ) : (
              <span className="w-14 h-14 rounded-xl text-white font-bold text-[18px] flex items-center justify-center" style={{ background: 'rgb(var(--primary))' }}>{tenantInitials}</span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_LOGO_TYPES.join(',')}
              className="hidden"
              onChange={handleFileChosen}
            />
            <Button variant="secondary" size="sm" disabled={uploading || tenant === null} onClick={() => fileInputRef.current?.click()}>
              {uploading ? 'Uploading…' : 'Upload'}
            </Button>
            {tenant?.has_logo && (
              <Button variant="ghost" size="sm" disabled={uploading} onClick={handleRemove}>
                <Icon name="Trash2" size={14} /> Remove
              </Button>
            )}
          </div>
          {status && <p className={`text-[12px] mt-2 ${status.type === 'error' ? 'text-error' : 'text-success'}`}>{status.message}</p>}
        </div>
        <div>
          <label className="block text-[13px] font-medium text-ink mb-2">Primary brand color</label>
          <div className="flex items-center gap-2"><span className="w-10 h-10 rounded-md border border-hairline" style={{ background: 'rgb(var(--primary))' }} /><span className="font-mono text-[13px] text-muted">product default</span></div>
        </div>
      </div>
      <div className="mt-5 rounded-lg border border-hairline p-4 flex items-center justify-between"><span className="text-[14px] text-ink">Custom domain (CNAME)</span><span className="font-mono text-[13px] text-muted">—</span></div>
    </Card>
  )
}

export default function Settings() {
  const [tab, setTab] = useState('account')
  // The real organization from the token, not the demo tenant preset.
  const { tenantName } = useAuth()

  return (
    <div className="space-y-6">
      <div><h1 className="display d-lg text-ink">Settings</h1><p className="text-muted mt-1">Configure {tenantName || 'your organization'}.</p></div>
      <div className="grid lg:grid-cols-[200px_1fr] gap-6">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto">
          {TABS.map(x => (
            <button key={x.id} onClick={() => setTab(x.id)} className={`flex items-center gap-2.5 px-3 h-10 rounded-md text-[14px] font-medium whitespace-nowrap transition ${tab === x.id ? 'bg-primary-soft text-ink' : 'text-body hover:bg-surface-soft'}`}>
              <Icon name={x.icon} size={17} /> {x.label}
            </button>
          ))}
        </nav>

        <div className="space-y-5">
          {tab === 'account' && <AccountTab />}
          {tab === 'organization' && <OrganizationTab />}

          {tab === 'branding' && <BrandingTab />}

          {tab === 'team' && <TeamTab />}

          {tab === 'integrations' && <div className="grid sm:grid-cols-2 gap-4">
            {[['Twilio', 'Telephony', true], ['Genesys', 'Contact center', true], ['Salesforce', 'CRM', false], ['Slack', 'Alerts', true], ['Snowflake', 'Data warehouse', false], ['Zendesk', 'Ticketing', false]].map(([n, d, on]) => (
              <Card key={n} className="p-5 flex items-center gap-3"><span className="w-10 h-10 rounded-md bg-surface-card flex items-center justify-center text-ink"><Icon name="Plug" size={18} /></span><span className="flex-1"><span className="block text-[14px] font-semibold text-ink">{n}</span><span className="block text-[12px] text-muted">{d}</span></span><Toggle on={on} onChange={() => {}} /></Card>
            ))}
          </div>}

          {tab === 'api' && <Card className="p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="text-[16px] font-semibold text-ink">API keys</h3><Button size="sm"><Icon name="Plus" size={15} /> Generate</Button></div>
            <div className="space-y-3">
              {[['Production', 'sk_live_••••••••4f2a', 'Jun 2026'], ['Staging', 'sk_test_••••••••9c01', 'May 2026']].map(([n, k, d]) => (
                <div key={n} className="flex items-center gap-3 p-3 rounded-lg border border-hairline"><span className="text-[14px] font-medium text-ink w-24">{n}</span><code className="flex-1 font-mono text-[13px] text-body">{k}</code><span className="text-[12px] text-muted">{d}</span><Button variant="ghost" size="sm"><Icon name="Copy" size={15} /></Button></div>
              ))}
            </div>
          </Card>}

          {tab === 'data' && <Card className="p-6">
            <h3 className="text-[16px] font-semibold text-ink mb-4">Data & retention</h3>
            <div className="space-y-4">
              {[['Store call audio', 'Keep raw recordings after processing', true], ['PII redaction', 'Mask sensitive data in transcripts', true], ['Allow model training', 'Use anonymized data to improve models', false]].map(([t1, d, on]) => (
                <div key={t1} className="flex items-center justify-between"><span><span className="block text-[14px] font-medium text-ink">{t1}</span><span className="block text-[12px] text-muted">{d}</span></span><Toggle on={on} onChange={() => {}} /></div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-hairline"><span className="text-[14px] text-ink">Retention period</span><select className="h-9 rounded-md border border-hairline bg-surface px-2 text-[13px] text-ink"><option>30 days</option><option>90 days</option><option>1 year</option><option>Forever</option></select></div>
            </div>
          </Card>}
        </div>
      </div>
    </div>
  )
}
