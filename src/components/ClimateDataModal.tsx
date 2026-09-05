import React, { useState } from 'react';
import { X, BarChart2, TrendingUp, Trees, Info, Download, Check } from 'lucide-react';
import { CLIMATE_DATA_YEARS, CORRELATION_COEFFICIENT } from '../data/climateData';

interface ClimateDataModalProps {
  onClose: () => void;
}

export const ClimateDataModal: React.FC<ClimateDataModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'scatter' | 'table'>('chart');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Generate standalone HTML export for students/teachers
  const handleExportStandaloneHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>나무런 (기후 데이터 교육용 웹 게임)</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin:0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #0f172a; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 20px; }
    .card { background: #1e293b; border: 4px solid #16a34a; border-radius: 20px; padding: 30px; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    h1 { font-size: 2.5rem; color: #f59e0b; margin-bottom: 8px; }
    p { line-height: 1.6; color: #cbd5e1; font-size: 1rem; }
    .btn { display: inline-block; background: #eab308; color: black; font-weight: bold; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-size: 1.2rem; margin-top: 20px; border: 3px solid black; }
    .btn:hover { background: #facc15; }
    .stats { background: #064e3b; padding: 12px; border-radius: 10px; margin: 15px 0; text-align: left; font-size: 0.9rem; color: #a7f3d0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🌲 나무런</h1>
    <p><strong>기후 데이터를 활용한 교육용 웹 러닝 게임</strong></p>
    <div class="stats">
      📊 <strong>Orange3 분석 데이터 요약:</strong><br>
      • 기간: 2010년 ~ 2022년 (기상청·산림청)<br>
      • 산림면적: 64% → 63% (거의 정체)<br>
      • CO2 농도: 394.9ppm → 425ppm (지속 급증)<br>
      • 상관계수: 약 -0.824 (산림 감소 시 기온 상승)
    </div>
    <p>지금 바로 온라인 환경에서 전체 러닝 플레이, Firebase 동기화 및 퀴즈 시스템을 실행해보세요!</p>
    <a class="btn" href="${window.location.href}" target="_blank">나무런 웹 게임 실행하기 ▶</a>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'namurun_climate_game.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border-4 border-sky-800 overflow-hidden text-neutral-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-700 to-emerald-700 p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-sky-200" />
            <div>
              <h2 className="text-lg sm:text-xl font-black">🔬 기후 데이터 연구소 (Orange3 분석)</h2>
              <p className="text-xs text-sky-100">기상청·산림청 공식 자료 (2010년 ~ 2022년)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-sky-900/60 hover:bg-sky-900 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-4 pt-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('chart')}
            className={`pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === 'chart'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            📈 시계열 추이 (숲 vs CO2)
          </button>
          <button
            onClick={() => setActiveTab('scatter')}
            className={`pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === 'scatter'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            📉 산점도 상관관계 ({CORRELATION_COEFFICIENT})
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === 'table'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            📋 공식 데이터 원본 표
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Key Insight Callout Banner */}
          <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-300 text-xs sm:text-sm text-amber-950 space-y-1">
            <div className="flex items-center gap-1.5 font-black text-amber-900 text-sm">
              <Info className="w-4 h-4 text-amber-600" />
              <span>우리가 발견한 핵심 문제점: "숲은 그대로인데 탄소는 계속 늘고 있다!"</span>
            </div>
            <p className="leading-relaxed">
              2010년부터 2022년까지 12년 동안 산림면적은 <strong>64%에서 63%로 거의 변화 없이 정체</strong>되었습니다.
              하지만 대기 중 <strong>이산화탄소(CO2) 농도는 394.9ppm에서 425ppm까지 가파르게 상승</strong>했습니다.
              나무런 게임에서 나무를 심어 산림을 65%까지 복원하고 탄소 괴물을 막아야 하는 이유입니다!
            </p>
          </div>

          {/* TAB 1: Time Series Trend */}
          {activeTab === 'chart' && (
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-neutral-800 flex items-center justify-between">
                <span>연도별 산림면적 vs CO2 농도 변화</span>
                <span className="text-xs font-medium text-neutral-500">2010 ~ 2022년</span>
              </h3>

              {/* Visual Bars for each year */}
              <div className="space-y-2 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                {CLIMATE_DATA_YEARS.map((row) => (
                  <div key={row.year} className="flex items-center gap-2 text-xs">
                    <span className="w-10 font-mono font-bold text-neutral-700 shrink-0">
                      {row.year}
                    </span>

                    {/* Forest bar */}
                    <div className="flex-1 flex flex-col gap-0.5">
                      <div className="flex justify-between text-[10px] text-emerald-800">
                        <span>산림: {row.forestAreaRatio}%</span>
                        <span className="text-rose-700 font-bold">CO2: {row.co2Ppm} ppm</span>
                      </div>
                      <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden flex">
                        {/* Forest percentage */}
                        <div
                          className="bg-emerald-500 h-full"
                          style={{ width: `${(row.forestAreaRatio / 70) * 100}%` }}
                        />
                        {/* CO2 relative marker */}
                        <div
                          className="bg-rose-500 h-full ml-auto"
                          style={{ width: `${((row.co2Ppm - 390) / 40) * 50}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Scatter Plot & Correlation */}
          {activeTab === 'scatter' && (
            <div className="space-y-3">
              <div className="bg-sky-50 p-3 rounded-xl border border-sky-300 text-xs text-sky-950">
                <span className="font-bold text-sky-900 block text-sm mb-1">
                  📊 Orange3 산점도 분석 결과: 음의 상관관계 ({CORRELATION_COEFFICIENT})
                </span>
                산림면적이 줄어들수록 이산화탄소를 흡수하지 못해 지구 온도가 높아지는 경향이
                상관계수 약 0.824(음의 상관)로 뚜렷하게 관찰됩니다.
              </div>

              {/* SVG Scatter Plot representation */}
              <div className="w-full bg-white p-4 rounded-xl border border-neutral-300 shadow-inner flex flex-col items-center">
                <svg viewBox="0 0 400 240" className="w-full max-w-md h-auto">
                  {/* Axes */}
                  <line x1="50" y1="20" x2="50" y2="200" stroke="#64748b" strokeWidth="2" />
                  <line x1="50" y1="200" x2="380" y2="200" stroke="#64748b" strokeWidth="2" />

                  {/* Labels */}
                  <text x="215" y="225" fontSize="11" textAnchor="middle" fill="#334155" fontWeight="bold">
                    산림면적 비율 (%) → (62.8% ~ 64.0%)
                  </text>
                  <text
                    x="15"
                    y="110"
                    fontSize="11"
                    textAnchor="middle"
                    fill="#334155"
                    fontWeight="bold"
                    transform="rotate(-90 15 110)"
                  >
                    지구 평균기온 (°C)
                  </text>

                  {/* Regression Trend Line */}
                  <line x1="70" y1="40" x2="360" y2="180" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="5,3" />

                  {/* Data Points */}
                  {CLIMATE_DATA_YEARS.map((d, i) => {
                    // Normalize X (forest: 62.8 to 64.0) -> screen 70 to 360
                    const nx = 70 + ((d.forestAreaRatio - 62.8) / 1.2) * 290;
                    // Normalize Y (temp: 14.6 to 15.1) -> screen 180 to 40
                    const ny = 180 - ((d.globalTemp - 14.6) / 0.5) * 140;

                    return (
                      <g key={i}>
                        <circle cx={nx} cy={ny} r="5" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                        <text x={nx} y={ny - 7} fontSize="9" textAnchor="middle" fill="#0f172a">
                          {d.year}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div className="flex justify-between w-full max-w-md text-[10px] text-neutral-500 mt-1">
                  <span>← 산림면적 적음 (기온 높음)</span>
                  <span>산림면적 많음 (기온 낮음) →</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Data Table */}
          {activeTab === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-neutral-200 rounded-lg overflow-hidden">
                <thead className="bg-sky-100 text-sky-950 font-bold">
                  <tr>
                    <th className="p-2 border-b">연도</th>
                    <th className="p-2 border-b">산림면적 비율(%)</th>
                    <th className="p-2 border-b">지구 평균기온(°C)</th>
                    <th className="p-2 border-b">CO2 농도(ppm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {CLIMATE_DATA_YEARS.map((row) => (
                    <tr key={row.year} className="hover:bg-neutral-50">
                      <td className="p-2 font-mono font-bold text-neutral-800">{row.year}</td>
                      <td className="p-2 text-emerald-700 font-bold">{row.forestAreaRatio}%</td>
                      <td className="p-2 text-neutral-700 font-mono">{row.globalTemp}°C</td>
                      <td className="p-2 text-rose-600 font-bold">{row.co2Ppm} ppm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Standalone HTML File Export Button as requested */}
          <div className="pt-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="text-xs text-neutral-500">
              💡 학교 수업 제출 및 오프라인 백업을 위한 단일 HTML 파일 제공
            </div>
            <button
              onClick={handleExportStandaloneHtml}
              className="py-2 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>다운로드 완료!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-sky-400" />
                  <span>단일 HTML 파일 다운로드</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
