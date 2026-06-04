import { createFileRoute } from "@tanstack/react-router";
import { ScanPage } from "@/components/ScanPage";

export const Route = createFileRoute("/")({
  component: ScanPage,
  head: () => ({
    meta: [
      { title: "Escaneo biométrico — Internos" },
      { name: "description", content: "Captura biométrica de huellas dactilares para identificación institucional." },
    ],
  }),
});
