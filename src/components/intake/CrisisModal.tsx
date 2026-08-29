import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Phone, Heart, ChevronRight } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const CrisisModal = ({ open, onClose }: Props) => (
  <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
    <AlertDialogContent className="max-w-md">
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
          <Heart className="h-5 w-5" /> Merci de ta confiance
        </AlertDialogTitle>
        <AlertDialogDescription className="text-foreground/80 space-y-3 text-sm">
          <p>Ce que tu traverses est important. Tu n'es pas seul·e.</p>
          <p>Si tu en ressens le besoin, tu peux parler à quelqu'un maintenant :</p>
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div className="space-y-2 mt-2">
        <a href="tel:0801000180" className="block">
          <Button variant="destructive" className="w-full justify-between" size="lg">
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> Stop Silence — 0801 000 180
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </a>
        <a href="tel:141" className="block">
          <Button variant="outline" className="w-full justify-between border-destructive/30 text-destructive" size="lg">
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> SAMU — 141
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </a>
      </div>

      <Button variant="ghost" className="w-full mt-2 text-muted-foreground" onClick={onClose}>
        Continuer mon anamnèse — mon psy en sera prioritairement informé
      </Button>
    </AlertDialogContent>
  </AlertDialog>
);

export default CrisisModal;