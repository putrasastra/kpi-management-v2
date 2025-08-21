
import { DivisionData, CalculationResult, KpiConfig } from '../types';
import { formatCurrency } from './formatters';

declare const XLSX: any;
declare const jspdf: any;

const getResultDetail = (id: number, results: CalculationResult | null) => {
    return results?.details.find(d => d.id === id);
};

export const exportToExcel = (divisionData: DivisionData, results: CalculationResult | null, employeeName: string, currentDivision: string) => {
    const wb = XLSX.utils.book_new();
    const platforms = [...new Set(divisionData.kpiConfigs.map(k => k.platform))];
    const isPointsBased = divisionData.bonusCalculationMethod === 'POINTS_BASED';
    const isNonSales = divisionData.bonusCalculationMethod === 'NON_SALES';

    platforms.forEach(platform => {
        const platformKpis = divisionData.kpiConfigs.filter(k => k.platform === platform);
        const sheetData = [
            ["KPI", "Bobot (%)", "Target", "Realisasi", "Score (%)", "Poin"]
        ];
        platformKpis.forEach((kpi: KpiConfig) => {
            const detail = getResultDetail(kpi.id, results);
            const targetDisplay = kpi.isCurrency ? formatCurrency(kpi.target) : (kpi.isPercentage ? `${kpi.target}%` : kpi.target);
            const realisasiDisplay = detail ? (kpi.isCurrency ? formatCurrency(detail.realisasi) : detail.realisasi.toFixed(2)) : '-';
            
            sheetData.push([
                kpi.name,
                kpi.bobot.toString(),
                targetDisplay.toString(),
                realisasiDisplay,
                detail ? detail.score.toFixed(2) : '-',
                detail ? detail.poin.toFixed(3) : '-'
            ]);
        });
        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, platform);
    });

    const summaryData = [
        ["Item", "Value"],
        ["Divisi", currentDivision],
        ["Staff", employeeName],
        ["Grand Total Poin", results ? results.grandTotalPoin.toFixed(3) : 'N/A'],
        ["Indikator KPI", results ? results.kpiIndicator.name : 'N/A'],
    ];

    if (results && !isNonSales) {
        summaryData.push(["Multiplier Aktif", results.activeMultiplier.toString()]);
        summaryData.push([isPointsBased ? "Indikator Performa" : "Indikator Omset", results.omsetIndicator.name]);
        if (isPointsBased) {
            summaryData.push(["Poin Aktual", results.grandTotalPoin.toFixed(3)]);
            summaryData.push(["Target Poin", results.omsetIndicator && 'threshold' in results.omsetIndicator ? results.omsetIndicator.threshold.toString() : 'N/A']);
        } else {
            summaryData.push(["Omset Aktual", formatCurrency(results.totalOmsetRealisasi)]);
            summaryData.push(["Omset Target", formatCurrency(results.totalOmsetTarget)]);
        }
        summaryData.push(["BONUS FINAL", formatCurrency(results.finalBonus)]);
    }
    
    const ws_summary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws_summary, "Ringkasan");

    XLSX.writeFile(wb, `Laporan Insentif - ${currentDivision} - ${employeeName}.xlsx`);
};


const generatePdfDoc = (divisionData: DivisionData, results: CalculationResult | null, employeeName: string, currentDivision: string) => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    const platforms = [...new Set(divisionData.kpiConfigs.map(k => k.platform))];
    let yPos = 20;
    const isPointsBased = divisionData.bonusCalculationMethod === 'POINTS_BASED';
    const isNonSales = divisionData.bonusCalculationMethod === 'NON_SALES';

    // Add Header
    doc.setFillColor(59, 130, 246);
    doc.rect(14, yPos - 10, 10, 10, 'F');
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("SASTRO GRUP", 28, yPos);

    const today = new Date();
    const dateStr = today.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Diterbitkan pada: ${dateStr}`, 14, yPos + 5);
    yPos += 25;


    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Laporan Performa - Divisi ${currentDivision}`, 14, yPos);
    yPos += 7;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Staff: ${employeeName}`, 14, yPos);
    yPos += 15;

    if (results) {
        const summaryBody = [
             ['Grand Total Poin', results.grandTotalPoin.toFixed(3)],
             ['Indikator KPI', results.kpiIndicator.name]
        ];

        if (!isNonSales) {
            summaryBody[0].push('Bonus Final', formatCurrency(results.finalBonus));
            const indicatorLabel = isPointsBased ? "Indikator Performa" : "Indikator Omset";
            summaryBody[1].push(indicatorLabel, results.omsetIndicator.name);
        }

        doc.autoTable({
            startY: yPos,
            body: summaryBody,
            theme: 'plain',
            styles: { fontSize: 11 }
        });
        yPos = doc.autoTable.previous.finalY + 15;
    }

    platforms.forEach(platform => {
        const platformKpis = divisionData.kpiConfigs.filter(k => k.platform === platform);
        const head = [["KPI", "Bobot (%)", "Target", "Realisasi", "Score (%)", "Poin"]];
        const body = platformKpis.map(kpi => {
            const detail = getResultDetail(kpi.id, results);
            const targetDisplay = kpi.isCurrency ? formatCurrency(kpi.target) : (kpi.isPercentage ? `${kpi.target}%` : kpi.target);
            const realisasiDisplay = detail ? (kpi.isCurrency ? formatCurrency(detail.realisasi) : detail.realisasi.toFixed(2)) : '-';

            return [
                kpi.name,
                kpi.bobot,
                targetDisplay,
                realisasiDisplay,
                detail ? detail.score.toFixed(2) : '-',
                detail ? detail.poin.toFixed(3) : '-'
            ];
        });

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(platform, 14, yPos);
        yPos += 7;

        doc.autoTable({
            startY: yPos,
            head: head,
            body: body,
            theme: 'grid'
        });
        yPos = doc.autoTable.previous.finalY + 15;
    });

    return doc;
};


export const exportToPDF = (divisionData: DivisionData, results: CalculationResult | null, employeeName: string, currentDivision: string) => {
    const doc = generatePdfDoc(divisionData, results, employeeName, currentDivision);
    doc.save(`Laporan Performa - ${currentDivision} - ${employeeName}.pdf`);
};

export const generatePdfDataUri = (divisionData: DivisionData, results: CalculationResult | null, employeeName: string, currentDivision: string): Promise<string> => {
    return new Promise((resolve) => {
        const doc = generatePdfDoc(divisionData, results, employeeName, currentDivision);
        resolve(doc.output('datauristring'));
    });
};