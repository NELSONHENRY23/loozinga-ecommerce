import Link from "next/link";
import BackToTopButton from "./BackToTopButton";

const storeLinks = [
  { label: "Shop", href: "/#products" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Size Guide", href: "/size-guide" },
  { label: "Returns", href: "/returns" },
];

function SocialIcon({
  platform,
}: {
  platform: "x" | "tiktok";
}) {
  if (platform === "x") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-7.5L5.5 22H2.3l7.3-8.4L1.8 2h6.5l4.4 6.9L18.9 2Zm-1.1 18h1.7L7.2 3.9H5.4L17.8 20Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M19.6 6.1a5.7 5.7 0 0 1-3.5-3.7V2h-4.2v13.6a2.9 2.9 0 1 1-2.9-2.9c.3 0 .7 0 1 .1V8.5a7 7 0 0 0-1-.1 7.1 7.1 0 1 0 7.1 7.1V8.6a9.8 9.8 0 0 0 5.1 1.5V5.9a5.6 5.6 0 0 1-1.6.2Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white text-gray-900">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 py-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-16 lg:py-16">
        {/* Brand and store navigation */}
        <section aria-labelledby="footer-brand-heading">
          <Link
            href="/"
            id="footer-brand-heading"
            className="mb-6 inline-block text-2xl font-bold tracking-tight"
          >
            LOOZINGA.
          </Link>

          <nav aria-label="Footer navigation">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-4">
              {storeLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition hover:text-gray-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        {/* Newsletter */}
        <section aria-labelledby="footer-newsletter-heading">
          <h2
            id="footer-newsletter-heading"
            className="mb-4 text-xs font-semibold tracking-[0.2em] text-gray-500"
          >
            STAY IN THE LOOP
          </h2>

          <p className="mb-6 max-w-sm text-sm leading-6 text-gray-600">
            NEW DROPS, EXCLUSIVE OFFERS, NO NOISE.
          </p>

          <form className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>

            <input
              id="footer-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email address"
              required
              className="min-w-0 flex-1 border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
            />

            <button
              type="button"
              className="bg-gray-900 px-5 py-3 text-xs font-semibold tracking-wider text-white transition hover:bg-gray-700"
            >
              SUBSCRIBE
            </button>
          </form>

          <p className="mt-3 text-xs text-gray-500">
            Get updates on new drops and exclusive offers.
          </p>
        </section>

        {/* Social icons */}
        <section aria-labelledby="footer-social-heading">
          <h2
            id="footer-social-heading"
            className="mb-5 text-xs font-semibold tracking-[0.2em] text-gray-500"
          >
            FOLLOW US
          </h2>

          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="rounded-full border border-gray-200 p-3 transition hover:bg-gray-100"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r=".5" fill="currentColor" />
              </svg>
            </a>

            <a
              href="https://x.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              className="rounded-full border border-gray-200 p-3 transition hover:bg-gray-100"
            >
              <span className="block h-5 w-5">
                <SocialIcon platform="x" />
              </span>
            </a>

            <a
              href="https://www.tiktok.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              className="rounded-full border border-gray-200 p-3 transition hover:bg-gray-100"
            >
              <span className="block h-5 w-5">
                <SocialIcon platform="tiktok" />
              </span>
            </a>
          </div>
        </section>
      </div>

      {/* Legal bar */}
      <div className="border-t border-gray-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Loozinga. All rights reserved.
          </p>

          <nav aria-label="Legal navigation" className="flex gap-6">
            <Link href="/privacy" className="transition hover:text-gray-900">
              Privacy Policy
            </Link>

            <Link href="/terms" className="transition hover:text-gray-900">
              Terms of Use
            </Link>
          </nav>
        </div>
      </div>
      
      <BackToTopButton/>
    </footer>
  );
}
