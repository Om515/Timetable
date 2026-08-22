const assert = require('assert');
const {
    _parse,
    _times_overlap,
    _is_lab_slot_consecutive,
    _get_slot_priority
} = require('./algorithmUtils');

try {
    console.log('Testing _parse...');
    // Normal morning slot
    assert.deepStrictEqual(_parse('08:45 - 09:45'), [8 * 60 + 45, 9 * 60 + 45]);
    
    // Afternoon slot (PM shifting logic 1-7 gets mutated to 13-19)
    assert.deepStrictEqual(_parse('01:00 - 02:00'), [(1 + 12) * 60, (2 + 12) * 60]);
    // 12PM should remain 12
    assert.deepStrictEqual(_parse('12:00 - 01:00'), [(12) * 60, (1 + 12) * 60]);
    
    // Invalid/Exception tests matching python's try-except -> 0,0 fallback
    assert.deepStrictEqual(_parse('invalid'), [0, 0]);
    assert.deepStrictEqual(_parse(null), [0, 0]);

    console.log('Testing _get_slot_priority...');
    assert.strictEqual(_get_slot_priority('08:45 - 10:45'), 1);
    assert.strictEqual(_get_slot_priority('11:00 - 13:00'), 2);
    assert.strictEqual(_get_slot_priority('13:45 - 15:45'), 3);
    assert.strictEqual(_get_slot_priority('09:45 - 10:45'), 99);
    assert.strictEqual(_get_slot_priority('random string'), 99);

    console.log('Testing _is_lab_slot_consecutive...');
    // consecutive: end of first == start of second
    assert.strictEqual(_is_lab_slot_consecutive('08:45 - 09:45', '09:45 - 10:45'), true);
    // consecutive: end of second == start of first
    assert.strictEqual(_is_lab_slot_consecutive('09:45 - 10:45', '08:45 - 09:45'), true);
    // not consecutive
    assert.strictEqual(_is_lab_slot_consecutive('08:45 - 09:45', '11:00 - 12:00'), false);
    
    console.log('Testing _times_overlap...');
    // Strong overlap (contained logic)
    assert.strictEqual(_times_overlap('08:45 - 09:45', '09:00 - 10:00'), true);
    assert.strictEqual(_times_overlap('08:00 - 10:00', '09:00 - 09:30'), true);
    
    // Boundary conditions - touching lines are explicitly NOT an overlap in the boolean condition: max < min
    assert.strictEqual(_times_overlap('08:45 - 09:45', '09:45 - 10:45'), false);
    
    // Fully separate
    assert.strictEqual(_times_overlap('08:45 - 09:45', '11:00 - 12:00'), false);

    console.log('✅ All utility tests passed successfully.');
} catch (error) {
    console.error('❌ Test failed!');
    console.error(error);
    process.exit(1);
}
