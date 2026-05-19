import React, { useState, useEffect } from "react";
import { Modal } from "../../../../components/ui/Modal";
import { Button } from "../../../../components/ui/Button";
import { Combobox } from "../../../../components/ui/Combobox";
import { api } from "../../../../services/api/api";
import { Plus, Trash2 } from "lucide-react";

type ModalMode = "create" | "view";

interface NfModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function NfModal({
  isOpen,
  onClose,
  mode,
  initialData,
  onSave,
  isLoading,
}: NfModalProps) {
  const [formData, setFormData] = useState({
    fornecedor_id: "",
    numero_nf: "",
    data_emissao: "",
    valor_total: 0,
  });

  // 4. Alterado para aceitar "" (vazio) como valor padrão, permitindo que o input fique limpo
  const [itens, setItens] = useState<
    { epi_catalogo_id: string; qtd: number | ""; valor_unitario: number | "" }[]
  >([{ epi_catalogo_id: "", qtd: "", valor_unitario: "" }]);

  const [fornecedoresOptions, setFornecedoresOptions] = useState<
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
          const [resForn, resEpis] = await Promise.all([
            api.get("/fornecedores/?ativos=true"),
            api.get("/epis/"),
          ]);
          // 1. CORREÇÃO COMBOBOX: Forçamos o value a ser String (String(f.id)) para o Combobox fazer a correspondência correta
          setFornecedoresOptions(
            resForn.data.map((f: any) => ({
              label: `${f.cnpj} - ${f.nome_fantasia}`,
              value: String(f.id),
            })),
          );
          setEpisOptions(
            resEpis.data.map((e: any) => ({
              label: `CA: ${e.certificado?.ca_numero || "S/CA"} - ${e.descricao}`,
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
    if (isOpen && initialData && mode === "view") {
      setFormData({
        fornecedor_id: String(initialData.fornecedor_id),
        numero_nf: initialData.numero_nf,
        data_emissao: initialData.data_emissao
          ? initialData.data_emissao.split("T")[0]
          : "",
        valor_total: initialData.valor_total,
      });
      if (initialData.itens && initialData.itens.length > 0) {
        setItens(
          initialData.itens.map((item: any) => ({
            epi_catalogo_id: String(item.epi_catalogo_id),
            qtd: item.qtd,
            valor_unitario: item.valor_unitario,
          })),
        );
      }
    } else if (isOpen && mode === "create") {
      setFormData({
        fornecedor_id: "",
        numero_nf: "",
        data_emissao: "",
        valor_total: 0,
      });
      setItens([{ epi_catalogo_id: "", qtd: "", valor_unitario: "" }]);
    }
  }, [isOpen, initialData, mode]);

  // Recalcula o valor total sempre tolerando campos vazios
  useEffect(() => {
    if (mode === "create") {
      const total = itens.reduce(
        (sum, item) =>
          sum + (Number(item.qtd) || 0) * (Number(item.valor_unitario) || 0),
        0,
      );
      setFormData((prev) => ({ ...prev, valor_total: total }));
    }
  }, [itens, mode]);

  const handleAddItem = () => {
    setItens([...itens, { epi_catalogo_id: "", qtd: "", valor_unitario: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItens = itens.filter((_, i) => i !== index);
    setItens(newItens);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItens = [...itens];
    (newItens[index] as any)[field] = value;
    setItens(newItens);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      fornecedor_id: Number(formData.fornecedor_id),
      numero_nf: formData.numero_nf,
      data_emissao: formData.data_emissao,
      valor_total: formData.valor_total,
      itens: itens.map((item) => ({
        epi_catalogo_id: Number(item.epi_catalogo_id),
        qtd: Number(item.qtd),
        valor_unitario: Number(item.valor_unitario),
      })),
    };
    await onSave(payload);
  };

  const isReadOnly = mode === "view";

  const inputClasses = `
    w-full px-4 py-2.5 rounded-xl border transition-all duration-200
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
        mode === "create" ? "Registrar Entrada (NF)" : "Detalhes da Nota Fiscal"
      }
      maxWidth="4xl"
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
              Salvar Entrada
            </Button>
          </div>
        )
      }
    >
      <form onSubmit={handleSubmit} className="space-y-8 p-2">
        {/* SESSÃO 1: CABEÇALHO DA NF */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-800 pb-2">
            Dados da Nota Fiscal
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className={labelClasses}>Fornecedor *</label>
              <Combobox
                value={formData.fornecedor_id}
                onChange={(v) =>
                  setFormData({ ...formData, fornecedor_id: String(v) })
                }
                options={fornecedoresOptions}
                placeholder={
                  isFetchingData ? "A carregar..." : "Selecione o Fornecedor"
                }
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClasses}>Número da NF *</label>
              <input
                required
                type="text"
                disabled={isReadOnly}
                value={formData.numero_nf}
                onChange={(e) =>
                  setFormData({ ...formData, numero_nf: e.target.value })
                }
                placeholder="Ex: 999888"
                className={inputClasses}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClasses}>Data de Emissão *</label>
              <input
                required
                type="date"
                disabled={isReadOnly}
                value={formData.data_emissao}
                onChange={(e) =>
                  setFormData({ ...formData, data_emissao: e.target.value })
                }
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        {/* SESSÃO 2: ITENS DA NF */}
        <div className="space-y-4">
          {/* 2. Botão de "Adicionar Novo Item" no lugar do valor total */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              Itens da Nota
            </h4>

            {!isReadOnly && (
              <Button
                type="button"
                variant="ghost"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleAddItem}
                className="border border-dashed border-gray-300 dark:border-gray-700 text-sm py-1.5 px-3"
              >
                Adicionar Item
              </Button>
            )}
          </div>

          {/* 5. Removido o 'overflow-y-auto' para o dropdown do Combobox não ser cortado */}
          <div className="space-y-3 pt-2">
            {itens.map((item, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row gap-3 items-end bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/5"
              >
                <div className="w-full md:w-1/2 space-y-1.5">
                  <label className={labelClasses}>EPI *</label>
                  <Combobox
                    value={item.epi_catalogo_id}
                    onChange={(v) =>
                      handleItemChange(index, "epi_catalogo_id", String(v))
                    }
                    options={episOptions}
                    placeholder="Selecione o EPI"
                    disabled={isReadOnly}
                  />
                </div>

                <div className="w-full md:w-1/5 space-y-1.5">
                  <label className={labelClasses}>Quantidade *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    disabled={isReadOnly}
                    value={item.qtd}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "qtd",
                        e.target.value === "" ? "" : e.target.value,
                      )
                    }
                    className={inputClasses}
                  />
                </div>

                <div className="w-full md:w-1/4 space-y-1.5">
                  <label className={labelClasses}>Valor Unitário (R$) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    disabled={isReadOnly}
                    value={item.valor_unitario}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "valor_unitario",
                        e.target.value === "" ? "" : e.target.value,
                      )
                    }
                    className={inputClasses}
                  />
                </div>

                {!isReadOnly && itens.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-3 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/20 rounded-xl transition-colors mb-2px"
                    title="Remover Item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* 3. Valor Total realocado para baixo de todos os itens */}
          <div className="flex justify-end pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-lg font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-[#13161f] px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              Total da Nota: R$ {formData.valor_total.toFixed(2)}
            </div>
          </div>
        </div>

        {!isReadOnly && <button type="submit" className="hidden" />}
      </form>
    </Modal>
  );
}
