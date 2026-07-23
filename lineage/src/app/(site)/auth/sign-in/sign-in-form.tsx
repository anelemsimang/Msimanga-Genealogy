"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function SignInForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not sign in", { description: error.message });
      return;
    }
    toast.success("Welcome back");
    router.push(next);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email address</Label>
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <Mail className="size-4 shrink-0 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <Lock className="size-4 shrink-0 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Signing in…" : "Sign in"}
        {!submitting && <ArrowRight className="size-4" />}
      </Button>
    </form>
  );
}
