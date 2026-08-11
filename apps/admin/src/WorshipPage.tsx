import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ApiError } from "./api/client";
import {
  addWorshipOrderItem,
  createWorshipOrder,
  createWorshipOrderFromTemplate,
  getWorshipOrderByEvent,
  listApprovedWorshipEvents,
  listWorshipOrderTemplates,
  publishWorshipOrder,
} from "./api/worship";
import type { WorshipOrder, WorshipOrderTemplate } from "./api/worship";
import type { AgendaEvent } from "./api/dashboard";
import { WorshipOrderOperations } from "./WorshipOrderOperations";
import { WorshipRepertoirePanel } from "./WorshipRepertoirePanel";
import { WorshipTemplatePanel } from "./WorshipTemplatePanel";

type Props = {
  accessToken: string;
  currentUserId: string;
  canManageAnyOrder: boolean;
  canManageTemplates: boolean;
  onNotice: (message: string) => void;
};

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(new Date(value))
    .replace(".", "");
}

export function WorshipPage({
  accessToken,
  currentUserId,
  canManageAnyOrder,
  canManageTemplates,
  onNotice,
}: Props) {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [templates, setTemplates] = useState<WorshipOrderTemplate[]>([]);
  const [eventId, setEventId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [order, setOrder] = useState<WorshipOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const event = useMemo(
    () => events.find((item) => item.id === eventId) ?? null,
    [eventId, events],
  );
  const canManage =
    canManageAnyOrder || event?.createdByUserId === currentUserId;

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");
    void Promise.all([
      listApprovedWorshipEvents(accessToken),
      listWorshipOrderTemplates(accessToken),
    ])
      .then(([availableEvents, availableTemplates]) => {
        if (!active) return;
        setEvents(availableEvents);
        setTemplates(availableTemplates);
        setEventId((current) => current || availableEvents[0]?.id || "");
        setTemplateId(
          availableTemplates.find(
            (template) => template.padrao && template.ativo,
          )?.id ??
            availableTemplates.find((template) => template.ativo)?.id ??
            "",
        );
      })
      .catch((reason) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "Não foi possível carregar os cultos disponíveis.",
          );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!eventId) {
      setOrder(null);
      return;
    }
    let active = true;
    setIsLoadingOrder(true);
    setError("");
    void getWorshipOrderByEvent(accessToken, eventId)
      .then((loaded) => {
        if (active) setOrder(loaded);
      })
      .catch((reason) => {
        if (!active) return;
        if (reason instanceof ApiError && reason.status === 404) {
          setOrder(null);
          return;
        }
        setError(
          reason instanceof Error
            ? reason.message
            : "Não foi possível carregar esta ordem de culto.",
        );
      })
      .finally(() => {
        if (active) setIsLoadingOrder(false);
      });
    return () => {
      active = false;
    };
  }, [accessToken, eventId]);

  const create = (fromTemplate: boolean) => {
    if (!eventId) return;
    setError("");
    setIsSaving(true);
    const request = fromTemplate
      ? createWorshipOrderFromTemplate(
          accessToken,
          eventId,
          templateId || undefined,
        )
      : createWorshipOrder(accessToken, eventId);
    void request
      .then((created) => {
        setOrder(created);
        onNotice(
          fromTemplate
            ? "Ordem de culto criada a partir do modelo selecionado."
            : "Ordem de culto criada em branco.",
        );
      })
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Não foi possível criar a ordem de culto.",
        ),
      )
      .finally(() => setIsSaving(false));
  };

  const addItem = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    if (!order) return;
    const form = formEvent.currentTarget;
    const data = new FormData(form);
    const serviceAreaId = String(data.get("serviceAreaId") ?? "") || undefined;
    setError("");
    setIsSaving(true);
    void addWorshipOrderItem(accessToken, order.id, {
      sequencia: Math.max(0, ...order.items.map((item) => item.sequencia)) + 1,
      titulo: String(data.get("title") ?? "").trim(),
      horario: String(data.get("time") ?? "") || undefined,
      serviceAreaId,
      observacoes: String(data.get("notes") ?? "").trim() || undefined,
    })
      .then((item) => {
        setOrder((current) =>
          current?.id === order.id
            ? { ...current, items: [...current.items, item] }
            : current,
        );
        form.reset();
        onNotice(
          serviceAreaId
            ? "Item adicionado e solicitação enviada à liderança da área."
            : "Item adicionado à ordem de culto.",
        );
      })
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Não foi possível adicionar este item.",
        ),
      )
      .finally(() => setIsSaving(false));
  };

  const publish = () => {
    if (!order) return;
    setError("");
    setIsSaving(true);
    void publishWorshipOrder(accessToken, order.id)
      .then((published) => {
        setOrder(published);
        onNotice(
          "Ordem de culto publicada. As áreas envolvidas foram notificadas.",
        );
      })
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Não foi possível publicar a ordem de culto.",
        ),
      )
      .finally(() => setIsSaving(false));
  };

  return (
    <section className="worship-page">
      <header className="worship-intro">
        <div>
          <p className="eyebrow">Cultos</p>
          <h2>Ordem de Culto</h2>
          <p>
            Escolha um culto aprovado, aplique o modelo da igreja e organize a
            sequência antes da publicação.
          </p>
        </div>
      </header>
      {isLoading ? (
        <p className="worship-feedback">Carregando cultos e modelos...</p>
      ) : error && !event ? (
        <p className="form-error">{error}</p>
      ) : (
        <>
          <WorshipTemplatePanel
            templates={templates}
            accessToken={accessToken}
            canManage={canManageTemplates}
            onTemplatesChange={setTemplates}
            onNotice={onNotice}
          />
          {!events.length ? (
            <p className="worship-feedback">
              Não há cultos aprovados na agenda para montar uma ordem.
            </p>
          ) : (
            <>
              <label className="worship-event-select">
                Culto aprovado
                <select
                  value={eventId}
                  onChange={(changeEvent) =>
                    setEventId(changeEvent.target.value)
                  }
                >
                  {events.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.titulo} · {formatEventDate(item.inicio)} ·{" "}
                      {item.campus.nome}
                    </option>
                  ))}
                </select>
              </label>
              {isLoadingOrder ? (
                <p className="worship-feedback">Carregando ordem de culto...</p>
              ) : !order ? (
                <section className="worship-empty">
                  <h3>Este culto ainda não possui ordem.</h3>
                  <p>
                    Comece com uma ordem em branco ou aplique um modelo ativo da
                    organização.
                  </p>
                  {canManage ? (
                    <div className="worship-create-actions">
                      <label>
                        Modelo
                        <select
                          value={templateId}
                          onChange={(changeEvent) =>
                            setTemplateId(changeEvent.target.value)
                          }
                          disabled={
                            isSaving ||
                            !templates.some((template) => template.ativo)
                          }
                        >
                          <option value="">Modelo padrão ativo</option>
                          {templates
                            .filter((template) => template.ativo)
                            .map((template) => (
                              <option value={template.id} key={template.id}>
                                {template.nome}
                                {template.padrao ? " · padrão" : ""}
                              </option>
                            ))}
                        </select>
                      </label>
                      <button
                        className="secondary-button"
                        type="button"
                        disabled={isSaving}
                        onClick={() => create(false)}
                      >
                        Criar em branco
                      </button>
                      <button
                        className="primary-button"
                        type="button"
                        disabled={
                          isSaving ||
                          !templates.some((template) => template.ativo)
                        }
                        onClick={() => create(true)}
                      >
                        {isSaving ? "Criando..." : "Aplicar modelo"}
                      </button>
                    </div>
                  ) : (
                    <p className="worship-feedback">
                      Seu perfil pode consultar a ordem quando ela for criada,
                      mas não iniciar este fluxo.
                    </p>
                  )}
                </section>
              ) : (
                <>
                  <section className="worship-order">
                    <header>
                      <div>
                        <p className="eyebrow">
                          {order.status === "DRAFT" ? "Rascunho" : "Publicado"}
                        </p>
                        <h3>{event?.titulo}</h3>
                        <small>
                          {order.template
                            ? `Baseado em ${order.template.nome}`
                            : "Ordem criada sem modelo"}
                        </small>
                      </div>
                      <span
                        className={`worship-status worship-status--${order.status.toLowerCase()}`}
                      >
                        {order.status === "DRAFT" ? "Em edição" : "Publicada"}
                      </span>
                    </header>
                    <ol className="worship-item-list">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          <span>{item.sequencia}</span>
                          <div>
                            <strong>{item.titulo}</strong>
                            <small>
                              {[
                                item.horario,
                                item.serviceArea?.nome,
                                item.observacoes,
                              ]
                                .filter(Boolean)
                                .join(" · ") || "Sem detalhes adicionais"}
                            </small>
                          </div>
                        </li>
                      ))}
                    </ol>
                    {order.status === "DRAFT" && canManage && (
                      <form className="worship-item-form" onSubmit={addItem}>
                        <h4>Adicionar item especial</h4>
                        <div className="form-grid">
                          <label>
                            Título
                            <input
                              name="title"
                              required
                              minLength={2}
                              placeholder="Ex.: Teatro Minuto"
                            />
                          </label>
                          <label>
                            Horário{" "}
                            <span className="field-optional">(opcional)</span>
                            <input name="time" type="time" />
                          </label>
                        </div>
                        <label>
                          Área de Serviço{" "}
                          <span className="field-optional">(opcional)</span>
                          <select name="serviceAreaId" defaultValue="">
                            <option value="">Nenhuma área específica</option>
                            {order.event.serviceAreas.map((item) => (
                              <option
                                value={item.serviceAreaId}
                                key={item.serviceAreaId}
                              >
                                {item.serviceArea.nome}
                              </option>
                            ))}
                          </select>
                          <small className="worship-routing-note">
                            Ao escolher uma área, será criada uma solicitação e
                            a liderança responsável será avisada.
                          </small>
                        </label>
                        <label>
                          Observações{" "}
                          <span className="field-optional">(opcional)</span>
                          <input
                            name="notes"
                            placeholder="Orientação para este momento"
                          />
                        </label>
                        <div className="dialog-actions">
                          <button
                            className="secondary-button"
                            type="submit"
                            disabled={isSaving}
                          >
                            {isSaving ? "Salvando..." : "+ Adicionar item"}
                          </button>
                          <button
                            className="primary-button"
                            type="button"
                            disabled={isSaving || order.items.length === 0}
                            onClick={publish}
                          >
                            {isSaving ? "Publicando..." : "Publicar ordem"}
                          </button>
                        </div>
                      </form>
                    )}
                    {error && <p className="form-error">{error}</p>}
                  </section>
                  <WorshipOrderOperations
                    order={order}
                    accessToken={accessToken}
                    canManage={canManage}
                    onOrderChange={setOrder}
                    onNotice={onNotice}
                  />
                  <WorshipRepertoirePanel
                    event={event!}
                    order={order}
                    accessToken={accessToken}
                    onNotice={onNotice}
                  />
                </>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
