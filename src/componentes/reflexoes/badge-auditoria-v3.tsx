"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, Ban, HelpCircle, CheckCircle2 } from "lucide-react";
import type { AuditorStatus, AbstentionCategory } from "@/tipos/cognitivo-v3";

interface Props {
  status: AuditorStatus;
  abstentionCategory?: AbstentionCategory;
  milr?: number;
  amr?: number;
  totalClaims?: number;
  intervencoesCount?: number;
}

const CONFIG_STATUS: Record<
  AuditorStatus,
  { rotulo: string; descricao: string; corBadge: string; corBorda: string; icone: any }
> = {
  PASS: {
    rotulo: "INTEGRIDADE VERIFICADA",
    descricao: "Todas as afirmações possuem sustentação factual e respeito absoluto ao Dossiê Contextual.",
    corBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    corBorda: "border-emerald-200 bg-emerald-50/30",
    icone: ShieldCheck,
  },
  PASS_WITH_CORRECTIONS: {
    rotulo: "CORREÇÕES APLICADAS",
    descricao: "Afirmações atenuadas com marcadores de incerteza para preservar a fidelidade autoral.",
    corBadge: "bg-amber-50 text-amber-800 border-amber-200",
    corBorda: "border-amber-200 bg-amber-50/30",
    icone: AlertTriangle,
  },
  ABSTAIN: {
    rotulo: "CONTEXTO INSUFICIENTE",
    descricao: "O sistema absteve-se honestamente por falta de evidências comprovadas no acervo.",
    corBadge: "bg-slate-50 text-slate-700 border-slate-200",
    corBorda: "border-slate-200 bg-slate-50/40",
    icone: HelpCircle,
  },
  BLOCK: {
    rotulo: "CONFLITO DE EVIDÊNCIAS",
    descricao: "Identificada violação de Allowed Use ou contradição frontal com o acervo.",
    corBadge: "bg-rose-50 text-rose-700 border-rose-200",
    corBorda: "border-rose-200 bg-rose-50/30",
    icone: Ban,
  },
};

export function BadgeAuditoriaV3({
  status,
  abstentionCategory,
  milr = 0,
  amr = 0,
  totalClaims = 0,
  intervencoesCount = 0,
}: Props) {
  const conf = CONFIG_STATUS[status] || CONFIG_STATUS.PASS;
  const Icone = conf.icone;

  return (
    <div className={`p-4 rounded-2xl border ${conf.corBorda} transition-all space-y-2`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${conf.corBadge}`}>
            <Icone className="w-3.5 h-3.5" />
            {conf.rotulo}
          </span>
          {abstentionCategory && (
            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {abstentionCategory}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>Claims: <strong>{totalClaims}</strong></span>
          <span>MILR: <strong>{milr.toFixed(1)}%</strong></span>
          <span>AMR: <strong>{amr.toFixed(1)}%</strong></span>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">
        {conf.descricao}
      </p>

      {intervencoesCount > 0 && (
        <div className="text-[11px] text-amber-800 bg-amber-100/60 px-2.5 py-1 rounded-md flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{intervencoesCount} ajuste(s) preventivo(s) de incerteza executado(s).</span>
        </div>
      )}
    </div>
  );
}
