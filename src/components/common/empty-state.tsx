import { Card } from "@/components/ui/card";

export function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <p className="text-sm text-slate-500">{message}</p>
    </Card>
  );
}
