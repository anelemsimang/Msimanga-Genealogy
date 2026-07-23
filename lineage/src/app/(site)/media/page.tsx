import type { Metadata } from "next";
import Link from "next/link";
import { ImageIcon, Upload, FileText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Media",
  description:
    "Photographs, documents, and records from the Msimanga family archive.",
};

const comingSoon = [
  {
    icon: ImageIcon,
    title: "Photographs",
    desc: "Portraits and gatherings, linked to the people they show.",
  },
  {
    icon: FileText,
    title: "Documents",
    desc: "Scans of the original hand-written record and other papers.",
  },
  {
    icon: Upload,
    title: "Family contributions",
    desc: "Uploads from relatives, each attached to a person or event.",
  },
];

export default function MediaPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        icon={ImageIcon}
        eyebrow="Photographs & documents"
        title="Media archive"
        description="A home for the family's photographs, scanned documents, and records — each tied to the people and moments they belong to."
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ImageIcon className="size-7" />
          </div>
          <div className="max-w-md space-y-1.5">
            <h2 className="font-heading text-xl font-semibold">
              No media yet
            </h2>
            <p className="text-sm text-muted-foreground">
              The archive is text-first for now, built from the original
              family record. Photographs and documents will appear here as the
              family adds them.
            </p>
          </div>
          <Button render={<Link href="/auth/sign-in" />} nativeButton={false}>
            <Upload className="size-4" /> Sign in to contribute
          </Button>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {comingSoon.map((item) => (
            <Card key={item.title} className="border-border/60">
              <CardHeader>
                <div className="mb-2 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-5" />
                </div>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
