import { motion } from "motion/react";
import { Mail, Linkedin, Instagram, Github, Phone } from "lucide-react";
import { profile } from "@/data/portfolio";

const channels = [
  {
    label: "Email",
    value: profile.contact.email,
    href: `mailto:${profile.contact.email}`,
    icon: Mail,
  },
  {
    label: "LinkedIn",
    value: "Connect",
    href: profile.contact.linkedin,
    icon: Linkedin,
  },
  {
    label: "Instagram",
    value: "Follow",
    href: profile.contact.instagram,
    icon: Instagram,
  },
  {
    label: "GitHub",
    value: "Code",
    href: profile.contact.github,
    icon: Github,
  },
];

export function ContactSection() {
  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
      <div className="flex items-center gap-4 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground">
        <span className="h-px w-10 bg-border" />
        This is me, so far
        <span className="h-px w-10 bg-border" />
      </div>

      <h2 className="mt-6 font-display text-5xl text-foreground text-glow sm:text-7xl">
        Let&apos;s stay{" "}
        <span className="italic text-foreground/60">connected</span>
      </h2>

      <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
        Got questions or want to collaborate? Feel free to reach out — I&apos;m
        open to new projects, internships, or just a casual chat about AI.
      </p>

      <a
        href={`mailto:${profile.contact.email}`}
        className="mt-9 inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/15 px-8 py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-foreground shadow-[var(--shadow-glow)] transition-colors hover:bg-primary/25"
      >
        <Mail className="h-4 w-4" /> Contact me
      </a>

      <div className="mt-14 grid w-full max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
        {channels.map((c, i) => (
          <motion.a
            key={c.label}
            href={c.href}
            target={c.href.startsWith("mailto") ? undefined : "_blank"}
            rel="noreferrer"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="group flex flex-col items-center gap-3 bg-card px-4 py-8 transition-colors hover:bg-secondary/60"
          >
            <c.icon className="h-6 w-6 text-foreground/80 transition-colors group-hover:text-violet-glow" />
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              {c.label}
            </span>
          </motion.a>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center gap-1 font-mono text-xs text-muted-foreground">
        <a
          href={`mailto:${profile.contact.email}`}
          className="transition-colors hover:text-foreground"
        >
          {profile.contact.email}
        </a>
        <span className="inline-flex items-center gap-1.5">
          <Phone className="h-3 w-3" /> {profile.contact.phone}
        </span>
      </div>
    </div>
  );
}