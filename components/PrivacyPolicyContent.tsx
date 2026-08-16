export function PrivacyPolicyContent() {
  return (
    <div className="grid gap-7 text-sm leading-relaxed text-[#59567a]">
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
  );
}
