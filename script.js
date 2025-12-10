// 因為無法直接使用 lucide-react，這裡我們用簡單的文字或 SVG 來替代圖示
const ArrowRight = () => '→';
const ArrowLeft = () => '←';
const Check = () => '✓';
const RefreshCcw = () => '↺';
const BarChart3 = () => '📊';
const FlaskConical = () => '🧪';
const AlertCircle = () => '⚠️';

// --- 元件：豌豆圖示 (Pea Icon) ---
// 根據表徵繪製 SVG
const PeaIcon = ({ type, color, size = "pea-icon", className = "" }) => {
  const isRound = type === 'round';
  const isYellow = color === 'yellow';
  
  const fillColor = isYellow ? '#FACC15' : '#4ADE80'; // yellow-400 : green-400
  const strokeColor = isYellow ? '#EAB308' : '#16A34A'; // yellow-600 : green-600

  return (
    <svg viewBox="0 0 100 100" className={`${size} ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      {isRound ? (
        // 圓滑種皮
        <circle cx="50" cy="50" r="40" fill={fillColor} stroke={strokeColor} strokeWidth="3" />
      ) : (
        // 皺縮種皮
        <path 
          d="M50 10 C 60 10, 65 20, 75 15 C 85 10, 90 30, 85 40 C 95 50, 90 60, 85 70 C 90 80, 80 90, 70 85 C 60 90, 50 85, 40 90 C 30 90, 20 80, 25 70 C 10 65, 15 50, 10 40 C 5 30, 20 20, 25 15 C 30 5, 40 10, 50 10 Z" 
          fill={fillColor} 
          stroke={strokeColor} 
          strokeWidth="3"
        />
      )}
      {/* 高光效果 */}
      <ellipse cx="35" cy="35" rx="10" ry="5" fill="white" fillOpacity="0.4" transform="rotate(-45 35 35)" />
    </svg>
  );
};

// --- 資料與邏輯輔助函式 ---

// 基因型與表徵的對應邏輯 (Y在前 R在後)
const getPhenotype = (genotype) => {
  const yPart = genotype.substring(0, 2);
  const rPart = genotype.substring(2, 4);

  const isYellow = yPart.includes('Y');
  const isRound = rPart.includes('R');

  return {
    type: isRound ? 'round' : 'wrinkled',
    color: isYellow ? 'yellow' : 'green',
    name: `${isRound ? '圓滑' : '皺縮'}${isYellow ? '黃' : '綠'}種皮`
  };
};

// 產生配子 (例如 YyRr -> YR, Yr, yR, yr)
const generateGametes = (genotype) => {
  const y1 = genotype[0];
  const y2 = genotype[1];
  const r1 = genotype[2];
  const r2 = genotype[3];
  
  const gametes = new Set([
    y1 + r1,
    y1 + r2,
    y2 + r1,
    y2 + r2
  ]);
  
  // 修改排序邏輯：
  // 為了呈現 YR, Yr, yR, yr 的順序
  return Array.from(gametes).sort(); 
};

// 親代選項資料
const PHENOTYPE_GROUPS = [
  {
    label: '圓滑黃種皮',
    type: 'round',
    color: 'yellow',
    genotypes: ['YYRR', 'YyRR', 'YYRr', 'YyRr']
  },
  {
    label: '皺縮黃種皮',
    type: 'wrinkled',
    color: 'yellow',
    genotypes: ['YYrr', 'Yyrr']
  },
  {
    label: '圓滑綠種皮',
    type: 'round',
    color: 'green',
    genotypes: ['yyRR', 'yyRr']
  },
  {
    label: '皺縮綠種皮',
    type: 'wrinkled',
    color: 'green',
    genotypes: ['yyrr']
  }
];

const GAMETE_OPTIONS = [
  'YR', 'Yr', 'yR', 'yr', // 正確的配子形式
  'Yy', 'Rr', 'YY', 'rr', // 錯誤的 (未分離)
  'Y', 'y', 'R', 'r'      // 錯誤的 (僅單一性狀)
];

function MendelianLab() {
  const { useState, useMemo } = React;

  const [step, setStep] = useState(1);
  const [parents, setParents] = useState({ p1: null, p2: null });
  const [selectedGametesP1, setSelectedGametesP1] = useState([]);
  const [selectedGametesP2, setSelectedGametesP2] = useState([]);
  const [gameteCheckResult, setGameteCheckResult] = useState(null);
  const [offspringCount, setOffspringCount] = useState(0);
  const [offspringStats, setOffspringStats] = useState({
    'round-yellow': 0,
    'wrinkled-yellow': 0,
    'round-green': 0,
    'wrinkled-green': 0
  });

  const theoreticalGametesP1 = useMemo(() => parents.p1 ? generateGametes(parents.p1) : [], [parents.p1]);
  const theoreticalGametesP2 = useMemo(() => parents.p2 ? generateGametes(parents.p2) : [], [parents.p2]);

  const handleSelectParent = (genotype) => {
    if (!parents.p1) {
      setParents({ ...parents, p1: genotype });
    } else if (!parents.p2) {
      setParents({ ...parents, p2: genotype });
    }
  };

  const removeParent = (pid) => {
    setParents({ ...parents, [pid]: null });
  };

  const resetParents = () => {
    setParents({ p1: null, p2: null });
    setStep(1);
    setGameteCheckResult(null);
    setSelectedGametesP1([]);
    setSelectedGametesP2([]);
    resetSimulation();
  };

  const handleNextToStep2 = () => {
    setSelectedGametesP1([]);
    setSelectedGametesP2([]);
    setGameteCheckResult(null);
    setStep(2);
  };

  const handleNextToStep3 = () => {
    resetSimulation();
    setStep(3);
  };

  const toggleGameteSelection = (gamete, parentKey) => {
    const currentList = parentKey === 'p1' ? selectedGametesP1 : selectedGametesP2;
    const setList = parentKey === 'p1' ? setSelectedGametesP1 : setSelectedGametesP2;
    
    if (currentList.includes(gamete)) {
      setList(currentList.filter(g => g !== gamete));
    } else {
      setList([...currentList, gamete]);
    }
  };

  const checkGametes = () => {
    const isP1Correct = theoreticalGametesP1.length === selectedGametesP1.length && 
                        theoreticalGametesP1.every(g => selectedGametesP1.includes(g));
    const isP2Correct = theoreticalGametesP2.length === selectedGametesP2.length && 
                        theoreticalGametesP2.every(g => selectedGametesP2.includes(g));
    
    if (isP1Correct && isP2Correct) {
      setGameteCheckResult('correct');
    } else {
      setGameteCheckResult('wrong');
    }
  };

  const generateOffspring = () => {
    const g1 = theoreticalGametesP1[Math.floor(Math.random() * theoreticalGametesP1.length)];
    const g2 = theoreticalGametesP2[Math.floor(Math.random() * theoreticalGametesP2.length)];
    const raw = g1 + g2; 
    const yAlleles = (raw.match(/Y|y/g) || []).sort().join('');
    const rAlleles = (raw.match(/R|r/g) || []).sort().join('');
    const fullGenotype = yAlleles + rAlleles; 
    return getPhenotype(fullGenotype);
  };

  const runSimulation = (count) => {
    let newStats = { ...offspringStats };
    for (let i = 0; i < count; i++) {
      const phenotype = generateOffspring();
      const key = `${phenotype.type}-${phenotype.color}`;
      newStats[key]++;
    }
    setOffspringStats(newStats);
    setOffspringCount(prev => prev + count);
  };

  const resetSimulation = () => {
    setOffspringCount(0);
    setOffspringStats({
      'round-yellow': 0,
      'wrinkled-yellow': 0,
      'round-green': 0,
      'wrinkled-green': 0
    });
  };

  const theoreticalRatios = useMemo(() => {
    if (!theoreticalGametesP1.length || !theoreticalGametesP2.length) return {};
    
    const totalCombinations = theoreticalGametesP1.length * theoreticalGametesP2.length;
    const counts = { 'round-yellow': 0, 'wrinkled-yellow': 0, 'round-green': 0, 'wrinkled-green': 0 };

    theoreticalGametesP1.forEach(g1 => {
      theoreticalGametesP2.forEach(g2 => {
        const raw = g1 + g2;
        const y = (raw.match(/Y|y/g) || []).sort().join('');
        const r = (raw.match(/R|r/g) || []).sort().join('');
        const pheno = getPhenotype(y + r);
        counts[`${pheno.type}-${pheno.color}`]++;
      });
    });

    return {
      'round-yellow': (counts['round-yellow'] / totalCombinations) * 100,
      'wrinkled-yellow': (counts['wrinkled-yellow'] / totalCombinations) * 100,
      'round-green': (counts['round-green'] / totalCombinations) * 100,
      'wrinkled-green': (counts['wrinkled-green'] / totalCombinations) * 100
    };
  }, [theoreticalGametesP1, theoreticalGametesP2]);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div>
          <h1><FlaskConical /> 孟德爾雙性狀遺傳實驗室</h1>
          <p>探索種皮顏色 (Y/y) 與形狀 (R/r) 的遺傳規律</p>
        </div>
        <button onClick={resetParents} className="reset-btn" title="重置實驗">
          <RefreshCcw />
        </button>
      </header>

      {/* Progress Bar */}
      <div className="progress-bar">
        {[1, 2, 3].map(s => (
          <div 
            key={s}
            className={`progress-step ${step === s ? 'active' : step > s ? 'completed' : ''}`}
          >
            步驟 {s}: {s === 1 ? '選擇親代' : s === 2 ? '配子組合' : '子代模擬'}
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="content-area">
        
        {/* STEP 1: 選擇親代 */}
        {step === 1 && (
          <div className="step-content">
            <div className="step-header">
              <h2>配置實驗親代</h2>
              <p>請從下方表格選擇兩個基因型卡片作為親代 (Parent 1 與 Parent 2)</p>
            </div>

            {/* 親代插槽區 */}
            <div className="parent-slots">
              <div className="parent-slot">
                  <div className="parent-slot-title">親代 1</div>
                  <div className={`parent-card ${parents.p1 ? 'selected' : ''}`}>
                    {parents.p1 ? (
                      <>
                        <PeaIcon {...getPhenotype(parents.p1)} size="pea-icon large" />
                        <div className="genotype">{parents.p1}</div>
                        <div className="phenotype-name">{getPhenotype(parents.p1).name}</div>
                        <button onClick={() => removeParent('p1')} className="remove-btn">移除</button>
                      </>
                    ) : (
                      <div className="text-slate-400 text-center text-sm">點擊下方卡片</div>
                    )}
                  </div>
              </div>

              <div className="cross-symbol">×</div>

              <div className="parent-slot">
                  <div className="parent-slot-title">親代 2</div>
                  <div className={`parent-card ${parents.p2 ? 'selected' : ''}`}>
                    {parents.p2 ? (
                      <>
                        <PeaIcon {...getPhenotype(parents.p2)} size="pea-icon large" />
                        <div className="genotype">{parents.p2}</div>
                        <div className="phenotype-name">{getPhenotype(parents.p2).name}</div>
                        <button onClick={() => removeParent('p2')} className="remove-btn">移除</button>
                      </>
                    ) : (
                      <div className="text-slate-400 text-center text-sm">點擊下方卡片</div>
                    )}
                  </div>
              </div>
            </div>

            {/* 選擇區域 */}
            <div className="overflow-x-auto">
              <table className="selection-table">
                <thead>
                  <tr>
                    <th>表徵 (性狀)</th>
                    <th>可能的基因型 (點擊選擇)</th>
                  </tr>
                </thead>
                <tbody>
                  {PHENOTYPE_GROUPS.map((group) => (
                    <tr key={group.label}>
                      <td>
                        <div className="phenotype-cell">
                          <PeaIcon type={group.type} color={group.color} size="pea-icon" />
                          <span>{group.label}</span>
                        </div>
                      </td>
                      <td>
                        <div className="genotype-buttons">
                          {group.genotypes.map((geno) => {
                            const isP1 = parents.p1 === geno;
                            const isP2 = parents.p2 === geno;
                            const isFull = parents.p1 && parents.p2;
                            
                            return (
                              <button
                                key={geno}
                                onClick={() => handleSelectParent(geno)}
                                disabled={isFull && !isP1 && !isP2}
                                className={`genotype-btn ${(isP1 || isP2) ? 'selected' : ''}`}
                              >
                                {geno}
                                <div className="parent-tag">
                                  {isP1 && <span className="p1-tag">P1</span>}
                                  {isP2 && <span className="p2-tag">P2</span>}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="next-btn-container">
              <button
                disabled={!parents.p1 || !parents.p2}
                onClick={handleNextToStep2}
                className="primary-btn"
              >
                下一步：確認配子 <ArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: 配子檢測 */}
        {step === 2 && (
          <div className="step-content">
            <div className="step-header">
              <h2>配子組合測驗</h2>
              <p>依據孟德爾分離律與自由配合律，請選出親代可能產生的所有配子。</p>
            </div>

            <div className="gamete-test-grid">
              <div className={`gamete-panel p1 ${gameteCheckResult === 'wrong' ? 'wrong' : ''}`}>
                <div className="gamete-panel-header p1">
                  親代 1 ({parents.p1})
                  <PeaIcon {...getPhenotype(parents.p1)} size="pea-icon small" />
                </div>
                <div className="gamete-options-grid">
                  {GAMETE_OPTIONS.map(g => (
                    <button
                      key={`p1-${g}`}
                      onClick={() => toggleGameteSelection(g, 'p1')}
                      disabled={gameteCheckResult === 'correct'}
                      className={`gamete-option-btn p1 ${selectedGametesP1.includes(g) ? 'selected' : ''}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`gamete-panel p2 ${gameteCheckResult === 'wrong' ? 'wrong' : ''}`}>
                <div className="gamete-panel-header p2">
                  親代 2 ({parents.p2})
                  <PeaIcon {...getPhenotype(parents.p2)} size="pea-icon small" />
                </div>
                <div className="gamete-options-grid">
                  {GAMETE_OPTIONS.map(g => (
                    <button
                      key={`p2-${g}`}
                      onClick={() => toggleGameteSelection(g, 'p2')}
                      disabled={gameteCheckResult === 'correct'}
                      className={`gamete-option-btn p2 ${selectedGametesP2.includes(g) ? 'selected' : ''}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="step2-actions">
              {gameteCheckResult === 'wrong' && (
                <div className="error-message">
                  <AlertCircle />
                  <span>答案不正確，請再檢查一次！(提示：基因需分離且自由組合)</span>
                </div>
              )}
              
              {gameteCheckResult !== 'correct' ? (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setStep(1)} className="secondary-btn">
                      <ArrowLeft /> 上一步
                  </button>
                  <button onClick={checkGametes} className="check-btn">
                    檢查答案
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <div className="correct-message">
                    <Check /> 回答正確！
                  </div>
                  
                  <div className="punnett-square-container">
                    <h4>產生的棋盤方格 (Punnett Square)</h4>
                    <div className="overflow-x-auto">
                      <table className="punnett-table">
                        <thead>
                          <tr>
                            <th className="corner-header">P1 \ P2</th>
                            {theoreticalGametesP2.map((g, i) => (
                              <th key={i} className="p2-header">{g}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {theoreticalGametesP1.map((g1, i) => (
                            <tr key={i}>
                              <th className="p1-header">{g1}</th>
                              {theoreticalGametesP2.map((g2, j) => {
                                const raw = g1 + g2;
                                const y = (raw.match(/Y|y/g) || []).sort().join('');
                                const r = (raw.match(/R|r/g) || []).sort().join('');
                                const display = y + r;
                                const pheno = getPhenotype(display);

                                return (
                                  <td key={j} className="offspring-cell">
                                    <div>
                                      <PeaIcon {...pheno} size="pea-icon medium" />
                                      <span>{display}</span>
                                    </div>
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                      <button onClick={() => setStep(1)} className="secondary-btn">
                          <ArrowLeft /> 上一步
                      </button>
                      <button onClick={handleNextToStep3} className="primary-btn">
                        進入子代模擬 <ArrowRight />
                      </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: 子代模擬 */}
        {step === 3 && (
          <div className="step-content">
            <div className="step3-header">
              <div>
                <h2>子代模擬與數據分析</h2>
                <p>觀察累積子代數量增加時，實際比例如何趨近於理論比例。</p>
              </div>
              <div className="step3-header-controls">
                  <button onClick={() => setStep(2)} className="secondary-btn" style={{padding: '0.5rem 1rem'}}>
                      <ArrowLeft /> 上一步
                  </button>
                  <div className="total-offspring-display">
                      目前子代總數: <span>{offspringCount}</span>
                  </div>
              </div>
            </div>

            <div className="simulation-grid">
              <div className="simulation-controls-container">
                <div className="control-panel">
                  <h3><RefreshCcw /> 生成控制</h3>
                  <div className="generation-buttons">
                    <button onClick={() => runSimulation(1)}>+1 株</button>
                    <button onClick={() => runSimulation(10)}>+10 株</button>
                    <button onClick={() => runSimulation(100)} className="btn-100">+100 株</button>
                    <button onClick={() => runSimulation(1000)} className="btn-1000">+1000 株</button>
                  </div>
                  <button onClick={resetSimulation} className="reset-data-btn">
                    重置數據
                  </button>
                </div>

                <div className="info-panel">
                  <strong>觀察重點：</strong>
                  <ul>
                    <li>數量少時，實際比例波動大。</li>
                    <li>數量多時 (例如 {'>'} 500)，比例會非常接近理論值。</li>
                    <li>{parents.p1} × {parents.p2} 的理論比為：</li>
                    <div className="theory-ratios">
                      {Object.entries(theoreticalRatios).map(([key, val]) => (
                         val > 0 && <div key={key}>{key}: {val.toFixed(1)}%</div>
                      ))}
                    </div>
                  </ul>
                </div>
              </div>

              <div className="simulation-chart-container">
                <h3><BarChart3 /> 表徵比例分佈圖</h3>
                
                <div className="chart">
                  <div className="chart-grid-lines">
                    <div /><div /><div /><div /><div />
                  </div>

                  {[
                    { key: 'round-yellow', label: '圓黃' },
                    { key: 'wrinkled-yellow', label: '皺黃' },
                    { key: 'round-green', label: '圓綠' },
                    { key: 'wrinkled-green', label: '皺綠' },
                  ].map((type) => {
                    const count = offspringStats[type.key];
                    const percentage = offspringCount > 0 ? (count / offspringCount) * 100 : 0;
                    const theory = theoreticalRatios[type.key] || 0;
                    
                    return (
                      <div key={type.key} className="bar-wrapper">
                        <div 
                          className={`bar ${type.key}`}
                          style={{ height: `${percentage}%`, minHeight: count > 0 ? '4px' : '0' }}
                        >
                        </div>

                        <div className="bar-label" style={{ bottom: `${percentage}%` }}>
                          <div className="percentage">{percentage.toFixed(1)}%</div>
                          <div className="count">({count})</div>
                          <div className="theory-label">理論: {theory.toFixed(1)}%</div>
                        </div>

                        <div 
                          className="theory-line"
                          style={{ height: `${theory}%` }}
                        ></div>

                        <div className="x-axis-label">
                           <PeaIcon 
                              type={type.key.includes('round') ? 'round' : 'wrinkled'} 
                              color={type.key.includes('yellow') ? 'yellow' : 'green'} 
                              size="pea-icon medium"
                            />
                           <div className="label-text">
                             {type.label}
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
       <footer className="app-footer">
        孟德爾遺傳學互動教材 v1.4
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<MendelianLab />);
