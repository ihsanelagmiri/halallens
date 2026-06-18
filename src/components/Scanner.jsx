import React, { useState, useRef, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { translateDbText } from '../utils/dbTranslation.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { getHistory, addHistory } from '../utils/storage.js';
import { createWorker } from 'tesseract.js';
import ArchiveOverlay from './ArchiveOverlay.jsx';

// Multilingual ingredient database (aliases cover EN + KO)
const MULTILINGUAL_DATABASE = [
  { name: 'pork', aliases: ['pork','pig','돼지','돼지고기','돈육','pork extract','돼지추출물','돼지 추출물','포크','돈골'], status: 'non-halal', source: 'Animal (Pork)', reason: 'Contains pork', alt: 'Vegetable shortening, plant oil, beef fat (halal-certified)' },
  { name: 'pork gelatin', aliases: ['pork gelatin','pork gelatine','돼지 젤라틴','돈피 젤라틴','돼지피 젤라틴','돼지젤라틴'], status: 'non-halal', source: 'Animal (Pork derivative)', reason: 'Contains pork', alt: 'Agar-agar, carrageenan, pectin, halal beef gelatin' },
  { name: 'alcohol', aliases: ['alcohol','ethanol','ethyl alcohol','알코올','주정','에탄올','주류'], status: 'non-halal', source: 'Chemical / Intoxicant', reason: 'Pure ethyl alcohol or intoxicating liquors are prohibited in food preparation.', alt: 'Synthetic/non-alcoholic food extracts' },
  { name: 'wine', aliases: ['wine','와인','포도주'], status: 'non-halal', source: 'Beverage (Alcoholic)', reason: 'Fermented grape beverage containing intoxicants.', alt: 'Grape juice, non-alcoholic wine alternatives' },
  { name: 'beer', aliases: ['beer','맥주'], status: 'non-halal', source: 'Beverage (Alcoholic)', reason: 'Fermented grain beverage containing intoxicants.', alt: 'Non-alcoholic malt beverages' },
  { name: 'lard', aliases: ['lard','돈지','라드','pork fat','돼지지방','돼지기름'], status: 'non-halal', source: 'Animal (Pork fat)', reason: 'Contains pork', alt: 'Vegetable shortening, plant oils, butter' },
  { name: 'bacon', aliases: ['bacon','베이컨'], status: 'non-halal', source: 'Animal (Pork)', reason: 'Contains pork', alt: 'Beef bacon, turkey bacon' },
  { name: 'ham', aliases: ['ham','햄'], status: 'non-halal', source: 'Animal (Pork)', reason: 'Contains pork', alt: 'Beef salami, turkey ham' },
  { name: 'E120 Carmine', aliases: ['e120','carmine','cochineal','carminic acid','카민','코치닐','코치닐추출색소'], status: 'non-halal', source: 'Insect (Cochineal beetle)', reason: 'Red dye extracted from crushed insects; prohibited under major halal food standards.', alt: 'Beetroot red (E162), lycopene, or beta-carotene' },
  { name: 'beef extract', aliases: ['beef extract','beef concentrate','소고기 추출물','쇠고기 추출물','우육 추출물','소고기분말'], status: 'uncertain', source: 'Animal (Bovine)', reason: 'Sourced from cows; uncertain unless verified halal slaughtering methods are certified.', alt: 'Halal-certified beef extract, yeast extract' },
  { name: 'chicken extract', aliases: ['chicken extract','chicken concentrate','닭고기 추출물','계육 추출물','닭고기분말'], status: 'uncertain', source: 'Animal (Poultry)', reason: 'Sourced from poultry; uncertain unless verified halal slaughtering methods are certified.', alt: 'Halal-certified chicken seasoning, yeast extract' },
  { name: 'animal fat', aliases: ['animal fat','동물성 유지','동물성 지방','우지','소지방'], status: 'uncertain', source: 'Animal (Unspecified)', reason: 'Unspecified animal lipids. High risk of containing pork fat or un-slaughtered animal fats.', alt: 'Vegetable oils, olive oil, palm fat' },
  { name: 'gelatin', aliases: ['gelatin','gelatine','젤라틴'], status: 'uncertain', source: 'Animal (Unspecified bovine/ovine/porcine)', reason: 'Unspecified animal gelling agent. Uncertain unless bovine/fish source is certified halal.', alt: 'Agar-agar, plant pectin, carrageenan' },
  { name: 'E471 Emulsifier', aliases: ['e471','mono- and diglycerides','mono- & diglycerides','mono and diglycerides','유화제','mono- and di-glycerides of fatty acids'], status: 'uncertain', source: 'Animal / Plant lipids', reason: 'Glyceride emulsifier. High chance of being sourced from animal tallow unless specified vegetable origin.', alt: 'Plant-derived E471, soy lecithin (E322)' },
  { name: 'E472a-f Esters', aliases: ['e472','e472a','e472e','e472f','fatty acid esters','글리세린지방산에스테르'], status: 'uncertain', source: 'Animal / Plant derivatives', reason: 'Derived from fatty acids; uncertain unless certified plant-derived.', alt: 'Soy lecithin, plant-origin emulsifiers' },
  { name: 'E422 Glycerol', aliases: ['e422','glycerol','glycerin','glycerine','글리세린'], status: 'uncertain', source: 'Animal / Plant lipids', reason: 'Can be sourced from animal fats as a soap byproduct or palm/coconut oil.', alt: 'Vegetable glycerin' },
  { name: 'E904 Shellac', aliases: ['e904','shellac','쉘락','셸락'], status: 'uncertain', source: 'Insect secretion', reason: 'Exudate from lac bugs. Subject to scholastic differences; treated as uncertain.', alt: 'Carnauba wax, plant glazes' },
  { name: 'E920 L-Cysteine', aliases: ['e920','l-cysteine','l cysteine','cysteine','엘-시스테인','시스테인'], status: 'uncertain', source: 'Animal / Human hair / Synthetic', reason: 'Dough conditioner historically extracted from duck feathers or human hair. Halal only if synthetic.', alt: 'Enzyme-processed dough conditioners, synthetic L-cysteine' },
  { name: 'E570 Stearic Acid', aliases: ['e570','stearic acid','스테아르산'], status: 'uncertain', source: 'Animal / Plant fat', reason: 'Saturated fatty acid extracted from tallow or vegetable butter.', alt: 'Cocoa butter, palm stearin' },
  { name: 'whey', aliases: ['whey','whey powder','유청','유청분말','유청단백질'], status: 'uncertain', source: 'Dairy (Animal rennet helper)', reason: 'Milk whey separated using enzymes; uncertain if bovine rennet was non-halal.', alt: 'Microbial whey derivatives' },
  { name: 'rennet', aliases: ['rennet','pepsin','레넷','펩신'], status: 'uncertain', source: 'Animal stomach enzymes', reason: 'Coagulating enzyme harvested from calf stomachs; uncertain unless bovine is certified.', alt: 'Microbial enzymes, plant-derived rennet' },
  { name: 'E322 Lecithin', aliases: ['e322','lecithin','soy lecithin','sunflower lecithin','레시틴','대두레시틴','대두 레시틴'], status: 'halal', source: 'Plant (Soybean / Sunflower)', reason: 'Plant-derived phospholipid emulsifier. Safe and halal.', alt: null },
  { name: 'E202 Potassium Sorbate', aliases: ['e202','potassium sorbate','소르빈산칼륨','소브산칼륨'], status: 'halal', source: 'Synthetic', reason: 'Synthetic potassium salt used as an organic food preservative. Halal.', alt: null },
  { name: 'E330 Citric Acid', aliases: ['e330','citric acid','구연산'], status: 'halal', source: 'Plant (Citrus fruits)', reason: 'Natural citrus acid preservative and flavor. 100% Halal.', alt: null },
  { name: 'E211 Sodium Benzoate', aliases: ['e211','sodium benzoate','안식향산나트륨'], status: 'halal', source: 'Synthetic', reason: 'Chemical preservative commonly found in juices and soft drinks. Halal.', alt: null },
  { name: 'E150 Caramel Color', aliases: ['e150','caramel color','카라멜색소','캐러멜색소'], status: 'halal', source: 'Plant / Sugar caramelization', reason: 'Brown coloring agent derived from heated carbohydrates. Halal.', alt: null },
  { name: 'E407 Carrageenan', aliases: ['e407','carrageenan','카라기난'], status: 'halal', source: 'Plant (Red seaweed)', reason: 'Natural polysaccharide thickener derived from seaweeds. Halal.', alt: null },
  { name: 'E415 Xanthan Gum', aliases: ['e415','xanthan gum','잔탄검'], status: 'halal', source: 'Microbial fermentation', reason: 'Polysaccharide gum fermented from vegetable starches. Halal.', alt: null },
  { name: 'E621 MSG', aliases: ['e621','msg','monosodium glutamate','글루타민산나트륨','L-글루타민산나트륨'], status: 'halal', source: 'Plant fermentation', reason: 'Sodium salt of glutamic acid made from sugar beet fermentation. Halal.', alt: null },
  { name: 'wheat flour', aliases: ['wheat flour','flour','소맥분','밀가루','밀'], status: 'halal', source: 'Plant (Wheat)', reason: 'Basic grain product. Halal-compliant.', alt: null },
  { name: 'water', aliases: ['water','purified water','pure water','물','정제수'], status: 'halal', source: 'Mineral / Water supply', reason: 'Pure base fluid. Halal-compliant.', alt: null },
  { name: 'sugar', aliases: ['sugar','white sugar','cane sugar','설탕','백설탕','액상과당'], status: 'halal', source: 'Plant (Sugar cane / Sugar beet)', reason: 'Simple carbohydrate sweetener. Halal-compliant.', alt: null },
  { name: 'salt', aliases: ['salt','refined salt','소금','정제염','식염'], status: 'halal', source: 'Mineral', reason: 'Basic mineral seasoning. Halal.', alt: null },
  { name: 'yeast', aliases: ['yeast','bakers yeast','이스트','효모'], status: 'halal', source: 'Microbiological (Fungi)', reason: 'Leavening fungus agent. Halal.', alt: null },
  { name: 'pectin', aliases: ['pectin','펙틴'], status: 'halal', source: 'Plant (Fruit cells)', reason: 'Fruit-derived setting agent. Halal.', alt: null },
  { name: 'vegetable oil', aliases: ['vegetable oil','palm oil','soybean oil','corn oil','식물성 유지','식물성유지','팜유','대두유','옥수수유'], status: 'halal', source: 'Plant extracts', reason: 'Pure plant fats. Halal.', alt: null },
  { name: 'starch', aliases: ['starch','corn starch','potato starch','전분','녹말'], status: 'halal', source: 'Plant (Corn/Potato)', reason: 'Plant storage carbohydrate. Halal.', alt: null },
];

const MOCK_LABELS = [
  { id: 'halal-label', name: 'Wheat Crackers / 통밀 크래커 (Halal)', ingredients: '소맥분, 정제수, 백설탕, 식물성유지, 소금, E322 대두레시틴, E202, 펙틴' },
  { id: 'haram-label', name: 'Strawberry Gummy / 딸기 젤리 (Non-Halal)', ingredients: '정제수, 백설탕, 돼지 젤라틴, 에탄올, 돈육, 카민색소 E120' },
  { id: 'mashbooh-label', name: 'Savory Stew / 사골 스튜 (Uncertain)', ingredients: '소맥분, 정제수, 식물성유지, 젤라틴, 소고기 추출물, L-글루타민산나트륨, 유화제 E471' },
];

const IGNORED_KEYWORDS = ['전화', '고객센터', '제조', '보관', '신고', '국번', '번호', '주소', 'www', 'http', '유통기한', '품목보고번호', '반품', '교환', '1399'];
const INGREDIENT_WHITELIST = ['우유', '대두', '난류', '밀', '돼지고기', '유청', '단백', '분말', '복숭아', '토마토', '오징어', 'whey', 'protein', 'soy', 'milk', 'egg', 'pork'];
const KOREAN_MAPPING = {
  '대두': { eng: 'soy', status: 'halal' },
  '우유': { eng: 'milk', status: 'halal' },
  '유청단백분말': { eng: 'whey protein powder', status: 'uncertain' },
  '돼지고기': { eng: 'pork', status: 'non-halal' },
  '복숭아': { eng: 'peach', status: 'halal' },
  '토마토': { eng: 'tomato', status: 'halal' },
  '오징어': { eng: 'squid', status: 'halal' },
  '난류': { eng: 'egg', status: 'halal' }
};

function scoreAndFilterLines(rawText) {
  const lines = rawText.split(/[\n\r]+/);
  let passedLines = [];

  lines.forEach(line => {
    let score = 0;
    const lineLower = line.toLowerCase();
    const noSpaceLine = lineLower.replace(/\s+/g, '');

    if (IGNORED_KEYWORDS.some(kw => lineLower.includes(kw) || noSpaceLine.includes(kw))) {
      score -= 2;
    }
    if (/\d{5,}/.test(noSpaceLine) || /\d{2,3}[-\s]?\d{3,4}[-\s]?\d{4}/.test(line)) {
      score -= 2;
    }

    if (INGREDIENT_WHITELIST.some(kw => lineLower.includes(kw) || noSpaceLine.includes(kw))) {
      score += 2;
    }

    if (line.includes(',') || line.includes('%')) {
      score += 1;
    }

    if (score > 0) {
      passedLines.push(line);
    }
  });

  return passedLines.join('\n');
}

function analyzeIngredients(rawText) {
  const focusedText = scoreAndFilterLines(rawText);

  const cleanItems = focusedText
    .split(/[,;()\[\]\n\r\t]+/)
    .map(item => item.replace(/\.$/, '').trim())
    .filter(item => item.length > 1)
    .filter(item => {
      const itemNoSpaces = item.replace(/\s+/g, '');
      // 1. Ignore lines that are mostly numbers or symbols
      const alphaKoreanChars = item.replace(/[^a-zA-Z가-힣]/g, '');
      if (alphaKoreanChars.length < 2) return false;
      
      // 2. Ignore non-ingredient metadata (checking both original and spaceless)
      if (IGNORED_KEYWORDS.some(kw => item.includes(kw) || itemNoSpaces.includes(kw))) return false;

      // 3. Ignore phone numbers and long numeric strings
      if (/\d{5,}/.test(itemNoSpaces)) return false; // 5 or more digits in a row
      if (/\d{2,3}[-\s]?\d{3,4}[-\s]?\d{4}/.test(item)) return false; // phone number pattern
      
      return true;
    });

  let countHalal = 0, countNonHalal = 0, countUncertain = 0;
  let itemsReport = [], recommendations = [];

  cleanItems.forEach(item => {
    let itemLower = item.toLowerCase().trim();
    // Normalized text: remove spaces between Korean chars, remove punctuation
    let itemNormalized = itemLower.replace(/\s+/g, '').replace(/[^\w가-힣]/g, '');
    
    let status = 'uncertain';
    let origin = null;
    let desc = null;
    let alt = null;
    let matched = null;

    // 3. Korean normalization & direct keyword overrides
    let mappedToEnglish = null;
    for (const [ko, data] of Object.entries(KOREAN_MAPPING)) {
      if (itemLower.includes(ko) || itemNormalized.includes(ko)) {
        mappedToEnglish = data.eng;
        status = data.status;
        if (status === 'halal') desc = 'Natural plant/animal product (Halal)';
        if (status === 'non-halal') desc = 'Explicitly prohibited (Pork)';
        if (status === 'uncertain') desc = 'Requires further verification';
        break;
      }
    }

    if (mappedToEnglish) {
      item = mappedToEnglish;
    } else {
      // 4. Normal multilingual DB search
      const itemLowerNoSpace = itemLower.replace(/\s+/g, '');
      for (const entry of MULTILINGUAL_DATABASE) {
        if (entry.aliases.some(a => a.toLowerCase().replace(/\s+/g,'') === itemLowerNoSpace)) { matched = entry; break; }
      }
      if (!matched) {
        for (const entry of MULTILINGUAL_DATABASE) {
          if (entry.aliases.some(a => { const al = a.toLowerCase().trim(); return al.length > 2 && itemLower.includes(al); })) { matched = entry; break; }
        }
      }

      if (matched) {
        status = matched.status;
        origin = matched.source;
        desc = matched.reason;
        alt = matched.alt;
      }
    }

    if (status === 'halal') countHalal++;
    if (status === 'non-halal') countNonHalal++;
    if (status === 'uncertain') countUncertain++;

    itemsReport.push({ name: item, status, origin, desc });
    if (alt) recommendations.push({ original: item, replacement: alt });
  });

  return { itemsReport, recommendations, countHalal, countNonHalal, countUncertain };
}

export default function Scanner() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('defaultScannerMode') || 'manual';
  });
  const [text, setText] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0); // OCR progress percentage
  const [mockIndex, setMockIndex] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);
  const resultsPanelRef = useRef(null);
  const uploadedFileRef = useRef(null);
  const detailedExplanations = localStorage.getItem('detailedExplanations') !== 'false';
  // Worker reference for Tesseract OCR
  const workerRef = useRef(null);
  // Initialize Tesseract worker on mount (v5 API)
  useEffect(() => {
    let cancelled = false;
    const initWorker = async () => {
      try {
        // tesseract.js v5: createWorker(langs, oem, options)
        // Worker comes pre-loaded with language data — no separate load/initialize calls needed
        const worker = await createWorker('eng+kor', 1, {
          logger: m => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          }
        });
        if (!cancelled) {
          workerRef.current = worker;
        } else {
          worker.terminate();
        }
      } catch (err) {
        console.error('Failed to initialize Tesseract worker:', err);
      }
    };
    initWorker();
    return () => {
      cancelled = true;
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const { currentUser } = useContext(AuthContext);
  const [confirmationMsg, setConfirmationMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');
  const [archiveMatch, setArchiveMatch] = useState(null);
  const [pendingText, setPendingText] = useState(null);
  const [pendingImage, setPendingImage] = useState(null);

  const EXAMPLE_CHIPS = [
    { label: t('scanner.exampleA'), text: '소맥분, 정제수, 백설탕, 식물성유지, 소금, E322 대두레시틴, E202, 펙틴' },
    { label: t('scanner.exampleB'), text: '정제수, 백설탕, 돼지 젤라틴, 에탄올, 돈육, 카민색소 E120' },
    { label: t('scanner.exampleC'), text: '소맥분, 정제수, 식물성유지, 젤라틴, 소고기 추출물, L-글루타민산나트륨, 유화제 E471' },
    { label: t('scanner.exampleD'), text: 'Wheat flour, water, pig gelatin, lard, E120, whey, unknown_additive' },
  ];
  // Ref for hidden camera input
  const cameraInputRef = useRef(null);
  const checkArchive = (ingredientsStr) => {
    if (!currentUser) return false;
    console.log(`[Scanner][Archive] Checking for duplicate scan. User: ${currentUser.email}`);
    const history = getHistory(currentUser.email);
    // ingredients is stored as string[] — join to compare with raw OCR text
    const match = history.find(h => Array.isArray(h.ingredients)
      ? h.ingredients.join(', ') === ingredientsStr
      : h.ingredients === ingredientsStr
    );
    if (match) {
      console.log(`[Scanner][Archive] Duplicate found. Entry ID: ${match.id}`);
      setArchiveMatch(match);
      return true;
    }
    return false;
  };

  const processAnalysis = (rawText, imageUrl = null, forceRescan = false) => {
    if (!forceRescan && checkArchive(rawText)) {
      setPendingText(rawText);
      setPendingImage(imageUrl);
      return;
    }

    // Clear any previous messages before starting a new scan
    setConfirmationMsg('');
    setSaveErrorMsg('');
    setLoading(true);
    setLoadingMsg(t('scanner.ocrScanning'));
    setTimeout(() => setLoadingMsg(t('scanner.extractingCodes')), 800);
    setTimeout(() => setLoadingMsg(t('scanner.crossReferencing')), 1800);
    setTimeout(() => {
      const result = analyzeIngredients(rawText);
      setResults(result);
      setLoading(false);

      if (currentUser) {
        const v = result.countNonHalal > 0 ? 'Non-Halal' : (result.countUncertain > 0 ? 'Uncertain' : 'Halal');
        const summaryText = `Halal: ${result.countHalal}, Non-Halal: ${result.countNonHalal}, Uncertain: ${result.countUncertain}.`;
        const timestampStr = new Date().toISOString();

        // Read from ref — not state — to get the latest uploaded image even
        // if the React state update hasn't propagated inside this setTimeout yet.
        const thumbnailToSave = uploadedFileRef.current
          || imageUrl
          || 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=150&q=80';

        const entryToSave = {
          id: timestampStr,
          userId: currentUser.email,
          productName: 'Scanned Product',
          thumbnail: thumbnailToSave,
          ocrText: rawText,
          // Full itemsReport for HistoryDetail rendering
          itemsReport: result.itemsReport,
          recommendations: result.recommendations,
          // Flat arrays for easy filtering
          ingredients: result.itemsReport.map(item => item.name),
          halalIngredients: result.itemsReport.filter(i => i.status === 'halal').map(i => i.name),
          nonHalalIngredients: result.itemsReport.filter(i => i.status === 'non-halal').map(i => i.name),
          uncertainIngredients: result.itemsReport.filter(i => i.status === 'uncertain').map(i => i.name),
          flagged: result.itemsReport.filter(item => item.status !== 'halal').map(item => ({ name: item.name, status: item.status })),
          verdict: v,
          summary: summaryText,
          timestamp: timestampStr,
          date: timestampStr,
          counts: { halal: result.countHalal, nonHalal: result.countNonHalal, uncertain: result.countUncertain }
        };

        console.log(`[History] Save started. User: ${currentUser.email}, Timestamp: ${timestampStr}, Verdict: ${v}`);

        try {
          addHistory(entryToSave, currentUser.email);

          // Verify the save actually persisted
          const savedHistory = getHistory(currentUser.email);
          const savedItem = savedHistory.find(h => h.timestamp === timestampStr);

          if (savedItem) {
            console.log(`[History] Save SUCCESS. User: ${currentUser.email}, ID: ${timestampStr}`);
            setConfirmationMsg('✓ Scan saved to history.');
            setTimeout(() => setConfirmationMsg(''), 5000);
          } else {
            console.error(`[History] Save FAILURE: entry not found after write. User: ${currentUser.email}`);
            setSaveErrorMsg('⚠ Scan could not be saved. Storage may be full.');
            setTimeout(() => setSaveErrorMsg(''), 7000);
          }
        } catch (err) {
          console.error(`[History] Save ERROR: ${err.message}`, err);
          setSaveErrorMsg(`⚠ Save failed: ${err.message}`);
          setTimeout(() => setSaveErrorMsg(''), 7000);
        }

      } else {
        console.log('[History] Scan NOT saved — no logged-in user.');
      }

      setTimeout(() => {
        resultsPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }, 2600);
  };

  const runAnalysis = (rawText) => {
    if (!rawText.trim()) return;
    processAnalysis(rawText);
  };

  const performOcr = async (dataUrl) => {
    if (!workerRef.current) {
      console.error('Tesseract worker not initialized');
      return;
    }
    setLoading(true);
    setLoadingMsg(t('scanner.ocrScanning') || 'Processing OCR...');
    setOcrProgress(0);
    try {
      const { data: { text } } = await workerRef.current.recognize(dataUrl);
      const extracted = text.trim();
      if (!extracted) {
        alert(t('scanner.emptyOcrResult') || 'OCR returned no text.');
        setLoading(false);
      } else {
        processAnalysis(extracted, dataUrl);
      }
    } catch (err) {
      console.error('OCR error:', err);
      alert(t('scanner.ocrError') || 'Failed to process image.');
      setLoading(false);
    } finally {
      setOcrProgress(0);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        alert(t('ocrErrorInvalidImage') || 'Image too large (max 5 MB).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        setUploadedFile(dataUrl);
        uploadedFileRef.current = dataUrl;
        performOcr(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        setUploadedFile(dataUrl);
        uploadedFileRef.current = dataUrl;
        performOcr(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedFile(ev.target.result);
        uploadedFileRef.current = ev.target.result;
        performOcr(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMockCapture = () => {
    const currentMock = MOCK_LABELS[mockIndex];
    processAnalysis(currentMock.ingredients);
  };
  const handleRealCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const verdictLabel = (result) => {
    if (result.countNonHalal > 0) return { text: t('verdict.prohibited'), cls: 'non-halal' };
    if (result.countUncertain > 0) return { text: t('verdict.uncertain'), cls: 'uncertain' };
    return { text: t('verdict.compliant'), cls: 'halal' };
  };

  const handleReset = () => {
    setResults(null);
    setText('');
    setUploadedFile(null);
    setLoading(false);
    setLoadingMsg('');
    setConfirmationMsg('');
    setSaveErrorMsg('');
    setArchiveMatch(null);
    setPendingText(null);
    setPendingImage(null);
    uploadedFileRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="content-wrapper">
      <div className="scanner-grid">
        <div className="scanner-panel">
          <div className="scanner-header">
            <h2>{t('scanner.title')}</h2>
            <p>{t('scanner.subtitle')}</p>
          </div>

          <div className="scanner-tabs">
            {['manual','upload','camera'].map(tab => (
              <button
                key={tab}
                className={`tab-btn${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
                id={`tab-btn-${tab}`}
              >
                {tab === 'manual' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>}
                {tab === 'upload' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>}
                {tab === 'camera' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /></svg>}
                {tab === 'manual' ? t('scanner.tabText') : tab === 'upload' ? t('scanner.tabUpload') : t('scanner.tabCamera')}
              </button>
            ))}
          </div>

          {activeTab === 'manual' && (
            <div className="tab-content-panel active">
              <div className="text-area-wrapper">
                <textarea
                  id="ingredient-textarea"
                  placeholder={t('scanner.textPlaceholder')}
                  value={text}
                  onChange={e => setText(e.target.value)}
                />
                <div className="example-chips">
                  {EXAMPLE_CHIPS.map((chip, i) => (
                    <span key={i} className="example-chip" onClick={() => setText(chip.text)}>{chip.label}</span>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" id="btn-analyze-text" style={{ width:'100%', marginTop:'20px' }} onClick={() => runAnalysis(text)}>
                {t('scanner.analyzeBtn')}
              </button>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="tab-content-panel active">
              <input type="file" ref={fileInputRef} accept="image/*" style={{ display:'none' }} onChange={handleFileChange} />
              {!uploadedFile ? (
                <div className="upload-dropzone" id="upload-dropzone" onClick={() => fileInputRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="48" height="48"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div>
                    <p>{t('scanner.uploadDropzone')}</p>
                    <span>{t('scanner.uploadSupports')}</span>
                  </div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'16px', marginTop:'16px' }}>
                  <img src={uploadedFile} alt="Upload Preview" style={{ maxHeight:'200px', borderRadius:'8px', border:'1px solid var(--glass-border)' }} />
                  <button className="btn btn-primary" id="btn-analyze-upload" style={{ width:'100%' }} onClick={() => performOcr(uploadedFile)}>
                    {t('scanner.scanUploadBtn')}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'camera' && (
            <div className="tab-content-panel active">
              <div className="camera-simulation">
                <div style={{ position:'relative', borderRadius:'12px', overflow:'hidden', background:'#1a1210' }}>
                  <div style={{ height:'220px', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'12px', padding:'20px', background:'linear-gradient(135deg, #1a1210 0%, #2c241b 100%)' }}>
                    <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', textAlign:'center', fontWeight:'600', letterSpacing:'0.05em' }}>Camera Capture</div>
                    <div style={{ marginTop:'12px' }}>
                      <button className="btn btn-primary" onClick={handleRealCameraCapture} style={{ marginRight:'8px' }}>
                        {t('scanner.capturePhoto') || 'Capture Photo'}
                      </button>
                      <button className="btn btn-secondary" onClick={handleMockCapture}>
                        {t('scanner.useMock') || 'Use Mock Data'}
                      </button>
                    </div>
                    <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} style={{ display:'none' }} onChange={handleCameraFileChange} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="results-panel" id="results-panel" ref={resultsPanelRef} style={{ position:'relative' }}>
          {loading && (
            <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', background:'var(--glass-bg)', borderRadius:'24px', zIndex:100, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'20px', backdropFilter:'blur(8px)' }}>
              <div className="loader-lens" style={{ width:'60px', height:'60px', marginBottom:0 }}></div>
              <h4 id="scan-progress-text">{loadingMsg}</h4>
              {ocrProgress > 0 && (
                <div style={{ width:'80%', marginTop:'8px' }}>
                  <progress value={ocrProgress} max="100" className="ocr-progress-bar"></progress>
                  <div style={{ textAlign:'center', marginTop:'4px', color:'var(--text-primary)' }}>{ocrProgress}%</div>
                </div>
              )}
            </div>
          )}

          {!results && !loading && (
            <div className="results-placeholder" id="results-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" width="80" height="80"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.375c.621 0 1.125-.504 1.125-1.125V13.5H9m-3 6.75h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg>
              <div>
                <h3>{t('scanner.noScanTitle')}</h3>
                <p>{t('scanner.noScanDesc')}</p>
              </div>
            </div>
          )}

          {results && !loading && (() => {
            const verdict = verdictLabel(results);
            return (
              <div className="results-content active" id="results-content">
                {confirmationMsg && (
                  <div className="success-msg" style={{ width: '100%', margin: '0 0 16px 0' }}>
                    {confirmationMsg}
                  </div>
                )}
                {saveErrorMsg && (
                  <div className="error-msg" style={{ width: '100%', margin: '0 0 16px 0', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {saveErrorMsg}
                  </div>
                )}
                <div className="results-summary-card">
                  <div className="results-summary-info">
                    <h3 id="report-title-label">{t('scanner.reportTitle')}</h3>
                    <p id="report-counts-subtitle">
                      {t('scanner.reportCounts', { halal: results.countHalal, nonHalal: results.countNonHalal, uncertain: results.countUncertain })}
                    </p>
                    <span className={`status-indicator ${verdict.cls}`} id="report-badge-status">{verdict.text}</span>
                  </div>
                </div>

                <div>
                  <h4 style={{ marginBottom:'12px' }}>{t('scanner.ingredientBreakdown')}</h4>
                  <div className="ingredient-analysis-list" id="report-breakdown-list">
                    {results.itemsReport.map((item, i) => (
                      <div key={i} className="analyzed-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="analyzed-item-left">
                            <div className={`analyzed-item-dot ${item.status}`}></div>
                            <div>
                              <div className="analyzed-item-name">{translateDbText(item.name, i18n.language)}</div>
                              <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>
                                {item.origin ? translateDbText(item.origin, i18n.language) : t('scanner.unknownOrigin')}
                              </div>
                            </div>
                          </div>
                          <div className={`analyzed-item-badge ${item.status}`}>
                            {item.status === 'halal' ? t('verdict.halal') : item.status === 'non-halal' ? t('verdict.nonHalal') : t('verdict.uncertain')}
                          </div>
                        </div>
                        {detailedExplanations && item.desc && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '24px', fontStyle: 'italic', opacity: 0.85 }}>
                            {translateDbText(item.desc, i18n.language)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {results.recommendations.length > 0 && (
                  <div className="alternatives-container" id="report-alternatives-box">
                    <h4>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="18" height="18" style={{ color:'var(--primary)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {t('scanner.recommendedAlts')}
                    </h4>
                    <div className="alternatives-list" id="report-alternatives-list">
                      {results.recommendations.map((rec, i) => (
                        <div key={i} className="alternative-card">
                          <div>
                            <div className="alternative-name">{translateDbText(rec.replacement, i18n.language)}</div>
                            <div className="alternative-reason">{t('scanner.substituteFor', { name: translateDbText(rec.original, i18n.language) })}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    {t('scanner.incorrectClassification')}
                  </p>
                  <a href="#report" className="btn btn-secondary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                    {t('scanner.reportBtn')}
                  </a>
                </div>

                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <button
                    id="btn-scan-another"
                    className="btn btn-primary"
                    onClick={handleReset}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="18" height="18">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                {t('scanner.scanAnother')}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
      <ArchiveOverlay
        match={archiveMatch}
        onAccept={() => {
          setResults({
            itemsReport: archiveMatch.itemsReport || [],
            recommendations: archiveMatch.recommendations || [],
            countHalal: archiveMatch.counts?.halal || 0,
            countNonHalal: archiveMatch.counts?.nonHalal || 0,
            countUncertain: archiveMatch.counts?.uncertain || 0
          });
          setArchiveMatch(null);
          setPendingText(null);
          setPendingImage(null);
        }}
        onRescan={() => {
          setArchiveMatch(null);
          processAnalysis(pendingText, pendingImage, true);
        }}
      />
    </div>
  );
}
