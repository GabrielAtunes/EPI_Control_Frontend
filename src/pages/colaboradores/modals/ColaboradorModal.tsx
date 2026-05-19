import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";

type ModalMode = "create" | "edit" | "view";

interface ColaboradorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}

// Função utilitária para formatar o CPF
const formatCPF = (value: string) => {
  // Remove tudo o que não é dígito
  const cleaned = value.replace(/\D/g, "");

  // Aplica a máscara consoante o tamanho
  let formatted = cleaned;
  if (cleaned.length > 3 && cleaned.length <= 6) {
    formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  } else if (cleaned.length > 6 && cleaned.length <= 9) {
    formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  } else if (cleaned.length > 9) {
    formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
  }

  return formatted;
};

export function ColaboradorModal({
  isOpen,
  onClose,
  mode,
  initialData,
  onSave,
  isLoading,
}: ColaboradorModalProps) {
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        nome: initialData.nome || "",
        cpf: initialData.cpf ? formatCPF(initialData.cpf) : "", // Formata caso venha do backend sem máscara
        email: initialData.email || "",
      });
    } else if (isOpen && mode === "create") {
      setFormData({ nome: "", cpf: "", email: "" });
    }
  }, [isOpen, initialData, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Pode querer remover a máscara antes de enviar para o backend,
    // dependendo de como definiu a regra de negócio na API.
    // Se o backend aceita com máscara, envie formData normalmente.
    // Se o backend exige apenas números, use: const payload = { ...formData, cpf: formData.cpf.replace(/\D/g, '') }

    await onSave(formData);
  };

  const isReadOnly = mode === "view";

  const inputClasses = `
    w-full px-4 py-3 rounded-xl border transition-all duration-200
    bg-white dark:bg-[#13161f] border-gray-200 dark:border-gray-800
    text-text-primary-light dark:text-gray-200
    outline-none focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500 focus:shadow-none
    disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:dark:bg-gray-900/50
    hover:border-gray-300 dark:hover:border-gray-700
  `;

  const labelClasses =
    "block text-sm font-medium text-text-secondary-light dark:text-gray-400 ml-1 mb-1.5";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === "create"
          ? "Cadastrar Colaborador"
          : mode === "edit"
            ? "Editar Colaborador"
            : "Detalhes do Colaborador"
      }
      maxWidth="2xl"
      footer={
        !isReadOnly && (
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full sm:w-auto font-medium"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isLoading}
              className="w-full sm:w-auto shadow-sm font-medium"
            >
              Salvar
            </Button>
          </div>
        )
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 p-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="w-full space-y-1.5 sm:col-span-2">
            <label className={labelClasses}>Nome Completo *</label>
            <input
              required
              type="text"
              disabled={isReadOnly}
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              placeholder="Ex: João da Silva"
              className={inputClasses}
            />
          </div>

          <div className="w-full space-y-1.5">
            <label className={labelClasses}>CPF *</label>
            <input
              required
              type="text"
              disabled={isReadOnly || mode === "edit"} // Geralmente o CPF não é editável após o registo
              maxLength={14} // Limita a introdução ao tamanho da máscara (000.000.000-00)
              value={formData.cpf}
              onChange={(e) =>
                setFormData({ ...formData, cpf: formatCPF(e.target.value) })
              }
              placeholder="Ex: 000.000.000-00"
              className={inputClasses}
            />
          </div>

          <div className="w-full space-y-1.5">
            <label className={labelClasses}>E-mail corporativo/pessoal *</label>
            <input
              required
              type="email"
              disabled={isReadOnly}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Ex: joao@empresa.com"
              className={inputClasses}
            />
          </div>
        </div>
        {!isReadOnly && <button type="submit" className="hidden" />}
      </form>
    </Modal>
  );
}
