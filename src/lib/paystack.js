// Paystack inline checkout helper (card + Mobile Money).
// The PUBLIC key is safe in the browser by design — it's what inline checkout
// uses. The secret key is never referenced here.
//
// We load the inline script on demand (no render-blocking <script> in index.html,
// no layout shift) and cache the load promise so it only loads once.

const PAYSTACK_SRC = 'https://js.paystack.co/v1/inline.js'
let loadPromise = null

function loadPaystack() {
  if (typeof window !== 'undefined' && window.PaystackPop) return Promise.resolve()
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${PAYSTACK_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Paystack')))
      return
    }
    const script = document.createElement('script')
    script.src = PAYSTACK_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      loadPromise = null // allow a later retry
      reject(new Error('Failed to load Paystack'))
    }
    document.body.appendChild(script)
  })
  return loadPromise
}

/**
 * Open Paystack inline checkout.
 * @param {object} opts
 * @param {string} opts.email        Customer email (required by Paystack)
 * @param {number} opts.amountGhs    Amount in GH₵ (converted to pesewas here)
 * @param {string} opts.reference    Unique transaction reference (booking ref)
 * @param {object} [opts.metadata]   Extra data attached to the transaction
 * @param {function} opts.onSuccess  Called with the Paystack response on success
 * @param {function} [opts.onClose]  Called if the customer closes the modal
 */
export async function payWithPaystack({ email, amountGhs, reference, metadata = {}, onSuccess, onClose }) {
  const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
  if (!key || key.includes('your-paystack')) {
    throw new Error('Paystack public key is not configured')
  }
  if (!email) throw new Error('A valid email is required for payment')

  await loadPaystack()

  const handler = window.PaystackPop.setup({
    key,
    email,
    amount: Math.round(Number(amountGhs) * 100), // GH₵ → pesewas
    currency: 'GHS',
    ref: reference,
    channels: ['card', 'mobile_money'],
    metadata,
    callback: (response) => {
      // Paystack calls this synchronously from its iframe context.
      if (onSuccess) onSuccess(response)
    },
    onClose: () => {
      if (onClose) onClose()
    },
  })

  handler.openIframe()
}
