import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Legal, { LegalSection } from "@/components/Legal";

export const metadata = { title: "Privacy Policy — Kivlo" };

export default function Page() {
  return (
    <>
      <Nav />
      <Legal
        title="Privacy Policy"
        updated="November 23, 2026"
        intro="This policy explains what Kivlo collects, why, and what you can do about it."
      >
        <LegalSection title="1. What we collect">
          <p>
            <strong className="text-ink">Account info.</strong> Your name, email
            address, and sign-in method (email/password or a connected provider
            like Google).
          </p>
          <p>
            <strong className="text-ink">Content you submit.</strong> Video
            links and uploaded files, plus the transcripts, clips, titles, and
            hashtags generated from them.
          </p>
          <p>
            <strong className="text-ink">Billing info.</strong> Handled by
            Stripe. We see your plan, billing cycle, and payment status — never
            your full card number.
          </p>
          <p>
            <strong className="text-ink">Usage data.</strong> How you use the
            app (pages visited, features used, credits spent), device and
            browser info, and logs needed to keep the service secure and fix
            bugs.
          </p>
        </LegalSection>

        <LegalSection title="2. How we use it">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Process your videos and generate clips</li>
            <li>Run your subscription, credits, and billing</li>
            <li>Send service emails (receipts, clip-ready notices, security alerts)</li>
            <li>Improve features and fix problems</li>
            <li>Enforce our terms and prevent abuse</li>
          </ul>
          <p>
            We do not sell your personal information, and we do not use your
            videos or clips to train AI models.
          </p>
        </LegalSection>

        <LegalSection title="3. How long we keep it">
          <p>
            Source videos you submit are deleted within 48 hours of processing.
            Your finished clips, transcripts, and projects stay until you delete
            them or close your account. Account and billing records are kept as
            long as needed for legal and tax requirements.
          </p>
        </LegalSection>

        <LegalSection title="4. Who we share it with">
          <p>Only the services needed to run Kivlo, including:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Stripe (payments)</li>
            <li>Supabase (accounts and database)</li>
            <li>Cloudflare (storage, DNS, security)</li>
            <li>Transcription and AI providers (to process your videos)</li>
            <li>Email delivery (Resend)</li>
            <li>Error monitoring and analytics (Sentry, PostHog)</li>
          </ul>
          <p>
            Social platforms only receive content when you choose to publish or
            schedule it. We may also share data if required by law.
          </p>
        </LegalSection>

        <LegalSection title="5. Your choices">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Export or delete your clips and projects at any time</li>
            <li>Close your account to delete your data (subject to legal holds)</li>
            <li>Opt out of non-essential emails</li>
            <li>
              Contact us at{" "}
              <a
                href="mailto:privacy@kivlo.com"
                className="font-semibold text-lime-deep underline-offset-4 hover:underline"
              >
                privacy@kivlo.com
              </a>{" "}
              for access, correction, or deletion requests
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="6. Security">
          <p>
            We use encryption in transit, access controls, and hosted
            infrastructure with its own security programs. No method is 100%
            secure, but we&apos;ll tell you promptly if a breach affects your
            data.
          </p>
        </LegalSection>

        <LegalSection title="7. Changes">
          <p>
            If this policy changes materially, we&apos;ll notify you by email or
            in the app before it takes effect.
          </p>
        </LegalSection>
      </Legal>
      <Footer />
    </>
  );
}
