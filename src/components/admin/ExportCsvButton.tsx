import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadCsv } from "@/lib/admin/csv";
import { toast } from "sonner";

interface Props {
  filename: string;
  rows: Record<string, any>[];
  columns?: string[];
  label?: string;
  size?: "sm" | "default";
  variant?: "ghost" | "outline" | "default";
}

export const ExportCsvButton = ({ filename, rows, columns, label = "Export CSV", size = "sm", variant = "outline" }: Props) => {
  const handleClick = () => {
    if (!rows.length) {
      toast.error("Nothing to export");
      return;
    }
    downloadCsv(filename, rows, columns);
    toast.success(`Exported ${rows.length} row${rows.length === 1 ? "" : "s"}`);
  };
  return (
    <Button size={size} variant={variant} onClick={handleClick} className="gap-1.5">
      <Download className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
};

export default ExportCsvButton;