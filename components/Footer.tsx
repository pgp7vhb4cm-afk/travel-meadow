export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© {new Date().getFullYear()} Travel Meadow. A prototype project.</span>
        <span>Flight &amp; hotel data via Duffel · AI by Anthropic</span>
      </div>
    </footer>
  );
}
