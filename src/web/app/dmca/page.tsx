import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Legal, { LegalSection } from "@/components/Legal";

export const metadata = { title: "DMCA & Takedowns — Kivlo" };

export default function Page() {
  return (
    <>
      <Nav />
      <Legal
        title="Copyright & Takedowns"
        updated="November 23, 2026"
        intro="Kivlo is a clipping tool for people who have rights to the content they submit. If you're a rights holder and believe content on Kivlo infringes your copyright, here's how to reach us. We aim to respond within 24 hours."
      >
        <LegalSection title="1. Filing a takedown notice">
          <p>
            Email{" "}
            <a
              href="mailto:dmca@kivlo.com"
              className="font-semibold text-lime-deep underline-offset-4 hover:underline"
            >
              dmca@kivlo.com
            </a>{" "}
            with the subject line &quot;DMCA Takedown&quot; and include:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Your name and contact information</li>
            <li>A link or description of the original work you own</li>
            <li>The URL or identifying details of the infringing material on Kivlo</li>
            <li>
              A statement that you have a good-faith belief the use is not
              authorized by you, your agent, or the law
            </li>
            <li>
              A statement, under penalty of perjury, that the information in your
              notice is accurate and that you are the rights holder or
              authorized to act for them
            </li>
            <li>Your physical or electronic signature</li>
          </ul>
        </LegalSection>

        <LegalSection title="2. What happens next">
          <p>
            We review valid notices and aim to remove or disable access to the
            identified material within 24 hours. We notify the user who
            submitted the content and may share your notice with them.
          </p>
        </LegalSection>

        <LegalSection title="3. Counter-notices">
          <p>
            If your clip was removed and you believe it was a mistake — for
            example, you had permission or your use is lawful — you can reply
            with a counter-notice containing your contact info, identification
            of the removed material, a statement under penalty of perjury that
            the removal was a mistake, and consent to the jurisdiction of your
            local federal court.
          </p>
          <p>
            We may restore the material 10–14 business days after a valid
            counter-notice, unless the original complainant files a court
            action.
          </p>
        </LegalSection>

        <LegalSection title="4. Repeat infringers">
          <p>
            Accounts that repeatedly submit infringing content may be suspended
            or terminated.
          </p>
        </LegalSection>

        <LegalSection title="5. Misuse">
          <p>
            Knowingly filing a false takedown notice can carry legal liability
            under 17 U.S.C. § 512(f). Please only file for content you genuinely
            own.
          </p>
        </LegalSection>
      </Legal>
      <Footer />
    </>
  );
}
