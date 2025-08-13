# 카카오 지도 API
## 개요 
배달 앱에서 현재 위치를 표시하기 위해 카카오 지도 api를 사용한다.
vue2로 카카오 api 사용법을 익히기 위해 프로젝트 생성 

## 사용법
1. 카카오 개발자사이트 (https://developers.kakao.com) 접속
2. 개발자 등록 및 앱 생성
3. 웹 플랫폼 추가: 앱 선택 – [플랫폼] – [Web 플랫폼 등록] – 사이트 도메인 등록
4. 사이트 도메인 등록: [웹] 플랫폼을 선택하고, [사이트 도메인] 을 등록합니다. (예: http://localhost:8080)
5. 페이지 상단의 [JavaScript 키]를 지도 API의 appkey로 사용합니다.
6. 카카오 맵 사용설정 ON으로 하기
7. 앱을 실행합니다.


## 등록 도메인 갯수 10개

1. JavaScript SDK, 카카오톡 공유, 카카오맵, 메시지 API 사용시 등록이 필요합니다.
2. 여러개의 도메인은 줄바꿈으로 추가해주세요. 최대 10개까지 등록 가능합니다. 추가 등록은 데브톡으로 문의주세요.
3. 경로를 포함하여 도메인을 입력한 경우, 경로는 제외되고 도메인만 등록됩니다.
4. 예시: (O) https://example.com (X) https://www.example.com/mypage

## 요금

쿼터는 API에 따라 요청 수 또는 데이터 처리량으로 집계하며, 앱의 사용량을 기준으로 합산합니다.

### 카카오맵 무료 요금 건 수

  - 지도 SDK(JavaScript)	300,000건
  - 지도 SDK(iOS/Android)	300,000건

### 카카오맵 추가 사용 요금

  - 지도 SDK(iOS/Android)	0.1 원/건
  - 지도 SDK(JavaScript)	0.1 원/건

https://developers.kakao.com/docs/latest/ko/getting-started/quota#free

