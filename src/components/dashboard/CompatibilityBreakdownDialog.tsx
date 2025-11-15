'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CompatibilityBreakdown } from "@/services/compatibility";
import { Users, Sparkles, Gem } from "lucide-react";

interface CompatibilityBreakdownDialogProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown: CompatibilityBreakdown | null;
  userName: string;
}

export const CompatibilityBreakdownDialog = ({ isOpen, onClose, breakdown, userName }: CompatibilityBreakdownDialogProps) => {
  if (!breakdown) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Vous et {userName}</DialogTitle>
          <DialogDescription>
            Découvrez ce qui vous rapproche et ce qui vous rend uniques.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {breakdown.sharedTraits.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Ce que vous partagez</h4>
              <div className="flex flex-wrap gap-2">
                {breakdown.sharedTraits.map(trait => (
                  <Badge key={trait}>{trait}</Badge>
                ))}
              </div>
            </div>
          )}

          {breakdown.uniqueTraits1.length > 0 && (
            <div className="space-y-2">
              <h4 className="fontsemibold flex items-center gap-2"><Sparkles className="h-5 w-5 text-yellow-500" /> Ce qui vous rend unique</h4>
               <div className="flex flex-wrap gap-2">
                {breakdown.uniqueTraits1.map(trait => (
                  <Badge key={trait} variant="secondary">{trait}</Badge>
                ))}
              </div>
            </div>
          )}

          {breakdown.uniqueTraits2.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2"><Gem className="h-5 w-5 text-fuchsia-500" /> Ce qui le/la rend unique</h4>
               <div className="flex flex-wrap gap-2">
                {breakdown.uniqueTraits2.map(trait => (
                  <Badge key={trait} variant="outline">{trait}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
