import { useState, useEffect } from 'react';
import { AppData } from '../types';

const advertiserBonusSchemes = [
    { id: 1, name: 'Bad Perform 1', threshold: 500000000, multiplier: 8 },
    { id: 2, name: 'Average 1', threshold: 975000000, multiplier: 13 },
    { id: 3, name: 'Excellent 1', threshold: 1950000000, multiplier: 19 }
];

const pointsBasedBonusSchemes = [
    { id: 101, name: 'Good', threshold: 80, multiplier: 10 },
    { id: 102, name: 'Excellent', threshold: 95, multiplier: 15 },
    { id: 103, name: 'Outstanding', threshold: 105, multiplier: 20 }
];

const advertiserKpiIndicators = [
    { id: 1, name: 'Bad Perform', threshold: -25, color: 'bg-red-600' },
    { id: 2, name: 'Under Perform', threshold: 40, color: 'bg-pink-500' },
    { id: 3, name: 'Average', threshold: 60, color: 'bg-yellow-500' },
    { id: 4, name: 'Good', threshold: 80, color: 'bg-blue-500' },
    { id: 5, name: 'Excellent', threshold: 100, color: 'bg-green-500' }
];

const initialData: AppData = {
    "Advertiser MP": {
        bonusCalculationMethod: 'OMSET_BASED',
        employees: [
            { id: 101, name: 'Budi Santoso' },
            { id: 102, name: 'Citra Lestari' },
        ],
        history: [],
        kpiConfigs: [
            { id: 1, platform: 'Shopee', name: 'ROAS Shopee', bobot: 15, target: 12, minTarget: 10, type: 'higher_is_better', isCurrency: false, isPercentage: false, specialCalc: 'ROAS', pointCapping: 'uncapped' },
            { id: 2, platform: 'Shopee', name: 'Realisasi Omset Shopee', bobot: 10, target: 250000000, type: 'higher_is_better', isCurrency: true, isPercentage: false, pointCapping: 'uncapped' },
            { id: 3, platform: 'Shopee', name: 'Efisiensi Biaya Iklan Shopee', bobot: 5, target: 25000000, type: 'lower_is_better', isCurrency: true, isPercentage: false, pointCapping: 'uncapped' },
            { id: 4, platform: 'Lazada', name: 'ROAS Lazada', bobot: 15, target: 8, minTarget: 6, type: 'higher_is_better', isCurrency: false, isPercentage: false, specialCalc: 'ROAS', pointCapping: 'uncapped' },
            { id: 5, platform: 'Lazada', name: 'Realisasi Omset Lazada', bobot: 10, target: 150000000, type: 'higher_is_better', isCurrency: true, isPercentage: false, pointCapping: 'uncapped' },
            { id: 6, platform: 'Lazada', name: 'Efisiensi Biaya Iklan Lazada', bobot: 5, target: 20000000, type: 'lower_is_better', isCurrency: true, isPercentage: false, pointCapping: 'uncapped' },
            { id: 7, platform: 'TikTok Shop', name: 'ROAS TikTok Shop', bobot: 15, target: 5, minTarget: 4, type: 'higher_is_better', isCurrency: false, isPercentage: false, specialCalc: 'ROAS', pointCapping: 'uncapped' },
            { id: 8, platform: 'TikTok Shop', name: 'Realisasi Omset TikTok Shop', bobot: 15, target: 100000000, type: 'higher_is_better', isCurrency: true, isPercentage: false, pointCapping: 'uncapped' },
            { id: 9, platform: 'TikTok Shop', name: 'Efisiensi Biaya Iklan TikTok Shop', bobot: 10, target: 20000000, type: 'lower_is_better', isCurrency: true, isPercentage: false, pointCapping: 'uncapped' },
        ],
        bonusSchemes: advertiserBonusSchemes,
        kpiIndicators: advertiserKpiIndicators
    },
    "SPV Advertiser": {
        bonusCalculationMethod: 'OMSET_BASED',
        employees: [
            { id: 201, name: 'Rina Wijaya' }
        ],
        history: [],
        kpiConfigs: [
            { id: 10, platform: 'Tim', name: 'Total Omset Tim', bobot: 40, target: 1000000000, type: 'higher_is_better', isCurrency: true, isPercentage: false, pointCapping: 'uncapped' },
            { id: 11, platform: 'Tim', name: 'Profitabilitas Tim (%)', bobot: 40, target: 20, type: 'higher_is_better', isCurrency: false, isPercentage: true, pointCapping: 'uncapped' },
            { id: 12, platform: 'Tim', name: 'Pertumbuhan Advertiser Baru', bobot: 20, target: 2, type: 'higher_is_better', isCurrency: false, isPercentage: false, pointCapping: 'uncapped' },
        ],
        bonusSchemes: advertiserBonusSchemes,
        kpiIndicators: advertiserKpiIndicators
    },
    "Tim Kreatif": {
        bonusCalculationMethod: 'POINTS_BASED',
        employees: [
            { id: 301, name: 'Andi Desainer' },
            { id: 302, name: 'Ria Videographer' },
        ],
        history: [],
        kpiConfigs: [
            { id: 19, platform: 'Produksi', name: 'Jumlah Aset Selesai (per bulan)', bobot: 30, target: 80, type: 'higher_is_better', isCurrency: false, isPercentage: false, pointCapping: 'uncapped' },
            { id: 20, platform: 'Kualitas', name: 'Tingkat Revisi Rata-rata', bobot: 25, target: 1.5, type: 'lower_is_better', isCurrency: false, isPercentage: false, pointCapping: 'uncapped' },
            { id: 21, platform: 'Kualitas', name: 'Skor Kualitas Internal (skala 1-5)', bobot: 20, target: 4.5, type: 'higher_is_better', isCurrency: false, isPercentage: false, pointCapping: 'capped' },
            { id: 22, platform: 'Performa Iklan', name: 'Rata-rata CTR Aset Iklan', bobot: 25, target: 2, type: 'higher_is_better', isCurrency: false, isPercentage: true, pointCapping: 'uncapped' }
        ],
        bonusSchemes: pointsBasedBonusSchemes,
        kpiIndicators: advertiserKpiIndicators
    },
    "Admin Support": {
        bonusCalculationMethod: 'NON_SALES',
        employees: [
            { id: 401, name: 'Dewi Admin' }
        ],
        history: [],
        kpiConfigs: [
            { id: 30, platform: 'Administrasi', name: 'Kecepatan Respon Laporan (jam)', bobot: 30, target: 2, type: 'lower_is_better', isCurrency: false, isPercentage: false, pointCapping: 'uncapped' },
            { id: 31, platform: 'Administrasi', name: 'Akurasi Data Entry (%)', bobot: 30, target: 99, type: 'higher_is_better', isCurrency: false, isPercentage: true, pointCapping: 'uncapped' },
            { id: 32, platform: 'Administrasi', name: 'Penyelesaian Tugas Tepat Waktu (%)', bobot: 25, target: 95, type: 'higher_is_better', isCurrency: false, isPercentage: true, pointCapping: 'uncapped' },
            { id: 33, platform: 'Dukungan', name: 'Jumlah Tiket Dukungan Terselesaikan', bobot: 15, target: 50, type: 'higher_is_better', isCurrency: false, isPercentage: false, pointCapping: 'uncapped' }
        ],
        bonusSchemes: [],
        kpiIndicators: advertiserKpiIndicators
    },
    "SPV CS": {
        bonusCalculationMethod: 'OMSET_BASED',
        employees: [],
        history: [],
        kpiConfigs: [
            { id: 50, platform: 'NET SALES CS', name: 'Mencapai 70% target Individu Cs', bobot: 10, target: 36, type: 'higher_is_better', isCurrency: false, isPercentage: false, pointCapping: 'uncapped' },
            { id: 51, platform: 'NET SALES CS', name: 'Mencapai target Net Sales Cs', bobot: 20, target: 2000000000, type: 'higher_is_better', isCurrency: true, isPercentage: false, pointCapping: 'uncapped' },
            { id: 52, platform: 'RATE CLOSING CS BY PLATFORM', name: 'Meta', bobot: 15, target: 35, type: 'higher_is_better', isCurrency: false, isPercentage: true, pointCapping: 'uncapped' },
            { id: 53, platform: 'RATE CLOSING CS BY PLATFORM', name: 'Snack Video/Tiktok', bobot: 15, target: 38, type: 'higher_is_better', isCurrency: false, isPercentage: true, pointCapping: 'uncapped' },
            { id: 54, platform: 'RATE CLOSING CS BY PLATFORM', name: 'MIX Platform', bobot: 10, target: 40, type: 'higher_is_better', isCurrency: false, isPercentage: true, pointCapping: 'uncapped' },
            { id: 55, platform: 'CROSSELLING & UP SELLING', name: 'Quantity & Produk Mix', bobot: 7, target: 209831649, type: 'higher_is_better', isCurrency: true, isPercentage: false, pointCapping: 'uncapped' },
            { id: 56, platform: 'RETURN TEAM CS', name: 'Mencapai target return Max.10%', bobot: 8, target: 10, type: 'lower_is_better', isCurrency: false, isPercentage: true, pointCapping: 'uncapped' },
            { id: 57, platform: 'GROWTH TEAM', name: 'GROWTH MONTH TO MONTH', bobot: 5, target: 10, type: 'higher_is_better', isCurrency: false, isPercentage: true, pointCapping: 'uncapped' },
            { id: 58, platform: 'SIKAP KERJA', name: 'Surat Teguran Team CS', bobot: 3, target: 3, type: 'lower_is_better', isCurrency: false, isPercentage: false, pointCapping: 'uncapped' },
            { id: 59, platform: 'SIKAP KERJA', name: 'Sikap kerja individu', bobot: 4, target: 4, type: 'higher_is_better', isCurrency: false, isPercentage: false, pointCapping: 'uncapped' },
            { id: 60, platform: 'SIKAP KERJA', name: 'Surat Peringatan Team CS', bobot: 3, target: 3, type: 'lower_is_better', isCurrency: false, isPercentage: false, pointCapping: 'uncapped' },
        ],
        bonusSchemes: advertiserBonusSchemes,
        kpiIndicators: advertiserKpiIndicators
    },
    "SPV CRM": {
        bonusCalculationMethod: 'OMSET_BASED',
        employees: [],
        history: [],
        kpiConfigs: [
            { id: 16, platform: 'Tim CRM', name: 'Tingkat Retensi Pelanggan', bobot: 50, target: 60, type: 'higher_is_better', isCurrency: false, isPercentage: true, pointCapping: 'uncapped' },
            { id: 17, platform: 'Tim CRM', name: 'Jumlah Upsell Berhasil', bobot: 30, target: 100, type: 'higher_is_better', isCurrency: false, isPercentage: false, pointCapping: 'uncapped' },
            { id: 18, platform: 'Tim CRM', name: 'Nilai Kontak Baru (Rp)', bobot: 20, target: 50000000, type: 'higher_is_better', isCurrency: true, isPercentage: false, pointCapping: 'uncapped' },
        ],
        bonusSchemes: advertiserBonusSchemes,
        kpiIndicators: advertiserKpiIndicators
    }
};

const LOCAL_STORAGE_KEY = 'incentiveAppData';

export const useAppData = () => {
    const [appData, setAppData] = useState<AppData>(() => {
        try {
            const savedData = window.localStorage.getItem(LOCAL_STORAGE_KEY);
            return savedData ? JSON.parse(savedData) : initialData;
        } catch (error) {
            console.error("Gagal memuat data dari localStorage", error);
            return initialData;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appData));
        } catch (error) {
            console.error("Gagal menyimpan data ke localStorage", error);
        }
    }, [appData]);

    return { appData, setAppData };
};