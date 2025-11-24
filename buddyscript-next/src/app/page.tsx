import Link from "next/link";

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '40px', fontWeight: '600' }}>BuddyScript</h1>
      <Link href="/feeds" style={{ fontSize: '18px', textDecoration: 'none', color: '#1890FF' }}>
        Feeds
      </Link>
      <Link href="/login" style={{ fontSize: '18px', textDecoration: 'none', color: '#1890FF' }}>
        Login
      </Link>
      <Link href="/register" style={{ fontSize: '18px', textDecoration: 'none', color: '#1890FF' }}>
        Register
      </Link>
      <Link href="/muhammadfahim.pdf" target="_blank" rel="noopener noreferrer" style={{ fontSize: '18px', textDecoration: 'none', color: '#377DFF' }}>
        Resume
      </Link>
    </div>
  );
}
