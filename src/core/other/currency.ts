interface CurrencyOptions {
    readonly locales?: string;
    readonly currency?: string;
    readonly digits?: number;
}

export function formatCurrency(value: number, options: CurrencyOptions = {}): string {
    return (value / 100).toLocaleString(options.locales, {
        style: 'currency',
        currency: options.currency || 'EUR',
        minimumFractionDigits: undefined == options.digits ? 2 : options.digits
    });
}