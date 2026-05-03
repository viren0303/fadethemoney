import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-border bg-bg/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-7 w-7 rounded-md bg-gradient-to-br from-accent to-emerald-700" />
          <span className="font-bold tracking-tight">Fade The Money</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/" className="px-3 py-1.5 rounded-md hover:bg-panel2">Dashboard</Link>
          <Link href="/results" className="px-3 py-1.5 rounded-md hover:bg-panel2">Results</Link>
          <Link href="/about" className="px-3 py-1.5 rounded-md hover:bg-panel2">About</Link>
        </nav>
      </div>
    </header>
  );
}
