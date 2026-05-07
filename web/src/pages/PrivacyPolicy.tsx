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

export default function PrivacyPolicy() {
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
          <h1 className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Privacy Policy</h1>
        </div>
      </div>

      <div className="px-3 sm:px-4 pt-6 pb-10 max-w-lg mx-auto w-full">
        {/* Single document card */}
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

          {/* Document header */}
          <div className="px-4 sm:px-6 pt-5 pb-4 sm:pt-6 sm:pb-5"
            style={{
              background: darkMode
                ? 'linear-gradient(135deg, rgba(37,99,235,0.18), rgba(56,189,248,0.08))'
                : 'linear-gradient(135deg, rgba(37,99,235,0.07), rgba(147,197,253,0.12))',
              borderBottom: '1px solid var(--border)',
            }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: '#38BDF8' }}>Legal</p>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-1)' }}>Privacy Policy</h2>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>
              Effective: May 6, 2026 · Last updated: May 6, 2026
            </p>
          </div>

          {/* Body */}
          <div className="px-4 sm:px-6 py-5 space-y-5">

            {/* Intro */}
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
              Habit·at ("we", "us", or "our") is committed to protecting your privacy. This policy explains what data we collect, why we collect it, and how you can control it. We keep things simple — we don't sell your data. Ever.
            </p>

            <Section title="1. What We Collect">
              <p>We collect only what's needed to run the app:</p>
              <div className="space-y-1.5 mt-1">
                <Li><strong style={{ color: 'var(--text-1)' }}>Account info</strong> — your email address and display name when you sign up.</Li>
                <Li><strong style={{ color: 'var(--text-1)' }}>Profile photo</strong> — if you choose to upload one.</Li>
                <Li><strong style={{ color: 'var(--text-1)' }}>Habit data</strong> — the habits you create, their names, emojis, descriptions, completion dates, and streak history.</Li>
                <Li><strong style={{ color: 'var(--text-1)' }}>Journal entries</strong> — text you write in the Journal tab.</Li>
                <Li><strong style={{ color: 'var(--text-1)' }}>App preferences</strong> — dark/light mode, notification settings.</Li>
              </div>
              <p>We do <strong style={{ color: 'var(--text-1)' }}>not</strong> collect location data, contacts, browsing history, or any data from other apps on your device.</p>
            </Section>

            <Section title="2. How We Use Your Data">
              <div className="space-y-1.5">
                <Li>To create and maintain your account.</Li>
                <Li>To display your habits, streaks, and progress across sessions and devices.</Li>
                <Li>To send push notifications you've opted into (habit reminders, weekly summaries).</Li>
                <Li>To provide analytics and insights shown within the app.</Li>
                <Li>To respond to support requests you send us.</Li>
              </div>
              <p>We do not use your data for advertising, profiling, or any purpose beyond operating Habit·at.</p>
            </Section>

            <Section title="3. Third-Party Services">
              <p>We use the following trusted third parties to run the app:</p>
              <div className="space-y-1.5 mt-1">
                <Li><strong style={{ color: 'var(--text-1)' }}>Supabase</strong> — our backend provider for authentication, database storage, and file storage. Your data is stored in Supabase infrastructure (US-based). See their privacy policy at supabase.com/privacy.</Li>
                <Li><strong style={{ color: 'var(--text-1)' }}>Google Sign-In</strong> — if you choose to sign in with Google. We receive only your email and name from Google.</Li>
                <Li><strong style={{ color: 'var(--text-1)' }}>Apple Sign-In</strong> — if you choose to sign in with Apple. We receive only your email and name from Apple.</Li>
              </div>
              <p>No data is shared with advertisers, data brokers, analytics companies, or any other third parties.</p>
            </Section>

            <Section title="4. Data Retention">
              <p>Your data is stored for as long as your account is active. If you delete your account, all of your data — habits, completions, journal entries, and profile information — is permanently deleted from our systems within 30 days.</p>
            </Section>

            <Section title="5. Your Rights">
              <p>You have the right to:</p>
              <div className="space-y-1.5 mt-1">
                <Li><strong style={{ color: 'var(--text-1)' }}>Access</strong> — request a copy of your data by contacting us.</Li>
                <Li><strong style={{ color: 'var(--text-1)' }}>Correction</strong> — update your name and profile photo directly in the app.</Li>
                <Li><strong style={{ color: 'var(--text-1)' }}>Deletion</strong> — delete your account at any time from the Me → Danger Zone section. This permanently erases all your data.</Li>
                <Li><strong style={{ color: 'var(--text-1)' }}>Portability</strong> — request an export of your habit data by contacting us.</Li>
                <Li><strong style={{ color: 'var(--text-1)' }}>Opt-out</strong> — disable push notifications at any time from the Me page or your device settings.</Li>
              </div>
              <p>If you are in the EU or California, you may have additional rights under GDPR or CCPA. Contact us to exercise them.</p>
            </Section>

            <Section title="6. Children's Privacy">
              <p>Habit·at is not directed at children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided us with personal data, please contact us and we will delete it promptly.</p>
            </Section>

            <Section title="7. Security">
              <p>Your data is protected in transit using TLS encryption. Access to your account is secured through Supabase's authentication system. While we take reasonable steps to protect your data, no internet transmission is 100% secure.</p>
            </Section>

            <Section title="8. Changes to This Policy">
              <p>We may update this policy from time to time. When we do, we'll update the "Last updated" date at the top. For significant changes, we'll notify you within the app. Continued use of Habit·at after changes means you accept the updated policy.</p>
            </Section>

            <Section title="9. Contact Us">
              <p>Questions about your privacy or this policy? We'd love to hear from you:</p>
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
