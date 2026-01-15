"use client";

import React, { useEffect, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

interface TipTapEditorProps {
  name?: string; // form field name (defaults to "content")
  initialContent?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  // simple mode restricts editor to only bold/italic + paragraphs
  simple?: boolean;
}

export default function TipTapEditor({
  name = "content",
  initialContent = "",
  placeholder = "",
  required = false,
  className = "",
  simple = false,
}: TipTapEditorProps) {
  const extensions = React.useMemo(() => {
    if (simple) {
      return [
        StarterKit.configure({
          bulletList: false,
          orderedList: false,
          codeBlock: false,
          blockquote: false,
          heading: false,
          hardBreak: false,
          horizontalRule: false,
          listItem: false,
        }),
      ];
    }

    return [StarterKit, Link.configure({ openOnClick: true })];
  }, [simple]);

  const editor = useEditor({
    extensions,
    content: initialContent || "",
    editorProps: {
      attributes: {
        class: "prose max-w-none focus:outline-none",
      },
    },
    // Prevent TipTap from rendering immediately during SSR to avoid hydration mismatches
    immediatelyRender: false,
  });

  // keep a hidden textarea value in sync so the form submits the HTML content
  useEffect(() => {
    if (!editor) return;

    const updateHidden = () => {
      const el = document.querySelector(`textarea[name=\"${name}\"]`) as HTMLTextAreaElement | null;
      if (el) {
        el.value = editor.getHTML();
      }
    };

    // set initial value
    updateHidden();

    // subscribe to updates
    editor.on("update", updateHidden);

    return () => {
      editor.off("update", updateHidden);
    };
  }, [editor, name]);

  // toolbar: show only Bold/Italic in simple mode, else a few more controls
  const Toolbar = useMemo(() => {
    if (!editor) return null;

    if (simple) {
      return (
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className="px-2 py-1 border rounded"
            aria-label="Bold"
          >
            <strong>B</strong>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className="px-2 py-1 border rounded"
            aria-label="Italic"
          >
            <em>I</em>
          </button>
        </div>
      );
    }

    return (
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="px-2 py-1 border rounded"
          aria-label="Bold"
        >
          <strong>B</strong>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="px-2 py-1 border rounded"
          aria-label="Italic"
        >
          <em>I</em>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="px-2 py-1 border rounded"
          aria-label="H2"
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="px-2 py-1 border rounded"
          aria-label="Bullet list"
        >
          • List
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="px-2 py-1 border rounded"
          aria-label="Ordered list"
        >
          1. List
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className="px-2 py-1 border rounded"
          aria-label="Blockquote"
        >
          “ ”
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className="px-2 py-1 border rounded"
          aria-label="Code block"
        >
          {'</>'}
        </button>
      </div>
    );
  }, [editor, simple]);

  return (
    <div className={`space-y-1 ${className}`}>
      {Toolbar}
      <div className="border border-gray-300 rounded-lg p-3 min-h-[150px]">
        {editor ? <EditorContent editor={editor} /> : <div className="min-h-[150px]"></div>}
      </div>
      {/* hidden textarea to include content in form submit */}
      <textarea name={name} defaultValue={initialContent} required={required} className="hidden" />
    </div>
  );
}
