import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  addWorshipOrderDemand,
  addWorshipOrderMaterial,
  cancelWorshipOrderDemand,
  completeWorshipOrderDemand,
  deleteWorshipOrderItem,
  downloadWorshipOrderPdf,
  reorderWorshipOrderItems,
  sendWorshipOrderAlert,
  updateWorshipOrderItem,
} from "./api/worship";
import type { WorshipOrder } from "./api/worship";
import type { PersonListItem } from "./api/directory";
import { WorshipPersonAutocomplete } from "./WorshipPersonAutocomplete";

type Props = {
  order: WorshipOrder;
  accessToken: string;
  canManage: boolean;
  people: PersonListItem[];
  isLoadingPeople: boolean;
  onOrderChange: (order: WorshipOrder) => void;
  onNotice: (message: string) => void;
};

export function WorshipOrderOperations({
  order,
  accessToken,
  canManage,
  people,
  isLoadingPeople,
  onOrderChange,
  onNotice,
}: Props) {
  const [itemId, setItemId] = useState(order.items[0]?.id ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingResponsiblePersonId, setEditingResponsiblePersonId] =
    useState("");
  const [editingResponsiblePersonSearch, setEditingResponsiblePersonSearch] =
    useState("");
  const [demandResponsiblePersonId, setDemandResponsiblePersonId] = useState("");
  const [demandResponsiblePersonSearch, setDemandResponsiblePersonSearch] =
    useState("");
  const selectedItem = useMemo(
    () => order.items.find((item) => item.id === itemId) ?? null,
    [itemId, order.items],
  );

  useEffect(() => {
    if (!order.items.some((item) => item.id === itemId))
      setItemId(order.items[0]?.id ?? "");
  }, [itemId, order.items]);

  useEffect(() => {
    setEditingResponsiblePersonId(selectedItem?.responsiblePerson?.id ?? "");
    setEditingResponsiblePersonSearch(selectedItem?.responsiblePerson?.nome ?? "");
  }, [itemId, selectedItem?.responsiblePerson?.id, selectedItem?.responsiblePerson?.nome]);

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
        responsiblePersonId: demandResponsiblePersonId || undefined,
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
      setDemandResponsiblePersonId("");
      setDemandResponsiblePersonSearch("");
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
          responsiblePersonId: editingResponsiblePersonId || undefined,
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

  const replaceDemand = (demandId: string, nextDemand: WorshipOrder["items"][number]["demands"][number]) => {
    onOrderChange({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        demands: item.demands.map((demand) =>
          demand.id === demandId ? nextDemand : demand,
        ),
      })),
    });
  };

  const completeDemand = (demandId: string) => {
    run(async () => {
      replaceDemand(
        demandId,
        await completeWorshipOrderDemand(accessToken, demandId),
      );
      onNotice("Demanda marcada como concluída.");
    });
  };

  const cancelDemand = (demandId: string) => {
    if (!window.confirm("Cancelar esta demanda?")) return;
    run(async () => {
      replaceDemand(
        demandId,
        await cancelWorshipOrderDemand(accessToken, demandId),
      );
      onNotice("Demanda cancelada.");
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
      <>
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
        <WorshipOrderWorkSummary
          order={order}
          canManage={canManage}
          isSaving={isSaving}
          onComplete={completeDemand}
          onCancel={cancelDemand}
        />
      </>
    );

  if (!selectedItem)
    return (
      <WorshipOrderWorkSummary
        order={order}
        canManage={canManage}
        isSaving={isSaving}
        onComplete={completeDemand}
        onCancel={cancelDemand}
      />
    );
  if (!canManage)
    return (
      <WorshipOrderWorkSummary
        order={order}
        canManage={canManage}
        isSaving={isSaving}
        onComplete={completeDemand}
        onCancel={cancelDemand}
      />
    );
  return (
    <>
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
              Pessoa responsável{" "}
              <span className="field-optional">(opcional)</span>
              <WorshipPersonAutocomplete
                people={people}
                selectedPersonId={editingResponsiblePersonId}
                search={editingResponsiblePersonSearch}
                disabled={isLoadingPeople || isSaving}
                onSearchChange={(value) => {
                  setEditingResponsiblePersonId("");
                  setEditingResponsiblePersonSearch(value);
                }}
                onSelect={(person) => {
                  setEditingResponsiblePersonId(person.id);
                  setEditingResponsiblePersonSearch(person.nome);
                }}
              />
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
              Pessoa responsável{" "}
              <span className="field-optional">(opcional)</span>
              <WorshipPersonAutocomplete
                people={people}
                selectedPersonId={demandResponsiblePersonId}
                search={demandResponsiblePersonSearch}
                disabled={isLoadingPeople || isSaving}
                emptyMessage="Nenhuma pessoa ativa encontrada."
                onSearchChange={(value) => {
                  setDemandResponsiblePersonId("");
                  setDemandResponsiblePersonSearch(value);
                }}
                onSelect={(person) => {
                  setDemandResponsiblePersonId(person.id);
                  setDemandResponsiblePersonSearch(person.nome);
                }}
              />
              <small className="worship-routing-note">
                A pessoa escolhida precisa possuir vínculo ativo com a área responsável.
              </small>
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
      <WorshipOrderWorkSummary
        order={order}
        canManage={canManage}
        isSaving={isSaving}
        onComplete={completeDemand}
        onCancel={cancelDemand}
      />
    </>
  );
}

function WorshipOrderWorkSummary({
  order,
  canManage,
  isSaving,
  onComplete,
  onCancel,
}: {
  order: WorshipOrder;
  canManage: boolean;
  isSaving: boolean;
  onComplete: (demandId: string) => void;
  onCancel: (demandId: string) => void;
}) {
  const demands = order.items.flatMap((item) =>
    item.demands.map((demand) => ({ ...demand, itemTitle: item.titulo })),
  );
  const scheduleStatus: Record<
    WorshipOrder["event"]["schedules"][number]["status"],
    string
  > = {
    SCHEDULED: "Pendente de confirmação",
    CONFIRMED: "Confirmada",
    DECLINED: "Recusada",
    COMPLETED: "Concluída",
  };

  return (
    <div className="worship-work-summary">
      <section className="worship-operations">
        <header>
          <div>
            <p className="eyebrow">Escalas</p>
            <h4>Participantes do culto</h4>
          </div>
          <small>Somente consulta</small>
        </header>
        {order.event.schedules.length ? (
          <ul className="worship-work-list">
            {order.event.schedules.map((schedule) => (
              <li key={schedule.id}>
                <div>
                  <strong>{schedule.person.nome}</strong>
                  <small>
                    {schedule.team.serviceArea.nome} · {schedule.team.nome} · {schedule.funcao}
                  </small>
                </div>
                <span>{scheduleStatus[schedule.status]}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="worship-work-empty">
            Ainda não há pessoas escaladas para este culto.
          </p>
        )}
      </section>
      <section className="worship-operations">
        <header>
          <div>
            <p className="eyebrow">Pendências</p>
            <h4>Demandas por área</h4>
          </div>
          <span>{demands.length}</span>
        </header>
        {demands.length ? (
          <ul className="worship-work-list">
            {demands.map((demand) => (
              <li key={demand.id}>
                <div>
                  <strong>{demand.descricao}</strong>
                  <small>
                    {demand.itemTitle} · {demand.serviceArea.nome}
                    {demand.responsiblePerson
                      ? ` · Responsável: ${demand.responsiblePerson.nome}`
                      : " · Sem responsável definido"}
                    {demand.dueAt
                      ? ` · Prazo: ${new Intl.DateTimeFormat("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(demand.dueAt))}`
                      : ""}
                  </small>
                </div>
                <div className="worship-demand-actions">
                  <span className={`worship-demand-status worship-demand-status--${demand.status.toLowerCase()}`}>
                    {demand.status === "PENDING"
                      ? "Pendente"
                      : demand.status === "COMPLETED"
                        ? "Concluída"
                        : "Cancelada"}
                  </span>
                  {demand.status === "PENDING" && (
                    <button
                      className="secondary-button"
                      type="button"
                      disabled={isSaving}
                      onClick={() => onComplete(demand.id)}
                    >
                      Concluir
                    </button>
                  )}
                  {demand.status === "PENDING" && canManage && (
                    <button
                      className="member-end-button"
                      type="button"
                      disabled={isSaving}
                      onClick={() => onCancel(demand.id)}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="worship-work-empty">
            Não há demandas registradas nesta Ordem de Culto.
          </p>
        )}
      </section>
    </div>
  );
}
