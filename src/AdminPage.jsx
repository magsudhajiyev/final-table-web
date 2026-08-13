import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  getWaitlistUsers, getNicknameClaims,
  updateWaitlistUser, deleteWaitlistUser,
  updateNicknameClaim, deleteNicknameClaim,
  getAppUsers, updateAppUser, deleteAppUser,
  getUserStats, getUserOpponents, getOpponentStats, getUserSessions, getUserSessionResults, getUserHands,
  getSharedHands, deleteSharedHand,
  getEmailTemplates, saveEmailTemplate, updateEmailTemplate, deleteEmailTemplate,
  saveEmailLog, getEmailLogs,
  saveInboxReply, getInboxReplies,
  setInboxEmailStatus, getAllInboxStatuses, markInboxEmailRead,
  signInAdmin, signOutAdmin, onAuthChange, ADMIN_EMAILS
} from './lib/firebase'
import { posts as blogPosts } from './lib/blog'
import './AdminPage.css'

const SITE_URL = 'https://www.finaltable.io'

/* ══════════════════════════════════════════════
   UTILITIES
   ══════════════════════════════════════════════ */

const formatDate = (ts) => {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function exportCSV(rows, filename, columns) {
  const header = columns.map(c => c.label).join(',')
  const body = rows.map(r =>
    columns.map(c => {
      let val = c.get ? c.get(r) : (r[c.key] || '')
      val = String(val).replace(/"/g, '""')
      return `"${val}"`
    }).join(',')
  ).join('\n')
  const blob = new Blob([header + '\n' + body], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

async function sendResendEmail(to, { subject, html, templateId, variables, headers } = {}) {
  const payload = { to }
  if (templateId) {
    payload.templateId = templateId
    if (variables) payload.variables = variables
    if (subject) payload.subject = subject
  } else {
    payload.subject = subject
    payload.html = html
  }
  if (headers) payload.headers = headers
  const res = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Send failed' }))
    throw new Error(err.error || 'Send failed')
  }
  return res.json()
}

/* ══════════════════════════════════════════════
   SHARED COMPONENTS
   ══════════════════════════════════════════════ */

function LoginScreen({ onLogin }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const handleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      await signInAdmin()
      onLogin()
    } catch (err) {
      setError(err.message || 'Sign-in failed')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="adm-login-wrap">
      <div className="adm-login-card">
        <h1 className="adm-login-title">Admin</h1>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>Sign in with the authorized Google account</p>
        {error && <p className="adm-login-error">{error}</p>}
        <button className="adm-login-btn" onClick={handleSignIn} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  )
}

function SortableDate({ label, sortOrder, onToggle }) {
  return <th className="adm-th-sortable" onClick={onToggle}>{label} {sortOrder === 'desc' ? '↓' : '↑'}</th>
}

function SearchBar({ search, onSearch, dateFrom, dateTo, onDateFrom, onDateTo, statusFilter, statusOptions, onStatusFilter }) {
  return (
    <div className="adm-search-bar">
      <input className="adm-search-input" type="text" placeholder="Search..." value={search} onChange={e => onSearch(e.target.value)} />
      <input className="adm-date-input" type="date" value={dateFrom} onChange={e => onDateFrom(e.target.value)} />
      <span className="adm-date-sep">to</span>
      <input className="adm-date-input" type="date" value={dateTo} onChange={e => onDateTo(e.target.value)} />
      {statusOptions && (
        <select className="adm-status-filter" value={statusFilter} onChange={e => onStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      )}
    </div>
  )
}

function BulkBar({ count, onDeleteAll, extraActions }) {
  return (
    <div className="adm-bulk-bar">
      <span className="adm-bulk-count">{count} selected</span>
      {extraActions}
      <button className="adm-bulk-delete" onClick={onDeleteAll}>Delete selected</button>
    </div>
  )
}

function RowMenu({ onEdit, onDelete, extraItems }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, flipUp: false })
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])
  const handleOpen = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      const flipUp = rect.bottom + 150 > window.innerHeight
      setPos({
        left: rect.right,
        top: flipUp ? rect.top : rect.bottom,
        flipUp,
      })
    }
    setOpen(o => !o)
  }
  return (
    <div className="adm-menu-wrap" ref={ref}>
      <button className="adm-menu-trigger" onClick={handleOpen}>⋮</button>
      {open && (
        <div className="adm-menu-dropdown" style={{
          position: 'fixed',
          top: pos.flipUp ? 'auto' : pos.top,
          bottom: pos.flipUp ? (window.innerHeight - pos.top) : 'auto',
          left: pos.left,
          transform: 'translateX(-100%)',
        }}>
          {extraItems?.map((item, i) => (
            <button key={i} className={item.danger ? 'adm-menu-danger' : ''} onClick={() => { setOpen(false); item.onClick() }}>{item.label}</button>
          ))}
          {onEdit && <button onClick={() => { setOpen(false); onEdit() }}>Edit</button>}
          {onDelete && <button className="adm-menu-danger" onClick={() => { setOpen(false); onDelete() }}>Delete</button>}
        </div>
      )}
    </div>
  )
}

function EditModal({ title, fields, initial, onSave, onClose }) {
  const [values, setValues] = useState(initial)
  const [saving, setSaving] = useState(false)
  const handleSave = async () => {
    setSaving(true)
    try { await onSave(values); onClose() } catch (err) { console.error(err); setSaving(false) }
  }
  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <h2 className="adm-modal-title">{title}</h2>
        <div className="adm-modal-fields">
          {fields.map(f => (
            <label key={f.key} className="adm-modal-label">
              <span>{f.label}</span>
              {f.type === 'select' ? (
                <select className="adm-modal-input" value={values[f.key] || ''} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea className="adm-modal-input adm-modal-textarea" value={values[f.key] || ''} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))} rows={4} />
              ) : (
                <input className="adm-modal-input" type="text" value={values[f.key] || ''} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))} />
              )}
            </label>
          ))}
        </div>
        <div className="adm-modal-actions">
          <button className="adm-modal-cancel" onClick={onClose}>Cancel</button>
          <button className="adm-modal-save" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirm({ label, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false)
  const handleDelete = async () => {
    setDeleting(true)
    try { await onConfirm(); onClose() } catch (err) { console.error(err); setDeleting(false) }
  }
  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal adm-modal-sm" onClick={e => e.stopPropagation()}>
        <h2 className="adm-modal-title">Delete entry</h2>
        <p className="adm-modal-body">Are you sure you want to delete <strong>{label}</strong>? This cannot be undone.</p>
        <div className="adm-modal-actions">
          <button className="adm-modal-cancel" onClick={onClose}>Cancel</button>
          <button className="adm-modal-delete" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </div>
    </div>
  )
}

function ViewModal({ title, content, onClose }) {
  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <h2 className="adm-modal-title">{title}</h2>
        <div className="adm-view-content">{content}</div>
        <div className="adm-modal-actions">
          <button className="adm-modal-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

function EmailModal({ to, onClose, onToast }) {
  const [subject, setSubject] = useState('Welcome to Final Table!')
  const [body, setBody] = useState(`<p>Hi there,</p><p>Your username has been approved! You're all set to join Final Table when we launch.</p><p>Stay tuned — we'll notify you as soon as early access opens.</p><p>— The Final Table Team</p>`)
  const [sending, setSending] = useState(false)
  const handleSend = async () => {
    setSending(true)
    try {
      await sendResendEmail(to, { subject, html: body })
      onToast('Email sent successfully', 'success')
      onClose()
    } catch (err) {
      onToast('Failed to send email: ' + err.message, 'error')
      setSending(false)
    }
  }
  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal adm-modal-lg" onClick={e => e.stopPropagation()}>
        <h2 className="adm-modal-title">Send Email</h2>
        <div className="adm-modal-fields">
          <label className="adm-modal-label"><span>To</span><input className="adm-modal-input" value={to} disabled /></label>
          <label className="adm-modal-label"><span>Subject</span><input className="adm-modal-input" value={subject} onChange={e => setSubject(e.target.value)} /></label>
          <label className="adm-modal-label"><span>Body (HTML)</span><textarea className="adm-modal-input adm-modal-textarea" value={body} onChange={e => setBody(e.target.value)} rows={6} /></label>
        </div>
        <div className="adm-modal-actions">
          <button className="adm-modal-cancel" onClick={onClose}>Cancel</button>
          <button className="adm-modal-save" onClick={handleSend} disabled={sending}>{sending ? 'Sending...' : 'Send'}</button>
        </div>
      </div>
    </div>
  )
}

function Toast({ message, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t) }, [onDone])
  return <div className={`adm-toast adm-toast-${type}`}>{message}</div>
}

/* ══════════════════════════════════════════════
   FILTER + SORT HOOK
   ══════════════════════════════════════════════ */

function useFilterSort(data, textKeys, statusKey, dateKey = 'timestamp') {
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selected, setSelected] = useState(new Set())

  const filtered = useMemo(() => {
    let items = [...data]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(r => textKeys.some(k => String(r[k] || '').toLowerCase().includes(q)))
    }
    if (dateFrom) {
      const from = new Date(dateFrom); from.setHours(0, 0, 0, 0)
      items = items.filter(r => r[dateKey] && r[dateKey] >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo); to.setHours(23, 59, 59, 999)
      items = items.filter(r => r[dateKey] && r[dateKey] <= to)
    }
    if (statusFilter && statusKey) {
      items = items.filter(r => (r[statusKey] || '') === statusFilter)
    }
    items.sort((a, b) => {
      const ta = a[dateKey] ? a[dateKey].getTime() : 0
      const tb = b[dateKey] ? b[dateKey].getTime() : 0
      return sortOrder === 'desc' ? tb - ta : ta - tb
    })
    return items
  }, [data, search, dateFrom, dateTo, statusFilter, sortOrder, textKeys, statusKey, dateKey])

  useEffect(() => { setSelected(new Set()) }, [data])

  const toggleSelect = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll = () => setSelected(s => s.size === filtered.length ? new Set() : new Set(filtered.map(r => r.id)))

  return {
    search, setSearch, dateFrom, setDateFrom, dateTo, setDateTo,
    statusFilter, setStatusFilter, sortOrder, setSortOrder,
    filtered, selected, toggleSelect, toggleAll, setSelected
  }
}

/* ══════════════════════════════════════════════
   OVERVIEW TAB
   ══════════════════════════════════════════════ */

function OverviewTab() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const [w, u, h, au] = await Promise.all([getWaitlistUsers(), getNicknameClaims(), getSharedHands(), getAppUsers()])
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 7)

        const usersToday = au.filter(r => r.createdAt && r.createdAt >= todayStart).length
        const usersWeek = au.filter(r => r.createdAt && r.createdAt >= weekStart).length

        const days = []
        for (let i = 29; i >= 0; i--) {
          const d = new Date(todayStart); d.setDate(d.getDate() - i)
          const next = new Date(d); next.setDate(next.getDate() + 1)
          const count = au.filter(r => r.createdAt && r.createdAt >= d && r.createdAt < next).length
          days.push({ label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count })
        }
        const maxCount = Math.max(...days.map(d => d.count), 1)

        setStats({ waitlist: w.length, nicknames: u.length, users: au.length, hands: h.length, usersToday, usersWeek, days, maxCount })
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <div className="adm-loading">Loading overview...</div>
  if (!stats) return <div className="adm-loading">Failed to load</div>

  return (
    <>
      <div className="adm-header"><h1 className="adm-page-title">Overview</h1></div>
      <div className="adm-stats-grid">
        <div className="adm-stat-card"><div className="adm-stat-value">{stats.waitlist}</div><div className="adm-stat-label">Waitlist</div></div>
        <div className="adm-stat-card"><div className="adm-stat-value">{stats.users}</div><div className="adm-stat-label">App Users</div></div>
        <div className="adm-stat-card"><div className="adm-stat-value">{stats.nicknames}</div><div className="adm-stat-label">Nickname Claims</div></div>
        <div className="adm-stat-card"><div className="adm-stat-value">{stats.hands}</div><div className="adm-stat-label">Shared Hands</div></div>
        <div className="adm-stat-card adm-stat-highlight"><div className="adm-stat-value">{stats.usersToday}</div><div className="adm-stat-label">New users today</div></div>
        <div className="adm-stat-card adm-stat-highlight"><div className="adm-stat-value">{stats.usersWeek}</div><div className="adm-stat-label">New users this week</div></div>
      </div>
      <div className="adm-chart-section">
        <h2 className="adm-chart-title">App user signups — last 30 days</h2>
        <div className="adm-chart">
          {stats.days.map((d, i) => (
            <div key={i} className="adm-chart-col" title={`${d.label}: ${d.count}`}>
              <div className="adm-chart-bar" style={{ height: `${(d.count / stats.maxCount) * 100}%` }} />
              {i % 5 === 0 && <span className="adm-chart-label">{d.label}</span>}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════
   WAITLIST TAB
   ══════════════════════════════════════════════ */

const WAITLIST_FIELDS = [
  { key: 'email', label: 'Email' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'platform', label: 'Platform', type: 'select', options: ['', 'ios', 'android'] },
  { key: 'source', label: 'Source' },
]
const WAITLIST_CSV_COLS = [
  { key: 'email', label: 'Email' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'platform', label: 'Platform' },
  { label: 'Status', get: r => r.isUser ? 'Active User' : 'Waitlist Only' },
  { key: 'source', label: 'Source' },
  { label: 'Date', get: r => r.timestamp ? r.timestamp.toISOString() : '' },
]

function WaitlistTab() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [userEmails, setUserEmails] = useState(new Set())
  const [statusFilter, setStatusFilter] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [w, users] = await Promise.all([getWaitlistUsers(), getAppUsers()])
      const emails = new Set(users.map(u => (u.email || '').toLowerCase()))
      setUserEmails(emails)
      const userNameByEmail = {}
      users.forEach(u => { if (u.email && u.displayName) userNameByEmail[u.email.toLowerCase()] = u.displayName })
      const waitlistEmails = new Set(w.map(e => (e.email || '').toLowerCase()))
      const appOnlyUsers = users
        .filter(u => u.email && !waitlistEmails.has(u.email.toLowerCase()))
        .map(u => ({
          id: `appuser_${u.id}`,
          email: u.email,
          firstName: u.displayName ? u.displayName.split(' ')[0] : '',
          lastName: u.displayName ? u.displayName.split(' ').slice(1).join(' ') : '',
          platform: '',
          source: 'app',
          timestamp: u.createdAt,
          isUser: true,
        }))
      setData([
        ...w.map(entry => {
          const isUser = emails.has((entry.email || '').toLowerCase())
          if (isUser && !entry.firstName && !entry.lastName) {
            const dn = userNameByEmail[(entry.email || '').toLowerCase()]
            if (dn) return { ...entry, isUser, firstName: dn.split(' ')[0], lastName: dn.split(' ').slice(1).join(' ') }
          }
          return { ...entry, isUser }
        }),
        ...appOnlyUsers,
      ])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchData() }, [fetchData])

  const fs = useFilterSort(data, ['email', 'firstName', 'lastName', 'source'])

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${fs.selected.size} entries?`)) return
    await Promise.all([...fs.selected].map(id => deleteWaitlistUser(id)))
    await fetchData()
  }

  return (
    <>
      <div className="adm-header">
        <h1 className="adm-page-title">Waitlist</h1>
        <div className="adm-header-right">
          <span className="adm-count">{fs.filtered.length} of {data.length}</span>
          <button className="adm-refresh-btn" onClick={() => exportCSV(fs.filtered, 'waitlist.csv', WAITLIST_CSV_COLS)}>Export CSV</button>
          <button className="adm-refresh-btn" onClick={fetchData} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button>
        </div>
      </div>
      <SearchBar search={fs.search} onSearch={fs.setSearch} dateFrom={fs.dateFrom} dateTo={fs.dateTo} onDateFrom={fs.setDateFrom} onDateTo={fs.setDateTo} />
      <div className="adm-email-filters" style={{ marginBottom: 12 }}>
        <select className="adm-email-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto' }}>
          <option value="">All</option>
          <option value="user">Active Users</option>
          <option value="not_user">Not Yet Users</option>
        </select>
      </div>
      {fs.selected.size > 0 && <BulkBar count={fs.selected.size} onDeleteAll={handleBulkDelete} />}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th className="adm-th-check"><input type="checkbox" checked={fs.selected.size === fs.filtered.length && fs.filtered.length > 0} onChange={fs.toggleAll} /></th>
              <th>#</th><th>Email</th><th>First Name</th><th>Last Name</th><th>Platform</th><th>Status</th><th>Source</th>
              <SortableDate label="Date" sortOrder={fs.sortOrder} onToggle={() => fs.setSortOrder(s => s === 'desc' ? 'asc' : 'desc')} />
              <th></th>
            </tr>
          </thead>
          <tbody>
            {fs.filtered.filter(u => {
              if (statusFilter === 'user') return u.isUser
              if (statusFilter === 'not_user') return !u.isUser
              return true
            }).map((u, i) => (
              <tr key={u.id} className={fs.selected.has(u.id) ? 'adm-row-selected' : ''}>
                <td className="adm-td-check"><input type="checkbox" checked={fs.selected.has(u.id)} onChange={() => fs.toggleSelect(u.id)} /></td>
                <td className="adm-td-num">{i + 1}</td>
                <td>{u.email}</td><td>{u.firstName || '—'}</td><td>{u.lastName || '—'}</td><td>{u.platform || '—'}</td>
                <td>{u.isUser
                  ? <span className="adm-status adm-status-approved" style={{ fontSize: 11 }}>Active User</span>
                  : <span className="adm-status adm-status-pending" style={{ fontSize: 11 }}>Waitlist Only</span>}
                </td>
                <td>{u.source || '—'}</td>
                <td className="adm-td-date">{formatDate(u.timestamp)}</td>
                <td className="adm-td-actions"><RowMenu onEdit={() => setEditing(u)} onDelete={() => setDeleting(u)} /></td>
              </tr>
            ))}
            {!loading && fs.filtered.length === 0 && <tr><td colSpan="10" className="adm-empty">No entries found</td></tr>}
          </tbody>
        </table>
      </div>
      {editing && <EditModal title="Edit Waitlist Entry" fields={WAITLIST_FIELDS}
        initial={{ email: editing.email || '', firstName: editing.firstName || '', lastName: editing.lastName || '', platform: editing.platform || '', source: editing.source || '' }}
        onSave={async v => { await updateWaitlistUser(editing.id, v); await fetchData() }} onClose={() => setEditing(null)} />}
      {deleting && <DeleteConfirm label={deleting.email}
        onConfirm={async () => { await deleteWaitlistUser(deleting.id); await fetchData() }} onClose={() => setDeleting(null)} />}
    </>
  )
}

/* ══════════════════════════════════════════════
   USERS TAB
   ══════════════════════════════════════════════ */

const NICKNAME_FIELDS = [
  { key: 'nickname', label: 'Username' },
  { key: 'email', label: 'Email' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'platform', label: 'Platform', type: 'select', options: ['', 'ios', 'android'] },
  { key: 'status', label: 'Status', type: 'select', options: ['pending', 'approved', 'rejected'] },
]
const NICKNAME_CSV_COLS = [
  { key: 'nickname', label: 'Username' },
  { key: 'email', label: 'Email' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'platform', label: 'Platform' },
  { key: 'status', label: 'Status' },
  { label: 'Date', get: r => r.timestamp ? r.timestamp.toISOString() : '' },
]

function NicknameClaimsTab({ onToast }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [emailing, setEmailing] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try { setData(await getNicknameClaims()) } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchData() }, [fetchData])

  const fs = useFilterSort(data, ['nickname', 'email', 'firstName', 'lastName'], 'status')

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${fs.selected.size} entries?`)) return
    await Promise.all([...fs.selected].map(id => deleteNicknameClaim(id)))
    await fetchData()
  }
  const handleBulkStatus = async (status) => {
    await Promise.all([...fs.selected].map(id => updateNicknameClaim(id, { status })))
    await fetchData()
  }

  return (
    <>
      <div className="adm-header">
        <h1 className="adm-page-title">Nickname Claims</h1>
        <div className="adm-header-right">
          <span className="adm-count">{fs.filtered.length} of {data.length}</span>
          <button className="adm-refresh-btn" onClick={() => exportCSV(fs.filtered, 'nickname_claims.csv', NICKNAME_CSV_COLS)}>Export CSV</button>
          <button className="adm-refresh-btn" onClick={fetchData} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button>
        </div>
      </div>
      <SearchBar search={fs.search} onSearch={fs.setSearch} dateFrom={fs.dateFrom} dateTo={fs.dateTo}
        onDateFrom={fs.setDateFrom} onDateTo={fs.setDateTo}
        statusFilter={fs.statusFilter} statusOptions={['pending', 'approved', 'rejected']} onStatusFilter={fs.setStatusFilter} />
      {fs.selected.size > 0 && (
        <BulkBar count={fs.selected.size} onDeleteAll={handleBulkDelete} extraActions={
          <select className="adm-bulk-status" defaultValue="" onChange={e => { if (e.target.value) handleBulkStatus(e.target.value); e.target.value = '' }}>
            <option value="" disabled>Set status...</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        } />
      )}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th className="adm-th-check"><input type="checkbox" checked={fs.selected.size === fs.filtered.length && fs.filtered.length > 0} onChange={fs.toggleAll} /></th>
              <th>#</th><th>Username</th><th>Email</th><th>First Name</th><th>Last Name</th><th>Platform</th><th>Status</th>
              <SortableDate label="Date" sortOrder={fs.sortOrder} onToggle={() => fs.setSortOrder(s => s === 'desc' ? 'asc' : 'desc')} />
              <th></th>
            </tr>
          </thead>
          <tbody>
            {fs.filtered.map((u, i) => (
              <tr key={u.id} className={fs.selected.has(u.id) ? 'adm-row-selected' : ''}>
                <td className="adm-td-check"><input type="checkbox" checked={fs.selected.has(u.id)} onChange={() => fs.toggleSelect(u.id)} /></td>
                <td className="adm-td-num">{i + 1}</td>
                <td className="adm-td-username">@{u.nickname}</td>
                <td>{u.email}</td><td>{u.firstName || '—'}</td><td>{u.lastName || '—'}</td>
                <td>{u.platform || '—'}</td>
                <td><span className={`adm-status adm-status-${u.status || 'pending'}`}>{u.status || 'pending'}</span></td>
                <td className="adm-td-date">{formatDate(u.timestamp)}</td>
                <td className="adm-td-actions">
                  <RowMenu onEdit={() => setEditing(u)} onDelete={() => setDeleting(u)}
                    extraItems={[{ label: 'Send Email', onClick: () => setEmailing(u.email) }]} />
                </td>
              </tr>
            ))}
            {!loading && fs.filtered.length === 0 && <tr><td colSpan="10" className="adm-empty">No entries found</td></tr>}
          </tbody>
        </table>
      </div>
      {editing && <EditModal title="Edit Nickname Claim" fields={NICKNAME_FIELDS}
        initial={{ nickname: editing.nickname || '', email: editing.email || '', firstName: editing.firstName || '', lastName: editing.lastName || '', platform: editing.platform || '', status: editing.status || 'pending' }}
        onSave={async v => { await updateNicknameClaim(editing.id, v); await fetchData() }} onClose={() => setEditing(null)} />}
      {deleting && <DeleteConfirm label={`@${deleting.nickname}`}
        onConfirm={async () => { await deleteNicknameClaim(deleting.id); await fetchData() }} onClose={() => setDeleting(null)} />}
      {emailing && <EmailModal to={emailing} onClose={() => setEmailing(null)} onToast={onToast} />}
    </>
  )
}

/* ══════════════════════════════════════════════
   APP USERS TAB
   ══════════════════════════════════════════════ */

const APP_USERS_FIELDS = [
  { key: 'displayName', label: 'Display Name' },
  { key: 'email', label: 'Email' },
  { key: 'username', label: 'Username' },
]
const APP_USERS_CSV_COLS = [
  { key: 'displayName', label: 'Display Name' },
  { key: 'email', label: 'Email' },
  { key: 'username', label: 'Username' },
  { label: 'Created', get: r => r.createdAt ? r.createdAt.toISOString() : '' },
  { label: 'Last Login', get: r => r.lastLogin ? r.lastLogin.toISOString() : '' },
]

/* ── Onboarding survey (users.onboardingData) ── */

// Known answer labels. Unmapped values fall back to a title-cased raw string,
// so the UI stays correct if the app adds new options.
const SURVEY_LABELS = {
  pokerJourney: { fun: 'For fun', beginner: 'Beginner', regular: 'Regular', pro: 'Pro' },
  gameType: { cash: 'Cash', tournament: 'Tournament', both: 'Both' },
  purposes: {
    logging: 'Session logging', opponents: 'Opponent tracking', studying: 'Studying hands',
    ai: 'AI analysis', actions: 'Action tracking', bankroll: 'Bankroll', export: 'Data export',
    sharing: 'Sharing hands', stacks: 'Stack tracking',
  },
}
const titleCase = (s) => String(s).replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
const surveyLabel = (dim, value) => (value == null || value === '') ? '—' : (SURVEY_LABELS[dim]?.[value] || titleCase(value))
// monthlySessions is a raw number; group it into ordered buckets so charts
// don't show a separate slice per exact value. Each bucket has a stable order
// index so distributions can sort low→high.
const SESSION_BUCKETS = [
  { max: 1, order: 0, label: '1 or fewer / month' },
  { max: 3, order: 1, label: '2–3 / month' },
  { max: 7, order: 2, label: '4–7 / month' },
  { max: 15, order: 3, label: '8–15 / month' },
  { max: Infinity, order: 4, label: '15+ / month' },
]
const sessionBucket = (n) => {
  const num = Number(n)
  if (n == null || n === '' || Number.isNaN(num)) return null
  return SESSION_BUCKETS.find(b => num <= b.max)
}
const sessionsLabel = (n) => sessionBucket(n)?.label ?? '—'

// Count occurrences of a survey answer across users. `multi` handles array
// fields (purposes). Returns [{ value, label, count }] sorted by count desc.
function tallySurvey(users, dim, { multi = false, labelFn } = {}) {
  const counts = new Map()
  for (const u of users) {
    const od = u.onboardingData
    if (!od) continue
    const raw = od[dim]
    if (raw == null || raw === '') continue
    const values = multi ? (Array.isArray(raw) ? raw : [raw]) : [raw]
    for (const v of values) counts.set(v, (counts.get(v) || 0) + 1)
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, label: labelFn ? labelFn(value) : surveyLabel(dim, value), count }))
    .sort((a, b) => b.count - a.count)
}

// monthlySessions grouped into ordered buckets (low→high), one row per bucket.
function tallySessions(users) {
  const counts = new Map() // order -> { label, count }
  for (const u of users) {
    const b = sessionBucket(u.onboardingData?.monthlySessions)
    if (!b) continue
    const cur = counts.get(b.order) || { value: b.order, label: b.label, count: 0 }
    cur.count += 1
    counts.set(b.order, cur)
  }
  return [...counts.values()].sort((a, b) => a.value - b.value)
}

const SURVEY_CSV_COLS = [
  { key: 'displayName', label: 'Display Name' },
  { key: 'email', label: 'Email' },
  { key: 'username', label: 'Username' },
  { label: 'Completed Onboarding', get: r => r.hasCompletedOnboarding ? 'yes' : 'no' },
  { label: 'Poker Journey', get: r => r.onboardingData ? surveyLabel('pokerJourney', r.onboardingData.pokerJourney) : '' },
  { label: 'Game Type', get: r => r.onboardingData ? surveyLabel('gameType', r.onboardingData.gameType) : '' },
  { label: 'Monthly Sessions', get: r => r.onboardingData ? sessionsLabel(r.onboardingData.monthlySessions) : '' },
  { label: 'Purposes', get: r => (r.onboardingData?.purposes || []).map(p => surveyLabel('purposes', p)).join('; ') },
  { label: 'Completed At', get: r => r.onboardingData?.completedAt?.toDate?.()?.toISOString?.() || '' },
]

function UserDetailView({ user, onBack }) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [opponents, setOpponents] = useState([])
  const [sessions, setSessions] = useState([])
  const [sessionResults, setSessionResults] = useState([])
  const [hands, setHands] = useState([])
  const [subTab, setSubTab] = useState('opponents')

  useEffect(() => {
    (async () => {
      setLoading(true)
      const uid = user.uid || user.id
      // Fetch each independently so one failure doesn't block the rest
      const safe = (fn) => fn.catch(err => { console.error('UserDetailView query error:', err); return null })
      const [st, opp, sess, sr, h] = await Promise.all([
        safe(getUserStats(uid)),
        safe(getUserOpponents(uid)),
        safe(getUserSessions(uid)),
        safe(getUserSessionResults(uid)),
        safe(getUserHands(uid)),
      ])
      try {
        setStats(st)
        // Join opponent stats
        if (opp && opp.length > 0) {
          const os = await getOpponentStats(opp.map(o => o.id)).catch(() => ({}))
          setOpponents(opp.map(o => ({ ...o, stats: os[o.id] || {} })))
        }
        if (sess) setSessions(sess.sort((a, b) => (b.startTime || 0) - (a.startTime || 0)))
        if (sr) setSessionResults(sr.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)))
        if (h) setHands(h.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)))
      } catch (err) { console.error('UserDetailView fetch error:', err) }
      finally { setLoading(false) }
    })()
  }, [user])

  const pct = (num, den) => den > 0 ? ((num / den) * 100).toFixed(1) + '%' : '—'
  const formatMin = (min) => {
    if (!min) return '—'
    if (min < 60) return `${min}m`
    return `${Math.floor(min / 60)}h ${min % 60}m`
  }

  if (loading) return <div className="adm-loading">Loading user data...</div>

  const winRate = stats ? pct(stats.wonHands || 0, stats.handsPlayed || 0) : '—'

  return (
    <>
      {/* Header */}
      <div className="adm-header" style={{ alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="adm-refresh-btn" onClick={onBack} style={{ padding: '6px 12px' }}>&larr; Back</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user.photoURL
              ? <img src={user.photoURL} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
              : <span className="adm-avatar-placeholder" style={{ width: 40, height: 40, fontSize: 16 }}>{(user.displayName || user.email || '?')[0].toUpperCase()}</span>}
            <div>
              <h1 className="adm-page-title" style={{ margin: 0, fontSize: 20 }}>{user.displayName || '—'}</h1>
              <p style={{ margin: 0, fontSize: 13, color: '#888' }}>
                {user.email}{user.username ? ` · @${user.username}` : ''}
                {user.createdAt ? ` · Joined ${formatDate(user.createdAt)}` : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="adm-stats-grid" style={{ marginBottom: 24 }}>
        <div className="adm-stat-card"><div className="adm-stat-value">{stats?.totalSessions || 0}</div><div className="adm-stat-label">Sessions</div></div>
        <div className="adm-stat-card"><div className="adm-stat-value">{stats?.totalHands || 0}</div><div className="adm-stat-label">Hands</div></div>
        <div className="adm-stat-card"><div className="adm-stat-value">{winRate}</div><div className="adm-stat-label">Win Rate</div></div>
        <div className="adm-stat-card"><div className="adm-stat-value">{formatMin(stats?.totalPlayTimeMinutes)}</div><div className="adm-stat-label">Play Time</div></div>
        <div className="adm-stat-card"><div className="adm-stat-value">{opponents.length}</div><div className="adm-stat-label">Opponents</div></div>
        <div className="adm-stat-card"><div className="adm-stat-value">{user.currentBankroll != null ? `$${Number(user.currentBankroll).toLocaleString()}` : '—'}</div><div className="adm-stat-label">Bankroll</div></div>
      </div>

      {/* Onboarding survey answers */}
      {user.onboardingData && (
        <div className="adm-survey-detail">
          <h3 className="adm-survey-detail-title">Onboarding survey</h3>
          <div className="adm-survey-detail-grid">
            <div className="adm-survey-detail-item"><span className="adm-survey-detail-label">Poker journey</span><span className="adm-survey-detail-value">{surveyLabel('pokerJourney', user.onboardingData.pokerJourney)}</span></div>
            <div className="adm-survey-detail-item"><span className="adm-survey-detail-label">Game type</span><span className="adm-survey-detail-value">{surveyLabel('gameType', user.onboardingData.gameType)}</span></div>
            <div className="adm-survey-detail-item"><span className="adm-survey-detail-label">Sessions / month</span><span className="adm-survey-detail-value">{sessionsLabel(user.onboardingData.monthlySessions)}</span></div>
            <div className="adm-survey-detail-item"><span className="adm-survey-detail-label">Purposes</span><span className="adm-survey-detail-value">{(user.onboardingData.purposes || []).map(p => surveyLabel('purposes', p)).join(', ') || '—'}</span></div>
          </div>
        </div>
      )}

      {/* Sub-tabs */}
      <div className="adm-email-subtabs" style={{ marginBottom: 16 }}>
        {[{ id: 'opponents', label: `Opponents (${opponents.length})` }, { id: 'sessions', label: `Sessions (${sessions.length + sessionResults.length})` }, { id: 'hands', label: `Hands (${hands.length})` }].map(t => (
          <button key={t.id} className={`adm-email-subtab${subTab === t.id ? ' active' : ''}`} onClick={() => setSubTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* Opponents */}
      {subTab === 'opponents' && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th></th><th>Name</th><th>Hands</th><th>VPIP</th><th>PFR</th><th>3-Bet</th><th>C-Bet</th><th>Last Seen</th></tr>
            </thead>
            <tbody>
              {opponents.map(o => (
                <tr key={o.id}>
                  <td style={{ width: 24 }}><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: o.color || '#666' }} /></td>
                  <td><strong>{o.name}</strong>{o.notes ? <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>{o.notes}</span> : null}</td>
                  <td>{o.stats.handsPlayed || 0}</td>
                  <td>{pct(o.stats.vpipCount, o.stats.handsPlayed)}</td>
                  <td>{pct(o.stats.pfrCount, o.stats.handsPlayed)}</td>
                  <td>{pct(o.stats.threeBetCount, o.stats.threeBetOpportunity)}</td>
                  <td>{pct(o.stats.cbetCount, o.stats.cbetOpportunity)}</td>
                  <td className="adm-td-date">{formatDate(o.lastSeenAt)}</td>
                </tr>
              ))}
              {opponents.length === 0 && <tr><td colSpan="8" className="adm-empty">No opponents tracked</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Sessions */}
      {subTab === 'sessions' && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Name</th><th>Type</th><th>Buy-In</th><th>Result</th><th>Hands</th><th>Duration</th><th>Date</th></tr>
            </thead>
            <tbody>
              {sessions.map(s => {
                const result = s.currentStack != null && s.totalBuyIn != null ? (s.currentStack - s.totalBuyIn) : null
                const dur = s.startTime && s.endTime ? Math.round((s.endTime - s.startTime) / 60000) : null
                return (
                  <tr key={s.id}>
                    <td><strong>{s.sessionName || '—'}</strong></td>
                    <td><span className={`adm-status adm-status-${s.gameType || 'cash'}`}>{s.gameType || 'cash'}</span></td>
                    <td>${Number(s.totalBuyIn || s.buyInAmount || 0).toLocaleString()}</td>
                    <td style={{ color: result > 0 ? '#4ade80' : result < 0 ? '#f87171' : '#888', fontWeight: 600 }}>
                      {result != null ? (result >= 0 ? '+' : '') + '$' + Math.abs(result).toLocaleString() : '—'}
                    </td>
                    <td>{s.handsLogged || s.totalHands || 0}</td>
                    <td>{dur != null ? formatMin(dur) : '—'}</td>
                    <td className="adm-td-date">{formatDate(s.startTime)}</td>
                  </tr>
                )
              })}
              {sessionResults.map(sr => {
                return (
                  <tr key={sr.id}>
                    <td><strong>Tournament Result</strong></td>
                    <td><span className={`adm-status adm-status-${sr.gameType || 'tournament'}`}>{sr.gameType || 'tournament'}</span></td>
                    <td>${Number(sr.buyInAmount || 0).toLocaleString()}</td>
                    <td style={{ color: sr.amount > 0 ? '#4ade80' : sr.amount < 0 ? '#f87171' : '#888', fontWeight: 600 }}>
                      {sr.amount != null ? (sr.amount >= 0 ? '+' : '') + '$' + Math.abs(sr.amount).toLocaleString() : '—'}
                    </td>
                    <td>{sr.finishedPlace ? `#${sr.finishedPlace}${sr.fieldSize ? '/' + sr.fieldSize : ''}` : '—'}</td>
                    <td>{sr.durationMinutes ? formatMin(sr.durationMinutes) : '—'}</td>
                    <td className="adm-td-date">{formatDate(sr.timestamp)}</td>
                  </tr>
                )
              })}
              {sessions.length === 0 && sessionResults.length === 0 && <tr><td colSpan="7" className="adm-empty">No sessions found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Hands */}
      {subTab === 'hands' && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Hand #</th><th>Session</th><th>Position</th><th>Result</th><th>Pot</th><th>Game</th><th>Date</th></tr>
            </thead>
            <tbody>
              {hands.map(h => (
                <tr key={h.id}>
                  <td><strong>#{h.handNumber || '—'}</strong></td>
                  <td>{h.sessionName || '—'}</td>
                  <td>{h.heroPositionName || '—'}</td>
                  <td style={{ color: h.result === 'Won' ? '#4ade80' : h.result === 'Lost' ? '#f87171' : '#888', fontWeight: 600 }}>{h.result || '—'}</td>
                  <td>${Number(h.potAmount || 0).toLocaleString()}</td>
                  <td>{h.gameType || '—'}</td>
                  <td className="adm-td-date">{formatDate(h.createdAt)}</td>
                </tr>
              ))}
              {hands.length === 0 && <tr><td colSpan="7" className="adm-empty">No hands shared</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function AppUsersTab() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [viewingUser, setViewingUser] = useState(null)
  const [view, setView] = useState('list') // list | survey

  const fetchData = useCallback(async () => {
    setLoading(true)
    try { setData(await getAppUsers()) } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchData() }, [fetchData])

  const fs = useFilterSort(data, ['displayName', 'email', 'username'], null, 'createdAt')

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${fs.selected.size} users? This action is irreversible.`)) return
    await Promise.all([...fs.selected].map(id => deleteAppUser(id)))
    await fetchData()
  }

  if (viewingUser) return <UserDetailView user={viewingUser} onBack={() => setViewingUser(null)} />

  const viewToggle = (
    <div className="adm-email-subtabs" style={{ marginBottom: 16 }}>
      {[{ id: 'list', label: 'Users' }, { id: 'survey', label: 'Survey Results' }].map(t => (
        <button key={t.id} className={`adm-email-subtab${view === t.id ? ' active' : ''}`} onClick={() => setView(t.id)}>{t.label}</button>
      ))}
    </div>
  )

  if (view === 'survey') {
    return (
      <>
        <div className="adm-header">
          <h1 className="adm-page-title">Users</h1>
          <div className="adm-header-right">
            <button className="adm-refresh-btn" onClick={fetchData} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button>
          </div>
        </div>
        {viewToggle}
        <SurveyResultsView users={data} loading={loading} onViewUser={setViewingUser} />
      </>
    )
  }

  return (
    <>
      <div className="adm-header">
        <h1 className="adm-page-title">Users</h1>
        <div className="adm-header-right">
          <span className="adm-count">{fs.filtered.length} of {data.length}</span>
          <button className="adm-refresh-btn" onClick={() => exportCSV(fs.filtered, 'users.csv', APP_USERS_CSV_COLS)}>Export CSV</button>
          <button className="adm-refresh-btn" onClick={fetchData} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button>
        </div>
      </div>
      {viewToggle}
      <SearchBar search={fs.search} onSearch={fs.setSearch} dateFrom={fs.dateFrom} dateTo={fs.dateTo}
        onDateFrom={fs.setDateFrom} onDateTo={fs.setDateTo} />
      {fs.selected.size > 0 && <BulkBar count={fs.selected.size} onDeleteAll={handleBulkDelete} />}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th className="adm-th-check"><input type="checkbox" checked={fs.selected.size === fs.filtered.length && fs.filtered.length > 0} onChange={fs.toggleAll} /></th>
              <th>#</th>
              <th></th>
              <th>Display Name</th>
              <th>Email</th>
              <th>Username</th>
              <SortableDate label="Created" sortOrder={fs.sortOrder} onToggle={() => fs.setSortOrder(s => s === 'desc' ? 'asc' : 'desc')} />
              <th>Last Login</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {fs.filtered.map((u, i) => (
              <tr key={u.id} className={fs.selected.has(u.id) ? 'adm-row-selected' : ''} style={{ cursor: 'pointer' }} onClick={() => setViewingUser(u)}>
                <td className="adm-td-check" onClick={e => e.stopPropagation()}><input type="checkbox" checked={fs.selected.has(u.id)} onChange={() => fs.toggleSelect(u.id)} /></td>
                <td className="adm-td-num">{i + 1}</td>
                <td className="adm-td-avatar">
                  {u.photoURL
                    ? <img src={u.photoURL} alt="" className="adm-avatar" />
                    : <span className="adm-avatar adm-avatar-placeholder">{(u.displayName || u.email || '?')[0].toUpperCase()}</span>}
                </td>
                <td>
                  {u.displayName || '—'}
                  {u._authOnly && <span className="adm-status adm-status-pending" style={{ fontSize: 10, marginLeft: 6 }}>Auth only</span>}
                </td>
                <td>{u.email || '—'}</td>
                <td className="adm-td-username">{u.username ? `@${u.username}` : '—'}</td>
                <td className="adm-td-date">{formatDate(u.createdAt)}</td>
                <td className="adm-td-date">{formatDate(u.lastLogin)}</td>
                <td className="adm-td-actions" onClick={e => e.stopPropagation()}>
                  <RowMenu onEdit={() => setEditing(u)} onDelete={() => setDeleting(u)}
                    extraItems={[{ label: 'View', onClick: () => setViewingUser(u) }]} />
                </td>
              </tr>
            ))}
            {!loading && fs.filtered.length === 0 && <tr><td colSpan="9" className="adm-empty">No users found</td></tr>}
          </tbody>
        </table>
      </div>
      {editing && <EditModal title="Edit User" fields={APP_USERS_FIELDS}
        initial={{ displayName: editing.displayName || '', email: editing.email || '', username: editing.username || '' }}
        onSave={async v => { await updateAppUser(editing.id, v); await fetchData() }} onClose={() => setEditing(null)} />}
      {deleting && <DeleteConfirm label={deleting.displayName || deleting.email || deleting.id}
        onConfirm={async () => { await deleteAppUser(deleting.id); await fetchData() }} onClose={() => setDeleting(null)} />}
    </>
  )
}

/* ── Onboarding survey results (a sub-view of the Users tab) ── */

function SurveyDistribution({ title, rows, total }) {
  return (
    <div className="adm-survey-dist">
      <h3 className="adm-survey-dist-title">{title}</h3>
      {rows.length === 0
        ? <p className="adm-survey-dist-empty">No answers yet</p>
        : rows.map(r => {
          const pct = total > 0 ? Math.round((r.count / total) * 100) : 0
          return (
            <div key={r.value} className="adm-survey-row">
              <div className="adm-survey-row-head">
                <span className="adm-survey-row-label">{r.label}</span>
                <span className="adm-survey-row-count">{r.count} · {pct}%</span>
              </div>
              <div className="adm-survey-bar"><div className="adm-survey-bar-fill" style={{ width: `${pct}%` }} /></div>
            </div>
          )
        })}
    </div>
  )
}

function SurveyResultsView({ users, loading, onViewUser }) {
  const answered = useMemo(() => users.filter(u => u.onboardingData), [users])
  const completed = useMemo(() => users.filter(u => u.hasCompletedOnboarding), [users])

  const journey = useMemo(() => tallySurvey(answered, 'pokerJourney'), [answered])
  const gameType = useMemo(() => tallySurvey(answered, 'gameType'), [answered])
  const sessions = useMemo(() => tallySessions(answered), [answered])
  const purposes = useMemo(() => tallySurvey(answered, 'purposes', { multi: true }), [answered])

  const fs = useFilterSort(answered, ['displayName', 'email', 'username'], null, 'createdAt')
  const completionRate = users.length > 0 ? Math.round((completed.length / users.length) * 100) : 0

  return (
    <>
      <div className="adm-stats-grid" style={{ marginBottom: 24 }}>
        <div className="adm-stat-card"><div className="adm-stat-value">{answered.length}</div><div className="adm-stat-label">Answered survey</div></div>
        <div className="adm-stat-card"><div className="adm-stat-value">{completed.length}</div><div className="adm-stat-label">Completed onboarding</div></div>
        <div className="adm-stat-card adm-stat-highlight"><div className="adm-stat-value">{completionRate}%</div><div className="adm-stat-label">Completion rate</div></div>
      </div>

      <div className="adm-survey-grid">
        <SurveyDistribution title="Poker journey" rows={journey} total={answered.length} />
        <SurveyDistribution title="Game type" rows={gameType} total={answered.length} />
        <SurveyDistribution title="Sessions per month" rows={sessions} total={answered.length} />
        <SurveyDistribution title="Why they use Final Table" rows={purposes} total={answered.length} />
      </div>

      <div className="adm-header" style={{ marginTop: 8 }}>
        <h2 className="adm-page-title" style={{ fontSize: 18 }}>Per-user answers</h2>
        <div className="adm-header-right">
          <span className="adm-count">{fs.filtered.length} of {answered.length}</span>
          <button className="adm-refresh-btn" onClick={() => exportCSV(fs.filtered, 'onboarding-survey.csv', SURVEY_CSV_COLS)}>Export CSV</button>
        </div>
      </div>
      <SearchBar search={fs.search} onSearch={fs.setSearch} dateFrom={fs.dateFrom} dateTo={fs.dateTo}
        onDateFrom={fs.setDateFrom} onDateTo={fs.setDateTo} />
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Journey</th>
              <th>Game</th>
              <th>Sessions/mo</th>
              <th>Purposes</th>
              <SortableDate label="Created" sortOrder={fs.sortOrder} onToggle={() => fs.setSortOrder(s => s === 'desc' ? 'asc' : 'desc')} />
            </tr>
          </thead>
          <tbody>
            {fs.filtered.map((u, i) => {
              const od = u.onboardingData || {}
              return (
                <tr key={u.id} style={{ cursor: 'pointer' }} onClick={() => onViewUser(u)}>
                  <td className="adm-td-num">{i + 1}</td>
                  <td>
                    <div>{u.displayName || u.email || '—'}</div>
                    {u.username && <div className="adm-td-username" style={{ fontSize: 12 }}>@{u.username}</div>}
                  </td>
                  <td>{surveyLabel('pokerJourney', od.pokerJourney)}</td>
                  <td>{surveyLabel('gameType', od.gameType)}</td>
                  <td>{sessionsLabel(od.monthlySessions)}</td>
                  <td>
                    <div className="adm-survey-tags">
                      {(od.purposes || []).length === 0
                        ? '—'
                        : od.purposes.map(p => <span key={p} className="adm-survey-tag">{surveyLabel('purposes', p)}</span>)}
                    </div>
                  </td>
                  <td className="adm-td-date">{formatDate(u.createdAt)}</td>
                </tr>
              )
            })}
            {!loading && fs.filtered.length === 0 && <tr><td colSpan="7" className="adm-empty">No survey responses found</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════
   SHARED HANDS TAB
   ══════════════════════════════════════════════ */

const HANDS_CSV_COLS = [
  { key: 'id', label: 'Share ID' },
  { label: 'Date', get: r => r.timestamp ? r.timestamp.toISOString() : '' },
]

function SharedHandsTab() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try { setData(await getSharedHands()) } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchData() }, [fetchData])

  const fs = useFilterSort(data, ['id'])

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${fs.selected.size} entries?`)) return
    await Promise.all([...fs.selected].map(id => deleteSharedHand(id)))
    await fetchData()
  }

  return (
    <>
      <div className="adm-header">
        <h1 className="adm-page-title">Shared Hands</h1>
        <div className="adm-header-right">
          <span className="adm-count">{fs.filtered.length} of {data.length}</span>
          <button className="adm-refresh-btn" onClick={() => exportCSV(fs.filtered, 'shared-hands.csv', HANDS_CSV_COLS)}>Export CSV</button>
          <button className="adm-refresh-btn" onClick={fetchData} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button>
        </div>
      </div>
      <SearchBar search={fs.search} onSearch={fs.setSearch} dateFrom={fs.dateFrom} dateTo={fs.dateTo} onDateFrom={fs.setDateFrom} onDateTo={fs.setDateTo} />
      {fs.selected.size > 0 && <BulkBar count={fs.selected.size} onDeleteAll={handleBulkDelete} />}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th className="adm-th-check"><input type="checkbox" checked={fs.selected.size === fs.filtered.length && fs.filtered.length > 0} onChange={fs.toggleAll} /></th>
              <th>#</th><th>Share ID</th>
              <SortableDate label="Date" sortOrder={fs.sortOrder} onToggle={() => fs.setSortOrder(s => s === 'desc' ? 'asc' : 'desc')} />
              <th></th>
            </tr>
          </thead>
          <tbody>
            {fs.filtered.map((h, i) => (
              <tr key={h.id} className={fs.selected.has(h.id) ? 'adm-row-selected' : ''}>
                <td className="adm-td-check"><input type="checkbox" checked={fs.selected.has(h.id)} onChange={() => fs.toggleSelect(h.id)} /></td>
                <td className="adm-td-num">{i + 1}</td>
                <td><a className="adm-hand-link" href={`/hand/${h.id}`} target="_blank" rel="noreferrer">{h.id}</a></td>
                <td className="adm-td-date">{formatDate(h.timestamp)}</td>
                <td className="adm-td-actions">
                  <RowMenu onDelete={() => setDeleting(h)}
                    extraItems={[{ label: 'View', onClick: () => window.open(`/hand/${h.id}`, '_blank') }]} />
                </td>
              </tr>
            ))}
            {!loading && fs.filtered.length === 0 && <tr><td colSpan="5" className="adm-empty">No entries found</td></tr>}
          </tbody>
        </table>
      </div>
      {deleting && <DeleteConfirm label={deleting.id}
        onConfirm={async () => { await deleteSharedHand(deleting.id); await fetchData() }} onClose={() => setDeleting(null)} />}
    </>
  )
}

/* ══════════════════════════════════════════════
   EMAIL TAB
   ══════════════════════════════════════════════ */

const BUILTIN_TEMPLATES = [
  {
    id: '__app_live__',
    name: 'App Launch (App is Live)',
    subject: 'Final Table is live! Deal yourself in 🃏',
    body: `<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="x-apple-disable-message-reformatting"><title>Final Table is live</title><!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]--><style>@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap');body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }@media only screen and (max-width: 620px) {.email-container { width: 100% !important; max-width: 100% !important; }.fluid { max-width: 100% !important; height: auto !important; }.stack-column { display: block !important; width: 100% !important; }.mobile-padding { padding-left: 24px !important; padding-right: 24px !important; }}</style></head><body style="margin: 0; padding: 0; background-color: #F6F8F6; font-family: 'Inter', Arial, Helvetica, sans-serif;"><!-- Preheader (hidden text for inbox preview) --><div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">The wait is over — Final Table is on the app stores! Download it and log your first session tonight.</div><!-- Outer wrapper --><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F6F8F6;"><tr><td style="padding: 40px 16px;"><!-- Email container --><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="680" align="center" class="email-container" style="max-width: 680px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);"><!-- Green accent bar --><tr><td style="background: linear-gradient(90deg, #A2F69A, #E0FF96); height: 4px; font-size: 0; line-height: 0;">&nbsp;</td></tr><!-- Logo --><tr><td style="padding: 40px 48px 24px;" class="mobile-padding"><img src="https://finaltable.io/logo.png" alt="Final Table" width="90" style="display: block; width: 90px; height: auto;"></td></tr><!-- Heading --><tr><td style="padding: 0 48px 8px;" class="mobile-padding"><h1 style="margin: 0; font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 34px; font-weight: 700; color: #0c0c0e; line-height: 1.15; letter-spacing: -0.02em;">It's live! <em style="font-style: italic;">Deal yourself in.</em></h1></td></tr><!-- Intro copy --><tr><td style="padding: 12px 48px 8px;" class="mobile-padding"><p style="margin: 0; font-size: 16px; color: #444; line-height: 1.65;">You signed up early — so you're hearing it first: <strong>Final Table is now on the app stores.</strong>The live-poker tracker you've been waiting for is ready for tonight's session.</p></td></tr><!-- Store buttons (official badges, hosted at finaltable.io/email/) --><tr><td style="padding: 24px 48px 12px;" class="mobile-padding"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td><a href="https://play.google.com/store/apps/details?id=com.finaltable.app" target="_blank" style="display: inline-block; text-decoration: none;"><img src="https://finaltable.io/email/google-play-badge.png" alt="Get it on Google Play" width="162" height="48" style="display: block; width: 162px; height: 48px; border: 0;"></a></td><td style="width: 14px; font-size: 0;">&nbsp;</td><td><a href="https://apps.apple.com/us/app/final-table/id6760188970" target="_blank" style="display: inline-block; text-decoration: none;"><img src="https://finaltable.io/email/app-store-badge.png" alt="Download on the App Store" width="144" height="48" style="display: block; width: 144px; height: 48px; border: 0;"></a></td></tr></table></td></tr><!-- Divider --><tr><td style="padding: 24px 48px 0;" class="mobile-padding"><div style="height: 1px; background-color: #ECEEEC; font-size: 0; line-height: 0;">&nbsp;</div></td></tr><!-- What you get --><tr><td style="padding: 28px 48px 8px;" class="mobile-padding"><p style="margin: 0 0 16px; font-size: 13px; font-weight: 600; color: #7aa874; letter-spacing: 0.08em; text-transform: uppercase;">What's waiting for you</p><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="padding: 0 0 14px;"><p style="margin: 0; font-size: 15px; color: #333; line-height: 1.6;"><strong style="color: #0c0c0e;">Log hands in seconds, not minutes</strong> — built for live tables, so your attention stays on the game.</p></td></tr><tr><td style="padding: 0 0 14px;"><p style="margin: 0; font-size: 15px; color: #333; line-height: 1.6;"><strong style="color: #0c0c0e;">Real stats on you and your opponents</strong> — VPIP, aggression, tendencies. Know who you're really up against.</p></td></tr><tr><td style="padding: 0 0 4px;"><p style="margin: 0; font-size: 15px; color: #333; line-height: 1.6;"><strong style="color: #0c0c0e;">Sessions and bankroll, finally organized</strong> — every buy-in, every cash-out, one clean picture of your game.</p></td></tr></table></td></tr><!-- Discord nudge --><tr><td style="padding: 20px 48px 36px;" class="mobile-padding"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F7F8FD; border: 1px solid #E4E7F8; border-radius: 12px;"><tr><td style="padding: 18px 20px;"><p style="margin: 0; font-size: 14px; color: #444; line-height: 1.6;"><strong style="color: #5865F2;">Founding members wanted:</strong> our Discord just opened its doors. Join now, talk directly with the founders, and help decide what we build next.<a href="https://discord.gg/E5HQAWt2g" target="_blank" style="color: #5865F2; font-weight: 600; text-decoration: none;">Join the Discord &rarr;</a></p></td></tr></table></td></tr><!-- Reply line --><tr><td style="padding: 0 48px 8px; font-family: 'Inter', Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.65; color: #4B5563;" class="mobile-padding"><p style="margin: 0;">If you run into any issues or have questions, just reply to this email — we read every message.</p></td></tr><!-- Sign-off --><tr><td style="padding: 8px 48px 32px; font-family: 'Inter', Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.65; color: #4B5563;" class="mobile-padding"><p style="margin: 0;">See you at the tables,<br><strong style="color: #000;">Magsud &amp; Tural</strong></p></td></tr><!-- Footer --><tr><td style="background-color: #FAFAFA; padding: 28px 48px; border-top: 1px solid #E5E7EB;" class="mobile-padding"><p style="margin: 0 0 6px; font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 15px; font-weight: 600; color: #999; font-style: italic; line-height: 1.4;">Log a hand in three gestures.<br>Not three minutes.</p><p style="margin: 16px 0 0; font-family: 'Inter', Arial, Helvetica, sans-serif; font-size: 13px; color: #999; line-height: 1.6;">You're receiving this because you joined the Final Table waitlist.<br>Final Table &middot; <a href="https://finaltable.io" target="_blank" style="color: #999; text-decoration: underline;">finaltable.io</a></p></td></tr></table></td></tr></table></body></html>`,
    builtin: true,
  },
  {
    id: '__welcome__',
    name: 'Welcome (Waitlist)',
    subject: 'Welcome to Final Table!',
    body: `<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="x-apple-disable-message-reformatting"><title>Welcome to Final Table</title><!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]--><style>@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap');body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}body{margin:0;padding:0;width:100%!important;height:100%!important}a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important}@media only screen and (max-width:620px){.email-container{width:100%!important;max-width:100%!important}.fluid{max-width:100%!important;height:auto!important}.stack-column{display:block!important;width:100%!important}.mobile-padding{padding-left:24px!important;padding-right:24px!important}}</style></head><body style="margin:0;padding:0;background-color:#F6F8F6;font-family:'Inter',Arial,Helvetica,sans-serif"><div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all">You're on the waitlist! Here's what's next for your poker game.</div><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#F6F8F6"><tr><td style="padding:40px 16px"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="680" align="center" class="email-container" style="max-width:680px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04)"><tr><td style="background:linear-gradient(90deg,#A2F69A,#E0FF96);height:4px;font-size:0;line-height:0">&nbsp;</td></tr><tr><td style="padding:40px 48px 24px" class="mobile-padding"><img src="https://finaltable.io/logo.png" alt="Final Table" width="90" style="display:block;width:90px;height:auto"></td></tr><tr><td style="padding:0 48px 16px" class="mobile-padding"><h1 style="margin:0;font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:32px;font-weight:700;line-height:1.15;color:#000000;letter-spacing:-0.01em">Final Table.</h1></td></tr><tr><td style="padding:0 48px 24px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#4B5563" class="mobile-padding"><p style="margin:0 0 16px">Hey, you took the first step toward becoming a better poker player. Wise choice, congratulations!</p><p style="margin:0 0 16px">We're building the best possible poker app for you to track your poker journey effortlessly, and Final Table is launching in the coming weeks.</p><p style="margin:0">We'd love to give you free, early access before anyone else, in exchange for your feedback. Our goal is to grow this app with you, and we always appreciate our users' honest input, because it's what shapes every feature we build.</p></td></tr><tr><td style="padding:0 48px" class="mobile-padding"><div style="border-top:1px solid #E5E7EB;margin:0"></div></td></tr><tr><td style="padding:24px 48px 8px" class="mobile-padding"><p style="margin:0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#000000;text-transform:uppercase;letter-spacing:0.06em">One quick thing</p></td></tr><tr><td style="padding:0 48px 24px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#4B5563" class="mobile-padding"><p style="margin:0 0 10px">Visit our page and let us know which platform you're using, <strong style="color:#000">iOS</strong> or <strong style="color:#000">Android</strong>, so we can get your access ready. It takes 10 seconds.</p><p style="margin:0;font-size:13px;color:#999">Ignore this if you've already selected your platform.</p></td></tr><tr><td style="padding:0 48px 32px" class="mobile-padding"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td style="border-radius:12px;background-color:#A2F69A"><a href="https://finaltable.io" target="_blank" style="display:inline-block;padding:14px 32px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;color:#000000;text-decoration:none;border-radius:12px;letter-spacing:-0.01em">Select Your Platform &rarr;</a></td></tr></table></td></tr><tr><td style="padding:0 48px" class="mobile-padding"><div style="border-top:1px solid #E5E7EB;margin:0"></div></td></tr><tr><td style="padding:28px 48px 8px" class="mobile-padding"><p style="margin:0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#000000;text-transform:uppercase;letter-spacing:0.06em">What you'll get</p></td></tr><tr><td style="padding:0 48px 32px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#4B5563" class="mobile-padding"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="padding:10px 0;vertical-align:top;width:28px"><span style="display:inline-block;width:20px;height:20px;background-color:#A2F69A;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:700;color:#000">&#10003;</span></td><td style="padding:10px 0 10px 8px;vertical-align:top;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#4B5563"><strong style="color:#000">Three-gesture logging</strong>: Log any action in three taps, fast enough to use one-handed between deals</td></tr><tr><td style="padding:10px 0;vertical-align:top;width:28px"><span style="display:inline-block;width:20px;height:20px;background-color:#A2F69A;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:700;color:#000">&#10003;</span></td><td style="padding:10px 0 10px 8px;vertical-align:top;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#4B5563"><strong style="color:#000">Opponent reads in real time</strong>: Get data-backed profiles on every player so you can make smarter decisions at the table</td></tr><tr><td style="padding:10px 0;vertical-align:top;width:28px"><span style="display:inline-block;width:20px;height:20px;background-color:#A2F69A;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:700;color:#000">&#10003;</span></td><td style="padding:10px 0 10px 8px;vertical-align:top;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#4B5563"><strong style="color:#000">Session + hand-level data</strong>: From quick session tracking to full hand-by-hand analysis</td></tr></table></td></tr><tr><td style="padding:0 48px" class="mobile-padding"><div style="border-top:1px solid #E5E7EB;margin:0"></div></td></tr><tr><td style="padding:24px 48px 8px" class="mobile-padding"><p style="margin:0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#000000;text-transform:uppercase;letter-spacing:0.06em">Join our community</p></td></tr><tr><td style="padding:0 48px 24px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#4B5563" class="mobile-padding"><p style="margin:0">We have a Discord server where users share hands, ask questions, and talk directly to us. Come hang out.</p></td></tr><tr><td style="padding:0 48px 32px" class="mobile-padding"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td style="border-radius:12px;background-color:#5865F2"><a href="https://discord.gg/E5HQAWt2g" target="_blank" style="display:inline-block;padding:14px 32px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;letter-spacing:-0.01em">Join the Discord &rarr;</a></td></tr></table></td></tr><tr><td style="padding:8px 48px 32px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#4B5563" class="mobile-padding"><p style="margin:0">Thanks,<br><strong style="color:#000">Magsud &amp; Tural</strong></p></td></tr><tr><td style="background-color:#FAFAFA;padding:28px 48px;border-top:1px solid #E5E7EB" class="mobile-padding"><p style="margin:0 0 6px;font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:15px;font-weight:600;color:#999;font-style:italic;line-height:1.4">Log a hand in three gestures.<br>Not three minutes.</p><p style="margin:16px 0 0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:13px;color:#999;line-height:1.6">&copy; 2026 Final Table &middot; <a href="https://finaltable.io" style="color:#999;text-decoration:underline">finaltable.io</a><br>Questions? <a href="mailto:contact@finaltable.io" style="color:#999;text-decoration:underline">contact@finaltable.io</a></p></td></tr></table></td></tr></table></body></html>`,
    builtin: true,
  },
  {
    id: '__beta_invite__',
    name: 'Beta Invite (No Platform)',
    subject: 'Join the Final Table beta — get 3 months free',
    body: `<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="x-apple-disable-message-reformatting"><title>Join the Beta</title><!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]--><style>@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap');body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}body{margin:0;padding:0;width:100%!important;height:100%!important}a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}@media only screen and (max-width:620px){.email-container{width:100%!important;max-width:100%!important}.mobile-padding{padding-left:24px!important;padding-right:24px!important}}</style></head><body style="margin:0;padding:0;background-color:#F6F8F6;font-family:'Inter',Arial,Helvetica,sans-serif"><div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all">Beta is live — join now and get 3 months of free access after launch.</div><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#F6F8F6"><tr><td style="padding:40px 16px"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="680" align="center" class="email-container" style="max-width:680px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04)"><tr><td style="background:linear-gradient(90deg,#A2F69A,#E0FF96);height:4px;font-size:0;line-height:0">&nbsp;</td></tr><tr><td style="padding:40px 48px 24px" class="mobile-padding"><img src="https://finaltable.io/logo.png" alt="Final Table" width="90" style="display:block;width:90px;height:auto"></td></tr><tr><td style="padding:0 48px 16px" class="mobile-padding"><h1 style="margin:0;font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:30px;font-weight:700;line-height:1.2;color:#000000;letter-spacing:-0.01em">The beta is live.<br>Your spot is waiting.</h1></td></tr><tr><td style="padding:0 48px 24px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#4B5563" class="mobile-padding"><p style="margin:0 0 16px">Hey! You signed up for the Final Table waitlist — thank you for that.</p><p style="margin:0 0 16px">We noticed you haven't selected your platform yet. We need to know whether you're on <strong style="color:#000">iOS</strong> or <strong style="color:#000">Android</strong> so we can get your beta access ready.</p><p style="margin:0">Here's the deal: <strong style="color:#000">join the beta now and you'll get 3 months of free access</strong> after public release. No strings attached — just help us test and share your honest feedback.</p></td></tr><tr><td style="padding:0 48px 32px" class="mobile-padding"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td style="border-radius:12px;background-color:#A2F69A"><a href="https://finaltable.io" target="_blank" style="display:inline-block;padding:14px 32px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;color:#000000;text-decoration:none;border-radius:12px;letter-spacing:-0.01em">Select Your Platform &rarr;</a></td></tr></table></td></tr><tr><td style="padding:0 48px" class="mobile-padding"><div style="border-top:1px solid #E5E7EB;margin:0"></div></td></tr><tr><td style="padding:24px 48px 32px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#4B5563" class="mobile-padding"><p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#000;text-transform:uppercase;letter-spacing:0.06em">It takes 10 seconds</p><p style="margin:0">Visit the link above, pick iOS or Android, and you're in. We'll reach out with your beta invite shortly after.</p></td></tr><tr><td style="padding:0 48px 32px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#4B5563" class="mobile-padding"><p style="margin:0">Thanks,<br><strong style="color:#000">Magsud &amp; Tural</strong></p></td></tr><tr><td style="background-color:#FAFAFA;padding:28px 48px;border-top:1px solid #E5E7EB" class="mobile-padding"><p style="margin:0 0 6px;font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:15px;font-weight:600;color:#999;font-style:italic;line-height:1.4">Log a hand in three gestures.<br>Not three minutes.</p><p style="margin:16px 0 0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:13px;color:#999;line-height:1.6">&copy; 2026 Final Table &middot; <a href="https://finaltable.io" style="color:#999;text-decoration:underline">finaltable.io</a><br>Questions? <a href="mailto:contact@finaltable.io" style="color:#999;text-decoration:underline">contact@finaltable.io</a></p></td></tr></table></td></tr></table></body></html>`,
    builtin: true,
  },
  {
    id: '__ios_beta__',
    name: 'Beta Invite (iOS)',
    subject: 'Your Final Table beta access is ready — iOS',
    body: `<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="x-apple-disable-message-reformatting"><title>Final Table Beta – iOS</title><!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]--><style>@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap');body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}body{margin:0;padding:0;width:100%!important;height:100%!important}a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}@media only screen and (max-width:620px){.email-container{width:100%!important;max-width:100%!important}.mobile-padding{padding-left:24px!important;padding-right:24px!important}}</style></head><body style="margin:0;padding:0;background-color:#F6F8F6;font-family:'Inter',Arial,Helvetica,sans-serif"><div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all">Your iOS beta access is ready — here's how to install Final Table via TestFlight.</div><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#F6F8F6"><tr><td style="padding:40px 16px"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="680" align="center" class="email-container" style="max-width:680px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04)"><tr><td style="background:linear-gradient(90deg,#A2F69A,#E0FF96);height:4px;font-size:0;line-height:0">&nbsp;</td></tr><tr><td style="padding:40px 48px 24px" class="mobile-padding"><img src="https://finaltable.io/logo.png" alt="Final Table" width="90" style="display:block;width:90px;height:auto"></td></tr><tr><td style="padding:0 48px 16px" class="mobile-padding"><h1 style="margin:0;font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:30px;font-weight:700;line-height:1.2;color:#000000;letter-spacing:-0.01em">Your beta access is ready.</h1></td></tr><tr><td style="padding:0 48px 24px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#4B5563" class="mobile-padding"><p style="margin:0 0 16px">Hey! Great news — Final Table is now available for beta testing on iOS. You're one of the first people to get access.</p><p style="margin:0 0 16px">Follow the steps below to get started. It only takes a minute.</p><p style="margin:0"><strong style="color:#000">As a thank you</strong> — beta testers who use the app and share their feedback will get <strong style="color:#000">3 months of free access</strong> after public release.</p></td></tr><tr><td style="padding:0 48px" class="mobile-padding"><div style="border-top:1px solid #E5E7EB;margin:0"></div></td></tr><tr><td style="padding:24px 48px 8px" class="mobile-padding"><p style="margin:0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#000000;text-transform:uppercase;letter-spacing:0.06em">How to install</p></td></tr><tr><td style="padding:0 48px 24px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#4B5563" class="mobile-padding"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="padding:8px 0;vertical-align:top;width:28px"><span style="display:inline-block;width:22px;height:22px;background-color:#A2F69A;border-radius:50%;text-align:center;line-height:22px;font-size:12px;font-weight:700;color:#000">1</span></td><td style="padding:8px 0 8px 10px;vertical-align:top">Click on the link below and download the <strong style="color:#000">TestFlight</strong> app</td></tr><tr><td style="padding:8px 0;vertical-align:top;width:28px"><span style="display:inline-block;width:22px;height:22px;background-color:#A2F69A;border-radius:50%;text-align:center;line-height:22px;font-size:12px;font-weight:700;color:#000">2</span></td><td style="padding:8px 0 8px 10px;vertical-align:top">Open the <strong style="color:#000">TestFlight</strong> app and set it up</td></tr><tr><td style="padding:8px 0;vertical-align:top;width:28px"><span style="display:inline-block;width:22px;height:22px;background-color:#A2F69A;border-radius:50%;text-align:center;line-height:22px;font-size:12px;font-weight:700;color:#000">3</span></td><td style="padding:8px 0 8px 10px;vertical-align:top">You will see <strong style="color:#000">Final Table</strong> in it — install and enjoy!</td></tr></table></td></tr><tr><td style="padding:0 48px 32px" class="mobile-padding"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td style="border-radius:12px;background-color:#A2F69A"><a href="https://testflight.apple.com/join/sFnxTkKV" target="_blank" style="display:inline-block;padding:14px 32px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;color:#000000;text-decoration:none;border-radius:12px;letter-spacing:-0.01em">Join the iOS Beta &rarr;</a></td></tr></table></td></tr><tr><td style="padding:0 48px" class="mobile-padding"><div style="border-top:1px solid #E5E7EB;margin:0"></div></td></tr><tr><td style="padding:24px 48px 24px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#4B5563" class="mobile-padding"><p style="margin:0 0 16px">Please share your feedback by replying to this email. Any comment, bug report, or feature request is welcomed. We are trying to shape this experience with you.</p><p style="margin:0">If you encounter any issues with the installation process, please let us know and we will guide you through it.</p></td></tr><tr><td style="padding:0 48px 32px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#4B5563" class="mobile-padding"><p style="margin:0">Thanks,<br><strong style="color:#000">Magsud &amp; Tural</strong></p></td></tr><tr><td style="background-color:#FAFAFA;padding:28px 48px;border-top:1px solid #E5E7EB" class="mobile-padding"><p style="margin:0 0 6px;font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:15px;font-weight:600;color:#999;font-style:italic;line-height:1.4">Log a hand in three gestures.<br>Not three minutes.</p><p style="margin:16px 0 0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:13px;color:#999;line-height:1.6">&copy; 2026 Final Table &middot; <a href="https://finaltable.io" style="color:#999;text-decoration:underline">finaltable.io</a><br>Questions? <a href="mailto:contact@finaltable.io" style="color:#999;text-decoration:underline">contact@finaltable.io</a></p></td></tr></table></td></tr></table></body></html>`,
    builtin: true,
  },
  {
    id: '__discord_invite__',
    name: 'Discord Invite',
    subject: 'Join the Final Table community on Discord',
    body: `<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="x-apple-disable-message-reformatting"><title>Join Our Discord</title><!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]--><style>@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap');body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}body{margin:0;padding:0;width:100%!important;height:100%!important}a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}@media only screen and (max-width:620px){.email-container{width:100%!important;max-width:100%!important}.mobile-padding{padding-left:24px!important;padding-right:24px!important}}</style></head><body style="margin:0;padding:0;background-color:#F6F8F6;font-family:'Inter',Arial,Helvetica,sans-serif"><div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all">Join the Final Table community on Discord — share hands, get tips, talk poker.</div><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#F6F8F6"><tr><td style="padding:40px 16px"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="680" align="center" class="email-container" style="max-width:680px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04)"><tr><td style="background:linear-gradient(90deg,#A2F69A,#E0FF96);height:4px;font-size:0;line-height:0">&nbsp;</td></tr><tr><td style="padding:40px 48px 24px" class="mobile-padding"><img src="https://finaltable.io/logo.png" alt="Final Table" width="90" style="display:block;width:90px;height:auto"></td></tr><tr><td style="padding:0 48px 16px" class="mobile-padding"><h1 style="margin:0;font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:30px;font-weight:700;line-height:1.2;color:#000000;letter-spacing:-0.01em">We just opened<br>our Discord server.</h1></td></tr><tr><td style="padding:0 48px 24px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#4B5563" class="mobile-padding"><p style="margin:0 0 16px">Hey! We've launched a community Discord for Final Table users — and you're one of the first people we're inviting.</p><p style="margin:0 0 16px">It's the place to share hands, ask questions, give feedback directly to us, and connect with other users who are serious about improving their game.</p><p style="margin:0">We're in there every day. Come say hi.</p></td></tr><tr><td style="padding:0 48px 32px" class="mobile-padding"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td style="border-radius:12px;background-color:#5865F2"><a href="https://discord.gg/E5HQAWt2g" target="_blank" style="display:inline-block;padding:14px 32px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;letter-spacing:-0.01em">Join the Discord &rarr;</a></td></tr></table></td></tr><tr><td style="padding:0 48px" class="mobile-padding"><div style="border-top:1px solid #E5E7EB;margin:0"></div></td></tr><tr><td style="padding:24px 48px 8px" class="mobile-padding"><p style="margin:0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#000000;text-transform:uppercase;letter-spacing:0.06em">What's in the server</p></td></tr><tr><td style="padding:0 48px 32px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#4B5563" class="mobile-padding"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="padding:10px 0;vertical-align:top;width:28px"><span style="display:inline-block;width:20px;height:20px;background-color:#A2F69A;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:700;color:#000">&#10003;</span></td><td style="padding:10px 0 10px 8px;vertical-align:top;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#4B5563"><strong style="color:#000">Hand reviews</strong>: Share hands from the app and get honest feedback from the community</td></tr><tr><td style="padding:10px 0;vertical-align:top;width:28px"><span style="display:inline-block;width:20px;height:20px;background-color:#A2F69A;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:700;color:#000">&#10003;</span></td><td style="padding:10px 0 10px 8px;vertical-align:top;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#4B5563"><strong style="color:#000">Direct access to us</strong>: Feature requests, bugs, questions — talk to Magsud &amp; Tural directly</td></tr><tr><td style="padding:10px 0;vertical-align:top;width:28px"><span style="display:inline-block;width:20px;height:20px;background-color:#A2F69A;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:700;color:#000">&#10003;</span></td><td style="padding:10px 0 10px 8px;vertical-align:top;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#4B5563"><strong style="color:#000">Early announcements</strong>: Be the first to hear about new features and updates before anyone else</td></tr></table></td></tr><tr><td style="padding:0 48px 32px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#4B5563" class="mobile-padding"><p style="margin:0">Thanks,<br><strong style="color:#000">Magsud &amp; Tural</strong></p></td></tr><tr><td style="background-color:#FAFAFA;padding:28px 48px;border-top:1px solid #E5E7EB" class="mobile-padding"><p style="margin:0 0 6px;font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:15px;font-weight:600;color:#999;font-style:italic;line-height:1.4">Log a hand in three gestures.<br>Not three minutes.</p><p style="margin:16px 0 0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:13px;color:#999;line-height:1.6">&copy; 2026 Final Table &middot; <a href="https://finaltable.io" style="color:#999;text-decoration:underline">finaltable.io</a><br>Questions? <a href="mailto:contact@finaltable.io" style="color:#999;text-decoration:underline">contact@finaltable.io</a></p></td></tr></table></td></tr></table></body></html>`,
    builtin: true,
  },
  {
    id: '__android_beta__',
    name: 'Beta Invite (Android)',
    subject: 'Your Final Table beta access is ready — Android',
    body: `<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="x-apple-disable-message-reformatting"><title>Final Table Beta – Android</title><!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]--><style>@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap');body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}body{margin:0;padding:0;width:100%!important;height:100%!important}a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}@media only screen and (max-width:620px){.email-container{width:100%!important;max-width:100%!important}.mobile-padding{padding-left:24px!important;padding-right:24px!important}}</style></head><body style="margin:0;padding:0;background-color:#F6F8F6;font-family:'Inter',Arial,Helvetica,sans-serif"><div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all">Your Android beta access is ready — here's how to install Final Table from Google Play.</div><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#F6F8F6"><tr><td style="padding:40px 16px"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="680" align="center" class="email-container" style="max-width:680px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04)"><tr><td style="background:linear-gradient(90deg,#A2F69A,#E0FF96);height:4px;font-size:0;line-height:0">&nbsp;</td></tr><tr><td style="padding:40px 48px 24px" class="mobile-padding"><img src="https://finaltable.io/logo.png" alt="Final Table" width="90" style="display:block;width:90px;height:auto"></td></tr><tr><td style="padding:0 48px 16px" class="mobile-padding"><h1 style="margin:0;font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:30px;font-weight:700;line-height:1.2;color:#000000;letter-spacing:-0.01em">Your beta access is ready.</h1></td></tr><tr><td style="padding:0 48px 24px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#4B5563" class="mobile-padding"><p style="margin:0 0 16px">Hey! Great news — Final Table is now available for beta testing on Android. You're one of the first people to get access.</p><p style="margin:0 0 16px">Follow the steps below to get started. It only takes a minute.</p><p style="margin:0"><strong style="color:#000">As a thank you</strong> — beta testers who use the app and share their feedback will get <strong style="color:#000">3 months of free access</strong> after public release.</p></td></tr><tr><td style="padding:0 48px" class="mobile-padding"><div style="border-top:1px solid #E5E7EB;margin:0"></div></td></tr><tr><td style="padding:24px 48px 8px" class="mobile-padding"><p style="margin:0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#000000;text-transform:uppercase;letter-spacing:0.06em">How to install</p></td></tr><tr><td style="padding:0 48px 24px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#4B5563" class="mobile-padding"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="padding:8px 0;vertical-align:top;width:28px"><span style="display:inline-block;width:22px;height:22px;background-color:#A2F69A;border-radius:50%;text-align:center;line-height:22px;font-size:12px;font-weight:700;color:#000">1</span></td><td style="padding:8px 0 8px 10px;vertical-align:top">Click on the link below</td></tr><tr><td style="padding:8px 0;vertical-align:top;width:28px"><span style="display:inline-block;width:22px;height:22px;background-color:#A2F69A;border-radius:50%;text-align:center;line-height:22px;font-size:12px;font-weight:700;color:#000">2</span></td><td style="padding:8px 0 8px 10px;vertical-align:top"><strong style="color:#000">Accept the invitation</strong></td></tr><tr><td style="padding:8px 0;vertical-align:top;width:28px"><span style="display:inline-block;width:22px;height:22px;background-color:#A2F69A;border-radius:50%;text-align:center;line-height:22px;font-size:12px;font-weight:700;color:#000">3</span></td><td style="padding:8px 0 8px 10px;vertical-align:top">Click on <strong style="color:#000">"download it on Google Play"</strong></td></tr><tr><td style="padding:8px 0;vertical-align:top;width:28px"><span style="display:inline-block;width:22px;height:22px;background-color:#A2F69A;border-radius:50%;text-align:center;line-height:22px;font-size:12px;font-weight:700;color:#000">4</span></td><td style="padding:8px 0 8px 10px;vertical-align:top">Enjoy the experience!</td></tr></table></td></tr><tr><td style="padding:0 48px 32px" class="mobile-padding"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td style="border-radius:12px;background-color:#A2F69A"><a href="https://play.google.com/apps/internaltest/4700568783471854875" target="_blank" style="display:inline-block;padding:14px 32px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;color:#000000;text-decoration:none;border-radius:12px;letter-spacing:-0.01em">Join the Android Beta &rarr;</a></td></tr></table></td></tr><tr><td style="padding:0 48px" class="mobile-padding"><div style="border-top:1px solid #E5E7EB;margin:0"></div></td></tr><tr><td style="padding:24px 48px 24px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#4B5563" class="mobile-padding"><p style="margin:0 0 16px">Please share your feedback by replying to this email. Any comment, bug report, or feature request is welcomed. We are trying to shape this experience with you.</p><p style="margin:0">If you encounter any issues with the installation process, please let us know and we will guide you through it.</p></td></tr><tr><td style="padding:0 48px 32px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#4B5563" class="mobile-padding"><p style="margin:0">Thanks,<br><strong style="color:#000">Magsud &amp; Tural</strong></p></td></tr><tr><td style="background-color:#FAFAFA;padding:28px 48px;border-top:1px solid #E5E7EB" class="mobile-padding"><p style="margin:0 0 6px;font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:15px;font-weight:600;color:#999;font-style:italic;line-height:1.4">Log a hand in three gestures.<br>Not three minutes.</p><p style="margin:16px 0 0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:13px;color:#999;line-height:1.6">&copy; 2026 Final Table &middot; <a href="https://finaltable.io" style="color:#999;text-decoration:underline">finaltable.io</a><br>Questions? <a href="mailto:contact@finaltable.io" style="color:#999;text-decoration:underline">contact@finaltable.io</a></p></td></tr></table></td></tr></table></body></html>`,
    builtin: true,
  },
]

function EmailTab({ onToast }) {
  const [subTab, setSubTab] = useState('compose')
  const [waitlistData, setWaitlistData] = useState([])
  const [templates, setTemplates] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  // Compose state
  const [platformFilter, setPlatformFilter] = useState('')
  const [userStatusFilter, setUserStatusFilter] = useState('')
  const [recipientSearch, setRecipientSearch] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [sendMode, setSendMode] = useState('html') // 'html' | 'template'
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [resendTemplateId, setResendTemplateId] = useState('')
  const [resendTemplates, setResendTemplates] = useState([])
  const [loadingResendTemplates, setLoadingResendTemplates] = useState(false)
  const [templateVars, setTemplateVars] = useState('')
  const [sending, setSending] = useState(false)
  const [sendProgress, setSendProgress] = useState(null)
  const [confirmSend, setConfirmSend] = useState(false)

  // Template editing
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [deletingTemplate, setDeletingTemplate] = useState(null)

  // History expand
  const [expandedLog, setExpandedLog] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [w, t, l, users] = await Promise.all([getWaitlistUsers(), getEmailTemplates(), getEmailLogs(), getAppUsers()])
      const userEmails = new Set(users.map(u => (u.email || '').toLowerCase()))
      const waitlistEmails = new Set(w.map(e => (e.email || '').toLowerCase()))
      // Build a lookup of app user displayName by email for backfilling
      const userNameByEmail = {}
      users.forEach(u => { if (u.email && u.displayName) userNameByEmail[u.email.toLowerCase()] = u.displayName })
      // Merge app users who never joined the waitlist as synthetic entries
      const appOnlyUsers = users
        .filter(u => u.email && !waitlistEmails.has(u.email.toLowerCase()))
        .map(u => ({
          id: `appuser_${u.id}`,
          email: u.email,
          firstName: u.displayName ? u.displayName.split(' ')[0] : '',
          lastName: u.displayName ? u.displayName.split(' ').slice(1).join(' ') : '',
          platform: '',
          source: 'app',
          timestamp: u.createdAt,
          isUser: true,
        }))
      setWaitlistData([
        ...w.map(entry => {
          const isUser = userEmails.has((entry.email || '').toLowerCase())
          // Backfill name from app user if waitlist entry has no name
          if (isUser && !entry.firstName && !entry.lastName) {
            const dn = userNameByEmail[(entry.email || '').toLowerCase()]
            if (dn) {
              return { ...entry, isUser, firstName: dn.split(' ')[0], lastName: dn.split(' ').slice(1).join(' '), _nameFromApp: true }
            }
          }
          return { ...entry, isUser }
        }),
        ...appOnlyUsers,
      ])
      setTemplates(t)
      setLogs(l)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchAll() }, [fetchAll])

  const fetchResendTemplates = useCallback(async () => {
    setLoadingResendTemplates(true)
    try {
      const res = await fetch('/api/list-templates')
      if (res.ok) {
        const json = await res.json()
        setResendTemplates(json.data || [])
      }
    } catch (err) { console.error(err) }
    finally { setLoadingResendTemplates(false) }
  }, [])

  useEffect(() => { if (sendMode === 'template' && resendTemplates.length === 0) fetchResendTemplates() }, [sendMode])

  // Filtered recipients
  const filteredRecipients = useMemo(() => {
    let items = [...waitlistData]
    if (platformFilter) {
      if (platformFilter === 'unspecified') items = items.filter(r => !r.platform)
      else items = items.filter(r => r.platform === platformFilter)
    }
    if (userStatusFilter) {
      if (userStatusFilter === 'active') items = items.filter(r => r.isUser)
      else if (userStatusFilter === 'not_user') items = items.filter(r => !r.isUser)
    }
    if (recipientSearch) {
      const q = recipientSearch.toLowerCase()
      items = items.filter(r =>
        (r.email || '').toLowerCase().includes(q) ||
        (r.firstName || '').toLowerCase().includes(q) ||
        (r.lastName || '').toLowerCase().includes(q) ||
        (`${r.firstName || ''} ${r.lastName || ''}`).toLowerCase().includes(q)
      )
    }
    return items
  }, [waitlistData, platformFilter, userStatusFilter, recipientSearch])

  const toggleRecipient = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAllRecipients = () => setSelected(s => s.size === filteredRecipients.length ? new Set() : new Set(filteredRecipients.map(r => r.id)))

  // Send bulk email
  const handleSend = async () => {
    setConfirmSend(false)
    const recipients = waitlistData.filter(r => selected.has(r.id))
    if (!recipients.length) {
      onToast('Please select recipients', 'error')
      return
    }
    if (sendMode === 'html' && (!subject.trim() || !body.trim())) {
      onToast('Please fill in subject & body', 'error')
      return
    }
    if (sendMode === 'template' && !resendTemplateId.trim()) {
      onToast('Please enter a Resend template ID', 'error')
      return
    }

    // Parse template variables JSON
    let parsedVars = undefined
    if (sendMode === 'template' && templateVars.trim()) {
      try { parsedVars = JSON.parse(templateVars) } catch {
        onToast('Invalid JSON in template variables', 'error')
        return
      }
    }

    setSending(true)
    setSendProgress({ sent: 0, total: recipients.length, failed: [] })
    const failed = []
    for (let i = 0; i < recipients.length; i++) {
      const emailOpts = sendMode === 'template'
        ? { templateId: resendTemplateId.trim(), variables: parsedVars, subject: subject.trim() || undefined }
        : { subject, html: body.replace(/\n/g, '<br>') }
      try {
        await sendResendEmail(recipients[i].email, emailOpts)
      } catch (err) {
        failed.push({ email: recipients[i].email, error: err.message })
      }
      setSendProgress({ sent: i + 1, total: recipients.length, failed: [...failed] })
      if (i < recipients.length - 1) await new Promise(r => setTimeout(r, 100))
    }
    // Log the send
    try {
      await saveEmailLog({
        subject,
        body,
        recipientCount: recipients.length,
        recipientEmails: recipients.map(r => r.email),
        filters: { platform: platformFilter || 'all', userStatus: userStatusFilter || 'all', search: recipientSearch || '' },
        status: failed.length === 0 ? 'sent' : failed.length === recipients.length ? 'failed' : 'partial',
        failedEmails: failed.map(f => f.email),
      })
    } catch (err) { console.error('Failed to log email send:', err) }

    setSending(false)
    setSendProgress(null)
    if (failed.length === 0) {
      onToast(`Email sent to ${recipients.length} recipients`, 'success')
    } else {
      onToast(`Sent ${recipients.length - failed.length}/${recipients.length} — ${failed.length} failed`, 'error')
    }
    setSelected(new Set())
    // Refresh logs
    try { setLogs(await getEmailLogs()) } catch (err) { console.error(err) }
  }

  // Save as template
  const handleSaveTemplate = async () => {
    const name = prompt('Template name:')
    if (!name?.trim()) return
    try {
      await saveEmailTemplate({ name: name.trim(), subject, body })
      onToast('Template saved', 'success')
      setTemplates(await getEmailTemplates())
    } catch (err) {
      onToast('Failed to save template: ' + err.message, 'error')
    }
  }

  // Load template into compose
  const loadTemplate = (t) => {
    setSubject(t.subject || '')
    setBody(t.body || '')
    setSubTab('compose')
  }

  if (loading) return <div className="adm-loading">Loading email module...</div>

  return (
    <>
      <div className="adm-header">
        <h1 className="adm-page-title">Email</h1>
        <div className="adm-header-right">
          <button className="adm-refresh-btn" onClick={fetchAll} disabled={loading}>Refresh</button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="adm-email-subtabs">
        {[{ id: 'compose', label: 'Compose' }, { id: 'templates', label: 'Templates' }, { id: 'history', label: 'History' }].map(t => (
          <button key={t.id} className={`adm-email-subtab${subTab === t.id ? ' active' : ''}`} onClick={() => setSubTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* ── COMPOSE ── */}
      {subTab === 'compose' && (
        <div className="adm-email-compose">
          {/* Recipients panel */}
          <div className="adm-email-recipients">
            <h3 className="adm-email-section-title">
              Recipients
              <span className="adm-recipient-chip">{selected.size} of {filteredRecipients.length} selected</span>
            </h3>
            <div className="adm-email-filters">
              <select className="adm-email-filter-select" value={platformFilter} onChange={e => { setPlatformFilter(e.target.value); setSelected(new Set()) }}>
                <option value="">All platforms</option>
                <option value="ios">iOS</option>
                <option value="android">Android</option>
                <option value="unspecified">No platform</option>
              </select>
              <select className="adm-email-filter-select" value={userStatusFilter} onChange={e => { setUserStatusFilter(e.target.value); setSelected(new Set()) }}>
                <option value="">All users</option>
                <option value="active">Active users</option>
                <option value="not_user">Not yet users</option>
              </select>
              <input className="adm-email-filter-search" type="text" placeholder="Search by name or email..." value={recipientSearch} onChange={e => setRecipientSearch(e.target.value)} />
            </div>
            <div className="adm-email-recipient-list">
              <div className="adm-email-recipient-header">
                <label className="adm-email-check-all">
                  <input type="checkbox" checked={selected.size === filteredRecipients.length && filteredRecipients.length > 0} onChange={toggleAllRecipients} />
                  <span>Select all ({filteredRecipients.length})</span>
                </label>
              </div>
              <div className="adm-email-recipient-scroll">
                {filteredRecipients.map(r => (
                  <label key={r.id} className={`adm-email-recipient-row${selected.has(r.id) ? ' selected' : ''}`}>
                    <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleRecipient(r.id)} />
                    <span className="adm-email-recipient-email">{r.email}</span>
                    <span className="adm-email-recipient-meta">
                      {r.isUser && <span style={{ color: '#A2F69A', fontSize: '11px', fontWeight: 600, marginRight: 4 }}>ACTIVE</span>}
                      {r.firstName || r.lastName ? `${r.firstName || ''} ${r.lastName || ''}`.trim() : ''}
                      {r.platform ? ` · ${r.platform}` : ''}
                    </span>
                  </label>
                ))}
                {filteredRecipients.length === 0 && <div className="adm-empty" style={{ padding: '20px 0' }}>No recipients match filters</div>}
              </div>
            </div>
          </div>

          {/* Compose panel */}
          <div className="adm-email-editor">
            <h3 className="adm-email-section-title">Compose</h3>

            {/* Mode toggle */}
            <div className="adm-email-mode-toggle">
              <button className={`adm-email-mode-btn${sendMode === 'html' ? ' active' : ''}`} onClick={() => setSendMode('html')}>Write HTML</button>
              <button className={`adm-email-mode-btn${sendMode === 'template' ? ' active' : ''}`} onClick={() => setSendMode('template')}>Resend Template</button>
            </div>

            {sendMode === 'html' && (
              <>
                <div className="adm-email-template-bar">
                  <select className="adm-email-filter-select" defaultValue="" onChange={e => {
                    const allTpls = [...BUILTIN_TEMPLATES, ...templates]
                    const t = allTpls.find(t => t.id === e.target.value)
                    if (t) loadTemplate(t)
                    e.target.value = ''
                  }}>
                    <option value="" disabled>Load template...</option>
                    {BUILTIN_TEMPLATES.map(t => <option key={t.id} value={t.id}>⚡ {t.name}</option>)}
                    {templates.length > 0 && <option disabled>──────────</option>}
                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <button className="adm-email-save-tpl" onClick={handleSaveTemplate} disabled={!subject.trim() && !body.trim()}>Save as Template</button>
                </div>
                <label className="adm-modal-label">
                  <span>Subject</span>
                  <input className="adm-modal-input" type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject..." />
                </label>
                <label className="adm-modal-label">
                  <span>Body</span>
                  <span className="adm-email-hint">Plain text (newlines become line breaks) or raw HTML</span>
                  <textarea className="adm-modal-input adm-modal-textarea adm-email-body" value={body} onChange={e => setBody(e.target.value)} rows={10} placeholder="Write your email content here..." />
                </label>
              </>
            )}

            {sendMode === 'template' && (
              <>
                <label className="adm-modal-label">
                  <span>Resend Template</span>
                  <div className="adm-email-template-bar">
                    <select className="adm-email-filter-select" style={{ flex: 1 }} value={resendTemplateId} onChange={e => setResendTemplateId(e.target.value)}>
                      <option value="">Select a template...</option>
                      {resendTemplates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}{t.alias ? ` (${t.alias})` : ''}</option>
                      ))}
                    </select>
                    <button className="adm-email-save-tpl" onClick={fetchResendTemplates} disabled={loadingResendTemplates}>
                      {loadingResendTemplates ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>
                </label>
                <label className="adm-modal-label">
                  <span>Subject override <span style={{ color: '#666', fontWeight: 400 }}>(optional)</span></span>
                  <input className="adm-modal-input" type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Leave empty to use template default" />
                </label>
                <label className="adm-modal-label">
                  <span>Template variables <span style={{ color: '#666', fontWeight: 400 }}>(optional JSON)</span></span>
                  <span className="adm-email-hint">Key/value pairs for your template, e.g. {`{"name": "John", "cta_link": "https://..."}`}</span>
                  <textarea className="adm-modal-input adm-modal-textarea" value={templateVars} onChange={e => setTemplateVars(e.target.value)} rows={4} placeholder='{"key": "value"}' />
                </label>
              </>
            )}

            {/* Send progress */}
            {sendProgress && (
              <div className="adm-email-progress-wrap">
                <div className="adm-email-progress-bar">
                  <div className="adm-email-progress-fill" style={{ width: `${(sendProgress.sent / sendProgress.total) * 100}%` }} />
                </div>
                <span className="adm-email-progress-text">Sending {sendProgress.sent}/{sendProgress.total}...</span>
              </div>
            )}

            <div className="adm-email-send-actions">
              <button className="adm-email-send-btn" onClick={() => setConfirmSend(true)} disabled={
                sending || selected.size === 0 ||
                (sendMode === 'html' && (!subject.trim() || !body.trim())) ||
                (sendMode === 'template' && !resendTemplateId.trim())
              }>
                {sending ? `Sending...` : `Send to ${selected.size} recipient${selected.size !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TEMPLATES ── */}
      {subTab === 'templates' && (
        <>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr><th>Name</th><th>Subject</th><th>Created</th><th></th></tr>
              </thead>
              <tbody>
                {BUILTIN_TEMPLATES.map(t => (
                  <tr key={t.id}>
                    <td className="adm-td-template-name">⚡ {t.name}</td>
                    <td>{t.subject || '—'}</td>
                    <td className="adm-td-date">Built-in</td>
                    <td className="adm-td-actions">
                      <button className="adm-refresh-btn" onClick={() => loadTemplate(t)}>Use</button>
                    </td>
                  </tr>
                ))}
                {templates.map(t => (
                  <tr key={t.id}>
                    <td className="adm-td-template-name">{t.name}</td>
                    <td>{t.subject || '—'}</td>
                    <td className="adm-td-date">{formatDate(t.createdAt)}</td>
                    <td className="adm-td-actions">
                      <RowMenu
                        onEdit={() => setEditingTemplate(t)}
                        onDelete={() => setDeletingTemplate(t)}
                        extraItems={[{ label: 'Use', onClick: () => loadTemplate(t) }]}
                      />
                    </td>
                  </tr>
                ))}
                {templates.length === 0 && <tr><td colSpan="4" className="adm-empty">No custom templates saved yet — built-ins above are always available</td></tr>}
              </tbody>
            </table>
          </div>
          {editingTemplate && (
            <EditModal title="Edit Template" fields={[
              { key: 'name', label: 'Name' },
              { key: 'subject', label: 'Subject' },
              { key: 'body', label: 'Body (HTML)', type: 'textarea' },
            ]}
              initial={{ name: editingTemplate.name || '', subject: editingTemplate.subject || '', body: editingTemplate.body || '' }}
              onSave={async v => { await updateEmailTemplate(editingTemplate.id, v); setTemplates(await getEmailTemplates()) }}
              onClose={() => setEditingTemplate(null)} />
          )}
          {deletingTemplate && (
            <DeleteConfirm label={deletingTemplate.name}
              onConfirm={async () => { await deleteEmailTemplate(deletingTemplate.id); setTemplates(await getEmailTemplates()) }}
              onClose={() => setDeletingTemplate(null)} />
          )}
        </>
      )}

      {/* ── HISTORY ── */}
      {subTab === 'history' && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Date</th><th>Subject</th><th>Recipients</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <React.Fragment key={l.id}>
                  <tr className={expandedLog === l.id ? 'adm-row-selected' : ''}>
                    <td className="adm-td-date">{formatDate(l.sentAt)}</td>
                    <td>{l.subject || '—'}</td>
                    <td>{l.recipientCount || 0}</td>
                    <td><span className={`adm-status adm-status-${l.status || 'sent'}`}>{l.status || 'sent'}</span></td>
                    <td className="adm-td-actions">
                      <button className="adm-menu-trigger" onClick={() => setExpandedLog(expandedLog === l.id ? null : l.id)}>
                        {expandedLog === l.id ? '▲' : '▼'}
                      </button>
                    </td>
                  </tr>
                  {expandedLog === l.id && (
                    <tr className="adm-email-log-detail-row">
                      <td colSpan="5">
                        <div className="adm-email-log-detail">
                          <div className="adm-email-log-section">
                            <strong>Recipients ({l.recipientEmails?.length || 0}):</strong>
                            <div className="adm-email-log-emails">{(l.recipientEmails || []).join(', ')}</div>
                          </div>
                          {l.failedEmails?.length > 0 && (
                            <div className="adm-email-log-section adm-email-log-failed">
                              <strong>Failed ({l.failedEmails.length}):</strong>
                              <div className="adm-email-log-emails">{l.failedEmails.join(', ')}</div>
                            </div>
                          )}
                          <div className="adm-email-log-section">
                            <strong>Filters:</strong> Platform: {l.filters?.platform || 'all'}{l.filters?.search ? `, Search: "${l.filters.search}"` : ''}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {logs.length === 0 && <tr><td colSpan="5" className="adm-empty">No emails sent yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm send modal */}
      {confirmSend && (
        <div className="adm-modal-overlay" onClick={() => setConfirmSend(false)}>
          <div className="adm-modal adm-modal-sm" onClick={e => e.stopPropagation()}>
            <h2 className="adm-modal-title">Confirm Send</h2>
            <p className="adm-modal-body">
              Send <strong>"{subject}"</strong> to <strong>{selected.size} recipient{selected.size !== 1 ? 's' : ''}</strong>?
            </p>
            <div className="adm-modal-actions">
              <button className="adm-modal-cancel" onClick={() => setConfirmSend(false)}>Cancel</button>
              <button className="adm-modal-save" onClick={handleSend}>Send</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ══════════════════════════════════════════════
   INBOX TAB
   ══════════════════════════════════════════════ */

function InboxTab({ onToast, onMarkRead }) {
  const [folder, setFolder] = useState('inbox') // inbox | archived | deleted
  const [allEmails, setAllEmails] = useState([])
  const [statuses, setStatuses] = useState({}) // { emailId: 'deleted' | 'archived' }
  const [loading, setLoading] = useState(true)
  const [cursors, setCursors] = useState([])
  const [hasMore, setHasMore] = useState(false)

  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [replies, setReplies] = useState([])

  const [replying, setReplying] = useState(false)
  const [replyBody, setReplyBody] = useState('')
  const [sending, setSending] = useState(false)

  const PAGE_SIZE = 50

  const fetchInbox = useCallback(async (afterCursor) => {
    setLoading(true)
    try {
      const [res, statusMap] = await Promise.all([
        fetch(`/api/list-inbox?limit=${PAGE_SIZE}${afterCursor ? `&after=${afterCursor}` : ''}`),
        getAllInboxStatuses()
      ])
      if (!res.ok) throw new Error('Failed to fetch inbox')
      const json = await res.json()
      setAllEmails(json.data || [])
      setStatuses(statusMap)
      setHasMore((json.data || []).length === PAGE_SIZE)
    } catch (err) {
      console.error(err)
      onToast('Failed to load inbox', 'error')
    } finally {
      setLoading(false)
    }
  }, [onToast])

  useEffect(() => { fetchInbox() }, [fetchInbox])

  // Filter emails by current folder
  const filteredEmails = useMemo(() => {
    return allEmails.filter(e => {
      const id = e.email_id || e.id
      const st = statuses[id]?.status
      if (folder === 'inbox') return !st || (st !== 'deleted' && st !== 'archived')
      if (folder === 'archived') return st === 'archived'
      if (folder === 'deleted') return st === 'deleted'
      return false
    })
  }, [allEmails, statuses, folder])

  const handleNext = () => {
    if (!allEmails.length) return
    const lastId = allEmails[allEmails.length - 1].email_id || allEmails[allEmails.length - 1].id
    setCursors(prev => [...prev, lastId])
    fetchInbox(lastId)
  }

  const handlePrev = () => {
    setCursors(prev => {
      const next = prev.slice(0, -1)
      fetchInbox(next[next.length - 1] || undefined)
      return next
    })
  }

  const fetchDetail = useCallback(async (emailId) => {
    setLoadingDetail(true)
    setDetail(null)
    setReplies([])
    try {
      const [res, savedReplies] = await Promise.all([
        fetch(`/api/get-email?id=${emailId}`),
        getInboxReplies(emailId).catch(err => { console.error('Failed to load replies:', err); return [] })
      ])
      if (!res.ok) throw new Error('Failed to fetch email')
      setDetail(await res.json())
      setReplies(savedReplies)
    } catch (err) {
      console.error(err)
      onToast('Failed to load email', 'error')
    } finally {
      setLoadingDetail(false)
    }
  }, [onToast])

  const handleSelect = async (email) => {
    const id = email.email_id || email.id
    setSelectedId(id)
    setReplying(false)
    setReplyBody('')
    fetchDetail(id)
    // Mark as read
    if (!statuses[id]?.read) {
      try {
        await markInboxEmailRead(id)
        setStatuses(prev => ({ ...prev, [id]: { ...prev[id], read: true } }))
        onMarkRead?.()
      } catch {}
    }
  }

  const handleReply = async () => {
    if (!replyBody.trim() || !detail) return
    setSending(true)
    try {
      const replySubject = detail.subject?.startsWith('Re:') ? detail.subject : `Re: ${detail.subject}`
      const replyHtml = replyBody.replace(/\n/g, '<br>')
      await sendResendEmail(detail.from, {
        subject: replySubject,
        html: replyHtml,
        headers: {
          'In-Reply-To': detail.message_id,
          'References': detail.message_id,
        }
      })
      const now = new Date()
      await saveInboxReply({ emailId: selectedId, to: detail.from, subject: replySubject, body: replyHtml })
      setReplies(prev => [...prev, { emailId: selectedId, to: detail.from, subject: replySubject, body: replyHtml, sentAt: now }])
      onToast('Reply sent', 'success')
      setReplying(false)
      setReplyBody('')
    } catch (err) {
      onToast('Failed to send reply: ' + err.message, 'error')
    } finally {
      setSending(false)
    }
  }

  const handleSetStatus = async (emailId, status) => {
    try {
      await setInboxEmailStatus(emailId, status)
      setStatuses(prev => ({ ...prev, [emailId]: { ...prev[emailId], status } }))
      if (selectedId === emailId) { setSelectedId(null); setDetail(null) }
      onToast(status === 'deleted' ? 'Moved to Deleted' : status === 'archived' ? 'Archived' : 'Restored to Inbox', 'success')
    } catch (err) {
      onToast('Failed to update: ' + err.message, 'error')
    }
  }

  const folderLabel = folder === 'inbox' ? 'Inbox' : folder === 'archived' ? 'Archived' : 'Deleted'

  return (
    <>
      <div className="adm-header">
        <h1 className="adm-page-title">{folderLabel}</h1>
        <div className="adm-header-right">
          <button className="adm-bulk-action" onClick={() => { setCursors([]); fetchInbox() }} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="adm-email-subtabs">
        {[{ id: 'inbox', label: 'Inbox' }, { id: 'archived', label: 'Archived' }, { id: 'deleted', label: 'Deleted' }].map(t => (
          <button key={t.id} className={`adm-email-subtab${folder === t.id ? ' active' : ''}`} onClick={() => { setFolder(t.id); setSelectedId(null); setDetail(null) }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="adm-inbox-split">
        <div className="adm-inbox-list">
          {loading && !allEmails.length && <div className="adm-empty" style={{ padding: 20 }}>Loading...</div>}
          {!loading && !filteredEmails.length && <div className="adm-empty" style={{ padding: 20 }}>No emails in {folderLabel.toLowerCase()}</div>}
          {filteredEmails.map(e => {
            const id = e.email_id || e.id
            return (
              <div
                key={id}
                className={`adm-inbox-item${selectedId === id ? ' active' : ''}${!statuses[id]?.read ? ' unread' : ''}`}
                onClick={() => handleSelect(e)}
              >
                <div className="adm-inbox-item-from">{e.from}</div>
                <div className="adm-inbox-item-subject">{e.subject || '(no subject)'}</div>
                <div className="adm-inbox-item-date">{formatDate(e.created_at)}</div>
              </div>
            )
          })}
          {(cursors.length > 0 || hasMore) && (
            <div className="adm-inbox-pagination">
              <button className="adm-bulk-action" disabled={cursors.length === 0} onClick={handlePrev}>Previous</button>
              <button className="adm-bulk-action" disabled={!hasMore} onClick={handleNext}>Next</button>
            </div>
          )}
        </div>

        <div className="adm-inbox-detail">
          {loadingDetail && <div className="adm-empty" style={{ padding: 40 }}>Loading email...</div>}
          {!loadingDetail && !detail && !selectedId && (
            <div className="adm-empty" style={{ padding: 40 }}>Select an email to view</div>
          )}
          {detail && (
            <>
              {/* Action buttons */}
              <div className="adm-inbox-actions">
                {folder === 'inbox' && (
                  <>
                    <button className="adm-bulk-action" onClick={() => handleSetStatus(selectedId, 'archived')}>Archive</button>
                    <button className="adm-bulk-action adm-inbox-action-delete" onClick={() => handleSetStatus(selectedId, 'deleted')}>Delete</button>
                  </>
                )}
                {folder === 'archived' && (
                  <>
                    <button className="adm-bulk-action" onClick={() => handleSetStatus(selectedId, null)}>Move to Inbox</button>
                    <button className="adm-bulk-action adm-inbox-action-delete" onClick={() => handleSetStatus(selectedId, 'deleted')}>Delete</button>
                  </>
                )}
                {folder === 'deleted' && (
                  <>
                    <button className="adm-bulk-action" onClick={() => handleSetStatus(selectedId, null)}>Restore to Inbox</button>
                    <button className="adm-bulk-action" onClick={() => handleSetStatus(selectedId, 'archived')}>Archive</button>
                  </>
                )}
              </div>

              {/* Original email */}
              <div className="adm-inbox-msg">
                <div className="adm-inbox-msg-header">
                  <div className="adm-inbox-msg-from">{detail.from}</div>
                  <div className="adm-inbox-msg-date">{formatDate(detail.created_at)}</div>
                </div>
                <div className="adm-inbox-msg-meta">
                  <span>To: {Array.isArray(detail.to) ? detail.to.join(', ') : detail.to}</span>
                  <span>Subject: {detail.subject}</span>
                </div>
                <iframe
                  className="adm-inbox-iframe"
                  sandbox=""
                  srcDoc={detail.html || `<pre style="font-family:sans-serif;padding:16px;white-space:pre-wrap">${(detail.text || '').replace(/</g, '&lt;')}</pre>`}
                  title="Email content"
                />
              </div>

              {/* Sent replies */}
              {replies.map((r, i) => (
                <div key={i} className="adm-inbox-msg adm-inbox-msg-reply">
                  <div className="adm-inbox-msg-header">
                    <div className="adm-inbox-msg-from">You (Final Table)</div>
                    <div className="adm-inbox-msg-date">{formatDate(r.sentAt)}</div>
                  </div>
                  <div className="adm-inbox-msg-body" dangerouslySetInnerHTML={{ __html: r.body }} />
                </div>
              ))}

              {/* Reply composer */}
              {!replying ? (
                <button className="adm-inbox-reply-btn" onClick={() => setReplying(true)}>Reply</button>
              ) : (
                <div className="adm-inbox-reply">
                  <textarea
                    className="adm-inbox-reply-textarea"
                    placeholder="Type your reply..."
                    value={replyBody}
                    onChange={e => setReplyBody(e.target.value)}
                    rows={5}
                    autoFocus
                  />
                  <div className="adm-inbox-reply-actions">
                    <button className="adm-modal-cancel" onClick={() => { setReplying(false); setReplyBody('') }}>Cancel</button>
                    <button className="adm-modal-save" onClick={handleReply} disabled={sending || !replyBody.trim()}>
                      {sending ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════
   BLOG → EMAIL A POST TO SELECTED USERS
   ══════════════════════════════════════════════ */

// Branded email HTML for a blog post: excerpt + "Read the full article" CTA.
function buildBlogEmail(post, recipientName) {
  const url = `${SITE_URL}/blog/${post.slug}`
  const hi = recipientName ? `Hi ${recipientName},` : 'Hi,'
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0c0c0c;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0c0c0c;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#121212;border:1px solid #1e1e1e;border-radius:18px;overflow:hidden;">
        <tr><td style="padding:32px 36px 8px;">
          <p style="margin:0 0 4px;color:#4cde78;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;">Final Table Blog</p>
          <h1 style="margin:0 0 14px;color:#ffffff;font-size:26px;line-height:1.25;">${post.title}</h1>
          <p style="margin:0 0 22px;color:#c7c7c7;font-size:16px;line-height:1.6;">${hi}</p>
          <p style="margin:0 0 26px;color:#c7c7c7;font-size:16px;line-height:1.6;">${post.description}</p>
          <a href="${url}" style="display:inline-block;background:#4cde78;color:#06120b;font-weight:700;font-size:15px;text-decoration:none;padding:13px 26px;border-radius:40px;">Read the full article →</a>
        </td></tr>
        <tr><td style="padding:28px 36px 32px;border-top:1px solid #1e1e1e;margin-top:24px;">
          <p style="margin:0;color:#7a7a7a;font-size:13px;line-height:1.5;">You're receiving this because you have a Final Table account.<br/>
          <a href="${SITE_URL}" style="color:#4cde78;text-decoration:none;">finaltable.io</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function BlogTab({ onToast }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSlug, setSelectedSlug] = useState(blogPosts[0]?.slug || '')
  const [checked, setChecked] = useState(() => new Set())
  const [search, setSearch] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    getAppUsers()
      .then(list => setUsers(list.filter(u => u.email && u.email.includes('@'))))
      .catch(() => onToast('Failed to load users', 'error'))
      .finally(() => setLoading(false))
  }, [onToast])

  const post = blogPosts.find(p => p.slug === selectedSlug) || null

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter(u =>
      (u.email || '').toLowerCase().includes(q) ||
      (u.displayName || '').toLowerCase().includes(q))
  }, [users, search])

  const toggle = (email) => {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(email) ? next.delete(email) : next.add(email)
      return next
    })
  }
  const allVisibleChecked = filtered.length > 0 && filtered.every(u => checked.has(u.email))
  const toggleAllVisible = () => {
    setChecked(prev => {
      const next = new Set(prev)
      if (allVisibleChecked) filtered.forEach(u => next.delete(u.email))
      else filtered.forEach(u => next.add(u.email))
      return next
    })
  }

  const handleSend = async () => {
    if (!post) { onToast('Pick an article first', 'error'); return }
    const recipients = users.filter(u => checked.has(u.email))
    if (recipients.length === 0) { onToast('Select at least one user', 'error'); return }
    if (!window.confirm(`Send "${post.title}" to ${recipients.length} user${recipients.length > 1 ? 's' : ''}?`)) return

    setSending(true)
    let ok = 0, fail = 0
    for (const u of recipients) {
      try {
        await sendResendEmail(u.email, {
          subject: post.title,
          html: buildBlogEmail(post, (u.displayName || '').split(' ')[0]),
        })
        ok++
      } catch (_) {
        fail++
      }
    }
    setSending(false)
    onToast(`Sent to ${ok} user${ok !== 1 ? 's' : ''}${fail ? `, ${fail} failed` : ''}`, fail ? 'error' : 'success')
    if (!fail) setChecked(new Set())
  }

  return (
    <div>
      <h1 className="adm-page-title">Blog → Email a post</h1>
      <p style={{ color: '#9a9a9a', fontSize: 14, margin: '0 0 20px' }}>Pick an article, select users, and send it as an email via Resend.</p>

      {blogPosts.length === 0 ? (
        <p style={{ color: '#9a9a9a' }}>No blog posts found.</p>
      ) : (
        <>
          <label style={{ display: 'block', marginBottom: 6, color: '#c7c7c7', fontSize: 13, fontWeight: 600 }}>Article</label>
          <select
            className="adm-email-filter-select"
            value={selectedSlug}
            onChange={e => setSelectedSlug(e.target.value)}
            style={{ width: '100%', maxWidth: 560, marginBottom: 10 }}
          >
            {blogPosts.map(p => (
              <option key={p.slug} value={p.slug}>{p.title}</option>
            ))}
          </select>

          {post && (
            <div style={{ background: '#121212', border: '1px solid #1e1e1e', borderRadius: 12, padding: 16, marginBottom: 20, maxWidth: 560 }}>
              <p style={{ margin: '0 0 6px', color: '#c7c7c7', fontSize: 14, lineHeight: 1.5 }}>{post.description}</p>
              <a href={`${SITE_URL}/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: '#4cde78', fontSize: 13, textDecoration: 'none' }}>
                /blog/{post.slug} ↗
              </a>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
            <input
              className="adm-email-filter-select"
              placeholder="Search name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 220 }}
            />
            <span style={{ color: '#9a9a9a', fontSize: 13 }}>
              {checked.size} selected · {filtered.length} shown
            </span>
          </div>

          {loading ? (
            <p style={{ color: '#9a9a9a' }}>Loading users…</p>
          ) : (
            <div style={{ maxHeight: 380, overflowY: 'auto', border: '1px solid #1e1e1e', borderRadius: 12 }}>
              <table className="adm-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>
                      <input type="checkbox" checked={allVisibleChecked} onChange={toggleAllVisible} aria-label="Select all visible" />
                    </th>
                    <th>Name</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id} onClick={() => toggle(u.email)} style={{ cursor: 'pointer' }}>
                      <td onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={checked.has(u.email)} onChange={() => toggle(u.email)} />
                      </td>
                      <td>{u.displayName || '—'}</td>
                      <td>{u.email}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={3} style={{ color: '#9a9a9a', padding: 16 }}>No matching users.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <button
            className="adm-email-send-btn"
            style={{ marginTop: 18 }}
            disabled={sending || checked.size === 0 || !post}
            onClick={handleSend}
          >
            {sending ? 'Sending…' : `Send to ${checked.size} user${checked.size !== 1 ? 's' : ''}`}
          </button>
        </>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   STATISTICS TAB
   ══════════════════════════════════════════════ */

// Categorical palette stepped for the admin dark surface (#141414).
// Fixed order = the CVD-safety mechanism; never cycle or reorder per chart.
// Validated: all >= 3:1 on surface, worst adjacent CVD ΔE in the legal floor
// band — mitigated by the per-slice % labels + legend below.
const CHART_COLORS = ['#3987e5', '#199e70', '#c98500', '#008300', '#9085e9', '#e66767', '#d55181', '#d95926']

function polarToXY(cx, cy, r, angleDeg) {
  const a = (angleDeg - 90) * (Math.PI / 180)
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}
// Arc path for a donut segment between two angles (degrees, clockwise from top).
function donutArc(cx, cy, rOuter, rInner, startAngle, endAngle) {
  const [x1, y1] = polarToXY(cx, cy, rOuter, endAngle)
  const [x2, y2] = polarToXY(cx, cy, rOuter, startAngle)
  const [x3, y3] = polarToXY(cx, cy, rInner, startAngle)
  const [x4, y4] = polarToXY(cx, cy, rInner, endAngle)
  const large = endAngle - startAngle > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${large} 0 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${large} 1 ${x4} ${y4} Z`
}

// A donut/pie chart. `rows` = [{ value, label, count }] (from tallySurvey).
function PieChart({ title, rows }) {
  const [hover, setHover] = useState(null)
  const total = useMemo(() => rows.reduce((s, r) => s + r.count, 0), [rows])
  const size = 200, cx = 100, cy = 100, rOuter = 92, rInner = 52

  // Precompute segment geometry.
  const segments = useMemo(() => {
    let angle = 0
    return rows.map((r, i) => {
      const frac = total > 0 ? r.count / total : 0
      const start = angle
      const end = angle + frac * 360
      angle = end
      return { ...r, i, frac, start, end, color: CHART_COLORS[i % CHART_COLORS.length] }
    })
  }, [rows, total])

  if (total === 0) {
    return (
      <div className="adm-pie-card">
        <h3 className="adm-pie-title">{title}</h3>
        <p className="adm-pie-empty">No answers yet</p>
      </div>
    )
  }

  const active = hover != null ? segments[hover] : null

  return (
    <div className="adm-pie-card">
      <h3 className="adm-pie-title">{title}</h3>
      <div className="adm-pie-body">
        <div className="adm-pie-svg-wrap">
          <svg viewBox={`0 0 ${size} ${size}`} className="adm-pie-svg" role="img" aria-label={`${title} distribution`}>
            {/* Single full-circle segment can't be drawn as an arc; use a ring. */}
            {segments.length === 1 ? (
              <circle cx={cx} cy={cy} r={(rOuter + rInner) / 2} fill="none"
                stroke={segments[0].color} strokeWidth={rOuter - rInner}
                onMouseEnter={() => setHover(0)} onMouseLeave={() => setHover(null)} />
            ) : segments.map(s => (
              <path key={s.value} d={donutArc(cx, cy, rOuter, rInner, s.start, s.end)}
                fill={s.color} stroke="#141414" strokeWidth="2"
                opacity={hover != null && hover !== s.i ? 0.35 : 1}
                style={{ transition: 'opacity 0.15s', cursor: 'default' }}
                onMouseEnter={() => setHover(s.i)} onMouseLeave={() => setHover(null)} />
            ))}
            {/* Per-slice % labels for slices big enough to hold text. */}
            {segments.filter(s => s.frac >= 0.08).map(s => {
              const mid = (s.start + s.end) / 2
              const [lx, ly] = polarToXY(cx, cy, (rOuter + rInner) / 2, mid)
              return (
                <text key={`lbl-${s.value}`} x={lx} y={ly} className="adm-pie-slice-label"
                  textAnchor="middle" dominantBaseline="central">{Math.round(s.frac * 100)}%</text>
              )
            })}
            {/* Center readout: total, or the hovered slice. */}
            <text x={cx} y={cy - 6} className="adm-pie-center-value" textAnchor="middle">
              {active ? active.count : total}
            </text>
            <text x={cx} y={cy + 14} className="adm-pie-center-label" textAnchor="middle">
              {active ? `${Math.round(active.frac * 100)}%` : 'total'}
            </text>
          </svg>
        </div>
        <ul className="adm-pie-legend">
          {segments.map(s => (
            <li key={s.value} className={`adm-pie-legend-item${hover === s.i ? ' active' : ''}`}
              onMouseEnter={() => setHover(s.i)} onMouseLeave={() => setHover(null)}>
              <span className="adm-pie-legend-swatch" style={{ background: s.color }} />
              <span className="adm-pie-legend-label">{s.label}</span>
              <span className="adm-pie-legend-count">{s.count} · {Math.round(s.frac * 100)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Horizontal bars for a multi-select dimension (purposes) where each user can
// pick several — percentages are "share of users who picked this", so they sum
// past 100% and a pie would misrepresent them.
function BarChart({ title, subtitle, rows, denom }) {
  const [hover, setHover] = useState(null)
  const max = Math.max(1, ...rows.map(r => r.count))
  return (
    <div className="adm-pie-card">
      <h3 className="adm-pie-title">{title}</h3>
      {subtitle && <p className="adm-bar-subtitle">{subtitle}</p>}
      {rows.length === 0 ? <p className="adm-pie-empty">No answers yet</p> : (
        <div className="adm-bars">
          {rows.map((r, i) => {
            const pct = denom > 0 ? Math.round((r.count / denom) * 100) : 0
            return (
              <div key={r.value} className={`adm-bar-row${hover === i ? ' active' : ''}`}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <span className="adm-bar-label">{r.label}</span>
                <div className="adm-bar-track">
                  <div className="adm-bar-fill" style={{ width: `${(r.count / max) * 100}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                </div>
                <span className="adm-bar-value">{r.count} · {pct}%</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatisticsTab() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try { setData(await getAppUsers()) } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchData() }, [fetchData])

  const answered = useMemo(() => data.filter(u => u.onboardingData), [data])
  const completed = useMemo(() => data.filter(u => u.hasCompletedOnboarding), [data])

  const journey = useMemo(() => tallySurvey(answered, 'pokerJourney'), [answered])
  const gameType = useMemo(() => tallySurvey(answered, 'gameType'), [answered])
  const sessions = useMemo(() => tallySessions(answered), [answered])
  const purposes = useMemo(() => tallySurvey(answered, 'purposes', { multi: true }), [answered])

  const completionRate = data.length > 0 ? Math.round((completed.length / data.length) * 100) : 0

  return (
    <>
      <div className="adm-header">
        <h1 className="adm-page-title">Statistics</h1>
        <div className="adm-header-right">
          <button className="adm-refresh-btn" onClick={fetchData} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button>
        </div>
      </div>
      <p className="adm-stats-intro">Who our customers are, from the in-app onboarding survey.</p>

      <div className="adm-stats-grid" style={{ marginBottom: 28 }}>
        <div className="adm-stat-card"><div className="adm-stat-value">{data.length}</div><div className="adm-stat-label">Total users</div></div>
        <div className="adm-stat-card"><div className="adm-stat-value">{answered.length}</div><div className="adm-stat-label">Answered survey</div></div>
        <div className="adm-stat-card adm-stat-highlight"><div className="adm-stat-value">{completionRate}%</div><div className="adm-stat-label">Completion rate</div></div>
      </div>

      {loading ? (
        <div className="adm-loading">Loading statistics...</div>
      ) : answered.length === 0 ? (
        <div className="adm-empty" style={{ padding: 40 }}>No onboarding survey responses yet.</div>
      ) : (
        <>
          <div className="adm-pie-grid">
            <PieChart title="Poker journey" rows={journey} />
            <PieChart title="Game type" rows={gameType} />
            <PieChart title="Sessions per month" rows={sessions} />
          </div>
          <div style={{ marginTop: 18 }}>
            <BarChart title="Why they use Final Table"
              subtitle="Multi-select — % of the people who answered who picked each reason"
              rows={purposes} denom={answered.length} />
          </div>
        </>
      )}
    </>
  )
}

/* ══════════════════════════════════════════════
   DASHBOARD SHELL
   ══════════════════════════════════════════════ */

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [toast, setToast] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [inboxCount, setInboxCount] = useState(0)

  const handleLogout = async () => { await signOutAdmin() }
  const showToast = useCallback((message, type) => setToast({ message, type, key: Date.now() }), [])

  // Poll inbox count
  const fetchInboxCount = useCallback(async () => {
    try {
      const [res, statusMap] = await Promise.all([
        fetch('/api/list-inbox?limit=50'),
        getAllInboxStatuses()
      ])
      if (!res.ok) return
      const json = await res.json()
      const count = (json.data || []).filter(e => {
        const id = e.email_id || e.id
        const st = statusMap[id]
        const status = st?.status
        if (status === 'deleted' || status === 'archived') return false
        return !st?.read
      }).length
      setInboxCount(prev => {
        if (count > prev && prev > 0) {
          // New email arrived — flash title
          let flash = true
          const flashInterval = setInterval(() => {
            document.title = flash ? `(${count}) New email — FT Admin` : 'FT Admin'
            flash = !flash
          }, 1000)
          setTimeout(() => { clearInterval(flashInterval); document.title = count > 0 ? `(${count}) FT Admin` : 'FT Admin' }, 8000)
        }
        document.title = count > 0 ? `(${count}) FT Admin` : 'FT Admin'
        return count
      })
    } catch {}
  }, [])

  useEffect(() => {
    fetchInboxCount()
    const interval = setInterval(fetchInboxCount, 15000) // poll every 15s
    return () => { clearInterval(interval); document.title = 'FT Admin' }
  }, [fetchInboxCount])

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'waitlist', label: 'Waitlist' },
    { id: 'users', label: 'Users' },
    { id: 'statistics', label: 'Statistics' },
    { id: 'nicknames', label: 'Nickname Claims' },
    { id: 'hands', label: 'Shared Hands' },
    { id: 'inbox', label: 'Inbox', badge: inboxCount || null },
    { id: 'email', label: 'Email' },
    { id: 'blog', label: 'Blog' },
  ]

  const selectTab = (id) => { setActiveTab(id); setMenuOpen(false) }

  return (
    <div className="adm-shell">
      {/* Mobile top bar */}
      <div className="adm-mobile-bar">
        <span className="adm-mobile-bar-title">FT Admin</span>
        <button className="adm-hamburger" onClick={() => setMenuOpen(o => !o)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
      {menuOpen && <div className="adm-mobile-overlay" onClick={() => setMenuOpen(false)} />}
      <aside className={`adm-sidebar${menuOpen ? ' adm-sidebar-open' : ''}`}>
        <div className="adm-sidebar-logo">FT Admin</div>
        <nav className="adm-sidebar-nav">
          {tabs.map(t => (
            <button key={t.id} className={`adm-sidebar-item${activeTab === t.id ? ' active' : ''}`} onClick={() => selectTab(t.id)}>
              {t.label}
              {t.badge > 0 && <span className="adm-sidebar-badge">{t.badge}</span>}
            </button>
          ))}
        </nav>
        <button className="adm-sidebar-logout" onClick={handleLogout}>Log out</button>
      </aside>
      <main className="adm-main">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'waitlist' && <WaitlistTab />}
        {activeTab === 'users' && <AppUsersTab />}
        {activeTab === 'statistics' && <StatisticsTab />}
        {activeTab === 'nicknames' && <NicknameClaimsTab onToast={showToast} />}
        {activeTab === 'hands' && <SharedHandsTab />}
        {activeTab === 'inbox' && <InboxTab onToast={showToast} onMarkRead={() => setInboxCount(prev => Math.max(0, prev - 1))} />}
        {activeTab === 'email' && <EmailTab onToast={showToast} />}
        {activeTab === 'blog' && <BlogTab onToast={showToast} />}
      </main>
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} key={toast.key} />}
    </div>
  )
}

export default function AdminPage() {
  const [authState, setAuthState] = useState('loading')

  useEffect(() => {
    return onAuthChange(user => {
      if (user && ADMIN_EMAILS.includes(user.email)) setAuthState('authenticated')
      else setAuthState('unauthenticated')
    })
  }, [])

  if (authState === 'loading') return (
    <div className="adm-login-wrap">
      <div className="adm-login-card" style={{ textAlign: 'center' }}>
        <p style={{ color: '#888' }}>Checking authentication…</p>
      </div>
    </div>
  )

  if (authState === 'unauthenticated') return <LoginScreen onLogin={() => setAuthState('authenticated')} />
  return <Dashboard />
}
