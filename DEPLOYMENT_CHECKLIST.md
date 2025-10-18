# 배포 전 체크리스트

## ✅ 완료된 항목

### 모바일 최적화
- [x] 입력창 자동 확대 방지 (font-size: 16px 적용)
- [x] 반응형 디자인 적용
- [x] 터치 영역 최적화
- [x] 모바일 뷰포트 설정

### SEO 최적화
- [x] 메타 태그 설정 (title, description, keywords)
- [x] Open Graph 태그 추가
- [x] Twitter Card 설정
- [x] robots.txt 생성
- [x] sitemap.xml 자동 생성
- [x] 구조화된 데이터 (JSON-LD) 추가
- [x] Canonical URL 설정
- [x] 이미지 lazy loading 적용

### 성능 최적화
- [x] 이미지 최적화 (lazy loading)
- [x] 캐싱 설정 (revalidate: 60)
- [x] 코드 스플리팅 (Next.js 자동)

### 보안
- [x] 환경 변수 사용 (.env.local)
- [x] 비밀번호 해싱 (댓글)
- [x] IP 기반 좋아요 제한

### 기능
- [x] 댓글 시스템
- [x] 좋아요 기능
- [x] 조회수 카운팅
- [x] 페이지네이션

## 🔧 배포 전 확인 사항

### 1. 환경 변수 설정
Vercel/Netlify 대시보드에서 다음 환경 변수 설정:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Google Search Console 인증
- `app/layout.js`의 `verification.google` 값을 실제 인증 코드로 변경
- Google Search Console에서 소유권 확인
- Sitemap 제출: `https://www.lerapick.com/sitemap.xml`

### 3. 도메인 설정
- DNS 레코드 확인
- HTTPS 인증서 확인
- www 리다이렉트 설정 (선택)

### 4. 성능 테스트
- [ ] Lighthouse 점수 확인 (90+ 목표)
- [ ] 모바일 실기기 테스트
- [ ] 다양한 브라우저 테스트

### 5. 콘텐츠 확인
- [ ] 모든 이미지 링크 정상 작동
- [ ] 깨진 링크 없음
- [ ] 오타 확인

### 6. 분석 도구 설정 (선택)
- [ ] Google Analytics 추가
- [ ] 네이버 웹마스터 도구 등록
- [ ] Vercel Analytics 활성화

## 📝 배포 후 해야 할 일

### 검색 엔진 등록
1. **Google Search Console**
   - 사이트맵 제출
   - URL 색인 요청

2. **네이버 웹마스터**
   - 사이트 등록
   - 사이트맵 제출

3. **다음(Kakao) 검색등록**
   - 사이트 등록

### 모니터링
- [ ] 에러 로그 확인
- [ ] 성능 모니터링
- [ ] 검색 콘솔 정기 확인

## 🚀 배포 명령어

### Vercel 배포
```bash
# 프로젝트 루트에서
vercel

# 또는 프로덕션 배포
vercel --prod
```

### 빌드 테스트
```bash
npm run build
npm start
```

## ⚠️ 주의사항

1. **환경 변수**: 절대 공개 저장소에 업로드하지 마세요
2. **Supabase RLS**: Row Level Security 정책 확인
3. **favicon 경고**: public/favicon.ico와 app/favicon.ico 중복 해결 필요
4. **Google 인증 코드**: layout.js의 인증 코드를 실제 값으로 변경

## 📊 현재 상태

- ✅ 모바일 입력창 확대 방지 완료
- ✅ SEO 기본 설정 완료
- ✅ 구조화된 데이터 추가
- ✅ Sitemap 자동 생성
- ✅ robots.txt 생성
- ⚠️ Google 인증 코드 설정 필요
- ⚠️ favicon 중복 경고 해결 필요 (기능에는 영향 없음)

## 🎯 권장 다음 단계

1. Vercel에 배포
2. 도메인 연결
3. Google Search Console 설정
4. 첫 글 발행 및 소셜 미디어 공유
5. 네이버/다음 검색 등록
