"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { FormSelect } from "@/components/FormSelect";
import { PdfDropzone } from "@/components/PdfDropzone";
import { RequirementItem } from "@/components/RequirementItem";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { BrandLoading } from "@/components/BrandLoading";
import { Check } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { demoModeEnabled, demoProfile } from "@/lib/demo-mode";
import { areaInterestOptions, experienceLevelOptions } from "@/lib/profile-options";

export default function Perfil() {
  if (demoModeEnabled) {
    return <PerfilEditor user={demoProfile} demoMode />;
  }

  return <AuthenticatedPerfil />;
}

function AuthenticatedPerfil() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  useEffect(() => {
    if (sessionPending) return;
    if (!session) {
      router.replace("/login");
    }
  }, [router, session, sessionPending]);

  if (sessionPending || !session) {
    return <BrandLoading label="Carregando seu perfil..." />;
  }

  return <PerfilEditor key={session.user.id} user={session.user} />;
}

type ProfileUser = {
  id: string;
  name: string;
  email: string;
  githubUrl?: string | null;
  areaInterest?: string | null;
  experienceLevel?: string | null;
  privacyConsent?: boolean;
};

function PerfilEditor({
  user,
  demoMode = false,
}: {
  user: ProfileUser;
  demoMode?: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");
  const [github, setGithub] = useState(user.githubUrl ?? "");
  const [areaInterest, setAreaInterest] = useState(user.areaInterest ?? "");
  const [experienceLevel, setExperienceLevel] = useState(user.experienceLevel ?? "");
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDemoCompleted, setDeleteDemoCompleted] = useState(false);
  const [hasCurriculum, setHasCurriculum] = useState(demoMode);
  const [curriculumError, setCurriculumError] = useState(false);
  const [curriculumStatus, setCurriculumStatus] = useState<string | null>(null);
  const [curriculumFile, setCurriculumFile] = useState<File | null>(null);
  const [isUploadingCurriculum, setIsUploadingCurriculum] = useState(false);

  useEffect(() => {
    if (demoMode) return;
    fetch("/api/curriculum/status")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { status?: string } | null) => {
        if (data?.status) {
          setHasCurriculum(true);
          setCurriculumStatus(data.status);
        }
      })
      .catch(() => {});
  }, [demoMode]);

  function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  }

  const githubTouched = github.length > 0;
  const isValidGithubUrl = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/i.test(github);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false);
    setErrorMessage("");
    if (demoMode && !hasCurriculum) {
      setCurriculumError(true);
      return;
    }
    setCurriculumError(false);

    if (!areaInterest || !experienceLevel) {
      setErrorMessage("Selecione sua área de interesse e seu nível de experiência.");
      return;
    }

    if (github && !isValidGithubUrl) {
      setErrorMessage("Corrija o link do GitHub ou deixe o campo vazio.");
      return;
    }

    if (demoMode) {
      setSaved(true);
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await authClient.updateUser({
        name,
        areaInterest: areaInterest || null,
        experienceLevel: experienceLevel || null,
      });

      if (error) {
        setErrorMessage("Não foi possível salvar o perfil. Tente novamente.");
        return;
      }

      const githubResponse = await fetch("/api/curriculum/github-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl: github || null }),
      });
      if (!githubResponse.ok) {
        const githubData = await githubResponse.json().catch(() => null);
        setErrorMessage(githubData?.error || "Não foi possível salvar o link do GitHub. Tente novamente.");
        return;
      }

      if (curriculumFile) {
        setIsUploadingCurriculum(true);
        const pdfBase64 = await toBase64(curriculumFile);
        const response = await fetch("/api/curriculum/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pdfBase64 }),
        });
        const data = await response.json().catch(() => null);
        setIsUploadingCurriculum(false);
        if (!response.ok) {
          setErrorMessage(data?.error || "Não foi possível enviar o currículo. Tente novamente.");
          return;
        }
        setHasCurriculum(true);
        setCurriculumStatus(data?.status ?? "COMPLETED");
        setCurriculumFile(null);
      }

      setSaved(true);
    } catch {
      setErrorMessage("Não foi possível conectar ao serviço. Tente novamente.");
    } finally {
      setIsSaving(false);
      setIsUploadingCurriculum(false);
    }
  }

  async function handleDeleteAccount() {
    setErrorMessage("");
    if (demoMode) {
      setConfirmingDelete(false);
      setDeleteDemoCompleted(true);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch("/api/account/delete", { method: "POST" });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setConfirmingDelete(false);
        setErrorMessage(data?.error || "Não foi possível excluir a conta agora. Tente novamente.");
        return;
      }

      setConfirmingDelete(false);
      router.replace("/login");
      router.refresh();
    } catch {
      setConfirmingDelete(false);
      setErrorMessage("Não foi possível excluir a conta agora. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f4f3f8]">
      <Sidebar />

      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold tracking-widest text-[#7755e8] uppercase">
              Meu perfil
            </span>
            <h1 className="font-[family-name:var(--font-display)] mt-1 text-3xl md:text-4xl text-[#1d1b33]">
              Seus dados
            </h1>
            <p className="mt-1 text-[#59567a]">
              Essas informações alimentam a análise de perfil e todas as suas
              sessões de treino.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 lg:col-span-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#8b8593]">
              Conta
            </span>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label htmlFor="nome" className="text-sm font-extrabold text-[#1d1b33]">
                  Nome <span className="text-[#e8641d]">*</span>
                </label>
                <input
                  id="nome"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border-[1.5px] border-[#e4dfd3] bg-white px-4 py-3 text-[#1d1b33] focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/30"
                />
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="email" className="text-sm font-extrabold text-[#1d1b33]">
                  E-mail <span className="text-[#e8641d]">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={user.email}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border-[1.5px] border-[#e4dfd3] bg-[#f7f6f9] px-4 py-3 text-[#6d698a]"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 rounded-xl border border-[#e7e3ee] bg-[#f7f6f9] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-extrabold text-[#1d1b33]">
                  {user.privacyConsent === false ? "Consentimento pendente" : "Consentimento de privacidade registrado"}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-[#6d698a]">
                  O uso de currículo e GitHub é autorizado explicitamente no cadastro.
                </p>
              </div>
              <Link href="/politica-de-privacidade" className="shrink-0 text-sm font-extrabold text-[#5d43c4] underline underline-offset-4">
                Consultar política
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#8b8593]">
              Perfil técnico
            </span>

            <div className="mt-4 grid gap-4">
              <div className="grid gap-1.5">
                <label htmlFor="github" className="text-sm font-extrabold text-[#1d1b33]">
                  GitHub{" "}
                  <span className="text-xs font-semibold text-[#59567a]">(opcional)</span>
                </label>
                <input
                  id="github"
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/seu-usuario"
                  className="w-full rounded-xl border-[1.5px] border-[#e4dfd3] bg-white px-4 py-3 text-[#1d1b33] placeholder:text-[#8b8593] focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/30"
                />
                {githubTouched && !isValidGithubUrl && (
                  <ul className="mt-0.5 grid gap-1 text-xs font-semibold">
                    <RequirementItem met={false} label="Isso não parece um link válido do GitHub" />
                  </ul>
                )}
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-extrabold text-[#1d1b33]">
                  Currículo em PDF <span className="text-[#e8641d]">*</span>
                </label>
                {demoMode ? (
                  <>
                    <PdfDropzone
                      initialFileName="curriculo-exemplo.pdf"
                      onFileChange={(file) => {
                        setHasCurriculum(file !== null);
                        if (file) setCurriculumError(false);
                      }}
                    />
                    <p className="text-xs font-semibold leading-relaxed text-[#8b8593]">
                      Processamento local: nenhum arquivo é enviado.
                    </p>
                    {curriculumError && (
                      <ul className="mt-0.5 grid gap-1 text-xs font-semibold">
                        <RequirementItem met={false} label="Adicione um currículo antes de salvar" />
                      </ul>
                    )}
                  </>
                ) : (
                  <>
                    <PdfDropzone
                      initialFileName={hasCurriculum && !curriculumFile ? "Currículo já enviado" : undefined}
                      onFileChange={setCurriculumFile}
                    />
                    <p className="text-xs font-semibold leading-relaxed text-[#8b8593]">
                      {curriculumFile
                        ? "Um novo currículo será enviado ao salvar."
                        : hasCurriculum
                          ? `Status atual: ${curriculumStatus === "COMPLETED" ? "processado" : curriculumStatus === "FAILED" ? "falhou, envie novamente" : "em processamento"}.`
                          : "Nenhum currículo enviado ainda."}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#8b8593]">
              Preferências
            </span>

            <div className="mt-4 grid gap-4">
              <div className="grid gap-1.5">
                <label htmlFor="interesse" className="text-sm font-extrabold text-[#1d1b33]">
                  Área de interesse <span className="text-[#e8641d]">*</span>
                </label>
                <FormSelect
                  id="interesse"
                  required
                  placeholder="Selecione sua área..."
                  options={[...areaInterestOptions]}
                  value={areaInterest}
                  onChange={setAreaInterest}
                />
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="nivel" className="text-sm font-extrabold text-[#1d1b33]">
                  Nível de experiência <span className="text-[#e8641d]">*</span>
                </label>
                <FormSelect
                  id="nivel"
                  required
                  placeholder="Onde você está hoje?"
                  options={[...experienceLevelOptions]}
                  value={experienceLevel}
                  onChange={setExperienceLevel}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:col-span-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#7755e8] px-6 font-extrabold text-white shadow-[0_14px_32px_-16px_rgba(119,85,232,0.75)] transition hover:-translate-y-0.5 hover:bg-[#6647d1] disabled:cursor-wait disabled:opacity-60"
            >
              {isUploadingCurriculum ? "Enviando currículo..." : isSaving ? "Salvando..." : "Salvar alterações"}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-bold text-[#1f9d55]">
                <Check className="h-4 w-4" strokeWidth={3} />
                {demoMode ? "Alterações salvas nesta sessão" : "Alterações salvas"}
              </span>
            )}
          </div>
          {errorMessage && <p role="alert" className="lg:col-span-2 rounded-xl bg-[#fdf2f2] px-4 py-3 text-sm font-bold text-[#a83030]">{errorMessage}</p>}
        </form>

        <div className="mt-5 rounded-2xl border-[1.5px] border-[#f3d9d9] bg-white p-6">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#c23b3b]">
            Zona de risco
          </span>
          <p className="mt-2 text-sm text-[#59567a]">
            Excluir sua conta remove permanentemente seu currículo, suas
            análises e todas as suas sessões de treino.
          </p>
          {demoMode && (
            <p className="mt-3 text-xs font-semibold leading-relaxed text-[#8b8593]">
              Neste ambiente, a exclusão não altera dados reais.
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              setDeleteDemoCompleted(false);
              setConfirmingDelete(true);
            }}
            className="mt-4 rounded-full border-[1.5px] border-[#c23b3b] px-5 py-2.5 text-sm font-extrabold text-[#c23b3b] transition hover:bg-[#fdf2f2]"
          >
            {demoMode ? "Simular exclusão de conta" : "Excluir minha conta"}
          </button>
          {deleteDemoCompleted && (
            <p role="status" className="mt-4 rounded-xl bg-[#eef8f1] px-4 py-3 text-sm font-bold text-[#247544]">
              Simulação concluída: em produção, a conta e os dados relacionados seriam removidos.
            </p>
          )}
        </div>

        <ConfirmDialog
          open={confirmingDelete}
          title={demoMode ? "Simular exclusão?" : "Excluir sua conta?"}
          description={demoMode ? "Este ambiente conclui o fluxo sem remover dados reais." : "Essa ação não pode ser desfeita. Seu currículo, suas análises e todas as suas sessões de treino serão apagados permanentemente."}
          confirmLabel={demoMode ? "Sim, simular" : "Sim, excluir conta"}
          pending={isDeleting}
          onConfirm={handleDeleteAccount}
          onCancel={() => setConfirmingDelete(false)}
        />
      </main>
    </div>
  );
}
