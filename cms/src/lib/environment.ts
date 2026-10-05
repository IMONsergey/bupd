export const comparison = process.env.BAEV_COMPARISON !== '0'
export const siteOrigin = () => comparison && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
export function isolatedDatabaseURL(value:string|undefined){if(!value||!comparison)return value;const url=new URL(value);url.pathname='/baev_public_v3';return url.href}
