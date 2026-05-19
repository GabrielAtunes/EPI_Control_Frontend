import React, { useState, useEffect } from "react";
import { Modal } from "../../../../components/ui/Modal";
import { Button } from "../../../../components/ui/Button";
import { Combobox } from "../../../../components/ui/Combobox";
import { api } from "../../../../services/api/api";

type ModalMode = "create" | "edit" | "view";

interface EpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function EpiModal({
  isOpen,
  onClose,
  mode,
  initialData,
  onSave,
  isLoading,
}: EpiModalProps) {
  const [formData, setFormData] = useState({
    certificado_id: "",
    descricao: "",
    fabricante: "",
    tamanho: "",
  });

  const [caOptions, setCaOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [isLoadingCAs, setIsLoadingCAs] = useState(false);

  // Busca os CAs ativos do banco
  useEffect(() => {
    if (isOpen) {
      const fetchCAs = async () => {
        setIsLoadingCAs(true);
        try {
          const response = await api.get("/certificados/?ativos=true");
          const options = response.data.map((cert: any) => ({
            label: String(cert.ca_numero),
            value: String(cert.id), // Garantimos que o ID seja String para o Combobox
          }));
          setCaOptions(options);
        } catch (error) {
          console.error("Erro ao buscar CAs:", error);
        } finally {
          setIsLoadingCAs(false);
        }
      };
      fetchCAs();
    }
  }, [isOpen]);

  // Sincroniza os dados do formulário
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        certificado_id: String(
          initialData.certificado_id || initialData.certificado?.id || "",
        ),
        descricao: initialData.descricao || "",
        fabricante: initialData.fabricante || "",
        tamanho: initialData.tamanho || "",
      });
    } else if (isOpen && mode === "create") {
      setFormData({
        certificado_id: "",
        descricao: "",
        fabricante: "",
        tamanho: "",
      });
    }
  }, [isOpen, initialData, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      ...formData,
      certificado_id: Number(formData.certificado_id),
    });
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
          ? "Cadastrar Novo EPI"
          : mode === "edit"
            ? "Editar EPI"
            : "Detalhes do EPI"
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
          <div className="w-full space-y-1.5">
            <label className={labelClasses}>
              Certificado de Aprovação (CA) *
            </label>
            <Combobox
              value={formData.certificado_id}
              onChange={(value) =>
                setFormData({ ...formData, certificado_id: String(value) })
              }
              options={caOptions}
              placeholder={
                isLoadingCAs ? "Carregando CAs..." : "Selecione o CA..."
              }
              disabled={isReadOnly || isLoadingCAs}
            />
          </div>

          <div className="w-full space-y-1.5">
            <label className={labelClasses}>Fabricante *</label>
            <input
              required
              disabled={isReadOnly}
              value={formData.fabricante}
              onChange={(e) =>
                setFormData({ ...formData, fabricante: e.target.value })
              }
              placeholder="Ex: 3M do Brasil"
              className={inputClasses}
            />
          </div>

          <div className="w-full space-y-1.5 sm:col-span-2">
            <label className={labelClasses}>Nome EPI *</label>
            <input
              required
              type="text"
              disabled={isReadOnly}
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              placeholder="Ex: Capacete de segurança com aba frontal"
              className={inputClasses}
            />
          </div>

          <div className="w-full space-y-1.5">
            <label className={labelClasses}>
              Tamanho{" "}
              <span className="text-gray-500 font-normal">(Opcional)</span>
            </label>
            <input
              disabled={isReadOnly}
              value={formData.tamanho}
              onChange={(e) =>
                setFormData({ ...formData, tamanho: e.target.value })
              }
              placeholder="Ex: M, G, Único"
              className={inputClasses}
            />
          </div>
        </div>

        {!isReadOnly && <button type="submit" className="hidden" />}
      </form>
    </Modal>
  );
}
