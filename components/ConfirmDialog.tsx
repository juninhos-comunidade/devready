"use client";

// Popup genérico de "tem certeza?" — recebe o texto e as ações de fora,
// então dá pra reaproveitar em qualquer lugar do site que precise confirmar
// uma ação que não dá pra desfazer (excluir conta, excluir sessão, etc.),
// sem copiar e colar esse código toda vez.
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // se não estiver aberto, o componente não desenha nada na tela —
  // é assim que a gente "esconde" o popup sem precisar de CSS de display:none
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#0d0e24]/60 p-4"
      onClick={onCancel} // clicar no fundo escuro (fora do card) também cancela
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()} // impede que o clique DENTRO do card feche o popup
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h2
          id="confirm-dialog-title"
          className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#1d1b33]"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#59567a]">{description}</p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border-[1.5px] border-[#e4dfd3] px-5 py-2.5 font-extrabold text-[#1d1b33] transition hover:border-[#7755e8]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-full bg-[#c23b3b] px-5 py-2.5 font-extrabold text-white transition hover:bg-[#a83030]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
