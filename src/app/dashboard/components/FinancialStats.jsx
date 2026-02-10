
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    usePendingProcurementsData,
    useOutstandingPaymentsData,
    useMonthlyExpensesData
} from "@/hooks/useDashboardData";
import {
    DollarSign,
    CreditCard,
    BarChart3,
    TrendingUp,
} from "lucide-react";
import { formatCurrency, formatDate, getStatusColor } from "../utils";

export function FinancialStats({ filters }) {
    const {
        data: procurementsPending,
        isLoading: isProcurementsLoading,
        isError: isProcurementsError
    } = usePendingProcurementsData(filters);

    const {
        data: paymentsOutstanding,
        isLoading: isPaymentsLoading,
        isError: isPaymentsError
    } = useOutstandingPaymentsData(filters);

    const {
        data: expensesMonthly,
        isLoading: isExpensesLoading,
        isError: isExpensesError
    } = useMonthlyExpensesData(filters);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Pending Procurements */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-gray-500" />
                            <CardTitle className="text-lg font-semibold">
                                Pending Procurements
                            </CardTitle>
                        </div>
                        {!isProcurementsLoading && !isProcurementsError && (
                            <Badge variant="secondary">{procurementsPending?.length}</Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isProcurementsLoading ? (
                        <Skeleton className="h-[200px] w-full rounded-xl" />
                    ) : isProcurementsError ? (
                        <div className="text-red-500 text-sm">Error loading data</div>
                    ) : procurementsPending?.length > 0 ? (
                        <div className="space-y-3">
                            {procurementsPending.map((proc) => (
                                <div
                                    key={proc.procurementId}
                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            ID: {proc.procurementId}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatCurrency(proc.amount)}
                                        </p>
                                    </div>
                                    <Badge className={getStatusColor(proc.status)}>
                                        {proc.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                            <DollarSign className="w-12 h-12 opacity-50" />
                            <p className="mt-2">No pending procurements</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Outstanding Payments */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-gray-500" />
                            <CardTitle className="text-lg font-semibold">
                                Outstanding Payments
                            </CardTitle>
                        </div>
                        {!isPaymentsLoading && !isPaymentsError && (
                            <Badge variant="destructive">{paymentsOutstanding?.length}</Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isPaymentsLoading ? (
                        <Skeleton className="h-[200px] w-full rounded-xl" />
                    ) : isPaymentsError ? (
                        <div className="text-red-500 text-sm">Error loading data</div>
                    ) : paymentsOutstanding?.length > 0 ? (
                        <div className="space-y-3">
                            {paymentsOutstanding.map((payment) => (
                                <div
                                    key={payment.paymentId}
                                    className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                                >
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            ID: {payment.paymentId}
                                        </h4>
                                        <p className="text-sm text-amber-600 dark:text-amber-400">
                                            {formatCurrency(payment.amount)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-amber-600 dark:text-amber-400">
                                            Due: {formatDate(payment.dueDate)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                            <CreditCard className="w-12 h-12 opacity-50" />
                            <p className="mt-2">No outstanding payments</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Monthly Expenses */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-gray-500" />
                            <CardTitle className="text-lg font-semibold">
                                Monthly Expenses
                            </CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" className="text-primary">
                            View Report
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isExpensesLoading ? (
                        <Skeleton className="h-[200px] w-full rounded-xl" />
                    ) : isExpensesError ? (
                        <div className="text-red-500 text-sm">Error loading data</div>
                    ) : expensesMonthly?.length > 0 ? (
                        <div className="space-y-3">
                            {expensesMonthly.map((expense) => (
                                <div
                                    key={expense.month}
                                    className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                >
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            {expense.month}
                                        </h4>
                                        <p className="text-sm text-blue-600 dark:text-blue-400">
                                            {formatCurrency(expense.totalExpense)}
                                        </p>
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-blue-500" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                            <BarChart3 className="w-12 h-12 opacity-50" />
                            <p className="mt-2">No expense data</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
