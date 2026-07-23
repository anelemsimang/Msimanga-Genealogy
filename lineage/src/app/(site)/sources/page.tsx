import type { Metadata } from "next";
import Link from "next/link";
import { BookMarked, ScrollText, Languages, Quote } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { familyTreeSource } from "@/lib/family-tree";
import { countPeople } from "@/lib/people/service";

export const metadata: Metadata = {
  title: "Sources",
  description:
    "The source record behind the Msimanga family archive, its translation, and the kinship terms it uses.",
};

const glossary = [
  {
    term: "Wazala / uzele / bazala",
    meaning: "“fathered” or “bore the following children.”",
  },
  {
    term: "Wazeka / ozeke / wazekwa",
    meaning: "“married” — took a wife, or was married to.",
  },
  {
    term: "Intombhi yakwa [X]",
    meaning: "“a daughter of the [X] house/family.”",
  },
  {
    term: "Ma- names (Mamashiya, Mankosi, Mamtolo…)",
    meaning:
      "customary married names — a woman referred to by “Ma-” plus her maiden clan name, or the house she married into.",
  },
  { term: "Amaweleke", meaning: "“twins.”" },
];

export default async function SourcesPage() {
  const total = await countPeople();
  return (
    <div className="flex flex-col">
      <PageHeader
        icon={BookMarked}
        eyebrow="How we know what we know"
        title="Sources"
        description="This archive is source-driven. Everything in the family tree is drawn from a single written record, translated and structured with care."
      />

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6">
        {/* Primary source citation */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ScrollText className="size-5 text-primary" />
              <CardTitle className="text-lg">The primary record</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            <p className="font-heading text-base font-medium italic">
              {familyTreeSource.title}
            </p>
            <dl className="grid gap-2 sm:grid-cols-[8rem_1fr]">
              <dt className="text-muted-foreground">Compiled by</dt>
              <dd>{familyTreeSource.compiler}</dd>
              <dt className="text-muted-foreground">Location</dt>
              <dd>{familyTreeSource.place}</dd>
              <dt className="text-muted-foreground">Original language</dt>
              <dd>isiXhosa (hand-written / typed family record)</dd>
              <dt className="text-muted-foreground">People recorded</dt>
              <dd>{total}</dd>
            </dl>
          </CardContent>
        </Card>

        {/* Translation note */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Languages className="size-5 text-primary" />
              <CardTitle className="text-lg">On the translation</CardTitle>
            </div>
            <CardDescription>
              How the isiXhosa record was rendered into English.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-foreground/90">
            <p>
              This archive is an English translation and reorganisation of the
              original isiXhosa record, arranged by generation and by house
              (branch). In-marrying wives are often identified by their
              father&rsquo;s house rather than a given name, exactly as the
              original does. Where the record told a fuller story — notably
              around Matshakeni&rsquo;s two marriages — that story is kept as a
              narrative note rather than compressed into a bare list.
            </p>
            <p>{familyTreeSource.note}</p>
          </CardContent>
        </Card>

        {/* Kinship glossary */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Quote className="size-5 text-primary" />
              <CardTitle className="text-lg">Kinship terms</CardTitle>
            </div>
            <CardDescription>
              Recurring isiXhosa terms from the original, and how they are read
              here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-border">
              {glossary.map((item) => (
                <div
                  key={item.term}
                  className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[16rem_1fr]"
                >
                  <dt
                    translate="no"
                    className="notranslate font-heading font-medium"
                  >
                    {item.term}
                  </dt>
                  <dd className="text-sm text-muted-foreground">
                    {item.meaning}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button render={<Link href="/tree" />} nativeButton={false}>
            Explore the family tree
          </Button>
          <Button
            render={<Link href="/search" />}
            nativeButton={false}
            variant="outline"
          >
            Browse the people
          </Button>
        </div>
      </div>
    </div>
  );
}
