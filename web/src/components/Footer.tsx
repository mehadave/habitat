export function Footer() {
  return (
    <footer
      className="w-full flex flex-col items-center gap-1.5 px-4 text-center"
      style={{
        paddingTop: 16,
        paddingBottom: 96, // clears the 80px bottom nav
        color: 'rgba(255,255,255,0.28)',
        fontSize: 11,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        marginTop: 8,
      }}
    >
      <p>Made with ❤️ in California</p>
      <p>Copyright © Habitat 2026. All rights reserved.</p>
      <a
        href="mailto:davemeha60@gmail.com"
        className="transition-colors duration-200 hover:underline"
        style={{ color: 'rgba(255,255,255,0.28)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
      >
        Contact
      </a>
    </footer>
  )
}
