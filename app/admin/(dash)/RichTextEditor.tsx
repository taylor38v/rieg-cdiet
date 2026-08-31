"use client";
/* Éditeur de texte riche (TipTap) pour le corps des articles.
 * - Barre d'outils : titres H2/H3, gras, italique, listes, lien, tableau.
 * - Entrée/sortie en Markdown (via tiptap-markdown) → aucune migration des articles
 *   existants, le site continue de rendre le Markdown comme avant.
 * - Le collage d'un texte déjà mis en forme (Word, Google Docs, ChatGPT) est converti
 *   automatiquement par TipTap. */
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { Markdown } from "tiptap-markdown";
import { useEffect } from "react";

function Btn({ on, active, children, title }: { on: () => void; active?: boolean; children: React.ReactNode; title: string }) {
  return (
    <button
      type="button" title={title} onMouseDown={(e) => e.preventDefault()} onClick={on}
      className={`px-2.5 py-1 rounded text-sm border transition ${active ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"}`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange }: { value: string; onChange: (md: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false, // évite les soucis d'hydratation SSR de Next
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      Table.configure({ resizable: false }),
      TableRow, TableHeader, TableCell,
      Markdown.configure({ html: false, transformPastedText: true, transformCopiedText: true }),
    ],
    content: value || "",
    editorProps: {
      attributes: { class: "rte-content focus:outline-none min-h-[320px] px-4 py-3" },
    },
    onUpdate: ({ editor }) => {
      const md = (editor.storage as any).markdown.getMarkdown();
      onChange(md);
    },
  });

  // Recharge le contenu si on change d'article (value change depuis le parent).
  useEffect(() => {
    if (!editor) return;
    const current = (editor.storage as any).markdown.getMarkdown();
    if (value !== current) editor.commands.setContent(value || "", { emitUpdate: false } as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return <div className="text-slate-400 text-sm p-4">Chargement de l'éditeur…</div>;

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Adresse du lien (laisser vide pour retirer) :", prev || "https://");
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
      <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 bg-slate-50">
        <Btn title="Titre H2" on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>H2</Btn>
        <Btn title="Titre H3" on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>H3</Btn>
        <span className="w-px bg-slate-200 mx-1" />
        <Btn title="Gras" on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}><b>G</b></Btn>
        <Btn title="Italique" on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><i>I</i></Btn>
        <span className="w-px bg-slate-200 mx-1" />
        <Btn title="Liste à puces" on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>• Liste</Btn>
        <Btn title="Liste numérotée" on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>1. Liste</Btn>
        <span className="w-px bg-slate-200 mx-1" />
        <Btn title="Lien" on={setLink} active={editor.isActive("link")}>🔗 Lien</Btn>
        <Btn title="Insérer un tableau" on={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>▦ Tableau</Btn>
        <Btn title="Citation" on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>❝</Btn>
      </div>
      <EditorContent editor={editor} />
      <style>{`
        .rte-content h2 { font-size: 1.4rem; font-weight: 600; margin: 1rem 0 .4rem; }
        .rte-content h3 { font-size: 1.15rem; font-weight: 600; margin: .8rem 0 .3rem; }
        .rte-content p { margin: .5rem 0; line-height: 1.6; }
        .rte-content ul { list-style: disc; padding-left: 1.4rem; margin: .5rem 0; }
        .rte-content ol { list-style: decimal; padding-left: 1.4rem; margin: .5rem 0; }
        .rte-content a { color: #2563eb; text-decoration: underline; }
        .rte-content blockquote { border-left: 3px solid #cbd5e1; padding-left: .8rem; color: #475569; margin: .6rem 0; }
        .rte-content table { border-collapse: collapse; margin: .6rem 0; width: 100%; }
        .rte-content th, .rte-content td { border: 1px solid #cbd5e1; padding: .35rem .5rem; }
        .rte-content th { background: #f1f5f9; font-weight: 600; }
      `}</style>
    </div>
  );
}
