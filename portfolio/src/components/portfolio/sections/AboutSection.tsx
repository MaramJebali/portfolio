import { motion } from "motion/react";
import { Award } from "lucide-react";
import { profile, skillGroups, certifications } from "@/data/portfolio";

export function AboutSection() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      {/* Intro */}
      <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="font-display text-4xl text-foreground sm:text-5xl">
            More about{" "}
            <span className="italic text-foreground/60">myself</span>
          </h2>
          <p className="mt-7 text-base leading-relaxed text-muted-foreground">
            {profile.about}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-foreground/80">
            <span className="rounded-full border border-border bg-secondary/50 px-4 py-2">
              {profile.role}
            </span>
            <span className="rounded-full border border-border bg-secondary/50 px-4 py-2">
              {profile.school}
            </span>
            <span className="rounded-full border border-border bg-secondary/50 px-4 py-2">
              {profile.location}
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="grid place-items-center rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent py-14">
            <span className="font-display text-7xl italic text-foreground/80">
              {profile.name}
            </span>
            <span className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-violet-glow">
              Building the future with AI
            </span>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="mt-20">
        <h3 className="font-display text-3xl text-foreground sm:text-4xl">
          What I work <span className="italic text-foreground/60">with</span>
        </h3>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((group, i) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.45 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h4 className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-violet-glow">
                {group.title}
              </h4>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-lg border border-border/70 bg-secondary/40 px-2.5 py-1 text-xs text-foreground/85"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="mt-20">
        <h3 className="font-display text-3xl text-foreground sm:text-4xl">
          Certifications{" "}
          <span className="italic text-foreground/60">& credentials</span>
        </h3>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {certifications.map((cert, i) => (
            <motion.div
              key={cert.credentialId}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 2) * 0.05, duration: 0.4 }}
              className="flex gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/40 bg-primary/15">
                <Award className="h-5 w-5 text-violet-glow" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-medium leading-snug text-foreground">
                  {cert.title}
                </h4>
                <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground">
                  {cert.issuer} · {cert.issued}
                </p>
                <p className="mt-1 truncate font-mono text-[0.65rem] text-muted-foreground/70">
                  ID: {cert.credentialId}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}