import type { Cohort } from "../types/cohort";

/**
 * Seed data. 1기 is sourced from the official SCNU announcement page; 2기 is
 * sourced from the "2기교육생모집.pptx" recruiting flyer. Once the app runs,
 * these are only the *initial* values — an administrator can add, edit, or
 * remove cohorts from the admin screen, and their changes are persisted to
 * the browser (see useCohorts / useLocalStorage).
 */
export const seedCohorts: Cohort[] = [
	{
		id: "gen-1",
		generation: 1,
		status: "closed",
		capacity: "미정 (공식 페이지 참고)",
		recruitPeriod: "2026.08.24(월) 이후 선착순",
		eduPeriod: "트랙별 상이 (커리큘럼 참고)",
		location: "국립순천대학교 · 참여기업 연계",
		note: "선착순 모집으로 조기 마감되었습니다.",
		applyUrl:
			"https://www.scnu.ac.kr/scnuai/cm/cntnts/cntntsView.do?mi=10310&cntntsId=5768",
		featured: false,
	},
	{
		id: "gen-2",
		generation: 2,
		status: "recruiting",
		capacity: "총 30명",
		recruitPeriod: "2026.09.14(월) ~ 09.30(수)",
		eduPeriod: "2026.10.06(화) ~ 12.12(토)",
		location: "광양 커뮤니티센터(공통과정)\n국립순천대학교(전문·몰입교과)",
		note: "선착순 모집으로 인해 조기 마감될 수 있습니다.",
		applyUrl:
			"https://docs.google.com/forms/d/e/1FAIpQLSd5-aya_NN-5Fma8SmLobOshtjVcfNxvtR0Pr4LGnf6tbLagw/viewform",
		featured: true,
	},
];
