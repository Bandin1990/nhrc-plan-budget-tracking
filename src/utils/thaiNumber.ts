const THAI_DIGITS = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];

export function toThaiNumerals(input: string | number): string {
  if (input === null || input === undefined) return '';
  return input
    .toString()
    .replace(/[0-9]/g, (match) => THAI_DIGITS[parseInt(match, 10)]);
}

export function fromThaiNumerals(input: string): string {
  if (!input) return '';
  return input.replace(/[๐-๙]/g, (match) => {
    return THAI_DIGITS.indexOf(match).toString();
  });
}

export function formatCurrency(amount: number, useThaiNumerals = false): string {
  if (isNaN(amount)) return '0.00';
  const formatted = amount.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return useThaiNumerals ? toThaiNumerals(formatted) : formatted;
}

export function formatNumber(amount: number, useThaiNumerals = false): string {
  if (isNaN(amount)) return '0';
  const formatted = amount.toLocaleString('th-TH');
  return useThaiNumerals ? toThaiNumerals(formatted) : formatted;
}

export function thaiBahtText(num: number): string {
  if (!num || isNaN(num)) return 'ศูนย์บาทถ้วน';

  const numbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  const convertGroup = (nStr: string): string => {
    let result = '';
    const len = nStr.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(nStr.charAt(i), 10);
      const pos = len - i - 1;
      if (digit !== 0) {
        if (pos === 0 && digit === 1 && len > 1) {
          result += 'เอ็ด';
        } else if (pos === 1 && digit === 2) {
          result += 'ยี่สิบ';
        } else if (pos === 1 && digit === 1) {
          result += 'สิบ';
        } else {
          result += numbers[digit] + units[pos];
        }
      }
    }
    return result;
  };

  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const fixed = absNum.toFixed(2);
  const [intPart, decPart] = fixed.split('.');

  let text = '';
  if (parseInt(intPart, 10) === 0) {
    text = 'ศูนย์บาท';
  } else {
    // Process integer part (support billions)
    const len = intPart.length;
    if (len > 6) {
      const high = intPart.substring(0, len - 6);
      const low = intPart.substring(len - 6);
      text = convertGroup(high) + 'ล้าน' + convertGroup(low) + 'บาท';
    } else {
      text = convertGroup(intPart) + 'บาท';
    }
  }

  const decNum = parseInt(decPart, 10);
  if (decNum === 0) {
    text += 'ถ้วน';
  } else {
    text += convertGroup(decPart) + 'สตางค์';
  }

  return (isNegative ? 'ลบ' : '') + text;
}

export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

/**
 * Returns Thai date string like '20 กันยายน 2569'
 */
export function getTodayThaiDate(dateInput?: Date | string): string {
  const d = dateInput ? (typeof dateInput === 'string' ? new Date(dateInput) : dateInput) : new Date();
  const validDate = isNaN(d.getTime()) ? new Date() : d;
  const day = validDate.getDate();
  const month = THAI_MONTHS[validDate.getMonth()];
  const year = validDate.getFullYear() + 543;
  return `${day} ${month} ${year}`;
}

/**
 * Formats official memo book number according to NHRC standard:
 * Keeps 'สม' and leaves the number blank.
 */
export function formatMemoBookNumber(bookNumber?: string): string {
  if (!bookNumber) return 'สม';
  const trimmed = bookNumber.trim();
  if (trimmed.startsWith('สม') || trimmed.startsWith('ที่ สม') || trimmed.startsWith('ที่สม')) {
    return 'สม';
  }
  return trimmed;
}

/**
 * Gets the actual input/creation date of the memo in Thai format.
 */
export function getMemoDisplayDate(memo: { memoDate?: string; createdAt?: string }): string {
  if (memo.createdAt) {
    return getTodayThaiDate(memo.createdAt);
  }
  if (memo.memoDate && memo.memoDate !== '22 กรกฎาคม 2569' && memo.memoDate !== '15 กรกฎาคม 2569') {
    return memo.memoDate;
  }
  return getTodayThaiDate();
}

