import { parseCitation } from './citationParser.js';

/**
 * Test file for citation parser with Persian examples
 */

const testPersianCitations = () => {
  console.log('=== Testing Persian Citation Parser ===\n');

  const testCases = [
    {
      name: 'Persian Citation - Multiple Authors',
      citation:
        'ربیعی، لیلا، یوسفی خواه، سارا، گرزین، سارا، مازوچی، مجتبی، حسینی، تانیا. بررسی جامعه شناختی قمار آنلاین در شبکه های اجتماعی. بررسی‌های مدیریت رسانه[Internet]. 1401؛1(1 ):78-101. Available from: https://sid.ir/paper/1003899/fa',
      expectedAuthors: [
        { firstname: 'لیلا', lastname: 'ربیعی' },
        { firstname: 'سارا', lastname: 'یوسفی خواه' },
        { firstname: 'سارا', lastname: 'گرزین' },
        { firstname: 'مجتبی', lastname: 'مازوچی' },
        { firstname: 'تانیا', lastname: 'حسینی' },
      ],
    },
    {
      name: 'Persian Citation - Two Authors',
      citation:
        'نصیری، سارا، حسن زاده، اسماعیل. (1396). واکنش ها به فرامین ممنوعیت شراب. مطالعات تاریخ فرهنگی، 9(34)، 25-50.',
      expectedAuthors: [
        { firstname: 'سارا', lastname: 'نصیری' },
        { firstname: 'اسماعیل', lastname: 'حسن زاده' },
      ],
    },
    {
      name: 'English Citation - APA Format',
      citation:
        'Smith, J., & Johnson, M. (2024). The impact of technology on education. Journal of Educational Technology, 15(3), 123-145.',
      expectedAuthors: [
        { firstname: 'J.', lastname: 'Smith' },
        { firstname: 'M.', lastname: 'Johnson' },
      ],
    },
  ];

  testCases.forEach((testCase, index) => {
    console.log(`\n--- Test ${index + 1}: ${testCase.name} ---`);
    console.log('Citation:', testCase.citation);
    
    const result = parseCitation(testCase.citation);
    
    console.log('\n✓ Parsed Successfully:', result.success);
    console.log('Detected Format:', result.data?.detectedFormat);
    console.log('Language:', result.data?.language);
    console.log('Title:', result.data?.title);
    console.log('Year:', result.data?.year);
    console.log('Confidence Score:', result.data?.confidence);
    
    console.log('\nExtracted Authors:');
    result.data?.authors?.forEach((author, idx) => {
      console.log(`  ${idx + 1}. ${author.firstname} ${author.lastname}`);
    });
    
    console.log('\nExpected Authors:');
    testCase.expectedAuthors?.forEach((author, idx) => {
      console.log(`  ${idx + 1}. ${author.firstname} ${author.lastname}`);
    });
    
    // Compare results
    if (result.data?.authors?.length === testCase.expectedAuthors?.length) {
      console.log('\n✅ Author count matches!');
    } else {
      console.log(
        `\n⚠️ Author count mismatch: Expected ${testCase.expectedAuthors?.length}, Got ${result.data?.authors?.length}`
      );
    }
    
    console.log('\n' + '='.repeat(80));
  });
};

// Run tests
testPersianCitations();
