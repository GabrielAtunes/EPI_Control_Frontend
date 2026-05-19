import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Combobox } from "../../../components/ui/Combobox";
import { api } from "../../../services/api/api";

type ModalMode = "create" | "edit" | "view";

interface AlocacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function AlocacaoModal({
  isOpen,
  onClose,
  mode,
  initialData,
  onSave,
  isLoading,
}: AlocacaoModalProps) {
  const [formData, setFormData] = useState({
    colaborador_id: "",
    epi_catalogo_id: "",
    qtd: "",
    estado_entrega: "NOVO",
    data_devolucao: "",
    motivo_devolucao: "",
    retornou_estoque: true, // 🟢 NOVO ESTADO (Padrão é voltar pro estoque)
  });

  const [colaboradoresOptions, setColaboradoresOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [episOptions, setEpisOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [isFetchingData, setIsFetchingData] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsFetchingData(true);
        try {
          const [resColab, resEpis] = await Promise.all([
            api.get("/colaboradores/?ativos=true"),
            api.get("/epis/"),
          ]);
          setColaboradoresOptions(
            resColab.data.map((c: any) => ({
              label: `${c.nome} (${c.cpf})`,
              value: String(c.id),
            })),
          );
          setEpisOptions(
            resEpis.data.map((e: any) => ({
              label: `${e.descricao} (Novos: ${e.estoque?.qtd_nova || 0} | Usados: ${e.estoque?.qtd_usada || 0})`,
              value: String(e.id),
            })),
          );
        } catch (error) {
          console.error("Erro ao carregar dados auxiliares:", error);
        } finally {
          setIsFetchingData(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && initialData && (mode === "view" || mode === "edit")) {
      const formatDateTime = (isoString?: string) => {
        if (!isoString) return "";
        return new Date(isoString).toISOString().slice(0, 16);
      };

      setFormData({
        colaborador_id: String(initialData.colaborador_id),
        epi_catalogo_id: String(initialData.epi_catalogo_id),
        qtd: String(initialData.qtd),
        estado_entrega: initialData.estado_entrega,
        data_devolucao:
          formatDateTime(initialData.data_devolucao) ||
          formatDateTime(new Date().toISOString()),
        motivo_devolucao: initialData.motivo_devolucao || "",
        retornou_estoque: initialData.retornou_estoque ?? true, // 🟢 Lê o valor se existir
      });
    } else if (isOpen && mode === "create") {
      setFormData({
        colaborador_id: "",
        epi_catalogo_id: "",
        qtd: "1",
        estado_entrega: "NOVO",
        data_devolucao: "",
        motivo_devolucao: "",
        retornou_estoque: true,
      });
    }
  }, [isOpen, initialData, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let payload;

    if (mode === "create") {
      payload = {
        colaborador_id: Number(formData.colaborador_id),
        epi_catalogo_id: Number(formData.epi_catalogo_id),
        qtd: Number(formData.qtd),
        estado_entrega: formData.estado_entrega,
      };
    } else {
      payload = {
        data_devolucao: new Date(formData.data_devolucao).toISOString(),
        motivo_devolucao: formData.motivo_devolucao,
        retornou_estoque: formData.retornou_estoque, // 🟢 Envia a decisão para a API
      };
    }

    await onSave(payload);
  };

  const isReadOnly = mode === "view";
  const isReturning = mode === "edit";

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
          ? "Registrar Nova Entrega (Alocação)"
          : mode === "edit"
            ? "Registrar Devolução"
            : "Detalhes da Alocação"
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
              {mode === "create" ? "Salvar Entrega" : "Confirmar Devolução"}
            </Button>
          </div>
        )
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 p-2">
        {/* --- SESSÃO 1: DADOS DA ENTREGA --- */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold tracking-wider text-gray-800 dark:text-gray-300 uppercase border-b border-gray-200 dark:border-gray-800 pb-3">
            Dados da Entrega
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 space-y-1.5">
              <Combobox
                label="Colaborador *"
                value={formData.colaborador_id}
                onChange={(v) =>
                  setFormData({ ...formData, colaborador_id: String(v) })
                }
                options={colaboradoresOptions}
                placeholder={
                  isFetchingData ? "A carregar..." : "Selecione o Colaborador"
                }
                disabled={isReadOnly || isReturning}
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <Combobox
                label="Equipamento (EPI) *"
                value={formData.epi_catalogo_id}
                onChange={(v) =>
                  setFormData({ ...formData, epi_catalogo_id: String(v) })
                }
                options={episOptions}
                placeholder={
                  isFetchingData ? "A carregar..." : "Selecione o EPI"
                }
                disabled={isReadOnly || isReturning}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClasses}>Quantidade *</label>
              <input
                required
                type="number"
                min="1"
                disabled={isReadOnly || isReturning}
                value={formData.qtd}
                onChange={(e) =>
                  setFormData({ ...formData, qtd: e.target.value })
                }
                className={inputClasses}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClasses}>Estado do Item *</label>
              <div className="relative group">
                <select
                  required
                  disabled={isReadOnly || isReturning}
                  value={formData.estado_entrega}
                  onChange={(e) =>
                    setFormData({ ...formData, estado_entrega: e.target.value })
                  }
                  className={`${inputClasses} appearance-none cursor-pointer`}
                >
                  <option value="NOVO">Novo</option>
                  <option value="USADO">Usado</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- SESSÃO 2: DADOS DA DEVOLUÇÃO --- */}
        {(isReturning || (isReadOnly && initialData?.data_devolucao)) && (
          <div className="space-y-4 pt-4 mt-2">
            <h4 className="text-sm font-bold tracking-wider text-gray-800 dark:text-gray-300 uppercase border-b border-gray-200 dark:border-gray-800 pb-3">
              Dados da Devolução
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className={labelClasses}>
                  Data e Hora da Devolução *
                </label>
                <input
                  required={isReturning}
                  type="datetime-local"
                  disabled={isReadOnly}
                  value={formData.data_devolucao}
                  onChange={(e) =>
                    setFormData({ ...formData, data_devolucao: e.target.value })
                  }
                  className={inputClasses}
                />
              </div>

              {/* 🟢 Toggle Switch refinado */}
              <div className="flex items-center h-full pt-6">
                <label className="relative inline-flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    disabled={isReadOnly}
                    checked={formData.retornou_estoque}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        retornou_estoque: e.target.checked,
                      })
                    }
                  />

                  {/* TRACK (menor) */}
                  <div
                    className="
        relative w-12 h-7 rounded-full transition-all duration-300
        bg-gray-700
        peer-checked:bg-emerald-500
        peer-disabled:opacity-50
      "
                  >
                    {/* KNOB */}
                    <div
                      className="
          absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md
          flex items-center justify-center
          text-[9px] font-bold
          transition-all duration-300
          peer-checked:translate-x-5
        "
                    >
                      {formData.retornou_estoque ? "✔" : "✖"}
                    </div>
                  </div>

                  {/* TEXTO */}
                  <div className="ml-3 flex flex-col leading-tight">
                    <span className="text-sm font-semibold text-gray-200">
                      Retornar ao estoque
                    </span>
                    <span
                      className={`
          text-xs transition-colors
          ${formData.retornou_estoque ? "text-emerald-400" : "text-red-400"}
        `}
                    >
                      {formData.retornou_estoque
                        ? "Item volta ao estoque"
                        : "Baixa (descarte/perda)"}
                    </span>
                  </div>
                </label>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className={labelClasses}>
                  Motivo da Devolução / Observações{" "}
                  <span className="text-gray-500 font-normal">(Opcional)</span>
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={formData.motivo_devolucao}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      motivo_devolucao: e.target.value,
                    })
                  }
                  placeholder="Ex: Desligamento, Substituição por desgaste, Item rasgado..."
                  className={inputClasses}
                />
              </div>
            </div>
          </div>
        )}

        {!isReadOnly && <button type="submit" className="hidden" />}
      </form>
    </Modal>
  );
}
