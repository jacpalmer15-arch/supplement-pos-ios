import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  test('merges class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  test('handles conditional classes', () => {
    expect(cn('base', true && 'conditional', false && 'not-included')).toBe('base conditional')
  })

  test('handles undefined and null values', () => {
    expect(cn('base', undefined, null, 'other')).toBe('base other')
  })

  test('handles empty strings', () => {
    expect(cn('base', '', 'other')).toBe('base other')
  })

  test('merges Tailwind classes correctly', () => {
    // twMerge should handle conflicting Tailwind classes
    expect(cn('p-4', 'p-2')).toBe('p-2')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  test('handles array of classes', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2')
  })

  test('handles object with conditional classes', () => {
    expect(cn({
      'base': true,
      'conditional': true,
      'not-included': false
    })).toBe('base conditional')
  })

  test('handles complex combinations', () => {
    const result = cn(
      'base-class',
      ['array-class1', 'array-class2'],
      {
        'object-class': true,
        'not-included': false
      },
      true && 'conditional-class',
      false && 'not-this-one'
    )
    expect(result).toBe('base-class array-class1 array-class2 object-class conditional-class')
  })
})