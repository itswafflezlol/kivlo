import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Legal, { LegalSection } from "@/components/Legal";

export const metadata = { title: "Terms of Service — Kivlo" };

export default function Page() {
  return (
    <>
      <Nav />
      <Legal
        title="Terms of Service"
        updated="November 23, 2026"
        intro="These terms govern your use of Kivlo, the clip-editing service operated by Kivlo. By creating an account or using the service, you agree to them."
      >
        <LegalSection title="1. What Kivlo does">
          <p>
            Kivlo lets you submit links to public videos (or upload files you
            have the rights to), finds engaging moments in them, and helps you
            turn those moments into vertical clips with captions, titles, and
            hashtags. You can edit everything in KivloWorkspace and download or
            schedule the results.
          </p>
        </LegalSection>

        <LegalSection title="2. Your content and your responsibility">
          <p>
            <strong className="text-ink">
              You are solely responsible for having the rights to every video
              you submit.
            </strong>{" "}
            By submitting a link or file, you confirm that you own the content,
            have the creator&apos;s permission, or are otherwise authorized to
            clip it.
          </p>
          <p>
            Kivlo only processes publicly available videos. We will reject links
            that require a login, payment, membership, or age verification to
            view. Do not submit private, paywalled, or members-only content.
          </p>
          <p>
            Kivlo is a clipping tool, not a downloader. Do not use it to rip,
            archive, or redistribute full videos.
          </p>
        </LegalSection>

        <LegalSection title="3. Accounts and plans">
          <p>
            You must be at least 13 years old (or the age of digital consent in
            your country) to use Kivlo. Keep your login details private — you
            are responsible for activity on your account.
          </p>
          <p>
            Kivlo offers a free plan and paid subscriptions (Pro, Creator,
            Agency). Features and limits for each plan are shown on the pricing
            page and may change with notice.
          </p>
        </LegalSection>

        <LegalSection title="4. Credits">
          <p>
            Processing is measured in credits: 1 credit covers up to 20 minutes
            of source video, and longer videos cost more credits (rounded up to
            the nearest 20-minute block). Credits reset at the start of each
            billing cycle and do not roll over.
          </p>
        </LegalSection>

        <LegalSection title="5. Billing">
          <p>
            Paid plans are billed through Stripe on a monthly or yearly cycle.
            Prices are shown before you subscribe and taxes may apply based on
            your location.
          </p>
          <p>
            Upgrades take effect immediately and are prorated. Downgrades and
            cancellations take effect at the end of your current billing cycle —
            you keep paid access until then.
          </p>
          <p>
            If a payment fails, your subscription enters a 3-day grace period.
            After that, your account moves to the free plan, and after 7 further
            days it may be suspended. You can re-subscribe at any time.
          </p>
        </LegalSection>

        <LegalSection title="6. Free plan watermark">
          <p>
            Clips exported on the free plan include a Kivlo watermark. Removing
            or obscuring the watermark without upgrading violates these terms.
          </p>
        </LegalSection>

        <LegalSection title="7. Your clips and our retention">
          <p>
            You own the clips you export. Source videos you submit are stored
            temporarily (up to 48 hours) so you can re-edit them, then deleted.
            Finished clips and transcripts are kept until you delete them or
            close your account.
          </p>
        </LegalSection>

        <LegalSection title="8. Scheduling and posting">
          <p>
            Kivlo can schedule posts and, where a platform allows it, publish
            through official platform APIs. We never ask for your social media
            passwords and never post through automated logins. You are
            responsible for what you publish and for following each
            platform&apos;s rules.
          </p>
        </LegalSection>

        <LegalSection title="9. Takedowns">
          <p>
            We honor takedown requests from rights holders, targeting a response
            within 24 hours. See our{" "}
            <a
              href="/dmca"
              className="font-semibold text-lime-deep underline-offset-4 hover:underline"
            >
              DMCA page
            </a>{" "}
            for how to file one.
          </p>
        </LegalSection>

        <LegalSection title="10. What you can't do">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Submit content you don&apos;t have the rights to clip</li>
            <li>Scrape, resell, or reverse-engineer the service</li>
            <li>Use Kivlo to harass, defame, or deceive</li>
            <li>Upload malware or attempt to overload the service</li>
            <li>Misrepresent exported clips as endorsements by the people in them</li>
          </ul>
        </LegalSection>

        <LegalSection title="11. Disclaimers and liability">
          <p>
            Kivlo is provided &quot;as is.&quot; We work hard to keep it fast
            and reliable, but we can&apos;t guarantee uninterrupted service,
            perfect clip selections, or specific results (like view counts) on
            social platforms.
          </p>
          <p>
            To the extent allowed by law, Kivlo&apos;s total liability to you is
            limited to the amount you paid us in the 12 months before the claim,
            or $50 if you&apos;re on the free plan.
          </p>
        </LegalSection>

        <LegalSection title="12. Changes">
          <p>
            We may update these terms. If a change is material, we&apos;ll
            notify you by email or in the app before it takes effect. Continuing
            to use Kivlo after that means you accept the new terms.
          </p>
        </LegalSection>
      </Legal>
      <Footer />
    </>
  );
}
