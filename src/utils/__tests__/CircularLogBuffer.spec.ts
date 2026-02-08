import { describe, it, expect } from 'vitest'
import CircularLogBuffer from '../CircularLogBuffer'

describe('CircularLogBuffer', () => {
  /**
   * Тест 1: Перевіряємо, чи буфер зберігає максимальну кількість рядків
   */
  it('should push lines and maintain max size', () => {
    const buffer = new CircularLogBuffer(3)
    
    buffer.push('line 1')
    buffer.push('line 2')
    buffer.push('line 3')
    buffer.push('line 4')  // Додаємо 4-й рядок, але максимум 3
    
    // Результат: 'line 1' видалена, залишилися [line 2, line 3, line 4]
    const lines = buffer.getLines()
    expect(lines).toEqual(['line 2', 'line 3', 'line 4'])
    expect(buffer.getLineCount()).toBe(3)
  })

  /**
   * Тест 2: Перевіряємо обробку багаторядкови�� рядків
   */
  it('should handle multiline strings', () => {
    const buffer = new CircularLogBuffer(10)
    
    // Додаємо рядок з трьома лініями
    buffer.push('line 1\nline 2\nline 3')
    
    // Перевіряємо, що розділилось на 3 окремих рядки
    expect(buffer.getLineCount()).toBe(3)
  })

  /**
   * Тест 3: Перевіряємо функцію пошуку
   */
  it('should search for lines', () => {
    const buffer = new CircularLogBuffer(10)
    
    buffer.push('error: connection failed')
    buffer.push('info: started')
    buffer.push('error: timeout')
    
    // Шукаємо всі рядки, що містять 'error'
    const results = buffer.search('error')
    expect(results).toHaveLength(2)
    expect(results).toContain('error: connection failed')
    expect(results).toContain('error: timeout')
  })

  /**
   * Тест 4: Перевіряємо очищення буфера
   */
  it('should clear all data', () => {
    const buffer = new CircularLogBuffer(10)
    
    buffer.push('data')
    expect(buffer.isEmpty()).toBe(false)
    
    buffer.clear()
    expect(buffer.isEmpty()).toBe(true)
    expect(buffer.getLineCount()).toBe(0)
  })

  /**
   * Тест 5: Перевіряємо розрахунок розміру буфера
   */
  it('should get correct size', () => {
    const buffer = new CircularLogBuffer(10)
    
    buffer.push('hello')  // 5 байтів
    expect(buffer.getSize()).toBe(5)
    
    buffer.push('world')  // ще 5 байтів = 10 всього
    expect(buffer.getSize()).toBe(10)
  })

  /**
   * Тест 6: Перевіряємо конвертацію у рядок
   */
  it('should export as string', () => {
    const buffer = new CircularLogBuffer(10)
    
    buffer.push('line 1')
    buffer.push('line 2')
    
    const result = buffer.toString()
    expect(result).toBe('line 1\nline 2')
  })

  /**
   * Тест 7: Перевіряємо getTail() - останні N рядків
   */
  it('should get tail', () => {
    const buffer = new CircularLogBuffer(10)
    
    buffer.push('line 1')
    buffer.push('line 2')
    buffer.push('line 3')
    
    // Беремо останні 2 рядки
    const tail = buffer.getTail(2)
    expect(tail).toBe('line 2\nline 3')
  })

  /**
   * Тест 8: Перевіряємо обробку порожного буфера
   */
  it('should handle empty buffer', () => {
    const buffer = new CircularLogBuffer(10)
    
    expect(buffer.isEmpty()).toBe(true)
    expect(buffer.getLineCount()).toBe(0)
    expect(buffer.toString()).toBe('')
    expect(buffer.getLastLine()).toBe('')
  })

  /**
   * Тест 9: Перевіряємо пошук в порожному буфері
   */
  it('should return empty array when searching in empty buffer', () => {
    const buffer = new CircularLogBuffer(10)
    
    const results = buffer.search('test')
    expect(results).toHaveLength(0)
  })

  /**
   * Тест 10: Перевіряємо фільтрацію
   */
  it('should filter lines by predicate', () => {
    const buffer = new CircularLogBuffer(10)
    
    buffer.push('error: 1')
    buffer.push('info: 2')
    buffer.push('error: 3')
    
    // Фільтруємо тільки рядки, що містять 'error'
    const errors = buffer.filter(line => line.includes('error'))
    expect(errors).toHaveLength(2)
  })
})