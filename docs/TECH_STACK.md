# Tech Stack

The services, tools, and APIs Kivlo needs. Costs are what the founder has planned; see `docs/BUDGET.md` for the full cost math.

## Services

| Service | Purpose | Monthly | Yearly |
|---|---|---|---|
| Stripe | Payments | $0 + fees | $0 + fees |
| Supabase Pro | Database and authentication | $25 | $300 |
| Sylant VPS | Hosting and AI processing | Existing plan | Existing plan |
| Cloudflare | DNS and security | $0 | $0 |
| Cloudflare R2 | Video storage | Usage-based | Usage-based |
| GitHub | Source control | $0 | $0 |
| Resend | Emails | $0 at first | $0 at first |
| FFmpeg | Video editing and rendering | $0 | $0 |
| Whisper | Transcription and captions | Usage-based | Usage-based |
| AI API | AI clipping and analysis | Usage-based | Usage-based |

## AI MCP servers

| MCP server | Purpose | Cost |
|---|---|---|
| GitHub MCP | Code and repositories | Free |
| Supabase MCP | Database management | Free |
| Cloudflare MCP | Infrastructure and storage | Free |
| Stripe MCP | Payments | Free |
| Upstash MCP | Queues and Redis | Free |
| Sentry MCP | Error monitoring | Free |
| PostHog MCP | Analytics | Free |
| Context7 MCP | Documentation lookup | Free |
| Playwright MCP | Browser automation and testing | Free |
| Filesystem MCP | File access | Free |
| Fetch MCP | Web content retrieval | Free |
| Memory MCP | Persistent AI context | Free |

MCP servers may be free software, but some connected services or hosted APIs charge for usage. Only install the MCPs the development AI supports and needs. Every MCP gets a SkillSpector scan before install.

## External APIs

- YouTube API
- TikTok API
- Instagram / Meta API
- X API
- Whop and other campaign marketplace integrations
- OAuth for connecting social accounts

## Fixed monthly cost

| Expense | Monthly | Yearly |
|---|---|---|
| Supabase Pro | $25 | $300 |
| Cloudflare | $0 | $0 |
| GitHub | $0 | $0 |
| Resend | $0 | $0 |
| FFmpeg | $0 | $0 |
| MCP servers | $0 | $0 |
| **Total** | **$25** | **$300** |

Additional costs: Sylant VPS, video storage, AI processing, transcription, and Stripe transaction fees.
