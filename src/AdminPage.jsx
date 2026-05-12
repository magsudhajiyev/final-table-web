import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  getWaitlistUsers, getNicknameClaims,
  updateWaitlistUser, deleteWaitlistUser,
  updateNicknameClaim, deleteNicknameClaim,
  getContactSubmissions, updateContactSubmission, deleteContactSubmission,
  getSharedHands, deleteSharedHand,
  getEmailTemplates, saveEmailTemplate, updateEmailTemplate, deleteEmailTemplate,
  saveEmailLog, getEmailLogs
} from './lib/firebase'
import './AdminPage.css'

const ADMIN_PASS = '3vaolO5MfuVFn3qs'

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

async function sendResendEmail(to, { subject, html, templateId, variables } = {}) {
  const payload = { to }
  if (templateId) {
    payload.templateId = templateId
    if (variables) payload.variables = variables
    if (subject) payload.subject = subject
  } else {
    payload.subject = subject
    payload.html = html
  }
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
        <div className="adm-stat-card"><div className="adm-stat-value">{stats.waitlist}</div><div className="adm-stat-label">Waitlist</div></div>
        <div className="adm-stat-card"><div className="adm-stat-value">{stats.users}</div><div className="adm-stat-label">Users</div></div>
        <div className="adm-stat-card"><div className="adm-stat-value">{stats.contacts}</div><div className="adm-stat-label">Contacts</div></div>
        <div className="adm-stat-card"><div className="adm-stat-value">{stats.hands}</div><div className="adm-stat-label">Shared Hands</div></div>
        <div className="adm-stat-card adm-stat-highlight"><div className="adm-stat-value">{stats.signupsToday}</div><div className="adm-stat-label">Today</div></div>
        <div className="adm-stat-card adm-stat-highlight"><div className="adm-stat-value">{stats.signupsWeek}</div><div className="adm-stat-label">This week</div></div>
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
  { key: 'platform', label: 'Platform', type: 'select', options: ['', 'ios', 'android'] },
  { key: 'source', label: 'Source' },
]
const WAITLIST_CSV_COLS = [
  { key: 'email', label: 'Email' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'platform', label: 'Platform' },
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
              <th>#</th><th>Email</th><th>First Name</th><th>Last Name</th><th>Platform</th><th>Source</th>
              <SortableDate label="Date" sortOrder={fs.sortOrder} onToggle={() => fs.setSortOrder(s => s === 'desc' ? 'asc' : 'desc')} />
              <th></th>
            </tr>
          </thead>
          <tbody>
            {fs.filtered.map((u, i) => (
              <tr key={u.id} className={fs.selected.has(u.id) ? 'adm-row-selected' : ''}>
                <td className="adm-td-check"><input type="checkbox" checked={fs.selected.has(u.id)} onChange={() => fs.toggleSelect(u.id)} /></td>
                <td className="adm-td-num">{i + 1}</td>
                <td>{u.email}</td><td>{u.firstName || '—'}</td><td>{u.lastName || '—'}</td><td>{u.platform || '—'}</td><td>{u.source || '—'}</td>
                <td className="adm-td-date">{formatDate(u.timestamp)}</td>
                <td className="adm-td-actions"><RowMenu onEdit={() => setEditing(u)} onDelete={() => setDeleting(u)} /></td>
              </tr>
            ))}
            {!loading && fs.filtered.length === 0 && <tr><td colSpan="9" className="adm-empty">No entries found</td></tr>}
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

const USERS_FIELDS = [
  { key: 'nickname', label: 'Username' },
  { key: 'email', label: 'Email' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'platform', label: 'Platform', type: 'select', options: ['', 'ios', 'android'] },
  { key: 'status', label: 'Status', type: 'select', options: ['pending', 'approved', 'rejected'] },
]
const USERS_CSV_COLS = [
  { key: 'nickname', label: 'Username' },
  { key: 'email', label: 'Email' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'platform', label: 'Platform' },
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
      {editing && <EditModal title="Edit User" fields={USERS_FIELDS}
        initial={{ nickname: editing.nickname || '', email: editing.email || '', firstName: editing.firstName || '', lastName: editing.lastName || '', platform: editing.platform || '', status: editing.status || 'pending' }}
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
   EMAIL TAB
   ══════════════════════════════════════════════ */

const BUILTIN_TEMPLATES = [
  {
    id: '__welcome__',
    name: 'Welcome (Waitlist)',
    subject: 'Welcome to Final Table!',
    body: `<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="x-apple-disable-message-reformatting"><title>Welcome to Final Table</title><!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]--><style>@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap');body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}body{margin:0;padding:0;width:100%!important;height:100%!important}a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important}@media only screen and (max-width:620px){.email-container{width:100%!important;max-width:100%!important}.fluid{max-width:100%!important;height:auto!important}.stack-column{display:block!important;width:100%!important}.mobile-padding{padding-left:24px!important;padding-right:24px!important}}</style></head><body style="margin:0;padding:0;background-color:#F6F8F6;font-family:'Inter',Arial,Helvetica,sans-serif"><div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all">You're on the waitlist! Here's what's next for your poker game.</div><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#F6F8F6"><tr><td style="padding:40px 16px"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="680" align="center" class="email-container" style="max-width:680px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04)"><tr><td style="background:linear-gradient(90deg,#A2F69A,#E0FF96);height:4px;font-size:0;line-height:0">&nbsp;</td></tr><tr><td style="padding:40px 48px 24px" class="mobile-padding"><img src="https://finaltable.io/logo.png" alt="Final Table" width="90" style="display:block;width:90px;height:auto"></td></tr><tr><td style="padding:0 48px 16px" class="mobile-padding"><h1 style="margin:0;font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:32px;font-weight:700;line-height:1.15;color:#000000;letter-spacing:-0.01em">Final Table.</h1></td></tr><tr><td style="padding:0 48px 24px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#4B5563" class="mobile-padding"><p style="margin:0 0 16px">Hey, you took the first step toward becoming a better poker player. Wise choice, congratulations!</p><p style="margin:0 0 16px">We're building the best possible poker app for you to track your poker journey effortlessly, and Final Table is launching in the coming weeks.</p><p style="margin:0">We'd love to give you free, early access before anyone else, in exchange for your feedback. Our goal is to grow this app with you, and we always appreciate our users' honest input, because it's what shapes every feature we build.</p></td></tr><tr><td style="padding:0 48px" class="mobile-padding"><div style="border-top:1px solid #E5E7EB;margin:0"></div></td></tr><tr><td style="padding:24px 48px 8px" class="mobile-padding"><p style="margin:0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#000000;text-transform:uppercase;letter-spacing:0.06em">One quick thing</p></td></tr><tr><td style="padding:0 48px 24px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#4B5563" class="mobile-padding"><p style="margin:0 0 10px">Visit our page and let us know which platform you're using, <strong style="color:#000">iOS</strong> or <strong style="color:#000">Android</strong>, so we can get your access ready. It takes 10 seconds.</p><p style="margin:0;font-size:13px;color:#999">Ignore this if you've already selected your platform.</p></td></tr><tr><td style="padding:0 48px 32px" class="mobile-padding"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td style="border-radius:12px;background-color:#A2F69A"><a href="https://finaltable.io" target="_blank" style="display:inline-block;padding:14px 32px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;color:#000000;text-decoration:none;border-radius:12px;letter-spacing:-0.01em">Select Your Platform &rarr;</a></td></tr></table></td></tr><tr><td style="padding:0 48px" class="mobile-padding"><div style="border-top:1px solid #E5E7EB;margin:0"></div></td></tr><tr><td style="padding:28px 48px 8px" class="mobile-padding"><p style="margin:0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#000000;text-transform:uppercase;letter-spacing:0.06em">What you'll get</p></td></tr><tr><td style="padding:0 48px 32px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#4B5563" class="mobile-padding"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="padding:10px 0;vertical-align:top;width:28px"><span style="display:inline-block;width:20px;height:20px;background-color:#A2F69A;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:700;color:#000">&#10003;</span></td><td style="padding:10px 0 10px 8px;vertical-align:top;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#4B5563"><strong style="color:#000">Three-gesture logging</strong>: Log any action in three taps, fast enough to use one-handed between deals</td></tr><tr><td style="padding:10px 0;vertical-align:top;width:28px"><span style="display:inline-block;width:20px;height:20px;background-color:#A2F69A;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:700;color:#000">&#10003;</span></td><td style="padding:10px 0 10px 8px;vertical-align:top;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#4B5563"><strong style="color:#000">Opponent reads in real time</strong>: Get data-backed profiles on every player so you can make smarter decisions at the table</td></tr><tr><td style="padding:10px 0;vertical-align:top;width:28px"><span style="display:inline-block;width:20px;height:20px;background-color:#A2F69A;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:700;color:#000">&#10003;</span></td><td style="padding:10px 0 10px 8px;vertical-align:top;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#4B5563"><strong style="color:#000">Session + hand-level data</strong>: From quick session tracking to full hand-by-hand analysis</td></tr></table></td></tr><tr><td style="padding:8px 48px 32px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#4B5563" class="mobile-padding"><p style="margin:0">Thanks,<br><strong style="color:#000">Magsud &amp; Tural</strong></p></td></tr><tr><td style="background-color:#FAFAFA;padding:28px 48px;border-top:1px solid #E5E7EB" class="mobile-padding"><p style="margin:0 0 6px;font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:15px;font-weight:600;color:#999;font-style:italic;line-height:1.4">Log a hand in three gestures.<br>Not three minutes.</p><p style="margin:16px 0 0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:13px;color:#999;line-height:1.6">&copy; 2026 Final Table &middot; <a href="https://finaltable.io" style="color:#999;text-decoration:underline">finaltable.io</a><br>Questions? <a href="mailto:support@finaltable.app" style="color:#999;text-decoration:underline">support@finaltable.app</a></p></td></tr></table></td></tr></table></body></html>`,
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
      const [w, t, l] = await Promise.all([getWaitlistUsers(), getEmailTemplates(), getEmailLogs()])
      setWaitlistData(w)
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
    if (recipientSearch) {
      const q = recipientSearch.toLowerCase()
      items = items.filter(r =>
        (r.email || '').toLowerCase().includes(q) ||
        (r.firstName || '').toLowerCase().includes(q) ||
        (r.lastName || '').toLowerCase().includes(q)
      )
    }
    return items
  }, [waitlistData, platformFilter, recipientSearch])

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
        filters: { platform: platformFilter || 'all', search: recipientSearch || '' },
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
                <option value="unspecified">Unspecified</option>
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
                {templates.length === 0 && <tr><td colSpan="4" className="adm-empty">No templates saved yet</td></tr>}
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
   DASHBOARD SHELL
   ══════════════════════════════════════════════ */

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [toast, setToast] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => { sessionStorage.removeItem('admin_auth'); window.location.reload() }
  const showToast = useCallback((message, type) => setToast({ message, type, key: Date.now() }), [])

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'waitlist', label: 'Waitlist' },
    { id: 'users', label: 'Users' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'hands', label: 'Shared Hands' },
    { id: 'email', label: 'Email' },
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
        {activeTab === 'email' && <EmailTab onToast={showToast} />}
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
