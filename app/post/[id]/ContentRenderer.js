'use client';

export default function ContentRenderer({ content }) {
  // HTML을 안전하게 정제 (XSS 방지)
  const sanitizeHTML = (html) => {
    // 위험한 태그/속성 제거
    const cleaned = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/g, '')
      .replace(/on\w+='[^']*'/g, '')
      .replace(/javascript:/gi, '');
    
    return cleaned;
  };

  // 행바꿈 처리: \n을 <br>로 변환
  const processLineBreaks = (text) => {
    // 이미 HTML 태그가 있는 경우 (<p>, <div> 등)
    if (/<\/?[a-z][\s\S]*>/i.test(text)) {
      // HTML 태그 외부의 \n만 <br>로 변환
      return text.replace(/\n/g, '<br>');
    }
    
    // 순수 텍스트인 경우
    // 연속된 2개 이상의 \n은 <p>로 감싸기
    const paragraphs = text.split(/\n\s*\n/);
    return paragraphs
      .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
      .join('');
  };

  const processedContent = processLineBreaks(content);
  const cleanContent = sanitizeHTML(processedContent);

  return (
    <div 
      className="content-body"
      dangerouslySetInnerHTML={{ __html: cleanContent }}
    />
  );
}
