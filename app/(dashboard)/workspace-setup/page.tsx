'use client';

import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import FormLayout02 from '@/components/ui/form-layout-demo';

export default function WorkspaceSetupPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-4 py-10 text-center">
      <h2 className="text-base font-bold text-gray-900 font-display">Workspace Setup</h2>
      <p className="text-xs text-gray-500">
        Opens the multi-section settings form inside the custom dialog.
      </p>
      <Button onClick={() => setOpen(true)}>
        <Settings2 size={15} /> Open settings form
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Workspace settings</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <FormLayout02 />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
