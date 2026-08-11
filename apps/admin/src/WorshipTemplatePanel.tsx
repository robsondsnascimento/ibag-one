import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  addWorshipOrderTemplateItem,
  createWorshipOrderTemplate,
  updateWorshipOrderTemplate,
} from "./api/worship";
import type { WorshipOrderTemplate } from "./api/worship";
import { listServiceAreas } from "./api/service-areas";
import type { ServiceAreaListItem } from "./api/service-areas";

const cachoeirinhaMusicMoments = [
  "Celebração · início do culto",
  "Celebração ou POP",
  "Oração",
  "Dízimos e ofertas",
  "Celebração · final do culto",
];

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
  const musicAreaCandidates = serviceAreas.filter((area) => area.scope === "GLOBAL");
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
        items: cachoeirinhaMusicMoments.map((titulo, index) => ({
          sequencia: index + 1,
          titulo,
          serviceAreaId,
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
      onNotice("Modelo de músicas do Culto Cachoeirinha criado.");
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
            <ol>
              {template.items.map((item) => (
                <li key={item.id}>
                  {item.sequencia}. {item.titulo}
                  {item.horario ? ` · ${item.horario}` : ""}
                </li>
              ))}
            </ol>
            <form onSubmit={(formEvent) => addItem(template, formEvent)}>
              <input
                name="title"
                required
                minLength={2}
                placeholder="Novo item do modelo"
              />
              <input name="time" type="time" />
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
          <p>Cria as cinco posições do roteiro de músicas enviado, já vinculadas à Área de Música escolhida.</p>
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
