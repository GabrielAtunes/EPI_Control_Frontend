import React, { useState, useEffect } from "react";
import { Modal } from "../../../../components/ui/Modal";
import { Button } from "../../../../components/ui/Button";

type ModalMode = "create" | "edit" | "view";

interface CertificadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function CertificadoModal({
  isOpen,
  onClose,
  mode,
  initialData,
  onSave,
  isLoading,
}: CertificadoModalProps) {
  const [formData, setFormData] = useState({
    ca_numero: "",
    validade_ca: "",
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        ca_numero: initialData.ca_numero || "",
        validade_ca: initialData.validade_ca
          ? initialData.validade_ca.split("T")[0]
          : "",
      });
    } else if (isOpen && mode === "create") {
      setFormData({ ca_numero: "", validade_ca: "" });
    }
  }, [isOpen, initialData, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const isReadOnly = mode === "view";

  // Mesmas classes refinadas e imunes ao azul do Tailwind Forms
  const inputClasses = `
    w-full px-4 py-3 rounded-xl border transition-all duration-200
    bg-white dark:bg-white/5 border-gray-200 dark:border-white/10
    text-text-primary-light dark:text-white
    outline-none focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500 focus:shadow-none
    disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:dark:bg-gray-900
  `;

  const labelClasses =
    "block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark ml-1 mb-1.5";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === "create"
          ? "Cadastrar Novo CA"
          : mode === "edit"
            ? "Editar CA"
            : "Detalhes do CA"
      }
      maxWidth="lg"
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
        <div className="grid grid-cols-1 gap-6">
          <div className="w-full space-y-1.5">
            <label className={labelClasses}>Número do CA *</label>
            <input
              required
              type="text"
              disabled={isReadOnly || mode === "edit"} // CA não deve ser editado após criado, via de regra
              value={formData.ca_numero}
              onChange={(e) =>
                setFormData({ ...formData, ca_numero: e.target.value })
              }
              placeholder="Ex: 12345"
              className={inputClasses}
            />
            {mode === "edit" && (
              <p className="text-xs text-gray-500 ml-1 mt-1">
                O número do CA não pode ser alterado após o cadastro.
              </p>
            )}
          </div>

          <div className="w-full space-y-1.5">
            <label className={labelClasses}>
              Data de Validade{" "}
              <span className="text-gray-400 font-normal">(Opcional)</span>
            </label>
            <input
              type="date"
              disabled={isReadOnly}
              value={formData.validade_ca}
              onChange={(e) =>
                setFormData({ ...formData, validade_ca: e.target.value })
              }
              className={inputClasses}
            />
          </div>
        </div>
        {!isReadOnly && <button type="submit" className="hidden" />}
      </form>
    </Modal>
  );
}
