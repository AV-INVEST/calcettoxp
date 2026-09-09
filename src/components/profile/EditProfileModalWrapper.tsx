"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import EditProfileModal from "./EditProfileModal";
import { Role, PreferredFoot } from "@prisma/client";

interface Props {
  initial: {
    nickname: string;
    country?: string | null;
    city?: string | null;
    preferredFoot?: PreferredFoot | null;
    primaryRole: Role;
    secondaryRole?: Role | null;
    birthDate?: Date | string | null;
    lastPrimaryRoleChangeAt?: Date | string | null;
  };
}

export default function EditProfileModalWrapper({ initial }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button variant="secondary" size="md" onClick={() => setOpen(true)}>
        <Pencil size={16} />
        Modifica profilo
      </Button>
      <EditProfileModal
        open={open}
        onClose={() => setOpen(false)}
        initial={initial}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
