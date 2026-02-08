/**
 * ✅ Efficient Circular Log Buffer
 * 
 * Принцип роботи:
 * - Зберігає логи в масиві (не в рядку)
 * - Автоматично видаляє старіші логи при переповненні
 * - O(1) додавання нових логів
 * - O(n) тільки при конвертації у рядок для відображення
 */
export class CircularLogBuffer {
  private buffer: string[] = []
  private readonly maxLines: number
  private totalSize: number = 0

  /**
   * @param maxLines Максимум рядків для збереження (за замовчуванням 500)
   */
  constructor(maxLines: number = 500) {
    this.maxLines = maxLines
  }

  /**
   * ✅ Додає дані до буфера - O(1) операція
   * 
   * @param data Рядок даних (можливо, багатирядковий)
   * 
   * @example
   * buffer.push('error: something failed')
   * buffer.push('line1\nline2\nline3')
   */
  push(data: string): void {
    if (!data) return

    // Розділяємо на рядки для підрахунку
    const lines = data.split('\n').filter(line => line.length > 0)
    
    for (const line of lines) {
      this.buffer.push(line)
      this.totalSize += line.length

      // Видаляємо старіші рядки при переповненні
      while (this.buffer.length > this.maxLines) {
        const removed = this.buffer.shift() || ''
        this.totalSize -= removed.length
      }
    }
  }

  /**
   * ✅ Конвертує буфер у рядок - O(n) операція
   * 
   * Цю операцію робимо рідко (лише при render),
   * тому O(n) прийнятна
   * 
   * @returns Весь буфер як один рядок з новими рядками
   * 
   * @example
   * const allLogs = buffer.toString()
   * console.log(allLogs)
   */
  toString(): string {
    return this.buffer.join('\n')
  }

  /**
   * ✅ Отримує останні N рядків (для ефективного скролінгу)
   * 
   * @param lines Кількість ря��ків з кінця (за замовчуванням 100)
   * @returns Останні N рядків як рядок
   * 
   * @example
   * const lastLogs = buffer.getTail(50)  // Останні 50 рядків
   */
  getTail(lines: number = 100): string {
    const start = Math.max(0, this.buffer.length - lines)
    return this.buffer.slice(start).join('\n')
  }

  /**
   * ✅ Отримує перші N рядків
   * 
   * @param lines Кількість рядків з початку (за замовчуванням 100)
   * @returns Перші N рядків як рядок
   * 
   * @example
   * const firstLogs = buffer.getHead(50)  // Перші 50 рядків
   */
  getHead(lines: number = 100): string {
    return this.buffer.slice(0, lines).join('\n')
  }

  /**
   * ✅ Очищує буфер повністю
   * 
   * @example
   * buffer.clear()
   */
  clear(): void {
    this.buffer = []
    this.totalSize = 0
  }

  /**
   * ✅ Отримує розмір буфера в байтах
   * 
   * @returns Загальний розмір всіх рядків в байтах
   * 
   * @example
   * console.log(buffer.getSize())  // 1024
   */
  getSize(): number {
    return this.totalSize
  }

  /**
   * ✅ Отримує кількість рядків у буфері
   * 
   * @returns Кількість рядків, що зберігаються
   * 
   * @example
   * console.log(buffer.getLineCount())  // 500
   */
  getLineCount(): number {
    return this.buffer.length
  }

  /**
   * ✅ Перевіряє, чи буфер порожній
   * 
   * @returns true якщо буфер не містить даних, false інакше
   * 
   * @example
   * if (buffer.isEmpty()) {
   *   console.log('Buffer is empty')
   * }
   */
  isEmpty(): boolean {
    return this.buffer.length === 0
  }

  /**
   * ✅ Отримує останній рядок (для debug)
   * 
   * @returns Останній рядок або пусто, якщо буфер порожній
   * 
   * @example
   * console.log(buffer.getLastLine())  // "error: something"
   */
  getLastLine(): string {
    return this.buffer[this.buffer.length - 1] || ''
  }

  /**
   * ✅ Отримує всі рядки як масив
   * 
   * @returns Копія всіх рядків у масиві
   * 
   * @example
   * const lines = buffer.getLines()
   * for (const line of lines) {
   *   console.log(line)
   * }
   */
  getLines(): string[] {
    return [...this.buffer]
  }

  /**
   * ✅ Фільтрує рядки за умовою
   * 
   * @param predicate Функція фільтрації (повертає true для включення)
   * @returns Масив відфільтрованих рядків
   * 
   * @example
   * const errorLines = buffer.filter(line => line.includes('error'))
   */
  filter(predicate: (line: string) => boolean): string[] {
    return this.buffer.filter(predicate)
  }

  /**
   * ✅ Шукає рядки, що містять текст (case-insensitive)
   * 
   * @param search Текст для пошуку
   * @returns Масив рядків, що містять текст
   * 
   * @example
   * const results = buffer.search('ERROR')
   * // Буде знайдено: 'ERROR: something', 'error: something else'
   */
  search(search: string): string[] {
    const lower = search.toLowerCase()
    return this.buffer.filter(line =>
      line.toLowerCase().includes(lower)
    )
  }
}

export default CircularLogBuffer