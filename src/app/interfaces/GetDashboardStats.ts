export interface GetDashboardStats {
    daySend: number | null;
    weekSend: number | null;
    monthSend: number | null;
    previousMonthSends: number | null;
    dayErrors: number | null;
    weekErrors: number | null;
    monthErrors: number | null;
    previousMonthErrors: number | null;
    att: number | null;
    acc: number | null;
    val: number | null;
    ins: number | null;
}
