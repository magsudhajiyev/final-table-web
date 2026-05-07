import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  getWaitlistUsers, getNicknameClaims,
  updateWaitlistUser, deleteWaitlistUser,
  updateNicknameClaim, deleteNicknameClaim,
  getContactSubmissions, updateContactSubmission, deleteContactSubmission,
  getSharedHands, deleteSharedHand
} from './lib/firebase'
import './AdminPage.css'

const ADMIN_PASS = '3vaolO5MfuVFn3qs'
const RESEND_KEY = 're_bRkyHuAB_ETTrnThUYfzcx8y1XaoijwGk'

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

async function sendResendEmail(to, subject, body) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Final Table <onboarding@resend.dev>', to: [to], subject, html: body })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

/* ══════════════════════════════════════════════
   SHARED COMPONENTS
   ══════════════════════════════════════════════ */

function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)
  const handleSubmit = (e) => {
    e.preventDefault()
    if (pw === ADMIN_PASS) { sessionStorage.setItem('admin_auth', '1'); onLogin() }
    else { setError(true); setPw('') }
  }
  return (
    <div className="adm-login-wrap">
      <form className="adm-login-card" onSubmit={handleSubmit}>
        <h1 className="adm-login-title">Admin</h1>
        <input className="adm-login-input" type="password" placeholder="Password" value={pw}
          onChange={e => { setPw(e.target.value); setError(false) }} autoFocus />
        {error && <p className="adm-login-error">Wrong password</p>}
        <button className="adm-login-btn" type="submit">Log in</button>
      </form>
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
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])
  return (
    <div className="adm-menu-wrap" ref={ref}>
      <button className="adm-menu-trigger" onClick={() => setOpen(o => !o)}>⋮</button>
      {open && (
        <div className="adm-menu-dropdown">
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
      await sendResendEmail(to, subject, body)
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

function useFilterSort(data, textKeys, statusKey) {
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
      items = items.filter(r => r.timestamp && r.timestamp >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo); to.setHours(23, 59, 59, 999)
      items = items.filter(r => r.timestamp && r.timestamp <= to)
    }
    if (statusFilter && statusKey) {
      items = items.filter(r => (r[statusKey] || '') === statusFilter)
    }
    items.sort((a, b) => {
      const ta = a.timestamp ? a.timestamp.getTime() : 0
      const tb = b.timestamp ? b.timestamp.getTime() : 0
      return sortOrder === 'desc' ? tb - ta : ta - tb
    })
    return items
  }, [data, search, dateFrom, dateTo, statusFilter, sortOrder, textKeys, statusKey])

  // Clear selection when data changes
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
        const [w, u, c, h] = await Promise.all([getWaitlistUsers(), getNicknameClaims(), getContactSubmissions(), getSharedHands()])
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 7)

        const signupsToday = w.filter(r => r.timestamp && r.timestamp >= todayStart).length
        const signupsWeek = w.filter(r => r.timestamp && r.timestamp >= weekStart).length

        // Last 30 days chart data
        const days = []
        for (let i = 29; i >= 0; i--) {
          const d = new Date(todayStart); d.setDate(d.getDate() - i)
          const next = new Date(d); next.setDate(next.getDate() + 1)
          const count = w.filter(r => r.timestamp && r.timestamp >= d && r.timestamp < next).length
          days.push({ label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count })
        }
        const maxCount = Math.max(...days.map(d => d.count), 1)

        setStats({ waitlist: w.length, users: u.length, contacts: c.length, hands: h.length, signupsToday, signupsWeek, days, maxCount })
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
        <div className="adm-stat-card">
          <div className="adm-stat-value">{stats.waitlist}</div>
          <div className="adm-stat-label">Waitlist</div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-value">{stats.users}</div>
          <div className="adm-stat-label">Users</div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-value">{stats.contacts}</div>
          <div className="adm-stat-label">Contacts</div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-value">{stats.hands}</div>
          <div className="adm-stat-label">Shared Hands</div>
        </div>
        <div className="adm-stat-card adm-stat-highlight">
          <div className="adm-stat-value">{stats.signupsToday}</div>
          <div className="adm-stat-label">Today</div>
        </div>
        <div className="adm-stat-card adm-stat-highlight">
          <div className="adm-stat-value">{stats.signupsWeek}</div>
          <div className="adm-stat-label">This week</div>
        </div>
      </div>
      <div className="adm-chart-section">
        <h2 className="adm-chart-title">Waitlist signups — last 30 days</h2>
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
  { key: 'source', label: 'Source' },
]
const WAITLIST_CSV_COLS = [
  { key: 'email', label: 'Email' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'source', label: 'Source' },
  { label: 'Date', get: r => r.timestamp ? r.timestamp.toISOString() : '' },
]

function WaitlistTab() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try { setData(await getWaitlistUsers()) } catch (err) { console.error(err) }
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
      {fs.selected.size > 0 && <BulkBar count={fs.selected.size} onDeleteAll={handleBulkDelete} />}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th className="adm-th-check"><input type="checkbox" checked={fs.selected.size === fs.filtered.length && fs.filtered.length > 0} onChange={fs.toggleAll} /></th>
              <th>#</th><th>Email</th><th>First Name</th><th>Last Name</th><th>Source</th>
              <SortableDate label="Date" sortOrder={fs.sortOrder} onToggle={() => fs.setSortOrder(s => s === 'desc' ? 'asc' : 'desc')} />
              <th></th>
            </tr>
          </thead>
          <tbody>
            {fs.filtered.map((u, i) => (
              <tr key={u.id} className={fs.selected.has(u.id) ? 'adm-row-selected' : ''}>
                <td className="adm-td-check"><input type="checkbox" checked={fs.selected.has(u.id)} onChange={() => fs.toggleSelect(u.id)} /></td>
                <td className="adm-td-num">{i + 1}</td>
                <td>{u.email}</td><td>{u.firstName || '—'}</td><td>{u.lastName || '—'}</td><td>{u.source || '—'}</td>
                <td className="adm-td-date">{formatDate(u.timestamp)}</td>
                <td className="adm-td-actions"><RowMenu onEdit={() => setEditing(u)} onDelete={() => setDeleting(u)} /></td>
              </tr>
            ))}
            {!loading && fs.filtered.length === 0 && <tr><td colSpan="8" className="adm-empty">No entries found</td></tr>}
          </tbody>
        </table>
      </div>
      {editing && <EditModal title="Edit Waitlist Entry" fields={WAITLIST_FIELDS}
        initial={{ email: editing.email, firstName: editing.firstName, lastName: editing.lastName, source: editing.source }}
        onSave={async v => { await updateWaitlistUser(editing.id, v); await fetchData() }} onClose={() => setEditing(null)} />}
      {deleting && <DeleteConfirm label={deleting.email}
        onConfirm={async () => { await deleteWaitlistUser(deleting.id); await fetchData() }} onClose={() => setDeleting(null)} />}
    </>
  )
}

/* ══════════════════════════════════════════════
   USERS TAB
   ══════════════════════════════════════════════ */

const USERS_FIELDS = [
  { key: 'nickname', label: 'Username' },
  { key: 'email', label: 'Email' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'status', label: 'Status', type: 'select', options: ['pending', 'approved', 'rejected'] },
]
const USERS_CSV_COLS = [
  { key: 'nickname', label: 'Username' },
  { key: 'email', label: 'Email' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'status', label: 'Status' },
  { label: 'Date', get: r => r.timestamp ? r.timestamp.toISOString() : '' },
]

function UsersTab({ onToast }) {
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
        <h1 className="adm-page-title">Users</h1>
        <div className="adm-header-right">
          <span className="adm-count">{fs.filtered.length} of {data.length}</span>
          <button className="adm-refresh-btn" onClick={() => exportCSV(fs.filtered, 'users.csv', USERS_CSV_COLS)}>Export CSV</button>
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
              <th>#</th><th>Username</th><th>Email</th><th>First Name</th><th>Last Name</th><th>Status</th>
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
                <td><span className={`adm-status adm-status-${u.status || 'pending'}`}>{u.status || 'pending'}</span></td>
                <td className="adm-td-date">{formatDate(u.timestamp)}</td>
                <td className="adm-td-actions">
                  <RowMenu onEdit={() => setEditing(u)} onDelete={() => setDeleting(u)}
                    extraItems={[{ label: 'Send Email', onClick: () => setEmailing(u.email) }]} />
                </td>
              </tr>
            ))}
            {!loading && fs.filtered.length === 0 && <tr><td colSpan="9" className="adm-empty">No entries found</td></tr>}
          </tbody>
        </table>
      </div>
      {editing && <EditModal title="Edit User" fields={USERS_FIELDS}
        initial={{ nickname: editing.nickname, email: editing.email, firstName: editing.firstName, lastName: editing.lastName, status: editing.status || 'pending' }}
        onSave={async v => { await updateNicknameClaim(editing.id, v); await fetchData() }} onClose={() => setEditing(null)} />}
      {deleting && <DeleteConfirm label={`@${deleting.nickname}`}
        onConfirm={async () => { await deleteNicknameClaim(deleting.id); await fetchData() }} onClose={() => setDeleting(null)} />}
      {emailing && <EmailModal to={emailing} onClose={() => setEmailing(null)} onToast={onToast} />}
    </>
  )
}

/* ══════════════════════════════════════════════
   CONTACTS TAB
   ══════════════════════════════════════════════ */

const CONTACTS_FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'message', label: 'Message', type: 'textarea' },
  { key: 'status', label: 'Status', type: 'select', options: ['new', 'read', 'replied'] },
]
const CONTACTS_CSV_COLS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'message', label: 'Message' },
  { key: 'status', label: 'Status' },
  { label: 'Date', get: r => r.timestamp ? r.timestamp.toISOString() : '' },
]

function ContactsTab() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [viewing, setViewing] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try { setData(await getContactSubmissions()) } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchData() }, [fetchData])

  const fs = useFilterSort(data, ['name', 'email', 'message'], 'status')

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${fs.selected.size} entries?`)) return
    await Promise.all([...fs.selected].map(id => deleteContactSubmission(id)))
    await fetchData()
  }
  const handleBulkMarkRead = async () => {
    await Promise.all([...fs.selected].map(id => updateContactSubmission(id, { status: 'read' })))
    await fetchData()
  }

  return (
    <>
      <div className="adm-header">
        <h1 className="adm-page-title">Contacts</h1>
        <div className="adm-header-right">
          <span className="adm-count">{fs.filtered.length} of {data.length}</span>
          <button className="adm-refresh-btn" onClick={() => exportCSV(fs.filtered, 'contacts.csv', CONTACTS_CSV_COLS)}>Export CSV</button>
          <button className="adm-refresh-btn" onClick={fetchData} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button>
        </div>
      </div>
      <SearchBar search={fs.search} onSearch={fs.setSearch} dateFrom={fs.dateFrom} dateTo={fs.dateTo}
        onDateFrom={fs.setDateFrom} onDateTo={fs.setDateTo}
        statusFilter={fs.statusFilter} statusOptions={['new', 'read', 'replied']} onStatusFilter={fs.setStatusFilter} />
      {fs.selected.size > 0 && (
        <BulkBar count={fs.selected.size} onDeleteAll={handleBulkDelete} extraActions={
          <button className="adm-bulk-action" onClick={handleBulkMarkRead}>Mark as Read</button>
        } />
      )}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th className="adm-th-check"><input type="checkbox" checked={fs.selected.size === fs.filtered.length && fs.filtered.length > 0} onChange={fs.toggleAll} /></th>
              <th>#</th><th>Name</th><th>Email</th><th>Message</th><th>Status</th>
              <SortableDate label="Date" sortOrder={fs.sortOrder} onToggle={() => fs.setSortOrder(s => s === 'desc' ? 'asc' : 'desc')} />
              <th></th>
            </tr>
          </thead>
          <tbody>
            {fs.filtered.map((c, i) => (
              <tr key={c.id} className={fs.selected.has(c.id) ? 'adm-row-selected' : ''}>
                <td className="adm-td-check"><input type="checkbox" checked={fs.selected.has(c.id)} onChange={() => fs.toggleSelect(c.id)} /></td>
                <td className="adm-td-num">{i + 1}</td>
                <td>{c.name || '—'}</td><td>{c.email}</td>
                <td className="adm-td-message">{(c.message || '').slice(0, 60)}{(c.message || '').length > 60 ? '...' : ''}</td>
                <td><span className={`adm-status adm-status-${c.status || 'new'}`}>{c.status || 'new'}</span></td>
                <td className="adm-td-date">{formatDate(c.timestamp)}</td>
                <td className="adm-td-actions">
                  <RowMenu onEdit={() => setEditing(c)} onDelete={() => setDeleting(c)}
                    extraItems={[{ label: 'View', onClick: () => setViewing(c) }]} />
                </td>
              </tr>
            ))}
            {!loading && fs.filtered.length === 0 && <tr><td colSpan="8" className="adm-empty">No entries found</td></tr>}
          </tbody>
        </table>
      </div>
      {viewing && (
        <ViewModal title={`Message from ${viewing.name || viewing.email}`} onClose={() => setViewing(null)}
          content={<><p><strong>From:</strong> {viewing.name} ({viewing.email})</p><p><strong>Date:</strong> {formatDate(viewing.timestamp)}</p><hr className="adm-view-hr" /><p className="adm-view-message">{viewing.message}</p></>} />
      )}
      {editing && <EditModal title="Edit Contact" fields={CONTACTS_FIELDS}
        initial={{ name: editing.name, email: editing.email, message: editing.message, status: editing.status || 'new' }}
        onSave={async v => { await updateContactSubmission(editing.id, v); await fetchData() }} onClose={() => setEditing(null)} />}
      {deleting && <DeleteConfirm label={deleting.email}
        onConfirm={async () => { await deleteContactSubmission(deleting.id); await fetchData() }} onClose={() => setDeleting(null)} />}
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
   DASHBOARD SHELL
   ══════════════════════════════════════════════ */

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [toast, setToast] = useState(null)

  const handleLogout = () => { sessionStorage.removeItem('admin_auth'); window.location.reload() }
  const showToast = useCallback((message, type) => setToast({ message, type, key: Date.now() }), [])

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'waitlist', label: 'Waitlist' },
    { id: 'users', label: 'Users' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'hands', label: 'Shared Hands' },
  ]

  return (
    <div className="adm-shell">
      <aside className="adm-sidebar">
        <div className="adm-sidebar-logo">FT Admin</div>
        <nav className="adm-sidebar-nav">
          {tabs.map(t => (
            <button key={t.id} className={`adm-sidebar-item${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
        <button className="adm-sidebar-logout" onClick={handleLogout}>Log out</button>
      </aside>
      <main className="adm-main">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'waitlist' && <WaitlistTab />}
        {activeTab === 'users' && <UsersTab onToast={showToast} />}
        {activeTab === 'contacts' && <ContactsTab />}
        {activeTab === 'hands' && <SharedHandsTab />}
      </main>
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} key={toast.key} />}
    </div>
  )
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_auth') === '1')
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />
  return <Dashboard />
}
