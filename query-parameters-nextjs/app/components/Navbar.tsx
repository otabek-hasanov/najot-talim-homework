import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b px-6 py-4">
      <Link href="/" className="font-bold">
        Logo
      </Link>
      <Link href="/">Bosh sahifa</Link>
    </nav>
  );
}
