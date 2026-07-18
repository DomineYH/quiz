# 📊 구글 스프레드시트 & Apps Script 연동 가이드

이 애플리케이션은 **Google Apps Script**를 활용하여 설문/퀴즈 문제 데이터를 구글 스프레드시트에서 실시간으로 불러오고, 학습자의 자가진단 및 퀴즈 결과를 실시간으로 스프레드시트에 저장할 수 있습니다.

초보자도 쉽게 세팅할 수 있도록, **웹앱을 배포하여 URL을 입력하기만 하면 필요한 시트(quiz, results)와 기본 문제 데이터가 자동으로 생성**되도록 지능형 코드를 작성했습니다.

---

## 1. Google Apps Script 소스 코드

구글 스프레드시트의 **[확장 프로그램] -> [Apps Script]**를 클릭한 뒤, 기존 코드를 모두 지우고 아래 코드를 그대로 복사하여 붙여넣으세요.

```javascript
/**
 * 생성형 AI 개념 퀴즈 & 자가진단용 Google Apps Script
 * - doGet(e): 스프레드시트의 'quiz' 시트에서 문제를 읽어와 JSON으로 반환합니다. (시트가 없으면 기본값으로 자동 생성)
 * - doPost(e): 학습자의 퀴즈 결과를 'results' 시트에 누적 저장합니다. (시트가 없으면 자동 생성)
 */

const QUIZ_SHEET_NAME = "quiz";
const RESULTS_SHEET_NAME = "results";

// 1. GET 요청 처리 (문제 조회 및 자동 초기화)
function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let quizSheet = ss.getSheetByName(QUIZ_SHEET_NAME);
  
  // 시트가 없으면 자동 생성 및 기본 문제 추가
  if (!quizSheet) {
    quizSheet = ss.insertSheet(QUIZ_SHEET_NAME);
    initializeDefaultQuestions(quizSheet);
  }
  
  const dataRange = quizSheet.getDataRange();
  const values = dataRange.getValues();
  
  if (values.length <= 1) {
    // 헤더만 있거나 비어있을 때 다시 초기화
    initializeDefaultQuestions(quizSheet);
  }
  
  const headers = values[0];
  const questions = [];
  
  // 시트에서 문제 로딩 (2번째 줄부터)
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row[0]) continue; // ID가 없는 빈 행 패스
    
    const questionObj = {};
    for (let j = 0; j < headers.length; j++) {
      questionObj[headers[j].toString().trim()] = row[j];
    }
    questions.push(questionObj);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    data: questions
  })).setMimeType(ContentService.MimeType.JSON);
}

// 2. POST 요청 처리 (퀴즈 결과 저장)
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let resultsSheet = ss.getSheetByName(RESULTS_SHEET_NAME);
    
    //결과 저장 시트가 없으면 헤더와 함께 자동 생성
    if (!resultsSheet) {
      resultsSheet = ss.insertSheet(RESULTS_SHEET_NAME);
      resultsSheet.appendRow(["timestamp", "user_alias", "score", "result_level", "reflection"]);
      
      // 스타일링 (헤더 굵게, 배경 회색)
      resultsSheet.getRange("A1:E1").setFontWeight("bold").setBackground("#F3F4F6");
    }
    
    // 요청 데이터 파싱
    let payload;
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter;
    }
    
    const timestamp = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
    const userAlias = payload.user_alias || "익명";
    const score = Number(payload.score) || 0;
    const resultLevel = payload.result_level || "일반";
    const reflection = payload.reflection || "";
    
    // 행 추가
    resultsSheet.appendRow([timestamp, userAlias, score, resultLevel, reflection]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "결과가 성공적으로 저장되었습니다."
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 3. 기본 문제 데이터 생성 함수
function initializeDefaultQuestions(sheet) {
  sheet.clear();
  
  // 1행에 헤더 추가
  const headers = ["id", "question", "option_a", "option_b", "option_c", "answer", "feedback"];
  sheet.appendRow(headers);
  
  // 기본 예시 문제 5개 설정
  const defaultQuestions = [
    [
      "q1",
      "Q1. 생성형 AI(Generative AI)와 기존 분석형 AI(Discriminative AI)의 가장 핵심적인 차이점은 무엇인가요?",
      "데이터를 분석하여 고정된 범주로 분류하거나 예측만 수행한다.",
      "기존 데이터의 패턴을 학습하여 완전히 새로운 텍스트, 이미지, 오디오 등의 콘텐츠를 창조(생성)한다.",
      "하드웨어 성능을 높여 수치 연산 속도만을 고속화한 인공지능이다.",
      "b",
      "생성형 AI의 핵심은 단순 분류나 예측을 넘어, 기존 데이터의 패턴과 규칙을 학습한 뒤 이를 바탕으로 독창적인 콘텐츠(텍스트, 이미지, 코드 등)를 새로 만들어내는 능력에 있습니다."
    ],
    [
      "q2",
      "Q2. 생성형 AI가 학습 데이터의 왜곡, 확률적 계산의 한계 등으로 인해 그럴듯하지만 완전히 사실과 다르거나 왜곡된 정보를 사실처럼 출력하는 현상을 일컫는 교직 필수 용어는 무엇인가요?",
      "할루시네이션(Hallucination / 인공지능 환각 현상)",
      "오버피팅(Overfitting / 모델의 과적합 현상)",
      "딥페이크(Deepfake / 인공지능 기반 이미지 합성)",
      "a",
      "할루시네이션(환각)은 생성형 AI가 잘못되거나 존재하지 않는 정보를 매우 확신에 가득 찬 어조로 그럴듯하게 답변하는 현상입니다. 교육 현장에서 학생들이 AI 검색 결과를 무조건 신뢰하지 않고 스스로 교차 검증하도록 지도해야 합니다."
    ],
    [
      "q3",
      "Q3. 생성형 AI(대형 언어 모델)에 프롬프트(명령어)를 입력할 때, 구체적인 해결 예시(Example)를 한 개 또는 몇 개 제공하여 원하는 고품질의 답변 형식과 완성도를 유도하는 프롬프트 엔지니어링 기법은 무엇인가요?",
      "제로샷 프롬프팅(Zero-shot Prompting)",
      "퓨샷 프롬프팅(Few-shot Prompting)",
      "파인 튜닝(Fine-tuning / 미세 조정)",
      "b",
      "퓨샷(Few-shot) 프롬프팅은 질문하기 전 몇 가지 예시를 제공하여 인공지능이 맥락과 원하는 답변의 구조를 정확히 파악하도록 돕는 강력한 지시 기법입니다. 예시를 아예 주지 않는 것을 제로샷(Zero-shot)이라고 합니다."
    ],
    [
      "q4",
      "Q4. 생성형 AI를 학교 수업 설계나 학생 평가 업무에 활용하고자 하는 예비 교사로서 가장 바람직하지 않은 AI 활용 태도는 무엇인가요?",
      "AI가 작성해 준 수업 계획안과 평가 루브릭의 내용 타당성 및 교육과정 적합성을 비판적으로 검토하고 가공하여 활용한다.",
      "인공지능 모델이 생성한 모든 서술형 답안은 검증된 진실이므로 학생들에게 의심 없이 정답으로 외우게 한다.",
      "학생 정보 유출 등 프라이버시 침해를 방지하기 위해, 학생들의 이름이나 사적인 민감 자료를 외부 공용 AI 서비스에 직접 입력하지 않는다.",
      "b",
      "미래 교사는 생성형 AI를 맹신하는 주체가 아닌 비판적 수용자로 행동해야 합니다. 인공지능의 산출물을 맹목적으로 학습 자료로 제공하는 것은 잘못된 오개념을 유발할 수 있어 대단히 위험합니다."
    ],
    [
      "q5",
      "Q5. 생성형 AI 모델이 원본 작가나 제작자의 사전 동의 및 적절한 보상 없이 저작물을 무단 복제하여 학습 데이터로 활용함으로써 유발되는 가장 대표적인 인공지능 윤리적/법적 쟁점은 무엇인가요?",
      "알고리즘의 성별·인종적 데이터 편향(Data Bias) 유발 문제",
      "지식재산권 및 저작권 침해(Copyright Infringement) 논란",
      "디지털 디바이드(Digital Divide / 디지털 기기 및 정보 격차)",
      "b",
      "생성형 AI 모델의 저작물 학습은 현대 저작권법과 공정이용(Fair Use) 범위 논란의 핵심 주제입니다. 교실에서도 학생들이 저작물 사용의 올바른 규칙과 디지털 시민성(Digital Citizenship)을 이해할 수 있도록 교육해야 합니다."
    ]
  ];
  
  // 데이터 기록
  for (let k = 0; k < defaultQuestions.length; k++) {
    sheet.appendRow(defaultQuestions[k]);
  }
  
  // 스타일링 적용 (헤더 굵게, 첫 행 고정)
  sheet.getRange("A1:G1").setFontWeight("bold").setBackground("#E0E7FF");
  sheet.setFrozenRows(1);
}
```

---

## 2. 세부 설정 및 배포 방법 (초보자용 단계별 설명)

스프레드시트를 생성하고 Apps Script를 배포하는 전체 과정을 설명합니다.

### 1단계: 구글 스프레드시트 만들기
1. [구글 드라이브](https://drive.google.com/)에 접속하여 **[+ 새로 만들기] -> [Google 스프레드시트]**를 생성합니다.
2. 스프레드시트의 이름(예: `생성형 AI 자가진단 시스템`)을 입력합니다. (시트 탭은 비워두셔도 웹앱 최초 접속 시 자동 생성됩니다.)

### 2단계: Apps Script에 소스 코드 붙여넣기
1. 스프레드시트 상단 메뉴에서 **[확장 프로그램] -> [Apps Script]**를 클릭합니다.
2. 새 창이 열리면 기본으로 적혀있는 `function myFunction() {}` 내용을 모두 지웁니다.
3. 위의 **1. Google Apps Script 소스 코드**를 그대로 복사하여 입력창에 붙여넣습니다.
4. 상단의 디스크 모양 **[프로젝트 저장]** 버튼(또는 `Ctrl + S` / `Cmd + S`)을 눌러 저장합니다.

### 3단계: 웹앱으로 배포하기 (핵심 ⭐️)
1. Apps Script 화면 우측 상단의 파란색 **[배포] -> [새 배포]**를 선택합니다.
2. 유형 선택에서 톱니바퀴 아이콘 옆의 **[유형 선택] -> [웹앱]**을 누릅니다.
3. 설정을 다음과 같이 변경합니다:
   * **설명**: `생성형 AI 퀴즈 연동` (임의 입력)
   * **웹앱을 실행할 사용자**: **나(이메일 주소)**
   * **액세스 권한이 있는 사용자**: **모든 사용자(Anyone)** 
     *(주의: 모든 사용자로 설정해야 우리 웹 앱이 학생들의 개인 식별 정보 없이 결과를 전송할 수 있습니다.)*
4. 하단의 **[배포]** 버튼을 누릅니다.

### 4단계: 권한 승인하기
1. 배포 중 **[권한 승인]** 버튼이 나타나면 이를 클릭합니다.
2. 본인의 구글 계정을 선택합니다.
3. "Google에서 이 앱을 검증하지 않았습니다" 경고 문구가 나오면 좌측 하단의 **[고급]**을 누른 뒤, **`제목 없는 프로젝트(이동)`**(또는 본인이 정한 프로젝트 이름) 링크를 클릭합니다.
4. 마지막으로 **[허용]** 버튼을 눌러 권한 승인을 완료합니다.

### 5단계: 웹앱 URL 복사 및 앱에 연동하기
1. 배포가 완료되면 화면에 **웹앱 URL**이 표시됩니다. (`https://script.google.com/macros/s/.../exec` 형식)
2. **[복사]** 버튼을 눌러 URL을 저장합니다.
3. 이제 우리가 제작한 **Generative AI Concept Quiz Web Application**의 우측 상단 ⚙️ 설정 아이콘을 누르고, 복사한 웹앱 URL을 입력 필드에 붙여넣어 연동합니다.

---

## 3. 스프레드시트에서 퀴즈 편집하기

연동 후 앱을 실행하거나 웹앱 URL로 한 번이라도 통신하면, 구글 스프레드시트에 **`quiz`** 시트와 **`results`** 시트가 자동으로 개설되고 기본 문제가 채워집니다.

* **문제 수정하기**: `quiz` 시트에서 질문 문장, 옵션, 정답(`a`, `b`, `c`), 피드백 내용을 수정하면 우리 웹 앱에 실시간으로 반영됩니다!
* **문제 추가하기**: `quiz` 시트 하단에 `q6`, `q7` 등 새로운 아이디와 함께 양식에 맞추어 내용을 입력하면 문제 리스트가 자동으로 늘어납니다.
* **결과 확인하기**: 학생들이 제출한 퀴즈의 최종 점수, 성찰 일지(Reflection)가 `results` 시트에 시간대별로 차곡차곡 누적됩니다.
