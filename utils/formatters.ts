
export const formatToRupiah = (value: string): string => {
    const numericValue = value.replace(/[^,\d]/g, '').toString();
    const number = parseInt(numericValue, 10);
    return isNaN(number) ? '' : number.toLocaleString('id-ID');
};

export const parseRupiah = (rupiahString: string): string => {
    return rupiahString ? rupiahString.toString().replace(/\./g, '') : '0';
};

export const formatCurrency = (value: number): string => {
    return isNaN(value) ? 'Rp 0' : new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        maximumFractionDigits: 2 
    }).format(value);
};

export const getIndicatorColor = (name?: string): string => {
    const lowerName = name ? name.toLowerCase() : '';
    if (lowerName.includes('excellent') || lowerName.includes('luar biasa')) return 'bg-green-500';
    if (lowerName.includes('good') || lowerName.includes('baik')) return 'bg-blue-600';
    if (lowerName.includes('average') || lowerName.includes('memenuhi')) return 'bg-yellow-500';
    if (lowerName.includes('under') || lowerName.includes('kurang')) return 'bg-pink-500';
    if (lowerName.includes('bad') || lowerName.includes('perbaikan')) return 'bg-red-600';
    return 'bg-slate-400';
};