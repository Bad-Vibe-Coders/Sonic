import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button, Card } from './ui'
import Icon from './Icon'
import { submitLead } from '../lib/api'

const inputCls = 'w-full rounded-lg border border-hairline bg-surface px-3.5 py-2.5 text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-ai-to/40'

export function LeadFormModal({ open, onClose, source = 'enterprise' }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    setError(null)
    try {
      await submitLead({ name, email, company, message, source })
      setStatus('sent')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  function handleClose() {
    onClose()
    setTimeout(() => { setStatus('idle'); setName(''); setEmail(''); setCompany(''); setMessage('') }, 200)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card className="p-7 relative">
              <button onClick={handleClose} aria-label="Close" className="absolute top-5 right-5 text-muted hover:text-ink"><Icon name="X" size={18} /></button>

              {status === 'sent' ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-4"><Icon name="Check" size={22} /></div>
                  <h3 className="text-[18px] font-semibold text-ink">Thanks — we&rsquo;ll be in touch.</h3>
                  <p className="text-[14px] text-muted mt-2">Our team usually responds within one business day.</p>
                  <Button onClick={handleClose} variant="secondary" className="mt-6">Close</Button>
                </div>
              ) : (
                <>
                  <h3 className="text-[18px] font-semibold text-ink mb-1">Talk to sales</h3>
                  <p className="text-[14px] text-muted mb-5">Tell us about your team and we&rsquo;ll follow up.</p>
                  <form onSubmit={onSubmit} className="space-y-3">
                    <input required className={inputCls} placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
                    <input required type="email" className={inputCls} placeholder="Work email" value={email} onChange={e => setEmail(e.target.value)} />
                    <input className={inputCls} placeholder="Company (optional)" value={company} onChange={e => setCompany(e.target.value)} />
                    <textarea className={`${inputCls} min-h-[88px] resize-none`} placeholder="What are you looking to solve? (optional)" value={message} onChange={e => setMessage(e.target.value)} />
                    {status === 'error' && <p className="text-[13px] text-error">{error}</p>}
                    <Button type="submit" disabled={status === 'sending'} className="w-full">
                      {status === 'sending' ? 'Sending…' : 'Send'}
                    </Button>
                  </form>
                </>
              )}
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
