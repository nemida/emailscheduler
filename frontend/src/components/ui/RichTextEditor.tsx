import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'], alignments: ['left', 'center', 'right', 'justify'] }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  if (!editor) return null

  const tb = (active: boolean) =>
    `p-1.5 rounded transition-colors ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2.5 border-b border-gray-100">

        <button type="button" onClick={() => editor.chain().focus().undo().run()} className={tb(false)} title="Undo">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
          </svg>
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className={tb(false)} title="Redo">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
          </svg>
        </button>

        <div className="w-px h-4 bg-gray-200 mx-1.5" />

        <div className="flex items-center gap-0.5 border border-gray-200 rounded px-1.5 py-0.5">
          <span className="text-xs text-gray-500 font-medium">Tt</span>
          <svg className="w-2.5 h-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6-4 4-4-4" />
          </svg>
        </div>

        <div className="w-px h-4 bg-gray-200 mx-1.5" />

        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={tb(editor.isActive('bold'))} title="Bold">
          <span className="text-sm font-bold leading-none w-4 h-4 flex items-center justify-center">B</span>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={tb(editor.isActive('italic'))} title="Italic">
          <span className="text-sm italic leading-none w-4 h-4 flex items-center justify-center">I</span>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={tb(editor.isActive('underline'))} title="Underline">
          <span className="text-sm underline leading-none w-4 h-4 flex items-center justify-center">U</span>
        </button>

        <div className="w-px h-4 bg-gray-200 mx-1.5" />

        <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={tb(editor.isActive({ textAlign: 'left' }))} title="Align left">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h10.5m-10.5 5.25h16.5" />
          </svg>
        </button>
        <div className="flex items-center border border-gray-200 rounded px-0.5 py-0.5">
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6-4 4-4-4" />
          </svg>
        </div>

        <div className="w-px h-4 bg-gray-200 mx-1.5" />

        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={tb(editor.isActive('orderedList'))} title="Ordered list">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.242 5.992h12m-12 6.003H20.24m-12 5.999h12M4.117 7.495v-3.75H2.99m1.125 3.75H2.99m1.125 0H5.24m-1.92 2.577a1.125 1.125 0 0 1 1.919 1.128l-1.595 1.66H5.24m-1.92 0h1.92" />
          </svg>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={tb(editor.isActive('bulletList'))} title="Bullet list">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        </button>
        <button type="button" onClick={() => editor.chain().focus().sinkListItem('listItem').run()} className={tb(false)} title="Indent">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h10.5M3.75 17.25h16.5M9 9.75l3 2.25-3 2.25" />
          </svg>
        </button>
        <button type="button" onClick={() => editor.chain().focus().liftListItem('listItem').run()} className={tb(false)} title="Outdent">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h10.5M3.75 17.25h16.5M9 14.25l-3-2.25 3-2.25" />
          </svg>
        </button>

        <div className="w-px h-4 bg-gray-200 mx-1.5" />

        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={tb(editor.isActive('blockquote'))} title="Quote">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className={tb(false)}
          title="Table"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125V15m0 0h3.75M3 15V9.375m0 0h3.75M3 9.375V5.625M3 5.625A1.125 1.125 0 0 1 4.125 4.5h15.75A1.125 1.125 0 0 1 21 5.625M3 5.625v13.875M21 5.625v13.875m0 0a1.125 1.125 0 0 1-1.125 1.125M21 19.5h-1.5c-1.121 0-1.5-.504-1.5-1.125M21 15h-3.75M21 15V9.375m0 0h-3.75M21 9.375V5.625M6 15h3.75M6 9.375h3.75m3.75 0H17.25M10.5 15H17.25" />
          </svg>
        </button>

        <div className="w-px h-4 bg-gray-200 mx-1.5" />

        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={tb(editor.isActive('strike'))} title="Strikethrough">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5c-2.5 0-4 1.5-4 3s1.5 3 4 3m0 0c2.5 0 4 1.5 4 3s-1.5 3-4 3-4-1.5-4-3" />
          </svg>
        </button>

      </div>

      <EditorContent
        editor={editor}
        className="editor-content min-h-[260px] px-4 py-3 text-sm text-gray-800 bg-gray-50 [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[240px] [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:w-full [&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-gray-200 [&_.ProseMirror_td]:p-2 [&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-gray-200 [&_.ProseMirror_th]:p-2 [&_.ProseMirror_th]:bg-gray-100"
      />
    </div>
  )
}
