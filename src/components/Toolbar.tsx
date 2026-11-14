"use client";

import type { Editor } from "@tiptap/react";

type Item = {
  label: string;
  title: string;
  run: () => void;
  active: boolean;
  style?: React.CSSProperties;
};

export default function Toolbar({ editor }: { editor: Editor }) {
  const chain = () => editor.chain().focus();

  const groups: Item[][] = [
    [
      {
        label: "B",
        title: "Bold",
        run: () => chain().toggleBold().run(),
        active: editor.isActive("bold"),
        style: { fontWeight: 700 },
      },
      {
        label: "I",
        title: "Italic",
        run: () => chain().toggleItalic().run(),
        active: editor.isActive("italic"),
        style: { fontStyle: "italic" },
      },
      {
        label: "U",
        title: "Underline",
        run: () => chain().toggleUnderline().run(),
        active: editor.isActive("underline"),
        style: { textDecoration: "underline" },
      },
    ],
    [
      {
        label: "H1",
        title: "Heading 1",
        run: () => chain().toggleHeading({ level: 1 }).run(),
        active: editor.isActive("heading", { level: 1 }),
      },
      {
        label: "H2",
        title: "Heading 2",
        run: () => chain().toggleHeading({ level: 2 }).run(),
        active: editor.isActive("heading", { level: 2 }),
      },
    ],
    [
      {
        label: "• List",
        title: "Bulleted list",
        run: () => chain().toggleBulletList().run(),
        active: editor.isActive("bulletList"),
      },
      {
        label: "1. List",
        title: "Numbered list",
        run: () => chain().toggleOrderedList().run(),
        active: editor.isActive("orderedList"),
      },
    ],
  ];

  return (
    <div className="toolbar">
      {groups.map((group, i) => (
        <div key={i} style={{ display: "flex", gap: 4 }}>
          {i > 0 && <div className="divider" />}
          {group.map((item) => (
            <button
              key={item.title}
              type="button"
              title={item.title}
              className={item.active ? "active" : ""}
              style={item.style}
              // mouseDown + preventDefault keeps the text selection in the editor
              onMouseDown={(e) => {
                e.preventDefault();
                item.run();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
