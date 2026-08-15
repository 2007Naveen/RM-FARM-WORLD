"use client";

import { ReactNode } from "react";

interface PrintableReportProps {
  title: string;
  children: ReactNode;
}

export default function PrintableReport({ title, children }: PrintableReportProps) {
  return (
    <div className="p-4 print:p-8 bg-white">
      <div className="hidden print:block mb-6 border-b pb-4 text-center">
        <h1 className="text-2xl font-black text-stone-900">{title}</h1>
        <p className="text-xs text-stone-500 mt-1">பண்ணை மேலாண்மை தானியங்கி அறிக்கை</p>
      </div>
      {children}
    </div>
  );
}