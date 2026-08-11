import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  addWorshipRepertoireSong,
  approveWorshipRepertoire,
  createWorshipRepertoire,
  listWorshipRepertoires,
  returnWorshipRepertoire,
  sendWorshipRepertoireToOrder,
  submitWorshipRepertoire,
} from "./api/repertoire";
import type { WorshipRepertoire } from "./api/repertoire";
import type { AgendaEvent } from "./api/dashboard";
import { getWorshipOrderByEvent } from "./api/worship";
import type { WorshipOrder } from "./api/worship";

const statusLabels: Record<WorshipRepertoire["status"], string> = {
  DRAFT: "Rascunho",
  SUBMITTED: "Aguardando aprovação",
  RETURNED: "Devolvido para ajuste",
  APPROVED: "Aprovado",
  SENT_TO_WORSHIP_ORDER: "Enviado à Ordem de Culto",
  COMPLETED: "Concluído",
};

const cachoeirinhaMoments = [
  "Celebração · início do culto",
  "Celebração ou POP",
  "Oração",
  "Dízimos e ofertas",
  "Celebração · final do culto",
];

export function WorshipRepertoirePanel({
  event,
  order,
  accessToken,
  onOrderChange,
  onNotice,
}: {
  event: AgendaEvent;
  order: WorshipOrder | null;
  accessToken: string;
  onOrderChange: (order: WorshipOrder) => void;
  onNotice: (message: string) => void;
}) {
  const [items, setItems] = useState<WorshipRepertoire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [returningId, setReturningId] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");
    void listWorshipRepertoires(accessToken, event.id)
      .then((repertoires) => {
        if (active) setItems(repertoires);
      })
      .catch((reason) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "Não foi possível carregar os repertórios.",
          );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [accessToken, event.id]);
  const replace = (repertoire: WorshipRepertoire) =>
    setItems((current) =>
      current.map((item) => (item.id === repertoire.id ? repertoire : item)),
    );
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
  const create = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    const form = formEvent.currentTarget;
    const data = new FormData(form);
    run(async () => {
      const created = await createWorshipRepertoire(accessToken, {
        eventId: event.id,
        serviceAreaId: String(data.get("serviceAreaId")),
        songs: [
          {
            sequencia: 1,
            titulo: String(data.get("title")).trim(),
            tom: String(data.get("key") ?? "") || undefined,
            artista: String(data.get("artist") ?? "") || undefined,
            referencia: String(data.get("reference") ?? "") || undefined,
            observacoes: String(data.get("moment") ?? "") || undefined,
          },
        ],
      });
      setItems((current) => [...current, created]);
      form.reset();
      onNotice("Repertório criado em rascunho.");
    });
  };
  const addSong = (
    repertoire: WorshipRepertoire,
    formEvent: FormEvent<HTMLFormElement>,
  ) => {
    formEvent.preventDefault();
    const form = formEvent.currentTarget;
    const data = new FormData(form);
    run(async () => {
      const song = await addWorshipRepertoireSong(accessToken, repertoire.id, {
        sequencia:
          Math.max(0, ...repertoire.songs.map((item) => item.sequencia)) + 1,
        titulo: String(data.get("title")).trim(),
        tom: String(data.get("key") ?? "") || undefined,
        artista: String(data.get("artist") ?? "") || undefined,
        referencia: String(data.get("reference") ?? "") || undefined,
        observacoes: String(data.get("moment") ?? "") || undefined,
      });
      replace({ ...repertoire, songs: [...repertoire.songs, song] });
      form.reset();
      onNotice("Música adicionada ao repertório.");
    });
  };
  const send = (
    repertoire: WorshipRepertoire,
    formEvent: FormEvent<HTMLFormElement>,
  ) => {
    formEvent.preventDefault();
    const data = new FormData(formEvent.currentTarget);
    run(async () => {
      const updated = await sendWorshipRepertoireToOrder(
        accessToken,
        repertoire.id,
        {
          orderItemId: String(data.get("orderItemId") ?? "") || undefined,
          receivingServiceAreaId: String(data.get("receivingAreaId")),
          dueAt: String(data.get("dueAt") ?? "")
            ? new Date(String(data.get("dueAt"))).toISOString()
            : undefined,
        },
      );
      replace(updated);
      onOrderChange(await getWorshipOrderByEvent(accessToken, event.id));
      onNotice("Repertório encaminhado para a Ordem de Culto.");
    });
  };
  return (
    <section className="worship-repertoire">
      <header>
        <div>
          <p className="eyebrow">Louvor</p>
          <h3>Repertório do culto</h3>
          <small>Formato padrão · Culto Cachoeirinha</small>
        </div>
        <span>{items.length}</span>
      </header>
      <div className="worship-repertoire-content">
        <ol className="repertoire-guide" aria-label="Roteiro padrão de envio das músicas">
          {cachoeirinhaMoments.map((moment, index) => <li key={moment}><b>{index + 1}</b>{moment}</li>)}
        </ol>
        {isLoading ? (
          <p className="worship-feedback">Carregando repertórios...</p>
        ) : (
          <>
            {items.map((repertoire) => (
              <article className="repertoire-card" key={repertoire.id}>
                <header>
                  <div>
                    <strong>{repertoire.serviceArea.nome}</strong>
                    <small>
                      {statusLabels[repertoire.status]}
                      {repertoire.isLateSubmission ? " · envio em atraso" : ""}
                    </small>
                  </div>
                  <span
                    className={`repertoire-status repertoire-status--${repertoire.status.toLowerCase()}`}
                  >
                    {statusLabels[repertoire.status]}
                  </span>
                </header>
                {repertoire.reviewComment && (
                  <p className="repertoire-comment">
                    {repertoire.reviewComment}
                  </p>
                )}
                <ol>
                  {repertoire.songs.map((song) => (
                    <li key={song.id}>
                      <b>{song.sequencia}</b>
                      <span>
                        {song.titulo}
                        {song.tom ? ` · ${song.tom}` : ""}
                        {song.artista ? ` · ${song.artista}` : ""}
                        {song.observacoes ? ` · ${song.observacoes}` : ""}
                      </span>
                    </li>
                  ))}
                </ol>
                {["DRAFT", "RETURNED"].includes(repertoire.status) && (
                  <form
                    className="repertoire-song-form"
                    onSubmit={(formEvent) => addSong(repertoire, formEvent)}
                  >
                    <input
                      name="title"
                      required
                      minLength={2}
                      placeholder="Nova música"
                    />
                    <input name="key" placeholder="Tom" />
                    <input name="artist" placeholder="Artista" />
                    <select name="moment" defaultValue="">
                      <option value="">Momento no culto (opcional)</option>
                      {cachoeirinhaMoments.map((moment) => <option key={moment} value={moment}>{moment}</option>)}
                    </select>
                    <input name="reference" type="url" placeholder="Link da versão no YouTube" />
                    <button
                      className="secondary-button"
                      type="submit"
                      disabled={isSaving}
                    >
                      + Música
                    </button>
                    <button
                      className="primary-button"
                      type="button"
                      disabled={isSaving}
                      onClick={() =>
                        run(async () => {
                          const updated = await submitWorshipRepertoire(
                            accessToken,
                            repertoire.id,
                          );
                          replace(updated);
                          onNotice("Repertório enviado para aprovação.");
                        })
                      }
                    >
                      Enviar para aprovação
                    </button>
                  </form>
                )}
                {repertoire.status === "SUBMITTED" && (
                  <div className="repertoire-review-actions">
                    <button
                      className="primary-button"
                      type="button"
                      disabled={isSaving}
                      onClick={() =>
                        run(async () => {
                          const updated = await approveWorshipRepertoire(
                            accessToken,
                            repertoire.id,
                          );
                          replace(updated);
                          onNotice("Repertório aprovado.");
                        })
                      }
                    >
                      Aprovar
                    </button>
                    <button
                      className="secondary-button"
                      type="button"
                      disabled={isSaving}
                      onClick={() => setReturningId(repertoire.id)}
                    >
                      Devolver
                    </button>
                    {returningId === repertoire.id && (
                      <form
                        onSubmit={(formEvent) => {
                          formEvent.preventDefault();
                          const comment = String(
                            new FormData(formEvent.currentTarget).get(
                              "comment",
                            ),
                          ).trim();
                          if (comment)
                            run(async () => {
                              const updated = await returnWorshipRepertoire(
                                accessToken,
                                repertoire.id,
                                comment,
                              );
                              replace(updated);
                              setReturningId(null);
                              onNotice("Repertório devolvido para ajuste.");
                            });
                        }}
                      >
                        <input
                          name="comment"
                          required
                          minLength={3}
                          placeholder="Orientação para ajuste"
                        />
                        <button className="secondary-button" type="submit">
                          Confirmar devolução
                        </button>
                      </form>
                    )}
                  </div>
                )}
                {repertoire.status === "APPROVED" && (
                  <form
                    className="repertoire-send-form"
                    onSubmit={(formEvent) => send(repertoire, formEvent)}
                  >
                    {order ? (
                      <>
                        <select name="orderItemId" defaultValue="">
                          <option value="">
                            Distribuir pelas posições do modelo
                          </option>
                          {order.items
                            .filter(
                              (item) =>
                                item.serviceArea?.id ===
                                repertoire.serviceAreaId,
                            )
                            .map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.sequencia}. {item.titulo}
                              </option>
                            ))}
                        </select>
                        <small className="repertoire-routing-note">Com o modelo Cachoeirinha aplicado, cada música segue para o momento escolhido no repertório. Escolha um item manual apenas para uma ordem diferente.</small>
                        <select name="receivingAreaId" required defaultValue="">
                          <option value="" disabled>
                            Área que receberá
                          </option>
                          {event.serviceAreas
                            .filter(
                              (area) =>
                                area.serviceAreaId !== repertoire.serviceAreaId,
                            )
                            .map((area) => (
                              <option
                                key={area.serviceAreaId}
                                value={area.serviceAreaId}
                              >
                                {area.serviceArea.nome}
                              </option>
                            ))}
                        </select>
                        <input name="dueAt" type="datetime-local" />
                        <button
                          className="primary-button"
                          type="submit"
                          disabled={isSaving}
                        >
                          Encaminhar à Ordem
                        </button>
                      </>
                    ) : (
                      <p className="repertoire-comment">
                        Crie a Ordem de Culto e o item Louvor antes de
                        encaminhar este repertório.
                      </p>
                    )}
                  </form>
                )}
              </article>
            ))}
            <form className="repertoire-create-form" onSubmit={create}>
              <h4>Novo repertório</h4>
              <select name="serviceAreaId" required defaultValue="">
                <option value="" disabled>
                  Área de Música envolvida
                </option>
                {event.serviceAreas.map((area) => (
                  <option key={area.serviceAreaId} value={area.serviceAreaId}>
                    {area.serviceArea.nome}
                  </option>
                ))}
              </select>
              <input
                name="title"
                required
                minLength={2}
                placeholder="Primeira música"
              />
              <input name="key" placeholder="Tom" />
              <input name="artist" placeholder="Artista" />
              <select name="moment" defaultValue="">
                <option value="">Momento no culto (opcional)</option>
                {cachoeirinhaMoments.map((moment) => <option key={moment} value={moment}>{moment}</option>)}
              </select>
              <input name="reference" type="url" placeholder="Link da versão no YouTube" />
              <button
                className="secondary-button"
                type="submit"
                disabled={isSaving}
              >
                Criar repertório
              </button>
            </form>
          </>
        )}
        {error && <p className="form-error">{error}</p>}
      </div>
    </section>
  );
}
