"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

type CurriculumStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

type CurriculumProcessingProps = {
    curriculumId: number;
    initialStatus: CurriculumStatus
}

export function CurriculumProcessingTrigger({curriculumId, initialStatus}: CurriculumProcessingProps) {
    const router = useRouter()
    const attemptsRef = useRef(0);
    const [isStuck, setIsStuck] = useState(false);

    useEffect(() => {
        if (initialStatus !== "PENDING") return;

        fetch("/api/curriculum/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curriculumId }),
        }).catch((err) => console.error("Falha ao disparar processamento", err));
    }, []);
    useEffect(() => {

  if (initialStatus !== "PENDING" && initialStatus !== "PROCESSING") return;

  const MAX_ATTEMPTS = 15;

  const interval = setInterval(async () => {
    attemptsRef.current += 1;

    if (attemptsRef.current > MAX_ATTEMPTS) {
      clearInterval(interval);
      setIsStuck(true);
      return;
    }

    try {
      const res = await fetch("/api/curriculum/status");
      if (!res.ok) return;
      const data: { status: CurriculumStatus } = await res.json();

      if (data.status === "COMPLETED" || data.status === "FAILED") {
        clearInterval(interval);
        router.refresh();
      }
    } catch (err) {
      console.error("Falha ao consultar status do currículo", err);
    }
  }, 9000);

  return () => clearInterval(interval);
}, []);
if (isStuck) {
  return <p>Processamento demorando mais que o esperado. Atualize a página em alguns minutos.</p>;
}

if (initialStatus === "PENDING" || initialStatus === "PROCESSING") {
  return <p>Processando seu currículo...</p>;
}

return null;
}