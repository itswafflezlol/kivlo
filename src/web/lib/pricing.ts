export interface Plan {
  id: string;
  name: string;
  monthly: number;
  yearlyPerMonth: number;
  yearlyTotal: number;
  credits: number;
  features: string[];
  cta: string;
  href: string;
  popular?: boolean;
}

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    yearlyPerMonth: 0,
    yearlyTotal: 0,
    credits: 3,
    features: [
      "Up to 1 hour of video a month",
      "Highlights, crop, captions",
      "KivloWorkspace editor",
      "Kivlo watermark",
      "Download and post yourself",
    ],
    cta: "Start Free",
    href: "/signup",
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 12,
    yearlyPerMonth: 8,
    yearlyTotal: 96,
    credits: 30,
    features: [
      "Up to 10 hours of video a month",
      "No watermark",
      "Presets",
      "Titles, hashtags, posting times",
      "1 social account",
      "Scheduling + auto-post*",
    ],
    cta: "Choose Pro",
    href: "/signup?plan=pro",
  },
  {
    id: "creator",
    name: "Creator",
    monthly: 25,
    yearlyPerMonth: 16,
    yearlyTotal: 192,
    credits: 70,
    features: [
      "Up to 23 hours of video a month",
      "Everything in Pro",
      "3 social accounts",
    ],
    cta: "Choose Creator",
    href: "/signup?plan=creator",
    popular: true,
  },
  {
    id: "agency",
    name: "Agency",
    monthly: 50,
    yearlyPerMonth: 32,
    yearlyTotal: 384,
    credits: 150,
    features: [
      "Up to 50 hours of video a month",
      "Everything in Creator",
      "Unlimited social accounts",
      "3 team seats (coming soon)",
    ],
    cta: "Choose Agency",
    href: "/signup?plan=agency",
  },
];

export const pricingFootnote =
  "*Auto-posting turns on platform by platform as each one approves Kivlo. Until then, Kivlo reminds you and you post in one tap. 1 credit = up to 20 minutes of video.";
