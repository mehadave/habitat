import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../store/uiStore'
import { DolphinLogo } from '../components/DolphinLogo'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="h-px w-full mb-5" style={{ background: 'var(--divider)' }} />
      <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-1)' }}>{title}</h2>
      <div className="text-sm leading-relaxed space-y-2.5" style={{ color: 'var(--text-2)' }}>
        {children}
      </div>
    </div>
  )
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 pl-1">
      <span style={{ color: '#38BDF8', flexShrink: 0, marginTop: 3, fontSize: 16, lineHeight: 1 }}>·</span>
      <span>{children}</span>
    </div>
  )
}

export default function TermsOfUse() {
  const navigate = useNavigate()
  const { darkMode } = useUIStore()

  return (
    <div className="app-bg min-h-screen" style={{ paddingBottom: 60 }}>
      {/* Sticky header */}
      <div
        className="sticky top-0 z-40 flex items-center gap-3 px-4 py-4"
        style={{
          background: darkMode ? 'rgba(6,8,24,0.92)' : 'rgba(240,244,255,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <DolphinLogo size={28} />
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#38BDF8' }}>Habit·at</p>
          <h1 className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Terms of Use</h1>
        </div>
      </div>

      <div className="px-4 pt-6 pb-10 max-w-lg mx-auto">
        {/* Single document card */}
        <div className="rounded-3xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

          {/* Document header */}
          <div className="px-6 pt-6 pb-5"
            style={{
              background: darkMode
                ? 'linear-gradient(135deg, rgba(37,99,235,0.18), rgba(56,189,248,0.08))'
                : 'linear-gradient(135deg, rgba(37,99,235,0.07), rgba(147,197,253,0.12))',
              borderBottom: '1px solid var(--border)',
            }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: '#38BDF8' }}>Legal</p>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-1)' }}>Terms of Use</h2>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>
              Effective: May 6, 2026 · Last updated: May 6, 2026
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">

            {/* Intro */}
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
              Welcome to Habit·at. By creating an account or using the app, you agree to these Terms of Use. Please read them — they're written to be clear, not confusing.
            </p>

            <Section title="1. Acceptance of Terms">
              <p>By accessing or using Habit·at (the "App"), you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree, do not use the App.</p>
              <p>You must be at least 13 years old to use Habit·at. By using the App, you confirm that you meet this requirement.</p>
            </Section>

            <Section title="2. Your Account">
              <p>You are responsible for:</p>
              <div className="space-y-1.5 mt-1">
                <Li>Maintaining the confidentiality of your login credentials.</Li>
                <Li>All activity that occurs under your account.</Li>
                <Li>Providing accurate information when creating your account.</Li>
                <Li>Notifying us immediately if you suspect unauthorised access.</Li>
              </div>
              <p>You may only have one account. Creating multiple accounts to circumvent any restrictions is not permitted.</p>
            </Section>

            <Section title="3. What You Can Do">
              <p>Habit·at grants you a personal, non-exclusive, non-transferable licence to use the App for your own private, non-commercial habit tracking purposes. You may:</p>
              <div className="space-y-1.5 mt-1">
                <Li>Create and track personal habits and journal entries.</Li>
                <Li>Use the App on your personal devices.</Li>
                <Li>Access your data from multiple devices using the same account.</Li>
              </div>
            </Section>

            <Section title="4. What You Cannot Do">
              <p>You agree not to:</p>
              <div className="space-y-1.5 mt-1">
                <Li>Use the App for any unlawful purpose or in violation of any applicable laws.</Li>
                <Li>Attempt to gain unauthorised access to any part of the App or its infrastructure.</Li>
                <Li>Reverse engineer, decompile, or disassemble the App.</Li>
                <Li>Scrape, harvest, or collect data from the App through automated means.</Li>
                <Li>Use the App to harass, harm, or impersonate others.</Li>
                <Li>Interfere with the security, performance, or integrity of the App.</Li>
                <Li>Resell, sublicence, or commercially exploit the App without our written permission.</Li>
              </div>
            </Section>

            <Section title="5. Your Content">
              <p>You retain ownership of the content you create in Habit·at — your habit names, descriptions, and journal entries ("Your Content").</p>
              <p>By using the App, you grant us a limited licence to store and process Your Content solely to provide the App's features to you. We do not claim any ownership over Your Content and do not use it for any other purpose.</p>
              <p>You are responsible for ensuring Your Content does not violate any applicable laws or third-party rights.</p>
            </Section>

            <Section title="6. Intellectual Property">
              <p>All rights in the App — including the name Habit·at, the dolphin logo, design, code, and all original content we create — are owned by us or our licensors and are protected by applicable intellectual property laws.</p>
              <p>These Terms do not grant you any rights to use our trademarks, logos, or brand assets without our prior written permission.</p>
            </Section>

            <Section title="7. Disclaimers">
              <p>Habit·at is provided <strong style={{ color: 'var(--text-1)' }}>"as is"</strong> and <strong style={{ color: 'var(--text-1)' }}>"as available"</strong> without warranties of any kind, either express or implied.</p>
              <p>We do not warrant that:</p>
              <div className="space-y-1.5 mt-1">
                <Li>The App will be uninterrupted, error-free, or secure at all times.</Li>
                <Li>Any defects or errors will be corrected.</Li>
                <Li>The App is free from viruses or other harmful components.</Li>
              </div>
              <p>Habit·at is a productivity tool — it is not a medical, therapeutic, or clinical application. Do not rely on it for health decisions.</p>
            </Section>

            <Section title="8. Limitation of Liability">
              <p>To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of (or inability to use) the App, including loss of data or profits.</p>
              <p>Our total liability to you for any claims arising from these Terms or your use of the App shall not exceed the amount you paid us in the 12 months preceding the claim (or $10 USD if you have not paid anything).</p>
            </Section>

            <Section title="9. Termination">
              <p>You may stop using Habit·at and delete your account at any time from the Me → Danger Zone section of the App.</p>
              <p>We reserve the right to suspend or terminate your access to the App if you violate these Terms, with or without notice.</p>
              <p>Upon termination, your licence to use the App ends immediately. Sections relating to intellectual property, disclaimers, limitation of liability, and governing law survive termination.</p>
            </Section>

            <Section title="10. Changes to These Terms">
              <p>We may update these Terms from time to time. When we make material changes, we'll notify you in the App and update the "Last updated" date above. Your continued use of Habit·at after changes take effect constitutes acceptance of the updated Terms.</p>
            </Section>

            <Section title="11. Governing Law">
              <p>These Terms are governed by the laws of the State of California, United States, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of California.</p>
            </Section>

            <Section title="12. Contact Us">
              <p>Questions about these Terms?</p>
              <a
                href="mailto:davemeha60@gmail.com"
                className="inline-flex items-center gap-2 mt-1 text-sm font-semibold"
                style={{ color: '#38BDF8', textDecoration: 'none' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                davemeha60@gmail.com
              </a>
            </Section>

          </div>
        </div>

        <p className="text-[10px] text-center mt-4" style={{ color: 'var(--text-3)' }}>
          Habit·at v1.0.0 · Made with 💙
        </p>
      </div>
    </div>
  )
}
