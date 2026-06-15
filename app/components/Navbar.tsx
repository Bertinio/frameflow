import Link from "next/link";

export default function Navbar() {
  return (
    <nav>
      <div>
        FrameFlow
      </div>

      <ul>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/configurator">Configurator</Link></li>
        <li><Link href="/installer">Voor installateurs</Link></li>
        <li><Link href="/login">Login</Link></li>

        <li><Link href="/configurator">Start demo</Link></li>
      </ul>
    </nav>
  )
}
