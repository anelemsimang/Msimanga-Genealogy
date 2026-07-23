import type { Metadata } from "next";
import Link from "next/link";
import { Tag, Users, Home, Heart } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "@/components/person-avatar";
import {
  getHouses,
  getConnectedFamilies,
  countPeople,
  type ConnectedFamily,
} from "@/lib/people/service";
import { clanName } from "@/lib/clan";

export const metadata: Metadata = {
  title: "Surnames & houses",
  description:
    "The Msimanga surname, the founding houses, and the families joined to the clan by marriage.",
};

export default async function SurnamesPage() {
  const [houses, families, total] = await Promise.all([
    getHouses(),
    getConnectedFamilies(),
    countPeople(),
  ]);
  const wivesHouses = families.filter((f) => f.type === "house");
  const inLaws = families.filter((f) => f.type === "family");

  return (
    <div className="flex flex-col">
      <PageHeader
        icon={Tag}
        eyebrow="Names & houses"
        title="Surnames & houses"
        description="Everyone in this archive shares one clan name — but the record is woven from many houses joined together by marriage across the generations."
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10 sm:px-6">
        {/* Primary surname */}
        <section>
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle
                    translate="no"
                    className="notranslate font-heading text-2xl text-primary"
                  >
                    {clanName}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    The clan name carried by every person in the archive.
                  </CardDescription>
                </div>
                <Badge variant="default" className="gap-1.5">
                  <Users className="size-3" /> {total} people
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                render={<Link href="/search" />}
                nativeButton={false}
                variant="outline"
                size="sm"
              >
                Browse all {clanName} family members
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Founding houses */}
        {houses.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 font-heading text-xl font-semibold">
              <Home className="size-5 text-primary" /> The founding houses
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The branches of the family, each descending from one of
              Mthwalo&rsquo;s sons.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {houses.map((house) => (
                <Card key={house.slug} id={house.slug} className="scroll-mt-24">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {house.head && (
                        <PersonAvatar
                          name={house.head.full_name}
                          gender={house.head.gender}
                          imageUrl={house.head.imageUrl}
                        />
                      )}
                      <div className="min-w-0">
                        <CardTitle className="truncate">
                          {house.label.replace(/^Branch \d+ — /, "")}
                        </CardTitle>
                        <CardDescription className="truncate">
                          {house.head?.honorific}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {house.memberCount} people
                    </Badge>
                    {house.head && (
                      <Button
                        render={<Link href={`/people/${house.head.slug}`} />}
                        nativeButton={false}
                        variant="ghost"
                        size="sm"
                      >
                        Open house
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Houses joined by marriage */}
        {families.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 font-heading text-xl font-semibold">
              <Heart className="size-5 text-primary" /> Houses joined by marriage
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The houses and families named in the record as marrying into — or
              receiving — the Msimanga family.
            </p>

            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              <FamilyColumn
                heading="Wives’ houses"
                subheading="Houses a Msimanga husband married from"
                families={wivesHouses}
              />
              <FamilyColumn
                heading="Families joined"
                subheading="Families a Msimanga daughter married into"
                families={inLaws}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function FamilyColumn({
  heading,
  subheading,
  families,
}: {
  heading: string;
  subheading: string;
  families: ConnectedFamily[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{heading}</CardTitle>
        <CardDescription>{subheading}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {families.map((family) => (
          <div
            key={`${family.type}:${family.name}`}
            className="rounded-lg border border-border/60 p-3"
          >
            <p className="font-heading font-medium">{family.name}</p>
            <ul className="mt-1.5 space-y-1">
              {family.connections.map((c) => (
                <li key={c.slug} className="text-sm text-muted-foreground">
                  <Link
                    href={`/people/${c.slug}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {c.name.replace(" Msimanga", "")}
                  </Link>{" "}
                  — {c.detail}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
