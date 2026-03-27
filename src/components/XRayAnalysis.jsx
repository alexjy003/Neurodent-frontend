import React, { useState, useRef, useCallback } from 'react'
import { API_BASE_URL } from '../utils/config'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_MODEL   = 'meta-llama/llama-4-scout-17b-16e-instruct'
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions'

const ANALYSIS_STEPS = [
  'Preparing image data...',
  'Validating image is a dental X-ray...',
  'Running YOLOv8 fault detection...',
  'Classifying detected lesions...',
  'Generating AI diagnosis predictions...',
  'Compiling diagnostic report...',
]

const DENTAL_IMAGE_GUARD_PROMPT = `You are validating uploads for a dental X-ray analyzer.
Decide whether the image is a valid dental radiograph or intraoral dental image.

Return ONLY valid JSON:
{
  "isDentalXray": true,
  "confidence": 92,
  "reason": "Brief reason"
}

Rules:
- isDentalXray = true only for dental panoramic/periapical/bitewing/CBCT slice/intraoral dental photos.
- isDentalXray = false for products, people portraits, landscapes, documents, screenshots, or unrelated medical images.
- confidence must be 0-100 integer.
`

const severityConfig = {
  low:      { label: 'Normal',   bg: 'bg-green-50',  border: 'border-green-200',  badge: 'bg-green-100 text-green-800' },
  mild:     { label: 'Mild',     bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800' },
  moderate: { label: 'Moderate', bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800' },
  severe:   { label: 'Urgent',   bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-100 text-red-800' },
}

const riskConfig = {
  low:    { label: 'Low Risk',                     bg: 'bg-green-50',  text: 'text-green-700',  icon: '✅' },
  medium: { label: 'Moderate Risk',                bg: 'bg-orange-50', text: 'text-orange-700', icon: '⚠️' },
  high:   { label: 'High Risk – See Dentist Soon', bg: 'bg-red-50',    text: 'text-red-700',    icon: '🚨' },
}

const getFindingIcon = (label = '', severity = '') => {
  const l = label.toLowerCase()
  if (l.includes('cari') || l.includes('cavity') || l.includes('decay'))        return '🦷'
  if (l.includes('bone') || l.includes('alveol'))                                return '🦴'
  if (l.includes('calcul') || l.includes('tartar') || l.includes('plaque'))     return '⚠️'
  if (l.includes('restor') || l.includes('filling') || l.includes('crown'))     return '✅'
  if (l.includes('periap') || l.includes('abscess') || l.includes('necros'))    return '🔴'
  if (l.includes('impacted') || l.includes('wisdom') || l.includes('erupt'))    return '🦷'
  if (l.includes('fractur') || l.includes('crack'))                              return '💔'
  if (l.includes('infect') || l.includes('inflam'))                              return '🔥'
  if (l.includes('root') || l.includes('canal'))                                 return '🔴'
  if (l.includes('periodon') || l.includes('gingiv') || l.includes('gum'))      return '🦷'
  if (l.includes('healthy') || l.includes('normal') || l.includes('intact'))    return '✅'
  if (severity === 'severe') return '🚨'
  if (severity === 'low')    return '✅'
  return '🔬'
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

const toDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const buildDiagnosisPrompt = (findings) => `You are an expert dental radiologist and oral diagnostician.
You are given YOLOv8 detection findings from a dental X-ray. Do not re-detect objects.
Use only the provided findings to produce diagnosis prediction output.

Return ONLY valid JSON in this exact shape:
{
  "overallRisk": "low" | "medium" | "high",
  "summary": "3-4 sentence clinical synthesis",
  "diagnoses": [
    {
      "name": "Clinical diagnosis name",
      "likelihood": 87,
      "basis": "1-2 sentence basis using the findings",
      "urgency": "routine" | "soon" | "urgent",
      "specialist": "General Dentist | Endodontist | Periodontist | Oral Surgeon | Orthodontist"
    }
  ]
}

Rules:
- Infer 2-5 likely diagnoses from combined findings.
- likelihood must be integer 50-99.
- urgency mapping: routine (regular follow-up), soon (2-4 weeks), urgent (immediate care).
- If findings are minimal/uncertain, keep overallRisk low and provide preventive diagnosis.

YOLO findings input:
${JSON.stringify(findings, null, 2)}`

const deriveOverallRisk = (findings = []) => {
  if (!findings.length) return 'low'
  const severities = findings.map((f) => f.severity)
  if (severities.includes('severe')) return 'high'
  if (severities.includes('moderate')) return 'medium'
  return 'low'
}

const parseGroqText = (text) => {
  const fenced = text.match(/` + '```' + `(?:json)?\s*([\s\S]*?)` + '```' + `/)
  const raw = fenced ? fenced[1].trim() : text.trim()
  const objMatch = raw.match(/\{[\s\S]*\}/)
  if (!objMatch) throw new Error('No JSON object found in response')
  return JSON.parse(objMatch[0])
}

const parseGuardResult = (text) => {
  const parsed = parseGroqText(text)
  const isDentalXray = Boolean(parsed?.isDentalXray)
  const confidence = typeof parsed?.confidence === 'number' ? Math.min(100, Math.max(0, parsed.confidence)) : 0
  const reason = typeof parsed?.reason === 'string' ? parsed.reason : ''
  return { isDentalXray, confidence, reason }
}

const getBboxColor = (label = '') => {
  const l = label.toLowerCase()
  if (l.includes('deep cari') || l.includes('deep cav'))                       return { stroke: '#CC44FF', fill: 'rgba(204,68,255,0.18)' }
  if (l.includes('cari') || l.includes('cavity') || l.includes('decay'))       return { stroke: '#CCFF00', fill: 'rgba(204,255,0,0.18)'  }
  if (l.includes('impacted') || l.includes('impact'))                           return { stroke: '#3B82F6', fill: 'rgba(59,130,246,0.20)' }
  if (l.includes('abscess') || l.includes('periap') || l.includes('necros'))   return { stroke: '#FF4444', fill: 'rgba(255,68,68,0.18)'  }
  if (l.includes('bone') || l.includes('alveol'))                               return { stroke: '#FF9900', fill: 'rgba(255,153,0,0.18)'  }
  if (l.includes('fractur') || l.includes('crack'))                             return { stroke: '#FF6600', fill: 'rgba(255,102,0,0.18)'  }
  if (l.includes('calcul') || l.includes('tartar'))                             return { stroke: '#FFD700', fill: 'rgba(255,215,0,0.18)'  }
  if (l.includes('healthy') || l.includes('normal') || l.includes('intact'))   return { stroke: '#00FF88', fill: 'rgba(0,255,136,0.12)'  }
  return { stroke: '#00BFFF', fill: 'rgba(0,191,255,0.18)' }
}

const drawAnnotatedCanvas = (dataURL, findings) =>
  new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const MAX = 2400
      const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight))
      const cw = Math.round(img.naturalWidth  * scale)
      const ch = Math.round(img.naturalHeight * scale)
      const canvas = document.createElement('canvas')
      canvas.width  = cw
      canvas.height = ch
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, cw, ch)

      const annotated = findings.filter(f => f.bbox && typeof f.bbox.x === 'number')
      annotated.forEach((f) => {
        const { x, y, w, h } = f.bbox
        const px = Math.round((x / 100) * cw)
        const py = Math.round((y / 100) * ch)
        const pw = Math.round((w / 100) * cw)
        const ph = Math.round((h / 100) * ch)
        const { stroke, fill } = getBboxColor(f.label)

        ctx.fillStyle = fill
        ctx.fillRect(px, py, pw, ph)

        const lw = Math.max(2, Math.round(cw * 0.003))
        ctx.strokeStyle = stroke
        ctx.lineWidth   = lw
        ctx.strokeRect(px, py, pw, ph)

        const fontSize = Math.max(13, Math.round(cw * 0.017))
        ctx.font = `bold ${fontSize}px Arial, sans-serif`
        const conf = f.confidence != null ? ` ${f.confidence}%` : ''
        const labelText = `${f.label}${conf}`
        const textW = ctx.measureText(labelText).width
        const tagH  = fontSize + 8
        const tagX  = Math.max(0, Math.min(px, cw - textW - 10))
        const tagY  = py >= tagH + 4 ? py - tagH - 2
                    : py + ph + 2 + tagH < ch ? py + ph + 2
                    : Math.max(0, py)
        ctx.fillStyle = stroke
        ctx.fillRect(tagX, tagY, textW + 10, tagH)
        ctx.fillStyle = '#000000'
        ctx.fillText(labelText, tagX + 5, tagY + fontSize)
      })

      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => resolve(null)
    img.src = dataURL
  })

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff']

const XRayAnalysis = () => {
  const [image,             setImage]             = useState(null)
  const [isDragging,        setIsDragging]        = useState(false)
  const [analyzing,         setAnalyzing]         = useState(false)
  const [stepIndex,         setStepIndex]         = useState(0)
  const [progress,          setProgress]          = useState(0)
  const [results,           setResults]           = useState(null)
  const [error,             setError]             = useState('')
  const [annotatedImageURL, setAnnotatedImageURL] = useState(null)
  const [showOriginal,      setShowOriginal]      = useState(false)
  const fileInputRef = useRef(null)

  const loadFile = (file) => {
    if (!ACCEPTED.includes(file.type)) { setError('Please upload a valid image file (JPG, PNG, WEBP, TIFF, BMP).'); return }
    if (file.size > 20 * 1024 * 1024)  { setError('File size must be under 20 MB.'); return }
    setError(''); setResults(null); setAnnotatedImageURL(null); setShowOriginal(false)
    toDataURL(file).then((dataURL) => setImage({ file, dataURL }))
  }

  const handleFileChange = (e) => { if (e.target.files[0]) loadFile(e.target.files[0]); e.target.value = '' }
  const handleDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]) }, [])
  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)
  const reset = () => { setImage(null); setResults(null); setError(''); setProgress(0); setAnnotatedImageURL(null); setShowOriginal(false) }

  const runAnalysis = async () => {
    if (!image) return
    setAnalyzing(true); setResults(null); setError(''); setStepIndex(0); setProgress(0); setAnnotatedImageURL(null); setShowOriginal(false)
    try {
      setStepIndex(0); setProgress(8)
      await delay(300)

      setStepIndex(1); setProgress(18)

      const guardRes = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: DENTAL_IMAGE_GUARD_PROMPT },
              { type: 'image_url', image_url: { url: image.dataURL } },
            ],
          }],
          max_tokens: 400,
          temperature: 0,
        }),
      })

      if (!guardRes.ok) {
        const errBody = await guardRes.json().catch(() => ({}))
        throw new Error(errBody?.error?.message || `Image validation API error ${guardRes.status}`)
      }

      const guardJson = await guardRes.json()
      const guardRawText = guardJson?.choices?.[0]?.message?.content || ''

      let guard
      try {
        guard = parseGuardResult(guardRawText)
      } catch {
        guard = { isDentalXray: false, confidence: 0, reason: 'Image validation could not confirm a dental radiograph.' }
      }

      if (!guard.isDentalXray || guard.confidence < 55) {
        setProgress(100)
        setError(
          `This upload does not appear to be a dental X-ray/intraoral image. ${guard.reason || 'Please upload a clear dental radiograph.'}`
        )
        return
      }

      setStepIndex(2); setProgress(28)

      const formData = new FormData()
      formData.append('image', image.file)

      const yoloRes = await fetch(`${API_BASE_URL}/xray-ml/analyze`, {
        method: 'POST',
        body: formData,
      })

      if (!yoloRes.ok) {
        const errBody = await yoloRes.json().catch(() => ({}))
        throw new Error(errBody?.message || `YOLO API error ${yoloRes.status}`)
      }

      const yoloJson = await yoloRes.json()
      const rawFindings = Array.isArray(yoloJson?.findings) ? yoloJson.findings : []

      if (yoloJson?.inconclusive && rawFindings.length === 0) {
        setProgress(100)
        setError(yoloJson?.message || 'ML analysis was inconclusive for this image. Please verify model configuration and image quality.')
        return
      }

      const findings = rawFindings.map((f, i) => ({
        ...f,
        id: f.id || `f_${i}`,
        severity: ['low','mild','moderate','severe'].includes(f.severity) ? f.severity : 'mild',
        icon: getFindingIcon(f.label, f.severity),
      }))

      await delay(600);  setStepIndex(3); setProgress(48)
      await delay(500);  setStepIndex(4); setProgress(68)

      const diagnosisPrompt = buildDiagnosisPrompt(
        findings.map(({ label, confidence, severity, description }) => ({ label, confidence, severity, description }))
      )

      const groqRes = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{
            role: 'user',
            content: diagnosisPrompt,
          }],
          max_tokens: 2048,
          temperature: 0.4,
        }),
      })

      await delay(600);  setStepIndex(5); setProgress(88)

      if (!groqRes.ok) {
        const errBody = await groqRes.json().catch(() => ({}))
        throw new Error(errBody?.error?.message || `Groq API error ${groqRes.status}`)
      }
      const json    = await groqRes.json()
      const rawText = json?.choices?.[0]?.message?.content || ''

      setStepIndex(5); setProgress(92)
      await delay(300)

      let parsed
      try { parsed = parseGroqText(rawText) }
      catch {
        parsed = {
          overallRisk: deriveOverallRisk(findings),
          summary: findings.length
            ? `YOLOv8 detected ${findings.length} potential finding${findings.length === 1 ? '' : 's'}. Share this report with your dentist for clinical confirmation.`
            : 'YOLOv8 did not detect major visible abnormalities. Continue routine dental follow-up.',
          diagnoses: [],
        }
      }

      const overallRisk = ['low','medium','high'].includes(parsed.overallRisk)
        ? parsed.overallRisk
        : deriveOverallRisk(findings)

      const diagnoses = (parsed.diagnoses || []).map((d, i) => ({
        ...d, id: `d_${i}`,
        likelihood: typeof d.likelihood === 'number' ? Math.min(99, Math.max(50, d.likelihood)) : 70,
        urgency: ['routine','soon','urgent'].includes(d.urgency) ? d.urgency : 'routine',
      }))

      setProgress(95)
      const annotated = await drawAnnotatedCanvas(image.dataURL, findings)
      setAnnotatedImageURL(annotated)
      setProgress(100)
      setResults({
        findings,
        diagnoses,
        overallRisk,
        summary: parsed.summary || (findings.length
          ? `YOLOv8 identified ${findings.length} potential finding${findings.length === 1 ? '' : 's'} for clinical review.`
          : 'No major visible findings detected by YOLOv8.'),
        analyzedAt: new Date(),
      })
    } catch (err) {
      console.error('X-ray analysis error:', err)
      setError(err.message || 'Analysis failed. Please check your connection and try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative z-10 flex items-start space-x-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl">🔬</div>
          <div>
            <h2 className="text-3xl font-bold mb-1">AI X-Ray Analysis</h2>
            <p className="text-blue-100 text-base">Upload your intra-oral dental images or X-rays for an AI-powered diagnostic screening.</p>
            <p className="text-blue-200 text-xs mt-2">⚠️ For informational purposes only. Does not replace professional dental diagnosis.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Upload Panel */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Upload Image</span>
            </h3>

            {!image ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-indigo-500 bg-indigo-50 scale-[1.01]' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/40'}`}
              >
                <div className="text-5xl mb-4">🦷</div>
                <p className="text-base font-semibold text-gray-700 mb-1">Drag & drop your X-ray or dental image</p>
                <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
                <span className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Choose File
                </span>
                <p className="text-xs text-gray-400 mt-4">Supports: JPG, PNG, WEBP, TIFF, BMP — max 20 MB</p>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border bg-gray-900" style={{minHeight:260, borderColor: results && annotatedImageURL && !showOriginal ? '#6366f1' : '#374151'}}>
                  <img
                    src={results && annotatedImageURL && !showOriginal ? annotatedImageURL : image.dataURL}
                    alt="Dental image"
                    className="w-full block"
                    style={{maxHeight: results && annotatedImageURL ? 'none' : 288, objectFit: 'contain'}}
                  />
                  {results && annotatedImageURL && (
                    <div className="absolute bottom-2 left-2 flex space-x-1">
                      <button onClick={() => setShowOriginal(false)} className={`text-xs px-2.5 py-1 rounded font-semibold transition-all ${!showOriginal ? 'bg-indigo-600 text-white' : 'bg-black/60 text-gray-300 hover:bg-black/80'}`}>🔬 Annotated</button>
                      <button onClick={() => setShowOriginal(true)} className={`text-xs px-2.5 py-1 rounded font-semibold transition-all ${showOriginal ? 'bg-indigo-600 text-white' : 'bg-black/60 text-gray-300 hover:bg-black/80'}`}>Original</button>
                    </div>
                  )}
                  {results && annotatedImageURL && !showOriginal && (
                    <a href={annotatedImageURL} download="annotated-xray.png" className="absolute bottom-2 right-2 text-xs bg-black/60 text-white px-2.5 py-1 rounded hover:bg-indigo-700 transition-colors font-medium">⬇ Save</a>
                  )}
                  <button onClick={reset} className="absolute top-2 right-2 p-1.5 bg-gray-800/80 rounded-lg text-white hover:bg-red-600 transition-colors" title="Remove">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                {results && annotatedImageURL && !showOriginal && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1.5 px-1">
                    {[{c:'#CCFF00',l:'Caries'},{c:'#CC44FF',l:'Deep Caries'},{c:'#3B82F6',l:'Impacted'},{c:'#FF9900',l:'Bone Loss'},{c:'#FF4444',l:'Abscess/Periapical'},{c:'#00BFFF',l:'Other'}].map(({c,l}) => (
                      <div key={l} className="flex items-center space-x-1.5"><span className="w-3.5 h-3 rounded-sm flex-shrink-0 border border-black/10" style={{backgroundColor:c}}/><span className="text-xs text-gray-600">{l}</span></div>
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-3">
                  <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{image.file.name}</p>
                    <p className="text-xs text-gray-500">{(image.file.size/1024).toFixed(1)} KB · {image.file.type.split('/')[1].toUpperCase()}</p>
                  </div>
                  <button onClick={() => { reset(); setTimeout(() => fileInputRef.current?.click(), 50) }} className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">Change</button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>

                {!results ? (
                  <button onClick={runAnalysis} disabled={analyzing} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center space-x-2">
                    {analyzing ? (<><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg><span>Analyzing…</span></>) : (<><span className="text-lg">🔬</span><span>Analyze Image</span></>)}
                  </button>
                ) : (
                  <button onClick={reset} className="w-full py-3 border-2 border-indigo-200 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors">Upload New Image</button>
                )}
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-start space-x-2 bg-red-50 border border-red-200 rounded-xl p-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z"/></svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center space-x-2"><span>💡</span><span>Tips for Best Results</span></h4>
            <ul className="space-y-2.5 text-sm text-gray-600">
              {['Use high-resolution periapical or panoramic X-ray images.','Ensure the image is well-lit and in-focus if using a camera.','Intraoral photographs work well for surface cavity detection.','CBCT scans or digital X-rays from your dentist yield the most accurate results.','Avoid blurry, rotated or heavily compressed images.'].map((tip,i) => (
                <li key={i} className="flex items-start space-x-2"><span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span><span>{tip}</span></li>
              ))}
            </ul>
          </div>

          {results && results.diagnoses && results.diagnoses.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100 flex items-center space-x-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                <h4 className="text-base font-bold text-gray-900">Diagnosis Prediction</h4>
                <span className="ml-auto text-xs text-indigo-500 font-medium bg-indigo-100 px-2 py-0.5 rounded-full">AI Predicted</span>
              </div>
              <div className="divide-y divide-gray-100">
                {results.diagnoses.map((dx) => {
                  const urgencyStyle = dx.urgency === 'urgent'
                    ? { badge: 'bg-red-100 text-red-700',    bar: 'bg-red-500',    dot: 'bg-red-500',    label: '🚨 Urgent' }
                    : dx.urgency === 'soon'
                    ? { badge: 'bg-orange-100 text-orange-700', bar: 'bg-orange-400', dot: 'bg-orange-400', label: '⚡ See Soon' }
                    : { badge: 'bg-green-100 text-green-700',  bar: 'bg-green-500',  dot: 'bg-green-500',  label: '✅ Routine' }
                  return (
                    <div key={dx.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${urgencyStyle.dot}`} />
                          <span className="font-bold text-gray-900 text-sm">{dx.name}</span>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ml-3 ${urgencyStyle.badge}`}>{urgencyStyle.label}</span>
                      </div>
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Likelihood</span>
                          <span className="text-xs font-bold text-gray-700">{dx.likelihood}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-2 rounded-full transition-all ${urgencyStyle.bar}`} style={{width:`${dx.likelihood}%`}} />
                        </div>
                      </div>
                      {dx.basis && <p className="text-xs text-gray-600 leading-relaxed">{dx.basis}</p>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div>
          {analyzing && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col items-center justify-center space-y-6" style={{minHeight:440}}>
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e0e7ff" strokeWidth="2.5"/>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="url(#grad)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${progress} 100`} style={{transition:'stroke-dasharray 0.5s ease'}}/>
                  <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#3b82f6"/></linearGradient></defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-base font-bold text-indigo-600">{progress}%</span></div>
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-gray-800 mb-1">{ANALYSIS_STEPS[stepIndex]}</p>
                <p className="text-sm text-gray-500">Powered by YOLOv8 + Groq Llama</p>
              </div>
              <div className="w-full max-w-xs space-y-2">
                {ANALYSIS_STEPS.map((step,i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${i < stepIndex ? 'bg-indigo-600' : i === stepIndex ? 'bg-indigo-300 animate-pulse' : 'bg-gray-200'}`}>
                      {i < stepIndex && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                    </div>
                    <p className={`text-xs ${i <= stepIndex ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!analyzing && !results && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col items-center justify-center text-center" style={{minHeight:440}}>
              <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-4xl mb-4">🩻</div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">No Analysis Yet</h4>
              <p className="text-sm text-gray-500 max-w-xs">Upload a dental X-ray or intra-oral image and click <strong>Analyze Image</strong> to get a real-time AI diagnostic report.</p>
            </div>
          )}

          {results && !analyzing && (
            <div className="space-y-5">
              <div className={`rounded-2xl p-5 ${riskConfig[results.overallRisk].bg} border border-opacity-20 shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{riskConfig[results.overallRisk].icon}</span>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Overall Assessment</p>
                      <p className={`text-lg font-bold ${riskConfig[results.overallRisk].text}`}>{riskConfig[results.overallRisk].label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Analyzed</p>
                    <p className="text-xs font-semibold text-gray-600">{results.analyzedAt.toLocaleTimeString()}</p>
                  </div>
                </div>
                {results.summary && <p className="text-sm text-gray-700 leading-relaxed mt-1">{results.summary}</p>}
                <p className="text-xs text-gray-500 mt-2">{results.findings.length} finding{results.findings.length !== 1 ? 's' : ''} detected.</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                  <span>Detailed Findings</span>
                </h4>
                {results.findings.map((finding) => {
                  const cfg = severityConfig[finding.severity] || severityConfig.mild
                  return (
                    <div key={finding.id} className={`rounded-2xl border p-5 ${cfg.bg} ${cfg.border}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{finding.icon}</span>
                          <span className="font-bold text-gray-900 text-sm">{finding.label}</span>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${cfg.badge}`}>{cfg.label}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3 leading-relaxed">{finding.description}</p>
                      <div className="flex items-start space-x-2 bg-white/70 rounded-xl p-3">
                        <svg className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z"/></svg>
                        <p className="text-xs text-gray-600">{finding.recommendation}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default XRayAnalysis
