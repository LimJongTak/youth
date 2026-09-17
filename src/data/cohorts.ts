import type { Cohort } from "../types/cohort";

/**
 * 초기 시드 데이터. 1기는 순천대 공식 공지 페이지, 2기는 "2기교육생모집.pptx"
 * 모집 안내문에서 가져온 값이다. 앱이 실제로 동작할 땐 이 값들은 *초기값*일
 * 뿐이고, 관리자가 관리자 화면에서 기수를 추가/수정/삭제하면 그 내용이
 * Firestore에 저장돼 실시간으로 반영된다(CohortContext 참고). Firestore가
 * 아직 로딩 중이거나 비어 있을 때 화면에 뭔가는 보이도록 하는 fallback 용도.
 */
export const seedCohorts: Cohort[] = [
	{
		id: "gen-1",
		generation: 1,
		status: "closed",
		capacity: "미정 (공식 페이지 참고)",
		recruitPeriod: "2026.08.24(월) 이후 선착순",
		eduPeriod: "트랙별 상이 (커리큘럼 참고)",
		eduHours: "트랙별 상이 (105~150시간, 커리큘럼 참고)",
		location: "국립순천대학교 · 참여기업 연계",
		note: "선착순 모집으로 조기 마감되었습니다.",
		applyUrl:
			"https://www.scnu.ac.kr/scnuai/cm/cntnts/cntntsView.do?mi=10310&cntntsId=5768",
		featured: false,
		scheduleDefault: true,
	},
	{
		id: "gen-2",
		generation: 2,
		status: "recruiting",
		capacity: "총 30명",
		recruitPeriod: "2026.09.14(월) ~ 09.30(수)",
		eduPeriod: "2026.10.06(화) ~ 12.12(토)",
		eduHours: "105~150시간 (트랙별 상이)",
		location: "광양 커뮤니티센터(공통과정)\n국립순천대학교(전문·몰입교과)",
		note: "선착순 모집으로 인해 조기 마감될 수 있습니다.",
		applyUrl:
			"https://docs.google.com/forms/d/e/1FAIpQLSd5-aya_NN-5Fma8SmLobOshtjVcfNxvtR0Pr4LGnf6tbLagw/viewform",
		featured: true,
	},
];
