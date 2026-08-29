import { useMemo, useState } from "react";
import type { PersonListItem } from "./api/directory";

type Props = {
  people: PersonListItem[];
  selectedPersonId: string;
  search: string;
  disabled?: boolean;
  emptyMessage?: string;
  onSearchChange: (value: string) => void;
  onSelect: (person: PersonListItem) => void;
};

export function WorshipPersonAutocomplete({
  people,
  selectedPersonId,
  search,
  disabled = false,
  emptyMessage = "Nenhuma pessoa encontrada.",
  onSearchChange,
  onSelect,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const matches = useMemo(() => {
    const normalizedSearch = search
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR")
      .trim();
    return people
      .filter((person) =>
        person.nome
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch),
      )
      .slice(0, 8);
  }, [people, search]);

  return (
    <div className="worship-person-autocomplete">
      <input
        value={search}
        type="search"
        placeholder={disabled ? "Carregando pessoas..." : "Pesquisar pessoa"}
        disabled={disabled}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="worship-person-options"
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          onSearchChange(event.target.value);
          setIsOpen(true);
        }}
        onBlur={() => setIsOpen(false)}
      />
      {isOpen && !disabled && (
        <div
          className="worship-person-autocomplete__list"
          id="worship-person-options"
          role="listbox"
        >
          {matches.length ? (
            matches.map((person) => (
              <button
                className={
                  selectedPersonId === person.id
                    ? "worship-person-autocomplete__option worship-person-autocomplete__option--selected"
                    : "worship-person-autocomplete__option"
                }
                key={person.id}
                type="button"
                role="option"
                aria-selected={selectedPersonId === person.id}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(person);
                  setIsOpen(false);
                }}
              >
                <strong>{person.nome}</strong>
                <small>{person.campus.nome}</small>
              </button>
            ))
          ) : (
            <p>{emptyMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}
