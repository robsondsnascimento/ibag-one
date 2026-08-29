import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  addWorshipOrderTemplateItem,
  createWorshipOrderTemplate,
  deleteWorshipOrderTemplateItem,
  reorderWorshipOrderTemplateItems,
  updateWorshipOrderTemplateItem,
  updateWorshipOrderTemplate,
} from "./api/worship";
import type { WorshipOrderTemplate } from "./api/worship";
import { listServiceAreas } from "./api/service-areas";
import type { ServiceAreaListItem } from "./api/service-areas";

const cachoeirinhaTemplateItems = [
  { titulo: "Música celebração", isMusic: true },
  { titulo: "Música celebração ou POP", isMusic: true },
  { titulo: "Música oração", isMusic: true },
  { titulo: "Música dízimos e ofertas", isMusic: true },
  { titulo: "Música final", isMusic: true },
];

type TemplateItem = WorshipOrderTemplate["items"][number];

function reorderTemplateItems(
  items: TemplateItem[],
  itemId: string,
  targetItemId: string,
  position: "before" | "after",
) {
  if (itemId === targetItemId) return items;
  const movingItem = items.find((item) => item.id === itemId);
  const remaining = items.filter((item) => item.id !== itemId);
  const targetIndex = remaining.findIndex((item) => item.id === targetItemId);
  if (!movingItem || targetIndex < 0) return items;
  remaining.splice(targetIndex + (position === "after" ? 1 : 0), 0, movingItem);
  return remaining;
}

export function WorshipTemplatePanel({
  templates,
  accessToken,
  canManage,
  onTemplatesChange,
  onNotice,
}: {
  templates: WorshipOrderTemplate[];
  accessToken: string;
  canManage: boolean;
  onTemplatesChange: (templates: WorshipOrderTemplate[]) => void;
  onNotice: (message: string) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [serviceAreas, setServiceAreas] = useState<ServiceAreaListItem[]>([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [draggingItem, setDraggingItem] = useState<{
    templateId: string;
    itemId: string;
  } | null>(null);
  const [dragTarget, setDragTarget] = useState<{
    templateId: string;
    itemId: string;
    position: "before" | "after";
  } | null>(null);
  const itemElements = useRef(new Map<string, HTMLLIElement>());
  const previousItemPositions = useRef(new Map<string, DOMRect>());
  const transitionFrames = useRef(new Map<string, number>());
  const globalAreaCandidates = serviceAreas.filter(
    (area) => area.scope === "GLOBAL",
  );
  const musicAreaCandidates = serviceAreas.filter(
    (area) =>
      area.scope === "GLOBAL" &&
      area.nome
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .includes("musica"),
  );
  useEffect(() => {
    let active = true;
    void listServiceAreas(accessToken)
      .then((areas) => {
        if (active) setServiceAreas(areas);
      })
      .catch(() => {
        if (active) setServiceAreas([]);
      })
      .finally(() => {
        if (active) setIsLoadingAreas(false);
      });
    return () => {
      active = false;
    };
  }, [accessToken]);
  useLayoutEffect(() => {
    const nextPositions = new Map<string, DOMRect>();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    itemElements.current.forEach((element, itemId) => {
      const pendingFrame = transitionFrames.current.get(itemId);
      if (pendingFrame) window.cancelAnimationFrame(pendingFrame);

      // Mede a nova posição sem a animação anterior para calcular o deslocamento
      // real entre uma posição e outra, mesmo quando o ponteiro muda de direção.
      element.style.transition = "none";
      element.style.transform = "";
      const nextPosition = element.getBoundingClientRect();
      const previousPosition = previousItemPositions.current.get(itemId);

      if (!reduceMotion && previousPosition) {
        const translateY = previousPosition.top - nextPosition.top;
        if (Math.abs(translateY) > 1) {
          element.style.transform = `translate3d(0, ${translateY}px, 0)`;
          transitionFrames.current.set(
            itemId,
            window.requestAnimationFrame(() => {
              element.style.transition = "transform 200ms cubic-bezier(.4, 0, .2, 1)";
              element.style.transform = "translate3d(0, 0, 0)";
            }),
          );
        } else {
          element.style.transition = "";
        }
      } else {
        element.style.transition = "";
      }

      nextPositions.set(itemId, nextPosition);
    });

    previousItemPositions.current = nextPositions;
  }, [templates, draggingItem, dragTarget]);
  useEffect(() => () => {
    transitionFrames.current.forEach((frame) => window.cancelAnimationFrame(frame));
  }, []);
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
      const created = await createWorshipOrderTemplate(accessToken, {
        nome: String(data.get("name")).trim(),
        padrao: data.get("default") === "on",
        items: [
          {
            sequencia: 1,
            titulo: String(data.get("firstItem")).trim(),
            horario: String(data.get("time") ?? "") || undefined,
          },
        ],
      });
      onTemplatesChange(
        [
          ...templates.filter((item) => !created.padrao || !item.padrao),
          created,
        ].sort(
          (a, b) =>
            Number(b.padrao) - Number(a.padrao) ||
            a.nome.localeCompare(b.nome, "pt-BR"),
        ),
      );
      form.reset();
      onNotice("Modelo de Ordem de Culto criado.");
    });
  };
  const addItem = (
    template: WorshipOrderTemplate,
    formEvent: FormEvent<HTMLFormElement>,
  ) => {
    formEvent.preventDefault();
    const form = formEvent.currentTarget;
    const data = new FormData(form);
    run(async () => {
      const item = await addWorshipOrderTemplateItem(accessToken, template.id, {
        sequencia:
          Math.max(0, ...template.items.map((current) => current.sequencia)) +
          1,
        titulo: String(data.get("title")).trim(),
        horario: String(data.get("time") ?? "") || undefined,
        serviceAreaId: String(data.get("serviceAreaId") ?? "") || undefined,
      });
      onTemplatesChange(
        templates.map((current) =>
          current.id === template.id
            ? { ...current, items: [...current.items, item] }
            : current,
        ),
      );
      form.reset();
      onNotice(`Item adicionado ao modelo ${template.nome}.`);
    });
  };
  const replaceTemplate = (updated: WorshipOrderTemplate) => {
    onTemplatesChange(
      templates.map((template) =>
        template.id === updated.id ? updated : template,
      ),
    );
  };
  const reorderItem = (
    template: WorshipOrderTemplate,
    itemId: string,
    targetItemId: string,
    position: "before" | "after",
  ) => {
    const reordered = reorderTemplateItems(
      template.items,
      itemId,
      targetItemId,
      position,
    );
    if (reordered === template.items) return;
    const optimisticTemplate = {
      ...template,
      items: reordered.map((item, index) => ({
        ...item,
        sequencia: index + 1,
      })),
    };
    replaceTemplate(optimisticTemplate);
    run(async () => {
      try {
        replaceTemplate(
          await reorderWorshipOrderTemplateItems(
            accessToken,
            template.id,
            reordered.map((item, index) => ({ id: item.id, sequencia: index + 1 })),
          ),
        );
        onNotice(`Sequência do modelo ${template.nome} atualizada.`);
      } catch (reason) {
        replaceTemplate(template);
        throw reason;
      }
    });
  };
  const moveItemWithKeyboard = (
    template: WorshipOrderTemplate,
    itemId: string,
    direction: -1 | 1,
  ) => {
    const currentIndex = template.items.findIndex((item) => item.id === itemId);
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= template.items.length) return;
    reorderItem(
      template,
      itemId,
      template.items[targetIndex].id,
      direction === -1 ? "before" : "after",
    );
  };
  const editItem = (
    template: WorshipOrderTemplate,
    itemId: string,
    formEvent: FormEvent<HTMLFormElement>,
  ) => {
    formEvent.preventDefault();
    const data = new FormData(formEvent.currentTarget);
    run(async () => {
      const updatedItem = await updateWorshipOrderTemplateItem(
        accessToken,
        itemId,
        {
          titulo: String(data.get("title")).trim(),
          horario: String(data.get("time") ?? "") || undefined,
          serviceAreaId: String(data.get("serviceAreaId") ?? "") || null,
        },
      );
      replaceTemplate({
        ...template,
        items: template.items.map((item) =>
          item.id === updatedItem.id ? updatedItem : item,
        ),
      });
      setEditingItemId(null);
      onNotice("Item do modelo atualizado.");
    });
  };
  const removeItem = (template: WorshipOrderTemplate, itemId: string) => {
    if (!window.confirm("Remover este item do modelo?")) return;
    run(async () => {
      await deleteWorshipOrderTemplateItem(accessToken, itemId);
      const remaining = template.items.filter((item) => item.id !== itemId);
      replaceTemplate(
        await reorderWorshipOrderTemplateItems(
          accessToken,
          template.id,
          remaining.map((item, index) => ({ id: item.id, sequencia: index + 1 })),
        ),
      );
      setEditingItemId(null);
      onNotice("Item removido do modelo.");
    });
  };
  const createCachoeirinhaModel = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    const form = formEvent.currentTarget;
    const data = new FormData(form);
    const serviceAreaId = String(data.get("serviceAreaId") ?? "");
    if (!serviceAreaId) {
      setError("Selecione a Área de Música que será responsável pelas posições do modelo.");
      return;
    }
    run(async () => {
      const created = await createWorshipOrderTemplate(accessToken, {
        nome: "Culto Cachoeirinha · roteiro de músicas",
        padrao: data.get("default") === "on",
        items: cachoeirinhaTemplateItems.map((item, index) => ({
          sequencia: index + 1,
          titulo: item.titulo,
          serviceAreaId: item.isMusic ? serviceAreaId : undefined,
        })),
      });
      onTemplatesChange(
        [
          ...templates.filter((item) => !created.padrao || !item.padrao),
          created,
        ].sort(
          (a, b) =>
            Number(b.padrao) - Number(a.padrao) ||
            a.nome.localeCompare(b.nome, "pt-BR"),
        ),
      );
      form.reset();
    onNotice("Modelo padrão do Culto Cachoeirinha criado.");
    });
  };
  if (!canManage) return null;
  return (
    <section className="worship-templates">
      <header>
        <div>
          <p className="eyebrow">Modelos</p>
          <h3>Estruturas reutilizáveis</h3>
        </div>
        <span>{templates.length}</span>
      </header>
      <div className="worship-templates-content">
        {templates.map((template) => (
          <article key={template.id}>
            <header>
              <div>
                <strong>{template.nome}</strong>
                <small>
                  {template.ativo ? "Ativo" : "Inativo"}
                  {template.padrao ? " · modelo padrão" : ""}
                </small>
              </div>
              <div>
                <button
                  className="secondary-button"
                  type="button"
                  disabled={isSaving || !template.ativo}
                  onClick={() =>
                    run(async () => {
                      const updated = await updateWorshipOrderTemplate(
                        accessToken,
                        template.id,
                        { padrao: true },
                      );
                      onTemplatesChange(
                        templates.map((current) =>
                          current.id === updated.id
                            ? updated
                            : { ...current, padrao: false },
                        ),
                      );
                      onNotice(`${updated.nome} agora é o modelo padrão.`);
                    })
                  }
                >
                  Definir padrão
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  disabled={isSaving}
                  onClick={() =>
                    run(async () => {
                      const updated = await updateWorshipOrderTemplate(
                        accessToken,
                        template.id,
                        { ativo: !template.ativo },
                      );
                      onTemplatesChange(
                        templates.map((current) =>
                          current.id === updated.id ? updated : current,
                        ),
                      );
                      onNotice(
                        updated.ativo
                          ? "Modelo ativado."
                          : "Modelo desativado.",
                      );
                    })
                  }
                >
                  {template.ativo ? "Desativar" : "Ativar"}
                </button>
              </div>
            </header>
            <ol className="worship-template-items">
              {(draggingItem?.templateId === template.id && dragTarget?.templateId === template.id
                ? reorderTemplateItems(template.items, draggingItem.itemId, dragTarget.itemId, dragTarget.position)
                : template.items
              ).map((item, index) => {
                const isDragging = draggingItem?.templateId === template.id && draggingItem.itemId === item.id;
                return (
                <li
                  key={item.id}
                  ref={(element) => {
                    if (element) itemElements.current.set(item.id, element);
                    else itemElements.current.delete(item.id);
                  }}
                  className={isDragging ? "worship-template-item--dragging" : undefined}
                  onDragOver={(event) => {
                    if (!draggingItem || draggingItem.templateId !== template.id || draggingItem.itemId === item.id) return;
                    event.preventDefault();
                    const bounds = event.currentTarget.getBoundingClientRect();
                    const position = event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";
                    setDragTarget((current) => current?.templateId === template.id && current.itemId === item.id && current.position === position
                      ? current
                      : { templateId: template.id, itemId: item.id, position });
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (!draggingItem || draggingItem.templateId !== template.id || draggingItem.itemId === item.id) return;
                    const bounds = event.currentTarget.getBoundingClientRect();
                    const position = dragTarget?.templateId === template.id && dragTarget.itemId === item.id
                      ? dragTarget.position
                      : event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";
                    reorderItem(template, draggingItem.itemId, item.id, position);
                    setDraggingItem(null);
                    setDragTarget(null);
                  }}
                >
                  <div>
                    <strong>
                      {index + 1}. {item.titulo}
                    </strong>
                    <small>
                      {[item.horario, item.serviceArea?.nome]
                        .filter(Boolean)
                        .join(" · ") || "Sem área ou horário definido"}
                    </small>
                  </div>
                  <div className="worship-template-item-actions">
                    <button
                      className="secondary-button worship-template-drag-handle"
                      type="button"
                      draggable={!isSaving}
                      disabled={isSaving}
                      aria-label={`Segure e arraste ${item.titulo} para alterar a ordem`}
                      aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
                      title="Segure e arraste para alterar a ordem. No teclado, use Alt + seta para cima ou para baixo."
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", item.id);
                        setDraggingItem({ templateId: template.id, itemId: item.id });
                      }}
                      onDragEnd={() => {
                        setDraggingItem(null);
                        setDragTarget(null);
                      }}
                      onKeyDown={(event) => {
                        if (!event.altKey || isSaving) return;
                        if (event.key === "ArrowUp") {
                          event.preventDefault();
                          moveItemWithKeyboard(template, item.id, -1);
                        }
                        if (event.key === "ArrowDown") {
                          event.preventDefault();
                          moveItemWithKeyboard(template, item.id, 1);
                        }
                      }}
                    >
                      ⋮⋮
                    </button>
                    <button
                      className="secondary-button"
                      type="button"
                      disabled={isSaving}
                      onClick={() =>
                        setEditingItemId((current) =>
                          current === item.id ? null : item.id,
                        )
                      }
                    >
                      Editar
                    </button>
                    <button
                      className="member-end-button"
                      type="button"
                      disabled={isSaving || template.items.length <= 1}
                      onClick={() => removeItem(template, item.id)}
                    >
                      Remover
                    </button>
                  </div>
                  {editingItemId === item.id && (
                    <form
                      className="worship-template-item-edit"
                      onSubmit={(formEvent) => editItem(template, item.id, formEvent)}
                    >
                      <input
                        name="title"
                        required
                        minLength={2}
                        defaultValue={item.titulo}
                      />
                      <input name="time" type="time" defaultValue={item.horario ?? ""} />
                      <select name="serviceAreaId" defaultValue={item.serviceArea?.id ?? ""}>
                        <option value="">Sem área específica</option>
                        {globalAreaCandidates.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.nome}
                          </option>
                        ))}
                      </select>
                      <button className="secondary-button" type="submit" disabled={isSaving}>
                        Salvar item
                      </button>
                    </form>
                  )}
                </li>
                );
              })}
            </ol>
            <form onSubmit={(formEvent) => addItem(template, formEvent)}>
              <input
                name="title"
                required
                minLength={2}
                placeholder="Novo item do modelo"
              />
              <input name="time" type="time" />
              <select name="serviceAreaId" defaultValue="">
                <option value="">Sem área específica</option>
                {globalAreaCandidates.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.nome}
                  </option>
                ))}
              </select>
              <button
                className="secondary-button"
                type="submit"
                disabled={isSaving}
              >
                + Item
              </button>
            </form>
          </article>
        ))}
        <form className="worship-template-create worship-template-create--cachoeirinha" onSubmit={createCachoeirinhaModel}>
          <h4>Modelo Cachoeirinha</h4>
          <p>Cria as cinco posições musicais do roteiro, vinculadas à Área de Música.</p>
          <label>Área de Música<select name="serviceAreaId" required disabled={isLoadingAreas || musicAreaCandidates.length === 0} defaultValue=""><option value="" disabled>{isLoadingAreas ? "Carregando áreas..." : musicAreaCandidates.length ? "Selecione a Área de Música" : "Nenhuma área global disponível"}</option>{musicAreaCandidates.map((area) => <option value={area.id} key={area.id}>{area.nome}</option>)}</select></label>
          <label className="checkbox-label checkbox-label--form"><input name="default" type="checkbox" defaultChecked /> Definir como modelo padrão</label>
          <button className="primary-button" type="submit" disabled={isSaving || isLoadingAreas || musicAreaCandidates.length === 0}>{isSaving ? "Criando..." : "Criar modelo Cachoeirinha"}</button>
        </form>
        <form className="worship-template-create" onSubmit={create}>
          <h4>Novo modelo</h4>
          <input
            name="name"
            required
            minLength={3}
            placeholder="Ex.: Culto de domingo"
          />
          <input
            name="firstItem"
            required
            minLength={2}
            placeholder="Primeiro item"
          />
          <input name="time" type="time" />
          <label className="checkbox-label checkbox-label--form">
            <input name="default" type="checkbox" /> Definir como padrão
          </label>
          <button className="primary-button" type="submit" disabled={isSaving}>
            {isSaving ? "Criando..." : "Criar modelo"}
          </button>
        </form>
        {error && <p className="form-error">{error}</p>}
      </div>
    </section>
  );
}
