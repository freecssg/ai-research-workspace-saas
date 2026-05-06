import { Badge } from "@/components/ui/badge";

const statusTone = {
  ready: "green",
  active: "green",
  completed: "green",
  draft: "blue",
  building: "blue",
  analyzing: "blue",
  running: "blue",
  queued: "neutral",
  paused: "amber",
  failed: "red",
  archived: "neutral",
  uploaded: "blue",
  indexed: "green",
} as const;

type StatusBadgeProps = {
  status: keyof typeof statusTone | string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const tone = status in statusTone ? statusTone[status as keyof typeof statusTone] : "neutral";
  const label = status.replaceAll("_", " ");

  return <Badge tone={tone}>{label}</Badge>;
}
