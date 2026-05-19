import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";

type ModalMode = "create" | "edit" | "view";

interface UsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function UsuarioModal({
  isOpen,
  onClose,
  mode,
  initialData,
  onSave,
  isLoading,
}: UsuarioModalProps) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        nome: initialData.nome || "",
        email: initialData.email || "",
        senha: "", // A senha nunca vem do backend, e começa vazia na edição
      });
    } else if (isOpen && mode === "create") {
      setFormData({ nome: "", email: "", senha: "" });
    }
  }, [isOpen, initialData, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Se for edição e a senha estiver vazia, removemos do payload
    // para não atualizar a senha do usuário com uma string em branco
    const payload = { ...formData };
    if (mode === "edit" && !payload.senha) {
      delete (payload as any).senha;
    }

    await onSave(payload);
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
          ? "Cadastrar Usuário do Sistema"
          : mode === "edit"
            ? "Editar Usuário"
            : "Detalhes do Usuário"
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
              placeholder="Ex: Administrador"
              className={inputClasses}
            />
          </div>

          <div className="w-full space-y-1.5 sm:col-span-2">
            <label className={labelClasses}>E-mail de Acesso *</label>
            <input
              required
              type="email"
              disabled={isReadOnly}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Ex: admin@empresa.com.br"
              className={inputClasses}
            />
          </div>

          {/* Oculta o campo de senha se for apenas visualização */}
          {!isReadOnly && (
            <div className="w-full space-y-1.5 sm:col-span-2">
              <label className={labelClasses}>
                Senha{" "}
                {mode === "edit" && (
                  <span className="text-gray-500 font-normal">
                    (Preencha apenas se quiser alterar)
                  </span>
                )}
                {mode === "create" && "*"}
              </label>
              <input
                required={mode === "create"}
                type="password"
                disabled={isReadOnly}
                value={formData.senha}
                onChange={(e) =>
                  setFormData({ ...formData, senha: e.target.value })
                }
                placeholder="********"
                className={inputClasses}
              />
            </div>
          )}
        </div>
        {!isReadOnly && <button type="submit" className="hidden" />}
      </form>
    </Modal>
  );
}
