import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function PoliticaDePrivacidade() {
  return (
    <main className="min-h-screen bg-[#f4f3f8] px-4 py-8 sm:px-6 sm:py-12">
      <article className="mx-auto max-w-3xl rounded-3xl border border-[#e7e3ee] bg-white p-6 shadow-[0_22px_70px_-50px_rgba(29,27,51,0.5)] sm:p-10">
        <Logo />
        <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-[#7755e8]">
          Privacidade e LGPD
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[#1d1b33] sm:text-4xl">
          Política de privacidade
        </h1>
        <p className="mt-3 leading-relaxed text-[#59567a]">
          O DevReady utiliza os dados fornecidos pelo próprio usuário somente
          para criar o diagnóstico técnico, personalizar treinos e acompanhar a
          evolução na plataforma.
        </p>

        <div className="mt-8 grid gap-7 text-sm leading-relaxed text-[#59567a]">
          <section>
            <h2 className="text-lg font-extrabold text-[#1d1b33]">Dados tratados</h2>
            <p className="mt-2">Nome, e-mail, currículo, endereço público do GitHub, área de interesse, nível de experiência e resultados dos treinos.</p>
          </section>
          <section>
            <h2 className="text-lg font-extrabold text-[#1d1b33]">Finalidade</h2>
            <p className="mt-2">Comparar o perfil com vagas informadas pelo usuário, gerar avaliações, apontar lacunas e recomendar conteúdos de estudo.</p>
          </section>
          <section>
            <h2 className="text-lg font-extrabold text-[#1d1b33]">Compartilhamento e testes</h2>
            <p className="mt-2">A equipe não deve utilizar dados pessoais reais de terceiros. Demonstrações e testes do hackathon devem usar informações fictícias.</p>
          </section>
          <section>
            <h2 className="text-lg font-extrabold text-[#1d1b33]">Seus direitos</h2>
            <p className="mt-2">O usuário pode consultar e atualizar seus dados ou excluir definitivamente a conta. A exclusão remove também sessões e contas de autenticação relacionadas.</p>
          </section>
          <section>
            <h2 className="text-lg font-extrabold text-[#1d1b33]">Segurança</h2>
            <p className="mt-2">Segredos e credenciais não são armazenados no código. O currículo deverá ser mantido em armazenamento privado quando o serviço de arquivos for integrado.</p>
          </section>
        </div>

        <Link href="/cadastro" className="mt-9 inline-flex font-extrabold text-[#5d43c4] underline underline-offset-4">
          Voltar ao cadastro
        </Link>
      </article>
    </main>
  );
}
