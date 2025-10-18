'use client';

import { useEffect, useRef } from 'react';

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    
    // 클립보드에서 HTML 가져오기
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    
    // HTML이 있으면 HTML 사용, 없으면 텍스트 사용
    const content = html || text.replace(/\n/g, '<br>');
    
    // 현재 커서 위치에 삽입
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      const fragment = range.createContextualFragment(content);
      range.insertNode(fragment);
      
      // 커서를 삽입된 내용 끝으로 이동
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    handleInput();
  };

  return (
    <div
      ref={editorRef}
      contentEditable
      onInput={handleInput}
      onPaste={handlePaste}
      className="w-full min-h-[300px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none text-sm overflow-y-auto"
      style={{
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word'
      }}
      data-placeholder={placeholder}
    />
  );
}
