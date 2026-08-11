import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  addWorshipOrderDemand,
  addWorshipOrderMaterial,
  deleteWorshipOrderItem,
  downloadWorshipOrderPdf,
  reorderWorshipOrderItems,
  sendWorshipOrderAlert,
  updateWorshipOrderItem,
} from "./api/worship";
import type { WorshipOrder } from "./api/worship";

type Props = {
  order: WorshipOrder;
  accessToken: string;
  canManage: boolean;
  onOrderChange: (order: WorshipOrder) => void;
  onNotice: (message: string) => void;
};

export function WorshipOrderOperations({
  order,
  accessToken,
  canManage,
  onOrderChange,
  onNotice,
}: Props) {
  const [itemId, setItemId] = useState(order.items[0]?.id ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const selectedItem = useMemo(
    () => order.items.find((item) => item.id === itemId) ?? null,
    [itemId, order.items],
  );

  useEffect(() => {
    if (!order.items.some((item) => item.id === itemId))
      setItemId(order.items[0]?.id ?? "");
  }, [itemId, order.items]);

  const run = (action: () => Promise<void>) => {
    setError("");
    setIsSaving(true);
    void action()
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Não foi possível concluir esta ação.",
        ),
      )
      .finally(() => setIsSaving(false));
  };

  const move = (direction: -1 | 1) => {
    if (!selectedItem) return;
    const currentIndex = order.items.findIndex(
      (item) => item.id === selectedItem.id,
    );
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= order.items.length) return;
    const reordered = [...order.items];
    [reordered[currentIndex], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[currentIndex],
    ];
    run(async () => {
      const updated = await reorderWorshipOrderItems(
        accessToken,
        order.id,
        reordered.map((item, index) => ({ id: item.id, sequencia: index + 1 })),
      );
      onOrderChange(updated);
      onNotice("Sequência da ordem de culto atualizada.");
    });
  };

  const remove = () => {
    if (!selectedItem) return;
    run(async () => {
      await deleteWorshipOrderItem(accessToken, selectedItem.id);
      const remaining = order.items.filter(
        (item) => item.id !== selectedItem.id,
      );
      const updated = remaining.length
        ? await reorderWorshipOrderItems(
            accessToken,
            order.id,
            remaining.map((item, index) => ({
              id: item.id,
              sequencia: index + 1,
            })),
          )
        : { ...order, items: [] };
      onOrderChange(updated);
      onNotice(
        selectedItem.serviceArea
          ? "Item removido e liderança da área avisada."
          : "Item removido da ordem de culto.",
      );
    });
  };

  const addMaterial = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    if (!selectedItem) return;
    const form = formEvent.currentTarget;
    const data = new FormData(form);
    run(async () => {
      const material = await addWorshipOrderMaterial(
        accessToken,
        selectedItem.id,
        {
          type: String(data.get("type")),
          titulo: String(data.get("title")).trim(),
          referencia: String(data.get("reference") ?? "").trim() || undefined,
        },
      );
      onOrderChange({
        ...order,
        items: order.items.map((item) =>
          item.id === selectedItem.id
            ? { ...item, materials: [...item.materials, material] }
            : item,
        ),
      });
      form.reset();
      onNotice("Material vinculado ao item da ordem de culto.");
    });
  };

  const addDemand = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    if (!selectedItem) return;
    const form = formEvent.currentTarget;
    const data = new FormData(form);
    const dueAt = String(data.get("dueAt") ?? "");
    run(async () => {
      const demand = await addWorshipOrderDemand(accessToken, selectedItem.id, {
        descricao: String(data.get("description")).trim(),
        serviceAreaId: String(data.get("serviceAreaId")),
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      });
      onOrderChange({
        ...order,
        items: order.items.map((item) =>
          item.id === selectedItem.id
            ? { ...item, demands: [...item.demands, demand] }
            : item,
        ),
      });
      form.reset();
      onNotice("Demanda criada e enviada para a Área de Serviço.");
    });
  };

  const editItem = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    if (!selectedItem) return;
    const data = new FormData(formEvent.currentTarget);
    run(async () => {
      const updated = await updateWorshipOrderItem(
        accessToken,
        selectedItem.id,
        {
          titulo: String(data.get("title")).trim(),
          horario: String(data.get("time") ?? "") || undefined,
          serviceAreaId: String(data.get("serviceAreaId") ?? "") || undefined,
          observacoes: String(data.get("notes") ?? "").trim() || undefined,
        },
      );
      onOrderChange({
        ...order,
        items: order.items.map((item) =>
          item.id === updated.id ? updated : item,
        ),
      });
      setIsEditing(false);
      onNotice(
        selectedItem.serviceArea?.id !== updated.serviceArea?.id &&
          updated.serviceArea
          ? "Item atualizado e liderança da nova área avisada."
          : "Item da ordem de culto atualizado.",
      );
    });
  };

  const sendAlert = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    const data = new FormData(formEvent.currentTarget);
    run(async () => {
      await sendWorshipOrderAlert(accessToken, order.id, {
        titulo: String(data.get("title")).trim(),
        mensagem: String(data.get("message")).trim(),
      });
      onNotice("Alerta enviado aos participantes do culto.");
    });
  };

  const downloadPdf = () => {
    run(async () => {
      const { blob, filename } = await downloadWorshipOrderPdf(
        accessToken,
        order.id,
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      onNotice("PDF da ordem de culto preparado para download.");
    });
  };

  if (order.status === "PUBLISHED")
    return (
      <section className="worship-operations">
        <header>
          <div>
            <p className="eyebrow">Comunicação</p>
            <h4>Ordem publicada</h4>
          </div>
          <button
            className="secondary-button"
            type="button"
            disabled={!canManage || isSaving}
            onClick={downloadPdf}
          >
            Baixar PDF
          </button>
        </header>
        {canManage && (
          <form className="worship-alert-form" onSubmit={sendAlert}>
            <label>
              Título
              <input
                name="title"
                required
                minLength={3}
                defaultValue="Ordem de culto publicada"
              />
            </label>
            <label>
              Mensagem
              <input
                name="message"
                required
                minLength={3}
                defaultValue="A ordem está disponível. Confira sua escala, materiais e pendências."
              />
            </label>
            <button
              className="primary-button"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? "Enviando..." : "Enviar alerta"}
            </button>
          </form>
        )}
        {error && <p className="form-error">{error}</p>}
      </section>
    );

  if (!canManage || !selectedItem) return null;
  return (
    <section className="worship-operations">
      <header>
        <div>
          <p className="eyebrow">Produção</p>
          <h4>Materiais e demandas</h4>
        </div>
      </header>
      <div className="worship-operations-content">
        <label>
          Item da ordem
          <select
            value={itemId}
            onChange={(changeEvent) => {
              setItemId(changeEvent.target.value);
              setIsEditing(false);
            }}
            disabled={isSaving}
          >
            {order.items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.sequencia}. {item.titulo}
              </option>
            ))}
          </select>
        </label>
        <div className="worship-item-actions">
          <button
            className="secondary-button"
            type="button"
            disabled={isSaving || order.items[0]?.id === selectedItem.id}
            onClick={() => move(-1)}
          >
            ↑ Subir
          </button>
          <button
            className="secondary-button"
            type="button"
            disabled={
              isSaving ||
              order.items[order.items.length - 1]?.id === selectedItem.id
            }
            onClick={() => move(1)}
          >
            ↓ Descer
          </button>
          <button
            className="secondary-button"
            type="button"
            disabled={isSaving}
            onClick={() => setIsEditing((current) => !current)}
          >
            {isEditing ? "Fechar edição" : "Editar item"}
          </button>
          <button
            className="member-end-button"
            type="button"
            disabled={isSaving}
            onClick={remove}
          >
            Remover item
          </button>
        </div>
        {isEditing && (
          <form className="worship-edit-form" onSubmit={editItem}>
            <div className="form-grid">
              <label>
                Título
                <input
                  name="title"
                  required
                  minLength={2}
                  defaultValue={selectedItem.titulo}
                />
              </label>
              <label>
                Horário <span className="field-optional">(opcional)</span>
                <input
                  name="time"
                  type="time"
                  defaultValue={selectedItem.horario ?? ""}
                />
              </label>
            </div>
            <label>
              Área de Serviço
              <select
                name="serviceAreaId"
                defaultValue={selectedItem.serviceArea?.id ?? ""}
              >
                <option value="">Sem área específica</option>
                {order.event.serviceAreas.map((area) => (
                  <option key={area.serviceAreaId} value={area.serviceAreaId}>
                    {area.serviceArea.nome}
                  </option>
                ))}
              </select>
              <small className="worship-routing-note">
                Ao direcionar para outra área, a liderança dela receberá um
                aviso.
              </small>
            </label>
            <label>
              Observações <span className="field-optional">(opcional)</span>
              <input
                name="notes"
                defaultValue={selectedItem.observacoes ?? ""}
              />
            </label>
            <button
              className="secondary-button"
              type="submit"
              disabled={isSaving}
            >
              Salvar item
            </button>
          </form>
        )}
        <div className="worship-operation-forms">
          <form onSubmit={addMaterial}>
            <strong>Adicionar material</strong>
            <label>
              Tipo
              <select name="type" defaultValue="PRESENTATION">
                <option value="CARD">Card</option>
                <option value="VIDEO">Vídeo</option>
                <option value="PRESENTATION">Apresentação</option>
                <option value="MUSIC">Música</option>
                <option value="PRO_PRESENTER">ProPresenter</option>
                <option value="OTHER">Outro</option>
              </select>
            </label>
            <label>
              Título
              <input
                name="title"
                required
                minLength={2}
                placeholder="Ex.: Letras do louvor"
              />
            </label>
            <label>
              Referência <span className="field-optional">(opcional)</span>
              <input
                name="reference"
                placeholder="Link ou identificação do arquivo"
              />
            </label>
            <button
              className="secondary-button"
              type="submit"
              disabled={isSaving}
            >
              + Material
            </button>
          </form>
          <form onSubmit={addDemand}>
            <strong>Adicionar demanda</strong>
            <label>
              Descrição
              <input
                name="description"
                required
                minLength={3}
                placeholder="Ex.: Conferir projeção"
              />
            </label>
            <label>
              Área responsável
              <select name="serviceAreaId" required defaultValue="">
                <option value="" disabled>
                  Selecione a área
                </option>
                {order.event.serviceAreas.map((area) => (
                  <option key={area.serviceAreaId} value={area.serviceAreaId}>
                    {area.serviceArea.nome}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Prazo <span className="field-optional">(opcional)</span>
              <input name="dueAt" type="datetime-local" />
            </label>
            <button
              className="secondary-button"
              type="submit"
              disabled={isSaving}
            >
              + Demanda
            </button>
          </form>
        </div>
        {selectedItem.materials.length > 0 && (
          <p className="worship-operation-summary">
            <strong>Materiais:</strong>{" "}
            {selectedItem.materials.map((item) => item.titulo).join(" · ")}
          </p>
        )}
        {selectedItem.demands.length > 0 && (
          <p className="worship-operation-summary">
            <strong>Demandas:</strong>{" "}
            {selectedItem.demands
              .map((item) => `${item.descricao} (${item.status})`)
              .join(" · ")}
          </p>
        )}
        {error && <p className="form-error">{error}</p>}
      </div>
    </section>
  );
}
