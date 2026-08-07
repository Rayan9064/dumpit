interface CheckoutUser {
  uid: string
  email?: string | null
}

export const getDodoCheckoutUrl = (user?: CheckoutUser | null): string => {
  const defaultUrl = process.env.NEXT_PUBLIC_DODOPAYMENTS_CHECKOUT_URL || 'https://checkout.dodopayments.com/buy/pro'
  try {
    const url = new URL(defaultUrl)
    url.searchParams.set('metadata.plan', 'pro')
    if (user) {
      url.searchParams.set('metadata.user_id', user.uid)
      if (user.email) {
        url.searchParams.set('customer_email', user.email)
      }
    }
    return url.toString()
  } catch {
    return defaultUrl
  }
}
