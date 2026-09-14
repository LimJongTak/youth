import type { SiteContent } from "../types/siteContent";

/** Fallback copy shown while Firestore loads (or if a section is missing). */
export const defaultSiteContent: SiteContent = {
	hero: {
		titleBefore: "AI·첨단산업 취업을 준비하는",
		titleEmphasis: "미취업 청년",
		titleAfter: "을 위한 실무형 부트캠프",
		lead: "정규 교과와 빅테크 연계 몰입형 교육을 결합한, 수강료·교재비 전액 무료 실무 교육 프로그램입니다.",
		stats: [
			{ label: "모집 대상", value: "만 19~34세" },
			{ label: "수강료·교재비", value: "전액 무료" },
			{ label: "참여기업", value: "21개사" },
		],
	},
	about: {
		description: "국립순천대학교가 운영하는 실무 중심 청년 취업 역량 강화 프로그램입니다.",
		bodyHighlight: "청년도약 인재양성 부트캠프",
		body: "는 AI·첨단산업 취업을 준비하는 미취업 청년을 위해 정규 교과 과정과 네이버클라우드·메가존클라우드 등 빅테크 기업 연계 몰입형 교육을 결합했습니다. 비전공자도 초급 과정부터 체계적으로 학습할 수 있도록 단계별 트랙으로 설계되었습니다.",
	},
	checklist: [
		{
			title: "만 19~34세, 미취업 청년",
			desc: "연령 기준에 해당하고 현재 취업 준비 중이에요",
			defaultChecked: true,
		},
		{
			title: "대학 졸업 후 취업 준비생",
			desc: "또는 1년 이상 장기 휴학 · 졸업유예 · 군휴학자",
		},
		{
			title: "AI·첨단산업 취업 희망자",
			desc: "전공과 무관하게 관련 분야 취업을 준비하고 있어요",
		},
		{
			title: "비전공자도 OK",
			desc: "초급 트랙부터 체계적으로 학습할 준비가 되어 있어요",
		},
	],
	commonCourse: {
		title: "공통과정 (필수)",
		desc: "데이터 과학의 이해 · 디지털 추론과 문제해결",
	},
	tracks: [
		{
			id: "basic",
			tabLabel: "초급",
			badge: "BASIC",
			badgeClass: "lvBasic",
			title: "AI와 코딩",
			subtitle: "비전공자도 부담 없이 시작하는 입문 트랙",
			hours: [
				{ value: "30H", label: "교양" },
				{ value: "30H", label: "사회" },
				{ value: "45H", label: "전문" },
				{ value: "-", label: "몰입과정 없음" },
			],
			total: "105시간",
		},
		{
			id: "mid",
			tabLabel: "중급",
			badge: "MID",
			badgeClass: "lvMid",
			title: "심층강화학습 + 메가존클라우드",
			subtitle: "메가존클라우드 연계 몰입형 심화 트랙",
			hours: [
				{ value: "30H", label: "교양" },
				{ value: "30H", label: "사회" },
				{ value: "45H", label: "전문" },
				{ value: "45H", label: "몰입(메가존클라우드)" },
			],
			total: "150시간",
		},
		{
			id: "adv",
			tabLabel: "고급",
			badge: "ADVANCED",
			badgeClass: "lvAdv",
			title: "머신러닝 + 네이버클라우드",
			subtitle: "네이버클라우드 연계 몰입형 최상위 트랙",
			hours: [
				{ value: "30H", label: "교양" },
				{ value: "30H", label: "사회" },
				{ value: "45H", label: "전문" },
				{ value: "45H", label: "몰입(네이버클라우드)" },
			],
			total: "150시간",
		},
	],
	benefits: [
		{
			icon: "fa-briefcase",
			gradient: "linear-gradient(135deg,#4aa8ff,#2e6fd6)",
			title: "취업 지원",
			items: ["참여기업 멘토링", "채용연계형 인턴십", "모의면접·1:1 컨설팅", "교수추천서 지원"],
		},
		{
			icon: "fa-graduation-cap",
			gradient: "linear-gradient(135deg,#2ebaae,#1f9a90)",
			title: "교육 지원",
			items: [
				"수강료·교재비 전액 무료",
				"교육지원금(기준 충족 시)",
				"기업연계 프로젝트",
				"빅테크 기업탐방",
			],
		},
		{
			icon: "fa-award",
			gradient: "linear-gradient(135deg,#ffb648,#ff8a3d)",
			title: "인증 · 학습 지원",
			items: [
				"총장 명의 수료증",
				"대학·기업 공동 디지털 배지",
				"e-포트폴리오 구축",
				"AI 서비스 9종 제공",
			],
		},
		{
			icon: "fa-bus",
			gradient: "linear-gradient(135deg,#ff6f61,#e5493a)",
			title: "원거리 교육생 지원",
			items: ["교통비 지원", "게스트하우스 제공"],
		},
	],
	journey: [
		{ title: "① 신청 · 접수", desc: "구글 폼 온라인 신청 (선착순)" },
		{ title: "② 서류 확인 · 선발", desc: "자격요건 확인 후 참여 대상 확정" },
		{ title: "③ 공통과정 교육", desc: "데이터 과학의 이해 · 디지털 추론과 문제해결" },
		{ title: "④ 선택 트랙 심화교육", desc: "초급/중급/고급 중 선택, 빅테크 몰입교육 포함" },
		{ title: "⑤ 기업연계 프로젝트 · 인턴십", desc: "참여기업 멘토링 및 채용연계형 인턴십" },
		{ title: "⑥ 수료 · 배지 발급", desc: "총장 명의 수료증, 대학·기업 공동 디지털 배지" },
		{ title: "⑦ 취업 컨설팅 · 채용연계", desc: "모의면접, 1:1 컨설팅, 교수추천서 지원" },
	],
	applySteps: [
		{ num: 1, title: "모집대상 자가 체크", desc: "체크리스트로 지원 자격을 먼저 확인하세요." },
		{ num: 2, title: "희망 트랙 선택", desc: "초급 · 중급 · 고급 중 원하는 트랙을 정하세요." },
		{ num: 3, title: "온라인 신청서 제출", desc: "공식 안내 페이지의 구글 폼으로 신청을 완료하세요." },
	],
	faqs: [
		{
			q: "비전공자도 신청할 수 있나요?",
			a: "네, 가능합니다. 비전공자도 초급 트랙부터 체계적으로 학습할 수 있도록 설계되어 있습니다.",
		},
		{
			q: "수강료가 정말 무료인가요?",
			a: "수강료와 교재비는 전액 무료이며, 기준 충족 시 교육지원금도 지원됩니다.",
		},
		{
			q: "트랙은 언제, 어떻게 선택하나요?",
			a: "공통과정 이수 후 초급·중급·고급 트랙 중 하나를 선택해 심화 학습을 진행합니다. 자세한 선택 절차는 사업단으로 문의해 주세요.",
		},
		{
			q: "거주지가 멀어도 참여할 수 있나요?",
			a: "원거리 교육생을 위해 교통비와 게스트하우스가 지원됩니다.",
		},
	],
	contact: {
		org: "국립순천대학교 AI인재양성부트캠프사업단",
		email: "wook0501@gmail.com",
		address: "전남 순천시 중앙로 255 산학협력단 708호",
		officialUrl:
			"https://www.scnu.ac.kr/scnuai/cm/cntnts/cntntsView.do?mi=10310&cntntsId=5768",
		kakaoUrl: "https://open.kakao.com/o/gtIUg0Li",
	},
};
