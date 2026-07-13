"use client";

import { useActionState } from "react";
import {
  saveArtisteContentAction,
  saveHomepageContentAction,
  type ContentActionState,
} from "@/app/admin/(dashboard)/contenu/actions";
import type { ArtisteContent, HomepageContent } from "@/types/content";
import { formatArtisteBody } from "@/schemas/content.schema";

const initialState: ContentActionState = {};

type Field = {
  name: string;
  label: string;
  type: "text" | "textarea";
  rows?: number;
  help?: string;
};

function SiteTextForm({
  action,
  fields,
  values,
  submitLabel,
}: {
  action: (
    prev: ContentActionState,
    formData: FormData
  ) => Promise<ContentActionState>;
  fields: Field[];
  values: Record<string, string>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      {state.success && (
        <p
          role="status"
          className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          Textes enregistrés.
        </p>
      )}

      {fields.map((field) => (
        <div key={field.name}>
          <label
            htmlFor={field.name}
            className="block text-sm font-medium text-ink"
          >
            {field.label}
          </label>
          {field.type === "textarea" ? (
            <textarea
              id={field.name}
              name={field.name}
              rows={field.rows ?? 6}
              defaultValue={values[field.name] ?? ""}
              required
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-ink outline-none focus:border-accent"
            />
          ) : (
            <input
              id={field.name}
              name={field.name}
              type="text"
              defaultValue={values[field.name] ?? ""}
              required
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-ink outline-none focus:border-accent"
            />
          )}
          {field.help && (
            <p className="mt-2 text-sm text-stone-500">{field.help}</p>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={pending}
        className="min-h-[52px] rounded-xl bg-ink px-8 text-base font-medium text-white disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}

export function HomepageContentForm({ content }: { content: HomepageContent }) {
  return (
    <SiteTextForm
      action={saveHomepageContentAction}
      submitLabel="Enregistrer la page d'accueil"
      values={{
        eyebrow: content.eyebrow,
        title: content.title,
        description: content.description,
      }}
      fields={[
        {
          name: "eyebrow",
          label: "Surtitre",
          type: "text",
          help: 'Petit texte au-dessus du titre, par ex. « Artiste peintre ».',
        },
        {
          name: "title",
          label: "Titre principal",
          type: "text",
        },
        {
          name: "description",
          label: "Texte d'introduction",
          type: "textarea",
          rows: 5,
          help: "Présentation courte visible sous le titre sur la page d'accueil.",
        },
      ]}
    />
  );
}

export function ArtisteContentForm({ content }: { content: ArtisteContent }) {
  return (
    <SiteTextForm
      action={saveArtisteContentAction}
      submitLabel="Enregistrer la biographie"
      values={{
        title: content.title,
        body: formatArtisteBody(content.paragraphs),
      }}
      fields={[
        {
          name: "title",
          label: "Titre de la page",
          type: "text",
        },
        {
          name: "body",
          label: "Biographie",
          type: "textarea",
          rows: 14,
          help: "Séparez chaque paragraphe par une ligne vide.",
        },
      ]}
    />
  );
}
