import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--header)] flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[var(--teal)]" />
    </div>
  );
}
