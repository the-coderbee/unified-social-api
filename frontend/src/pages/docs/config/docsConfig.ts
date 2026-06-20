import { lazy } from 'react'

export type HttpMethod = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT'

export interface DocParam {
  name: string
  type: string
  required: boolean
  location: 'body' | 'path' | 'query' | 'header'
  description: string
}

export interface DocStatusCode {
  code: number
  description: string
}

export interface DocEndpoint {
  id: string
  title: string
  method: HttpMethod
  path: string
  description: string
  authRequired: boolean
  params?: DocParam[]
  requestExample?: string
  responseExample?: string
  statusCodes: DocStatusCode[]
}

export interface DocAnchor {
  id: string
  label: string
  type: 'endpoint' | 'concept'
}

export interface DocSection {
  slug: string
  title: string
  description: string
  icon: string
  anchors: DocAnchor[]
  component: React.LazyExoticComponent<React.ComponentType>
}

// ─── Authentication Endpoints ──────────────────────────────────────────────

export const authEndpoints: DocEndpoint[] = [
  {
    id: 'register',
    title: 'Register',
    method: 'POST',
    path: '/api/v1/auth/register',
    description:
      'Create a new user account with an email address and password. Returns the created user profile. Passwords must be between 8 and 128 characters.',
    authRequired: false,
    params: [
      { name: 'email', type: 'string', required: true, location: 'body', description: 'Valid email address. Must be unique across all accounts.' },
      { name: 'password', type: 'string', required: true, location: 'body', description: 'Password between 8 and 128 characters.' },
      { name: 'is_active', type: 'boolean', required: false, location: 'body', description: 'Account active status. Defaults to true.' },
    ],
    requestExample: `{
  "email": "user@example.com",
  "password": "supersecret123"
}`,
    responseExample: `{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "user@example.com",
  "is_active": true,
  "auth_provider": "local",
  "social_accounts": []
}`,
    statusCodes: [
      { code: 201, description: 'User created successfully.' },
      { code: 400, description: 'User with this email already exists.' },
      { code: 422, description: 'Validation error — invalid email or password too short/long.' },
      { code: 500, description: 'Internal server error.' },
    ],
  },
  {
    id: 'login',
    title: 'Login',
    method: 'POST',
    path: '/api/v1/auth/login',
    description:
      'Authenticate with email and password using OAuth2 Password Grant form encoding. Returns access and refresh tokens. The access token expires in 20 minutes; the refresh token in 7 days.',
    authRequired: false,
    params: [
      { name: 'username', type: 'string', required: true, location: 'body', description: 'The user\'s email address (OAuth2 form field name is `username`).' },
      { name: 'password', type: 'string', required: true, location: 'body', description: 'The user\'s password.' },
    ],
    requestExample: `Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=supersecret123`,
    responseExample: `{
  "access_token": "eyJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}`,
    statusCodes: [
      { code: 200, description: 'Login successful. Returns token pair.' },
      { code: 401, description: 'Invalid email or password.' },
      { code: 422, description: 'Validation error — missing required fields.' },
    ],
  },
  {
    id: 'refresh',
    title: 'Refresh Token',
    method: 'POST',
    path: '/api/v1/auth/refresh',
    description:
      'Exchange a valid refresh token for a new access/refresh token pair. The old refresh token is invalidated. Use this before the access token expires to maintain a seamless session.',
    authRequired: false,
    params: [
      { name: 'refresh_token', type: 'string', required: true, location: 'body', description: 'A valid, non-expired refresh token.' },
    ],
    requestExample: `{
  "refresh_token": "eyJhbGciOiJIUzI1NiJ9..."
}`,
    responseExample: `{
  "access_token": "eyJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}`,
    statusCodes: [
      { code: 200, description: 'New token pair issued.' },
      { code: 401, description: 'Refresh token is invalid or expired.' },
    ],
  },
  {
    id: 'logout',
    title: 'Logout',
    method: 'POST',
    path: '/api/v1/auth/logout',
    description:
      'Revoke a refresh token to invalidate the session. After calling this endpoint, the provided refresh token can no longer be used to obtain new access tokens.',
    authRequired: false,
    params: [
      { name: 'refresh_token', type: 'string', required: true, location: 'body', description: 'The refresh token to revoke.' },
    ],
    requestExample: `{
  "refresh_token": "eyJhbGciOiJIUzI1NiJ9..."
}`,
    responseExample: `{
  "detail": "Successfully logged out"
}`,
    statusCodes: [
      { code: 200, description: 'Session revoked successfully.' },
      { code: 401, description: 'Token is already invalid or expired.' },
    ],
  },
  {
    id: 'google-login',
    title: 'Google OAuth — Initialize',
    method: 'GET',
    path: '/api/v1/auth/google/login',
    description:
      'Generate a Google OAuth2 authorization URL with a PKCE state parameter. Redirect the user to the returned `authorization_url` to begin the OAuth flow. The `state` value is stored server-side for 5 minutes.',
    authRequired: false,
    responseExample: `{
  "authorization_url": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "state": "random-csrf-state-token"
}`,
    statusCodes: [
      { code: 200, description: 'Authorization URL generated.' },
      { code: 500, description: 'OAuth provider misconfiguration.' },
    ],
  },
  {
    id: 'google-callback',
    title: 'Google OAuth — Callback',
    method: 'GET',
    path: '/api/v1/auth/google/callback',
    description:
      'Handle the OAuth2 callback from Google. Validates the state parameter, exchanges the code for tokens, and returns a JWT token pair for the authenticated user. If the user does not exist, a new account is created.',
    authRequired: false,
    params: [
      { name: 'code', type: 'string', required: true, location: 'query', description: 'Authorization code from Google\'s redirect.' },
      { name: 'state', type: 'string', required: true, location: 'query', description: 'CSRF state token from the initialize step.' },
    ],
    responseExample: `{
  "access_token": "eyJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}`,
    statusCodes: [
      { code: 200, description: 'OAuth login successful.' },
      { code: 400, description: 'Invalid or expired state, or email not retrieved from provider.' },
      { code: 500, description: 'Internal server error.' },
    ],
  },
  {
    id: 'github-login',
    title: 'GitHub OAuth — Initialize',
    method: 'GET',
    path: '/api/v1/auth/github/login',
    description:
      'Generate a GitHub OAuth2 authorization URL. Redirect the user to the returned `authorization_url`. Follows the same PKCE state pattern as Google OAuth.',
    authRequired: false,
    responseExample: `{
  "authorization_url": "https://github.com/login/oauth/authorize?...",
  "state": "random-csrf-state-token"
}`,
    statusCodes: [
      { code: 200, description: 'Authorization URL generated.' },
      { code: 500, description: 'OAuth provider misconfiguration.' },
    ],
  },
  {
    id: 'github-callback',
    title: 'GitHub OAuth — Callback',
    method: 'GET',
    path: '/api/v1/auth/github/callback',
    description:
      'Handle the OAuth2 callback from GitHub. Validates state, exchanges code for tokens, and returns a JWT pair. New users are auto-registered on first login.',
    authRequired: false,
    params: [
      { name: 'code', type: 'string', required: true, location: 'query', description: 'Authorization code from GitHub\'s redirect.' },
      { name: 'state', type: 'string', required: true, location: 'query', description: 'CSRF state token from the initialize step.' },
    ],
    responseExample: `{
  "access_token": "eyJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}`,
    statusCodes: [
      { code: 200, description: 'OAuth login successful.' },
      { code: 400, description: 'Invalid or expired state, or email not retrieved from provider.' },
      { code: 500, description: 'Internal server error.' },
    ],
  },
]

// ─── Posts Endpoints ────────────────────────────────────────────────────────

export const postsEndpoints: DocEndpoint[] = [
  {
    id: 'create-post',
    title: 'Create Post',
    method: 'POST',
    path: '/api/v1/posts/',
    description:
      'Publish content to one or more connected social platforms simultaneously. The API uses async workers to post to all platforms concurrently. Platforms you have not connected are listed in `not_connected_platforms` — they are skipped, not treated as errors.',
    authRequired: true,
    params: [
      { name: 'content', type: 'string', required: true, location: 'body', description: 'The text content to publish. Platform-specific character limits apply.' },
      { name: 'platforms', type: 'string[]', required: true, location: 'body', description: 'Array of platform identifiers to publish to. Valid values: "discord", "x".' },
      { name: 'options', type: 'object', required: false, location: 'body', description: 'Platform-specific options (e.g., channel ID for Discord).' },
    ],
    requestExample: `{
  "content": "Just shipped v2. Async publishing, retry logic, PKCE auth — all in one.",
  "platforms": ["discord", "x"]
}`,
    responseExample: `{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "content": "Just shipped v2...",
  "status": "partial_success",
  "created_at": "2024-01-15T10:30:00Z",
  "results": [
    {
      "platform_name": "discord",
      "status": "success",
      "post_url": "https://discord.com/channels/...",
      "error_message": null
    },
    {
      "platform_name": "x",
      "status": "failed",
      "post_url": null,
      "error_message": "Rate limit exceeded"
    }
  ],
  "not_connected_platforms": []
}`,
    statusCodes: [
      { code: 200, description: 'Post created. Check `status` field — may be `success`, `partial_success`, or `failed`.' },
      { code: 401, description: 'Missing or invalid access token.' },
      { code: 500, description: 'Internal server error.' },
    ],
  },
  {
    id: 'list-posts',
    title: 'List Posts',
    method: 'GET',
    path: '/api/v1/posts/',
    description:
      'Retrieve the authenticated user\'s post history, ordered by most recent. Filter by status to show only successful, failed, or partially successful posts.',
    authRequired: true,
    params: [
      { name: 'status', type: 'string', required: false, location: 'query', description: 'Filter by post status. One of: "success", "failed", "partial_success".' },
    ],
    responseExample: `[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "content": "Just shipped v2...",
    "status": "success",
    "created_at": "2024-01-15T10:30:00Z",
    "results": [
      {
        "platform_name": "discord",
        "status": "success",
        "post_url": "https://discord.com/channels/...",
        "error_message": null
      }
    ],
    "not_connected_platforms": ["x"]
  }
]`,
    statusCodes: [
      { code: 200, description: 'Array of posts. Empty array if none found.' },
      { code: 401, description: 'Missing or invalid access token.' },
    ],
  },
  {
    id: 'retry-post',
    title: 'Retry Post',
    method: 'POST',
    path: '/api/v1/posts/{post_id}/retry',
    description:
      'Retry publishing for platforms that failed in a previous post. Only the failed platform results are re-attempted — successful platforms are not re-posted. You cannot retry a post that was fully successful.',
    authRequired: true,
    params: [
      { name: 'post_id', type: 'uuid', required: true, location: 'path', description: 'The UUID of the post to retry.' },
    ],
    responseExample: `{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "content": "Just shipped v2...",
  "status": "success",
  "created_at": "2024-01-15T10:30:00Z",
  "results": [
    {
      "platform_name": "x",
      "status": "success",
      "post_url": "https://x.com/user/status/...",
      "error_message": null
    }
  ],
  "not_connected_platforms": []
}`,
    statusCodes: [
      { code: 200, description: 'Retry attempted. Check `status` for result.' },
      { code: 400, description: 'Post already fully successful — cannot retry.' },
      { code: 401, description: 'Missing or invalid access token.' },
      { code: 404, description: 'Post not found.' },
    ],
  },
  {
    id: 'get-post',
    title: 'Get Post',
    method: 'GET',
    path: '/api/v1/posts/{post_id}',
    description:
      'Fetch a single post and its per-platform results by ID.',
    authRequired: true,
    params: [
      { name: 'post_id', type: 'uuid', required: true, location: 'path', description: 'The UUID of the post to retrieve.' },
    ],
    responseExample: `{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "content": "Just shipped v2...",
  "status": "success",
  "created_at": "2024-01-15T10:30:00Z",
  "results": [...],
  "not_connected_platforms": []
}`,
    statusCodes: [
      { code: 200, description: 'Post found.' },
      { code: 401, description: 'Missing or invalid access token.' },
      { code: 404, description: 'Post not found or does not belong to the authenticated user.' },
    ],
  },
]

// ─── Social Accounts Endpoints ──────────────────────────────────────────────

export const socialEndpoints: DocEndpoint[] = [
  {
    id: 'get-login-url',
    title: 'Get Platform Login URL',
    method: 'GET',
    path: '/api/v1/social/login/{platform_name}',
    description:
      'Generate an OAuth2 authorization URL for linking a social platform to the authenticated user\'s account. Supported platforms: `discord`, `x`. Redirect the user to the returned `auth_url`.',
    authRequired: false,
    params: [
      { name: 'platform_name', type: 'string', required: true, location: 'path', description: 'Platform identifier. One of: "discord", "x".' },
    ],
    responseExample: `{
  "auth_url": "https://discord.com/api/oauth2/authorize?...",
  "state": "random-csrf-state-token"
}`,
    statusCodes: [
      { code: 200, description: 'Authorization URL generated.' },
      { code: 404, description: 'Platform not supported.' },
      { code: 500, description: 'Internal server error.' },
    ],
  },
  {
    id: 'link-account',
    title: 'Link Social Account',
    method: 'POST',
    path: '/api/v1/social/{platform_name}/link',
    description:
      'Complete the OAuth2 flow by exchanging the code and state for an access token, then link the social account to the authenticated user. This endpoint is called from the OAuth callback page.',
    authRequired: true,
    params: [
      { name: 'platform_name', type: 'string', required: true, location: 'path', description: 'Platform identifier. One of: "discord", "x".' },
      { name: 'code', type: 'string', required: true, location: 'body', description: 'Authorization code from the platform OAuth redirect.' },
      { name: 'state', type: 'string', required: true, location: 'body', description: 'CSRF state token from the initialize step.' },
    ],
    requestExample: `{
  "code": "oauth-authorization-code",
  "state": "random-csrf-state-token"
}`,
    responseExample: `{
  "platform": "discord",
  "provider_account_id": "123456789012345678",
  "username": "theuser",
  "global_name": "The User",
  "avatar_url": "https://cdn.discordapp.com/avatars/...",
  "created_at": "2024-01-15T10:30:00Z"
}`,
    statusCodes: [
      { code: 200, description: 'Account linked successfully.' },
      { code: 400, description: 'Invalid or expired state, or missing access token.' },
      { code: 401, description: 'Missing or invalid user access token.' },
      { code: 404, description: 'Platform not supported, or no account ID returned from platform.' },
    ],
  },
  {
    id: 'unlink-account',
    title: 'Unlink Social Account',
    method: 'DELETE',
    path: '/api/v1/social/{platform_name}/unlink',
    description:
      'Remove a linked social account from the authenticated user. After unlinking, publishing to that platform will fail until re-linked.',
    authRequired: true,
    params: [
      { name: 'platform_name', type: 'string', required: true, location: 'path', description: 'Platform identifier to unlink. One of: "discord", "x".' },
    ],
    statusCodes: [
      { code: 204, description: 'Account unlinked successfully. No response body.' },
      { code: 401, description: 'Missing or invalid access token.' },
      { code: 404, description: 'No linked account found for this platform.' },
    ],
  },
  {
    id: 'list-accounts',
    title: 'List Connected Accounts',
    method: 'GET',
    path: '/api/v1/social/accounts',
    description:
      'Retrieve all social platform accounts currently linked to the authenticated user.',
    authRequired: true,
    responseExample: `[
  {
    "platform": "discord",
    "provider_account_id": "123456789012345678",
    "username": "theuser",
    "global_name": "The User",
    "avatar_url": "https://cdn.discordapp.com/avatars/...",
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "platform": "x",
    "provider_account_id": "987654321",
    "username": "theuser_x",
    "global_name": null,
    "avatar_url": "https://pbs.twimg.com/profile_images/...",
    "created_at": "2024-01-10T08:00:00Z"
  }
]`,
    statusCodes: [
      { code: 200, description: 'Array of linked accounts. Empty array if none.' },
      { code: 401, description: 'Missing or invalid access token.' },
    ],
  },
]

// ─── API Keys Endpoints ─────────────────────────────────────────────────────

export const apiKeysEndpoints: DocEndpoint[] = [
  {
    id: 'create-key',
    title: 'Create API Key',
    method: 'POST',
    path: '/api/v1/api-keys/new',
    description:
      'Generate a new scoped API key. The full key value is returned **only once** in `api_key` — store it immediately. Subsequent reads return only the `key_prefix` for identification.',
    authRequired: true,
    params: [
      { name: 'name', type: 'string', required: true, location: 'body', description: 'A descriptive label for the key (e.g., "Production Server").' },
      { name: 'scopes', type: 'string[]', required: true, location: 'body', description: 'Array of permission scopes. Valid values: "posts:write", "posts:read", "platforms:read", "keys:read".' },
    ],
    requestExample: `{
  "name": "Production Server",
  "scopes": ["posts:write", "posts:read"]
}`,
    responseExample: `{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Production Server",
  "scopes": ["posts:write", "posts:read"],
  "api_key": "sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "created_at": "2024-01-15T10:30:00Z"
}`,
    statusCodes: [
      { code: 201, description: 'API key created. The `api_key` field will not be shown again.' },
      { code: 401, description: 'Missing or invalid access token.' },
      { code: 422, description: 'Validation error — invalid scope values or missing name.' },
    ],
  },
  {
    id: 'list-keys',
    title: 'List API Keys',
    method: 'GET',
    path: '/api/v1/api-keys/all',
    description:
      'List all API keys belonging to the authenticated user. The full key value is never returned after creation — only the `key_prefix` is shown for identification.',
    authRequired: true,
    responseExample: `[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Production Server",
    "scopes": ["posts:write", "posts:read"],
    "key_prefix": "sk_live_xxxx",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
]`,
    statusCodes: [
      { code: 200, description: 'Array of API keys. Empty array if none exist.' },
      { code: 401, description: 'Missing or invalid access token.' },
    ],
  },
  {
    id: 'revoke-key',
    title: 'Revoke API Key',
    method: 'PATCH',
    path: '/api/v1/api-keys/{api_key_id}/revoke',
    description:
      'Permanently revoke an API key. Revocation takes effect immediately — any in-flight requests using this key will be rejected. This action cannot be undone.',
    authRequired: true,
    params: [
      { name: 'api_key_id', type: 'uuid', required: true, location: 'path', description: 'The UUID of the API key to revoke.' },
    ],
    statusCodes: [
      { code: 204, description: 'Key revoked. No response body.' },
      { code: 400, description: 'Revocation failed.' },
      { code: 401, description: 'Missing or invalid access token.' },
      { code: 403, description: 'API key does not belong to the authenticated user.' },
      { code: 404, description: 'API key not found.' },
    ],
  },
]

// ─── Users Endpoints ────────────────────────────────────────────────────────

export const usersEndpoints: DocEndpoint[] = [
  {
    id: 'get-current-user',
    title: 'Get Current User',
    method: 'GET',
    path: '/api/v1/users/me',
    description:
      'Retrieve the profile of the currently authenticated user, including their linked social accounts. Use this endpoint to display user info or check which platforms are connected.',
    authRequired: true,
    responseExample: `{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "user@example.com",
  "is_active": true,
  "auth_provider": "local",
  "social_accounts": [
    {
      "platform": "discord",
      "provider_account_id": "123456789012345678",
      "username": "theuser",
      "global_name": "The User",
      "avatar_url": "https://cdn.discordapp.com/avatars/...",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}`,
    statusCodes: [
      { code: 200, description: 'User profile returned.' },
      { code: 401, description: 'Missing or invalid access token.' },
    ],
  },
]

// ─── Sections Config ────────────────────────────────────────────────────────

export const docsSections: DocSection[] = [
  {
    slug: 'introduction',
    title: 'Introduction',
    description: 'Overview, quickstart guide, and base API information',
    icon: 'BookOpen',
    anchors: [
      { id: 'overview', label: 'Overview', type: 'concept' },
      { id: 'quickstart', label: 'Quickstart', type: 'concept' },
      { id: 'base-url', label: 'Base URL', type: 'concept' },
      { id: 'authentication-header', label: 'Authentication', type: 'concept' },
    ],
    component: lazy(() => import('../sections/IntroductionSection')),
  },
  {
    slug: 'authentication',
    title: 'Authentication',
    description: 'Register, login, OAuth2 flows, and token management',
    icon: 'Shield',
    anchors: [
      { id: 'register', label: 'Register', type: 'endpoint' },
      { id: 'login', label: 'Login', type: 'endpoint' },
      { id: 'refresh', label: 'Refresh Token', type: 'endpoint' },
      { id: 'logout', label: 'Logout', type: 'endpoint' },
      { id: 'google-login', label: 'Google OAuth', type: 'endpoint' },
      { id: 'google-callback', label: 'Google Callback', type: 'endpoint' },
      { id: 'github-login', label: 'GitHub OAuth', type: 'endpoint' },
      { id: 'github-callback', label: 'GitHub Callback', type: 'endpoint' },
    ],
    component: lazy(() => import('../sections/AuthenticationSection')),
  },
  {
    slug: 'posts',
    title: 'Posts API',
    description: 'Create, list, and retry posts across social platforms',
    icon: 'Send',
    anchors: [
      { id: 'create-post', label: 'Create Post', type: 'endpoint' },
      { id: 'list-posts', label: 'List Posts', type: 'endpoint' },
      { id: 'retry-post', label: 'Retry Post', type: 'endpoint' },
      { id: 'get-post', label: 'Get Post', type: 'endpoint' },
    ],
    component: lazy(() => import('../sections/PostsApiSection')),
  },
  {
    slug: 'social-accounts',
    title: 'Social Accounts',
    description: 'Link and manage social platform connections via OAuth2',
    icon: 'Link',
    anchors: [
      { id: 'get-login-url', label: 'Get Login URL', type: 'endpoint' },
      { id: 'link-account', label: 'Link Account', type: 'endpoint' },
      { id: 'unlink-account', label: 'Unlink Account', type: 'endpoint' },
      { id: 'list-accounts', label: 'List Accounts', type: 'endpoint' },
    ],
    component: lazy(() => import('../sections/SocialAccountsSection')),
  },
  {
    slug: 'api-keys',
    title: 'API Keys',
    description: 'Generate and manage scoped API keys for server-to-server access',
    icon: 'Key',
    anchors: [
      { id: 'create-key', label: 'Create Key', type: 'endpoint' },
      { id: 'list-keys', label: 'List Keys', type: 'endpoint' },
      { id: 'revoke-key', label: 'Revoke Key', type: 'endpoint' },
    ],
    component: lazy(() => import('../sections/ApiKeysSection')),
  },
  {
    slug: 'users',
    title: 'Users',
    description: 'Fetch the authenticated user profile and linked accounts',
    icon: 'User',
    anchors: [
      { id: 'get-current-user', label: 'Get Current User', type: 'endpoint' },
    ],
    component: lazy(() => import('../sections/UsersSection')),
  },
  {
    slug: 'rate-limits',
    title: 'Rate Limits & Errors',
    description: 'Rate limiting policies, error codes, and environment setup',
    icon: 'AlertTriangle',
    anchors: [
      { id: 'rate-limits-overview', label: 'Rate Limits', type: 'concept' },
      { id: 'error-codes', label: 'Error Codes', type: 'concept' },
      { id: 'environment-config', label: 'Environment Config', type: 'concept' },
    ],
    component: lazy(() => import('../sections/RateLimitsSection')),
  },
]
