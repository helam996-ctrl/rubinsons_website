"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import StatusBadge from "@/components/ui/StatusBadge";
import Link from "next/link";

export default function ComponentShowcasePage() {
  return (
    <main className="min-h-screen bg-slate-50 py-16 px-6 sm:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-brand-bronze-dark font-semibold">
              Design System
            </span>
            <h1 className="text-4xl font-serif font-medium text-brand-slate-900">
              Visual Component Showcase
            </h1>
            <p className="text-sm text-brand-text-muted">
              Live preview of Rubinsons UI primitive components and editorial style guides.
            </p>
          </div>
          <Link
            href="/"
            className="text-xs font-sans font-semibold text-brand-slate-900 border border-brand-slate-900 px-3 py-1.5 rounded hover:bg-slate-100 transition-colors"
          >
            &larr; Back to Portal
          </Link>
        </div>

        {/* Section: Typography */}
        <section className="space-y-6 bg-white p-8 rounded border border-slate-200 shadow-sm">
          <h2 className="text-lg font-serif font-semibold text-brand-slate-900 border-b border-slate-100 pb-2">
            01. Editorial Typography Scale
          </h2>
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400">Display (Serif)</span>
              <h3 className="text-5xl font-serif font-medium text-brand-slate-900">
                Rubinsons Group
              </h3>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400">Heading 1 (Serif)</span>
              <h3 className="text-3xl font-serif font-medium text-brand-slate-900">
                Builders & Infrastructure Division
              </h3>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400">Heading 2 (Serif)</span>
              <h3 className="text-xl font-serif font-medium text-brand-slate-900">
                Dr. Rudra Bhanu, Managing Director
              </h3>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400">Body text (Sans-Serif)</span>
              <p className="text-sm text-brand-text-muted leading-relaxed max-w-xl">
                Operating under strict multi-generational governance rules, Rubinsons Private Limited coordinates
                diversified sectors ensuring nation-building operations and institutional readiness.
              </p>
            </div>
          </div>
        </section>

        {/* Section: Buttons */}
        <section className="space-y-6 bg-white p-8 rounded border border-slate-200 shadow-sm">
          <h2 className="text-lg font-serif font-semibold text-brand-slate-900 border-b border-slate-100 pb-2">
            02. Button Variants
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary (Bronze)</Button>
            <Button variant="link">Muted Link Arrow &rarr;</Button>
          </div>
        </section>

        {/* Section: Form Fields */}
        <section className="space-y-6 bg-white p-8 rounded border border-slate-200 shadow-sm">
          <h2 className="text-lg font-serif font-semibold text-brand-slate-900 border-b border-slate-100 pb-2">
            03. Inputs & Forms
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="name"
              label="Full Name"
              placeholder="e.g. Vikram Sharma"
            />
            <Input
              id="email"
              label="Corporate Email Address"
              placeholder="name@company.com"
              error="Please enter a valid corporate email format."
            />
            <Select
              id="sector"
              label="Business Interest"
              options={[
                { label: "Builders & Infrastructure", value: "builders" },
                { label: "Contracting", value: "contracting" },
                { label: "Hospitality Academia", value: "academia" },
              ]}
            />
          </div>
        </section>

        {/* Section: Badges */}
        <section className="space-y-6 bg-white p-8 rounded border border-slate-200 shadow-sm">
          <h2 className="text-lg font-serif font-semibold text-brand-slate-900 border-b border-slate-100 pb-2">
            04. System Status Badges
          </h2>
          <div className="flex flex-wrap gap-3">
            <StatusBadge status="NEW" />
            <StatusBadge status="CONTACTED" />
            <StatusBadge status="IN_PROGRESS" />
            <StatusBadge status="CLOSED" />
            <StatusBadge status="SPAM" />
            <StatusBadge status="ACTIVE" />
            <StatusBadge status="PLANNED" />
          </div>
        </section>
      </div>
    </main>
  );
}
