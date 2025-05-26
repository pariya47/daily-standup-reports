// English stop words
const englishStopWords = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "with",
  "by",
  "about",
  "as",
  "into",
  "like",
  "through",
  "after",
  "over",
  "between",
  "out",
  "of",
  "from",
  "up",
  "down",
  "is",
  "am",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "shall",
  "should",
  "can",
  "could",
  "may",
  "might",
  "must",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "me",
  "him",
  "her",
  "us",
  "them",
  "my",
  "your",
  "his",
  "its",
  "our",
  "their",
  "mine",
  "yours",
  "hers",
  "ours",
  "theirs",
  "this",
  "that",
  "these",
  "those",
])

// Thai stop words (expanded list)
const thaiStopWords = new Set([
  "และ",
  "ของ",
  "ที่",
  "ใน",
  "มี",
  "เป็น",
  "การ",
  "ไม่",
  "ให้",
  "ได้",
  "จะ",
  "นี้",
  "ว่า",
  "กับ",
  "แต่",
  "อยู่",
  "ก็",
  "เมื่อ",
  "เรา",
  "เขา",
  "คุณ",
  "เพื่อ",
  "จาก",
  "ถ้า",
  "แล้ว",
  "ต้อง",
  "โดย",
  "หรือ",
  "ทำ",
  "ตาม",
  "ด้วย",
  "ยัง",
  "ซึ่ง",
  "หนึ่ง",
  "สอง",
  "มาก",
  "อื่น",
  "ทุก",
  "ทาง",
  "เคย",
  "อย่าง",
  "นั้น",
  "ถึง",
  "เลย",
  "ควร",
  "อาจ",
  "ช่วย",
  "ขึ้น",
  "ลง",
  "มา",
  "ไป",
  "เสมอ",
  "กว่า",
  "นะ",
  "ครับ",
  "ค่ะ",
  "นะคะ",
  "นะครับ",
  "จ้า",
  "จ้ะ",
  "จัง",
  "ด้วย",
  "แล้ว",
  "ๆ",
  "กำลัง",
  "จริง",
  "อาจ",
  "ควร",
])

// Dictionary of common Thai words for fallback tokenization
const thaiWordList = new Set([
  "พัฒนา",
  "ระบบ",
  "การ",
  "เข้าสู่",
  "ระบบ",
  "เสร็จ",
  "สมบูรณ์",
  "แล้ว",
  "ทดสอบ",
  "การ",
  "แจ้ง",
  "เตือน",
  "ข้อมูล",
  "ผู้ใช้",
  "งาน",
  "วันนี้",
  "แก้ไข",
  "ปัญหา",
  "การ",
  "เชื่อมต่อ",
  "ฐานข้อมูล",
  "ปรับปรุง",
  "หน้า",
  "หลัก",
  "ออกแบบ",
  "ส่วน",
  "ติดต่อ",
  "ผู้ใช้",
  "ทดสอบ",
  "ประสิทธิภาพ",
  "พร้อม",
  "ทำงาน",
  "เพิ่ม",
  "คุณสมบัติ",
  "ใหม่",
  "สำหรับ",
  "แอป",
  "มือถือ",
  "อัพเดท",
  "ล่าสุด",
  "ติดตั้ง",
  "เซิร์ฟเวอร์",
  "ใหม่",
  "สำเร็จ",
  "ตรวจสอบ",
  "ความ",
  "ปลอดภัย",
  "งานที่เสร็จแล้ว",
  "กำลังดำเนินการ",
  "ปัญหาที่พบ",
  "พรุ่งนี้",
  "เมื่อวาน",
  "รายงาน",
  "ประจำวัน",
  "ทีม",
  "วิศวกรรม",
  "ออกแบบ",
  "ผลิตภัณฑ์",
  "การตลาด",
  "ขาย",
  "ลูกค้า",
  "โครงการ",
  "แผน",
  "กำหนดการ",
  "เป้าหมาย",
  "ความคืบหน้า",
  "การประชุม",
  "สรุป",
  "ผลลัพธ์",
  "ทรัพยากร",
  "งบประมาณ",
  "เวลา",
  "คุณภาพ",
  "มาตรฐาน",
  "ความเสี่ยง",
  "โอกาส",
  "กลยุทธ์",
  "ยุทธศาสตร์",
  "นโยบาย",
  "ข้อเสนอแนะ",
  "คำแนะนำ",
  "ข้อคิดเห็น",
  "ความคิดเห็น",
  "ข้อสังเกต",
  "ข้อสรุป",
  "ข้อตกลง",
  "สัญญา",
  "ข้อกำหนด",
  "เงื่อนไข",
  "ข้อจำกัด",
  "อุปสรรค",
  "ความท้าทาย",
  "ความสำเร็จ",
  "ความล้มเหลว",
  "บทเรียน",
  "ประสบการณ์",
  "ความรู้",
  "ทักษะ",
  "ความสามารถ",
  "ศักยภาพ",
  "พัฒนา",
  "ปรับปรุง",
  "เปลี่ยนแปลง",
  "นวัตกรรม",
  "เทคโนโลยี",
  "อุปกรณ์",
  "เครื่องมือ",
  "ซอฟต์แวร์",
  "ฮาร์ดแวร์",
  "แพลตฟอร์ม",
  "แอปพลิเคชัน",
  "โปรแกรม",
  "โค้ด",
  "ข้อมูล",
  "สารสนเทศ",
  "ความรู้",
  "ปัญญา",
  "การวิเคราะห์",
  "การออกแบบ",
  "การพัฒนา",
  "การทดสอบ",
  "การติดตั้ง",
  "การใช้งาน",
  "การบำรุงรักษา",
  "การสนับสนุน",
  "การฝึกอบรม",
  "การเรียนรู้",
  "การสอน",
  "การแนะนำ",
  "การช่วยเหลือ",
  "การแก้ไข",
  "การปรับปรุง",
  "การเพิ่ม",
  "การลด",
  "การเปลี่ยน",
  "การย้าย",
  "การโอน",
  "การส่ง",
  "การรับ",
  "การเก็บ",
  "การจัดเก็บ",
  "การค้นหา",
  "การค้นคืน",
  "การประมวลผล",
  "การแสดงผล",
  "การพิมพ์",
  "การสแกน",
  "การถ่าย",
  "การบันทึก",
  "การเล่น",
  "การหยุด",
  "การเริ่ม",
  "การจบ",
  "การเปิด",
  "การปิด",
])

// Maximum word length to try for segmentation
const MAX_WORD_LENGTH = 10

/**
 * Check if a string contains Thai characters
 */
function containsThai(text: string): boolean {
  return /[\u0E00-\u0E7F]/.test(text)
}

/**
 * Check if Intl.Segmenter is available in the current environment
 */
function isIntlSegmenterAvailable(): boolean {
  return typeof Intl !== "undefined" && "Segmenter" in Intl
}

/**
 * Tokenize Thai text using Intl.Segmenter if available
 * Falls back to dictionary-based approach if not available
 */
function tokenizeThaiText(text: string): string[] {
  if (!text) return []

  // Try to use Intl.Segmenter if available (modern browsers and Node.js with full ICU)
  if (isIntlSegmenterAvailable()) {
    try {
      // @ts-ignore - TypeScript might not recognize Intl.Segmenter in all environments
      const segmenter = new Intl.Segmenter("th", { granularity: "word" })
      const segments = segmenter.segment(text)

      const words: string[] = []
      for (const segment of segments) {
        // Only include actual words, not whitespace or punctuation
        if (segment.isWordLike && segment.segment.trim().length > 1) {
          words.push(segment.segment)
        }
      }

      return words
    } catch (error) {
      console.error("Error using Intl.Segmenter for Thai:", error)
      console.log("Falling back to dictionary-based tokenization")
      // Fall back to dictionary-based approach
    }
  }

  // Fallback: Dictionary-based tokenization
  const tokens: string[] = []
  let i = 0

  while (i < text.length) {
    let wordFound = false

    // Try to match the longest possible word from the current position
    for (let len = Math.min(MAX_WORD_LENGTH, text.length - i); len > 0; len--) {
      const word = text.substring(i, i + len)

      if (thaiWordList.has(word)) {
        tokens.push(word)
        i += len
        wordFound = true
        break
      }
    }

    // If no word was found in the dictionary, use character-based segmentation
    if (!wordFound) {
      // For Thai text, try to group characters into potential words
      if (/[\u0E00-\u0E7F]/.test(text[i])) {
        let j = i + 1
        // Group Thai characters together (up to 5 characters)
        while (j < text.length && /[\u0E00-\u0E7F]/.test(text[j]) && j < i + 5) {
          j++
        }

        const thaiSegment = text.substring(i, j)
        if (thaiSegment.length > 1) {
          tokens.push(thaiSegment)
        }
        i = j
      } else {
        // Skip non-Thai characters
        i++
      }
    }
  }

  return tokens
}

// Process text to generate word cloud data
export function processText(
  text: string,
  stopWordFilter: "english" | "thai" | "any",
): Array<{ text: string; value: number }> {
  if (!text) {
    return []
  }

  // Determine which stop words to use
  let stopWords: Set<string>
  if (stopWordFilter === "english") {
    stopWords = englishStopWords
  } else if (stopWordFilter === "thai") {
    stopWords = thaiStopWords
  } else {
    // Combine both sets for "any"
    stopWords = new Set([...englishStopWords, ...thaiStopWords])
  }

  // Split text into Thai and non-Thai parts
  const thaiParts: string[] = []
  const nonThaiParts: string[] = []

  // Simple regex to split text into Thai and non-Thai segments
  const segments = text.split(/([^\u0E00-\u0E7F]+)/)

  segments.forEach((segment) => {
    if (containsThai(segment)) {
      thaiParts.push(segment)
    } else if (segment.trim()) {
      nonThaiParts.push(segment)
    }
  })

  // Process based on language filter
  let words: string[] = []

  if (stopWordFilter === "english" || stopWordFilter === "any") {
    // Process non-Thai parts for English words
    const englishWords = nonThaiParts.flatMap((part) => part.split(/\s+/)).filter((word) => word.trim().length > 0)
    words = [...words, ...englishWords]
  }

  if (stopWordFilter === "thai" || stopWordFilter === "any") {
    // Process Thai parts
    const thaiWords = thaiParts.flatMap((part) => tokenizeThaiText(part))
    words = [...words, ...thaiWords]
  }

  // Clean words and count frequencies
  const wordCounts: Record<string, number> = {}

  words.forEach((word) => {
    // Clean the word (remove punctuation, convert to lowercase for non-Thai)
    let cleanWord = word

    // Only lowercase non-Thai words (preserve case for Thai)
    if (!containsThai(word)) {
      cleanWord = word.toLowerCase()
    }

    cleanWord = cleanWord.replace(/[^\w\u0E00-\u0E7F]/g, "")

    // Skip empty words, numbers, and stop words
    if (cleanWord.length < 2 || /^\d+$/.test(cleanWord) || stopWords.has(cleanWord.toLowerCase())) {
      return
    }

    // Count word frequency
    wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1
  })

  // Convert to format needed for word cloud
  const wordCloudData = Object.entries(wordCounts)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 100) // Limit to top 100 words

  return wordCloudData
}

// Find sentences containing a specific word
export function findSentencesWithWord(text: string, word: string): string[] {
  if (!text || !word) {
    return []
  }

  // For Thai text, we need a different approach to sentence segmentation
  const containsThaiText = containsThai(text)

  let sentences: string[]

  if (containsThaiText) {
    // Thai sentences often end with space, newline, or Thai punctuation marks
    sentences = text.split(/[.!?।\n]+|(\s{2,})/).filter((s) => s && !s.match(/^\s+$/)) // Remove empty strings and whitespace-only strings
  } else {
    // Split text into sentences (simple approach for non-Thai)
    sentences = text.split(/[.!?।\n]+/).filter((s) => s && !s.match(/^\s+$/))
  }

  // Create variations of the word to search for
  const wordVariations = [
    word, // Original word
    word.toLowerCase(), // Lowercase
    word.toUpperCase(), // Uppercase
    word.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, ""), // Without special chars
    word.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, "-"), // With hyphens
    word.replace(/-/g, ""), // Without hyphens
  ]

  // Filter sentences containing any variation of the word
  const matchingSentences = sentences.filter((sentence) => {
    const sentenceLower = sentence.toLowerCase()

    // Check for exact matches first (case insensitive)
    if (sentenceLower.includes(word.toLowerCase())) {
      return true
    }

    // Check for variations with special characters
    for (const variation of wordVariations) {
      // Skip empty variations
      if (!variation) continue

      // For non-Thai words, check for word boundaries
      if (!containsThai(variation)) {
        const regex = new RegExp(`\\b${variation.replace(/[-]/g, "[\\-]?")}\\b`, "i")
        if (regex.test(sentence)) {
          return true
        }
      } else if (sentenceLower.includes(variation.toLowerCase())) {
        // For Thai words, simple inclusion check is better
        return true
      }
    }

    return false
  })

  return matchingSentences.map((sentence) => sentence.trim()).filter((sentence) => sentence.length > 0)
}

// Generate executive summary
export function generateExecutiveSummary(text: string): string {
  // In a real implementation, this would use NLP or an AI service
  // For this demo, we'll return a mock summary

  if (!text || text.trim().length === 0) {
    return "No data available for the selected period."
  }

  return "Teams are making good progress on implementation tasks. Database work is showing decreased activity while testing and deployment efforts are trending upward. Several teams reported completed milestones ahead of schedule."
}

// Group reports by date
export function groupReportsByDate(reports: any[]) {
  const grouped: Record<string, any[]> = {}

  reports.forEach((report) => {
    const date = new Date(report.createdAt).toISOString().split("T")[0]
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(report)
  })

  // Sort dates in descending order (most recent first)
  return Object.entries(grouped)
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .map(([date, reports]) => ({
      date,
      reports,
    }))
}
