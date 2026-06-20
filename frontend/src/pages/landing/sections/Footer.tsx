import { Link } from 'react-router-dom'
import { Share2, Github } from 'lucide-react'

const GITHUB_URL = 'https://github.com/the-coderbee/unified-social-api'

type FooterLink = { label: string; href: string; external?: boolean }

const footerLinks: Record<string, FooterLink[]> = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Platforms', href: '#platforms' },
    { label: 'Pricing', href: '#pricing' },
  ],
  Developers: [
    { label: 'Documentation', href: '/docs/introduction' },
    { label: 'Authentication', href: '/docs/authentication' },
    { label: 'Social Accounts', href: '/docs/social-accounts' },
    { label: 'Rate Limits', href: '/docs/rate-limits' },
  ],
  Account: [
    { label: 'Sign in', href: '/login' },
    { label: 'Get started', href: '/register' },
    { label: 'GitHub', href: GITHUB_URL, external: true },
  ],
}

function FooterLinkItem({ link }: { link: FooterLink }) {
  const className = 'text-sm text-text-secondary hover:text-text-primary transition-colors'

  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {link.label}
      </a>
    )
  }
  if (link.href.startsWith('#')) {
    return (
      <a href={link.href} className={className}>
        {link.label}
      </a>
    )
  }
  return (
    <Link to={link.href} className={className}>
      {link.label}
    </Link>
  )
}

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container-content py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-from to-accent-to flex items-center justify-center shrink-0">
                <Share2 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-sm">
                <span className="gradient-text">Unified</span>
                <span className="text-text-primary"> Social API</span>
              </span>
            </Link>
            <p className="text-sm text-text-tertiary leading-relaxed max-w-xs">
              One API to rule your entire social publishing pipeline. Post once, reach everywhere.
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-4">
                {group}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <FooterLinkItem link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-tertiary">
            © {new Date().getFullYear()} Unified Social API. MIT Licensed.
          </p>
          <div className="flex items-center gap-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-tertiary hover:text-text-secondary transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
