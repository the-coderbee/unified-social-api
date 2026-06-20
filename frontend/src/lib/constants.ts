export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    REFRESH: '/api/v1/auth/refresh',
    LOGOUT: '/api/v1/auth/logout',
    GOOGLE_LOGIN: '/api/v1/auth/google/login',
    GITHUB_LOGIN: '/api/v1/auth/github/login',
  },
  USERS: {
    ME: '/api/v1/users/me',
  },
  SOCIAL: {
    ACCOUNTS: '/api/v1/social/accounts',
    LOGIN: (platform: string) => `/api/v1/social/login/${platform}`,
    LINK: (platform: string) => `/api/v1/social/${platform}/link`,
    UNLINK: (platform: string) => `/api/v1/social/${platform}/unlink`,
  },
  API_KEYS: {
    LIST: '/api/v1/api-keys/all',
    CREATE: '/api/v1/api-keys/new',
    REVOKE: (id: string) => `/api/v1/api-keys/${id}/revoke`,
  },
}

export const DASHBOARD_PLATFORMS = [
  { id: 'x', name: 'X (Twitter)', color: '#e7e9ea', available: true },
  { id: 'discord', name: 'Discord', color: '#5865f2', available: true },
  { id: 'mastodon', name: 'Mastodon', color: '#6364ff', available: true },
  { id: 'linkedin', name: 'LinkedIn', color: '#0a66c2', available: true },
] as const

// Mastodon is federated — each instance is a separate OAuth app on the backend.
// Each supported instance renders as its own Platforms-page card.
export const MASTODON_INSTANCES = [
  { domain: 'mastodon.social', label: 'mastodon.social' },
  { domain: 'defcon.social', label: 'defcon.social' },
] as const

export const API_KEY_SCOPES = [
  { value: 'posts:write', label: 'Posts — Write', description: 'Create and publish posts' },
  { value: 'posts:read', label: 'Posts — Read', description: 'List and read post history' },
  { value: 'platforms:read', label: 'Platforms — Read', description: 'View connected social accounts' },
  { value: 'keys:read', label: 'Keys — Read', description: 'List API key metadata' },
] as const

export const NAV_LINKS = [
  { label: 'Features', href: '#features', isRoute: false },
  { label: 'Platforms', href: '#platforms', isRoute: false },
  { label: 'How It Works', href: '#how-it-works', isRoute: false },
  { label: 'Pricing', href: '#pricing', isRoute: false },
  { label: 'Docs', href: '/docs', isRoute: true },
] as const

export const PLATFORMS = [
  {
    id: 'x',
    name: 'X (Twitter)',
    description: 'Post tweets and threads directly to your timeline with full API support.',
    status: 'available' as const,
    color: '#e7e9ea',
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Publish messages to channels and servers via secure OAuth linking.',
    status: 'available' as const,
    color: '#5865f2',
  },
  {
    id: 'mastodon',
    name: 'Mastodon',
    description: 'Publish to the open, federated social web across multiple Mastodon instances.',
    status: 'available' as const,
    color: '#6364ff',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Share content with your professional network and company pages.',
    status: 'available' as const,
    color: '#0a66c2',
  },
] as const

export type PlatformStatus = 'available' | 'coming_soon'

export const FEATURES = [
  {
    id: 'concurrent',
    icon: 'Zap',
    title: 'Concurrent Publishing',
    description: 'All platforms post simultaneously via async workers. Zero serialization overhead — your content lands everywhere at once.',
  },
  {
    id: 'retry',
    icon: 'RefreshCw',
    title: 'Smart Retry',
    description: 'Failed platforms are retried individually. No re-submitting content that already succeeded. Partial failures handled gracefully.',
  },
  {
    id: 'oauth',
    icon: 'Shield',
    title: 'OAuth2 PKCE Security',
    description: 'Industry-standard PKCE flow protects every platform handshake. No credentials ever stored in plain text.',
  },
  {
    id: 'token-refresh',
    icon: 'RotateCcw',
    title: 'Automatic Token Refresh',
    description: "Platform tokens refresh silently in the background. Your posts never fail because of expired credentials.",
  },
  {
    id: 'filtering',
    icon: 'SlidersHorizontal',
    title: 'Advanced Filtering',
    description: 'Filter posts by date range, platform, and status. Slice your publishing history exactly the way you need it.',
  },
  {
    id: 'api-keys',
    icon: 'Key',
    title: 'API Key Management',
    description: 'Generate scoped API keys for server-to-server integrations. Revoke any time with immediate effect.',
  },
] as const

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Connect Your Accounts',
    description: 'Link your social accounts using OAuth2 PKCE. Tokens are stored securely and refreshed automatically — you link once, we handle the rest.',
    icon: 'Link',
  },
  {
    step: 2,
    title: 'Compose Your Post',
    description: 'Send a single POST request with your content and the platforms you want to reach. Add platform-specific options if you need them.',
    icon: 'FileText',
  },
  {
    step: 3,
    title: 'Publish Everywhere',
    description: 'Unified API publishes to all platforms concurrently. Get a detailed result per platform with URLs to each published post.',
    icon: 'Send',
  },
] as const

export const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: 0 as number | null,
    period: 'forever' as string | null,
    description: 'Perfect for indie projects and personal use.',
    features: [
      '2 connected platforms',
      '50 posts / month',
      'Basic post filtering',
      'Email/password auth',
      'Community support',
    ],
    cta: 'Start for free',
    ctaHref: '/register',
    recommended: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19 as number | null,
    period: 'month' as string | null,
    description: 'For teams shipping content at scale.',
    features: [
      'All platforms',
      'Unlimited posts',
      'Advanced filters + date ranges',
      'API key management',
      'Google & GitHub OAuth',
      'Smart retry on failures',
      'Priority support',
    ],
    cta: 'Start with Pro',
    ctaHref: '/register',
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null as number | null,
    period: null as string | null,
    description: 'Custom SLAs, dedicated infrastructure, and white-glove support.',
    features: [
      'Everything in Pro',
      'Custom rate limits',
      'SSO / SAML',
      'Dedicated infrastructure',
      'SLA guarantees',
      'On-premise option',
    ],
    cta: 'Contact us',
    ctaHref: '/register',
    recommended: false,
  },
] as const

export const API_EXAMPLE_REQUEST = `POST /api/v1/posts/ HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
  "content": "Just shipped v2. Async publishing,
              retry logic, PKCE auth — all in one.",
  "platforms": ["discord", "x"]
}`

export const API_EXAMPLE_RESPONSE = `HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "SUCCESS",
  "results": [
    {
      "platform_name": "discord",
      "status": "SUCCESS",
      "post_url": "https://discord.com/channels/..."
    },
    {
      "platform_name": "x",
      "status": "SUCCESS",
      "post_url": "https://x.com/user/status/..."
    }
  ]
}`
