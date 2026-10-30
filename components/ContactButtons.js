import { telHref, waHref } from "@/lib/site";

// Floating WhatsApp and call buttons. Each shows only when its number is set in lib/site.js.
export default function ContactButtons() {
  const wa = waHref();
  const tel = telHref();
  if (!wa && !tel) return null;

  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col gap-3">
      {tel && (
        <a href={tel} aria-label="Call us" title="Call us"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1566c4] to-[#0a3a75] text-white shadow-xl ring-2 ring-white/60 transition hover:-translate-y-1">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
            <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
          </svg>
        </a>
      )}
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" title="Chat on WhatsApp"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#33e07a] to-[#1ba84f] text-white shadow-xl ring-2 ring-white/60 transition hover:-translate-y-1">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.25-.12-1.46-.72-1.7-.8-.23-.08-.4-.12-.56.13-.17.25-.64.8-.78.96-.15.17-.29.19-.54.06a6.7 6.7 0 0 1-3.3-2.9c-.25-.43.25-.4.72-1.33.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.49-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.43 1.03 2.6c.12.17 1.77 2.7 4.3 3.8 1.6.7 2.23.75 3.03.63.49-.07 1.46-.6 1.67-1.17.2-.58.2-1.08.14-1.18-.06-.1-.23-.17-.48-.29z" />
          </svg>
        </a>
      )}
    </div>
  );
}
