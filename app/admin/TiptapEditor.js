'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  Code, Heading1, Heading2, Heading3, 
  List, ListOrdered, Quote, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight,
  Image as ImageIcon, Link as LinkIcon, Minus
} from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';

export default function TiptapEditor({ value, onChange }) {
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg',
          style: 'max-height: 600px; height: auto; display: block; margin: 1em auto;',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-lg max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // value prop이 변경되면 에디터 내용 업데이트
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  // 이미지 업로드
  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      setUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('업로드 실패');

        const data = await response.json();
        
        // 에디터에 이미지 삽입
        editor.chain().focus().setImage({ src: data.url }).run();
      } catch (error) {
        console.error('Upload error:', error);
        alert('이미지 업로드에 실패했습니다.');
      } finally {
        setUploading(false);
      }
    };

    input.click();
  }, [editor]);

  // 링크 추가
  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL을 입력하세요:', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* 툴바 */}
      <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-1">
        {/* 텍스트 스타일 */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
            title="굵게 (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
            title="기울임 (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-300' : ''}`}
            title="밑줄 (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('strike') ? 'bg-gray-300' : ''}`}
            title="취소선"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('code') ? 'bg-gray-300' : ''}`}
            title="코드"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        {/* 제목 */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''}`}
            title="제목 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''}`}
            title="제목 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''}`}
            title="제목 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </div>

        {/* 리스트 */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-300' : ''}`}
            title="불릿 리스트"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-300' : ''}`}
            title="번호 리스트"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-gray-300' : ''}`}
            title="인용문"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        {/* 정렬 */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''}`}
            title="왼쪽 정렬"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''}`}
            title="가운데 정렬"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''}`}
            title="오른쪽 정렬"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>

        {/* 이미지 & 링크 */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={handleImageUpload}
            disabled={uploading}
            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
            title="이미지 업로드"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={setLink}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-300' : ''}`}
            title="링크"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* 구분선 */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-2 rounded hover:bg-gray-200"
            title="구분선"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* 실행 취소/다시 실행 */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
            title="실행 취소 (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
            title="다시 실행 (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 에디터 */}
      <EditorContent editor={editor} />

      {uploading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="text-sm text-gray-600">이미지 업로드 중...</div>
        </div>
      )}
    </div>
  );
}
