"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { useT } from "@/lib/i18n/useT";
import { useProjectStore } from "@/lib/planner/store/project-store";
import { useEnsureProject } from "@/lib/planner/store/use-ensure-project";
import { StudioShell } from "@/components/planner/studio/StudioShell";
import { StepFooter } from "@/components/planner/studio/StepFooter";
import { AffixInput } from "@/components/planner/studio/AffixInput";
import { formatInr } from "@/lib/planner/units";
import type { CostTier } from "@/lib/planner/types";

/**
 * Screen 8 — how do you want to spend?
 *
 * Deliberately not "what is your budget?" first. Asked cold, that question gets
 * a defensive number or no answer at all; asked as "what matters to you",
 * people answer honestly. The number is optional and comes second.
 */

interface Tier {
  id: CostTier;
  symbol: string;
  label: string;
  blurb: string;
  detail: string[];
  badge?: string;
}

const TIERS: Tier[] = [
  {
    id: "budget",
    symbol: "₹",
    label: "Budget friendly",
    blurb: "Reliable essentials. Prioritize value.",
    detail: ["Trusted entry-level brands", "Standard ceramic and fittings", "Fewer optional extras"],
  },
  {
    id: "costEffective",
    symbol: "₹₹",
    label: "Smart value",
    blurb: "Good quality without unnecessary upgrades.",
    detail: ["Mid-range brands with good service", "Better taps and mixers", "Where most homeowners land"],
    badge: "Most Popular",
  },
  {
    id: "goodQuality",
    symbol: "₹₹₹",
    label: "Premium",
    blurb: "Better finishes, brands and warranties.",
    detail: ["Longer warranties", "Premium surface finishes", "Wider design choice"],
  },
  {
    id: "topOfLine",
    symbol: "₹₹₹₹",
    label: "Top of the line",
    blurb: "Premium fixtures and finishes throughout.",
    detail: ["Flagship ranges", "Designer fittings", "Specified down to the detail"],
  },
];

export default function BudgetPage() {
  const t = useT();
  const { project } = useEnsureProject();
  const setCostTier = useProjectStore((s) => s.setCostTier);
  const setBudget = useProjectStore((s) => s.setBudget);

  const [draft, setDraft] = useState<string | null>(null);
  const [skipped, setSkipped] = useState(false);

  const tier = project?.style.costTier ?? null;
  const budget = project?.style.budgetInr ?? 0;

  function commitBudget(raw: string) {
    const digits = Number(raw.replace(/[^\d]/g, ""));
    if (Number.isFinite(digits) && digits > 0) setBudget(digits);
    setDraft(null);
  }

  return (
    <StudioShell
      stepId="budget"
      footer={
        <StepFooter
          stepId="budget"
          blockedReason={tier ? null : t("Choose how you’d like to spend")}
        />
      }
    >
      <header className="max-w-2xl">
        <h1 className="text-[30px] font-semibold leading-[1.12] tracking-[-0.02em] text-ink sm:text-[38px]">
          {t("How do you want to spend?")}
        </h1>
        <p className="mt-3 text-[15.5px] leading-relaxed text-body">
          {t("This shapes which products we suggest — not how much you have to spend.")}
        </p>
      </header>

      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((item) => {
          const active = tier === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCostTier(item.id)}
              aria-pressed={active}
              className={[
                "relative flex flex-col rounded-2xl border p-5 text-left transition-[border-color,transform,box-shadow] duration-200",
                "hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
                active
                  ? "border-brand bg-surface-raised shadow-[0_10px_30px_rgb(7_140_200/0.15)]"
                  : "border-hairline bg-surface-raised hover:border-brand/45",
              ].join(" ")}
            >
              {item.badge && (
                <span className="absolute -top-2.5 left-5 rounded-pill bg-clay px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-on-clay">
                  {t(item.badge)}
                </span>
              )}

              <span className="flex items-center justify-between">
                <span className="text-[19px] font-semibold tracking-[0.02em] text-brand">
                  {item.symbol}
                </span>
                {active && <Icon name="check" size={16} className="text-brand" />}
              </span>

              <span className="mt-2 block text-[16px] font-semibold leading-snug text-ink">
                {t(item.label)}
              </span>
              <span className="mt-1 block text-[13px] leading-relaxed text-body">
                {t(item.blurb)}
              </span>

              <ul className="mt-3 space-y-1">
                {item.detail.map((d) => (
                  <li key={d} className="flex items-start gap-1.5 text-[12.5px] text-body-soft">
                    <Icon name="check" size={12} className="mt-0.5 shrink-0 text-brand/60" />
                    {t(d)}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* The number, asked second and optional. */}
      <section className="mt-9 max-w-xl rounded-2xl border border-hairline bg-surface-raised p-5 sm:p-6">
        <h2 className="text-[17px] font-semibold text-ink">{t("Do you have a target budget?")}</h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-body">
          {t("Optional. We’ll show how the estimate compares as you go.")}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <AffixInput
            label={t("Target budget in rupees")}
            showLabel={false}
            prefix="₹"
            inputMode="numeric"
            placeholder={t("e.g. 1,50,000")}
            className="min-w-[200px] flex-1"
            value={draft ?? (budget ? budget.toLocaleString("en-IN") : "")}
            onValueChange={(v) => {
              setDraft(v);
              setSkipped(false);
            }}
            onCommit={commitBudget}
          />

          <button
            type="button"
            onClick={() => {
              setSkipped(true);
              setDraft(null);
            }}
            className="h-11 rounded-pill px-4 text-[13.5px] font-semibold text-body transition-colors hover:bg-wash hover:text-ink"
          >
            {t("Skip for now")}
          </button>
        </div>

        {skipped ? (
          <p className="mt-3 text-[12.5px] text-body-soft" role="status">
            {t("No problem — we’ll still show a full estimate.")}
          </p>
        ) : (
          budget > 0 && (
            <p className="mt-3 text-[12.5px] text-body-soft" role="status">
              {t("Target")}: {formatInr(budget)}
            </p>
          )
        )}
      </section>
    </StudioShell>
  );
}
