import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";

type ModalMode = "create" | "edit" | "view";

interface FornecedorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}

// Função utilitária para formatar o CNPJ (00.000.000/0000-00)
const formatCNPJ = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  let formatted = cleaned;

  if (cleaned.length > 2 && cleaned.length <= 5) {
    formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
  } else if (cleaned.length > 5 && cleaned.length <= 8) {
    formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
  } else if (cleaned.length > 8 && cleaned.length <= 12) {
    formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
  } else if (cleaned.length > 12) {
    formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
  }

  return formatted;
};

export function FornecedorModal({
  isOpen,
  onClose,
  mode,
  initialData,
  onSave,
  isLoading,
}: FornecedorModalProps) {
  const [formData, setFormData] = useState({
    nome_fantasia: "",
    cnpj: "",
    email: "",
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        nome_fantasia: initialData.nome_fantasia || "",
        cnpj: initialData.cnpj ? formatCNPJ(initialData.cnpj) : "",
        email: initialData.email || "",
      });
    } else if (isOpen && mode === "create") {
      setFormData({ nome_fantasia: "", cnpj: "", email: "" });
    }
  }, [isOpen, initialData, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          ? "Cadastrar Fornecedor"
          : mode === "edit"
            ? "Editar Fornecedor"
            : "Detalhes do Fornecedor"
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
            <label className={labelClasses}>Nome Fantasia *</label>
            <input
              required
              type="text"
              disabled={isReadOnly}
              value={formData.nome_fantasia}
              onChange={(e) =>
                setFormData({ ...formData, nome_fantasia: e.target.value })
              }
              placeholder="Ex: 3M do Brasil"
              className={inputClasses}
            />
          </div>

          <div className="w-full space-y-1.5">
            <label className={labelClasses}>CNPJ *</label>
            <input
              required
              type="text"
              disabled={isReadOnly || mode === "edit"} // CNPJ não costuma ser alterado
              maxLength={18} // Limite de tamanho da string formatada
              value={formData.cnpj}
              onChange={(e) =>
                setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })
              }
              placeholder="Ex: 00.000.000/0000-00"
              className={inputClasses}
            />
          </div>

          <div className="w-full space-y-1.5">
            <label className={labelClasses}>
              E-mail de Contato{" "}
              <span className="text-gray-500 font-normal">(Opcional)</span>
            </label>
            <input
              type="email"
              disabled={isReadOnly}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Ex: contato@fornecedor.com.br"
              className={inputClasses}
            />
          </div>
        </div>
        {!isReadOnly && <button type="submit" className="hidden" />}
      </form>
    </Modal>
  );
}
